import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateColumnDto } from './dto/create-column.dto';
import { UpdateColumnDto } from './dto/update-column.dto';

@Injectable()
export class ColumnsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async createColumn(boardId: string, dto: CreateColumnDto) {
    const lastColumn = await this.prisma.column.findFirst({
      where: { boardId },
      orderBy: { order: 'desc' },
      select: { order: true },
    });

    const newOrder = lastColumn ? lastColumn.order + 1000.0 : 1000.0;

    return this.prisma.column.create({
      data: {
        boardId,
        title: dto.title,
        order: newOrder,
      },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async updateColumn(columnId: string, dto: UpdateColumnDto) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    return this.prisma.column.update({
      where: { id: columnId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
      include: {
        tasks: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async deleteColumn(columnId: string) {
    const column = await this.prisma.column.findUnique({
      where: { id: columnId },
    });

    if (!column) {
      throw new NotFoundException('Column not found');
    }

    await this.prisma.column.delete({
      where: { id: columnId },
    });

    return { message: 'Column deleted successfully' };
  }
}
