import React from 'react';

import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';

import '../globals.css';
import { ThemeProvider } from '@/components/theme/theme-provider';

export const metadata = {
    title: 'Threads',
    description: 'A Next.js App',
};

const inter = Inter({
    subsets: ['latin'],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={`${inter.className} bg-dark-1`}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <div className="w-full flex justify-center items-center min-h-screen">
                            {children}
                        </div>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}