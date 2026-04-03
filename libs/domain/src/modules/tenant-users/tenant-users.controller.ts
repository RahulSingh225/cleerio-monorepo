import { Controller, Post, Body, Get, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { TenantUsersService } from './tenant-users.service';
import { CreateTenantUserDto, UpdateTenantUserDto } from './dto/create-tenant-user.dto';
import { ApiResponseConfig } from '@platform/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '@platform/tenant';
import { TenantRoleGuard } from '../auth/guards/tenant-role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { eq } from 'drizzle-orm';
import { tenantUsers } from '@platform/drizzle';

@Controller('tenant-users')
@UseGuards(JwtAuthGuard, TenantGuard, TenantRoleGuard)
export class TenantUsersController {
  constructor(private readonly tenantUsersService: TenantUsersService) {}

  @Post()
  @Roles('tenant_admin')
  @ApiResponseConfig({ message: 'Tenant user created successfully', apiCode: 'TENANT_USER_CREATED' })
  async create(@Body() dto: CreateTenantUserDto, @Request() req: any) {
    return this.tenantUsersService.createUser({
      ...dto,
      tenantId: req.user.tenantId,
      invitedBy: req.user.userId,
    });
  }

  @Get()
  @ApiResponseConfig({ message: 'Tenant users listed successfully', apiCode: 'TENANT_USERS_LISTED' })
  async findAll() {
    return this.tenantUsersService.findMany();
  }

  @Get(':id')
  @ApiResponseConfig({ message: 'Tenant user retrieved successfully', apiCode: 'TENANT_USER_RETRIEVED' })
  async findOne(@Param('id') id: string) {
    return this.tenantUsersService.findFirst(eq(tenantUsers.id, id));
  }

  @Put(':id')
  @Roles('tenant_admin')
  @ApiResponseConfig({ message: 'Tenant user updated successfully', apiCode: 'TENANT_USER_UPDATED' })
  async update(@Param('id') id: string, @Body() dto: UpdateTenantUserDto) {
    return this.tenantUsersService.updateUser(id, dto);
  }

  @Delete(':id')
  @Roles('tenant_admin')
  @ApiResponseConfig({ message: 'Tenant user deactivated successfully', apiCode: 'TENANT_USER_DEACTIVATED' })
  async deactivate(@Param('id') id: string) {
    return this.tenantUsersService.deactivateUser(id);
  }
}
