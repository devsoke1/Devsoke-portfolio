import { PrismaClient, Prisma } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import { services as staticServices } from "../src/data/services";
import { projects as staticProjects } from "../src/data/projects";

loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();

async function migratePortfolioData() {
  console.log("==========================================");
  console.log("Devsoke Portfolio Static -> DB Migration");
  console.log("==========================================");

  console.log(`\n📦 Found ${staticServices.length} static services.`);
  console.log(`📦 Found ${staticProjects.length} static projects.`);

  // 1. Migrate Services
  console.log("\n⏳ Migrating Services...");
  const serviceSlugToId = new Map<string, string>();

  for (let index = 0; index < staticServices.length; index++) {
    const s = staticServices[index];
    const upserted = await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        title: s.title,
        homeTitle: s.homeTitle,
        bookingService: s.bookingService,
        tagline: s.tagline,
        shortDescription: s.shortDescription,
        description: s.description,
        overviewHeading: s.overviewHeading,
        overview: s.overview,
        capabilities: s.capabilities,
        technologies: s.technologies,
        process: s.process as unknown as Prisma.InputJsonValue,
        faq: s.faq as unknown as Prisma.InputJsonValue,
        icon: s.icon,
        homeIcon: s.homeIcon,
        visualVariant: s.visualVariant,
        homeGridClass: s.homeGridClass ?? "md:col-span-1",
        order: index,
        isPublished: true,
      },
      create: {
        slug: s.slug,
        title: s.title,
        homeTitle: s.homeTitle,
        bookingService: s.bookingService,
        tagline: s.tagline,
        shortDescription: s.shortDescription,
        description: s.description,
        overviewHeading: s.overviewHeading,
        overview: s.overview,
        capabilities: s.capabilities,
        technologies: s.technologies,
        process: s.process as unknown as Prisma.InputJsonValue,
        faq: s.faq as unknown as Prisma.InputJsonValue,
        icon: s.icon,
        homeIcon: s.homeIcon,
        visualVariant: s.visualVariant,
        homeGridClass: s.homeGridClass ?? "md:col-span-1",
        order: index,
        isPublished: true,
      },
    });

    serviceSlugToId.set(upserted.slug, upserted.id);
    console.log(`  ✓ Service: ${upserted.title} (${upserted.slug}) -> ID: ${upserted.id}`);
  }

  // 2. Migrate Projects
  console.log("\n⏳ Migrating Projects & Relations...");
  let totalRelationsCreated = 0;

  for (let index = 0; index < staticProjects.length; index++) {
    const p = staticProjects[index];
    const upsertedProject = await prisma.project.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        category: p.category,
        tag: p.tag,
        desc: p.desc,
        longDesc: p.longDesc,
        challenge: p.challenge,
        solution: p.solution,
        image: p.image,
        tech: p.tech,
        client: p.client,
        timeline: p.timeline,
        demoUrl: p.demoUrl ?? null,
        order: index,
        isFeatured: index < 3,
        isPublished: true,
      },
      create: {
        slug: p.slug,
        title: p.title,
        category: p.category,
        tag: p.tag,
        desc: p.desc,
        longDesc: p.longDesc,
        challenge: p.challenge,
        solution: p.solution,
        image: p.image,
        tech: p.tech,
        client: p.client,
        timeline: p.timeline,
        demoUrl: p.demoUrl ?? null,
        order: index,
        isFeatured: index < 3,
        isPublished: true,
      },
    });

    console.log(`  ✓ Project: ${upsertedProject.title} (${upsertedProject.slug}) -> ID: ${upsertedProject.id}`);

    // Map serviceSlugs to DB Service IDs
    const matchedServiceIds: string[] = [];
    for (const serviceSlug of p.serviceSlugs) {
      const dbServiceId = serviceSlugToId.get(serviceSlug);
      if (dbServiceId) {
        matchedServiceIds.push(dbServiceId);
      } else {
        console.warn(`    ⚠️ Warning: Service slug "${serviceSlug}" not found for project "${p.title}"`);
      }
    }

    // Clean existing ProjectService rows and re-insert idempotently
    await prisma.projectService.deleteMany({
      where: { projectId: upsertedProject.id },
    });

    if (matchedServiceIds.length > 0) {
      await prisma.projectService.createMany({
        data: matchedServiceIds.map((serviceId) => ({
          projectId: upsertedProject.id,
          serviceId,
        })),
        skipDuplicates: true,
      });
      totalRelationsCreated += matchedServiceIds.length;
      console.log(`    ↳ Linked to ${matchedServiceIds.length} service(s)`);
    }
  }

  // 3. Validation & Parity Report
  const finalServiceCount = await prisma.service.count();
  const finalProjectCount = await prisma.project.count();
  const finalRelationCount = await prisma.projectService.count();

  console.log("\n==========================================");
  console.log("Migration Parity Summary");
  console.log("==========================================");
  console.log(`Services : Static ${staticServices.length} | Database ${finalServiceCount}`);
  console.log(`Projects : Static ${staticProjects.length} | Database ${finalProjectCount}`);
  console.log(`Relations: Created ${totalRelationsCreated} | Database ${finalRelationCount}`);

  if (
    finalServiceCount === staticServices.length &&
    finalProjectCount === staticProjects.length
  ) {
    console.log("\n✅ Perfect parity confirmed! Static content is now in PostgreSQL.");
  } else {
    console.warn("\n⚠️ Parity discrepancy detected. Check database tables.");
  }
}

migratePortfolioData()
  .catch((e) => {
    console.error("❌ Migration failed with error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
