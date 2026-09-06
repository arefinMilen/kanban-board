import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { ColumnsService } from './columns.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { BoardAccessGuard } from '../auth/guards/board-access.guard';

@Controller()
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @UseGuards(BoardAccessGuard)
  @Roles(Role.OWNER, Role.EDITOR)
  @Post('boards/:boardId/columns')
  async create(
    @Param('boardId') boardId: string,
    @Body() dto: CreateColumnDto,
  ) {
    return this.columnsService.createColumn(boardId, dto);
  }

  @UseGuards(BoardAccessGuard)
  @Roles(Role.OWNER, Role.EDITOR)
  @Patch('columns/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateColumnDto) {
    return this.columnsService.updateColumn(id, dto);
  }

  @UseGuards(BoardAccessGuard)
  @Roles(Role.OWNER, Role.EDITOR)
  @Delete('columns/:id')
  async remove(@Param('id') id: string) {
    return this.columnsService.deleteColumn(id);
  }
}
