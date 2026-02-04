import { Controller, Post, Param, UseGuards, Req, Body } from '@nestjs/common';
import { GameService } from './game.service';
import { JwtGuard } from '../auth/guard/jwt.guard';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { IsString, IsLowercase, Length } from 'class-validator';

class GuessDto {
  @ApiProperty({ example: 'a' })
  @IsString()
  @Length(1, 1)
  letter: string;
}

@ApiTags('game')
@ApiBearerAuth()
@UseGuards(JwtGuard)
@Controller('rooms/:roomId/game')
export class GameController {
  constructor(private gameService: GameService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new game (Creator only)' })
  startGame(@Req() req: any, @Param('roomId') roomId: string) {
    return this.gameService.startGame(req.user.id, roomId);
  }

  @Post('guess')
  @ApiOperation({ summary: 'Make a letter guess' })
  makeGuess(@Req() req: any, @Param('roomId') roomId: string, @Body() dto: GuessDto) {
    return this.gameService.makeGuess(req.user.id, roomId, dto.letter);
  }
}
