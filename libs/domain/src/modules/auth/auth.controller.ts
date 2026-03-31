import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiResponseConfig } from '@platform/common';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiResponseConfig({
    message: 'Login successful',
    apiCode: 'AUTH_LOGIN_SUCCESS',
  })
  async login(@Body() loginDto: LoginDto) {
    let user;

    if (loginDto.tenantId) {
      // 1. Resolve Tenant User
      user = await this.authService.validateTenantUser(
        loginDto.email,
        loginDto.password,
        loginDto.tenantId
      );
    } else {
      // 2. Resolve Platform User
      user = await this.authService.validatePlatformUser(
        loginDto.email,
        loginDto.password
      );
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiResponseConfig({
    message: 'Profile retrieved successfully',
    apiCode: 'AUTH_PROFILE_SUCCESS',
  })
  getProfile(@Request() req: any) {
    return req.user;
  }
}
