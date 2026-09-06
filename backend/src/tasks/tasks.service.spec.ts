import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { TasksService } from './tasks.service';
import { PrismaService } from '../prisma/prisma.service';

describe('TasksService', () => {
  let service: TasksService;

  const mockPrisma = {
    $transaction: vi.fn((cb) => cb(mockPrisma)),
    column: {
      findUnique: vi.fn(),
    },
    task: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should throw NotFoundException if column does not exist', async () => {
      mockPrisma.column.findUnique.mockResolvedValue(null);

      await expect(
        service.createTask('missing_col', { title: 'New Task' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should calculate initial order 1000.0 for first task in column', async () => {
      mockPrisma.column.findUnique.mockResolvedValue({ id: 'col_1' });
      mockPrisma.task.findFirst.mockResolvedValue(null);
      mockPrisma.task.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 't1', ...data }),
      );

      const result = await service.createTask('col_1', { title: 'First Task' });

      expect(result.order).toBe(1000.0);
    });
  });

  describe('moveTask', () => {
    it('should throw NotFoundException if target column is not found', async () => {
      mockPrisma.column.findUnique.mockResolvedValue(null);

      await expect(
        service.moveTask('t1', { targetColumnId: 'invalid_col', targetIndex: 0 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should calculate midpoint order when moving task into middle of column', async () => {
      mockPrisma.column.findUnique.mockResolvedValue({ id: 'target_col' });
      mockPrisma.task.findUnique
        .mockResolvedValueOnce({ id: 't1', columnId: 'source_col', order: 500 })
        .mockResolvedValueOnce({ id: 't1', columnId: 'target_col', order: 1500 });

      mockPrisma.task.findMany.mockResolvedValue([
        { id: 't_other_1', order: 1000.0 },
        { id: 't_other_2', order: 2000.0 },
      ]);

      mockPrisma.task.update.mockResolvedValue({
        id: 't1',
        columnId: 'target_col',
        order: 1500.0,
      });

      const result = await service.moveTask('t1', {
        targetColumnId: 'target_col',
        targetIndex: 1,
      });

      expect(result.order).toBe(1500.0);
      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 't1' },
          data: { columnId: 'target_col', order: 1500.0 },
        }),
      );
    });
  });
});
