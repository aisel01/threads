import Link from 'next/link';
import Image from 'next/image';

type ThreadCardActionsProps = {
    id: string;
    isComment: boolean;
}

function ThreadCardActions(props: ThreadCardActionsProps) {
    const {
        id,
        isComment,
    } = props;

    return (
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
    );
}

export default ThreadCardActions;