import { IsBoolean, IsNotEmpty, IsOptional, IsString, IsInt, MaxLength, Min, IsObject } from 'class-validator';

export class CreateChannelConfigDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  channel: string;

  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  providerName?: string;

  @IsOptional()
  @IsObject()
  providerConfig?: Record<string, any>;

  @IsOptional()
  @IsObject()
  dispatchApiTemplate?: Record<string, any>;

  @IsOptional()
  @IsInt()
  @Min(0)
  dailyCap?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  hourlyCap?: number;
}
