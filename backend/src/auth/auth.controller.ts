import { Controller, Post, Body, Get, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private jwtService: JwtService,
  ) {}

  @Post('login')
  async iniciarSesion(@Body() body: { email: string; password?: string; pass?: string }) {
    const passwordUser = body.password || body.pass || '';
    return this.authService.login(body.email, passwordUser);
  }

  @Get('me')
  async obtenerPerfil(@Req() request: Request) {
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('No se proveyó el token de autorización');
    }
    
    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, { secret: 'clave_secreta_super_segura_123' });
      return this.authService.getProfile(payload.sub);
    } catch (e) {
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }
}