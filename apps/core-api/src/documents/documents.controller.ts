import { Controller, Post, Get, Param, Delete, UseInterceptors, UploadedFile, Body, BadRequestException, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  async ingestPatientChart(
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
    @Body('uploaderId') uploaderId: string,
    @Body('rawText') rawText?: string,
  ) {
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