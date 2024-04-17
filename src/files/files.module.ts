import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileController } from './files.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [FileController],
  providers: [FilesService],
  imports: [ConfigModule]
})
export class FileModule {}
