'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useTransition } from 'react';
import { likeThread, unlikeThread } from '@/lib/actions/thread.actions';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

type ThreadCardActionsProps = {
    id: string;
    currentUserId: string;
    liked?: boolean;
}

function ThreadCardActions(props: ThreadCardActionsProps) {
    const {
        id,
        liked,
        currentUserId,
    } = props;

    const pathname = usePathname();

    const [isLikePending, startLikeTransition] = useTransition();

    const handleLike = () => {
        startLikeTransition(async() => {
            if (!liked) {
                await likeThread({
                    threadId: id,
                    userId: currentUserId,
                    path: pathname
                });
            } else {
                await unlikeThread({
                    threadId: id,
                    userId: currentUserId,
                    path: pathname
                });
            }
        });
    };

    return (
        <div className={'mt-3 flex flex-col gap-3'}>
            <div className="-ml-2 flex">
                <Button
                    variant="ghost"
                    size="icon"
                    disabled={isLikePending}
                    onClick={handleLike}
                >
                    <Image
                        src={liked ? '/assets/heart-filled.svg' : '/assets/heart-gray.svg'}
                        alt="heart"
                        width={24}
                        height={24}
                        className="object-contain"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                >
                    <Link
                        href={`/thread/${id}`}
                    >
                        <Image
                            src="/assets/reply.svg"
                            alt="reply"
                            width={24}
                            height={24}
                            className="object-contain"
                        />
                    </Link>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled
                >
                    <Image
                        src="/assets/repost.svg"
                        alt="repost"
                        width={24}
                        height={24}
                        className="object-contain"
                    />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    disabled
                >
                    <Image
                        src="/assets/share.svg"
                        alt="share"
                        width={24}
                        height={24}
                        className="object-contain"
                    />
                </Button>

            </div>
        </div>
    );
}

export default ThreadCardActions;