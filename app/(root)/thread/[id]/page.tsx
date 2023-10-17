import ThreadCard from '@/components/cards/ThreadCard';
import Comment from '@/components/forms/Comment';
import { getThread } from '@/lib/actions/thread.actions';
import { getUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

async function Page({ params }: { params: { id: string } }) {
    if (!params.id) {
        return null;
    }

    const user = await currentUser();

    if (!user) {
        return null;
    }
    
    const userInfo = await getUser(user.id);

    if (!userInfo?.onboarded) {
        redirect('/onboarding');
    }

    const thread = await getThread(params.id);

    return (
        <section className="relative">
            <div>
                <ThreadCard
                    id={thread.id}
                    content={thread.text}
                    author={thread.author}
                    createdAt={thread.createdAt}
                    comments={thread.comments}
                    community={thread.community}
                />
            </div>
            <div className="mt-7">
                <Comment 
                    threadId={thread.id}
                    currentUserId={JSON.stringify(userInfo._id)}
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
                    />
                ))}
            </div>
        </section>
    );
}

export default Page;