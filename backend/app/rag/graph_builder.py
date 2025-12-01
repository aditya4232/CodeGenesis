"""
MemoRAG ULTRA - Knowledge Graph Builder
Extract entities and relations to build temporal knowledge graph
"""
import uuid
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
import logging
import networkx as nx

from app.core.lm_studio_client import get_lm_studio_client
from app.db import get_db

logger = logging.getLogger(__name__)


class KnowledgeGraphBuilder:
    """Build and maintain temporal knowledge graph"""
    
    def __init__(self):
        self.llm_client = get_lm_studio_client()
        self.db = get_db()
        self.graph = nx.DiGraph()  # Directed graph
        self._load_graph()
    
    def _load_graph(self):
        """Load existing graph from database"""
        try:
            # Load entities
            entities = self.db.execute_query("SELECT * FROM entities")
            for entity in entities:
                self.graph.add_node(
                    entity['entity_id'],
                    name=entity['name'],
                    entity_type=entity['entity_type'],
                    importance=entity['importance_score']
                )
            
            # Load relations
            relations = self.db.execute_query("SELECT * FROM relations")
            for relation in relations:
                self.graph.add_edge(
                    relation['source_entity_id'],
                    relation['target_entity_id'],
                    relation_type=relation['relation_type'],
                    confidence=relation['confidence']
                )
            
            logger.info(f"Loaded graph: {self.graph.number_of_nodes()} nodes, {self.graph.number_of_edges()} edges")
            
        except Exception as e:
            logger.warning(f"Could not load graph: {e}")
    
    async def extract_and_add(
        self,
        text: str,
        doc_id: str,
        chunk_id: str
    ) -> Tuple[int, int]:
        """
        Extract entities and relations from text and add to graph
        
        Args:
            text: Input text
            doc_id: Document ID
            chunk_id: Chunk ID
            
        Returns:
            Tuple of (entities_added, relations_added)
        """
        # Extract using LLM
        extraction = await self.llm_client.extract_entities(text)
        
        entities_added = 0
        relations_added = 0
        
        # Add entities
        entity_map = {}  # name -> entity_id
        for entity_data in extraction.get('entities', []):
            entity_id = await self._add_entity(
                name=entity_data['name'],
                entity_type=entity_data.get('type', 'unknown'),
                chunk_id=chunk_id
            )
            entity_map[entity_data['name']] = entity_id
            entities_added += 1
        
        # Add relations
        for relation_data in extraction.get('relations', []):
            source_name = relation_data.get('source')
            target_name = relation_data.get('target')
            relation_type = relation_data.get('relation', 'related_to')
            
            if source_name in entity_map and target_name in entity_map:
                await self._add_relation(
                    source_id=entity_map[source_name],
                    target_id=entity_map[target_name],
                    relation_type=relation_type,
                    doc_id=doc_id,
                    chunk_id=chunk_id
                )
                relations_added += 1
        
        return entities_added, relations_added
    
    async def _add_entity(
        self,
        name: str,
        entity_type: str,
        chunk_id: str
    ) -> str:
        """Add or update entity"""
        # Check if entity exists
        existing = self.db.get_entity_by_name(name)
        
        if existing:
            entity_id = existing['entity_id']
            
            # Update access count
            self.db.execute_update(
                "UPDATE entities SET access_count = access_count + 1, last_accessed = CURRENT_TIMESTAMP WHERE entity_id = ?",
                (entity_id,)
            )
            
            # Add chunk association
            self.db.execute_update(
                "INSERT OR IGNORE INTO entity_chunks (entity_id, chunk_id) VALUES (?, ?)",
                (entity_id, chunk_id)
            )
        else:
            # Create new entity
            entity_id = str(uuid.uuid4())
            self.db.insert_entity({
                'entity_id': entity_id,
                'name': name,
                'entity_type': entity_type,
                'importance_score': 0.5
            })
            
            # Add chunk association
            self.db.execute_update(
                "INSERT INTO entity_chunks (entity_id, chunk_id) VALUES (?, ?)",
                (entity_id, chunk_id)
            )
            
            # Add to graph
            self.graph.add_node(
                entity_id,
                name=name,
                entity_type=entity_type,
                importance=0.5
            )
        
        return entity_id
    
    async def _add_relation(
        self,
        source_id: str,
        target_id: str,
        relation_type: str,
        doc_id: str,
        chunk_id: str,
        confidence: float = 0.7
    ) -> str:
        """Add relation between entities"""
        relation_id = str(uuid.uuid4())
        
        self.db.insert_relation({
            'relation_id': relation_id,
            'source_entity_id': source_id,
            'target_entity_id': target_id,
            'relation_type': relation_type,
            'confidence': confidence,
            'source_doc_id': doc_id,
            'source_chunk_id': chunk_id
        })
        
        # Add to graph
        self.graph.add_edge(
            source_id,
            target_id,
            relation_type=relation_type,
            confidence=confidence
        )
        
        return relation_id
    
    def find_paths(
        self,
        start_entity: str,
        end_entity: Optional[str] = None,
        max_hops: int = 3
    ) -> List[List[str]]:
        """
        Find paths in graph
        
        Args:
            start_entity: Starting entity name
            end_entity: Optional ending entity name
            max_hops: Maximum path length
            
        Returns:
            List of paths (each path is list of entity IDs)
        """
        # Find entity ID
        start_node = self.db.get_entity_by_name(start_entity)
        if not start_node:
            return []
        
        start_id = start_node['entity_id']
        
        if end_entity:
            # Find specific path
            end_node = self.db.get_entity_by_name(end_entity)
            if not end_node:
                return []
            
            end_id = end_node['entity_id']
            
            try:
                # Find all simple paths
                paths = list(nx.all_simple_paths(
                    self.graph,
                    start_id,
                    end_id,
                    cutoff=max_hops
                ))
                return paths[:10]  # Limit to 10 paths
            except nx.NetworkXNoPath:
                return []
        else:
            # Find neighbors within max_hops
            paths = []
            visited = {start_id}
            current_level = [start_id]
            
            for hop in range(max_hops):
                next_level = []
                for node in current_level:
                    for neighbor in self.graph.neighbors(node):
                        if neighbor not in visited:
                            visited.add(neighbor)
                            next_level.append(neighbor)
                            paths.append([start_id, neighbor])
                
                current_level = next_level
                if not current_level:
                    break
            
            return paths[:20]  # Limit results
    
    def get_neighbors(
        self,
        entity_name: str,
        relation_type: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Get neighboring entities
        
        Args:
            entity_name: Entity name
            relation_type: Optional relation type filter
            
        Returns:
            List of neighbor info dicts
        """
        entity = self.db.get_entity_by_name(entity_name)
        if not entity:
            return []
        
        entity_id = entity['entity_id']
        neighbors = []
        
        for neighbor_id in self.graph.neighbors(entity_id):
            edge_data = self.graph[entity_id][neighbor_id]
            
            if relation_type and edge_data.get('relation_type') != relation_type:
                continue
            
            neighbor_node = self.graph.nodes[neighbor_id]
            neighbors.append({
                'entity_id': neighbor_id,
                'name': neighbor_node.get('name'),
                'entity_type': neighbor_node.get('entity_type'),
                'relation_type': edge_data.get('relation_type'),
                'confidence': edge_data.get('confidence')
            })
        
        return neighbors
    
    def compute_centrality(self) -> Dict[str, float]:
        """Compute centrality scores for all nodes"""
        if self.graph.number_of_nodes() == 0:
            return {}
        
        try:
            centrality = nx.pagerank(self.graph)
            return centrality
        except:
            # Fallback to degree centrality
            return nx.degree_centrality(self.graph)
    
    def detect_communities(self) -> List[List[str]]:
        """Detect communities in graph"""
        if self.graph.number_of_nodes() < 2:
            return []
        
        try:
            # Convert to undirected for community detection
            undirected = self.graph.to_undirected()
            
            # Use Louvain method
            import community as community_louvain
            partition = community_louvain.best_partition(undirected)
            
            # Group by community
            communities = {}
            for node, comm_id in partition.items():
                if comm_id not in communities:
                    communities[comm_id] = []
                communities[comm_id].append(node)
            
            return list(communities.values())
            
        except Exception as e:
            logger.warning(f"Community detection failed: {e}")
            return []
    
    def get_stats(self) -> Dict[str, Any]:
        """Get graph statistics"""
        return {
            'nodes': self.graph.number_of_nodes(),
            'edges': self.graph.number_of_edges(),
            'density': nx.density(self.graph) if self.graph.number_of_nodes() > 0 else 0,
            'is_connected': nx.is_weakly_connected(self.graph) if self.graph.number_of_nodes() > 0 else False
        }


# Global knowledge graph instance
_knowledge_graph: Optional[KnowledgeGraphBuilder] = None


def get_knowledge_graph() -> KnowledgeGraphBuilder:
    """Get global knowledge graph instance"""
    global _knowledge_graph
    if _knowledge_graph is None:
        _knowledge_graph = KnowledgeGraphBuilder()
    return _knowledge_graph
