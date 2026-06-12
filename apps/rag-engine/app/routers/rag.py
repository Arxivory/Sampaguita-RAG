from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from app.services.processor_service import text_processor
from app.services.graph_service import graph_service
from app.services.entity_linker import entity_linker
from app.services.llm_service import clinical_llm

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

class InferenceExecutionRequest(BaseModel):
    query: str
    retrieved_chunks: List[str]
    metadata_codes: List[str]

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
            detected_codes = entity_linker.extract_and_link(chunk)

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

class ContextSummaryRequest(BaseModel):
    query: str
    retrieved_chunks: List[str]
    metadata_codes: List[str]

@router.post("/generate-context-prompt")
def generate_context_prompt(payload: ContextSummaryRequest):
    """
    Assembles a clinical context block, augmenting the user's query with 
    retrieved chart fragments and verified graph taxonomy codes.
    """
    if not payload.retrieved_chunks:
        raise HTTPException(status_code=400, detail="No historical chart chunks provided for context generation.")

    compiled_context = "\n\n".join(
        [f"[Fragment #{i+1}]: {chunk}" for i, chunk in enumerate(payload.retrieved_chunks)]
    )

    taxonomy_string = ", ".join(payload.metadata_codes) if payload.metadata_codes else "None Detected"

    system_prompt = (
        "You are an advanced medical analysis AI assisting an epidemiologist and Municipal Health Officer.\n"
        "Your objective is to answer clinical inquiries using ONLY the verified historical chart fragments "
        "and diagnostic taxonomies provided below. Do not extrapolate, hallucinate, or assume details.\n"
        "If the provided context does not contain enough evidence to answer the query, state explicitly that "
        "historical clinical logs are insufficient.\n\n"
        f"Verified ICD-10 Lineage Context: {taxonomy_string}\n"
        f"Extracted Narrative Context:\n{compiled_context}"
    )

    return {
        "target_query": payload.query,
        "system_prompt": system_prompt,
        "user_prompt": f"Based on the clinical histories provided above, please answer this request: {payload.query}"
    }

@router.post("/execute-inference")
def execute_rag_inference(payload: InferenceExecutionRequest):
    """
    Assembles clinical context parameters and executes live LLM generation 
    via Gemini to return a fully synthesis-grounded diagnostic summary.
    """
    if not payload.retrieved_chunks:
        raise HTTPException(status_code=400, detail="No historical chart chunks provided.")

    compiled_context = "\n\n".join(
        [f"[Fragment #{i+1}]: {chunk}" for i, chunk in enumerate(payload.retrieved_chunks)]
    )
    taxonomy_string = ", ".join(payload.metadata_codes) if payload.metadata_codes else "None Detected"

    system_prompt = (
        "You are an advanced medical analysis AI assisting an epidemiologist and Municipal Health Officer.\n"
        "Your objective is to answer clinical inquiries using ONLY the verified historical chart fragments "
        "and diagnostic taxonomies provided below. Do not extrapolate, hallucinate, or assume details.\n"
        "Maintain a highly objective, professional clinical tone. Cite your source fragments where relevant.\n"
        "If the provided context does not contain enough evidence to answer the query, state explicitly that "
        "historical clinical logs are insufficient.\n\n"
        f"Verified ICD-10 Lineage Context: {taxonomy_string}\n"
        f"Extracted Narrative Context:\n{compiled_context}"
    )

    user_prompt = f"Based on the clinical histories provided above, please answer this request: {payload.query}"

    generated_answer = clinical_llm.execute_grounded_generation(
        system_prompt=system_prompt,
        user_prompt=user_prompt
    )

    return {
        "query": payload.query,
        "taxonomy_codes_used": payload.metadata_codes,
        "answer": generated_answer
    }

@router.delete("/purge/{document_id}")
def purge_document_graph_data(document_id: str):
    """
    Coordinates lifecycle deletion triggers to clear orphaned clinical graph vectors.
    """
    try:
        purge_summary = graph_service.purge_document_nodes(document_id=document_id)
        return {
            "success": True,
            "message": f"Graph nodes mapped to document {document_id} cleared successfully.",
            "details": purge_summary
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Failed to execute Neo4j graph dependency cleanup: {str(e)}"
        )