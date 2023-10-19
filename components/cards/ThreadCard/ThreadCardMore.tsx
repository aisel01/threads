'use client';

import Image from 'next/image';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../ui/dropdown-menu';
import { useTransition } from 'react';
import { deleteThread } from '@/lib/actions/thread.actions';

import { usePathname, useRouter } from 'next/navigation';

type ThreadCardMoreProps = {
    id: string;
    isComment: boolean;
}

function ThreadCardMore(props: ThreadCardMoreProps) {
    const {
        id,
        isComment,
    } = props;

    const [isDeletePending, startDeleteTransition] = useTransition();

    const pathname = usePathname();
    const router = useRouter();


    const handleDelete = () => {
        startDeleteTransition(async() => {
            await deleteThread(
                id,
                pathname,
            );

            if (!isComment) {
                router.push('/');
            }
        });
    };

    return <div>
        <DropdownMenu>
            <DropdownMenuTrigger disabled={isDeletePending}>
                <Image
                    src="/assets/more.svg"
                    alt="actions"
                    width={24}
                    height={24}
                    className="cursor-pointer object-contain"
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleDelete}>
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>;
}

export default ThreadCardMore;