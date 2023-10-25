'use client';

import { ChangeEvent, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { userValidation } from '@/lib/validations/user';
import { isBase64Image } from '@/lib/utils';
import { useUploadThing } from '@/lib/uploadthing';
import { createUser, updateUser } from '@/lib/actions/user.actions';
import { useUser } from '@clerk/nextjs';
import { logger } from '@/logger';

type AccountProfileProps = {
    user: {
        id?: string;
        clerkId: string;
        name: string;
        username: string;
        bio: string;
        image: string;
    }
    btnTitle: string;
};

const AccountProfile = ({ user, btnTitle }: AccountProfileProps) => {
    const pathname = usePathname();
    const router = useRouter();

    const { user: clerkUser } = useUser();

    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    const { startUpload } = useUploadThing('media');

    const form = useForm({
        resolver: zodResolver(userValidation),
        defaultValues: {
            profile_photo: user?.image || '',
            name: user?.name || '',
            username: user?.username || '',
            bio: user?.bio || '',
        }
    });

    const handleSubmit = async (values: z.infer<typeof userValidation>) => {
        setLoading(true);

        try {
            const blob = values.profile_photo;

            const hasImageChanged = isBase64Image(blob);

            if (hasImageChanged) {
                const imgRes = await startUpload(files);

                if (imgRes && imgRes[0].url) {
                    values.profile_photo = imgRes[0].url;
                }

                await clerkUser?.setProfileImage({
                    file: blob,
                });
            }

            if (user.id) {
                await updateUser({
                    id: user.id,
                    username: values.username,
                    name: values.name,
                    image: values.profile_photo,
                    bio: values.bio,
                    path: pathname,
                });
            } else {
                await createUser({
                    clerkId: user.clerkId,
                    username: values.username,
                    name: values.name,
                    image: values.profile_photo,
                    bio: values.bio,
                });
            }
        } catch {
            logger.error('Failed to save profile');
        } finally {
            setLoading(false);
        }

        if (pathname === '/profile/edit') {
            router.back();
        } else {
            router.push('/');
        }
    };

    // eslint-disable-next-line no-unused-vars
    const handleImage = (e: ChangeEvent<HTMLInputElement>, fieldChange: (v: string) => void) => {
        e.preventDefault();

        const fileReader = new FileReader();

        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];

            if (!file.type.includes('image')) {
                return;
            }

            setFiles(Array.from(e.target.files));

            fileReader.onload = async (event) => {
                const imageDataUrl = event.target?.result?.toString() || '';

                fieldChange(imageDataUrl);
            };

            fileReader.readAsDataURL(file);
        }
    };

    return (
        <div>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="flex flex-col justify-start gap-10"
                >
                    <FormField
                        control={form.control}
                        name="profile_photo"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                                <FormLabel className="account-form_image-label">
                                    {field.value ? (
                                        <Image
                                            src={field.value}
                                            alt="profile photo"
                                            fill
                                            priority
                                            className="rounded-full object-cover"
                                        />
                                    ): (
                                        <Image
                                            src="/assets/profile.svg"
                                            alt="profile photo"
                                            width={56}
                                            height={56}
                                            className="object-contain"
                                        />
                                    )}
                                </FormLabel>
                                <FormControl className="flex-1 text-base-semibold text-secondary-foreground">
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        placeholder="Upload a photo"
                                        className="account-form_image-input"
                                        onChange={(e) => handleImage(e, field.onChange)}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="flex w-full flex-col gap-2">
                                <FormLabel className="text-base-semibold">
                                    Name
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        className="no-focus"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem className="flex w-full flex-col gap-2">
                                <FormLabel className="text-base-semibold">
                                    Username
                                </FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        className="no-focus"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="bio"
                        render={({ field }) => (
                            <FormItem className="flex w-full flex-col gap-2">
                                <FormLabel className="text-base-semibold">
                                    Bio
                                </FormLabel>
                                <FormControl>
                                    <Textarea
                                        rows={4}
                                        className="no-focus"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        variant="default"
                        disabled={loading}
                    >
                        {btnTitle}
                    </Button>
                </form>
            </Form>
        </div>
    );
};

export default AccountProfile;