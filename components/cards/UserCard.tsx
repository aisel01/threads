"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

type UserCardProps = {
    id: string;
    name: string;
    username: string;
    imgUrl: string;
    personType: string;
}

function UserCard(props: UserCardProps) {
    const {
        id,
        name,
        username,
        imgUrl,
        personType,
    } = props;
    
    const router = useRouter();

    return (
        <article className="user-card w-full">
            <div className="user-card_avatar">
                <Image 
                    src={imgUrl}
                    alt="logo"
                    width={48}
                    height={48}
                    className="rounded-full"
                />
                <div className="flex-1 text-ellipsis">
                    <h4 className="text-base-semibold text-light-1">{name}</h4>
                    <p className="text-small-medium text-gray-1">@{username}</p>
                </div>
            </div>
            <Button
                className="user-card_btn"
                onClick={() => router.push(`/profile/${id}`)}
            >
                View
            </Button>
        </article>
    );
}

export default UserCard;
