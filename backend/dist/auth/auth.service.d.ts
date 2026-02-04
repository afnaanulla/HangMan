import { PrismaService } from '../prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    signup(dto: AuthDto): Promise<{
        username: string;
        password: string;
        id: string;
        score: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    login(dto: AuthDto): Promise<{
        user: {
            id: string;
            username: string;
        };
        access_token: string;
    }>;
    signToken(userId: string, username: string): Promise<{
        access_token: string;
    }>;
}
