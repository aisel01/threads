import PostThread from '@/components/forms/PostThread';
import { getCurrentUser } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';

async function Page() {
    const userInfo = await getCurrentUser();

    if (!userInfo || !userInfo.onboarded) {
        redirect('/onboarding');
    }

    return (
        <>
            <h1 className="head-text">
                Create Thread
            </h1>
            <PostThread userId={userInfo.id} />
        </>
    );
}

export default Page;