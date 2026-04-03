import { Injectable } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { db, tenantUsers } from '@platform/drizzle';
import { BaseRepository } from '@platform/drizzle/repository';

@Injectable()
export class TenantUsersService extends BaseRepository<typeof tenantUsers> {
  constructor() {
    super(tenantUsers, db);
  }

  async createUser(data: {
    tenantId: string;
    email: string;
    name: string;
    password: string;
    role: string;
    invitedBy?: string;
  }) {
    const passwordHash = await bcrypt.hash(data.password, 10);
    return this._db
      .insert(tenantUsers)
      .values({
        tenantId: data.tenantId,
        email: data.email,
        name: data.name,
        passwordHash,
        role: data.role,
        status: 'active',
        invitedBy: data.invitedBy,
      })
      .returning();
  }

  async updateUser(id: string, data: { name?: string; role?: string; status?: string; password?: string }) {
    const updateData: any = { updatedAt: new Date() };
    if (data.name) updateData.name = data.name;
    if (data.role) updateData.role = data.role;
    if (data.status) updateData.status = data.status;
    if (data.password) updateData.passwordHash = await bcrypt.hash(data.password, 10);

    return this.update(eq(tenantUsers.id, id), updateData);
  }

  async deactivateUser(id: string) {
    return this.update(eq(tenantUsers.id, id), { status: 'inactive', updatedAt: new Date() });
  }
}
