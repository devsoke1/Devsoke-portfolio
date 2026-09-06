import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed verification...");

  // Verify connection by running a basic ping / count
  const userCount = await prisma.adminUser.count();
  const serviceCount = await prisma.service.count();
  const projectCount = await prisma.project.count();
  const postCount = await prisma.blogPost.count();
  const bookingCount = await prisma.booking.count();

  console.log("Database connection established successfully.");
  console.log({
    adminUsers: userCount,
    services: serviceCount,
    projects: projectCount,
    blogPosts: postCount,
    bookings: bookingCount,
  });

  console.log("✅ Seed verification complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed with error:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
