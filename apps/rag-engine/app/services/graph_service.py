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
            
graph_service = Neo4jGraphService()
