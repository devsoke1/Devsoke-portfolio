import { PrismaClient, AdminRole } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import { hash } from "bcryptjs";

loadEnvConfig(process.cwd(), true);

const PASSWORD_MIN_LENGTH = 12;

const prisma = new PrismaClient();

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function main() {
  const email = normalizeEmail(process.env.INITIAL_ADMIN_EMAIL ?? "");
  const password = process.env.INITIAL_ADMIN_PASSWORD ?? "";
  const name = process.env.INITIAL_ADMIN_NAME?.trim() || undefined;

  if (!email || !password) {
    console.error("Missing INITIAL_ADMIN_EMAIL or INITIAL_ADMIN_PASSWORD.");
    console.error("Add them to .env.local for one-time admin creation, then rerun npm run admin:create.");
    process.exit(1);
  }

  if (!isValidEmail(email)) {
    console.error("INITIAL_ADMIN_EMAIL is not a valid email address.");
    process.exit(1);
  }

  if (password.length < PASSWORD_MIN_LENGTH) {
    console.error(`INITIAL_ADMIN_PASSWORD must be at least ${PASSWORD_MIN_LENGTH} characters long.`);
    process.exit(1);
  }

  const existing = await prisma.adminUser.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existing) {
    console.error("An admin user already exists for the configured email.");
    process.exit(1);
  }

  const adminCount = await prisma.adminUser.count();
  const passwordHash = await hash(password, 12);

  await prisma.adminUser.create({
    data: {
      email,
      name,
      passwordHash,
      role: adminCount === 0 ? AdminRole.SUPER_ADMIN : AdminRole.ADMIN,
    },
  });

  console.log("Admin user created successfully for the configured email.");
  console.log(`Role assigned: ${adminCount === 0 ? AdminRole.SUPER_ADMIN : AdminRole.ADMIN}`);
}

main()
  .catch(() => {
    console.error("Admin creation failed.");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
