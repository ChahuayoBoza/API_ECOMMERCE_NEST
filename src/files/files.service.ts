import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class FilesService {

    constructor(private configService : ConfigService) {
        cloudinary.config({
            cloud_name: this.configService.get<string>('CLOUD_NAME'),
            api_key: this.configService.get<string>('API_KEY'),
            api_secret: this.configService.get<string>('API_SECRET')});
    }

    // getStaticProductImage( imageName: string ) {
    //     const path = join(__dirname, '../../static/products', imageName);

    //     if( !existsSync(path) ) {
    //         throw new BadRequestException(`Np product found with image ${ imageName }`);
    //     }

    //     return path;
    // }

    async uploadToCloudinary(filePath: string): Promise<string> {
        console.log("Antes de subir a Cloudinary", filePath);
        try {
            const result = await cloudinary.uploader.upload(filePath, { folder: 'products' });
            console.log("Después de subir a Cloudinary", filePath);
            return result.secure_url;
        } catch (error) {
            console.error("Error al subir a Cloudinary", error);
            throw new BadRequestException('Error al cargar la imagen a Cloudinary');
        }
    }
    
    async getCloudinaryUrl(imageName: string): Promise<string> {
        try {
            const url = cloudinary.url(`products/${imageName}`);
            return url;
        } catch (error) {

            if (error instanceof Error) { 
                throw new BadRequestException(`Error al cargar la imagen a Cloudinary: ${error.message}`);
            } else {
                throw new BadRequestException('Error al cargar la imagen a Cloudinary');
            }
        }
    }
}