import re
from typing import List, Set
from app.services.graph_service import graph_service

class MedicalEntityLinker:
    def __init__(self):
        self.ontology_dictionary = {
            "I21": [
                "heart attack", "myocardial infarction", "infarction", "ami",
                "chest pain", "angina", "coronary occlusion", "ischemic chest pain"
            ],
            "J12-J18": [
                "pneumonia", "pnumonia", "lung inflammation", "pulmonary infiltration",
                "productive cough", "community acquired pneumonia", "cap"
            ],
            "A15-A19": [
                "tuberculosis", "pulmonary tuberculosis", "tb", "ptb", 
                "koch's infection", "kochs", "acid fast bacilli", "afb positive"
            ]
        }

    def extract_and_link(self, chunk_text: str) -> List[str]:
        """
        Scans incoming text segments for clinical terms using regex word-boundaries,
        then recursively resolves their complete parent-child lineage via Neo4j.
        """
        clean_text = chunk_text.lower()
        matched_roots: Set[str] = set()

        for icd_root, variants in self.ontology_dictionary.items():
            for variant in variants:
                pattern = r'\b' + re.escape(variant) + r'\b'
                if re.search(pattern, clean_text):
                    matched_roots.add(icd_root)
                    break

        all_linked_codes: Set[str] = set()
        for root_code in matched_roots:
            try:
                lineage = graph_service.fetch_medical_lineage(root_code)
                if lineage:
                    all_linked_codes.update(lineage)
            except Exception as e:
                print(f"[Linker Warning] Failed fetching lineage for {root_code}: {e}")

        return list(all_linked_codes)

entity_linker = MedicalEntityLinker()