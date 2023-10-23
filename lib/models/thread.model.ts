import mongoose, { Model, Types } from 'mongoose';

export interface IThread {
    _id: Types.ObjectId;
    id: string;
    text: string;
    author: Types.ObjectId;
    community: Types.ObjectId;
    createdAt: Date;
    parentId: string;
    children: Types.ObjectId[];
    likes: Types.ObjectId[];
}

const threadSchema = new mongoose.Schema<IThread>({
    text: { type: String, required: true },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community'
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    parentId: {
        type: String,
    },
    children: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Thread',
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ]
});

const Thread: Model<IThread> = mongoose.models.Thread || mongoose.model('Thread', threadSchema);

export default Thread;



