import { IsNotEmpty, IsString, IsOptional, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProviderVariableDto {
  @IsNotEmpty()
  @IsString()
  vendorVar: string;

  @IsNotEmpty()
  @IsString()
  systemVar: string;
}

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
  @MaxLength(150)
  providerTemplateId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProviderVariableDto)
  providerVariables?: ProviderVariableDto[];

  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @IsOptional()
  variables?: string[];
}
