import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto, JoinRoomDto } from './dto/room.dto';
export declare class RoomService {
    private prisma;
    constructor(prisma: PrismaService);
    createRoom(userId: string, dto: CreateRoomDto): Promise<any>;
    getRoom(userId: string, roomId: string): Promise<any>;
    getRooms(): Promise<any[]>;
    joinRoom(userId: string, roomId: string, dto: JoinRoomDto): Promise<any>;
    private mapRoom;
    leaveRoom(userId: string, roomId: string): Promise<{
        password: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        playerLimit: number;
        creatorId: string;
    } | undefined>;
    deleteRoom(userId: string, roomId: string): Promise<{
        password: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        playerLimit: number;
        creatorId: string;
    }>;
    kickUser(creatorId: string, roomId: string, userIdToKick: string): Promise<{
        members: {
            username: string;
            id: string;
            score: number;
        }[];
    } & {
        password: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        playerLimit: number;
        creatorId: string;
    }>;
}
