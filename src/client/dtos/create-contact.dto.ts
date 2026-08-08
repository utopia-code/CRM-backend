import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateContactDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  role?: string | null;

  @IsOptional()
  @IsEmail()
  email?: string | null;

  @IsOptional()
  @IsString()
  telephone?: string | null;
}
