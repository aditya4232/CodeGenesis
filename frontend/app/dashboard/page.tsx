"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Folder } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
    return (
        <div className="container py-10">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground">Manage your AI-generated applications.</p>
                </div>
                <Link href="/editor/new">
                    <Button>
                        <Plus className="w-4 h-4 mr-2" /> New Project
                    </Button>
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Mock Project */}
                <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Folder className="w-5 h-5 text-primary" />
                            My First App
                        </CardTitle>
                        <CardDescription>Last edited 2 mins ago</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">A simple todo list application with React and Tailwind.</p>
                    </CardContent>
                </Card>

                {/* Empty State */}
                <Card className="flex flex-col items-center justify-center h-[200px] border-dashed">
                    <div className="flex flex-col items-center text-center">
                        <p className="text-sm text-muted-foreground mb-4">No more projects found.</p>
                        <Link href="/editor/new">
                            <Button variant="outline">Create One</Button>
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
