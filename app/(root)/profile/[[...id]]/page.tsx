import ProfileHeader from '@/components/shared/ProfileHeader';
import TreadsTab from '@/components/shared/TreadsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { profileTabs } from '@/constants';
import { getUser } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
import Image from 'next/image';
import { redirect } from 'next/navigation';

async function Page({ params }: { params: { id?: string } }) {
    const user = await currentUser();

    if (!user) {
        return null;
    }

    const authUserInfo = await getUser(user.id);

    if (!authUserInfo?.onboarded) {
        redirect('/onboarding');
    }

    let userInfo: typeof authUserInfo | null = authUserInfo;

    if (params.id) {
        userInfo = await getUser(params.id);
    }

    if (!userInfo) {
        return null;
    }

    return (
        <section className="relative">
            <ProfileHeader
                accountId={userInfo.id}
                authUserId={authUserInfo.id}
                name={userInfo.name}
                username={userInfo.username}
                imgUrl={userInfo.image}
                bio={userInfo.bio}
            />
            <div className="mt-5">
                <Tabs
                    className="w-full"
                    defaultValue="threads"
                >
                    <TabsList className="tab">
                        {profileTabs.map((tab) => {
                            return (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="tab"
                                >
                                    <Image
                                        src={tab.icon}
                                        alt={tab.label}
                                        width={16}
                                        height={16}
                                        className="object-contain"
                                    />
                                    <p className="max-sm:hidden">
                                        {tab.label}
                                    </p>
                                    {tab.label === 'Threads' && (
                                        <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 text-light-1 max-sm:hidden">
                                            {userInfo?.threads.length}
                                        </p>
                                    )}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                    {profileTabs.map((tab) => {
                        return (
                            <TabsContent
                                key={`content-${tab.value}`}
                                value={tab.value}
                                className="w-full text-light-1"
                            >
                                {tab.value === 'threads' && (
                                    <TreadsTab
                                        accountId={userInfo?.id}
                                        authUserId={authUserInfo.id}
                                        accountType="User"
                                    />
                                )}
                            </TabsContent>
                        );
                    })}
                </Tabs>
            </div>
        </section>
    );
}

export default Page;