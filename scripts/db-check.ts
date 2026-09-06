import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), true);

async function checkDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  console.log("==========================================");
  console.log("Devsoke PostgreSQL Connectivity Diagnostic");
  console.log("==========================================");

  if (!databaseUrl || databaseUrl.trim() === "") {
    console.error("❌ DATABASE_URL is not set.");
    console.error("Please configure DATABASE_URL in your .env.local file.");
    console.error("Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public");
    process.exit(1);
  }

  // Obfuscate credentials when logging host/database
  try {
    const parsed = new URL(databaseUrl);
    console.log(`📡 Connecting to PostgreSQL at ${parsed.host} (Database: ${parsed.pathname.slice(1)})...`);
  } catch {
    console.log("📡 Connecting to PostgreSQL...");
  }

  const prisma = new PrismaClient();

  try {
    // Run simple raw query to test connection
    const result = await prisma.$queryRaw<Array<{ current_database: string; version: string }>>`
      SELECT current_database(), version();
    `;

    console.log("✅ PostgreSQL connection successful!");
    if (result && result[0]) {
      console.log(`Database Name: ${result[0].current_database}`);
      console.log(`PostgreSQL Engine: ${result[0].version.split(",")[0]}`);
    }

    // Check table readiness
    const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
      SELECT tablename FROM pg_tables WHERE schemaname = 'public';
    `;

    const tableNames = tables.map((t) => t.tablename);
    console.log(`\n📋 Tables discovered in 'public' schema (${tableNames.length}):`);
    if (tableNames.length > 0) {
      console.log(tableNames.map((n) => `  - ${n}`).join("\n"));
    } else {
      console.log("  (No tables found. Run 'npm run db:migrate' to apply schema migrations.)");
    }

    console.log("\n✅ Database health check passed.");
  } catch (error: unknown) {
    const err = error as Error;
    console.error("\n❌ Database connection failed:");
    console.error(`Message: ${err.message}`);
    console.error("\nTroubleshooting tips:");
    console.error("1. Ensure PostgreSQL service is running.");
    console.error("2. Verify credentials and database name in .env.local.");
    console.error("3. Ensure the target database exists (e.g. 'CREATE DATABASE devsoke;').");
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
