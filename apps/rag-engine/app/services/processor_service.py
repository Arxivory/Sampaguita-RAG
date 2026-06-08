import re
from typing import List, Dict, Any
from sentence_transformers import SentenceTransformer

class ClinicalTextProcessor:
    def __init__(self):
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

    def chunk_text(self, text: str, chunk_size: int = 500, chunk_overlap: int = 100) -> List[str]:
        """
        Splits raw text into overlapping fragments using a character-based sliding window.
        This ensures that clinical context cutting across boundaries isn't lost.
        """
        
        clean_text = re.sub(r'\s+', ' ', text).strip()
        
        chunks = []
        start = 0
        text_length = len(clean_text)

        if text_length <= chunk_size:
            return [clean_text]

        while start < text_length:
            end = start + chunk_size
            chunk = clean_text[start:end]
            chunks.append(chunk)
            
            start += (chunk_size - chunk_overlap)
            
            if start >= text_length or (chunk_size - chunk_overlap) <= 0:
                break
                
        return chunks

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Transforms text strings into lists of floating-point vector arrays.
        """
        embeddings = self.model.encode(texts)
        
        return embeddings.tolist()

text_processor = ClinicalTextProcessor()