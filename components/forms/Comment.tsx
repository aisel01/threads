'use client';

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CommentValidation } from '@/lib/validations/thread';
import { addCommentToThread } from '@/lib/actions/thread.actions';
import * as z from 'zod';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

type CommentProps = {
    threadId: string;
    currentUserImg: string;
    currentUserId: string;
}


function Comment(props: CommentProps) {
    const {
        threadId,
        currentUserImg,
        currentUserId,
    } = props;

    const pathname = usePathname();

    const form = useForm({
        resolver: zodResolver(CommentValidation),
        defaultValues: {
            thread: '',
        }
    });

    const handleSubmit = async (values: z.infer<typeof CommentValidation>) => {
        await addCommentToThread({
            threadId,
            text: values.thread,
            userId: currentUserId,
            path: pathname,
        });

        form.reset();
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(handleSubmit)}
            >
                <FormField
                    control={form.control}
                    name="thread"
                    render={({ field }) => (
                        <FormItem className="flex w-full items-center gap-3">
                            <FormLabel>
                                <Image
                                    src={currentUserImg}
                                    alt="Profile image"
                                    width={48}
                                    height={48}
                                    className="rounded-full object-cover"
                                />
                            </FormLabel>
                            <FormControl className="border-none bg-transparent">
                                <Input
                                    placeholder="Comment..."
                                    className="no-focus"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button
                    type="submit"
                >
                    Reply
                </Button>
            </form>
        </Form>
    );
}

export default Comment;