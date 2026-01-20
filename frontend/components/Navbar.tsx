'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
    const pathname = usePathname();
    const { user } = useAuth();

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="container mx-auto flex h-16 items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-purple-500">
                        <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">CodeGenesis</span>
                </Link>

                <div className="flex items-center gap-6">
                    <Link
                        href="/how-it-works"
                        className={`text-sm transition-colors hover:text-primary ${pathname === '/how-it-works' ? 'text-primary' : 'text-muted-foreground'
                            }`}
                    >
                        How it Works
                    </Link>
                    <Link
                        href="/docs"
                        className={`text-sm transition-colors hover:text-primary ${pathname === '/docs' ? 'text-primary' : 'text-muted-foreground'
                            }`}
                    >
                        Documentation
                    </Link>
                    <Link
                        href="/pricing"
                        className={`text-sm transition-colors hover:text-primary ${pathname === '/pricing' ? 'text-primary' : 'text-muted-foreground'
                            }`}
                    >
                        Pricing
                    </Link>

                    <div className="flex items-center gap-2">
                        {user ? (
                            <Link href="/dashboard">
                                <Button size="sm" className="rounded-full">
                                    Dashboard
                                </Button>
                            </Link>
                        ) : (
                            <>
                                <Link href="/sign-in">
                                    <Button variant="ghost" size="sm" className="rounded-full">
                                        Sign In
                                    </Button>
                                </Link>
                                <Link href="/sign-up">
                                    <Button size="sm" className="rounded-full">
                                        Get Started
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
