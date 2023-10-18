import Image from 'next/image';
import Link from 'next/link';

type UserPicProps = {
    name: string;
    image: string;
    id: string;
    size: number;
    className?: string;
}

function UserPic(props: UserPicProps) {
    const {
        id,
        name,
        image,
        size,
        className,
    } = props;

    return (
        <Link
            href={`/profile/${id}`}
            className="relative inline-block"
            style={{ width: size, height: size }}
            title={name}
        >
            <Image 
                src={image}
                alt={`${name}'s profile image`}
                fill
                className={`cursor-pointer rounded-full object-cover ${className}`}
            />
        </Link>
    );

}

export default UserPic;
