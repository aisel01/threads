import AccountProfile from '@/components/forms/AccountProfile';
import { getCurrentUser } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';

async function Page() {
    const userInfo = await getCurrentUser();

    if (!userInfo) {
        return null;
    }

    if (userInfo?.onboarded) {
        redirect('/');
    }

    const userData = {
        clerkId: userInfo?.clerkId,
        id: userInfo?.id,
        username: userInfo?.username || '',
        name: userInfo?.name || '',
        bio: userInfo?.bio || '',
        image: userInfo?.image,
    };

    return (
        <main className="mx-auto flex max-w-3xl flex-col justify-center px-10 py-20">
            <h1 className="head-text">Onboarding</h1>
            <p className="mt-3 text-base-regular">
                Complete your profile now to use Threads
            </p>
            <section className="mt-9 p-10">
                <AccountProfile
                    user={userData}
                    btnTitle="Continue"
                />
            </section>
        </main>
    );
}

export default Page;