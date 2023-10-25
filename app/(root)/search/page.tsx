import UserCard from '@/components/cards/UserCard';
import { getCurrentUser, getUsers } from '@/lib/actions/user.actions';
import { redirect } from 'next/navigation';

const Page = async () => {
    const userInfo = await getCurrentUser();

    if (!userInfo || !userInfo.onboarded) {
        redirect('/onboarding');
    }

    const result = await getUsers({
        userId: userInfo.id,
        searchString: '',
    });

    return (
        <section>
            <h1 className="head-text mb-10">
                Search
            </h1>
            <div className="flex flex-col gap-4">
                {result.users.length === 0 ? (
                    <p className="no-result">No users found</p>
                ) : (
                    <>
                        {result.users.map((person) => {
                            return (
                                <UserCard
                                    key={person.id}
                                    id={person.id}
                                    name={person.name}
                                    username={person.username}
                                    imgUrl={person.image}
                                />
                            );
                        })}
                    </>
                )}
            </div>
        </section>
    );
};

export default Page;