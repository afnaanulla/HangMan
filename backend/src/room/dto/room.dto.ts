import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomDto {
  @ApiProperty({ example: 'The Word Smith Room' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'secret123', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 4, minimum: 2, maximum: 10 })
  @IsInt()
  @Min(2)
  @Max(10)
  @IsOptional()
  playerLimit?: number = 4;
}

export class JoinRoomDto {
  @ApiProperty({ example: 'secret123', required: false })
  @IsString()
  @IsOptional()
  password?: string;
}
