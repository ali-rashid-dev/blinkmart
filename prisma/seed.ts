import { PrismaClient } from "../src/generated/prisma/client";
import { Role } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

const userData = [
  {
    id: "admin-1",
    name: "Alice",
    email: "alice@prisma.io",
    emailVerified: true,
    role: Role.ADMIN,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "user-1",
    name: "Bob",
    email: "bob@prisma.io",
    emailVerified: true,
    role: Role.USER,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export async function main() {
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  for (const user of userData) {
    await prisma.user.create({ data: user });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });