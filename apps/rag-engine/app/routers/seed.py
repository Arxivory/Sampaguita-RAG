# for testing only - seeds a small set of clinical concepts and relationships into 
# Neo4j AuraDB Cloud for development and demonstration purposes. 
# This is not intended for production use or comprehensive ontology management.

from fastapi import APIRouter, HTTPException
from app.services.graph_service import graph_service

router = APIRouter(prefix="/seed", tags=["Database Initialization Tools"])

@router.post("/ontology")
def seed_clinical_ontology():
    """
    Populates Neo4j AuraDB with a baseline clinical hierarchy of ICD-10 nodes
    and directional parent-child relationships.
    """
    if not graph_service.driver:
        raise HTTPException(status_code=500, detail="Neo4j driver is not active.")

    concepts = [
        {"code": "I00-I99", "name": "Diseases of the Circulatory System"},
        {"code": "J00-J99", "name": "Diseases of the Respiratory System"},
        
        {"code": "I20-I25", "name": "Ischemic Heart Disease", "parent": "I00-I99"},
        {"code": "I21", "name": "Acute Myocardial Infarction", "parent": "I20-I25"},
        {"code": "I21.9", "name": "Acute Myocardial Infarction, Unspecified", "parent": "I21"},
        
        {"code": "J12-J18", "name": "Pneumonia", "parent": "J00-J99"},
        {"code": "J18.9", "name": "Pneumonia, Unspecified Organism", "parent": "J12-J18"},
        {"code": "A15-A19", "name": "Tuberculosis", "parent": "J00-J99"},
        {"code": "A15.0", "name": "Tuberculosis of Lung", "parent": "A15-A19"}
    ]

    create_node_query = """
    MERGE (c:MedicalConcept {code: $code})
    ON CREATE SET c.name = $name
    """
    
    create_relationship_query = """
    MATCH (child:MedicalConcept {code: $child_code})
    MATCH (parent:MedicalConcept {code: $parent_code})
    MERGE (child)-[:IS_A]->(parent)
    """

    with graph_service.driver.session() as session:
        try:
            for concept in concepts:
                session.run(create_node_query, code=concept["code"], name=concept["name"])
            
            for concept in concepts:
                if "parent" in concept:
                    session.run(
                        create_relationship_query, 
                        child_code=concept["code"], 
                        parent_code=concept["parent"]
                    )
                    
            return {
                "status": "success",
                "message": f"Successfully seeded {len(concepts)} clinical nodes into AuraDB Cloud.",
                "hierarchy_scope": "Circulatory & Respiratory Systems (PhilHealth Compliant)"
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Graph seeding failed: {str(e)}")