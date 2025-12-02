"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw, ExternalLink } from "lucide-react";

export function PreviewWindow() {
    return (
        <div className="flex flex-col h-full border-l bg-background">
            <div className="flex items-center justify-between p-2 border-b bg-muted/30">
                <div className="flex items-center gap-2 px-2 py-1 text-xs text-muted-foreground bg-background border rounded-md w-full max-w-[300px]">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    localhost:3000
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <ExternalLink className="w-4 h-4" />
                    </Button>
                </div>
            </div>
            <div className="flex-1 bg-white relative">
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <p>App Preview will appear here</p>
                </div>
                {/* Iframe will go here */}
            </div>
        </div>
    );
}
