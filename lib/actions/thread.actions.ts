"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { Error } from "mongoose";
import Thread from "../models/thread.model";

type CreateThreadPayload = {
    text: string;
    author: string;
    communityId: string | null;
    path: string;
};

export async function createThread({
    text,
    author,
    communityId,
    path
}: CreateThreadPayload): Promise<void> {
    try {
        connectToDB();
    
        const createdThread = await Thread.create({
            text,
            author,
            community: null,
        });
    
        await User.findByIdAndUpdate(author, {
            $push: { threads: createdThread._id },
        });
    
        revalidatePath(path);
    } catch (e: any) {
        throw new Error(`Error creating thread: ${e.message}`);
    }
}

type IThread = {
    text: string;
    author: string;
    community: string;
    createdAt: Date;
}

export async function getThreads(page = 1, pageSize = 20) {
    try {
        
        const skipAmount = (page - 1) * pageSize;

        const threads = await Thread.find({ parentId: { $in: [null, undefined] } })
            .sort('desc')
            .skip(skipAmount)
            .limit(pageSize)
            .populate({ path: 'author', model: User })
            .populate({ 
                path: 'children', 
                populate: {
                    path: 'author',
                    model: User,
                    select: '_id name parentId image'
                } 
            });
            // .populate({ path: 'community', model: Community })

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


