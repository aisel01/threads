import { getActivity, getUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';

const Page = async () => {
    const user = await currentUser();

    if (!user) {
        return null;
    }

    const userInfo = await getUser(user.id);

    if (!userInfo?.onboarded) {
        redirect('/onboarding');
    }

    const activity = await getActivity(userInfo.id);

    return (
        <section>
            <h1 className="head-text mb-10">
                Activity
            </h1>
            <section className="mt-10 flex flex-col gap-5">
                {activity.length > 0 ? (
                    <>
                        {
                            activity.map(a => {
                                return (
                                    <Link
                                        key={a.id}
                                        href={`/thread/${a.parentId}`}
                                        className=""
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
                                            <p className='!text-small-regular text-light-1'>
                                                <span className='mr-1 text-primary-500'>
                                                    {a.author.name}
                                                </span>{' '}
                                                replied to your thread
                                            </p>
                                        </article>
                                    </Link>
                                );
                            })
                        }
                    </>
                ) : (
                    <p className="no-result">No activity</p>
                )}
            </section>
        </section>
    );
};

export default Page;