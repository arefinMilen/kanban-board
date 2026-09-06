import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import {
  computeOrderAtPosition,
  generateRenormalizedOrders,
  isGapTooTight,
  MIN_GAP_THRESHOLD,
} from './fractional-indexing.util';

@Injectable()
export class TasksService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async createTask(columnId: string, dto: CreateTaskDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    const lastTask = await this.prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = lastTask ? lastTask.order + 1000.0 : 1000.0;

    return this.prisma.task.create({
      data: {
        columnId,
        title: dto.title,
        description: dto.description ?? null,
        order: newOrder,
      },
    });
  }

  async updateTask(taskId: string, dto: UpdateTaskDto) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async deleteTask(taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({
      where: { id: taskId },
    });

    return { message: 'Task deleted successfully' };
  }

  async moveTask(taskId: string, dto: MoveTaskDto) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Verify target column exists
      const targetColumn = await tx.column.findUnique({
        where: { id: dto.targetColumnId },
      });

      if (!targetColumn) {
        throw new NotFoundException('Target column not found');
      }

      // 2. Verify task exists
      const task = await tx.task.findUnique({
        where: { id: taskId },
      });

      if (!task) {
        throw new NotFoundException('Task not found');
      }

      // 3. Fetch existing tasks in target column, sorted by order asc
      const existingTasks = await tx.task.findMany({
        where: { columnId: dto.targetColumnId },
        orderBy: { order: 'asc' },
      });

      // Filter out the moving task if moving within the same column
      const siblingTasks = existingTasks.filter((t) => t.id !== taskId);
      const siblingOrders = siblingTasks.map((t) => t.order);

      // 4. Compute new fractional order value
      let newOrder = computeOrderAtPosition(dto.targetIndex, siblingOrders);

      // 5. Check if gap is too tight (requires renormalization)
      let needsRenormalization = false;
      if (siblingOrders.length > 0) {
        if (dto.targetIndex > 0 && dto.targetIndex < siblingOrders.length) {
          const prev = siblingOrders[dto.targetIndex - 1];
          const next = siblingOrders[dto.targetIndex];
          if (isGapTooTight(prev, next, MIN_GAP_THRESHOLD)) {
            needsRenormalization = true;
          }
        } else if (dto.targetIndex <= 0) {
          if (siblingOrders[0] < MIN_GAP_THRESHOLD) {
            needsRenormalization = true;
          }
        }
      }

      // 6. Apply movement & optional column-wide renormalization
      if (needsRenormalization) {
        // Construct complete ordered task list at target column
        const fullTaskList = [...siblingTasks];
        const clampedIndex = Math.max(
          0,
          Math.min(dto.targetIndex, fullTaskList.length),
        );

        fullTaskList.splice(clampedIndex, 0, {
          ...task,
          columnId: dto.targetColumnId,
          order: newOrder,
        });

        const cleanOrders = generateRenormalizedOrders(fullTaskList.length);

        // Update all tasks in target column with clean spaced orders
        for (let i = 0; i < fullTaskList.length; i++) {
          const item = fullTaskList[i];
          const cleanOrder = cleanOrders[i];
          await tx.task.update({
            where: { id: item.id },
            data: {
              columnId: dto.targetColumnId,
              order: cleanOrder,
            },
          });
          if (item.id === taskId) {
            newOrder = cleanOrder;
          }
        }
      } else {
        // Simple O(1) single-row update
        await tx.task.update({
          where: { id: taskId },
          data: {
            columnId: dto.targetColumnId,
            order: newOrder,
          },
        });
      }

      // 7. Return updated task
      return tx.task.findUnique({
        where: { id: taskId },
      });
    });
  }
}
