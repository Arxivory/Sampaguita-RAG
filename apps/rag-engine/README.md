# RAG Engine

The intelligent processing core of SampaguitaRAG. This service handles all the heavy lifting for document processing, entity extraction, graph traversal, and language model operations.

## What This App Does

The RAG Engine is a Python FastAPI service responsible for:

- Breaking down clinical documents into smaller, meaningful chunks
- Converting text into mathematical vectors (embeddings) for similarity search
- Extracting medical entities and linking them to standardized codes
- Querying the medical ontology graph to find related concepts
- Generating guardrailed clinical summaries using language models
- Managing Neo4j graph database connections for ontology storage

Think of this as the "brain" of SampaguitaRAG - it transforms messy clinical text into structured, searchable data.

## Architecture

The service is organized into logical layers:

- **routers** - API endpoints that handle incoming requests
  - `rag.py` - Document processing and RAG query endpoints
  - `ontology.py` - Graph structure and concept queries
  - `seed.py` - Ontology database initialization

- **services** - Core business logic
  - `processor_service.py` - Text chunking and embedding generation
  - `entity_linker.py` - Medical entity recognition and linking
  - `graph_service.py` - Neo4j graph queries and traversal
  - `llm_service.py` - Language model inference with safety guards

## Setup

```bash
# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create a .env file with Neo4j and LLM credentials
```

## Running

```bash
# Development mode (with auto-reload)
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# Production mode
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

```
POST /rag/process-document           Upload and process a clinical document
POST /rag/query                      Execute a RAG query with hierarchical retrieval
GET  /ontology/nodes                 Retrieve ontology graph nodes
GET  /ontology/expand/:node_id       Traverse children of a concept node
POST /seed/initialize                Load medical ontology into Neo4j
GET  /health                         Service health check
```

## How It Works - Document Processing Pipeline

1. **Chunking**: Raw document text is split into overlapping fragments
   - Preserves clinical context that might span chunk boundaries
   - Configurable chunk size and overlap parameters

2. **Embedding**: Each chunk is converted to a vector representation
   - Uses sentence-transformers for semantic understanding
   - Enables similarity-based retrieval

3. **Entity Linking**: Medical terms are extracted and mapped to ontology codes
   - Recognizes clinical entities (diagnoses, procedures, medications)
   - Links to standardized codes (ICD-10, SNOMED-CT)

4. **Storage**: Processed data is saved for later retrieval
   - Vectors stored for fast similarity search
   - Ontology links enable hierarchical filtering

## How It Works - Query Processing

1. User submits a clinical query
2. Query is converted to vector representation
3. Graph service expands the query scope by traversing ontology hierarchies
4. Vector database is queried with metadata filters from ontology
5. Retrieved chunks are sent to language model with strict constraints
6. Model generates summary without hallucinating unverified information

## Key Dependencies

- **fastapi** - Web framework for API endpoints
- **neo4j** - Graph database driver for ontology queries
- **sentence-transformers** - Embedding model for text vectorization
- **pydantic** - Data validation and serialization
- **python-dotenv** - Environment variable management

## Neo4j Graph Structure

The ontology is stored as a directed acyclic graph (DAG) where:

- Each node represents a medical concept with a unique ID and label
- Edges represent parent-child relationships
- Traversing down the tree expands a query to include more specific concepts
- Example: "Cardiovascular Disease" → "Hypertension" → "Essential Hypertension"

## Performance Considerations

- Embeddings are cached to avoid reprocessing identical text
- Graph queries use Neo4j's indexed lookups for fast traversal
- Chunk overlap ensures clinical context is preserved across boundaries
- LLM calls are constrained to prevent expensive long computations

## Troubleshooting

**Neo4j connection error**: Ensure Neo4j server is running and credentials in `.env` are correct

**Out of memory during embedding**: Reduce batch size or chunk size in processor configuration

**Empty query results**: Check that ontology has been seeded with `POST /seed/initialize`
