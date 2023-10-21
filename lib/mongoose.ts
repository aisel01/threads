import { logger } from '@/logger';
import mongoose from 'mongoose';

let isConnected = false;

export const connectToDB = async () => {
    mongoose.set('strictQuery', true);

    if (!process.env.MONGODB_URL) {
        return logger.error('MONGODB_URL not found');
    }

    if (isConnected) {
        return;
    }

    try {
        await mongoose.connect(process.env.MONGODB_URL);

        logger.debug('Connected to MongoDB');

        isConnected = true;
    } catch (e) {
        logger.error(e, 'Failed to connect to MongoDB');
    }
};