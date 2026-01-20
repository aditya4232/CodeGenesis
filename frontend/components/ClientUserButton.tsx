'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function ClientUserButton() {
    const { user, signOut } = useAuth();

    if (!user) return null;

    const displayName = user.displayName || user.email?.split('@')[0] || 'User';
    const initials = displayName.substring(0, 2).toUpperCase();

    return (
        <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 border border-white/10">
                <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white text-xs">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut()}
                className="h-8 w-8 hover:bg-white/10"
                title="Sign out"
            >
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
    );
}
