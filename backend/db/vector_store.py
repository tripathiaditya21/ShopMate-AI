import faiss
import numpy as np
from sentence_transformers import SentenceTransformer
import os

class VectorStore:
    def __init__(self, model_name='all-MiniLM-L6-v2', dimension=384):
        self.model = SentenceTransformer(model_name)
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(self.dimension)
        self.memory = []  # To store the actual query text mapped to the index

    def add_query(self, query: str):
        embedding = self.model.encode([query]).astype('float32')
        self.index.add(embedding)
        self.memory.append(query)

    def search_similar_queries(self, query: str, top_k: int = 3):
        if self.index.ntotal == 0:
            return []
        
        embedding = self.model.encode([query]).astype('float32')
        distances, indices = self.index.search(embedding, min(top_k, self.index.ntotal))
        
        results = []
        for idx in indices[0]:
            if idx != -1 and idx < len(self.memory):
                results.append(self.memory[idx])
        return results

# Singleton instance
vector_db = VectorStore()
