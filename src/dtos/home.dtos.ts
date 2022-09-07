import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';

import { PropertyType } from '@prisma/client';

import { Exclude, Expose, Type } from 'class-transformer';

class Image {
  @IsString()
  @IsNotEmpty()
  url: string;
}

export class CreateHomeDTO {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsNumber()
  @IsPositive()
  numberOfBedrooms: number;

  @IsNumber()
  @IsPositive()
  numberOfBathrooms: number;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsNumber()
  @IsPositive()
  landSize: number;

  @IsEnum(PropertyType)
  propertyType: PropertyType;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Image)
  images: Image[];
}

export class UpdateHomeDTO {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfBedrooms: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  numberOfBathrooms: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  landSize: number;

  @IsOptional()
  @IsEnum(PropertyType)
  propertyType: PropertyType;
}

export class HomeResponseDTO {
  id: number;
  address: string;
  city: string;
  price: number;
  propertyType: PropertyType;

  @Expose({ name: 'numberOfBedrooms' })
  transformNoOfBedroom() {
    return this.number_of_bedrooms;
  }
  @Exclude()
  number_of_bedrooms: number;

  @Expose({ name: 'numberOfBathrooms' })
  transformNoOfBathrooms() {
    return this.number_of_bathrooms;
  }
  @Exclude()
  number_of_bathrooms: number;

  @Expose({ name: 'landSize' })
  transformLandSize() {
    return this.land_size;
  }
  @Exclude()
  land_size: number;

  @Expose({ name: 'listedDate' })
  transformListedDate() {
    return this.listed_date;
  }
  @Exclude()
  listed_date: Date;

  @Exclude()
  created_at: Date;

  @Exclude()
  updated_at: Date;

  @Exclude()
  realtor_id: number;

  @Expose({ name: 'images' })
  transformImages() {
    const allImages = this.Image;
    return allImages.map((eachObj) => eachObj.url);
  }
  @Exclude()
  Image: { url: string }[];

  constructor(partial: Partial<HomeResponseDTO>) {
    Object.assign(this, partial);
  }
}
