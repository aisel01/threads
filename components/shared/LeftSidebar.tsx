'use client';

import { sidebarLinks } from '@/constants';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { SignOutButton, SignedIn } from '@clerk/nextjs';
import { cn } from '@/lib/utils';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { LogOut } from 'lucide-react';

function LeftSidebar() {
    const router = useRouter();
    const pathname = usePathname();

    return (
        <section className="leftsidebar">
            <NavigationMenu
                orientation="vertical"
            >
                <NavigationMenuList
                    className="flex w-full flex-1 flex-col gap-6 px-6"
                >
                    {sidebarLinks.map(link => {
                        const isActive =
                            (pathname.includes(link.route) && link.route.length > 1) ||
                            pathname === link.route;

                        return (
                            <NavigationMenuItem
                                key={link.label}
                            >
                                <Link
                                    href={link.route}
                                    legacyBehavior
                                    passHref
                                >
                                    <NavigationMenuLink
                                        className={cn(
                                            'leftsidebar_link',
                                            navigationMenuTriggerStyle(),
                                        )}
                                        active={isActive}
                                    >
                                        <link.icon />
                                        <p className="max-lg:hidden">
                                            {link.label}
                                        </p>
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        );
                    })}
                </NavigationMenuList>
            </NavigationMenu>
            <div className="mt-10 px-6">
                <SignedIn>
                    <SignOutButton signOutCallback={() => {
                        router.push('/sign-in');
                    }}>
                        <div
                            className={cn(
                                'leftsidebar_link cursor-pointer',
                                navigationMenuTriggerStyle(),
                            )}
                        >
                            <LogOut />
                            <p className="max-lg:hidden">
                                Logout
                            </p>
                        </div>
                    </SignOutButton>
                </SignedIn>
            </div>
        </section>
    );
}

export default LeftSidebar;
