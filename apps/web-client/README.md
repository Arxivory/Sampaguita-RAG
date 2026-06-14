# Web Client

The user interface dashboard for SampaguitaRAG. This React application provides medical professionals with an intuitive way to upload documents, search clinical records, and explore ontological relationships.

## What This App Does

The Web Client lets users:

- Register accounts and log in securely
- Upload unstructured clinical documents
- Search clinical records using two methods:
  - Standard vector search for fuzzy text matching
  - Hierarchical ontological search for precise concept-based retrieval
- View the medical ontology as an interactive graph
- Read guardrailed AI-generated summaries of clinical records
- Export structured clinical data in FHIR format
- Track search performance metrics and retrieval accuracy

Think of this as the "dashboard" that makes the complex RAG system accessible to medical staff.

## Architecture

The app is organized around TanStack Router with the following routes:

- `/` - Dashboard home
- `/login` - User authentication
- `/signup` - Account registration
- `/search` - Dual-engine search workbench with query interface and results
- `/ontology` - Interactive graph visualization of medical concepts
- `/export` - Clinical synthesis view with FHIR JSON export panel

## Setup

```bash
# Install dependencies
pnpm install

# Set up environment variables
# Create a .env.local file with API endpoints:
# VITE_API_URL=http://localhost:3000
# VITE_RAG_ENGINE_URL=http://localhost:8000
```

## Running

```bash
# Development mode (with hot reload)
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## Key Features Explained

### Search Workbench

Users can toggle between two search modes:

- **Vector Search (Fuzzy)**: Traditional semantic search using embeddings
  - Fast and flexible
  - Works well for general exploration
  - May find semantically similar but unrelated results

- **Hierarchical Ontological Search (Typed)**: Graph-aware search using medical taxonomy
  - Expands query scope by traversing ontology relationships
  - Filters results using medical concept hierarchies
  - More precise for structured medical reasoning
  - Shows exactly which concepts were matched

### Ontology Graph Viewer

An interactive canvas that visualizes how medical concepts relate to each other:

- Nodes represent medical concepts (e.g., "Hypertension", "Diabetes")
- Edges show parent-child relationships
- Users can zoom, pan, and select nodes
- Clicking a search result highlights its position in the graph
- Shows the exact traversal path used for retrieval

### FHIR Export Panel

Allows users to export retrieved clinical data in standardized formats:

- Displays AI-generated clinical summary with inline citations
- Shows guardrail validations and compliance alerts
- Provides FHIR R4 JSON output for system interoperability
- One-click copy to clipboard for integration with other systems

## Key Dependencies

- **React** - UI framework
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **TanStack Router** - Client-side routing and navigation
- **Tailwind CSS** - Styling framework
- **Lucide Icons** - Clean, consistent icon set
- **React Query** - Data fetching and caching (implied by usage patterns)

## Component Organization

```
src/
├── routes/          - Page components for each route
├── components/      - Reusable UI components
│   ├── ui/          - Basic UI elements (buttons, cards, etc.)
│   ├── AppSidebar.tsx
│   └── TopHeader.tsx
├── hooks/           - Custom React hooks
├── lib/
│   ├── api.ts       - API client for Core API and RAG Engine
│   └── utils.ts     - Utility functions
└── styles.css       - Global styles
```

## How to Use - Document Upload Flow

1. User logs in with credentials
2. Navigates to search or uploads directly
3. Submits clinical document text
4. Frontend sends to Core API
5. Core API coordinates with RAG Engine for processing
6. Processed results appear in search interface
7. User can explore through graph or query results

## How to Use - Search Flow

1. User enters clinical query (e.g., "Summarize cardiovascular issues")
2. Selects search modality (Vector or Ontological)
3. Frontend sends query to Core API
4. Core API calls RAG Engine with appropriate retrieval method
5. Results appear with relevance scores and source citations
6. User can click results to highlight in ontology graph
7. Can export or refine search

## Performance Tips

- Initial graph rendering may take a moment for large ontologies - be patient
- Search results cache automatically - repeat queries are instant
- Graph zooming and panning use canvas rendering for smooth interaction
- Document uploads show progress feedback for user awareness

## Environment Variables

```
VITE_API_URL              # Core API endpoint (default: http://localhost:3000)
VITE_RAG_ENGINE_URL       # RAG Engine endpoint (default: http://localhost:8000)
VITE_SUPABASE_URL         # Supabase project URL
VITE_SUPABASE_ANON_KEY    # Supabase public key
```

## Troubleshooting

**Blank search results**: Ensure RAG Engine is running and documents have been processed

**Graph not displaying**: Check that Neo4j contains ontology data - run seed endpoint if needed

**API connection errors**: Verify environment variables point to correct server addresses

**Authentication issues**: Confirm Supabase credentials are correctly configured
