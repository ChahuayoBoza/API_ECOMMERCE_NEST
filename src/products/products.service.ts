import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from "uuid";
import { User } from 'src/auth/entities/user.entity';
import { Category } from 'src/categories/entities/category.entity';
import { FilterDto } from './dto/filter.dto';

@Injectable()
export class ProductsService {

  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ){

  }
  async create(createProductDto: CreateProductDto, user: User) {
    
    const { categoryId, ...productDeatil } = createProductDto;

    const category = await this.categoryRepository.findOneBy({ id: categoryId });
    if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }


    try {

      const { images = [], ...productDetails } = createProductDto;
      
      const product = this.productRepository.create({
        ...productDetails,
        user,
        category,
        images: images.map( image => this.productImageRepository.create({url: image}) )
        });

      await this.productRepository.save(product);

      return product;

    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  // async findAll(paginationDto: PaginationDto) {

  //   const {  limit=10, offset=0 } = paginationDto;

  //   const [products, total] =  await this.productRepository.findAndCount({
  //     take: limit,
  //     skip: offset,
  //     relations: {
  //       images: true
  //     }
  //   });

  //   const mappedProducts = products.map(({ images, ...rest }) => ({
  //     ...rest,
  //     images: images.map(img => img.url),
  //   }));

  //   return {
  //     products: mappedProducts,
  //     total
  //   };
  // }

  async findAll(paginationDto: PaginationDto) {

    const {  limit=10, offset=0, categoryId } = paginationDto;
    
    // const {categoryId} = filterDto;

    const queryBuilder = this.productRepository.createQueryBuilder('product');

    queryBuilder.leftJoinAndSelect('product.images', 'image');

    // console.log("CATEGORIAID", filterDto);

    if( categoryId !== undefined) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId })
    }

    queryBuilder.take(limit);
    queryBuilder.skip(offset);

    const [products, total] = await queryBuilder.getManyAndCount();

    const mappedProducts = products.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map(img => img.url),
    }));

    return {
      products: mappedProducts,
      total
    };
  }

  async findAllParam(paginationDto: PaginationDto, filterDto: FilterDto) {
    
    const { limit = 10, offset = 0 } = paginationDto;
    const { categoryId, title } = filterDto;

    // Crear un query builder para añadir condiciones de forma dinámica
    const queryBuilder = this.productRepository.createQueryBuilder('product');

    // Relacionar las imágenes
    queryBuilder.leftJoinAndSelect('product.images', 'image');

    // Filtrar por categoría si se proporciona
    if (filterDto && categoryId) {
        queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    // Filtrar por títulos que contengan las palabras clave proporcionadas
    if (title) {
        queryBuilder.andWhere('product.title LIKE :title', { title: `%${title}%` });
    }

    // Paginación
    queryBuilder.take(limit);
    queryBuilder.skip(offset);

    const [products, total] = await queryBuilder.getManyAndCount();

    const mappedProducts = products.map(({ images, ...rest }) => ({
      ...rest,
      images: images.map(img => img.url),
    }));

    return {
      products: mappedProducts,
      total,
    };
}


  async findOne(term: string) { 

    let product: Product;

    if( isUUID(term) ){
      product = await this.productRepository.findOneBy({id: term});
    }else {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        .where('UPPER(title) =:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();  
    }   

    if(!product){
      throw new NotFoundException(`Product with term ${term} not found`);
    }

    return product;

  }

  async findOnePlain ( term: string ) {
    const { images = [], ...rest } = await this.findOne( term );
    return {
      ...rest,
      images: images.map( img => img.url ) 
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto, user: User) {

    const {images, ...toUpdate} = updateProductDto;
    
    const product = await this.productRepository.preload({
      id,
      ...toUpdate
    }); 

    if( !product ) throw new NotFoundException(`Product with id: ${id} not found`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {

      if(images){
        await queryRunner.manager.delete(ProductImage, {product: {id}});

        product.images = images.map(
          image => this.productImageRepository.create({url: image})
        )
      }

      product.user = user
      await queryRunner.manager.save( product );
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
      
    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }

  }

  async remove(id: string) {
    
    const product = await this.findOne(id);
    
    await this.productRepository.remove(product);

  }

  private handleDBExceptions( error: any ) {
    if( error.code === '23505' ){
      throw new BadRequestException(error.detail);
    }

    this.logger.error(error)

    throw new InternalServerErrorException('Unexpected error, check server logs');
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');

    try {

      return await query
      .delete()
      .where({})
      .execute();
      
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
