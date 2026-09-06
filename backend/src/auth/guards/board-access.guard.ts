import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class BoardAccessGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private reflector: Reflector = new Reflector(),
    @Inject(PrismaService) private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      return false;
    }

    const params = request.params;
    let boardId: string | null = null;

    // 1. Direct boardId param
    if (params.boardId) {
      boardId = params.boardId;
    }
    // 2. Direct board route with :id param (e.g. /boards/:id)
    else if (params.id && request.route?.path?.includes('/boards/:id')) {
      boardId = params.id;
    }
    // 3. Resolve via columnId param (e.g. /columns/:columnId/tasks)
    else if (params.columnId) {
      const column = await this.prisma.column.findUnique({
        where: { id: params.columnId },
        select: { boardId: true },
      });
      if (!column) {
        throw new NotFoundException('Board not found');
      }
      boardId = column.boardId;
    }
    // 4. Resolve via column :id param (e.g. PATCH /columns/:id, DELETE /columns/:id)
    else if (params.id && request.route?.path?.includes('/columns/:id')) {
      const column = await this.prisma.column.findUnique({
        where: { id: params.id },
        select: { boardId: true },
      });
      if (!column) {
        throw new NotFoundException('Board not found');
      }
      boardId = column.boardId;
    }
    // 5. Resolve via task :id param (e.g. PATCH /tasks/:id, PATCH /tasks/:id/move)
    else if (params.id && request.route?.path?.includes('/tasks/:id')) {
      const task = await this.prisma.task.findUnique({
        where: { id: params.id },
        select: { column: { select: { boardId: true } } },
      });
      if (!task || !task.column) {
        throw new NotFoundException('Board not found');
      }
      boardId = task.column.boardId;
    }

    // If route doesn't involve a specific board resource, pass guard
    if (!boardId) {
      return true;
    }

    // Verify board exists and user is a member
    const member = await this.prisma.boardMember.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: user.userId,
        },
      },
      include: {
        board: true,
      },
    });

    // Return 404 for non-existent board OR unauthorized non-member to avoid leaking board existence
    if (!member || !member.board) {
      throw new NotFoundException('Board not found');
    }

    // Attach boardMember and boardId to request
    request.boardMember = member;
    request.boardId = boardId;

    // Check role requirements if specified via @Roles(...)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(member.role);
      if (!hasRole) {
        throw new ForbiddenException('Insufficient permissions for this action');
      }
    }

    return true;
  }
}
