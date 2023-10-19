import ThreadCard from '@/components/cards/ThreadCard';
import { getThreads } from '@/lib/actions/thread.actions';
import { getUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

async function Page() {
    const user = await currentUser();

    if (!user) {
        return null;
    }

    const userInfo = await getUser(user.id);

    if (!userInfo?.onboarded) {
        redirect('/onboarding');
    }

    const { threads } = await getThreads();

    return (
        <section className='flex flex-col gap-10'>
            {threads.length === 0 ? (
                <p className='no-result'>No threads found</p>
            ) : (
                <>
                    {threads.map(thread => {
                        return (
                            <ThreadCard
                                key={thread.id}
                                id={thread.id}
                                content={thread.text}
                                author={thread.author}
                                createdAt={thread.createdAt}
                                comments={thread.children}
                                community={thread.community}
                                canDelete={thread.author.id === userInfo.id}
                            />
                        );
                    })}
                </>
            )}
        </section>
    );
}

export default Page;
