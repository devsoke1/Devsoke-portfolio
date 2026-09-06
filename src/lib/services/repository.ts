import "server-only";

import type { Prisma } from "@prisma/client";
import db from "@/lib/db";
import type {
  AdminService,
  Service,
  ServiceFaq,
  ServiceHomeIconName,
  ServiceIconName,
  ServiceProcessStep,
  ServiceVisualVariant,
} from "@/lib/portfolio/types";
import type { ServiceInput } from "@/lib/portfolio/validation";
import {
  serviceFaqListSchema,
  serviceProcessListSchema,
} from "@/lib/portfolio/validation";

const serviceOrder = [
  { order: "asc" },
  { createdAt: "asc" },
  { title: "asc" },
] satisfies Prisma.ServiceOrderByWithRelationInput[];

const serviceSelect = {
  id: true,
  slug: true,
  title: true,
  homeTitle: true,
  bookingService: true,
  tagline: true,
  shortDescription: true,
  description: true,
  overviewHeading: true,
  overview: true,
  capabilities: true,
  technologies: true,
  process: true,
  faq: true,
  icon: true,
  homeIcon: true,
  visualVariant: true,
  homeGridClass: true,
  order: true,
  isPublished: true,
} satisfies Prisma.ServiceSelect;

const adminServiceSelect = {
  ...serviceSelect,
  _count: {
    select: {
      projects: true,
    },
  },
} satisfies Prisma.ServiceSelect;

type ServiceRow = Prisma.ServiceGetPayload<{ select: typeof serviceSelect }>;
type AdminServiceRow = Prisma.ServiceGetPayload<{ select: typeof adminServiceSelect }>;

function parseProcess(value: Prisma.JsonValue): ServiceProcessStep[] {
  const parsed = serviceProcessListSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

function parseFaq(value: Prisma.JsonValue): ServiceFaq[] {
  const parsed = serviceFaqListSchema.safeParse(value);
  return parsed.success ? parsed.data : [];
}

export function toService(row: ServiceRow): Service {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    homeTitle: row.homeTitle,
    bookingService: row.bookingService,
    tagline: row.tagline,
    shortDescription: row.shortDescription,
    description: row.description,
    overviewHeading: row.overviewHeading,
    overview: row.overview,
    capabilities: row.capabilities,
    technologies: row.technologies,
    process: parseProcess(row.process),
    faq: parseFaq(row.faq),
    icon: row.icon as ServiceIconName,
    homeIcon: row.homeIcon as ServiceHomeIconName,
    visualVariant: row.visualVariant as ServiceVisualVariant,
    homeGridClass: row.homeGridClass,
    order: row.order,
    isPublished: row.isPublished,
  };
}

function toAdminService(row: AdminServiceRow): AdminService {
  return {
    ...toService(row),
    relatedProjectCount: row._count.projects,
  };
}

function toServiceData(input: ServiceInput): Prisma.ServiceUncheckedCreateInput {
  return {
    slug: input.slug,
    title: input.title,
    homeTitle: input.homeTitle,
    bookingService: input.bookingService,
    tagline: input.tagline,
    shortDescription: input.shortDescription,
    description: input.description,
    overviewHeading: input.overviewHeading,
    overview: input.overview,
    capabilities: input.capabilities,
    technologies: input.technologies,
    process: input.process as Prisma.InputJsonValue,
    faq: input.faq as Prisma.InputJsonValue,
    icon: input.icon,
    homeIcon: input.homeIcon,
    visualVariant: input.visualVariant,
    homeGridClass: input.homeGridClass,
    order: input.order,
    isPublished: input.isPublished,
  };
}

export async function getPublishedServices() {
  const services = await db.service.findMany({
    where: { isPublished: true },
    select: serviceSelect,
    orderBy: serviceOrder,
  });

  return services.map(toService);
}

export async function getAdminServices() {
  const services = await db.service.findMany({
    select: adminServiceSelect,
    orderBy: serviceOrder,
  });

  return services.map(toAdminService);
}

export async function getServiceOptions() {
  return db.service.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      order: true,
      isPublished: true,
    },
    orderBy: serviceOrder,
  });
}

export async function getPublishedServicesBySlugs(slugs: string[]) {
  if (slugs.length === 0) return [];
  const services = await db.service.findMany({
    where: {
      slug: { in: slugs },
      isPublished: true,
    },
    select: serviceSelect,
    orderBy: serviceOrder,
  });

  return services.map(toService);
}

export async function getPublishedServiceBySlug(slug: string) {
  const service = await db.service.findFirst({
    where: {
      slug,
      isPublished: true,
    },
    select: serviceSelect,
  });

  return service ? toService(service) : null;
}

export async function getAdminServiceById(id: string) {
  const service = await db.service.findUnique({
    where: { id },
    select: adminServiceSelect,
  });

  return service ? toAdminService(service) : null;
}

export async function getAdjacentPublishedServices(slug: string) {
  const services = await getPublishedServices();
  const index = services.findIndex((service) => service.slug === slug);

  if (index === -1 || services.length < 2) {
    return { previous: null, next: null };
  }

  return {
    previous: services[(index - 1 + services.length) % services.length],
    next: services[(index + 1) % services.length],
  };
}

export async function createService(input: ServiceInput) {
  const service = await db.service.create({
    data: toServiceData(input),
    select: serviceSelect,
  });

  return toService(service);
}

export async function updateService(id: string, input: ServiceInput) {
  const service = await db.service.update({
    where: { id },
    data: toServiceData(input),
    select: serviceSelect,
  });

  return toService(service);
}

export async function deleteService(id: string) {
  const service = await db.service.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      title: true,
      _count: {
        select: {
          projects: true,
        },
      },
    },
  });

  if (!service) {
    return {
      ok: false as const,
      reason: "missing" as const,
      message: "Service was not found.",
    };
  }

  if (service._count.projects > 0) {
    return {
      ok: false as const,
      reason: "related-projects" as const,
      message: "Remove related project associations before deleting this service.",
    };
  }

  await db.service.delete({
    where: { id },
  });

  return {
    ok: true as const,
    service,
  };
}
