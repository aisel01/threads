import { authMiddleware } from '@clerk/nextjs';
import { logger } from './logger';
import { NextResponse } from 'next/server';

export default authMiddleware({
    // An array of public routes that don't require authentication.
    publicRoutes: ['/api/webhook/clerk'],

    // An array of routes to be ignored by the authentication middleware.
    ignoredRoutes: ['/api/webhook/clerk'],

    beforeAuth: (req) => {
        logger.info(`${req.method.toUpperCase()} ${req.url}`);

        return NextResponse.next();
    },

});

export const config = {
    matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
