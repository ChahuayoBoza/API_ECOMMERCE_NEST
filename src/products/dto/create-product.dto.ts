import { ApiProperty, ApiTags } from "@nestjs/swagger";
import { MinLength, IsString, IsNumber, IsPositive, IsOptional, IsInt,  IsIn, IsArray } from "class-validator";

export class CreateProductDto {

@ApiProperty({
    description: 'Product titel (unique)',
    nullable: false,
    minLength: 1
})
@IsString()
@MinLength(1)
title : string;

@ApiProperty()
@IsNumber()
@IsPositive()
@IsOptional()
price? : number;

@ApiProperty()
@IsString()
@IsOptional()
description : string;

@ApiProperty()
@IsString()
@IsOptional()
slug? : string;

@ApiProperty()
@IsInt()
@IsPositive()
@IsOptional()
stock? : number;

@ApiProperty()
@IsString({each:true})
@IsArray()
sizes : string[];

@ApiProperty()
@IsIn(['Masculino','Femenino', 'Niño', 'Niña', 'Mixto', 'Bebes'])
gender : string;

@ApiProperty()
@IsString({each:true})
@IsArray()
@IsOptional()
tags : string[];

@ApiProperty()
@IsString({each:true})
@IsArray()
@IsOptional()
images? : string[]

}


