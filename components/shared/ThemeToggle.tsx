'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeValue } from '@/components/theme/theme-provider';

function ThemeToggle() {
    const { setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <Sun size={20} className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon size={20} className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme(ThemeValue.light)}>
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(ThemeValue.dark)}>
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme(ThemeValue.system)}>
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default ThemeToggle;
