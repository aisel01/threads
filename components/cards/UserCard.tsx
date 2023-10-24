'use client';

import Image from 'next/image';
import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import UserPic from '../shared/UserPic';

type UserCardProps = {
    id: string;
    name: string;
    username: string;
    imgUrl: string;
}

function UserCard(props: UserCardProps) {
    const {
        id,
        name,
        username,
        imgUrl,
    } = props;

    const router = useRouter();

    return (
        <article className="user-card w-full">
            <div className="user-card_avatar">
                <UserPic
                    size={44}
                    image={imgUrl}
                    name={name}
                    id={id}
                />
                <div className="flex-1 text-ellipsis">
                    <h4 className="text-base-semibold">{name}</h4>
                    <p className="text-small-medium text-muted-foreground">@{username}</p>
                </div>
            </div>
            <Button
                className="user-card_btn"
                onClick={() => router.push(`/profile/${id}`)}
            >
                View
            </Button>
        </article>
    );
}

export default UserCard;
