'use client';

import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';

import { useForm } from 'react-hook-form';
import { deleteThread } from '@/lib/actions/thread.actions';
import { usePathname, useRouter } from 'next/navigation';

type DeleteThreadProps = {
    threadId: string;
    isComment: boolean;
}


function DeleteThread(props: DeleteThreadProps) {
    const { 
        threadId,
        isComment,
    } = props;

    const pathname = usePathname();
    const router = useRouter();
    
    const form = useForm();

    const handleSubmit = async () => {
        await deleteThread(
            threadId,
            pathname,
        );

        if (!isComment) {
            router.push('/');
        }

        form.reset();
    };
 
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
                <Button type="submit" variant="ghost" size="sm">
                    Delete
                </Button>
            </form>
        </Form>
    );
}

export default DeleteThread;