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
import { Textarea } from '@/components/ui/textarea';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ThreadValidation } from '@/lib/validations/thread';
import { createThread } from '@/lib/actions/thread.actions';
import * as z from 'zod';
import { usePathname, useRouter } from 'next/navigation';
import { useOrganization } from '@clerk/nextjs';

function PostThread({ userId }: { userId: string }) {
    const router = useRouter();
    const pathname = usePathname();

    const { organization } = useOrganization();

    const form = useForm({
        resolver: zodResolver(ThreadValidation),
        defaultValues: {
            thread: '',
            accountId: userId,
        }
    });

    const handleSubmit = async (values: z.infer<typeof ThreadValidation>) => {
        await createThread({
            text: values.thread,
            author: userId,
            communityId: organization ? organization.id : null,
            path: pathname,
        });

        router.push('/');
    };

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="mt-10 flex flex-col justify-start gap-6"
                >
                    <FormField
                        control={form.control}
                        name="thread"
                        render={({ field }) => (
                            <FormItem className="flex flex-col gap-2 w-full">
                                <FormLabel className="text-base-semibold ">
                                    Content
                                </FormLabel>
                                <FormControl className="no-focus border">
                                    <Textarea
                                        rows={15}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        variant="default"
                    >
                        Post thread
                    </Button>
                </form>
            </Form>
        </>
    );
}

export default PostThread;