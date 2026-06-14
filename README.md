# 🌸 SampaguitaRAG

A hierarchical ontological Retrieval-Augmented Generation (RAG) system designed to solve semantic interoperability challenges in fragmented clinical records. This system bridges unstructured medical narratives to standardized ontological structures, enabling accurate clinical decision support without hallucination risks.

## Problem Statement

Healthcare facilities in the Philippines struggle with semantic interoperability across incompatible Electronic Health Record (EHR) systems. Clinical documentation relies on non-standardized narrative text, regional colloquialisms, and ambiguous abbreviations. Standard text-based and vector RAG systems fail to capture formal biological relationships, leading to:

- Missed critical patient data across platform boundaries
- Dangerous hallucinations in AI-generated clinical summaries
- Inability to map conversational clinical notes to standardized medical terminologies
- Fragmented patient histories in low-resource environments

## Solution Overview

SampaguitaRAG introduces a graph-aware retrieval pipeline that forces language models to operate within an explicit medical ontology framework (DAG structure). Instead of treating clinical documents as flat text, the system:

1. Extracts clinical entities from unstructured narratives
2. Maps entities to standardized medical codes (SNOMED-CT, ICD-10)
3. Traverses hierarchical relationships to expand search scope
4. Constrains LLM synthesis to verified ontological paths
5. Exports structured, interoperable clinical data

## Features

- **Document Processing Pipeline**: Ingests unstructured clinical narratives, chunks text, and generates vector embeddings
- **Entity Linking**: Extracts medical entities and links them to ontological identifiers
- **Dual-Engine Search**: Query clinical records using standard vector search or hierarchical ontological search
- **Ontology Graph Viewer**: Interactive visualization of medical concept hierarchies and relationships
- **Clinical LLM Synthesis**: Generates guardrailed clinical summaries constrained by ontological boundaries
- **FHIR Export**: Exports synthesized records in interoperable HL7 FHIR R4 format
- **User Authentication**: Secure access via Supabase authentication
- **Neo4j Graph Database**: Persistent storage of medical ontology relationships

## Tech Stack

### Backend

- **FastAPI** (Python): Core RAG engine for document processing and ontological retrieval
- **NestJS** (TypeScript): API layer for user management, authentication, and document coordination
- **Neo4j**: Graph database for medical ontology storage and traversal
- **Supabase**: Authentication and user management service

### Frontend

- **React** (TypeScript): Core UI framework
- **Vite**: Build tool and development server
- **TanStack Router**: Client-side routing
- **Tailwind CSS**: Styling framework

### Infrastructure

- **Turbo**: Monorepo build orchestration
- **pnpm**: Package manager
- **Prisma**: Database ORM for relational data

## Project Structure

```
sampaguita-rag/
├── apps/
│   ├── core-api/           # NestJS API server
│   ├── rag-engine/         # FastAPI RAG processing engine
│   └── web-client/         # React SPA dashboard
└── packages/
    ├── database/           # Prisma schema and ORM
    ├── eslint-config/      # Shared ESLint rules
    ├── typescript-config/  # Shared TypeScript configs
    └── ui/                 # Shared UI component library
```

## Installation

### Prerequisites

- Node.js >= 18
- Python >= 3.10
- pnpm >= 9.0.0
- Neo4j database running
- Supabase project configured

### Setup Steps

1. Clone the repository:

```bash
git clone https://github.com/your-org/sampaguita-rag.git
cd sampaguita-rag
```

2. Install dependencies:

```bash
pnpm install
```

3. Configure environment variables:
   - Create `.env` file in the root directory
   - Set up Neo4j connection string
   - Configure Supabase credentials
   - Set API endpoints

4. Set up Python environment for RAG engine:

```bash
cd apps/rag-engine
python -m venv venv
source venv/Scripts/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

5. Initialize the database:

```bash
pnpm run build
```

## Usage

### Development

Start all services in development mode:

```bash
pnpm run dev
```

Or start individual services:

```bash
# Start NestJS API
pnpm run dev:api

# Start FastAPI RAG engine
pnpm run dev:engine

# Start React client
pnpm run dev:client
```

### API Endpoints

**RAG Engine (FastAPI, port 8000)**

- `POST /rag/process-document` - Ingest and process clinical document
- `POST /rag/query` - Execute RAG query with hierarchical retrieval
- `GET /ontology/nodes` - Retrieve ontology graph structure
- `GET /health` - Health check

**Core API (NestJS, port 3000)**

- `POST /auth/register` - User registration
- `POST /auth/login` - User authentication
- `GET /documents` - List user documents
- `POST /documents/upload` - Upload clinical document

### Frontend Routes

- `/` - Dashboard and home view
- `/search` - Clinical search workbench with dual-engine retrieval
- `/ontology` - Interactive ontology graph visualization
- `/export` - FHIR export and clinical synthesis view
- `/login` - User authentication
- `/signup` - Account creation

## Development Status

**Status: Still in Development**

This project is actively under development. Core functionality is operational, including document ingestion, graph-based retrieval, and clinical synthesis. Ongoing work includes refinement of search algorithms, enhanced visualization capabilities, and deployment optimization for resource-constrained environments.

Contributions and feedback are welcome. Please refer to the issue tracker for current development priorities.

## Documentation

Refer to individual README files in each app directory:

- [Core API Documentation](./apps/core-api/README.md)
- [RAG Engine Documentation](./apps/rag-engine/README.md)
- [Web Client Documentation](./apps/web-client/README.md)

## License

This project is licensed under the UNLICENSED designation. For licensing inquiries, please contact the project maintainers.

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo build
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo build
pnpm dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo build --filter=docs
```

Without global `turbo`:

```sh
npx turbo build --filter=docs
pnpm exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo dev
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo dev
pnpm exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters):

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo dev --filter=web
```

Without global `turbo`:

```sh
npx turbo dev --filter=web
pnpm exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed (recommended):

```sh
cd my-turborepo
turbo login
```

Without global `turbo`, use your package manager:

```sh
cd my-turborepo
npx turbo login
pnpm exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

With [global `turbo`](https://turborepo.dev/docs/getting-started/installation#global-installation) installed:

```sh
turbo link
```

Without global `turbo`:

```sh
npx turbo link
pnpm exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.dev/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.dev/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.dev/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.dev/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.dev/docs/reference/configuration)
- [CLI Usage](https://turborepo.dev/docs/reference/command-line-reference)
