import ThreadCard from '@/components/cards/ThreadCard/ThreadCard';
import Comment from '@/components/forms/Comment';
import { getThread } from '@/lib/actions/thread.actions';
import { getCurrentUser } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';

async function Page({ params }: { params: { id: string } }) {
    if (!params.id) {
        return null;
    }

    const userInfo = await getCurrentUser();

    if (!userInfo) {
        return null;
    }

    if (!userInfo.onboarded) {
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
                    content={thread.text}
                    author={thread.author}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                    community={thread.community}
                    canDelete={thread.author.id === userInfo.id}
                />
            </div>
            <div className="mt-7">
                <Comment
                    threadId={thread.id}
                    currentUserId={userInfo.id}
                    currentUserImg={userInfo.image}
                />
            </div>
            <div className="mt-10 flex flex-col gap-3">
                {thread.children.map((comment: any) => (
                    <ThreadCard
                        key={comment.id}
                        id={comment.id}
                        content={comment.text}
                        author={comment.author}
                        createdAt={comment.createdAt}
                        comments={comment.children}
                        community={comment.community}
                        isComment
                        canDelete={comment.author.id === userInfo.id}
                    />
                ))}
            </div>
        </section>
    );
}

export default Page;