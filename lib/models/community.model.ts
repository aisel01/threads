import mongoose, { Model, Types } from 'mongoose';

export interface ICommunity {
    id: string;
    clerkId: string;
    username: string;
    name: string;
    image: string;
    bio: string;
    createdBy: Types.ObjectId;
    threads: Types.ObjectId[];
    members: Types.ObjectId[];
}

const communitySchema = new mongoose.Schema<ICommunity>({
    clerkId: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    image: String,
    bio: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread',
        },
    ],
    members: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],
});

const Community: Model<ICommunity> = mongoose.models.Community ||  mongoose.model('Community', communitySchema);

export default Community;
