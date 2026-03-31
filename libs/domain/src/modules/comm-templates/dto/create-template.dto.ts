import { IsNotEmpty, IsString, IsOptional, MaxLength, IsEnum } from 'class-validator';

export class CreateTemplateDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  channel: string; // sms, whatsapp, ivr

  @IsNotEmpty()
  @IsString()
  body: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dpdBucket?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @IsOptional()
  variables?: string[];
}
