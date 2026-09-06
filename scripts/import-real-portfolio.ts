import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";
import {
  legacyDummyProjectSlugs,
  projects as realPortfolioProjects,
} from "../src/data/projects";

loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
const featuredProjectSlugs = new Set([
  "warda-restaurant",
  "the-fix-tech",
  "shanzara",
]);

function requireLocalDatabase() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const parsed = new URL(databaseUrl);
  const databaseName = parsed.pathname.replace(/^\//, "");
  const looksLocal =
    localHosts.has(parsed.hostname) ||
    /\b(dev|local|test)\b/i.test(databaseName);

  if (!looksLocal) {
    throw new Error(
      `Refusing to import portfolio data into non-local database host "${parsed.hostname}" / database "${databaseName}".`,
    );
  }

  return {
    host: parsed.hostname,
    databaseName,
  };
}

async function importRealPortfolio() {
  const target = requireLocalDatabase();

  console.log("Devsoke real portfolio import");
  console.log(`Database target: ${target.host}/${target.databaseName}`);

  const result = await prisma.$transaction(async (tx) => {
    const serviceRows = await tx.service.findMany({
      where: {
        slug: {
          in: Array.from(
            new Set(realPortfolioProjects.flatMap((project) => project.serviceSlugs)),
          ),
        },
      },
      select: {
        id: true,
        slug: true,
      },
    });

    const serviceIdsBySlug = new Map(
      serviceRows.map((service) => [service.slug, service.id]),
    );

    const unpublishedLegacy = await tx.project.updateMany({
      where: {
        slug: {
          in: [...legacyDummyProjectSlugs],
        },
      },
      data: {
        isPublished: false,
        isFeatured: false,
      },
    });

    const upserted: Array<{ id: string; slug: string; title: string }> = [];
    const missingServiceLinks: Array<{ project: string; serviceSlug: string }> = [];

    for (let index = 0; index < realPortfolioProjects.length; index++) {
      const project = realPortfolioProjects[index];
      const data = {
        title: project.title,
        category: project.category,
        tag: project.tag,
        desc: project.desc,
        longDesc: project.longDesc,
        challenge: project.challenge,
        solution: project.solution,
        image: project.image,
        tech: project.tech,
        client: project.client,
        timeline: project.timeline,
        demoUrl: project.demoUrl ?? null,
        order: index,
        isFeatured: featuredProjectSlugs.has(project.slug),
        isPublished: true,
      };

      const upsertedProject = await tx.project.upsert({
        where: { slug: project.slug },
        update: data,
        create: {
          slug: project.slug,
          featuredMediaId: null,
          ...data,
        },
        select: {
          id: true,
          slug: true,
          title: true,
        },
      });

      upserted.push(upsertedProject);

      const relatedServiceIds = project.serviceSlugs
        .map((serviceSlug) => {
          const serviceId = serviceIdsBySlug.get(serviceSlug);

          if (!serviceId) {
            missingServiceLinks.push({
              project: project.title,
              serviceSlug,
            });
          }

          return serviceId;
        })
        .filter((serviceId): serviceId is string => Boolean(serviceId));

      await tx.projectService.deleteMany({
        where: { projectId: upsertedProject.id },
      });

      if (relatedServiceIds.length > 0) {
        await tx.projectService.createMany({
          data: relatedServiceIds.map((serviceId) => ({
            projectId: upsertedProject.id,
            serviceId,
          })),
          skipDuplicates: true,
        });
      }
    }

    const publishedRealCount = await tx.project.count({
      where: {
        slug: {
          in: realPortfolioProjects.map((project) => project.slug),
        },
        isPublished: true,
      },
    });

    const stillPublishedLegacy = await tx.project.count({
      where: {
        slug: {
          in: [...legacyDummyProjectSlugs],
        },
        isPublished: true,
      },
    });

    return {
      unpublishedLegacy: unpublishedLegacy.count,
      upserted,
      missingServiceLinks,
      publishedRealCount,
      stillPublishedLegacy,
    };
  });

  console.log(`Upserted real projects: ${result.upserted.length}`);
  console.log(`Unpublished legacy dummy projects: ${result.unpublishedLegacy}`);
  console.log(`Published real project count: ${result.publishedRealCount}`);
  console.log(`Published legacy dummy count: ${result.stillPublishedLegacy}`);

  if (result.missingServiceLinks.length > 0) {
    console.warn("Missing service links:");
    for (const missing of result.missingServiceLinks) {
      console.warn(`- ${missing.project}: ${missing.serviceSlug}`);
    }
  }

  if (
    result.upserted.length !== realPortfolioProjects.length ||
    result.publishedRealCount !== realPortfolioProjects.length ||
    result.stillPublishedLegacy !== 0
  ) {
    throw new Error("Portfolio import verification failed.");
  }

  console.log("Real portfolio import completed.");
}

importRealPortfolio()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
