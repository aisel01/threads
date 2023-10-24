'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { MoveLeft } from 'lucide-react';

function BackToProfileButton() {
    const router = useRouter();

    return (
        <Button
            variant="outline"
            size="icon"
            title="Back"
            onClick={() => router.back()}
            className="-ml-4 mr-4"
        >
            <MoveLeft className="h-4 w-4" />
        </Button>
    );
}

export default BackToProfileButton;