/**
 * Agent Database Operations
 * Handles conversation and message persistence for the AI Agent feature
 */

import { supabase } from './supabase';

// ============================================
// TYPES
// ============================================

export interface AgentConversation {
    id: string;
    user_id: string;
    title: string;
    message_count: number;
    artifact_count: number;
    last_message_at: string;
    expires_at: string;
    is_archived: boolean;
    created_at: string;
    updated_at: string;
}

export interface AgentMessage {
    id: string;
    conversation_id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    message_type: 'text' | 'doc' | 'ppt' | 'spreadsheet' | 'code' | 'plan' | 'diagram' | 'chart';
    artifact_data?: any;
    created_at: string;
}

export interface CreateConversationInput {
    user_id: string;
    title?: string;
}

export interface CreateMessageInput {
    conversation_id: string;
    user_id: string;
    role: 'user' | 'assistant';
    content: string;
    message_type?: 'text' | 'doc' | 'ppt' | 'spreadsheet' | 'code' | 'plan' | 'diagram' | 'chart';
    artifact_data?: any;
}

// ============================================
// CONVERSATION OPERATIONS
// ============================================

/**
 * Get all conversations for a user
 */
export async function getUserConversations(userId: string): Promise<AgentConversation[]> {
    try {
        const response = await fetch(`/api/agent/conversations?user_id=${userId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch conversations');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
    }
}

/**
 * Create a new conversation
 */
export async function createConversation(
    userId: string,
    title: string = 'New Conversation'
): Promise<AgentConversation | null> {
    try {
        const response = await fetch('/api/agent/conversations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, title }),
        });

        if (!response.ok) {
            throw new Error('Failed to create conversation');
        }

        return await response.json();
    } catch (error) {
        console.error('Error creating conversation:', error);
        return null;
    }
}

/**
 * Get a single conversation with all messages
 */
export async function getConversation(conversationId: string): Promise<{
    conversation: AgentConversation;
    messages: AgentMessage[];
} | null> {
    try {
        const response = await fetch(`/api/agent/conversations/${conversationId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch conversation');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching conversation:', error);
        return null;
    }
}

/**
 * Update conversation (title, archive status)
 */
export async function updateConversation(
    conversationId: string,
    updates: { title?: string; is_archived?: boolean }
): Promise<AgentConversation | null> {
    try {
        const response = await fetch(`/api/agent/conversations/${conversationId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            throw new Error('Failed to update conversation');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating conversation:', error);
        return null;
    }
}

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(conversationId: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/agent/conversations/${conversationId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete conversation');
        }

        return true;
    } catch (error) {
        console.error('Error deleting conversation:', error);
        return false;
    }
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

/**
 * Get all messages for a conversation
 */
export async function getConversationMessages(conversationId: string): Promise<AgentMessage[]> {
    try {
        const response = await fetch(`/api/agent/conversations/${conversationId}/messages`);
        if (!response.ok) {
            throw new Error('Failed to fetch messages');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

/**
 * Add a new message to a conversation
 */
export async function addMessage(
    conversationId: string,
    message: Omit<CreateMessageInput, 'conversation_id'>
): Promise<AgentMessage | null> {
    try {
        const response = await fetch(`/api/agent/conversations/${conversationId}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...message, conversation_id: conversationId }),
        });

        if (!response.ok) {
            throw new Error('Failed to add message');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding message:', error);
        return null;
    }
}

/**
 * Delete a message
 */
export async function deleteMessage(messageId: string): Promise<boolean> {
    try {
        const response = await fetch(`/api/agent/messages/${messageId}`, {
            method: 'DELETE',
        });

        return response.ok;
    } catch (error) {
        console.error('Error deleting message:', error);
        return false;
    }
}

// ============================================
// CLEANUP OPERATIONS
// ============================================

/**
 * Manually trigger cleanup of expired conversations
 */
export async function cleanupExpiredConversations(): Promise<number> {
    try {
        const response = await fetch('/api/agent/cleanup', {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Cleanup failed');
        }

        const data = await response.json();
        return data.deleted_count || 0;
    } catch (error) {
        console.error('Error cleaning up conversations:', error);
        return 0;
    }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculate days until conversation expires
 */
export function getDaysUntilExpiry(expiresAt: string): number {
    const expiry = new Date(expiresAt);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/**
 * Check if conversation is expired
 */
export function isConversationExpired(expiresAt: string): boolean {
    return new Date(expiresAt) < new Date();
}

/**
 * Format conversation title for display
 */
export function formatConversationTitle(title: string, maxLength: number = 40): string {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + '...';
}

/**
 * Generate a conversation title from the first message
 */
export function generateTitle(firstMessage: string): string {
    const maxLength = 50;
    let title = firstMessage.trim();
    
    // Remove markdown formatting
    title = title.replace(/[#*`]/g, '');
    
    // Truncate if too long
    if (title.length > maxLength) {
        title = title.substring(0, maxLength) + '...';
    }
    
    return title || 'New Conversation';
}
