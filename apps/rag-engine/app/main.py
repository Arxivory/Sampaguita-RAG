from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from .services.graph_service import graph_service
from .routers import ontology, seed

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    graph_service.connect()
    yield
    graph_service.close()

app = FastAPI(
    title="SampaguitaRAG Engine",
    description="Intelligent Clinical Processing & Medical Ontology Search Assistant",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ontology.router)
app.include_router(seed.router)

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "sampaguita-rag-engine",
        "version": "1.0.0",
        "neo4j_connected": graph_service.driver is not None
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)