import mongoose, { Model, Types } from 'mongoose';

export interface IUser {
    id: string;
    clerkId: string;
    username: string;
    name: string;
    image: string;
    bio: string;
    onboarded?: boolean;
    threads: Types.ObjectId[];
    communities: Types.ObjectId[];
}

const userSchema = new mongoose.Schema<IUser>({
    clerkId: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    image: String,
    bio: String,
    threads: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread'
        }
    ],
    onboarded: {
        type: Boolean,
        default: false,
    },
    communities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Community'
        }
    ]
});

const User: Model<IUser> = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
