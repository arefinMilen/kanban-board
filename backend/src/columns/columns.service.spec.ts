import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { ColumnsService } from './columns.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ColumnsService', () => {
  let service: ColumnsService;

  const mockPrisma = {
    column: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ColumnsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ColumnsService>(ColumnsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createColumn', () => {
    it('should set order to 1000.0 for the first column on a board', async () => {
      mockPrisma.column.findFirst.mockResolvedValue(null);
      mockPrisma.column.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'c1', ...data }),
      );

      const result = await service.createColumn('board_1', { title: 'To Do' });

      expect(result.order).toBe(1000.0);
      expect(mockPrisma.column.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            boardId: 'board_1',
            title: 'To Do',
            order: 1000.0,
          },
        }),
      );
    });

    it('should increment max order by 1000.0 for subsequent columns', async () => {
      mockPrisma.column.findFirst.mockResolvedValue({ order: 2000.0 });
      mockPrisma.column.create.mockImplementation(({ data }) =>
        Promise.resolve({ id: 'c2', ...data }),
      );

      const result = await service.createColumn('board_1', { title: 'In Progress' });

      expect(result.order).toBe(3000.0);
    });
  });

  describe('deleteColumn', () => {
    it('should throw NotFoundException if column to delete is missing', async () => {
      mockPrisma.column.findUnique.mockResolvedValue(null);

      await expect(service.deleteColumn('missing_col')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
