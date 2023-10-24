import AccountProfile from '@/components/forms/AccountProfile';
import BackToProfileButton from '@/components/shared/BackToProfileButton';
import { getCurrentUser } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';

async function Page() {
    const userInfo = await getCurrentUser();

    if (!userInfo) {
        return null;
    }

    if (!userInfo.onboarded) {
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
            <div className="flex align-baseline">
                <BackToProfileButton />
                <h1 className="head-text">Edit profile</h1>
            </div>
            <div className="p-10">
                <AccountProfile
                    user={userData}
                    btnTitle="Save"
                />
            </div>
        </section>
    );
}

export default Page;