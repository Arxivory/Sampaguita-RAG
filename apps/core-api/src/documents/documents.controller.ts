import { Controller, Post, Get, Param, Delete, UseInterceptors, 
  UploadedFile, Body, BadRequestException, HttpCode, HttpStatus, 
  Query, 
  UseGuards,
  createParamDecorator,
  ExecutionContext } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { SupabaseAuthGuard } from '../supabase-auth.guard';

export const AuthenticatedUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

@Controller('documents')
@UseGuards(SupabaseAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async ingestPatientChart(
    @UploadedFile() file: Express.Multer.File,
    @AuthenticatedUser() user: any,
    @Body('title') title: string,
    @Body('rawText') rawText?: string,
  ) {
    const uploaderId = user.id;

    if (!uploaderId) throw new BadRequestException('Uploader tracking identity parameter is required.');

    let chartContent = '';
    if (file) {
      chartContent = file.buffer.toString('utf-8');
    } else if (rawText) {
      chartContent = rawText;
    } else {
      throw new BadRequestException('Please provide either an uploadable chart file or raw narrative text.');
    }

    const documentTitle = title || `Chart Ingestion - ${new Date().toLocaleDateString('en-PH')}`;
    return await this.documentsService.processAndSaveChart(uploaderId, documentTitle, chartContent);
  }

  @Get('search')
  async searchPatientCharts(
    @Query('q') query: string,
    @Query('limit') limit?: number
  ) {
    if (!query) 
      throw new BadRequestException('Search query parameter "q" is required.');

    const parsedLimit = limit ? Number(limit) : 3;
    return await this.documentsService.semanticSearch(query, parsedLimit);
  }

  @Get()
  async getAllDocuments() {
    return await this.documentsService.findAll();
  }

  @Get(':id')
  async getDocument(@Param('id') id: string) {
    return await this.documentsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteDocument(@Param('id') id: string) {
    return await this.documentsService.remove(id);
  }
}