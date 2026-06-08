import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import axios from 'axios';
import { ConfigService } from '@nestjs/config/dist/config.service';
import { UsersService } from 'src/users/users.service';

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
    try {
      await this.usersService.ensureUserExists(uploaderId);

      const document = await this.prisma.client.document.create({
        data: {
          uploaderId,
          title,
          rawExtractedText: text,
        },
      });

      const mockChunkText = text.slice(0, 1000); 

      let detectedOntologies: string[] = [];
      try {
        const response = await axios.get(`${this.ragEngineUrl}/ontology/lineage/I21`);
        if (response.data && response.data.matching_hierarchy_codes) {
          detectedOntologies = response.data.matching_hierarchy_codes;
        }
      } catch (error) {
        console.warn('Downstream RAG engine unreachable, skipping real-time ontology enhancement.', error.message);
      }

      const chunk = await this.prisma.client.documentChunk.create({
        data: {
          documentId: document.id,
          chunkContent: mockChunkText,
          mappedOntologyIds: detectedOntologies,
        },
      });

      return {
        success: true,
        message: 'Patient chart securely processed and logged.',
        documentId: document.id,
        recordsSaved: {
          title: document.title,
          chunkId: chunk.id,
          associatedOntologyCodesCount: detectedOntologies.length,
        },
      };
    } catch (error) {
      console.error('Core Ingestion Pipeline Crash:', error);
      throw new InternalServerErrorException('Failed to process and save clinical chart record.');
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