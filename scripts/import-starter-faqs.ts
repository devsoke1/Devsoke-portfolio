import { PrismaClient } from "@prisma/client";
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd(), true);

const prisma = new PrismaClient();

const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

type StarterFaqSeed = {
  id: string;
  key: string;
  question: string;
  answer: string;
  placement: "HOME" | "ABOUT" | "SERVICES_INDEX" | "SERVICE_DETAIL" | "CONTACT";
  serviceSlug?: string;
  order: number;
};

const fixedSeeds: StarterFaqSeed[] = [
  {
    id: "starter-faq-home-project-types",
    key: "starter-home-project-types",
    placement: "HOME",
    order: 10,
    question: "What types of software projects does Devsoke handle?",
    answer:
      "Devsoke works on software websites, web applications, ecommerce builds, dashboards, AI workflow integrations, and improvements to existing digital products.",
  },
  {
    id: "starter-faq-home-regions",
    key: "starter-home-regions",
    placement: "HOME",
    order: 20,
    question: "Can you work with clients in the UK, UAE, and Europe?",
    answer:
      "Yes. Devsoke supports remote project enquiries from the UK, UAE, and Europe. The practical engagement details are confirmed after the project context is reviewed.",
  },
  {
    id: "starter-faq-home-enquiry-start",
    key: "starter-home-enquiry-start",
    placement: "HOME",
    order: 30,
    question: "How does a project enquiry begin?",
    answer:
      "Start with the inquiry dialog or contact form. Share the goal, current website or product, target users, and constraints. A person reviews the request and follows up by email.",
  },
  {
    id: "starter-faq-home-existing-product",
    key: "starter-home-existing-product",
    placement: "HOME",
    order: 40,
    question: "Can you improve an existing website or application?",
    answer:
      "Yes. Existing websites and applications can be reviewed for interface, conversion, performance, architecture, content flow, or integration improvements before deciding the next build step.",
  },
  {
    id: "starter-faq-about-approach",
    key: "starter-about-approach",
    placement: "ABOUT",
    order: 10,
    question: "What is Devsoke's approach to project work?",
    answer:
      "The current site presents Devsoke as combining interface craft with practical software architecture, focusing on clear user journeys, maintainable systems, and realistic delivery planning.",
  },
  {
    id: "starter-faq-about-design-development",
    key: "starter-about-design-development",
    placement: "ABOUT",
    order: 20,
    question: "Do you cover both design and development?",
    answer:
      "The public service pages cover design-led interface work and development work across websites, ecommerce, dashboards, AI workflows, and custom software.",
  },
  {
    id: "starter-faq-about-scope",
    key: "starter-about-scope",
    placement: "ABOUT",
    order: 30,
    question: "How is the right scope decided?",
    answer:
      "Scope starts from the business goal, users, existing system, constraints, and the smallest useful next step. The inquiry stage helps decide which service area fits best.",
  },
  {
    id: "starter-faq-services-choose",
    key: "starter-services-choose",
    placement: "SERVICES_INDEX",
    order: 10,
    question: "Which service should I choose?",
    answer:
      "Choose the closest service area if you already know the need. If the scope is unclear, use the general inquiry option and include the current goal, system, and constraints.",
  },
  {
    id: "starter-faq-services-design-dev",
    key: "starter-services-design-dev",
    placement: "SERVICES_INDEX",
    order: 20,
    question: "Do you provide both design and development?",
    answer:
      "Yes, the listed services cover interface design, frontend and backend development, ecommerce, dashboards, AI workflows, and software product work where those needs are part of the scope.",
  },
  {
    id: "starter-faq-services-combined",
    key: "starter-services-combined",
    placement: "SERVICES_INDEX",
    order: 30,
    question: "Can services be combined within one project?",
    answer:
      "Yes. A project can combine service areas when the user journey or technical requirements need it, such as ecommerce with dashboards or a web application with AI workflow support.",
  },
  {
    id: "starter-faq-contact-include",
    key: "starter-contact-include",
    placement: "CONTACT",
    order: 10,
    question: "What information should I include in my enquiry?",
    answer:
      "Include the project goal, current website or application if one exists, target users, important features, timeline constraints, and any systems or integrations involved.",
  },
  {
    id: "starter-faq-contact-booking",
    key: "starter-contact-booking",
    placement: "CONTACT",
    order: 20,
    question: "Does submitting an enquiry confirm a booking?",
    answer:
      "No. Submitting an enquiry sends the project request for review. A calendar time or next step is confirmed separately by email.",
  },
  {
    id: "starter-faq-contact-after-submit",
    key: "starter-contact-after-submit",
    placement: "CONTACT",
    order: 30,
    question: "What happens after I submit a project request?",
    answer:
      "The request is reviewed against the project context you provided. The next step may be a clarification email, a scoped discussion, or a recommendation for a more suitable service path.",
  },
];

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
      `Refusing to import FAQ data into non-local database host "${parsed.hostname}" / database "${databaseName}".`,
    );
  }

  return {
    host: parsed.hostname,
    databaseName,
  };
}

