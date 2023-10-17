'use server';

import { revalidatePath } from 'next/cache';
import User from '../models/user.model';
import { connectToDB } from '../mongoose';
import { Error } from 'mongoose';
import Thread from '../models/thread.model';
import Community from '../models/community.model';

type CreateThreadPayload = {
    text: string;
    author: string;
    communityId: string | null;
    path: string;
};

export async function getThreads(page = 1, pageSize = 20) {
    try {
        await connectToDB();
        
        const skipAmount = (page - 1) * pageSize;

        const threads = await Thread.find({ parentId: { $in: [null, undefined] } })
            .sort({ createdAt: 'desc' })
            .skip(skipAmount)
            .limit(pageSize)
            .populate({
                path: 'community',
                model: Community,
            })
            .populate({ path: 'author', model: User })
            .populate({ 
                path: 'children', 
                populate: {
                    path: 'author',
                    model: User,
                    select: '_id name parentId image'
                } 
            });

        const totalCount = await Thread.countDocuments({ parentId: { $in: [null, undefined] } });
        
        const hasNext = totalCount > skipAmount + threads.length;

        return {
            threads,
            hasNext,
        };

    } catch (e: any) {
        throw new Error(`Error getting threads: ${e.message}`);
    }
}

export async function getThread(id: string) {
    try {
        await connectToDB();

        return await Thread
            .findOne({ id: id })
            .populate({
                path: 'community',
                model: Community,
                select: '_id id name image',
            })
            .populate({
                path: 'author',
                model: User,
                select: '_id id name image'
            })
            .populate({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        model: User,
                        select: '_id id name parentId image'
                    },
                    {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: User,
                            select: '_id id name image'
                        }
                    }
                ]
            }).exec();
    } catch (e: any) {
        throw new Error(`Error getting thread: ${e.message}`);
    }
}

export async function createThread({
    text,
    author,
    communityId,
    path
}: CreateThreadPayload): Promise<void> {
    try {
        await connectToDB();
    
        const communityIdObject = await Community.findOne(
            { id: communityId },
            { _id: 1 }
        );
          
        const createdThread = await Thread.create({
            text,
            author,
            community: communityIdObject,
        });
    
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id },
        });
    
        if (communityIdObject) {
            // Update Community model
            await Community.findByIdAndUpdate(communityIdObject, {
                $push: { threads: createdThread._id },
            });
        }

        revalidatePath(path);
    } catch (e: any) {
        throw new Error(`Error creating thread: ${e.message}`);
    }
}


export async function addCommentToThread({
    threadId,
    text,
    userId,
    path,
}: {
    threadId: string;
    text: string;
    userId: string;
    path: string;

}) {
    await connectToDB();

    try {
        const parentThread = await Thread.findById(threadId);

        if (!parentThread) {
            throw new Error(`Thread with id ${threadId} not found`);
        }

        const commentThread = new Thread({
            text,
            author: userId,
            parentId: threadId,
        });

        const savedCommentThread = await commentThread.save();

        parentThread.children.push(savedCommentThread._id);

        await parentThread.save();

        revalidatePath(path);
    } catch (e: any) {
        throw new Error(`Error getting thread: ${e.message}`);
    }
}