import { IsBoolean, IsOptional, IsString, IsInt, MaxLength, Min } from 'class-validator';

export class UpdateChannelConfigDto {
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  providerName?: string;

  @IsOptional()
  providerConfig?: Record<string, any>;

  @IsOptional()
  @IsInt()
  @Min(0)
  dailyCap?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  hourlyCap?: number;
}
