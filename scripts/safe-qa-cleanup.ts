import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();

async function main() {
  console.log("==========================================");
  console.log("Devsoke Safe QA Diagnostic & Cleanup");
  console.log("==========================================");

  try {
    // 1. Check PostgreSQL activity
    const activity = await prisma.$queryRaw<Array<{ pid: number; state: string; query: string }>>`
      SELECT pid, state, query 
      FROM pg_stat_activity 
      WHERE datname = current_database() AND pid <> pg_backend_pid();
    `;
    console.log(`\n🔍 Active PostgreSQL database connections: ${activity.length}`);

    // 2. Inspect QA records before deleting
    const qaProjectCount = await prisma.project.count({
      where: { slug: { startsWith: "qa-temp" } },
    });
    const qaServiceCount = await prisma.service.count({
      where: { slug: { startsWith: "qa-temp" } },
    });
    const qaRelationCount = await prisma.projectService.count({
      where: {
        OR: [
          { project: { slug: { startsWith: "qa-temp" } } },
          { service: { slug: { startsWith: "qa-temp" } } },
        ],
      },
    });

    console.log(`\n📋 QA Temp Records Found:`);
    console.log(`  - qa-temp Projects : ${qaProjectCount}`);
    console.log(`  - qa-temp Services : ${qaServiceCount}`);
    console.log(`  - qa-temp Relations: ${qaRelationCount}`);

    // 3. Safe Cleanup if QA records exist
    if (qaProjectCount > 0 || qaServiceCount > 0 || qaRelationCount > 0) {
      console.log("\n🧹 Cleaning temporary QA records in safe relational order...");
      await prisma.$transaction(async (tx) => {
        // Step 1: ProjectService rows related to qa-temp
        const delRelations = await tx.projectService.deleteMany({
          where: {
            OR: [
              { project: { slug: { startsWith: "qa-temp" } } },
              { service: { slug: { startsWith: "qa-temp" } } },
            ],
          },
        });
        console.log(`  ✓ QA relations cleaned: ${delRelations.count}`);

        // Step 2: qa-temp Projects
        const delProjects = await tx.project.deleteMany({
          where: { slug: { startsWith: "qa-temp" } },
        });
        console.log(`  ✓ QA projects cleaned: ${delProjects.count}`);

        // Step 3: qa-temp Services
        const delServices = await tx.service.deleteMany({
          where: { slug: { startsWith: "qa-temp" } },
        });
        console.log(`  ✓ QA services cleaned: ${delServices.count}`);
      });
      console.log("✅ QA records cleanup complete.");
    } else {
      console.log("\n✅ Zero QA records found. Deletion skipped.");
    }

    // 4. Verify Baseline Counts
    const finalServiceCount = await prisma.service.count();
    const finalProjectCount = await prisma.project.count();
    const finalRelationCount = await prisma.projectService.count();
    const finalQaProjects = await prisma.project.count({
      where: { slug: { startsWith: "qa-temp" } },
    });
    const finalQaServices = await prisma.service.count({
      where: { slug: { startsWith: "qa-temp" } },
    });

    console.log("\n==========================================");
    console.log("Current Database Baseline Counts");
    console.log("==========================================");
    console.log(`Real Services count          : ${finalServiceCount} (expected: 7)`);
    console.log(`Real Projects count          : ${finalProjectCount} (expected: 6)`);
    console.log(`ProjectService relations     : ${finalRelationCount} (expected: 11)`);
    console.log(`Remaining qa-temp Projects   : ${finalQaProjects} (expected: 0)`);
    console.log(`Remaining qa-temp Services   : ${finalQaServices} (expected: 0)`);

    const isHealthy =
      finalServiceCount === 7 &&
      finalProjectCount === 6 &&
      finalRelationCount === 11 &&
      finalQaProjects === 0 &&
      finalQaServices === 0;

    if (isHealthy) {
      console.log("\n✅ Database is 100% clean and matches static portfolio parity!");
    } else {
      console.warn("\n⚠️ Parity discrepancy. Run 'npm run data:migrate:portfolio' to re-sync if needed.");
    }
  } catch (err: unknown) {
    const error = err as Error;
    console.error("❌ Diagnostic error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

