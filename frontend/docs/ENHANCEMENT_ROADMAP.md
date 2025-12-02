# 🚀 CodeGenesis Enhancement Roadmap

**Version**: Beta v0.45  
**Status**: Implementation Plan  
**Priority**: High

---

## ✅ Completed (Phase 1)

### 1. Remove Unrealistic Data
- ✅ Removed fake stats (10K+, 5K+, 99.9%)
- ✅ Replaced "Trusted by Developers Worldwide" with "Be an Early Adopter"
- ✅ Removed fake testimonials
- ✅ Updated CTA messaging
- ✅ Changed to authentic beta v0.45 messaging

### 2. Favicon & Branding
- ✅ Generated AI coding-style favicon
- 📝 TODO: Implement favicon in app
- 📝 TODO: Add to public folder
- 📝 TODO: Update metadata

---

## 🚧 In Progress (Phase 2)

### 3. Toast Notifications & Alerts
**Status**: Planning  
**Priority**: High

**Implementation**:
```tsx
// Install: npm install sonner
import { Toaster, toast } from 'sonner'

// Success toast
toast.success('Project created successfully!')

// Error toast
toast.error('Failed to save changes')

// Loading toast
toast.loading('Building your application...')

// Custom toast with action
toast('New feature available!', {
  action: {
    label: 'Learn More',
    onClick: () => router.push('/docs')
  }
})
```

**Files to Create**:
- `components/ui/toast.tsx` - Toast component
- `components/providers/toast-provider.tsx` - Toast provider
- Update `app/layout.tsx` - Add Toaster

---

### 4. Enhanced Settings Page
**Status**: Planning  
**Priority**: High

**Features to Add**:
1. **API Keys Management**
   - OpenAI API Key
   - Anthropic API Key
   - Image Generation API (DALL-E, Midjourney, Stable Diffusion)
   - Custom API endpoints

2. **User Preferences**
   - Default model selection
   - Code style preferences
   - Theme customization
   - Notification settings

3. **Data Management**
   - Export user data
   - Delete account
   - Data retention policy display
   - Auto-delete settings (30 days)

**File Structure**:
```
app/(dashboard)/settings/
├── page.tsx (main settings)
├── api-keys/page.tsx
├── preferences/page.tsx
├── data/page.tsx
└── components/
    ├── api-key-input.tsx
    ├── preference-toggle.tsx
    └── danger-zone.tsx
```

---

### 5. Image API Integration
**Status**: Planning  
**Priority**: High

**Supported Providers**:
1. **DALL-E 3** (OpenAI)
2. **Stable Diffusion** (Stability AI)
3. **Midjourney** (via API)
4. **Custom endpoints**

**Implementation**:
```typescript
// lib/image-api.ts
export interface ImageGenerationConfig {
  provider: 'dalle' | 'stable-diffusion' | 'midjourney' | 'custom';
  apiKey: string;
  model?: string;
  size?: string;
  quality?: string;
}

export async function generateImage(
  prompt: string,
  config: ImageGenerationConfig
): Promise<string> {
  // Implementation for each provider
}
```

**UI Components**:
- Image generation dialog
- Provider selection dropdown
- Size/quality options
- Generated image preview
- Download/insert options

---

### 6. MCP (Model Context Protocol) Support
**Status**: Planning  
**Priority**: Medium

**Features**:
1. **MCP Server Integration**
   - Connect to MCP servers
   - Browse available tools
   - Execute MCP tools
   - Cache tool results

2. **MCP Configuration**
   - Add/remove MCP servers
   - Configure authentication
   - Test connections
   - View server capabilities

**Implementation**:
```typescript
// lib/mcp-client.ts
export class MCPClient {
  async connect(serverUrl: string): Promise<void>
  async listTools(): Promise<Tool[]>
  async executeTool(toolName: string, params: any): Promise<any>
}
```

---

### 7. Image Upload in Chat
**Status**: Planning  
**Priority**: High

**Features**:
1. **Drag & Drop**
   - Drag images into chat
   - Visual upload indicator
   - Multiple file support

2. **Paste from Clipboard**
   - Ctrl+V to paste images
   - Screenshot support

3. **File Browser**
   - Click to browse
   - File type validation
   - Size limits

4. **Image Processing**
   - Resize for optimal upload
   - Format conversion
   - Compression

**Implementation**:
```tsx
// components/chat/image-upload.tsx
<div
  onDrop={handleDrop}
  onPaste={handlePaste}
  className="chat-input-container"
>
  <input
    type="file"
    accept="image/*"
    multiple
    onChange={handleFileSelect}
  />
  <ImagePreview images={uploadedImages} />
</div>
```

---

### 8. Data Retention Policy (30 Days)
**Status**: Planning  
**Priority**: High

**What to Keep**:
- ✅ User authentication data (permanent)
- ✅ Project code (permanent)
- ✅ Project metadata (permanent)

**What to Auto-Delete (30 days)**:
- ❌ Chat history
- ❌ Generated images
- ❌ Temporary files
- ❌ Build logs
- ❌ Error logs

**Implementation**:
```sql
-- Supabase Function
CREATE OR REPLACE FUNCTION delete_old_data()
RETURNS void AS $$
BEGIN
  -- Delete chat messages older than 30 days
  DELETE FROM chat_messages
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete generated images older than 30 days
  DELETE FROM generated_images
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  -- Delete build logs older than 30 days
  DELETE FROM build_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- Schedule daily cleanup
SELECT cron.schedule(
  'delete-old-data',
  '0 2 * * *', -- Run at 2 AM daily
  'SELECT delete_old_data();'
);
```

