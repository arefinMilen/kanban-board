import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { AddMemberDto } from './dto/add-member.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { BoardAccessGuard } from '../auth/guards/board-access.guard';

@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  async create(
    @CurrentUser('userId') userId: string,
    @Body() dto: CreateBoardDto,
  ) {
    return this.boardsService.createBoard(userId, dto);
  }

  @Get()
  async findAll(@CurrentUser('userId') userId: string) {
    return this.boardsService.getUserBoards(userId);
  }

  @UseGuards(BoardAccessGuard)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.boardsService.getBoardById(id);
  }

  @UseGuards(BoardAccessGuard)
  @Roles(Role.OWNER, Role.EDITOR)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateBoardDto) {
    return this.boardsService.updateBoard(id, dto);
  }

  @UseGuards(BoardAccessGuard)
  @Roles(Role.OWNER)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.boardsService.deleteBoard(id);
  }

  @UseGuards(BoardAccessGuard)
  @Roles(Role.OWNER)
  @Post(':id/members')
  async addMember(@Param('id') id: string, @Body() dto: AddMemberDto) {
    return this.boardsService.addOrUpdateMember(id, dto);
  }

  @UseGuards(BoardAccessGuard)
  @Roles(Role.OWNER)
  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') targetUserId: string,
  ) {
    return this.boardsService.removeMember(id, targetUserId);
  }
}
