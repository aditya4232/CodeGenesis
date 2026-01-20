'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    User, Key, CreditCard, Shield, Settings as SettingsIcon,
    Save, Eye, EyeOff, Check, AlertCircle, Laptop, Moon, Sun, Terminal
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const PROVIDERS = {
    groq: { name: "Groq", icon: "⚡" },
    openrouter: { name: "OpenRouter", icon: "🤖" },
    openai: { name: "OpenAI", icon: "🧠" }
};

export default function SettingsPage() {
    const { user, loading } = useAuth();
    const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
    const [showKey, setShowKey] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedKeys = localStorage.getItem("codegenesis_api_keys");
        if (storedKeys) setApiKeys(JSON.parse(storedKeys));
        setIsLoading(false);
    }, []);

    const saveKeys = () => {
        localStorage.setItem("codegenesis_api_keys", JSON.stringify(apiKeys));
        toast.success("Settings saved successfully");
    };

    const toggleShowKey = (key: string) => {
        setShowKey(prev => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-1">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <SettingsIcon className="h-6 w-6" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Settings</h1>
                    <p className="text-muted-foreground">Manage your account, API keys, and preferences.</p>
                </div>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="bg-[#0c0c0e]/30 backdrop-blur-3xl border border-white/5 p-1.5 h-14 w-full md:w-fit justify-start rounded-[1.2rem] mb-10 overflow-hidden relative shadow-2xl">
                    <TabsTrigger value="general" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white h-11 px-8 rounded-xl transition-all duration-500 font-bold tracking-tight">General</TabsTrigger>
                    <TabsTrigger value="api-keys" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white h-11 px-8 rounded-xl transition-all duration-500 font-bold tracking-tight ml-1">AI Protocol</TabsTrigger>
                    <TabsTrigger value="appearance" className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white h-11 px-8 rounded-xl transition-all duration-500 font-bold tracking-tight ml-1">Vision</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-6">
                    {/* Profile Card */}
                    <Card className="bg-[#0c0c0e] border-white/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-indigo-400" /> Profile Information</CardTitle>
                            <CardDescription>Your personal account details from the authentication provider.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
                                {user?.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="h-16 w-16 rounded-full border-2 border-indigo-500/20" />
                                ) : (
                                    <div className="h-16 w-16 rounded-full border-2 border-indigo-500/20 bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-xl font-bold">
                                        {(user?.displayName || user?.email || 'U').substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <h3 className="font-semibold text-white text-lg">{user?.displayName || 'User'}</h3>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                    <Badge variant="outline" className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 mt-2">Free Plan</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Danger Zone */}
                    <Card className="bg-[#0c0c0e] border-red-900/20">
                        <CardHeader>
                            <CardTitle className="text-red-400 flex items-center gap-2"><AlertCircle className="h-5 w-5" /> Danger Zone</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 border border-red-900/20 rounded-xl bg-red-950/10">
                                <div>
                                    <h4 className="font-medium text-red-200">Delete Account</h4>
                                    <p className="text-sm text-red-300/50">Permanently remove your account and all projects.</p>
                                </div>
                                <Button variant="destructive" size="sm">Delete Account</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="api-keys" className="space-y-6">
                    <Card className="bg-[#0c0c0e]/40 backdrop-blur-2xl border-white/5 overflow-hidden rounded-[2.5rem] shadow-2xl">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-2xl font-black tracking-tighter flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                            <Shield className="h-5 w-5" />
                                        </div>
                                        NEURAL PROTOCOLS
                                    </CardTitle>
                                    <CardDescription className="mt-2 text-white/30 font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                                        Local Neural Link Storage • 256-Bit Browser AES • Zero-Knowledge Architecture
                                    </CardDescription>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1.5 rounded-full font-mono text-[10px]">ALL NODES SECURE</Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {Object.entries(PROVIDERS).map(([key, info]) => (
                                    <motion.div
                                        key={key}
                                        whileHover={{ y: -5 }}
                                        className={`group relative p-6 rounded-[2rem] border transition-all duration-500 ${apiKeys[key]
                                            ? 'bg-indigo-500/5 border-indigo-500/20'
                                            : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="text-4xl group-hover:scale-110 transition-transform">{info.icon}</div>
                                            <div className="flex flex-col items-end">
                                                <span className={`text-[10px] font-mono font-bold tracking-widest ${apiKeys[key] ? 'text-emerald-400' : 'text-white/20'}`}>
                                                    {apiKeys[key] ? 'SYNCED' : 'OFFLINE'}
                                                </span>
                                                <div className={`h-1 w-1 rounded-full mt-1.5 ${apiKeys[key] ? 'bg-emerald-500 animate-pulse' : 'bg-white/10'}`} />
                                            </div>
                                        </div>
                                        <Label className="text-xs font-black tracking-[0.2em] text-white/40 uppercase mb-4 block">{info.name} Core</Label>
                                        <div className="relative group/input">
                                            <Input
                                                type={showKey[key] ? "text" : "password"}
                                                value={apiKeys[key] || ''}
                                                onChange={(e) => setApiKeys(prev => ({ ...prev, [key]: e.target.value }))}
                                                placeholder={`sk-XXXX...`}
                                                className="bg-black/40 border-white/5 rounded-2xl h-12 pr-12 font-mono text-xs focus:bg-black focus:border-indigo-500/50 transition-all"
                                            />
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleShowKey(key)}
                                                className="absolute right-1 top-1 h-10 w-10 text-white/20 hover:text-white rounded-xl"
                                            >
                                                {showKey[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="p-8 bg-black/40 border-t border-white/5 flex items-center justify-between">
                            <p className="text-[10px] text-white/20 font-mono tracking-widest flex items-center gap-2 uppercase">
                                <AlertCircle className="h-3 w-3 text-indigo-500" /> Changes apply to next session
                            </p>
                            <Button onClick={saveKeys} className="bg-white text-black hover:bg-white/90 font-black h-12 px-10 rounded-2xl shadow-xl transition-all active:scale-95">
                                SAVE ARCHITECTURE
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* System Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="bg-[#0c0c0e]/40 backdrop-blur-2xl border-white/5 p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                    <Laptop className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white tracking-tight uppercase text-xs tracking-widest opacity-40">System Architecture</h4>
                                    <p className="text-lg font-black text-white mt-1">NEST JS / NEXT 15 / TURBO</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="bg-[#0c0c0e]/40 backdrop-blur-2xl border-white/5 p-8 rounded-[2.5rem]">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                                    <Terminal className="h-6 w-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white tracking-tight uppercase text-xs tracking-widest opacity-40">Neural Version</h4>
                                    <p className="text-lg font-black text-white mt-1">GENESIS CORE v2.6.4-BETA</p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="appearance" className="space-y-6">
                    <Card className="bg-[#0c0c0e] border-white/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Laptop className="h-5 w-5 text-indigo-400" /> Interface</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base text-gray-200">Theme</Label>
                                    <p className="text-sm text-muted-foreground">Select your interface theme preference.</p>
                                </div>
                                <div className="flex bg-[#151515] p-1 rounded-lg border border-white/10">
                                    <Button variant="ghost" size="sm" className="h-8 gap-2 bg-indigo-500/20 text-indigo-300"><Moon className="h-3 w-3" /> Dark</Button>
                                    <Button variant="ghost" size="sm" className="h-8 gap-2 opacity-50"><Sun className="h-3 w-3" /> Light</Button>
                                </div>
                            </div>
                            <Separator className="bg-white/5" />
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base text-gray-200">Reduced Motion</Label>
                                    <p className="text-sm text-muted-foreground">Minimize animations across the dashboard.</p>
                                </div>
                                <Switch />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
