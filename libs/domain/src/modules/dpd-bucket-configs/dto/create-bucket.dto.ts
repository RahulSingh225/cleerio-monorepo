import { IsNotEmpty, IsString, IsInt, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateBucketDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  bucketName: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  dpdMin: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  dpdMax?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayLabel?: string;

  @IsOptional()
  @IsInt()
  priority?: number;
}
