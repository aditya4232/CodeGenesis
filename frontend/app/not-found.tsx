'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
            <div className="relative w-full max-w-md aspect-square mb-8">
                <iframe
                    src="https://giphy.com/embed/V4NSR1NG2p0KeJJyr5"
                    width="100%"
                    height="100%"
                    className="absolute inset-0 pointer-events-none"
                    frameBorder="0"
                    allowFullScreen
                />
            </div>

            <h1 className="text-4xl font-bold mb-2 text-center">404: System Glitch</h1>
            <p className="text-muted-foreground text-center mb-8 max-w-md">
                The page you are looking for has been lost in the digital void.
                Our AI architects are investigating the anomaly.
            </p>

            <div className="flex gap-4">
                <Link href="/">
                    <Button variant="outline" className="gap-2">
                        <Home className="h-4 w-4" />
                        Home Base
                    </Button>
                </Link>
                <Link href="/dashboard">
                    <Button className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                    </Button>
                </Link>
            </div>
        </div>
    );
}
