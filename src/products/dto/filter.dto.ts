
import { IsOptional, IsString, Length } from "class-validator";

export class FilterDto {
    @IsOptional()
    @IsString()
    @Length(2,50)
    categoryId? : string

    @IsOptional()
    @IsString()
    @Length(1, 100) // Asegura que el título tenga entre 1 y 100 caracteres
    title?: string;
}