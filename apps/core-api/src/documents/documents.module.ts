import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { PrismaService } from 'src/prisma.service';
import { UsersModule } from 'src/users/users.module';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [DocumentsController],
  providers: [DocumentsService, PrismaService, UsersService],
  imports: [UsersModule]
})
export class DocumentsModule {}
