import { IsEmail, IsString, IsOptional, IsUUID, IsIn } from 'class-validator';

export class CreateTenantUserDto {
  @IsUUID()
  tenantId: string;

  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsString()
  password: string;

  @IsIn(['tenant_admin', 'analyst', 'ops', 'viewer'])
  role: string;

  @IsOptional()
  @IsUUID()
  invitedBy?: string;
}

export class UpdateTenantUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['tenant_admin', 'analyst', 'ops', 'viewer'])
  role?: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'invited'])
  status?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
