import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(correo: string, contrasenia: string) {
    const usuarioEncontrado = await this.prisma.users.findUnique({
      where: { email: correo },
    });

    // Validamos la contraseña contra el campo password_hash de tu tabla users
    if (!usuarioEncontrado || usuarioEncontrado.password_hash !== contrasenia) {
      throw new UnauthorizedException('Correo o contraseña incorrectos');
    }

    // Creamos la carga útil (payload) que irá dentro del token
    const payload = { 
      sub: usuarioEncontrado.id, 
      email: usuarioEncontrado.email,
      username: usuarioEncontrado.username 
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: usuarioEncontrado.id,
        username: usuarioEncontrado.username,
        email: usuarioEncontrado.email,
      },
    };
  }

  async getProfile(userId: string) {
    const usuario = await this.prisma.users.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true },
    });
    return usuario;
  }
}