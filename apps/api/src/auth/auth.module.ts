import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { TenantRoleGuard } from './guards/tenant-role.guard';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'super-secret-change-in-prod',
      signOptions: { expiresIn: (process.env.JWT_EXPIRATION || '1d') as any },
    }),
  ],
  providers: [AuthService, JwtStrategy, TenantRoleGuard],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
