import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException, Res } from '@nestjs/common';
import type { Response } from 'express';
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
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) response: Response
  ) {
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

    const { access_token } = await this.authService.login(user);
    
    response.cookie('access_token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    });

    return {
      user: {
        id: user.id || user.sub,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        isPlatformUser: user.isPlatformUser,
      },
    };
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
