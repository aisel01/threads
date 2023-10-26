import Link from 'next/link';
import Image from 'next/image';
import { cn, formatDateDistance, formatDateString } from '@/lib/utils';
import UserList from '../../shared/UserList';
import UserPic from '../../shared/UserPic';
import ThreadCardMore from './ThreadCardMore';
import ThreadCardActions from './ThreadCardActions';
import ThreadCardLikes from './ThreadCardLikes';
import { AccountInfo } from '@/lib/types/AccountInfo';

type Comment = {
    id: string;
    author: AccountInfo;
}

type ThreadCardProps = {
    id: string;
    currentUserId: string;
    content: string;
    parentId?: string;
    author: AccountInfo;
    community?: AccountInfo;
    createdAt: Date;
    comments: Comment[];
    likes: AccountInfo[];
    isComment?: boolean;
    canDelete?: boolean;
    showReplyPics?: boolean;
    rounded?: boolean;
}

function ThreadCard(props: ThreadCardProps) {
    const {
        id,
        currentUserId,
        content,
        author,
        comments,
        likes,
        community,
        createdAt,
        isComment = false,
        canDelete = false,
        showReplyPics = false,
        rounded = true,
    } = props;

    const isLiked = likes.some(like => like.id === currentUserId);

    return (
        <article className={cn(
            'flex w-full justify-between p-7 bg-card',
            rounded && 'rounded-xl',
        )}>
            <div className="flex w-full flex-col items-start justify-between">
                <div className="flex w-full flex-1 flex-row gap-4">
                    <div className="flex flex-col items-center">
                        <UserPic
                            id={author.id}
                            name={author.name}
                            image={author.image}
                            size={44}
                        />
                        {showReplyPics && <div className="thread-card_bar" />}
                    </div>
                    <div className="flex w-full flex-col">
                        <div className="flex w-full justify-between">
                            <Link
                                href={`/profile/${author.id}`}
                                className="w-fit"
                            >
                                <h4 className="cursor-pointer text-base-semibold">
                                    {author.name}
                                </h4>
                            </Link>
                            <div className="flex gap-2 self-start align-baseline">
                                <span className="text-small-regular text-muted-foreground" title={formatDateString(createdAt)}>
                                    {formatDateDistance(createdAt)}
                                </span>
                                <ThreadCardMore
                                    className={cn(!canDelete && 'invisible')}
                                    id={id}
                                    isComment={isComment}
                                />
                            </div>
                        </div>
                        <p className="mt-1 text-small-regular">
                            {content}
                        </p>
                        <ThreadCardActions
                            id={id}
                            currentUserId={currentUserId}
                            liked={isLiked}
                        />
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className='flex w-11 justify-center'>
                        {showReplyPics && (
                            <UserList
                                size={18}
                                users={comments.map(comment => comment.author)}
                            />
                        )}
                    </div>
                    {comments.length > 0 && (
                        <Link
                            href={`/thread/${id}`}
                            className="text-small-regular text-muted-foreground hover:underline"
                        >
                            {comments.length} replies
                        </Link>
                    )}
                    {likes.length > 0 && (
                        <ThreadCardLikes likes={likes} />
                    )}
                </div>
                {!isComment && community && (
                    <Link
                        href={`/communities/${community.id}`}
                        className="mt-5 flex items-center"
                    >
                        <p className="text-subtle-medium">
                            {community.name} Community
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
        </article>
    );
}

export default ThreadCard;

