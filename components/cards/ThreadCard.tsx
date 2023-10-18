import Link from 'next/link';
import Image from 'next/image';
import { formatDateString } from '@/lib/utils';
import UserList from '../shared/UserList';
import UserPic from '../shared/UserPic';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import DeleteThread from '../forms/DeleteThread';

type Comment = {
    id: string;
    author: {
        id: string;
        name: string;
        image: string;
    }
}

type ThreadCardProps = {
    id: string;
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
    createdAt: string;
    comments: Comment[];
    isComment?: boolean;
    canDelete?: boolean;
}

function ThreadCard(props: ThreadCardProps) {
    const {
        id, 
        content,
        author,
        isComment = false,
        comments,
        community,
        createdAt,
        canDelete = false,
    } = props;
    
    const showReplies = !isComment && comments.length > 0;

    return (
        <article className={`flex w-full justify-between rounded-xl ${isComment ? 'px-0 xs:px-7' : 'bg-dark-2 p-7' }`}>
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
                            <h4 className="cursor-pointer text-base-semibold text-light-1">
                                {author.name}
                            </h4>
                        </Link>
                        <p className="mt-2 text-small-regular text-light-2">
                            {content}
                        </p>
                        <div className={`${isComment && 'mb-10'} mt-5 flex flex-col gap-3`}>
                            <div className="flex gap-3.5">
                                <Image 
                                    src="/assets/heart-gray.svg"
                                    alt="heart"
                                    width={24}
                                    height={24}
                                    className="cursor-pointer object-contain"
                                />
                                <Link
                                    href={`/thread/${id}`}
                                >
                                    <Image 
                                        src="/assets/reply.svg"
                                        alt="reply"
                                        width={24}
                                        height={24}
                                        className="cursor-pointer object-contain"
                                    />
                                </Link>
                                <Image 
                                    src="/assets/repost.svg"
                                    alt="repost"
                                    width={24}
                                    height={24}
                                    className="cursor-pointer object-contain"
                                />
                                <Image 
                                    src="/assets/share.svg"
                                    alt="share"
                                    width={24}
                                    height={24}
                                    className="cursor-pointer object-contain"
                                />
                            </div>
                        </div>
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
                            href={`/tread/${id}`}
                        >
                            <p className="text-small-regular text-gray-1">
                                {comments.length} replies
                            </p>
                        </Link>
                    </div>
                )}
                {!isComment && community && (
                    <Link
                        href={`/communities/${community.id}`}
                        className="mt-5 flex items-center"
                    >
                        <p className="text-subtle-medium text-gray-1">
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
                <div>
                    <DropdownMenu>
                        <DropdownMenuTrigger>
                            <Image 
                                src="/assets/more.svg"
                                alt="actions"
                                width={24}
                                height={24}
                                className="cursor-pointer object-contain"
                            />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <DeleteThread 
                                    threadId={id}
                                    isComment={isComment}
                                />
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}
        </article>
    );
}

export default ThreadCard;
