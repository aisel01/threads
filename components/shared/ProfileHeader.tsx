import Image from 'next/image';
import Link from 'next/link';

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
            <div className="flex justify-between items-stretch">
                <div className="flex items-center gap-3">
                    <div className="relative w-20 h-20">
                        <Image
                            src={imgUrl}
                            alt="Profile image"
                            className="rounded-full object-cover shadow-2xl"
                            fill
                        />
                    </div>
                    <div className="flex-1 ">
                        <h2 className="text-light-1 text-left text-heading3-bold">
                            {name}
                        </h2>
                        <p className="text-base-medium text-gray-1">
                            @{username}
                        </p>
                    </div>
                </div>
                {canEdit && (
                    <Link
                        href={'/profile/edit'}
                    >
                        <Image
                            src="/assets/edit.svg"
                            alt="edit"
                            width={24}
                            height={24}
                            className="cursor-pointer object-contain"
                        />
                    </Link>
                )}
            </div>
            <p className="mt-6 max-w-lg text-base-regular text-light-2">
                {bio}
            </p>
            <div className="mt-12 bg-dark-3 h-0.5 w-full" />
        </div>
    );
}

export default ProfileHeader;
