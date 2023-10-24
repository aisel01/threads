import Link from 'next/link';
import Image from 'next/image';
import { cn, formatDateString } from '@/lib/utils';
import UserList from '../../shared/UserList';
import UserPic from '../../shared/UserPic';
import ThreadCardMore from './ThreadCardMore';
import ThreadCardActions from './ThreadCardActions';

type Comment = {
    author: {
        id: string;
        name: string;
        image: string;
    }
}

type ThreadCardProps = {
    id: string;
    currentUserId: string;
    content: string;
    parentId?: string;
    author: {
        id: string;
        name: string;
        image: string;
    },
    community?: {
        id: string;
        name: string;
        image: string;
    };
    createdAt: Date;
    comments: Comment[];
    likes: {
        id: string;
        name: string;
        image: string;
    }[];
    isComment?: boolean;
    canDelete?: boolean;
}

function ThreadCard(props: ThreadCardProps) {
    const {
        id,
        currentUserId,
        content,
        author,
        isComment = false,
        comments,
        likes,
        community,
        createdAt,
        canDelete = false,
    } = props;

    const showReplies = !isComment && comments.length > 0;

    const isLiked = likes.some(like => like.id === currentUserId);

    return (
        <article className={cn(
            'flex w-full justify-between rounded-xl bg-card',
            isComment ? 'px-0 xs:px-7' : 'p-7',
        )}>
            <div className="flex items-start justify-between flex-col">
                <div className="flex w-full flex-1 flex-row gap-4">
                    <div className="flex flex-col items-center">
                        <UserPic
                            id={author.id}
                            name={author.name}
                            image={author.image}
                            size={44}
                        />
                        {showReplies && <div className="thread-card_bar" />}
                    </div>
                    <div className="flex w-full flex-col">
                        <Link
                            href={`/profile/${author.id}`}
                            className="w-fit"
                        >
                            <h4 className="cursor-pointer text-base-semibold">
                                {author.name}
                            </h4>
                        </Link>
                        <p className="mt-2 text-small-regular">
                            {content}
                        </p>
                        <ThreadCardActions
                            id={id}
                            currentUserId={currentUserId}
                            isComment={isComment}
                            liked={isLiked}
                        />
                    </div>
                </div>
                {showReplies && (
                    <div className="mt-2 flex gap-4">
                        <div className='w-11 flex justify-center'>
                            <UserList
                                size={18}
                                users={comments.map(comment => comment.author)}
                            />
                        </div>
                        <Link
                            href={`/thread/${id}`}
                        >
                            <p className="text-small-regular">
                                {comments.length} replies
                            </p>
                        </Link>
                        <p className="text-small-regular">
                            {likes.length} likes
                        </p>
                    </div>
                )}
                {!isComment && community && (
                    <Link
                        href={`/communities/${community.id}`}
                        className="mt-5 flex items-center"
                    >
                        <p className="text-subtle-medium">
                            {formatDateString(createdAt)} - {community.name} Community
                        </p>
                        <Image
                            src={community.image}
                            alt={community.name}
                            width={14}
                            height={14}
                            className="ml-1 rounded-full object-cover"
                        />
                    </Link>
                )}
            </div>
            {canDelete && (
                <ThreadCardMore
                    id={id}
                    isComment={isComment}
                />
            )}
        </article>
    );
}

export default ThreadCard;

