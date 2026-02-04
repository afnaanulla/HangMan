import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async signup(dto: AuthDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          username: dto.username,
          password: hashedPassword,
        },
      });
      delete (user as any).password;
      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new UnauthorizedException('Username already taken');
      }
      throw error;
    }
  }

  async login(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!user) throw new UnauthorizedException('Credentials incorrect');

    const pwMatches = await bcrypt.compare(dto.password, user.password);
    if (!pwMatches) throw new UnauthorizedException('Credentials incorrect');

    return {
      ...(await this.signToken(user.id, user.username)),
      user: { id: user.id, username: user.username }
    };
  }

  async signToken(userId: string, username: string): Promise<{ access_token: string }> {
    const payload = { sub: userId, username };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '7d',
      secret: process.env.JWT_SECRET,
    });

    return { access_token: token };
  }
}
