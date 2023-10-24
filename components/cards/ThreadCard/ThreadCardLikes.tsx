import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import UserCard from '../UserCard';

type ThreadCardLikesProps = {
    likes: {
        id: string;
        name: string;
        username: string;
        image: string;
    }[];
}

function ThreadCardLikes(props: ThreadCardLikesProps) {
    const {
        likes,
    } = props;

    return (
        <Dialog>
            <DialogTrigger className="text-small-regular text-muted-foreground hover:underline">
                View likes
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-96 overflow-auto">
                <DialogTitle>View likes</DialogTitle>
                <DialogDescription className="flex flex-col gap-4">
                    {likes.map(like => {
                        return (
                            <UserCard
                                key={like.id}
                                id={like.id}
                                name={like.name}
                                username={like.username}
                                imgUrl={like.image}
                            />
                        );
                    })}
                </DialogDescription>
            </DialogContent>
        </Dialog>
    );
}

export default ThreadCardLikes;