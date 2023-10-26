'use server';

import { revalidatePath } from 'next/cache';
import User, { IUser } from '../models/user.model';
import { connectToDB } from '../mongoose';
import { Error } from 'mongoose';
import Thread, { IThread } from '../models/thread.model';
import Community, { ICommunity } from '../models/community.model';
import { logger } from '@/logger';
import { AccountInfo } from '../types/AccountInfo';

type TreadResult = {
    id: string;
    text: string;
    author: AccountInfo,
    community?: AccountInfo;
    createdAt: Date;
    children: {
        id: string;
        author: AccountInfo;
    }[];
    likes: AccountInfo[];
}

export async function getThreads(page = 1, pageSize = 20): Promise<{threads: TreadResult[], hasNext: boolean}> {
    try {
        await connectToDB();

        const skipAmount = (page - 1) * pageSize;

        const threadsPromise: Promise<TreadResult[]> = Thread
            .aggregate()
            .match({ parentId: { $in: [null, undefined] } })
            .sort({ createdAt: 'desc' })
            .skip(skipAmount)
            .limit(pageSize)
            .lookup({
                from: 'communities',
                localField: 'community',
                as: 'community',
                foreignField: '_id',
                pipeline: [
                    { $project: { 'name': 1, 'username': 1, 'image': 1, 'id': { $toString: '$_id' } } }
                ]
            })
            .unwind({ path: '$community', preserveNullAndEmptyArrays: true })
            .lookup({
                from: 'users',
                localField: 'author',
                as: 'author',
                foreignField: '_id',
                pipeline: [
                    { $project: { 'name': 1, 'username': 1, 'image': 1, 'id': { $toString: '$_id' } } }
                ]
            })
            .unwind({ path: '$author', preserveNullAndEmptyArrays: true })
            .lookup({
                from: 'users',
                localField: 'likes',
                as: 'likes',
                foreignField: '_id',
                pipeline: [
                    { $project: { 'name': 1, 'username': 1, 'image': 1, 'id': { $toString: '$_id' } } }
                ]
            })
            .lookup({
                from: 'threads',
                localField: 'children',
                as: 'children',
                foreignField: '_id',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'author',
                            foreignField: '_id',
                            as: 'author',
                            pipeline: [
                                {
                                    $project: { 'name': 1, 'username': 1, 'image': 1, 'id': { $toString: '$_id' } },
                                },
                            ]
                        }
                    },
                    {
                        $project: { 'id': { $toString: '$_id' }, 'author': { $arrayElemAt: [ '$author', 0 ] }}
                    },
                ]
            })
            .project({
                'id': { $toString: '$_id' },
                text: 1,
                author: 1,
                community: 1,
                createdAt: 1,
                children: 1,
                likes: 1,
            });

        const totalCountPromise = Thread.countDocuments({ parentId: { $in: [null, undefined] } });

        console.time('threads');
        const [
            threads,
            totalCount,
        ] = await Promise.all([
            threadsPromise,
            totalCountPromise,
        ]);
        console.timeEnd('threads');

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
            .findById(id)
            .populate<{ community: Pick<ICommunity, 'id' | 'name' | 'image' | 'username'> }>({
                path: 'community',
                model: Community,
                select: '_id id name image username',
            })
            .populate<{ author: Pick<IUser, 'id' | 'name' | 'username' | 'image'> }>({
                path: 'author',
                model: User,
                select: '_id id name image username'
            })
            .populate<{ likes: Array<Pick<IUser, 'name' | 'username' | 'image' | 'id'>>}>({
                path: 'likes',
                model: User,
                select: 'name username image id',
            })
            .populate<{
                children: {
                    id: string;
                    author: Pick<IUser, 'id' | 'name' | 'image' | 'username'>,
                    children: IThread & { author: Pick<IUser, 'id' | 'name' | 'username' | 'image'> }
                }[]
            }>({
                path: 'children',
                populate: [
                    {
                        path: 'author',
                        model: User,
                        select: 'id name username image'
                    },
                    {
                        path: 'likes',
                        model: User,
                        select: 'name username image id',
                    },
                    {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: User,
                            select: 'id name username image'
                        }
                    }
                ]
            });

        return thread;
    } catch (e: any) {
        throw new Error(`Error getting thread: ${e.message}`);
    }
}

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
        await connectToDB();

        logger.debug({
            author,
            communityId,
        }, 'Creating thread');

        const communityIdObject = await Community.findById(
            communityId,
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

        logger.debug(`Deleting thread ${id}`);

        const mainThread = await Thread.findById(id);

        if (!mainThread) {
            throw new Error('Thread not found');
        }

        const descendantThreads = await fetchAllChildThreads(id);

        const descendantThreadIds = [
            id,
            ...descendantThreads.map((thread) => thread.id),
        ];

        const uniqueAuthorIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.author),
                mainThread.author,
            ].filter((id) => id !== undefined)
        );

        const uniqueCommunityIds = new Set(
            [
                ...descendantThreads.map((thread) => thread.community),
                mainThread.community,
            ].filter((id) => id !== undefined)
        );

        logger.debug({ descendantThreadIds }, 'Recursively delete child threads and their descendants');
        await Thread.deleteMany({ _id: { $in: descendantThreadIds } });


        if (mainThread.parentId) {
            logger.debug({ parentId: mainThread.parentId }, 'Update parent thread');
            await Thread.findByIdAndUpdate(
                mainThread.parentId,
                { $pull: { children: mainThread._id } }
            );
        }

        logger.debug({ uniqueAuthorIds }, 'Update User model');
        await User.updateMany(
            { _id: { $in: Array.from(uniqueAuthorIds) } },
            { $pull: { threads: { $in: descendantThreadIds } } }
        );

        logger.debug({ uniqueCommunityIds }, 'Update Community model');
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

export async function likeThread({
    threadId,
    userId,
    path,
}: {
    threadId: string;
    userId: string;
    path: string;
}) {

    try {
        await connectToDB();

        logger.debug({
            threadId,
            userId,
        }, 'Like thread');

        const thread = await Thread.findById(threadId);

        if (!thread) {
            throw new Error(`Thread with id ${threadId} not found`);
        }

        const user = await User.findById(userId, { _id: 1 });
        if (!user) {
            throw new Error(`User with id ${userId} not found`);
        }

        thread.likes.push(user._id);

        await thread.save();

        revalidatePath(path);
    } catch (e: any) {
        throw new Error(`Error getting thread: ${e.message}`);
    }
}

export async function unlikeThread({
    threadId,
    userId,
    path,
}: {
    threadId: string;
    userId: string;
    path: string;
}) {

    try {
        await connectToDB();

        logger.debug({
            threadId,
            userId,
        }, 'Unlike thread');

        const user = await User.findById(userId, { _id: 1 });
        if (!user) {
            throw new Error(`User with id ${userId} not found`);
        }

        await Thread.findByIdAndUpdate(
            threadId,
            { $pull: { likes: user._id } }
        );

        revalidatePath(path);
    } catch (e: any) {
        throw new Error(`Error getting thread: ${e.message}`);
    }
}