import { getActivity, getCurrentUser } from '@/lib/actions/user.actions';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';

const Page = async () => {
    const userInfo = await getCurrentUser();

    if (!userInfo) {
        return null;
    }

    if (!userInfo.onboarded) {
        redirect('/onboarding');
    }

    const {
        replies,
        likes,
    } = await getActivity(userInfo.id);

    return (
        <section>
            <h1 className="head-text mb-10">
                Activity
            </h1>
            <section className="mt-10 flex flex-col gap-10">
                {replies.length > 0 || likes.length > 0 ? (
                    <>
                        {
                            replies.map(a => {
                                return (
                                    <Link
                                        key={a.id}
                                        href={`/thread/${a.parentId}`}
                                    >
                                        <article className='activity-card'>
                                            <Image
                                                alt="Profile image"
                                                src={a.author.image}
                                                width={20}
                                                height={20}
                                                className="rounded-full object-cover"
                                                style={{ height: 20 }}
                                            />
                                            <p className='!text-small-regular'>
                                                {a.author.name}
                                                {' '}
                                                replied to your thread
                                            </p>
                                        </article>
                                    </Link>
                                );
                            })
                        }
                        {
                            likes.map(thread => {
                                return thread.likes.map(like => {
                                    return (
                                        <Link
                                            key={like.id}
                                            href={`/thread/${thread.id}`}
                                        >
                                            <article className='activity-card'>
                                                <Image
                                                    alt="Profile image"
                                                    src={like.image}
                                                    width={20}
                                                    height={20}
                                                    className="rounded-full object-cover"
                                                    style={{ height: 20 }}
                                                />
                                                <p className='!text-small-regular'>
                                                    {like.name}
                                                    {' '}
                                                    liked your thread
                                                </p>
                                            </article>
                                        </Link>
                                    );
                                });
                            })
                        }
                    </>
                ) : (
                    <p className="no-result">No activity yet</p>
                )}
            </section>
        </section>
    );
};

export default Page;