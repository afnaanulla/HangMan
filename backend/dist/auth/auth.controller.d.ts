import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
}
