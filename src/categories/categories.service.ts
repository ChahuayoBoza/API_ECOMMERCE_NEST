import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { isUUID } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {

  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>
  ){

  }

  create(createCategoryDto: CreateCategoryDto) {
    return 'This action adds a new category';
  }

  findAll() {
    return this.categoryRepository.find();
  }

  async findOne(term: string) { 

    let category: Category;

    if( isUUID(term) ){
      category = await this.categoryRepository.findOneBy({id: term});
    }else {
      throw new NotFoundException(`Category with id ${term} not found`);
    }

    if(!category){
      throw new NotFoundException(`Category with id ${term} not found`);
    }

    return category;

  }


  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }
}
