'use client';

import { ThemeValue } from '@/components/theme/theme-provider';
import { SignUp } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { useTheme } from 'next-themes';

export default function Page() {
    const { theme } = useTheme();

    return <SignUp
        appearance={{
            baseTheme: theme === ThemeValue.dark ? dark : undefined,
        }}
    />;
}