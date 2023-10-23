import UserCard from '@/components/cards/UserCard';
import ProfileHeader from '@/components/shared/ProfileHeader';
import TreadsTab from '@/components/shared/TreadsTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { communityTabs } from '@/constants';
import { fetchCommunityDetails } from '@/lib/actions/community.actions';
import { getCurrentUser } from '@/lib/actions/user.actions';
import Image from 'next/image';
import { redirect } from 'next/navigation';

async function Page({ params }: { params: { id: string } }) {
    const userInfo = await getCurrentUser();

    if (!userInfo) {
        return null;
    }

    if (!userInfo.onboarded) {
        redirect('/onboarding');
    }

    const communityDetails = await fetchCommunityDetails(params.id);

    if (!communityDetails) {
        return null;
    }

    return (
        <section className="relative">
            <ProfileHeader
                accountId={userInfo.id}
                authUserId={userInfo.id}
                name={communityDetails.name}
                username={communityDetails.username}
                imgUrl={communityDetails.image}
                bio={communityDetails.bio}
            />
            <div className="mt-5">
                <Tabs
                    className="w-full"
                    defaultValue="threads"
                >
                    <TabsList className="tab">
                        {communityTabs.map((tab) => {
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
                                            {communityDetails?.threads.length}
                                        </p>
                                    )}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>
                    <TabsContent
                        value="threads"
                        className="w-full text-light-1"
                    >
                        <TreadsTab
                            accountId={communityDetails.id}
                            authUserId={userInfo.id}
                            accountType="Community"
                        />
                    </TabsContent>
                    <TabsContent
                        value="members"
                        className="w-full text-light-1"
                    >
                        <section className="mt-9 flex flex-col gap-10">
                            {communityDetails?.members.map((member) => {
                                return (
                                    <UserCard
                                        key={member.id}
                                        id={member.id}
                                        name={member.name}
                                        username={member.username}
                                        imgUrl={member.image}
                                    />
                                );
                            })}
                        </section>
                    </TabsContent>
                    <TabsContent
                        value="requests"
                        className="w-full text-light-1"
                    >
                        <div>TBD</div>
                    </TabsContent>
                </Tabs>
            </div>
        </section>
    );
}

export default Page;