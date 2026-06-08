import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentsModule } from './documents/documents.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [DocumentsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
