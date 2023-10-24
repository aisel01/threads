'use client';

import { OrganizationSwitcher, SignOutButton, SignedIn } from '@clerk/nextjs';
import { dark, neobrutalism } from '@clerk/themes';

import Image from 'next/image';
import Link from 'next/link';
import ThemeToggle from '@/components/shared/ThemeToggle';
import { ThemeValue } from '@/components/theme/theme-provider';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

function Topbar() {
    const { theme } = useTheme();

    return (
        <nav className="topbar">
            <Link href="/" className="flex item-center gap-4">
                <Image src="/assets/logo.svg" alt="logo" width={28} height={28} />
                <p className="text-heading3-bold max-xs:hidden">Threads</p>
            </Link>
            <div className="flex items-center gap-1">
                <ThemeToggle />
                <div className="block md:hidden">
                    <SignedIn>
                        <SignOutButton>
                            <Button
                                variant="outline"
                                size="icon"
                            >
                                <LogOut size={20} />
                                <span className="sr-only">Logout</span>
                            </Button>
                        </SignOutButton>
                    </SignedIn>
                </div>

                <OrganizationSwitcher
                    appearance={{
                        baseTheme: theme === ThemeValue.dark ? dark : neobrutalism,
                        elements: {
                            organizationSwitcherTrigger: 'py-2 px-4'
                        }
                    }}
                />

            </div>
        </nav>
    );
}

export default Topbar;
