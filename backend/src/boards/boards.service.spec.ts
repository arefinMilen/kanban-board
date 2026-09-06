import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { Role } from '@prisma/client';
import { BoardsService } from './boards.service';
import { PrismaService } from '../prisma/prisma.service';

describe('BoardsService', () => {
  let service: BoardsService;

  const mockPrisma = {
    $transaction: vi.fn((cb) => cb(mockPrisma)),
    board: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    boardMember: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      upsert: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<BoardsService>(BoardsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getBoardById', () => {
    it('should throw NotFoundException if board does not exist', async () => {
      mockPrisma.board.findUnique.mockResolvedValue(null);

      await expect(service.getBoardById('non_existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return board details when found', async () => {
      const mockBoard = { id: 'b1', name: 'Sprint 1', columns: [], members: [] };
      mockPrisma.board.findUnique.mockResolvedValue(mockBoard);

      const result = await service.getBoardById('b1');
      expect(result).toEqual(mockBoard);
    });
  });

  describe('addOrUpdateMember', () => {
    it('should throw NotFoundException if user email does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.addOrUpdateMember('b1', {
          email: 'unknown@example.com',
          role: Role.EDITOR,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
