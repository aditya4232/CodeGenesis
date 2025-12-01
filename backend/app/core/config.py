"""
MemoRAG ULTRA - Configuration Management
"""
from pathlib import Path
from typing import Optional, List
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
import yaml


class LMStudioConfig(BaseSettings):
    """LM Studio configuration"""
    base_url: str = "http://localhost:1234/v1"
    model_name: str = "phi-3-mini-4k-instruct"
    temperature: float = 0.7
    max_tokens: int = 2048
    timeout: int = 60


class EmbeddingsConfig(BaseSettings):
    """Embeddings configuration"""
    model_name: str = "sentence-transformers/all-MiniLM-L6-v2"
    device: str = "cpu"
    batch_size: int = 32


class VectorIndexConfig(BaseSettings):
    """Vector index configuration"""
    type: str = "faiss"
    dimension: int = 384
    index_type: str = "IndexFlatL2"
    nlist: int = 100


class KnowledgeGraphConfig(BaseSettings):
    """Knowledge graph configuration"""
    enable_temporal: bool = True
    confidence_threshold: float = 0.6
    max_hops: int = 3
    community_detection: bool = True


class RAGConfig(BaseSettings):
    """RAG configuration"""
    chunk_size: int = 512
    chunk_overlap: int = 50
    top_k_speed: int = 5
    top_k_deep: int = 10
    mode_selection_threshold: float = 0.7


class MemoryConfig(BaseSettings):
    """Continual learning configuration"""
    importance_decay: float = 0.95
    consolidation_interval: int = 100
    pruning_threshold: float = 0.1
    max_memory_items: int = 10000


class CacheConfig(BaseSettings):
    """Semantic cache configuration"""
    enable: bool = True
    redis_url: str = "redis://localhost:6379"
    similarity_threshold: float = 0.9
    ttl: int = 3600


class FactCheckingConfig(BaseSettings):
    """Fact-checking configuration"""
    enable: bool = True
    external_kb: dict = Field(default_factory=lambda: {
        "wikipedia": True,
        "pubmed": False,
        "arxiv": False
    })
    credibility_weight: float = 0.3


class ActiveLearningConfig(BaseSettings):
    """Active learning configuration"""
    enable: bool = True
    suggestion_count: int = 5
    uncertainty_threshold: float = 0.5


class MonitoringConfig(BaseSettings):
    """Monitoring configuration"""
    enable: bool = True
    metrics_interval: int = 60
    anomaly_detection: bool = True


class MultiModalConfig(BaseSettings):
    """Multi-modal configuration"""
    ocr: dict = Field(default_factory=lambda: {
        "engine": "tesseract",
        "languages": ["eng"]
    })
    audio: dict = Field(default_factory=lambda: {
        "model": "openai/whisper-base",
        "device": "cpu"
    })
    vision: dict = Field(default_factory=lambda: {"enable": True})


class DatabaseConfig(BaseSettings):
    """Database configuration"""
    type: str = "sqlite"
    path: str = "data/memorag.db"
    pool_size: int = 10


class PathsConfig(BaseSettings):
    """Storage paths configuration"""
    documents: str = "data/documents"
    indexes: str = "data/indexes"
    cache: str = "data/cache"
    logs: str = "data/logs"


class LimitsConfig(BaseSettings):
    """Resource limits configuration"""
    max_document_size_mb: int = 50
    max_documents: int = 10000
    max_concurrent_queries: int = 10
    memory_limit_gb: int = 6


class APIConfig(BaseSettings):
    """API configuration"""
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: List[str] = Field(default_factory=lambda: [
        "http://localhost:5173",
        "http://localhost:3000"
    ])
    rate_limit: int = 100


class LoggingConfig(BaseSettings):
    """Logging configuration"""
    level: str = "INFO"
    format: str = "json"
    file: str = "data/logs/memorag.log"


class FeaturesConfig(BaseSettings):
    """Feature flags"""
    enable_agents: bool = True
    enable_self_healing: bool = True
    enable_collaboration: bool = False
    enable_gpu: bool = False


class Config(BaseSettings):
    """Main configuration class"""
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )
    
    lm_studio: LMStudioConfig = Field(default_factory=LMStudioConfig)
    embeddings: EmbeddingsConfig = Field(default_factory=EmbeddingsConfig)
    vector_index: VectorIndexConfig = Field(default_factory=VectorIndexConfig)
    knowledge_graph: KnowledgeGraphConfig = Field(default_factory=KnowledgeGraphConfig)
    rag: RAGConfig = Field(default_factory=RAGConfig)
    memory: MemoryConfig = Field(default_factory=MemoryConfig)
    cache: CacheConfig = Field(default_factory=CacheConfig)
    fact_checking: FactCheckingConfig = Field(default_factory=FactCheckingConfig)
    active_learning: ActiveLearningConfig = Field(default_factory=ActiveLearningConfig)
    monitoring: MonitoringConfig = Field(default_factory=MonitoringConfig)
    multimodal: MultiModalConfig = Field(default_factory=MultiModalConfig)
    database: DatabaseConfig = Field(default_factory=DatabaseConfig)
    paths: PathsConfig = Field(default_factory=PathsConfig)
    limits: LimitsConfig = Field(default_factory=LimitsConfig)
    api: APIConfig = Field(default_factory=APIConfig)
    logging: LoggingConfig = Field(default_factory=LoggingConfig)
    features: FeaturesConfig = Field(default_factory=FeaturesConfig)
    
    @classmethod
    def load_from_yaml(cls, config_path: str = "config/config.yaml") -> "Config":
        """Load configuration from YAML file"""
        config_file = Path(config_path)
        
        if not config_file.exists():
            # Try example config
            config_file = Path("config/config.example.yaml")
            if not config_file.exists():
                print("Warning: No config file found, using defaults")
                return cls()
        
        with open(config_file, 'r') as f:
            config_data = yaml.safe_load(f)
        
        return cls(**config_data)
    
    def ensure_directories(self):
        """Create necessary directories"""
        for path in [
            self.paths.documents,
            self.paths.indexes,
            self.paths.cache,
            self.paths.logs
        ]:
            Path(path).mkdir(parents=True, exist_ok=True)


# Global config instance
_config: Optional[Config] = None


def get_config() -> Config:
    """Get global configuration instance"""
    global _config
    if _config is None:
        _config = Config.load_from_yaml()
        _config.ensure_directories()
    return _config


def reload_config():
    """Reload configuration"""
    global _config
    _config = None
    return get_config()
