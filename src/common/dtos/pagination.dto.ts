import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsPositive, IsString, Length } from "class-validator";

export class PaginationDto {

    @ApiProperty({
        default: 10,
        description: 'How many rows do you need'
    })
    @IsOptional()
    @IsPositive()
    @Type( () => Number)
    limit? : number;

    
    @ApiProperty({
        default: 10,
        description: 'How many rows do you want to skip'
    })
    @IsOptional()
    @Type( () => Number )
    offset? : number;

    @IsOptional()
    @IsString()
    @Length(2,50)
    categoryId? : string

}