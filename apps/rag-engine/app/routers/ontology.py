from fastapi import APIRouter, HTTPException
from app.services.graph_service import graph_service

router = APIRouter(prefix="/ontology", tags=["Medical Ontology Analytics"])

@router.get("/lineage/{root_code}")
def get_code_lineage(root_code: str):
    """
    Returns an expanded array of sub-codes and child diagnoses 
    matching our graph taxonomy parameters.
    """
    try:
        lineage_codes = graph_service.fetch_medical_lineage(root_code.upper())
        return {
            "requested_root": root_code.upper(),
            "expanded_nodes_count": len(lineage_codes),
            "matching_hierarchy_codes": lineage_codes
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))