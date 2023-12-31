import Image from 'next/image';
import Link from 'next/link';

import { Button } from '../ui/button';
import UserList from '../shared/UserList';
import { IUser } from '@/lib/models/user.model';

interface Props {
  id: string;
  name: string;
  username: string;
  imgUrl: string;
  bio: string;
  members: IUser[];
}

function CommunityCard({ id, name, username, imgUrl, bio, members }: Props) {
    return (
        <article className='community-card'>
            <div className='flex flex-wrap items-center gap-3'>
                <Link href={`/communities/${id}`} className='relative h-12 w-12'>
                    <Image
                        src={imgUrl}
                        alt='community_logo'
                        fill
                        className='rounded-full object-cover'
                    />
                </Link>
                <div>
                    <Link href={`/communities/${id}`}>
                        <h4 className='text-base-semibold'>{name}</h4>
                    </Link>
                    <p className='text-small-medium text-muted-foreground'>@{username}</p>
                </div>
            </div>

            <p className='mt-4 text-subtle-medium'>{bio}</p>

            <div className='mt-5 flex flex-wrap items-center justify-between gap-3'>
                <Link href={`/communities/${id}`}>
                    <Button size='sm' className='community-card_btn'>
                        View
                    </Button>
                </Link>
                {members.length > 0 && (
                    <UserList
                        size={28}
                        maxShown={3}
                        users={members}
                    />
                )}
            </div>
        </article>
    );
}

export default CommunityCard;