import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 1. Upsert Demo Users
  const ownerUser = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      passwordHash,
      name: 'Rafiq Hossain',
    },
  });

  const editorUser = await prisma.user.upsert({
    where: { email: 'editor@example.com' },
    update: {},
    create: {
      email: 'editor@example.com',
      passwordHash,
      name: 'Nusrat Jahan',
    },
  });

  const viewerUser = await prisma.user.upsert({
    where: { email: 'viewer@example.com' },
    update: {},
    create: {
      email: 'viewer@example.com',
      passwordHash,
      name: 'Tanvir Ahmed',
    },
  });

  console.log('Demo Users Verified:', {
    owner: ownerUser.email,
    editor: editorUser.email,
    viewer: viewerUser.email,
  });

  // 2. Create demo board if owner has no boards yet
  const existingBoards = await prisma.boardMember.findFirst({
    where: { userId: ownerUser.id },
  });

  if (!existingBoards) {
    const board = await prisma.board.create({
      data: {
        name: 'Engineering Roadmap',
        ownerId: ownerUser.id,
        members: {
          create: [
            { userId: ownerUser.id, role: Role.OWNER },
            { userId: editorUser.id, role: Role.EDITOR },
            { userId: viewerUser.id, role: Role.VIEWER },
          ],
        },
      },
    });

    const todoCol = await prisma.column.create({
      data: {
        boardId: board.id,
        title: 'To Do',
        order: 1000.0,
      },
    });

    const inProgressCol = await prisma.column.create({
      data: {
        boardId: board.id,
        title: 'In Progress',
        order: 2000.0,
      },
    });

    const doneCol = await prisma.column.create({
      data: {
        boardId: board.id,
        title: 'Done',
        order: 3000.0,
      },
    });

    await prisma.task.createMany({
      data: [
        {
          columnId: todoCol.id,
          title: 'Design API Authentication Flow',
          description: 'Set up JWT access and refresh token authentication guards.',
          order: 1000.0,
        },
        {
          columnId: todoCol.id,
          title: 'Implement Board Membership Guard',
          description: 'Verify BoardMember relations for all board routes.',
          order: 2000.0,
        },
        {
          columnId: todoCol.id,
          title: 'Build Fractional Indexing Helper',
          description: 'Compute midpoints for task order calculation.',
          order: 3000.0,
        },
        {
          columnId: inProgressCol.id,
          title: 'Monorepo Scaffold & Prisma Setup',
          description: 'Initialize NestJS, Next.js, and Prisma schema.',
          order: 1000.0,
        },
        {
          columnId: doneCol.id,
          title: 'Project Specification & Scope Alignment',
          description: 'Review project requirements and build order strategy.',
          order: 1000.0,
        },
      ],
    });

    console.log('Demo board created:', board.name);
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
