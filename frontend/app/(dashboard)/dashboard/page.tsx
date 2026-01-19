'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, ArrowRight, Clock, Code2, Sparkles, TrendingUp, Zap, CheckCircle2, Layout, Github, Terminal, Search, Activity, Box, Settings, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@clerk/nextjs';
import { getUserProjects, type Project } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NewProjectModal } from '@/components/modals/new-project-modal';

// --- Visual Assets ---
const NeuralFlow = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] animate-[spin_60s_linear_infinite] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.08)_0%,transparent_50%)]" />
        <div className="absolute top-[-20%] right-[-20%] w-[100%] h-[100%] animate-[pulse_10s_ease-in-out_infinite] bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.05)_0%,transparent_50%)]" />
    </div>
);

export default function Dashboard() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

    useEffect(() => {
        const loadProjects = async () => {
            if (user?.id) {
                const userProjects = await getUserProjects(user.id);
                setProjects(userProjects);
                setIsLoading(false);
            }
        };

        if (isLoaded && user) loadProjects();
    }, [user, isLoaded]);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="space-y-8 p-1">
            {/* Header / Welcome */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-white/5">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="text-5xl font-extrabold tracking-tighter text-white"
                    >
                        {getGreeting()}, <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-white to-emerald-400">{user?.firstName || 'Creator'}</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="text-white/40 mt-2 font-mono text-xs uppercase tracking-[0.3em]"
                    >
                        Neural Link: <span className="text-emerald-500">Active</span> • Workspace: <span className="text-indigo-400">Genesis Core v2.6</span>
                    </motion.p>
                </div>
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="flex gap-3">
                    <Button onClick={() => router.push('/dashboard/agent')} variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2 border-dashed">
                        <Bot className="h-4 w-4 text-emerald-400" /> Neural Agent
                    </Button>
                    <Button onClick={() => setIsNewProjectOpen(true)} className="bg-white text-black hover:bg-white/90 font-bold px-6 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] gap-2">
                        <Plus className="h-4 w-4" /> New Project
                    </Button>
                </motion.div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Neural Projects', value: projects.length, icon: Box, color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                    { label: 'Code Projection', value: '12.4k', icon: Code2, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                    { label: 'Sync Velocity', value: '+3.2x', icon: Zap, color: 'text-amber-400', bg: 'bg-amber-400/10' },
                    { label: 'Active Neurals', value: '99.9%', icon: Activity, color: 'text-purple-400', bg: 'bg-purple-400/10' },
                ].map((stat, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                        <Card className="bg-[#0c0c0e]/50 backdrop-blur-xl border-white/5 hover:border-white/20 transition-all duration-500 overflow-hidden group relative">
                            <NeuralFlow />
                            <CardContent className="p-6 flex items-center justify-between relative z-10">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/30">{stat.label}</p>
                                    <h2 className="text-4xl font-extrabold text-white tracking-tighter group-hover:scale-105 transition-transform origin-left">{stat.value}</h2>
                                </div>
                                <div className={`p-4 rounded-2xl ${stat.bg} border border-white/5 shadow-2xl transition-all group-hover:rotate-12`}>
                                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Main Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Projects (2/3 width) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Layout className="h-5 w-5 text-indigo-400" /> Recent Projects
                        </h2>
                        <Link href="/dashboard/projects" className="text-sm text-muted-foreground hover:text-white flex items-center gap-1 transition-colors">
                            View All <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {isLoading ? Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-40 w-full rounded-2xl bg-white/5" />
                        )) : projects.length === 0 ? (
                            <div className="col-span-2 h-40 border border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-muted-foreground">
                                <p>No projects yet.</p>
                                <Button variant="link" onClick={() => setIsNewProjectOpen(true)}>Create one now</Button>
                            </div>
                        ) : projects.slice(0, 4).map((project, i) => (
                            <motion.div key={project.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
                                <div
                                    onClick={() => router.push(`/dashboard/editor?id=${project.id}`)}
                                    className="group relative bg-[#0c0c0e]/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 hover:border-indigo-500/50 hover:bg-[#121214] transition-all cursor-pointer overflow-hidden shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-indigo-600 rounded-full p-2 shadow-lg shadow-indigo-600/40 translate-x-4 group-hover:translate-x-0 transition-transform">
                                            <ArrowRight className="h-4 w-4 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl group-hover:rotate-12 transition-transform shadow-inner border border-white/5">
                                            {project.framework === 'nextjs' ? '▲' : project.framework === 'react' ? '⚛️' : project.framework === 'vanilla' ? '🌐' : '📦'}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors tracking-tight">{project.name}</h3>
                                            <p className="text-xs text-white/40 mt-1 line-clamp-2 leading-relaxed">{project.description || 'No specialized description provided.'}</p>
                                            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-white/5">
                                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-white/20 uppercase tracking-widest">
                                                    <Clock className="h-3 w-3" /> {new Date(project.updated_at).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-500/60 uppercase tracking-widest">
                                                    <Activity className="h-3 w-3" /> SYNCED
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}

                        {/* New Project Card */}
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                            <div
                                onClick={() => setIsNewProjectOpen(true)}
                                className="h-full min-h-[180px] bg-white/5 border border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center text-white/20 hover:text-white hover:bg-white/10 hover:border-white/30 transition-all cursor-pointer gap-4 group"
                            >
                                <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/5">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Initialize Blueprint</span>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Sidebar Stats / Activity (1/3 width) */}
                <div className="space-y-6">
                    <div className="bg-[#0c0c0e] border border-white/5 rounded-3xl p-6">
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                            <Activity className="h-4 w-4 text-emerald-400" /> Recent Activity
                        </h3>
                        <div className="space-y-6 relative">
                            {/* Timeline Line */}
                            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-white/10" />

                            {projects.length === 0 ? (
                                <p className="text-sm text-muted-foreground ml-6">No recent activity found.</p>
                            ) : (
                                projects.slice(0, 3).map((project, i) => (
                                    <div key={i} className="flex gap-4 relative">
                                        <div className="w-3 h-3 rounded-full bg-[#1e1e20] border border-white/20 mt-1.5 z-10 shrink-0" />
                                        <div>
                                            <p className="text-sm text-white">Project Active</p>
                                            <p className="text-xs text-muted-foreground">Worked on <span className="text-indigo-400">"{project.name}"</span></p>
                                            <p className="text-[10px] text-white/20 mt-1">{new Date(project.updated_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-900/20 to-teal-900/20 border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Sparkles className="h-12 w-12 text-emerald-400" />
                        </div>
                        <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            Community Edition
                        </h3>
                        <p className="text-sm text-emerald-100/60 mb-4 pb-2 border-b border-emerald-500/10">
                            You are using CodeGenesis Free. Deep research and unlimited generations enabled for all open-source contributors.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-white/40">Status</span>
                                <span className="text-emerald-400 font-medium">Verified Active</span>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                                <span className="text-white/40">Open Source</span>
                                <span className="text-emerald-400 font-medium font-mono">v1.0.4-LATEST</span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full mt-4 bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/40" asChild>
                            <Link href="https://github.com/aditya4232/CodeGenesis" target="_blank">
                                <Github className="h-4 w-4 mr-2" /> Star on GitHub
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>

            <NewProjectModal open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen} />
        </div >
    );
}
