import "server-only";

import type { Prisma } from "@prisma/client";
import db from "@/lib/db";
import { normalizeSlug } from "@/lib/portfolio/slug";
import type { FaqInput } from "./validation";
import type {
  AdminFaq,
  AdminFaqFilters,
  FaqPlacementValue,
  PublicFaq,
} from "./types";

const faqOrder = [
  { order: "asc" },
  { createdAt: "asc" },
  { question: "asc" },
] satisfies Prisma.FaqOrderByWithRelationInput[];

const faqSelect = {
  id: true,
  key: true,
  question: true,
  answer: true,
  placement: true,
  serviceId: true,
  order: true,
  isPublished: true,
  createdAt: true,
  updatedAt: true,
  service: {
    select: {
      id: true,
      slug: true,
      title: true,
    },
  },
} satisfies Prisma.FaqSelect;

type FaqRow = Prisma.FaqGetPayload<{ select: typeof faqSelect }>;
type FaqMutationData = Omit<
  Prisma.FaqUncheckedCreateInput,
  "id" | "key" | "createdAt" | "updatedAt"
>;

export class FaqServiceSelectionError extends Error {
  constructor(message = "Selected service could not be found.") {
    super(message);
    this.name = "FaqServiceSelectionError";
  }
}

function toPublicFaq(row: FaqRow): PublicFaq {
  return {
    id: row.id,
    key: row.key,
    question: row.question,
    answer: row.answer,
    placement: row.placement as FaqPlacementValue,
    serviceId: row.serviceId,
    order: row.order,
  };
}

function toAdminFaq(row: FaqRow): AdminFaq {
  return {
    ...toPublicFaq(row),
    isPublished: row.isPublished,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    service: row.service,
  };
}

function toFaqData(input: FaqInput): FaqMutationData {
  return {
    question: input.question,
    answer: input.answer,
    placement: input.placement,
    serviceId: input.placement === "SERVICE_DETAIL" ? input.serviceId : null,
    order: input.order,
    isPublished: input.isPublished,
  };
}

async function verifyServiceId(
  tx: Prisma.TransactionClient,
  input: FaqInput,
) {
  if (input.placement !== "SERVICE_DETAIL") {
    return;
  }

  if (!input.serviceId) {
    throw new FaqServiceSelectionError(
      "Choose a service for individual service page FAQs.",
    );
  }

  const service = await tx.service.findUnique({
    where: { id: input.serviceId },
    select: { id: true },
  });

  if (!service) {
    throw new FaqServiceSelectionError();
  }
}

async function createUniqueFaqKey(
  tx: Prisma.TransactionClient,
  question: string,
) {
  const normalized = normalizeSlug(question).slice(0, 80);
  const base = normalized ? `admin-${normalized}` : "admin-faq";
  let key = base;
  let suffix = 2;

  while (await tx.faq.findUnique({ where: { key }, select: { id: true } })) {
    key = `${base}-${suffix}`;
    suffix += 1;
  }

  return key;
}

export async function getPublishedFaqsForPlacement(
  placement: Exclude<FaqPlacementValue, "SERVICE_DETAIL">,
  limit?: number,
) {
  const faqs = await db.faq.findMany({
    where: {
      placement,
      isPublished: true,
    },
    select: faqSelect,
    orderBy: faqOrder,
    take: limit,
  });

  return faqs.map(toPublicFaq);
}

export async function getPublishedFaqsForService(serviceSlug: string) {
  const faqs = await db.faq.findMany({
    where: {
      placement: "SERVICE_DETAIL",
      isPublished: true,
      service: {
        is: {
          slug: serviceSlug,
          isPublished: true,
        },
      },
    },
    select: faqSelect,
    orderBy: faqOrder,
  });

  return faqs.map(toPublicFaq);
}

export async function getAdminFaqs(filters: AdminFaqFilters = {}) {
  const where: Prisma.FaqWhereInput = {};
  const query = filters.query?.trim();

  if (filters.placement) {
    where.placement = filters.placement;
  }

  if (filters.status) {
    where.isPublished = filters.status === "published";
  }

  if (query) {
    where.OR = [
      { question: { contains: query, mode: "insensitive" } },
      { answer: { contains: query, mode: "insensitive" } },
      { key: { contains: query, mode: "insensitive" } },
      {
        service: {
          is: {
            title: { contains: query, mode: "insensitive" },
          },
        },
      },
    ];
  }

  const faqs = await db.faq.findMany({
    where,
    select: faqSelect,
    orderBy: faqOrder,
  });

  return faqs.map(toAdminFaq);
}

export async function getAdminFaqById(id: string) {
  const faq = await db.faq.findUnique({
    where: { id },
    select: faqSelect,
  });

  return faq ? toAdminFaq(faq) : null;
}

export async function createFaq(input: FaqInput) {
  return db.$transaction(async (tx) => {
    await verifyServiceId(tx, input);
    const key = await createUniqueFaqKey(tx, input.question);

    const faq = await tx.faq.create({
      data: {
        key,
        ...toFaqData(input),
      },
      select: faqSelect,
    });

    return toAdminFaq(faq);
  });
}

export async function updateFaq(id: string, input: FaqInput) {
  return db.$transaction(async (tx) => {
    await verifyServiceId(tx, input);

    const faq = await tx.faq.update({
      where: { id },
      data: toFaqData(input),
      select: faqSelect,
    });

    return toAdminFaq(faq);
  });
}

export async function toggleFaqPublished(id: string) {
  return db.$transaction(async (tx) => {
    const existing = await tx.faq.findUnique({
      where: { id },
      select: { isPublished: true },
    });

    if (!existing) {
      return null;
    }

    const faq = await tx.faq.update({
      where: { id },
      data: { isPublished: !existing.isPublished },
      select: faqSelect,
    });

    return toAdminFaq(faq);
  });
}

export async function deleteFaq(id: string) {
  const faq = await db.faq.findUnique({
    where: { id },
    select: faqSelect,
  });

  if (!faq) {
    return {
      ok: false as const,
      message: "FAQ was not found.",
    };
  }

  await db.faq.delete({
    where: { id },
  });

  return {
    ok: true as const,
    faq: toAdminFaq(faq),
  };
}
