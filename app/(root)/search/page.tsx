import UserCard from '@/components/cards/UserCard';
import { getUser, getUsers } from '@/lib/actions/user.actions';
import { currentUser } from '@clerk/nextjs';
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
    
    const result = await getUsers({
        userId: userInfo.id,
        searchString: '',
    });

    return (
        <section>
            <h1 className="head-text mb-10">
                Search
            </h1>
            <div className="mt-14 flex flex-com gap-9">
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