**Database Schema Updates**:
```sql
-- Add created_at to all tables
ALTER TABLE chat_messages ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE generated_images ADD COLUMN created_at TIMESTAMP DEFAULT NOW();
ALTER TABLE build_logs ADD COLUMN created_at TIMESTAMP DEFAULT NOW();

-- Add indexes for performance
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_generated_images_created_at ON generated_images(created_at);
CREATE INDEX idx_build_logs_created_at ON build_logs(created_at);
```

---

## 📋 Detailed Implementation Steps

### Phase 2A: Toast & Alerts (Week 1)

**Day 1-2**: Setup
- [ ] Install sonner: `npm install sonner`
- [ ] Create toast components
- [ ] Add toast provider to layout
- [ ] Create toast utilities

**Day 3-4**: Integration
- [ ] Add success toasts to all actions
- [ ] Add error toasts to all failures
- [ ] Add loading toasts to async operations
- [ ] Test across all pages

**Day 5**: Polish
- [ ] Custom toast styles
- [ ] Toast positioning
- [ ] Animation tweaks
- [ ] Documentation

---

### Phase 2B: Settings Enhancement (Week 2)

**Day 1-2**: API Keys
- [ ] Create API keys page
- [ ] Secure storage (encrypted)
- [ ] Validation & testing
- [ ] Provider selection UI

**Day 3-4**: Preferences
- [ ] User preferences schema
- [ ] Preference toggles
- [ ] Theme customization
- [ ] Save/load preferences

**Day 5**: Data Management
- [ ] Export functionality
- [ ] Delete account flow
- [ ] Data retention display
- [ ] Danger zone UI

---

### Phase 2C: Image Features (Week 3)

**Day 1-2**: Image API
- [ ] DALL-E integration
- [ ] Stable Diffusion integration
- [ ] API abstraction layer
- [ ] Error handling

**Day 3-4**: Image Upload
- [ ] Drag & drop implementation
- [ ] Paste support
- [ ] File browser
- [ ] Image preview

**Day 5**: Integration
- [ ] Chat integration
- [ ] Project integration
- [ ] Storage setup
- [ ] Testing

---

### Phase 2D: MCP & Data Retention (Week 4)

**Day 1-2**: MCP Support
- [ ] MCP client implementation
- [ ] Server connection UI
- [ ] Tool execution
- [ ] Testing

**Day 3-4**: Data Retention
- [ ] Database schema updates
- [ ] Cleanup function
- [ ] Cron job setup
- [ ] User notifications

**Day 5**: Testing & Documentation
- [ ] End-to-end testing
- [ ] Performance testing
- [ ] Documentation
- [ ] Deployment

---

## 🗂️ File Structure (After Implementation)

```
frontend/
├── app/
│   ├── (dashboard)/
│   │   ├── settings/
│   │   │   ├── page.tsx
│   │   │   ├── api-keys/page.tsx
│   │   │   ├── preferences/page.tsx
│   │   │   └── data/page.tsx
│   │   └── chat/
│   │       └── components/
│   │           ├── image-upload.tsx
│   │           └── message-input.tsx
│   └── api/
│       ├── images/
│       │   └── generate/route.ts
│       └── mcp/
│           └── execute/route.ts
├── components/
│   ├── ui/
│   │   └── toast.tsx
│   ├── providers/
│   │   └── toast-provider.tsx
│   └── settings/
│       ├── api-key-input.tsx
│       ├── preference-toggle.tsx
│       └── danger-zone.tsx
├── lib/
│   ├── image-api.ts
│   ├── mcp-client.ts
│   └── data-retention.ts
└── public/
    ├── favicon.ico
    ├── favicon-16x16.png
    ├── favicon-32x32.png
    └── apple-touch-icon.png
```

---

## 🎯 Success Criteria

### Toast & Alerts
- [ ] All user actions show feedback
- [ ] Error messages are clear
- [ ] Loading states are visible
- [ ] Toasts are dismissible

### Settings
- [ ] API keys are securely stored
- [ ] All preferences are saved
- [ ] Data export works
- [ ] Account deletion works

### Image Features
- [ ] Images generate successfully
- [ ] Upload works in chat
- [ ] Images are stored properly
- [ ] Preview works correctly

### MCP Support
- [ ] Can connect to MCP servers
- [ ] Tools execute successfully
- [ ] Results are displayed
- [ ] Errors are handled

### Data Retention
- [ ] Old data is deleted automatically
- [ ] User data is preserved
- [ ] Notifications are sent
- [ ] Policy is documented

---

## 📊 Progress Tracking

| Feature | Status | Priority | ETA |
|---------|--------|----------|-----|
| Remove Unrealistic Data | ✅ Complete | High | Done |
| Favicon | ✅ Generated | High | Day 1 |
| Toast System | 📝 Planned | High | Week 1 |
| Settings Enhancement | 📝 Planned | High | Week 2 |
| Image API | 📝 Planned | High | Week 3 |
| Image Upload | 📝 Planned | High | Week 3 |
| MCP Support | 📝 Planned | Medium | Week 4 |
| Data Retention | 📝 Planned | High | Week 4 |

---

## 🚀 Next Immediate Steps

1. **Implement Favicon** (Today)
   - Add generated favicon to public folder
   - Update metadata in layout.tsx
   - Test across browsers

2. **Install Toast Library** (Today)
   - `npm install sonner`
   - Set up toast provider
   - Create first toast example

3. **Plan Settings Page** (Tomorrow)
   - Design UI mockup
   - Plan database schema
   - Create component structure

---

## 📝 Notes

- All features should maintain the authentic beta messaging
- Security is paramount for API key storage
- User privacy must be respected in data retention
- Performance should not degrade with new features
- Mobile responsiveness is required for all new UI

---

**Status**: Ready to implement Phase 2  
**Next Review**: After Week 1 completion  
**Team**: Open for contributions

🚀 **Let's build the future of AI-powered development!**
