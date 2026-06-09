from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.processor_service import text_processor
from app.services.graph_service import graph_service

router = APIRouter(prefix="/rag", tags=["RAG Processing Core"])

class IngestionRequest(BaseModel):
    text: str
    chunk_size: int = 500
    chunk_overlap: int = 100

class ChunkPayload(BaseModel):
    chunk_content: str
    embedding: List[float]
    mapped_ontology_ids: List[str]

class IngestionResponse(BaseModel):
    chunks_processed: int
    payloads: List[ChunkPayload]

@router.post("/process-document", response_model=IngestionResponse)
def process_document(payload: IngestionRequest):
    """
    Chunks a document narrative, extracts clinical ontology linkages via Neo4j,
    and converts text segments into vector representations.
    """
    try:
        raw_chunks = text_processor.chunk_text(
            text=payload.text, 
            chunk_size=payload.chunk_size, 
            chunk_overlap=payload.chunk_overlap
        )
        
        if not raw_chunks:
            raise HTTPException(status_code=400, detail="Text processing resulted in empty segments.")

        embeddings = text_processor.generate_embeddings(raw_chunks)
        
        compiled_payloads = []
        for i, chunk in enumerate(raw_chunks):
            detected_codes = []
            
            if "heart" in chunk.lower() or "infarction" in chunk.lower() or "chest pain" in chunk.lower():
                detected_codes = graph_service.fetch_medical_lineage("I21")
            elif "pneumonia" in chunk.lower():
                detected_codes = graph_service.fetch_medical_lineage("J12-J18")
            elif "tuberculosis" in chunk.lower() or "tb" in chunk.lower():
                detected_codes = graph_service.fetch_medical_lineage("A15-A19")

            compiled_payloads.append(ChunkPayload(
                chunk_content=chunk,
                embedding=embeddings[i],
                mapped_ontology_ids=detected_codes
            ))

        return IngestionResponse(
            chunks_processed=len(compiled_payloads),
            payloads=compiled_payloads
        )

    except Exception as e:
        print(f"RAG Processing Pipeline Abort: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal AI processing failure: {str(e)}")

class SearchRequest(BaseModel):
    query: str
    limit: int = 5

@router.post("/vector-search-proxy")
def generate_query_vector(payload: SearchRequest):
    """
    Converts a clinician's free-text natural language search query into 
    its structural vector representation to enable vector similarity search.
    """
    try:
        query_vector = text_processor.generate_embeddings([payload.query])[0]
        
        return {
            "query": payload.query,
            "vector_dimension": len(query_vector),
            "embedding": query_vector
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to vectorize search string: {str(e)}")