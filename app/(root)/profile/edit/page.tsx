import AccountProfile from '@/components/forms/AccountProfile';
import BackToProfileButton from '@/components/shared/BackToProfileButton';
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

    const userData = {
        clerkId: userInfo?.clerkId,
        id: userInfo?.id,
        username: userInfo?.username,
        name: userInfo?.name,
        bio: userInfo?.bio,
        image: userInfo?.image,
    };

    return (
        <section className="mx-auto flex max-w-3xl flex-col justify-center">
            <div className="flex align-baseline gap-4">
                <BackToProfileButton />
                <h1 className="head-text">Edit profile</h1>
            </div>
            <div className="mt-9 bg-dark-2 p-10">
                <AccountProfile
                    user={userData}
                    btnTitle="Save"
                />
            </div>
        </section>
    );
}

export default Page;