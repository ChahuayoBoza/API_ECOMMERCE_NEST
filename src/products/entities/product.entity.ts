import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";
import { ApiProperty } from "@nestjs/swagger";

@Entity({name: 'products'})
export class Product {

    @ApiProperty({
        example: '274d073d-87f8-4c37-9eb7-1cc632c685e7',
        description: 'Product ID',
        uniqueItems: true
    })
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({
        example: 'T-SHIRT',
        description: 'Title',
        uniqueItems: true
    })
    @Column('text',{
        unique: true,
    })
    title: string;

    @ApiProperty({
        example: 25,
        description: 'Price'
    })
    @Column('float',{
        default: 0,
    })
    price: number;

    @ApiProperty({
        example: 'T SHIRT Size S',
        description: 'Description'
    })
    @Column({
        type: 'text',
        nullable: true,
    })
    description: string;

    @ApiProperty({
        example: 't_shirt',
        description: 'slug',
    })
    @Column('text', {
        unique: true,
    })
    slug: string;

    @ApiProperty({
        example: 28,
        description: 'Stock',
        default: 0
    })
    @Column('int',{
        default: 0,
    })
    stock: number;

    @ApiProperty({
        example: ['S', 'M', 'XL'],
        description: 'Sizes'
    })
    @Column('text', {
        array: true
    })
    sizes: string[];

    @ApiProperty({
        example: 'Masculino',
        description: 'Gender'
    })
    @Column('text')
    gender: string;

    @ApiProperty({
        example: 'T SHIRT',
        description: 'TITULO',
        uniqueItems: true
    })
    @Column('text',{
        array: true, 
        default: []
    })
    tags: string[];

    @ApiProperty({
        example: '274d073d-87f8-4c37-9eb7-1cc632c685e7',
        description: 'Product ID',
        uniqueItems: true
    })
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        {cascade: true, eager: true}
    )
    images?: ProductImage[];

    @ManyToOne(
        () => User,
        (user) => user.product
    )
    user: User

    @BeforeInsert()
    checkSlugInsert() {

        if(!this.slug){
            this.slug = this.title;
        }

        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", "")
        
    }

    @BeforeUpdate()
    checkSlugUpdate() {
        this.slug = this.slug
        .toLowerCase()
        .replaceAll(' ', '_')
        .replaceAll("'", "")
    }
}
