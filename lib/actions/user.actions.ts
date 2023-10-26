'use server';

import { revalidatePath } from 'next/cache';
import User, { IUser } from '../models/user.model';
import { connectToDB } from '../mongoose';
import mongoose, { Error, FilterQuery, SortOrder, Types } from 'mongoose';
import Thread, { IThread } from '../models/thread.model';
import Community, { ICommunity } from '../models/community.model';
import { logger } from '@/logger';
import { currentUser } from '@clerk/nextjs';
import { AccountInfo } from '../types/AccountInfo';

type CreateUserPayload = {
    clerkId: string;
    username: string;
    name: string;
    image: string;
    bio: string;
};

export async function createUser({
    clerkId,
    username,
    name,
    image,
    bio,
}: CreateUserPayload): Promise<void> {
    try {
        await connectToDB();

        logger.debug(`Creating new User ${clerkId}`);

        const newUser = new User({
            clerkId,
            name,
            image,
            bio,
            username: username.toLowerCase(),
            onboarded: true,
        });

        await newUser.save();
    } catch (e: any) {
        logger.error(e, `Failed to create user ${clerkId}: ${e.message}`);
    }
}

type UpdateUserPayload = {
    id: string;
    username: string;
    name: string;
    image: string;
    bio: string;
    path: string;
};

export async function updateUser({
    id,
    username,
    name,
    image,
    bio,
    path,
}: UpdateUserPayload): Promise<void> {
    try {
        await connectToDB();

        logger.debug(`Updating existing User with id: ${id}`);

        await User.findByIdAndUpdate(id, {
            name,
            image,
            bio,
            username: username.toLowerCase(),
            onboarded: true,
        });

        if (path === '/profile/edit') {
            revalidatePath(path);
        }
    } catch (e: any) {
        logger.error(e, `Failed to update user ${id}: ${e.message}`);
    }
}

export async function getCurrentUser() {
    try {
        const user = await currentUser();

        await connectToDB();

        return await User
            .findOne({ clerkId: user?.id })
            .populate<{ communities: ICommunity[] }>({
                path: 'communities',
                model: Community
            });
    } catch (e: any) {
        throw new Error(`Failed to get current user: ${e.message}`);
    }
}

export async function getUser(id: string) {
    try {
        await connectToDB();

        logger.debug(`Getting user ${id}`);

        return await User
            .findById(id)
            .populate<{ communities: ICommunity[] }>({
                path: 'communities',
                model: Community
            });

    } catch (e: any) {
        throw new Error(`Failed to get user: ${e.message}`);
    }
}

export async function getUserPosts(userId: string) {
    try {
        await connectToDB();

        logger.debug(`Getting user ${userId} threads`);

        const threads = await User
            .findById(userId)
            .populate<{
                threads: Array<IThread & {
                    children: IThread & { author: Pick<IUser, 'id' | 'name' | 'image'> }
                    community: Pick<ICommunity, 'id' | 'name' | 'image'>
                    likes: Array<Pick<IUser, 'id' | 'name' | 'username' | 'image'>>
                }>,
            }>({
                path: 'threads',
                model: Thread,
                populate: [
                    {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: User,
                            select: 'id name image'
                        },
                    },
                    {
                        path: 'community',
                        model: Community,
                        select: 'id name image'
                    },
                    {
                        path: 'likes',
                        model: User,
                        select: 'name username image id',
                    }
                ]
            });

        return threads;
    } catch (e: any) {
        throw new Error(`Failed to get user posts: ${e.message}`);
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
            _id: { $ne: userId }
        };

        if (searchString.trim() !== '') {
            query.$of = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ];
        }

        const sortOptions = {
            createdAt: sortBy
        };

        const usersQuery = User.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize);

        console.time('users');
        const [
            totalUsersCount,
            users,
        ] = await Promise.all([
            User.countDocuments(query),
            usersQuery.exec()
        ]);
        console.timeEnd('users');

        const hasNext = totalUsersCount  >skipAmount + users.length;

        return {
            users,
            hasNext,
        };

    } catch (e: any) {
        throw new Error(`Failed to get users: ${e.message}`);
    }
}

export async function getReplies(userId: string) {
    // TODO: pagination
    try {
        await connectToDB();

        const userThreads = await Thread.find({
            author: userId
        });

        const childThreadIds = userThreads.reduce<Types.ObjectId[]>((acc, userThread) => {
            return acc.concat(userThread.children);
        }, []);

        const replies = await Thread
            .find({
                _id: { $in: childThreadIds },
                author: { $ne: userId },
            })
            .populate<{ author: Pick<IUser, 'name' | 'image' | 'id'> }>({
                path: 'author',
                model: User,
                select: 'name image id'
            });

        return replies;
    } catch (e: any) {
        throw new Error(`Failed to get replies: ${e.message}`);
    }
}

export async function getLikes(userId: string): Promise<{
    id: string;
    likes: AccountInfo[];
}[]> {
    // TODO: pagination
    try {
        await connectToDB();

        console.time('likes');
        // TODO: remove own likes, make array flat
        const likes = await Thread
            .aggregate()
            .match({ author: { $eq: new mongoose.Types.ObjectId(userId) } })
            .lookup({
                from: 'users',
                localField: 'likes',
                as: 'likes',
                foreignField: '_id',
                pipeline: [
                    { $project: { 'name': 1, 'username': 1, 'image': 1, 'id': { $toString: '$_id' } } }
                ]
            })
            .project({ 'likes': 1, 'id': { $toString: '$_id' } });

        console.timeEnd('likes');

        return likes;
    } catch (e: any) {
        throw new Error(`Failed to get activity: ${e.message}`);
    }
}

export async function getActivity(userId: string) {
    try {
        console.time('activity');
        const [
            replies,
            likes,
        ] = await Promise.all([
            getReplies(userId),
            getLikes(userId)
        ]);
        console.timeEnd('activity');


        // TODO: sort by date
        return { replies, likes };
    } catch (e: any) {
        throw new Error(`Failed to get activity: ${e.message}`);
    }
}