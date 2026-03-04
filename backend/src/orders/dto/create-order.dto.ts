import { IsString, IsEmail, IsOptional } from 'class-validator';

export class CreateOrderDto {
  @IsString() deliveryFullName: string;
  @IsString() deliveryPhone: string;
  @IsEmail() deliveryEmail: string;
  @IsString() deliveryAddress: string;
  @IsOptional() @IsString() notes?: string;
}
