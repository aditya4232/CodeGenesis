"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
    MessageSquare, Trash2, Archive, Plus, Search, 
    Clock, AlertCircle, ChevronRight, Sparkles 
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { 
    AgentConversation, 
    getUserConversations, 
    deleteConversation,
    getDaysUntilExpiry 
} from '@/lib/agent-db'
import { formatDistanceToNow } from 'date-fns'

interface ConversationHistoryProps {
    userId: string
    activeConversationId: string | null
    onSelectConversation: (conversationId: string) => void
    onNewConversation: () => void
    onDeleteConversation?: (conversationId: string) => void
}

export function ConversationHistory({
    userId,
    activeConversationId,
    onSelectConversation,
    onNewConversation,
    onDeleteConversation
}: ConversationHistoryProps) {
    const [conversations, setConversations] = useState<AgentConversation[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    // Load conversations on mount
    useEffect(() => {
        loadConversations()
    }, [userId])

    const loadConversations = async () => {
        setIsLoading(true)
        const data = await getUserConversations(userId)
        setConversations(data)
        setIsLoading(false)
    }

    const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        
        if (!confirm('Delete this conversation? This cannot be undone.')) {
            return
        }

        const success = await deleteConversation(conversationId)
        
        if (success) {
            toast.success('Conversation deleted')
            setConversations(prev => prev.filter(c => c.id !== conversationId))
            
            // If deleted conversation was active, clear selection
            if (conversationId === activeConversationId) {
                onNewConversation()
            }
        } else {
            toast.error('Failed to delete conversation')
        }
    }

    // Filter conversations by search query
    const filteredConversations = conversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="h-full flex flex-col bg-[#0c0c0e] border-r border-white/5">
            {/* Header */}
            <div className="p-4 border-b border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-white/90 uppercase tracking-wider flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-emerald-400" />
                        Conversations
                    </h2>
                    <Button
                        size="sm"
                        onClick={onNewConversation}
                        className="h-8 px-3 bg-emerald-600 hover:bg-emerald-500 text-white gap-2"
                    >
                        <Plus className="h-3 w-3" />
                        New
                    </Button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-white/30" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search conversations..."
                        className="h-9 pl-9 bg-white/5 border-white/10 text-xs placeholder:text-white/30"
                    />
                </div>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {isLoading ? (
                        // Loading skeleton
                        Array.from({ length: 5 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-16 bg-white/5 rounded-lg animate-pulse"
                            />
                        ))
                    ) : filteredConversations.length === 0 ? (
                        // Empty state
                        <div className="text-center py-12 px-4">
                            <Sparkles className="h-8 w-8 mx-auto mb-3 text-white/20" />
                            <p className="text-sm text-white/40 mb-2">
                                {searchQuery ? 'No conversations found' : 'No conversations yet'}
                            </p>
                            <p className="text-xs text-white/20">
                                {searchQuery ? 'Try a different search' : 'Start a new conversation to begin'}
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filteredConversations.map((conversation) => {
                                const isActive = conversation.id === activeConversationId
                                const daysLeft = getDaysUntilExpiry(conversation.expires_at)
                                const isExpiring = daysLeft <= 3

                                return (
                                    <motion.div
                                        key={conversation.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <button
                                            onClick={() => onSelectConversation(conversation.id)}
                                            className={`w-full p-3 rounded-lg text-left transition-all group ${
                                                isActive
                                                    ? 'bg-emerald-500/10 border border-emerald-500/30'
                                                    : 'bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className={`text-xs font-medium line-clamp-1 flex-1 ${
                                                    isActive ? 'text-emerald-400' : 'text-white/80'
                                                }`}>
                                                    {conversation.title}
                                                </h3>
                                                
                                                <div
                                                    onClick={(e) => handleDelete(conversation.id, e)}
                                                    className="h-6 w-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all cursor-pointer shrink-0 rounded hover:bg-white/10"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between text-[10px] text-white/40">
                                                <div className="flex items-center gap-2">
                                                    <span className="flex items-center gap-1">
                                                        <MessageSquare className="h-3 w-3" />
                                                        {conversation.message_count}
                                                    </span>
                                                    {conversation.artifact_count > 0 && (
                                                        <span className="flex items-center gap-1 text-indigo-400">
                                                            <Sparkles className="h-3 w-3" />
                                                            {conversation.artifact_count}
                                                        </span>
                                                    )}
                                                </div>

                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })}
                                                </span>
                                            </div>

                                            {/* Expiry warning */}
                                            {isExpiring && (
                                                <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-400">
                                                    <AlertCircle className="h-3 w-3" />
                                                    <span>Expires in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</span>
                                                </div>
                                            )}
                                        </button>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    )}
                </div>
            </ScrollArea>

            {/* Footer Info */}
            <div className="p-3 border-t border-white/5 bg-black/20">
                <div className="text-[10px] text-white/30 space-y-1">
                    <p className="flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        Conversations expire 15 days after last message
                    </p>
                    <p className="text-white/20">
                        Total: {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>
        </div>
    )
}
