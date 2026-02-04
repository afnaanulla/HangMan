import { RoomService } from './room.service';
import { CreateRoomDto, JoinRoomDto } from './dto/room.dto';
import { GameGateway } from './game.gateway';
export declare class RoomController {
    private roomService;
    private gameGateway;
    constructor(roomService: RoomService, gameGateway: GameGateway);
    createRoom(req: any, dto: CreateRoomDto): Promise<any>;
    getRooms(): Promise<any[]>;
    getRoom(req: any, roomId: string): Promise<any>;
    joinRoom(req: any, roomId: string, dto: JoinRoomDto): Promise<any>;
    leaveRoom(req: any, roomId: string): Promise<{
        password: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        playerLimit: number;
        creatorId: string;
    } | undefined>;
    deleteRoom(req: any, roomId: string): Promise<{
        password: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        playerLimit: number;
        creatorId: string;
    }>;
    kickUser(req: any, roomId: string, userIdToKick: string): Promise<{
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
