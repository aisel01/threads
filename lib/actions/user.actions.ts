"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { Error, FilterQuery, SortOrder } from "mongoose";
import Thread from "../models/thread.model";
import Community from "../models/community.model";

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
            .populate({
                path: 'communities',
                model: Community
            })
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
                populate: [
                    {
                        path: 'children',
                        model: Thread,
                        select: 'name image id',
                    },
                    {
                        path: "community",
                        model: Community,
                        select: "name id image _id", // Select the "name" and "_id" fields from the "Community" model
                    },
                ]
            })

        return threads;
    } catch (e: any) {
        throw new Error(`Failed to get user posts: ${e.message}`)
    }
}

type GetUsersPayload = { 
    userId: string;
    searchString?: string;
    page?: number;
    pageSize?: number;
    sortBy?: SortOrder;
};

export async function getUsers({
    userId,
    searchString = '',
    page = 1, 
    pageSize = 20,
    sortBy = 'desc',
}: GetUsersPayload) {
    try {
        await connectToDB();
       
        const skipAmount = (page - 1) * pageSize;

        const regex = new RegExp(searchString, 'i');

        const query: FilterQuery<typeof User> = {
            id: { $ne: userId }
        };

        if (searchString.trim() !== '') {
            query.$of = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ]
        }

        const sortOptions = {
            createdAt: sortBy
        };

        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const hasNext = totalUsersCount  >skipAmount + users.length;

        return {
            users,
            hasNext,
        };
        
    } catch (e: any) {
        throw new Error(`Failed to get users: ${e.message}`)
    }
}

export async function getActivity(userId: string) {
    try {
        await connectToDB();
        
        const userThreads = await Thread.find({
            author: userId
        });

        const childThreadIds = userThreads.reduce((acc, userThread) => {
            return acc.concat(userThread.children);
        }, []);

        const replies = await Thread.find({
            _id: { $in: childThreadIds },
            author: { $ne: userId },
        }).populate({
            path: 'author',
            model: User,
            select: 'name image _id'
        });

        return replies;
    } catch (e: any) {
        throw new Error(`Failed to get activity: ${e.message}`)
    }
}