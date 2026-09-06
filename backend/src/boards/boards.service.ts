import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class BoardsService {
  constructor(@Inject(PrismaService) private prisma: PrismaService) {}

  async createBoard(userId: string, dto: CreateBoardDto) {
    return this.prisma.$transaction(async (tx) => {
      const board = await tx.board.create({
        data: {
          name: dto.name,
          ownerId: userId,
          members: {
            create: {
              userId: userId,
              role: Role.OWNER,
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          columns: {
            orderBy: { order: 'asc' },
            include: {
              tasks: {
                orderBy: { order: 'asc' },
              },
            },
          },
        },
      });

      return board;
    });
  }

  async getUserBoards(userId: string) {
    const memberships = await this.prisma.boardMember.findMany({
      where: { userId },
      include: {
        board: {
          include: {
            owner: {
              select: { id: true, name: true, email: true },
            },
            members: {
              include: {
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            },
            _count: {
              select: { columns: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return memberships.map((m) => ({
      ...m.board,
      myRole: m.role,
    }));
  }

  async getBoardById(boardId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        columns: {
          orderBy: { order: 'asc' },
          include: {
            tasks: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundException('Board not found');
    }

    return board;
  }

  async updateBoard(boardId: string, dto: UpdateBoardDto) {
    return this.prisma.board.update({
      where: { id: boardId },
      data: { name: dto.name },
    });
  }

  async deleteBoard(boardId: string) {
    await this.prisma.board.delete({
      where: { id: boardId },
    });

    return { message: 'Board deleted successfully' };
  }

  async addOrUpdateMember(boardId: string, dto: AddMemberDto) {
    const targetUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!targetUser) {
      throw new NotFoundException('User with specified email not found');
    }

    const member = await this.prisma.boardMember.upsert({
      where: {
        boardId_userId: {
          boardId,
          userId: targetUser.id,
        },
      },
      update: {
        role: dto.role,
      },
      create: {
        boardId,
        userId: targetUser.id,
        role: dto.role,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return member;
  }

  async removeMember(boardId: string, targetUserId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (board && board.ownerId === targetUserId) {
      throw new BadRequestException('Cannot remove the primary board owner');
    }

    const member = await this.prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: targetUserId,
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Board member not found');
    }

    await this.prisma.boardMember.delete({
      where: {
        boardId_userId: {
          boardId,
          userId: targetUserId,
        },
      },
    });

    return { message: 'Member removed successfully' };
  }
}
