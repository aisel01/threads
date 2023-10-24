import UserPic from './UserPic';

type UserListProps = {
    users: {
        name: string;
        image: string;
        id: string;
    }[];
    size: number;
    maxShown?: number;
}

function UserList(props: UserListProps) {
    const {
        users,
        size,
        maxShown = 2,
    } = props;

    return (
        <div className="flex -space-x-2">
            {users.slice(0, maxShown).map(user => {
                return (
                    <UserPic
                        className="ring-2"
                        key={user.id}
                        id={user.id}
                        image={user.image}
                        name={user.name}
                        size={size}
                    />
                );
            })}
        </div>
    );

}

export default UserList;