async function importStarterFaqs() {
  const target = requireLocalDatabase();

  console.log("Devsoke starter FAQ import");
  console.log(`Database target: ${target.host}/${target.databaseName}`);

  const services = await prisma.service.findMany({
    where: { isPublished: true },
    select: {
      id: true,
      slug: true,
      title: true,
      homeTitle: true,
      shortDescription: true,
    },
    orderBy: [{ order: "asc" }, { title: "asc" }],
  });

  const serviceIdsBySlug = new Map(
    services.map((service) => [service.slug, service.id]),
  );

  const serviceSeeds = services.flatMap((service, index): StarterFaqSeed[] => [
    {
      id: `starter-faq-service-${service.slug}-scope`,
      key: `starter-service-${service.slug}-scope`,
      placement: "SERVICE_DETAIL",
      serviceSlug: service.slug,
      order: 10 + index * 100,
      question: `What does ${service.homeTitle || service.title} cover?`,
      answer: service.shortDescription,
    },
    {
      id: `starter-faq-service-${service.slug}-combine`,
      key: `starter-service-${service.slug}-combine`,
      placement: "SERVICE_DETAIL",
      serviceSlug: service.slug,
      order: 20 + index * 100,
      question: `Can ${service.homeTitle || service.title} be combined with another service?`,
      answer:
        "Yes. Services can be combined when the project requirements call for related website, ecommerce, dashboard, AI workflow, or custom software work in the same scope.",
    },
  ]);

  const seeds = [...fixedSeeds, ...serviceSeeds];

  const result = await prisma.$transaction(async (tx) => {
    let created = 0;
    let skipped = 0;

    for (const seed of seeds) {
      const existing = await tx.faq.findUnique({
        where: { key: seed.key },
        select: { id: true },
      });

      if (existing) {
        skipped += 1;
        continue;
      }

      const serviceId = seed.serviceSlug
        ? serviceIdsBySlug.get(seed.serviceSlug)
        : null;

      if (seed.placement === "SERVICE_DETAIL" && !serviceId) {
        throw new Error(`Missing service for FAQ seed ${seed.key}.`);
      }

      await tx.faq.create({
        data: {
          id: seed.id,
          key: seed.key,
          question: seed.question,
          answer: seed.answer,
          placement: seed.placement,
          serviceId,
          order: seed.order,
          isPublished: true,
        },
      });

      created += 1;
    }

    const counts = await tx.faq.groupBy({
      by: ["placement"],
      where: {
        key: {
          in: seeds.map((seed) => seed.key),
        },
      },
      _count: {
        _all: true,
      },
      orderBy: {
        placement: "asc",
      },
    });

    return { created, skipped, counts };
  });

  console.log(`Created starter FAQs: ${result.created}`);
  console.log(`Skipped existing starter FAQs: ${result.skipped}`);
  for (const count of result.counts) {
    console.log(`${count.placement}: ${count._count._all}`);
  }
  console.log("Starter FAQ import completed.");
}

importStarterFaqs()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
