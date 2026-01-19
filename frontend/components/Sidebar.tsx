'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FolderGit2,
    Settings,
    Code2,
    LifeBuoy,
    LogOut,
    Bot
} from 'lucide-react';
import { useClerk } from '@clerk/nextjs';
import { motion } from 'framer-motion';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: FolderGit2, label: 'Projects', href: '/dashboard/projects' },
    { icon: Bot, label: 'AI Agent', href: '/dashboard/agent' },
    { icon: Code2, label: 'Editor', href: '/dashboard/editor' },
    { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { signOut } = useClerk();

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/5 bg-[#050507]/60 backdrop-blur-3xl transition-all duration-500 ease-in-out" suppressHydrationWarning>
            <div className="flex h-full flex-col" suppressHydrationWarning>
                {/* Logo */}
                <div className="flex h-24 items-center px-8" suppressHydrationWarning>
                    <div className="flex items-center gap-3 font-black text-2xl tracking-tighter group cursor-pointer" suppressHydrationWarning>
                        <div className="relative h-10 w-10 flex items-center justify-center bg-indigo-600 rounded-2xl shadow-[0_0_20px_rgba(79,70,229,0.3)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" suppressHydrationWarning>
                            <Code2 className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex flex-col leading-none">
                            <span className="text-white">Code</span>
                            <span className="text-white/40 text-xs font-mono tracking-widest uppercase mt-1">Genesis</span>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6" suppressHydrationWarning>
                    <nav className="space-y-2 px-4" suppressHydrationWarning>
                        {sidebarItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 rounded-2xl px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-500 relative group",
                                        isActive
                                            ? "text-white bg-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-white/10"
                                            : "text-white/30 hover:text-white"
                                    )}
                                    suppressHydrationWarning
                                >
                                    {isActive && <motion.div layoutId="sidebar-active" className="absolute left-[-1px] top-3 bottom-3 w-1 bg-indigo-500 rounded-full" />}
                                    <item.icon className={cn("h-4 w-4 transition-all duration-500 group-hover:scale-110", isActive ? "text-indigo-400" : "opacity-40")} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer */}
                <div className="p-6" suppressHydrationWarning>
                    <div className="p-5 rounded-3xl bg-indigo-600/5 border border-indigo-500/10 mb-6">
                        <p className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest mb-2">NEURAL_STATS</p>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div animate={{ width: ["0%", "85%"] }} className="h-full bg-indigo-500" />
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="flex w-full items-center justify-center gap-3 rounded-2xl px-3 py-4 text-[10px] font-mono uppercase tracking-[0.2em] font-black text-white/20 hover:text-red-400 hover:bg-red-400/10 transition-all duration-300 border border-transparent hover:border-red-400/20"
                        suppressHydrationWarning
                    >
                        <LogOut className="h-4 w-4" />
                        TERMINATE_LINK
                    </button>
                </div>
            </div>
        </aside>
    );
}
