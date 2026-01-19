"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { WelcomeModal } from "@/components/modals/welcome-modal";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isFullscreen = pathname?.includes('/editor') || pathname?.includes('/agent');

    // Editor gets fullscreen layout - no sidebar, no header, no padding
    if (isFullscreen) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen" suppressHydrationWarning>
            <Sidebar />
            <div className="flex-1 pl-64 transition-all duration-300" suppressHydrationWarning>
                <div className="bg-black/80 backdrop-blur-3xl border-b border-white/5 px-8 py-2.5 flex items-center justify-between" suppressHydrationWarning>
                    <div className="flex items-center gap-4">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-mono text-white/30 uppercase tracking-[0.3em]">Neural Core: <span className="text-white/60">v2.6.4-STABLE</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <span className="text-[9px] font-mono text-white/20 uppercase tracking-widest">Architects: <span className="text-indigo-400/60 transition-colors hover:text-indigo-400 cursor-pointer">Aditya S. & Sneha S.</span></span>
                        <div className="h-3 w-px bg-white/10" />
                        <span className="text-[9px] font-mono text-emerald-500/40 uppercase tracking-widest">Projection Status: <span className="text-emerald-500/80">Active</span></span>
                    </div>
                </div>
                <Header />
                <main className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {children}
                </main>
                <WelcomeModal />
            </div>
        </div>
    );
}
