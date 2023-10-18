import React from 'react';

import { ClerkProvider } from '@clerk/nextjs';
import { Inter } from 'next/font/google';
import Topbar from '@/components/shared/Topbar';
import LeftSidebar from '@/components/shared/LeftSidebar';
import RightSidebar from '@/components/shared/RightSidebar';
import Bottombar from '@/components/shared/Bottombar';

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
                <body className={`${inter.className}`}>
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="dark"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <Topbar />
                        <main className="flex flex-row">
                            <LeftSidebar />
                            <section className="main-container">
                                <div className="w-full max-w-4xl">
                                    {children}
                                </div>
                            </section>
                            <RightSidebar />
                        </main>
                        <Bottombar />
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
