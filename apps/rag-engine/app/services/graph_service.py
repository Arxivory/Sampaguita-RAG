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
            self.driver = GraphDatabase.driver(self.uri, 
                                               auth=(self.user, self.password),
                                               max_connection_lifetime=30 * 60,
                                                max_connection_pool_size=50,
                                                connection_timeout=30.0
                                               )
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

    def get_ontology_topology(self) -> Dict[str, any]:
        """
        Executes a Cypher query to retrieve the entire medical ontology graph structure,
        returning nodes and relationships in a format suitable for visualization or analysis.
        """
        if not self.driver:
            raise RuntimeError("Database driver is not active. Call connect() first.")

        cypher_query = """
        MATCH (child:MedicalConcept)-[:IS_A]->(parent:MedicalConcept)
        RETURN
            child.code AS childCode, child.name AS childLabel,
            parent.code AS parentCode, parent.name AS parentLabel
        LIMIT 150
        """

        with self.driver.session() as session:
            try:
                result = session.run(cypher_query)
                nodes_map = {}
                edges = []

                nodes_map["ROOT"] = {
                    "id": "ROOT",
                    "label": "Clinical Reference Ontology Roots",
                    "level": 0
                }
                
                for record in result:
                    c_code = record["childCode"]
                    c_label = record["childLabel"]
                    p_code = record["parentCode"]
                    p_label = record["parentLabel"]

                    if p_code not in nodes_map:
                        nodes_map[p_code] = {
                            "id": p_code,
                            "label": p_label,
                            "level": 1
                        }

                        edges.append({
                            "from": "ROOT",
                            "to": p_code
                        })

                    if c_code not in nodes_map:
                        nodes_map[c_code] = {
                            "id": c_code,
                            "label": c_label,
                            "level": 2
                        }

                    edges.append({
                        "from": p_code,
                        "to": c_code
                    })

                return {
                    "nodes": list(nodes_map.values()),
                    "edges": edges
                }
            except Exception as e:
                print(f"Error executing Cypher query: {e}")
                return {"nodes": [], "edges": []}

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
