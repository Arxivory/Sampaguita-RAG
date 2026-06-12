import os
from typing import List, Dict, Any
from neo4j import GraphDatabase, Driver

class Neo4jGraphService:
    def __init__(self):
        self.uri = os.getenv("NEO4J_URI")
        self.user = os.getenv("NEO4J_USER")
        self.password = os.getenv("NEO4J_PASSWORD")
        self.driver: Driver | None = None

    def connect(self):
        """Initializes the official binary Bolt protocol connection pool to AuraDB Cloud."""
        if not self.uri or not self.user or not self.password:
            raise ValueError("Neo4j connection details are not fully set in environment variables.")
        
        try:
            self.driver = GraphDatabase.driver(self.uri, auth=(self.user, self.password))
            self.driver.verify_connectivity()
            print("Successfully connected to Neo4j database.")
        except Exception as e:
            print(f"Failed to connect to Neo4j database: {e}")
            raise e
        
    def close(self):
        """Cleanly releases the socket connection pools."""
        if self.driver:
            self.driver.close()
            print("Neo4j connection closed.")

    def fetch_medical_lineage(self, root_code: str) -> List[str]:
        """
        Executes a recursive hierarchical traversal to find all children or variations 
        underneath a parent medical classification node (e.g., Ischemic Heart Disease -> MI).
        """
        if not self.driver:
            raise RuntimeError("Database driver is not active. Call connect() first.")

        cypher_query = """
        MATCH (root:MedicalConcept {code: $target_code})
        MATCH (root)<-[:IS_A*0..]-(child:MedicalConcept)
        RETURN child.code AS child_code
        """

        with self.driver.session() as session:
            try:
                result = session.run(cypher_query, target_code=root_code)
                return [record["child_code"] for record in result]
            except Exception as e:
                print(f"Error executing Cypher query: {e}")
                return [root_code]

    def purge_document_nodes(self, document_id: str) -> dict:
        """
        Locates all dynamic extraction nodes tied to a unique document_id,
        safely detaches their structural relationships, and purges them from the graph.
        """
        if not self.driver:
            raise Exception("Neo4j database driver is uninitialized.")

        query = """
        MATCH (n {document_id: $document_id})
        DETACH DELETE n
        RETURN count(n) as deleted_count
        """
        
        with self.driver.session() as session:
            result = session.run(query, document_id=document_id)
            record = result.single()
            return {
                "document_id": document_id,
                "nodes_purged": record["deleted_count"] if record else 0
            }
            
graph_service = Neo4jGraphService()
