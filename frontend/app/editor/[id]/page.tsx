"use client";

import { ChatInterface } from "@/components/chat-interface";
import { CodeEditor } from "@/components/code-editor";
import { PreviewWindow } from "@/components/preview-window";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

export default function EditorPage() {
    return (
        <div className="h-screen w-full overflow-hidden">
            <ResizablePanelGroup direction="horizontal">
                <ResizablePanel defaultSize={20} minSize={15}>
                    <ChatInterface />
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={40} minSize={30}>
                    <CodeEditor />
                </ResizablePanel>

                <ResizableHandle />

                <ResizablePanel defaultSize={40} minSize={30}>
                    <PreviewWindow />
                </ResizablePanel>
            </ResizablePanelGroup>
        </div>
    );
}
