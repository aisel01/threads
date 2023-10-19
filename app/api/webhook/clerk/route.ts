import { IncomingHttpHeaders } from 'http';
import { Webhook, WebhookRequiredHeaders } from 'svix';
import type { WebhookEvent } from '@clerk/clerk-sdk-node';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import {
    addMemberToCommunity,
    createCommunity,
    deleteCommunity,
    removeUserFromCommunity,
    updateCommunityInfo,
} from '@/lib/actions/community.actions';

export const POST = async (request: Request) => {
    const payload = await request.json();
    const header = headers();

    const heads = {
        'svix-id': header.get('svix-id'),
        'svix-timestamp': header.get('svix-timestamp'),
        'svix-signature': header.get('svix-signature'),
    };

    const wh = new Webhook(process.env.NEXT_CLERK_WEBHOOK_SECRET || '');

    let event: WebhookEvent | null = null;

    try {
        event = wh.verify(
            JSON.stringify(payload),
            heads as IncomingHttpHeaders & WebhookRequiredHeaders
        ) as WebhookEvent;
    } catch (err) {
        return NextResponse.json({ message: err }, { status: 400 });
    }

    const eventType = event.type;

    if (eventType === 'organization.created') {
        const {
            id,
            name,
            slug,
            image_url,
            created_by,
        } =  event.data;

        try {
            await createCommunity({
                id,
                name,
                username: slug || id,
                image: image_url,
                bio:'org bio',
                creatorId: created_by,
            });

            return NextResponse.json({ message: 'User created' }, { status: 201 });
        } catch (err) {
            console.log(err);
            return NextResponse.json(
                { message: 'Internal Server Error' },
                { status: 500 }
            );
        }
    }

    if (eventType === 'organization.updated') {
        try {
            const { id, image_url, name, slug } = event.data;
            console.log('updated', event?.data);

            await updateCommunityInfo(id, name, slug || id, image_url);

            return NextResponse.json({ message: 'Member removed' }, { status: 201 });
        } catch (err) {
            console.log(err);

            return NextResponse.json(
                { message: 'Internal Server Error' },
                { status: 500 }
            );
        }
    }

    if (eventType === 'organization.deleted') {
        try {
            const { id } = event.data;
            console.log('deleted', event.data);

            await deleteCommunity(id as string);

            return NextResponse.json(
                { message: 'Organization deleted' },
                { status: 201 }
            );
        } catch (err) {
            console.log(err);

            return NextResponse.json(
                { message: 'Internal Server Error' },
                { status: 500 }
            );
        }
    }

    if (eventType === 'organizationInvitation.created') {
        try {
            console.log('Invitation created', event.data);

            return NextResponse.json(
                { message: 'Invitation created' },
                { status: 201 }
            );
        } catch (err) {
            console.log(err);

            return NextResponse.json(
                { message: 'Internal Server Error' },
                { status: 500 }
            );
        }
    }

    if (eventType === 'organizationMembership.created') {
        try {
            const { organization, public_user_data } = event.data;
            console.log('created', event?.data);

            await addMemberToCommunity(organization.id, public_user_data.user_id);

            return NextResponse.json(
                { message: 'Invitation accepted' },
                { status: 201 }
            );
        } catch (err) {
            console.log(err);

            return NextResponse.json(
                { message: 'Internal Server Error' },
                { status: 500 }
            );
        }
    }

    if (eventType === 'organizationMembership.deleted') {
        try {
            const { organization, public_user_data } = event.data;
            console.log('removed', event?.data);

            await removeUserFromCommunity(public_user_data.user_id, organization.id);

            return NextResponse.json({ message: 'Member removed' }, { status: 201 });
        } catch (err) {
            console.log(err);

            return NextResponse.json(
                { message: 'Internal Server Error' },
                { status: 500 }
            );
        }
    }
};