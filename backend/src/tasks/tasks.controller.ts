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
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { BoardAccessGuard } from '../auth/guards/board-access.guard';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @UseGuards(BoardAccessGuard)
  @Roles(Role.OWNER, Role.EDITOR)
  @Post('columns/:columnId/tasks')
  async create(
    @Param('columnId') columnId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasksService.createTask(columnId, dto);
  }

  @UseGuards(BoardAccessGuard)
  @Roles(Role.OWNER, Role.EDITOR)
  @Patch('tasks/:id')
  async update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasksService.updateTask(id, dto);
  }

  @UseGuards(BoardAccessGuard)
  @Roles(Role.OWNER, Role.EDITOR)
  @Delete('tasks/:id')
  async remove(@Param('id') id: string) {
    return this.tasksService.deleteTask(id);
  }

  @UseGuards(BoardAccessGuard)
  @Roles(Role.OWNER, Role.EDITOR)
  @Patch('tasks/:id/move')
  async move(@Param('id') id: string, @Body() dto: MoveTaskDto) {
    return this.tasksService.moveTask(id, dto);
  }
}
