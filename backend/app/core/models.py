"""
MemoRAG ULTRA - Pydantic Models for Request/Response Validation
"""
from datetime import datetime
from typing import List, Optional, Dict, Any
from enum import Enum
from pydantic import BaseModel, Field


class QueryMode(str, Enum):
    """Query processing mode"""
    AUTO = "auto"
    SPEED = "speed"
    DEEP = "deep"


class DocumentType(str, Enum):
    """Document type"""
    PDF = "pdf"
    TEXT = "text"
    MARKDOWN = "markdown"
    DOCX = "docx"
    IMAGE = "image"
    AUDIO = "audio"
    VIDEO = "video"
    URL = "url"


class ProcessingStatus(str, Enum):
    """Document processing status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


# ============================================================================
# Request Models
# ============================================================================

class IngestRequest(BaseModel):
    """Document ingestion request"""
    file_path: Optional[str] = None
    url: Optional[str] = None
    content: Optional[str] = None
    doc_type: DocumentType
    title: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)


class QueryRequest(BaseModel):
    """Query request"""
    question: str = Field(..., min_length=1, max_length=1000)
    mode: QueryMode = QueryMode.AUTO
    top_k: Optional[int] = None
    include_provenance: bool = True
    include_reasoning: bool = True
    session_id: Optional[str] = None


class ConsolidationRequest(BaseModel):
    """Memory consolidation request"""
    force: bool = False
    prune_threshold: Optional[float] = None


# ============================================================================
# Response Models
# ============================================================================

class DocumentInfo(BaseModel):
    """Document information"""
    doc_id: str
    title: str
    doc_type: DocumentType
    size_bytes: int
    status: ProcessingStatus
    created_at: datetime
    updated_at: datetime
    tags: List[str]
    chunk_count: Optional[int] = None
    entity_count: Optional[int] = None


class IngestResponse(BaseModel):
    """Document ingestion response"""
    doc_id: str
    status: ProcessingStatus
    message: str
    chunks_created: Optional[int] = None
    entities_extracted: Optional[int] = None
    processing_time_ms: Optional[float] = None


class ChunkInfo(BaseModel):
    """Chunk information for provenance"""
    chunk_id: str
    doc_id: str
    doc_title: str
    content: str
    score: float
    page_number: Optional[int] = None
    timestamp: Optional[datetime] = None


class GraphPath(BaseModel):
    """Graph traversal path"""
    entities: List[str]
    relations: List[str]
    confidence: float


class ProvenanceInfo(BaseModel):
    """Provenance information"""
    chunks: List[ChunkInfo]
    graph_paths: List[GraphPath] = Field(default_factory=list)
    documents_used: List[str]
    retrieval_mode: QueryMode
    total_sources: int


class ReasoningStep(BaseModel):
    """Reasoning step"""
    agent: str
    action: str
    result: str
    confidence: Optional[float] = None
    timestamp: datetime


class QueryResponse(BaseModel):
    """Query response"""
    answer: str
    confidence: float = Field(..., ge=0.0, le=1.0)
    mode_used: QueryMode
    provenance: Optional[ProvenanceInfo] = None
    reasoning_steps: List[ReasoningStep] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    processing_time_ms: float
    cached: bool = False
    hallucination_score: Optional[float] = None
    fact_check_results: Optional[Dict[str, Any]] = None


class TimelineEvent(BaseModel):
    """Knowledge timeline event"""
    timestamp: datetime
    event_type: str  # "ingestion", "update", "conflict", "consolidation"
    description: str
    doc_ids: List[str]
    entity_count: Optional[int] = None
    importance: float


class ConflictInfo(BaseModel):
    """Conflict information"""
    conflict_id: str
    entity: str
    claim1: str
    claim2: str
    doc1_id: str
    doc2_id: str
    confidence1: float
    confidence2: float
    detected_at: datetime
    resolved: bool


class SystemMetrics(BaseModel):
    """System metrics"""
    queries_total: int
    queries_per_minute: float
    avg_latency_ms: float
    cache_hit_rate: float
    memory_usage_mb: float
    document_count: int
    chunk_count: int
    entity_count: int
    relation_count: int
    uptime_seconds: float


class SelfHealingEvent(BaseModel):
    """Self-healing event"""
    event_id: str
    timestamp: datetime
    event_type: str
    description: str
    action_taken: str
    success: bool


class SystemStatus(BaseModel):
    """System status response"""
    status: str  # "healthy", "degraded", "error"
    metrics: SystemMetrics
    recent_conflicts: List[ConflictInfo]
    recent_healing_events: List[SelfHealingEvent]
    lm_studio_connected: bool
    redis_connected: bool


class KnowledgeTimeline(BaseModel):
    """Knowledge timeline response"""
    events: List[TimelineEvent]
    total_events: int
    date_range: Dict[str, datetime]


# ============================================================================
# Evaluation Models
# ============================================================================

class RAGASMetrics(BaseModel):
    """RAGAS evaluation metrics"""
    context_relevance: float
    answer_faithfulness: float
    answer_relevance: float
    context_recall: float
    overall_score: float


class HallucinationDetection(BaseModel):
    """Hallucination detection result"""
    hallucination_score: float = Field(..., ge=0.0, le=1.0)
    claims_verified: int
    claims_supported: int
    claims_contradicted: int
    claims_uncertain: int
    details: List[Dict[str, Any]]


class EvaluationReport(BaseModel):
    """Evaluation report"""
    query: str
    answer: str
    ragas_metrics: RAGASMetrics
    hallucination_detection: HallucinationDetection
    processing_time_ms: float
    timestamp: datetime


# ============================================================================
# Agent Models
# ============================================================================

class AgentDecision(BaseModel):
    """Agent decision"""
    agent_name: str
    decision: str
    confidence: float
    reasoning: str
    timestamp: datetime


class AgentWorkflow(BaseModel):
    """Agent workflow state"""
    query: str
    current_agent: str
    decisions: List[AgentDecision]
    status: str  # "planning", "retrieving", "critiquing", "verifying", "teaching"
    result: Optional[str] = None
