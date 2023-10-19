'use server';

import { revalidatePath } from 'next/cache';
import User, { IUser } from '../models/user.model';
import { connectToDB } from '../mongoose';
import { Error } from 'mongoose';
import Thread, { IThread } from '../models/thread.model';
import Community, { ICommunity } from '../models/community.model';

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
            .populate<{ community: ICommunity }>({
                path: 'community',
                model: Community,
            })
            .populate<{ author: IUser }>({
                path: 'author',
                model: User
            })
            .populate<{ children: Array<{ author: Pick<IUser, 'id' | 'name' | 'image'>}> }>({
                path: 'children',
                populate: {
                    path: 'author',
                    model: User,
                    select: 'id name image'
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

        const thread = await Thread
            .findOne({ id })
            .populate<{ community: Pick<ICommunity, 'id' | 'name' | 'image'> }>({
                path: 'community',
                model: Community,
                select: '_id id name image',
            })
            .populate<{ author: Pick<IUser, 'id' | 'name' | 'image'> }>({
                path: 'author',
                model: User,
                select: '_id id name image'
            })
            .populate<{
                children: {
                    author: Pick<IUser, 'id' | 'name' | 'image'>,
                    children: IThread & { author: Pick<IUser, 'id' | 'name' | 'image'> }
                }[]
            }>({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        model: User,
                        select: 'id name parentId image'
                    },
                    {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: User,
                            select: 'id name image'
                        }
                    }
                ]
            });

        return thread;
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

async function fetchAllChildThreads(threadId: string): Promise<IThread[]> {
    const childThreads = await Thread.find({ parentId: threadId });

    const descendantThreads = [];
    for (const childThread of childThreads) {
        const descendants = await fetchAllChildThreads(childThread.id);
        descendantThreads.push(childThread, ...descendants);
    }

    return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
    try {
        connectToDB();

        // Find the thread to be deleted (the main thread)
        const mainThread = await Thread.findById(id).populate('author community');

        if (!mainThread) {
            throw new Error('Thread not found');
        }

        // Fetch all child threads and their descendants recursively
        const descendantThreads = await fetchAllChildThreads(id);

        // Get all descendant thread IDs including the main thread ID and child thread IDs
        const descendantThreadIds = [
            id,
            ...descendantThreads.map((thread) => thread.id),
        ];

        // Extract the authorIds and communityIds to update User and Community models respectively
        const uniqueAuthorIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainThread.author?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        const uniqueCommunityIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
                mainThread.community?._id?.toString(),
            ].filter((id) => id !== undefined)
        );

        // Recursively delete child threads and their descendants
        await Thread.deleteMany({ id: { $in: descendantThreadIds } });

        // Update User model
        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );

        // Update Community model
        await Community.updateMany(
            { _id: { $in: Array.from(uniqueCommunityIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );

        revalidatePath(path);
    } catch (e: any) {
        throw new Error(`Failed to delete thread: ${e.message}`);
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