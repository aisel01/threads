import { fetchCommunities } from '@/lib/actions/community.actions';
import UserCard from '../cards/UserCard';
import { getCurrentUser, getUsers } from '@/lib/actions/user.actions';

async function RightSidebar() {
    const userInfo = await getCurrentUser();

    if (!userInfo) return null;

    const { communities } = await fetchCommunities({
        pageNumber: 1,
        pageSize: 5,
    });

    const { users } = await getUsers({
        userId: userInfo.id,
        page: 1,
        pageSize: 5,
    });

    return (
        <section className="rightsidebar">
            <div className="flex flex-1 flex-col justify-start">
                <h3 className="text-heading4-medium mb-2">Suggested communities</h3>
                <div className="flex flex-col gap-2">
                    {communities.map(community => {
                        return (
                            <UserCard
                                key={community.id}
                                id={community.id}
                                name={community.name}
                                username={community.username}
                                imgUrl={community.image}
                                compact
                            />
                        );
                    })}
                </div>
            </div>
            <div className="flex flex-1 flex-col justify-start">
                <h3 className="text-heading4-medium mb-2">Suggested users</h3>
                <div className="flex flex-col gap-2">
                    {users.map(user => {
                        return (
                            <UserCard
                                key={user.id}
                                id={user.id}
                                name={user.name}
                                username={user.username}
                                imgUrl={user.image}
                                compact
                            />
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default RightSidebar;