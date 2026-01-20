'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Plus, Search, Filter, Grid, List, MoreVertical,
    Trash2, Edit, ExternalLink, Code2, Globe, Laptop
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProjects, type Project } from '@/lib/supabase';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { NewProjectModal } from '@/components/modals/new-project-modal';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ProjectsPage() {
    const { user, loading: isLoaded } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [projects, setProjects] = useState<Project[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

    useEffect(() => {
        const loadProjects = async () => {
            if (user?.uid) {
                const userProjects = await getUserProjects(user.uid);
                setProjects(userProjects);
                setIsLoading(false);
            }
        };
        if (isLoaded && user) loadProjects();
    }, [user, isLoaded]);

    // Filtering Logic
    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'all' || p.framework === activeFilter;
        return matchesSearch && matchesFilter;
    });

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete this project?")) return;

        try {
            await fetch(`/api/projects/${id}`, { method: 'DELETE' });
            setProjects(prev => prev.filter(p => p.id !== id));
            toast.success("Project deleted");
        } catch (error) {
            toast.error("Failed to delete project");
        }
    }

    return (
        <div className="space-y-8 p-1">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        className="text-3xl font-bold tracking-tight text-white"
                    >
                        Projects
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="text-muted-foreground mt-1"
                    >
                        Manage and organize your AI-generated applications.
                    </motion.p>
                </div>
                <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                    className="flex gap-2"
                >
                    <Button onClick={() => setIsNewProjectOpen(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2 shadow-lg shadow-indigo-500/20">
                        <Plus className="h-4 w-4" /> New Project
                    </Button>
                </motion.div>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0c0c0e] p-2 rounded-xl border border-white/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-9 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg">
                    {['all', 'react', 'nextjs', 'vanilla'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setActiveFilter(filter)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${activeFilter === filter
                                ? 'bg-indigo-500 text-white shadow-sm'
                                : 'text-muted-foreground hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {filter === 'vanilla' ? 'HTML/CSS' : filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="h-64 rounded-2xl bg-[#0c0c0e] border border-white/5 animate-pulse" />
                    ))
                ) : filteredProjects.length === 0 ? (
                    <div className="col-span-full h-96 flex flex-col items-center justify-center text-muted-foreground border border-dashed border-white/10 rounded-3xl bg-[#0c0c0e]/50">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 opacity-20" />
                        </div>
                        <p className="text-lg font-medium text-white">No projects found</p>
                        <p className="text-sm">Try adjusting your filters or create a new project.</p>
                        <Button variant="link" onClick={() => { setSearchQuery(''); setActiveFilter('all') }} className="mt-2 text-indigo-400">
                            Clear filters
                        </Button>
                    </div>
                ) : (
                    filteredProjects.map((project, i) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <div
                                onClick={() => router.push(`/dashboard/editor?id=${project.id}`)}
                                className="group bg-[#0c0c0e] hover:bg-[#121214] border border-white/5 hover:border-indigo-500/50 rounded-2xl p-5 transition-all cursor-pointer h-full flex flex-col relative overflow-hidden"
                            >
                                {/* Hover Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="h-10 w-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-sm">
                                        {project.framework === 'nextjs' ? '▲' : project.framework === 'react' ? '⚛️' : '🌐'}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white -mr-2">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="bg-[#151515] border-white/10 text-white">
                                            <DropdownMenuItem onClick={() => router.push(`/dashboard/editor?id=${project.id}`)}><Edit className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-400 hover:text-red-300" onClick={(e) => handleDelete(e, project.id!)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="relative z-10 flex-1">
                                    <h3 className="font-semibold text-white group-hover:text-indigo-400 transition-colors mb-1">{project.name}</h3>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{project.description || 'No description provided.'}</p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
                                    <Badge variant="secondary" className="bg-white/5 text-[10px] text-muted-foreground border-white/5 font-normal">
                                        {project.framework}
                                    </Badge>
                                    <span className="text-[10px] text-muted-foreground bg-[#0a0a0a] px-2 py-1 rounded-full border border-white/5">
                                        {new Date(project.updated_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <NewProjectModal open={isNewProjectOpen} onOpenChange={setIsNewProjectOpen} />
        </div>
    );
}
