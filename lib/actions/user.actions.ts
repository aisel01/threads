"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { Error } from "mongoose";
import Thread from "../models/thread.model";

type UpdateUserPayload = {
    userId: string;
    username: string;
    name: string;
    image: string;
    bio: string;
    path: string;
};

export async function updateUser({
    userId,
    username,
    name,
    image,
    bio,
    path,
}: UpdateUserPayload): Promise<void> {
    try {
        await connectToDB();

        await User.findOneAndUpdate(
            { id: userId }, 
            {
                username: username.toLowerCase(),
                name,
                image,
                bio,
                onboarded: true,
            },
            { upsert: true }
        )
    
        if (path === '/profile/edit') {
            revalidatePath(path); 
        }
    } catch (e: any) {
        throw new Error(`Failed to create/update user: ${e.message}`)
    }
}

type IUser = {
    id: string;
    username: string;
    name: string;
    image: string;
    bio: string;
    onboarded: boolean;
}

export async function getUser(userId: string) {
    try {
        await connectToDB();

        return await User
            .findOne({ id: userId })
            // .populate({
            //     path: 'communities',
            //     model: Community
            // })
    } catch (e: any) {
        throw new Error(`Failed to get user: ${e.message}`)
    }
}

export async function getUserPosts(userId: string) {
    try {
        await connectToDB();
       
        const threads = await User
            .findOne({ id: userId })
            .populate({
                path: 'threads',
                model: Thread,
                populate: {
                    path: 'children',
                    model: Thread,
                    select: 'name image id',
                },
                
            })
            // .populate({
            //     path: 'communities',
            //     model: Community
            // })

        return threads;
    } catch (e: any) {
        throw new Error(`Failed to get user posts: ${e.message}`)
    }
}