-- MemoRAG ULTRA Database Schema
-- SQLite database for documents, chunks, entities, relations, and provenance

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    doc_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    doc_type TEXT NOT NULL,
    file_path TEXT,
    url TEXT,
    size_bytes INTEGER,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    tags JSON
);

CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at);

-- Chunks table
CREATE TABLE IF NOT EXISTS chunks (
    chunk_id TEXT PRIMARY KEY,
    doc_id TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding BLOB,  -- Serialized numpy array
    chunk_index INTEGER,
    page_number INTEGER,
    start_char INTEGER,
    end_char INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (doc_id) REFERENCES documents(doc_id) ON DELETE CASCADE
);

CREATE INDEX idx_chunks_doc_id ON chunks(doc_id);
CREATE INDEX idx_chunks_chunk_index ON chunks(chunk_index);

-- Entities table (Knowledge Graph nodes)
CREATE TABLE IF NOT EXISTS entities (
    entity_id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    entity_type TEXT,
    description TEXT,
    importance_score REAL DEFAULT 0.5,
    access_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

CREATE INDEX idx_entities_name ON entities(name);
CREATE INDEX idx_entities_type ON entities(entity_type);
CREATE INDEX idx_entities_importance ON entities(importance_score DESC);

-- Relations table (Knowledge Graph edges)
CREATE TABLE IF NOT EXISTS relations (
    relation_id TEXT PRIMARY KEY,
    source_entity_id TEXT NOT NULL,
    target_entity_id TEXT NOT NULL,
    relation_type TEXT NOT NULL,
    confidence REAL DEFAULT 0.5,
    source_doc_id TEXT,
    source_chunk_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON,
    FOREIGN KEY (source_entity_id) REFERENCES entities(entity_id) ON DELETE CASCADE,
    FOREIGN KEY (target_entity_id) REFERENCES entities(entity_id) ON DELETE CASCADE,
    FOREIGN KEY (source_doc_id) REFERENCES documents(doc_id) ON DELETE SET NULL,
    FOREIGN KEY (source_chunk_id) REFERENCES chunks(chunk_id) ON DELETE SET NULL
);

CREATE INDEX idx_relations_source ON relations(source_entity_id);
CREATE INDEX idx_relations_target ON relations(target_entity_id);
CREATE INDEX idx_relations_type ON relations(relation_type);

-- Entity-Chunk associations
CREATE TABLE IF NOT EXISTS entity_chunks (
    entity_id TEXT NOT NULL,
    chunk_id TEXT NOT NULL,
    mention_count INTEGER DEFAULT 1,
    PRIMARY KEY (entity_id, chunk_id),
    FOREIGN KEY (entity_id) REFERENCES entities(entity_id) ON DELETE CASCADE,
    FOREIGN KEY (chunk_id) REFERENCES chunks(chunk_id) ON DELETE CASCADE
);

-- Provenance logs
CREATE TABLE IF NOT EXISTS provenance_logs (
    log_id TEXT PRIMARY KEY,
    query TEXT NOT NULL,
    answer TEXT NOT NULL,
    mode_used TEXT NOT NULL,
    confidence REAL,
    chunks_used JSON,  -- List of chunk_ids
    entities_used JSON,  -- List of entity_ids
    graph_paths JSON,  -- Graph traversal paths
    processing_time_ms REAL,
    cached BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    session_id TEXT,
    user_feedback INTEGER  -- -1, 0, 1 for thumbs down/neutral/up
);

CREATE INDEX idx_provenance_created_at ON provenance_logs(created_at);
CREATE INDEX idx_provenance_session ON provenance_logs(session_id);

-- Importance scores tracking
CREATE TABLE IF NOT EXISTS importance_tracking (
    item_id TEXT PRIMARY KEY,  -- entity_id or chunk_id
    item_type TEXT NOT NULL,  -- 'entity' or 'chunk'
    recency_score REAL DEFAULT 0.5,
    frequency_score REAL DEFAULT 0.5,
    centrality_score REAL DEFAULT 0.5,
    feedback_score REAL DEFAULT 0.5,
    combined_score REAL DEFAULT 0.5,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_importance_type ON importance_tracking(item_type);
CREATE INDEX idx_importance_score ON importance_tracking(combined_score DESC);

-- Conflicts table
CREATE TABLE IF NOT EXISTS conflicts (
    conflict_id TEXT PRIMARY KEY,
    entity_id TEXT,
    claim1 TEXT NOT NULL,
    claim2 TEXT NOT NULL,
    doc1_id TEXT NOT NULL,
    doc2_id TEXT NOT NULL,
    confidence1 REAL,
    confidence2 REAL,
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    resolution TEXT,
    FOREIGN KEY (entity_id) REFERENCES entities(entity_id) ON DELETE SET NULL,
    FOREIGN KEY (doc1_id) REFERENCES documents(doc_id) ON DELETE CASCADE,
    FOREIGN KEY (doc2_id) REFERENCES documents(doc_id) ON DELETE CASCADE
);

CREATE INDEX idx_conflicts_resolved ON conflicts(resolved);
CREATE INDEX idx_conflicts_detected_at ON conflicts(detected_at);

-- Self-healing events
CREATE TABLE IF NOT EXISTS healing_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    description TEXT,
    action_taken TEXT,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

CREATE INDEX idx_healing_created_at ON healing_events(created_at);

-- System metrics (time-series)
CREATE TABLE IF NOT EXISTS metrics (
    metric_id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_name TEXT NOT NULL,
    metric_value REAL NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

CREATE INDEX idx_metrics_name ON metrics(metric_name);
CREATE INDEX idx_metrics_timestamp ON metrics(timestamp);

-- Query cache metadata (actual cache in Redis)
CREATE TABLE IF NOT EXISTS query_cache_metadata (
    cache_key TEXT PRIMARY KEY,
    query TEXT NOT NULL,
    query_embedding BLOB,
    hit_count INTEGER DEFAULT 0,
    last_hit TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ttl INTEGER DEFAULT 3600
);

CREATE INDEX idx_cache_created_at ON query_cache_metadata(created_at);

-- Consolidation history
CREATE TABLE IF NOT EXISTS consolidation_history (
    consolidation_id TEXT PRIMARY KEY,
    items_processed INTEGER,
    items_pruned INTEGER,
    duration_ms REAL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

-- External KB cache (Wikipedia, PubMed, etc.)
CREATE TABLE IF NOT EXISTS external_kb_cache (
    cache_id TEXT PRIMARY KEY,
    kb_source TEXT NOT NULL,  -- 'wikipedia', 'pubmed', 'arxiv'
    query TEXT NOT NULL,
    result JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_external_kb_source ON external_kb_cache(kb_source);
CREATE INDEX idx_external_kb_expires ON external_kb_cache(expires_at);

-- User sessions (for multi-user support)
CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    user_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSON
);

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_last_active ON sessions(last_active);
