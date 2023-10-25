'use client';

import { sidebarLinks } from '@/constants';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';

function Bottombar() {
    const pathname = usePathname();

    return (
        <section className="bottombar">
            <NavigationMenu>
                <NavigationMenuList
                    className="bottombar_container"
                >
                    {sidebarLinks.map(link => {
                        const isActive =
                            (pathname.includes(link.route) && link.route.length > 1) ||
                            pathname === link.route;

                        return (
                            <NavigationMenuItem
                                key={link.label}
                                className="flex-1"
                            >
                                <Link
                                    href={link.route}
                                    legacyBehavior
                                    passHref
                                >
                                    <NavigationMenuLink
                                        className={cn(
                                            'bottombar_link',
                                            navigationMenuTriggerStyle(),
                                        )}
                                        active={isActive}
                                    >
                                        <link.icon />
                                        <p className="text-subtle-medium max-sm:hidden">
                                            {link.label.split(' ')[0]}
                                        </p>
                                    </NavigationMenuLink>
                                </Link>
                            </NavigationMenuItem>
                        );
                    })}
                </NavigationMenuList>
            </NavigationMenu>
        </section>
    );
}

export default Bottombar;