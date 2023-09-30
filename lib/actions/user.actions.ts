"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { Error } from "mongoose";

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

    connectToDB();

    try {
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

export async function getUser(userId: string): Promise<IUser | null> {
    connectToDB();

    try {
        return await User.findOne(
            { id: userId }
        )
    } catch (e: any) {
        throw new Error(`Failed to get user: ${e.message}`)
    }
}