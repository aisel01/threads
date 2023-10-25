'use client';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTransition } from 'react';
import { deleteThread } from '@/lib/actions/thread.actions';

import { usePathname, useRouter } from 'next/navigation';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ThreadCardMoreProps = {
    id: string;
    isComment: boolean;
    className?: string;
}

function ThreadCardMore(props: ThreadCardMoreProps) {
    const {
        id,
        isComment,
        className,
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

    return (
        <div className={className}>
            <DropdownMenu>
                <DropdownMenuTrigger disabled={isDeletePending}>
                    <Button variant="ghost" size="icon" className="-mt-3">
                        <MoreHorizontal size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDelete}>
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

export default ThreadCardMore;