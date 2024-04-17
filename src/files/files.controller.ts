import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException, Res } from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter, fileNamer } from './helpers';
import { diskStorage } from 'multer';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('File')
@Controller('files')
export class FileController {
  constructor(
    private readonly fileService: FilesService,
    private readonly configService: ConfigService
    ) {}

  @Get('product/:imageName')

  async findProductImage(
    @Param('imageName') imageName: string) {
    const secureUrl = await this.fileService.getCloudinaryUrl(imageName);
    return { secureUrl };
  }

    // findProductImage(
  //   @Res() res: Response,
  //   @Param('imageName') imageName: string
  // ) {
  //   const path = this.fileService.getStaticProductImage(imageName);
    
  //   res.sendFile( path );
  // } // Esto guarda en local

  @Post('product')
  @UseInterceptors( FileInterceptor('file', {
    fileFilter: fileFilter,
    // limits: { fileSize: 1000 }
    storage: diskStorage({
      destination: './static/products',
      filename: fileNamer
    }) 
  }) )
  async uploadProductImage(
    @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Asegúrate de que el archivo sea una imagen');
    }

    const secureUrl = await this.fileService.uploadToCloudinary(file.path);

    return { secureUrl };
  }

  // uploadProductImage( 
  //   @UploadedFile()
  //   file : Express.Multer.File){

  //     if( !file ){
  //       throw new BadRequestException('Make sure that the file is an image');
  //     }

  //     const secureUrl = `${ this.configService.get('HOST_API') }/files/product/${ file.filename }`;

  //   return { secureUrl };
  // } //Esto es para local


  
}
