import Image from 'next/image';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Edit } from 'lucide-react';

type ProfileHeaderProps = {
    authUserId: string;
    accountId: string;
    accountType?: 'User' | 'Community';
    name: string;
    username: string;
    imgUrl: string;
    bio: string;
}

function ProfileHeader(props: ProfileHeaderProps) {
    const {
        authUserId,
        accountId,
        name,
        username,
        imgUrl,
        bio,
    } = props;

    const canEdit = authUserId === accountId;

    return (
        <div className="flex w-full flex-col justify-start">
            <div className="flex items-stretch justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative h-20 w-20">
                        <Image
                            src={imgUrl}
                            alt="Profile image"
                            className="rounded-full object-cover shadow-2xl"
                            fill
                        />
                    </div>
                    <div className="flex-1 ">
                        <h2 className="text-left text-heading3-bold">
                            {name}
                        </h2>
                        <p className="text-base-medium text-muted-foreground">
                            @{username}
                        </p>
                    </div>
                </div>
                {canEdit && (
                    <Link
                        legacyBehavior
                        passHref
                        href={'/profile/edit'}
                    >
                        <Button
                            variant="outline"
                            size="icon"
                        >
                            <Edit size={18}/>
                        </Button>
                    </Link>
                )}
            </div>
            <p className="mb-4 mt-6 max-w-lg text-base-regular">
                {bio}
            </p>
        </div>
    );
}

export default ProfileHeader;
