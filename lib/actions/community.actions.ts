'use server';

import { FilterQuery, SortOrder } from 'mongoose';

import Community from '../models/community.model';
import Thread, { IThread } from '../models/thread.model';
import User, { IUser } from '../models/user.model';

import { connectToDB } from '../mongoose';


type CreateCommunityPayload = {
    id: string,
    name: string,
    username: string,
    image: string,
    bio: string,
    creatorId: string,
};

export async function createCommunity({
    id,
    name,
    username,
    image,
    bio,
    creatorId,
}: CreateCommunityPayload) {
    try {
        connectToDB();

        // Find the user with the provided unique id
        const user = await User.findOne({ id: creatorId });

        if (!user) {
            throw new Error('User not found'); // Handle the case if the user with the id is not found
        }

        const newCommunity = new Community({
            clerkId: id,
            name,
            username,
            image,
            bio,
            createdBy: user.id,
        });

        const createdCommunity = await newCommunity.save();

        user.communities.push(createdCommunity.id);

        await user.save();

        return createdCommunity;
    } catch (error) {
        console.error('Error creating community:', error);
        throw error;
    }
}

export async function fetchCommunityDetails(id: string) {
    try {
        connectToDB();

        const communityDetails = await Community
            .findOne({ id })
            .populate<{
                createdBy: IUser,
                members: Array<Pick<IUser, 'name' | 'username' | 'image' | 'id'>>
            }>([
                'createdBy',
                {
                    path: 'members',
                    model: User,
                    select: 'name username image _id id',
                },
            ]);

        return communityDetails;
    } catch (error) {
        console.error('Error fetching community details:', error);
        throw error;
    }
}

export async function fetchCommunityPosts(id: string) {
    try {
        connectToDB();

        const communityPosts = await Community
            .findById(id)
            .populate<{
                threads: Array<IThread & {
                    author: Pick<IUser, 'id' | 'name' | 'image'>
                    children: IThread & { author: Pick<IUser, 'id' | 'name' | 'image'> }
                    likes: Array<Pick<IUser, 'id' | 'name' | 'username' | 'image'>>
                }>,
            }>({
                path: 'threads',
                model: Thread,
                populate: [
                    {
                        path: 'author',
                        model: User,
                        select: 'name image id',
                    },
                    {
                        path: 'children',
                        model: Thread,
                        populate: {
                            path: 'author',
                            model: User,
                            select: 'name image id',
                        },
                    },
                    {
                        path: 'likes',
                        model: User,
                        select: 'name username image id',
                    }
                ],
            });

        return communityPosts;
    } catch (error) {
        console.error('Error fetching community posts:', error);
        throw error;
    }
}

export async function fetchCommunities({
    searchString = '',
    pageNumber = 1,
    pageSize = 20,
    sortBy = 'desc',
}: {
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
    try {
        connectToDB();

        // Calculate the number of communities to skip based on the page number and page size.
        const skipAmount = (pageNumber - 1) * pageSize;

        // Create a case-insensitive regular expression for the provided search string.
        const regex = new RegExp(searchString, 'i');

        // Create an initial query object to filter communities.
        const query: FilterQuery<typeof Community> = {};

        // If the search string is not empty, add the $or operator to match either username or name fields.
        if (searchString.trim() !== '') {
            query.$or = [
                { username: { $regex: regex } },
                { name: { $regex: regex } },
            ];
        }

        // Define the sort options for the fetched communities based on createdAt field and provided sort order.
        const sortOptions = { createdAt: sortBy };

        // Create a query to fetch the communities based on the search and sort criteria.
        const communitiesQuery = Community.find(query)
            .sort(sortOptions)
            .skip(skipAmount)
            .limit(pageSize)
            .populate<{ members: IUser[] }>('members');

        // Count the total number of communities that match the search criteria (without pagination).
        const totalCommunitiesCount = await Community.countDocuments(query);

        const communities = await communitiesQuery.exec();

        // Check if there are more communities beyond the current page.
        const isNext = totalCommunitiesCount > skipAmount + communities.length;

        return { communities, isNext };
    } catch (error) {
        console.error('Error fetching communities:', error);
        throw error;
    }
}

export async function addMemberToCommunity(
    communityId: string,
    memberId: string
) {
    try {
        connectToDB();

        const community = await Community.findOne({ clerkId: communityId });

        if (!community) {
            throw new Error('Community not found');
        }

        // Find the user by their unique id
        const user = await User.findOne({ clerkId: memberId });

        if (!user) {
            throw new Error('User not found');
        }

        // Check if the user is already a member of the community
        if (community.members.includes(user._id)) {
            throw new Error('User is already a member of the community');
        }

        // Add the user's _id to the members array in the community
        community.members.push(user._id);
        await community.save();

        // Add the community's _id to the communities array in the user
        user.communities.push(community._id);
        await user.save();

        return community;
    } catch (error) {
        console.error('Error adding member to community:', error);
        throw error;
    }
}

export async function removeUserFromCommunity(
    userId: string,
    communityId: string
) {
    try {
        connectToDB();

        const userIdObject = await User.findOne({ clerkId: userId }, { _id: 1 });
        const communityIdObject = await Community.findOne(
            { clerkId: communityId },
            { _id: 1 }
        );

        if (!userIdObject) {
            throw new Error('User not found');
        }

        if (!communityIdObject) {
            throw new Error('Community not found');
        }

        // Remove the user's _id from the members array in the community
        await Community.updateOne(
            { _id: communityIdObject._id },
            { $pull: { members: userIdObject._id } }
        );

        // Remove the community's _id from the communities array in the user
        await User.updateOne(
            { _id: userIdObject._id },
            { $pull: { communities: communityIdObject._id } }
        );

        return { success: true };
    } catch (error) {
        console.error('Error removing user from community:', error);
        throw error;
    }
}

export async function updateCommunityInfo(
    communityId: string,
    name: string,
    username: string,
    image: string
) {
    try {
        connectToDB();

        const updatedCommunity = await Community.findOneAndUpdate(
            { clerkId: communityId },
            { name, username, image }
        );

        if (!updatedCommunity) {
            throw new Error('Community not found');
        }

        return updatedCommunity;
    } catch (error) {
        console.error('Error updating community information:', error);
        throw error;
    }
}

export async function deleteCommunity(communityId: string) {
    try {
        connectToDB();

        const deletedCommunity = await Community.findOneAndDelete({
            clerkId: communityId,
        });

        if (!deletedCommunity) {
            throw new Error('Community not found');
        }

        // Delete all threads associated with the community
        await Thread.deleteMany({ community: deletedCommunity._id });

        // Find all users who are part of the community
        const communityUsers = await User.find({ communities: deletedCommunity._id });

        // Remove the community from the 'communities' array for each user
        const updateUserPromises = communityUsers.map((user) => {
            return User.updateOne(
                { _id: user._id },
                { $pull: { communities: deletedCommunity._id } }
            );
        });

        await Promise.all(updateUserPromises);

        return deletedCommunity;
    } catch (error) {
        console.error('Error deleting community: ', error);
        throw error;
    }
}