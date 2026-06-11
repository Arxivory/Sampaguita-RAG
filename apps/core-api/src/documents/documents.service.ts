import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { UsersService } from 'src/users/users.service';

interface FastAPIChunkPayload {
  chunk_content: string;
  embedding: number[];
  mapped_ontology_ids: string[];
}

interface FastAPIRagResponse {
  chunks_processed: number;
  payloads: FastAPIChunkPayload[];
}

@Injectable()
export class DocumentsService {
  private readonly ragEngineUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {
    this.ragEngineUrl = this.configService.get<string>('RAG_ENGINE_URL') || 'http://localhost:8000';
  }

  async processAndSaveChart(uploaderId: string, title: string, text: string) {
    await this.usersService.ensureUserExists(uploaderId);

    try {
      const ragResponse = await axios.post<FastAPIRagResponse>(
        `${this.ragEngineUrl}/rag/process-document`,
        { text }
      );

      const { chunks_processed, payloads } = ragResponse.data;

      const document = await this.prisma.client.document.create({
        data: {
          uploaderId,
          title,
          rawExtractedText: text,
        },
      });

      for (const payload of payloads) {
        const vectorString = `[${payload.embedding.join(',')}]`;
        const ontologyArrayFormatted = payload.mapped_ontology_ids.map(id => `'${id}'`).join(', ');
        const ontologyPgArray = `{${payload.mapped_ontology_ids.join(',')}}`;

        await this.prisma.client.$executeRawUnsafe(`
          INSERT INTO "document_chunks" (id, document_id, chunk_content, mapped_ontology_ids, embedding)
          VALUES (
            gen_random_uuid(), 
            '${document.id}'::uuid, 
            $1, 
            $2::text[], 
            '${vectorString}'::vector
          )
        `, payload.chunk_content, ontologyPgArray);
      }

      return {
        success: true,
        message: `Patient chart processed. ${chunks_processed} semantic fragments vectorized successfully.`,
        documentId: document.id,
        chunksSavedCount: chunks_processed
      };
      
    } catch (error) {
      console.error('Core Ingestion Pipeline Crash:', error);
      throw new InternalServerErrorException('Failed to process and save clinical chart record.');
    }
  }

  async semanticSearch(query: string, limit: number = 3) {
    try {
      const vectorResponse = await axios.post(`${this.ragEngineUrl}/rag/vector-search-proxy`, {
        query,
        limit
      });

      const queryEmbedding = vectorResponse.data.embedding;
      const vectorString = `[${queryEmbedding.join(',')}]`;

      const matchingChunks = await this.prisma.client.$queryRawUnsafe<any[]>(`
        SELECT
          id,
          document_id as "documentId",
          chunk_content as "chunkContent",
          mapped_ontology_ids as "mappedOntologyIds",
          1 - (embedding <=> '${vectorString}'::vector) AS "similarityScore"
        FROM document_chunks
        WHERE embedding IS NOT NULL
        ORDER BY embedding <=> '${vectorString}'::vector ASC
        LIMIT ${limit}
      `, limit);

      return {
        query,
        resultsCount: matchingChunks.length,
        matches: matchingChunks.map(chunk => {
          const score = chunk.similarityScore !== null && !isNaN(Number(chunk.similarityScore))
            ? parseFloat(chunk.similarityScore).toFixed(4)
            : '0.0000';

          return {
            chunkId: chunk.id,
            documentId: chunk.documentId,
            content: chunk.chunkContent,
            ontologyCodes: chunk.mappedOntologyIds,
            confidence: score
          };
        })
      };
    } catch (error) {
      console.error('Semantic Search Error:', error.message);
      throw new InternalServerErrorException('Failed to perform semantic search on clinical charts.');
    }
  }

  async analyzeClinicalContext(query: string, limit: number = 3) {
    try {
      const searchResults = await this.semanticSearch(query, limit);
      
      const textChunks = searchResults.matches.map(m => m.content);
      const uniqueOntologyCodes = Array.from(
        new Set(searchResults.matches.flatMap(m => m.ontologyCodes))
      );

      const inferenceResponse = await axios.post(
        `${this.ragEngineUrl}/rag/execute-inference`,
        {
          query: query,
          retrieved_chunks: textChunks,
          metadata_codes: uniqueOntologyCodes
        }
      );

      return {
        query: query,
        sourceDocumentsAnalyzed: Array.from(new Set(searchResults.matches.map(m => m.documentId))),
        fragmentsMatchedCount: searchResults.resultsCount,
        aiAnswer: inferenceResponse.data.answer
      };
    } catch (error) {
      console.error('End-to-End Analysis Pipeline Crash:', error.message);
      throw new InternalServerErrorException('Failed to process and compile structured clinical inference data.');
    }
  }

  async findAll() {
    return await this.prisma.client.document.findMany({
      orderBy: { createdAt: 'desc' },
      include: { chunks: true },
    });
  }

  async findOne(id: string) {
    const document = await this.prisma.client.document.findUnique({
      where: { id },
      include: { chunks: true },
    });
    if (!document) throw new NotFoundException(`Chart entry container ${id} could not be located.`);
    return document;
  }

  async remove(id: string) {
    await this.findOne(id);
    return await this.prisma.client.document.delete({ where: { id } });
  }
}