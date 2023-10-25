import ProfileHeader from '@/components/shared/ProfileHeader';
import TreadsTab from '@/components/shared/TreadsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { profileTabs } from '@/constants';
import { getCurrentUser, getUser } from '@/lib/actions/user.actions';
import Image from 'next/image';
import { redirect } from 'next/navigation';

async function Page({ params }: { params: { id?: string[] } }) {
    const [id] = params.id || [];
    const authUserInfo = await getCurrentUser();

    if (!authUserInfo?.onboarded) {
        redirect('/onboarding');
    }

    let userInfo: typeof authUserInfo | null = authUserInfo;

    if (id) {
        userInfo = await getUser(id);
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
                                        <p className="ml-1 rounded-full bg-secondary px-2.5 py-1 text-small-semibold max-sm:hidden">
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
                                className="w-full"
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