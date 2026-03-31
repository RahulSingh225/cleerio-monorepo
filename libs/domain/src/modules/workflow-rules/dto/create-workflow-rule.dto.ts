import { IsNotEmpty, IsString, IsInt, IsBoolean, IsOptional, MaxLength, Min } from 'class-validator';

export class CreateWorkflowRuleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  bucketId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  templateId: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  delayDays: number;

  @IsOptional()
  @IsInt()
  priority?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
