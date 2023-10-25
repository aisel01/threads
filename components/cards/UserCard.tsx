'use client';

import { Button } from '../ui/button';
import { useRouter } from 'next/navigation';
import UserPic from '../shared/UserPic';

type UserCardProps = {
    id: string;
    name: string;
    username: string;
    imgUrl: string;
    compact?: boolean;
}

function UserCard(props: UserCardProps) {
    const {
        id,
        name,
        username,
        imgUrl,
        compact = false,
    } = props;

    const router = useRouter();

    return (
        <article className="user-card w-full">
            <div className="user-card_avatar">
                <UserPic
                    size={compact ? 36 : 44}
                    image={imgUrl}
                    name={name}
                    id={id}
                />
                <div className="flex-1 text-ellipsis">
                    <h4
                        className={`${compact ? 'text-small-semibold' : 'text-base-semibold'}`}
                    >
                        {name}
                    </h4>
                    <p
                        className={`${compact ? 'text-subtle-medium ' : 'text-small-medium'} text-muted-foreground`}
                    >
                        @{username}
                    </p>
                </div>
            </div>
            {!compact && (
                <Button
                    className="user-card_btn"
                    onClick={() => router.push(`/profile/${id}`)}
                >
                    View
                </Button>
            )}
        </article>
    );
}

export default UserCard;
