import { Body, Controller, Post, Get, Delete, Param, UseGuards, Req, Patch } from '@nestjs/common';
import { RoomService } from './room.service';
import { CreateRoomDto, JoinRoomDto } from './dto/room.dto';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { GameGateway } from './game.gateway';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('rooms')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('rooms')
export class RoomController {
  constructor(
    private roomService: RoomService,
    private gameGateway: GameGateway,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new game room' })
  createRoom(@Req() req: any, @Body() dto: CreateRoomDto) {
    return this.roomService.createRoom(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all active rooms' })
  getRooms() {
    return this.roomService.getRooms();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a specific room' })
  getRoom(@Req() req: any, @Param('id') roomId: string) {
    return this.roomService.getRoom(req.user.id, roomId);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join an existing room' })
  joinRoom(@Req() req: any, @Param('id') roomId: string, @Body() dto: JoinRoomDto) {
    return this.roomService.joinRoom(req.user.id, roomId, dto);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave a room' })
  leaveRoom(@Req() req: any, @Param('id') roomId: string) {
    return this.roomService.leaveRoom(req.user.id, roomId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a room (Creator only)' })
  async deleteRoom(@Req() req: any, @Param('id') roomId: string) {
    const result = await this.roomService.deleteRoom(req.user.id, roomId);
    this.gameGateway.notifyRoomDeleted(roomId);
    this.gameGateway.broadcastRoomList();
    return result;
  }

  @Patch(':id/kick/:userId')
  @ApiOperation({ summary: 'Kick a user from the room (Creator only)' })
  async kickUser(@Req() req: any, @Param('id') roomId: string, @Param('userId') userIdToKick: string) {
    const result = await this.roomService.kickUser(req.user.id, roomId, userIdToKick);
    this.gameGateway.notifyKicked(roomId, userIdToKick);
    this.gameGateway.broadcastRoomList();
    return result;
  }
}
