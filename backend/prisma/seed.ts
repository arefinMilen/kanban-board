import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.boardMember.deleteMany();
  await prisma.board.deleteMany();
  await prisma.user.deleteMany();

  // Create demo users
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const ownerUser = await prisma.user.create({
    data: {
      email: 'owner@example.com',
      passwordHash,
      name: 'Alice Owner',
    },
  });

  const editorUser = await prisma.user.create({
    data: {
      email: 'editor@example.com',
      passwordHash,
      name: 'Bob Editor',
    },
  });

  const viewerUser = await prisma.user.create({
    data: {
      email: 'viewer@example.com',
      passwordHash,
      name: 'Charlie Viewer',
    },
  });

  console.log('Created Users:', {
    owner: ownerUser.email,
    editor: editorUser.email,
    viewer: viewerUser.email,
  });

  // Create demo board
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

  console.log('Created Board:', board.name);

  // Create demo columns with fractional order values
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

  console.log('Created Columns:', [todoCol.title, inProgressCol.title, doneCol.title]);

  // Create demo tasks with fractional indexing order
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
