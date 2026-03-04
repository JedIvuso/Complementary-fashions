import { IsOptional, IsString, IsNumber, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class ProductQueryDto {
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsUUID() categoryId?: string;
  @IsOptional() @IsNumber() @Transform(({ value }) => parseFloat(value)) minPrice?: number;
  @IsOptional() @IsNumber() @Transform(({ value }) => parseFloat(value)) maxPrice?: number;
  @IsOptional() @IsString() sortBy?: 'price' | 'popularity' | 'createdAt';
  @IsOptional() @IsString() sortDir?: 'ASC' | 'DESC';
  @IsOptional() @IsNumber() @Transform(({ value }) => parseInt(value)) page?: number;
  @IsOptional() @IsNumber() @Transform(({ value }) => parseInt(value)) limit?: number;
  @IsOptional() @IsBoolean() @Transform(({ value }) => value === 'true') featured?: boolean;
  @IsOptional() @IsBoolean() @Transform(({ value }) => value === 'true') includeUnavailable?: boolean;
}
