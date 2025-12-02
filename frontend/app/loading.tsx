'use client';

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 space-y-8">
            <div className="relative w-64 h-64">
                <iframe
                    src="https://giphy.com/embed/L1R1TVTh2Rht15ExWy"
                    width="100%"
                    height="100%"
                    className="absolute inset-0 pointer-events-none"
                    frameBorder="0"
                    allowFullScreen
                />
            </div>

            <div className="text-center space-y-4 max-w-sm w-full">
                <h2 className="text-xl font-semibold animate-pulse">Initializing Neural Networks...</h2>

                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[90%]" />
                    <Skeleton className="h-4 w-[80%]" />
                </div>
            </div>
        </div>
    );
}
