import { IsNotEmpty, IsString, IsInt, IsBoolean, IsOptional, MaxLength } from 'class-validator';

export class CreateFieldMappingDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  fieldKey: string; // field1, field2, etc.

  @IsNotEmpty()
  @IsInt()
  fieldIndex: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  headerName: string; // "Phone Number", "Customer Name"

  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  displayLabel: string;

  @IsOptional()
  @IsString()
  dataType?: 'string' | 'number' | 'date' | 'boolean';

  @IsOptional()
  @IsBoolean()
  isPii?: boolean;
}
