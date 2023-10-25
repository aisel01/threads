'use client';

import { ThemeValue } from '@/components/theme/theme-provider';
import { SignIn } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export default function Page() {
    const { theme } = useTheme();

    return <SignIn
        appearance={{
            baseTheme: theme === ThemeValue.dark ? dark : undefined,
        }}
    />;
}