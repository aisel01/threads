import AccountProfile from '@/components/forms/AccountProfile';
import { getCurrentUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import { redirect } from 'next/navigation';

async function Page() {
    const user = await currentUser();

    if (!user) {
        return null;
    }

    const userInfo = await getCurrentUser();

    if (userInfo?.onboarded) {
        redirect('/');
    }

    const userData = userInfo ?  {
        clerkId: userInfo.clerkId,
        id: userInfo.id,
        username: userInfo.username,
        name: userInfo.name,
        bio: userInfo.bio,
        image: userInfo.image,
    } : {
        clerkId: user.id,
        username: user.username || '',
        name: '',
        bio: '',
        image: user.imageUrl,
    };

    return (
        <main className="mx-auto flex max-w-3xl flex-col justify-center px-10 py-10 bg-popover rounded-lg">
            <h1 className="head-text">Onboarding</h1>
            <p className="mt-3 text-base-regular">
                Complete your profile now to use Threads
            </p>
            <section className="mt-10">
                <AccountProfile
                    user={userData}
                    btnTitle="Continue"
                />
            </section>
        </main>
    );
}

export default Page;