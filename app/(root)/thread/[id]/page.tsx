import ThreadCard from '@/components/cards/ThreadCard/ThreadCard';
import Comment from '@/components/forms/Comment';
import { Separator } from '@/components/ui/separator';
import { getThread } from '@/lib/actions/thread.actions';
import { getCurrentUser } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';

async function Page({ params }: { params: { id: string } }) {
    if (!params.id) {
        return null;
    }

    const userInfo = await getCurrentUser();

    if (!userInfo || !userInfo.onboarded) {
        redirect('/onboarding');
    }

    const thread = await getThread(params.id);

    if (!thread) {
        return null;
    }

    return (
        <section className="relative">
            <div>
                <ThreadCard
                    id={thread.id}
                    currentUserId={userInfo.id}
                    content={thread.text}
                    author={thread.author}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                    likes={thread.likes}
                    community={thread.community}
                    canDelete={thread.author.id === userInfo.id}
                    rounded={false}
                />
                <Separator />
            </div>
            <div className="py-4 px-7">
                <Comment
                    threadId={thread.id}
                    currentUserId={userInfo.id}
                    currentUserImg={userInfo.image}
                    parentThreadAuthor={thread.author.username}
                />
            </div>
            <div className="flex flex-col">
                {thread.children.map((comment: any) => (
                    <>
                        <Separator />
                        <ThreadCard
                            key={comment.id}
                            id={comment.id}
                            currentUserId={userInfo.id}
                            content={comment.text}
                            author={comment.author}
                            createdAt={comment.createdAt}
                            comments={comment.children}
                            likes={comment.likes}
                            community={comment.community}
                            isComment
                            canDelete={comment.author.id === userInfo.id}
                            rounded={false}
                            showReplyPics={comment.children.length > 0}
                        />
                    </>
                ))}
            </div>
        </section>
    );
}

export default Page;