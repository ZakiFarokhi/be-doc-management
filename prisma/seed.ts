// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createUser(
  email: string,
  username: string,
  plainPassword: string,
  name: string,
) {
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  return prisma.user.create({
    data: { email, name, username, password: hashedPassword },
  });
}

async function main() {
  const alice = await createUser(
    'alice@example.com',
    'alice',
    'password123',
    'alice',
  );
  const bob = await createUser('bob@example.com', 'bob', 'password123', 'bob');

  const document = await prisma.document.create({
    data: {
      title: 'Contoh Dokumen Publik',
      content: 'Isi dokumen awal.',
      authorId: alice.id,
      visibility: 'PUBLIC',
    },
  });

  await prisma.version.create({
    data: {
      documentId: document.id,
      content: document.content,
      modifiedBy: alice.id,
    },
  });

  await prisma.access.create({
    data: {
      userId: bob.id,
      documentId: document.id,
      permission: 'READ',
    },
  });

  await prisma.notification.create({
    data: {
      userId: bob.id,
      message: 'Alice mentioned you in a document.',
    },
  });

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
