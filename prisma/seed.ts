import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "ty@hammeritsolution.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me-please-123";
  const adminName = process.env.ADMIN_NAME ?? "Ty Hammer";

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: adminName,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Admin account ready: ${adminEmail}`);
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`(using default password "${adminPassword}" — set ADMIN_PASSWORD to change it)`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
