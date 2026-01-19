# AGENT PAGE INTEGRATION GUIDE

## 🎯 Complete Setup Instructions

### **STEP 1: Apply SQL Schema to Supabase**

1. Go to your Supabase Dashboard
2. Navigate to: **SQL Editor** → **New Query**
3. Paste the entire contents of: `frontend/supabase/schema_agent_conversations.sql`
4. Click **Run** to execute the schema

### **STEP 2: Add Environment Variables**

Add to `frontend/.env.local`:

```env
# Cron Job Secret (for auto-cleanup)
CRON_SECRET=your-random-secret-key-here
```

Generate a random secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### **STEP 3: Setup Vercel Cron Job (Optional but Recommended)**

Create `vercel.json` in the project root:

```json
{
  "crons": [{
    "path": "/api/agent/cleanup",
    "schedule": "0 0 * * *"
  }]
}
```

This will run cleanup daily at midnight UTC.

---

## 📝 Agent Page Update Instructions

### **Files Already Created:**
✅ `frontend/lib/agent-db.ts` - Database operations  
✅ `frontend/lib/export-utils.ts` - Export utilities  
✅ `frontend/components/agent/ConversationHistory.tsx` - Sidebar  
✅ `frontend/components/agent/ArtifactViewer.tsx` - Enhanced viewer  
✅ `frontend/app/api/agent/conversations/route.ts` - API routes  
✅ `frontend/app/api/agent/conversations/[id]/route.ts` - Single conversation API  
✅ `frontend/app/api/agent/conversations/[id]/messages/route.ts` - Messages API  
✅ `frontend/app/api/agent/cleanup/route.ts` - Cleanup API  

### **Required Changes to Agent Page:**

#### **1. Add Imports (Top of file)**

```typescript
import { useUser } from '@clerk/nextjs'
import { ConversationHistory } from '@/components/agent/ConversationHistory'
import { ArtifactViewer } from '@/components/agent/ArtifactViewer'
import {
    getUserConversations,
    createConversation,
    getConversation,
    addMessage,
    AgentConversation,
    AgentMessage
} from '@/lib/agent-db'
```

#### **2. Add State Variables (After existing state)**

```typescript
// Clerk user
const { user } = useUser()

// Conversation state
const [conversations, setConversations] = useState<AgentConversation[]>([])
const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
const [showHistory, setShowHistory] = useState(true)
```

#### **3. Load Conversations on Mount**

```typescript
// Load conversations when component mounts
useEffect(() => {
    if (user) {
        loadUserConversations()
    }
}, [user])

const loadUserConversations = async () => {
    if (!user) return
    const convs = await getUserConversations(user.id)
    setConversations(convs)
    
    // If no active conversation, create one
    if (convs.length > 0 && !activeConversationId) {
        setActiveConversationId(convs[0].id)
        loadConversationMessages(convs[0].id)
    } else if (convs.length === 0) {
        handleNewConversation()
    }
}

const loadConversationMessages = async (conversationId: string) => {
    const result = await getConversation(conversationId)
    if (result) {
        // Convert database messages to component format
        const formattedMessages = result.messages.map(msg => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at),
            type: msg.message_type as any,
            docData: msg.message_type === 'doc' ? msg.artifact_data : undefined,
            pptData: msg.message_type === 'ppt' ? msg.artifact_data : undefined,
            spreadsheetData: msg.message_type === 'spreadsheet' ? msg.artifact_data : undefined,
            codeData: msg.message_type === 'code' ? msg.artifact_data : undefined,
        }))
        setMessages(formattedMessages)
    }
}

const handleNewConversation = async () => {
    if (!user) return
    
    const newConv = await createConversation(user.id, 'New Conversation')
    if (newConv) {
        setConversations(prev => [newConv, ...prev])
        setActiveConversationId(newConv.id)
        setMessages([{
            id: '1',
            role: 'assistant',
            content: "### Neural Interface Link Synchronized\\n\\nI am the **CodeGenesis Neural Core (v2.6)**. Architectural planning and project projection protocols are online.\\n\\n*How shall we evolve your project today?*",
            timestamp: new Date()
        }])
    }
}

const handleSelectConversation = async (conversationId: string) => {
    setActiveConversationId(conversationId)
    await loadConversationMessages(conversationId)
}
```

#### **4. Update handleSend to Save to Database**

Replace the existing `handleSend` function with this enhanced version that saves to database:

```typescript
const handleSend = async (customInput?: string) => {
    const val = customInput || input
    if (!val.trim() || isLoading || !user || !activeConversationId) return

    const provider = "groq"
    const key = apiKeys[provider]
    if (!key) {
        toast.error(`Please set ${provider} API key in Editor Settings first.`)
        return
    }

    const userMsg: Message = { 
        id: Date.now().toString(), 
        role: 'user', 
        content: val, 
        timestamp: new Date() 
    }
    
    setMessages(prev => [...prev, userMsg])
    setInput("")
    setIsLoading(true)
    setStreamingContent("")

    // Save user message to database
    await addMessage(activeConversationId, {
        user_id: user.id,
        role: 'user',
        content: val,
        message_type: 'text'
    })

    try {
        const history = messages.map(m => ({ role: m.role, content: m.content }))
        const res = await fetch('/api/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: [...history, { role: 'user', content: val }],
                model: "llama-3.3-70b-versatile",
                provider,
                apiKey: key,
                files: {}
            })
        })

        const reader = res.body?.getReader()
        if (!reader) throw new Error("Stream failed")
        const decoder = new TextDecoder()
        let fullResponse = ''

        while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            const lines = chunk.split('\\n')
            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const data = JSON.parse(line.slice(6))
                        if (data.content) {
                            fullResponse += data.content
                            setStreamingContent(fullResponse)
                        }
                    } catch { }
                }
            }
        }
        setStreamingContent("")

        // Parse response for artifacts
        let finalMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: fullResponse,
            timestamp: new Date(),
            type: 'text'
        }

        let jsonData: any = null
        const jsonMatch = fullResponse.match(/```json\\n([\\s\\S]*?)\\n```/)
        try {
            if (jsonMatch) jsonData = JSON.parse(jsonMatch[1])
            else if (fullResponse.trim().startsWith('{')) jsonData = JSON.parse(fullResponse.trim())
        } catch (e) { }

        let artifactData = null
        let messageType = 'text'

        if (jsonData) {
            if (jsonData.type === 'doc') {
                finalMessage.type = 'doc'
                finalMessage.docData = { title: jsonData.title, content: jsonData.content }
                finalMessage.content = `### Generated Document: ${jsonData.title}`
                setActiveArtifact({ type: 'doc', data: finalMessage.docData })
                artifactData = finalMessage.docData
                messageType = 'doc'
            } else if (jsonData.type === 'ppt') {
                finalMessage.type = 'ppt'
                finalMessage.pptData = { title: jsonData.title, slides: jsonData.slides }
                finalMessage.content = `### Generated Presentation: ${jsonData.title}`
                setActiveArtifact({ type: 'ppt', data: finalMessage.pptData })
                artifactData = finalMessage.pptData
                messageType = 'ppt'
            } else if (jsonData.type === 'spreadsheet') {
                finalMessage.type = 'spreadsheet'
                finalMessage.spreadsheetData = { title: jsonData.title, columns: jsonData.columns, data: jsonData.data }
                finalMessage.content = `### Generated Data Grid: ${jsonData.title}`
                setActiveArtifact({ type: 'spreadsheet', data: finalMessage.spreadsheetData })
                artifactData = finalMessage.spreadsheetData
                messageType = 'spreadsheet'
            } else if (jsonData.type === 'code') {
                finalMessage.type = 'code'
                finalMessage.codeData = { title: jsonData.title, language: jsonData.language, content: jsonData.content }
                finalMessage.content = `### Generated Code: ${jsonData.title}`
                setActiveArtifact({ type: 'code', data: finalMessage.codeData })
                artifactData = finalMessage.codeData
                messageType = 'code'
            }
        }

        setMessages(prev => [...prev, finalMessage])

        // Save assistant message to database
        await addMessage(activeConversationId, {
            user_id: user.id,
            role: 'assistant',
            content: finalMessage.content,
            message_type: messageType as any,
            artifact_data: artifactData
        })

        // Refresh conversations list to update metadata
        loadUserConversations()

    } catch (error) {
        toast.error("Neural sync error.")
        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'assistant', 
            content: "**Error**: Failed to establish stable link.", 
            timestamp: new Date() 
        }])
    } finally {
        setIsLoading(false)
    }
}
```

#### **5. Update JSX Layout**

Replace the main return statement to include the sidebar:

```typescript
return (
    <div className="h-screen flex flex-col bg-[#050507] text-white overflow-hidden">
        {/* Existing header... */}
        <header className="h-14 border-b border-white/5 ...">
            {/* Keep existing header content */}
        </header>

        <div className="flex-1 flex min-h-0 overflow-hidden relative">
            {/* NEW: Conversation History Sidebar */}
            {showHistory && user && (
                <div className="w-80 shrink-0">
                    <ConversationHistory
                        userId={user.id}
                        activeConversationId={activeConversationId}
                        onSelectConversation={handleSelectConversation}
                        onNewConversation={handleNewConversation}
                    />
                </div>
            )}

            {/* Chat Interface - Keep existing but adjust width */}
            <main className={`flex flex-col h-full transition-all ${activeArtifact ? 'w-1/2' : 'flex-1'}`}>
                {/* Existing chat messages... */}
            </main>

            {/* Action Screen - Replace existing with new ArtifactViewer */}
            <AnimatePresence mode="wait">
                {activeArtifact && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "50%", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="h-full"
                    >
                        <ArtifactViewer
                            type={activeArtifact.type}
                            data={activeArtifact.data}
                            onClose={() => setActiveArtifact(null)}
                        />
                    </motion.aside>
                )}
            </AnimatePresence>
        </div>
    </div>
)
```

---

## 🧪 **Testing Instructions**

### **1. Test Database Schema**
```sql
-- In Supabase SQL Editor, run:
SELECT * FROM agent_conversations LIMIT 1;
SELECT * FROM agent_messages LIMIT 1;
```

### **2. Test API Routes**
```bash
# Test conversation creation (requires authentication)
curl -X POST http://localhost:3000/api/agent/conversations \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Conversation"}'
```

### **3. Test Frontend**
1. Start dev server: `npm run dev`
2. Navigate to `/dashboard/agent`
3. Send a message
4. Check Supabase dashboard to verify data is saved
5. Reload page - conversation should persist
6. Try creating a new conversation
7. Test artifact generation (ask AI to create a document)
8. Test export buttons (should download real files)

---

## 🚀 **What You've Built**

✅ **Persistent Conversations** - All chats saved to database  
✅ **15-Day Auto-Cleanup** - Conversations expire automatically  
✅ **Conversation History** - Beautiful sidebar with search  
✅ **Real Export** - Actual PDF, Excel, PowerPoint generation  
✅ **Enhanced UI** - Professional artifact viewer  
✅ **Auto-Save** - Every message saved in real-time  
✅ **Scalable** - Handles unlimited conversations per user  
✅ **Secure** - Clerk auth + Supabase RLS  

---

## 📊 **Summary of Created Files**

| File | Purpose |
|------|---------|
| `supabase/schema_agent_conversations.sql` | Database schema |
| `lib/agent-db.ts` | Database operations |
| `lib/export-utils.ts` | Export to PDF/Excel/PPTX |
| `components/agent/ConversationHistory.tsx` | Sidebar component |
| `components/agent/ArtifactViewer.tsx` | Enhanced viewer |
| `app/api/agent/conversations/route.ts` | List/Create API |
| `app/api/agent/conversations/[id]/route.ts` | Get/Update/Delete API |
| `app/api/agent/conversations/[id]/messages/route.ts` | Messages API |
| `app/api/agent/cleanup/route.ts` | Cleanup cron API |

---

## 🎨 **Optional: Add Global CSS Enhancements**

Add to `frontend/app/globals.css`:

```css
/* Professional Agent Page Styles */
.agent-markdown {
  @apply text-sm leading-relaxed;
}

.agent-markdown h1,
.agent-markdown h2,
.agent-markdown h3 {
  @apply font-bold tracking-tight;
}

.agent-markdown pre {
  @apply bg-black/60 border border-white/10 rounded-xl overflow-x-auto;
}

.agent-markdown table {
  @apply border border-white/10 rounded-lg overflow-hidden;
}

.agent-markdown code {
  @apply font-mono text-xs;
}

/* Print styles for artifacts */
@media print {
  header,
  aside,
  .no-print {
    display: none !important;
  }
  
  main {
    width: 100% !important;
  }
}
```

---

**Need help?** The implementation is complete and ready to use. Just follow the steps above!
