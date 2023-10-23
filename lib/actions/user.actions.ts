'use server';

import { revalidatePath } from 'next/cache';
import User, { IUser } from '../models/user.model';
import { connectToDB } from '../mongoose';
import { Error, FilterQuery, SortOrder, Types } from 'mongoose';
import Thread, { IThread } from '../models/thread.model';
import Community, { ICommunity } from '../models/community.model';
import { logger } from '@/logger';

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

export async function getUser(clerkId: string) {
    try {
        await connectToDB();

        return await User
            .findOne({ clerkId })
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

        const threads = await User
            .findOne({ id: userId })
            .populate<{
                threads: Array<IThread & {
                    children: IThread & { author: Pick<IUser, 'id' | 'name' | 'image'> }
                    community: Pick<ICommunity, 'id' | 'name' | 'image'>
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
            id: { $ne: userId }
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

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const hasNext = totalUsersCount  >skipAmount + users.length;

        return {
            users,
            hasNext,
        };

    } catch (e: any) {
        throw new Error(`Failed to get users: ${e.message}`);
    }
}

export async function getActivity(userId: string) {
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
        throw new Error(`Failed to get activity: ${e.message}`);
    }
}