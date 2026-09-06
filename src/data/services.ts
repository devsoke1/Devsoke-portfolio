export const serviceSlugs = {
  web: "web-development-engineering",
  ai: "ai-neural-integration",
  dashboards: "company-dashboards-telemetry",
  ecommerce: "custom-ecommerce-platforms",
  mobile: "mobile-app-development",
  saas: "saas-tools-software",
  seo: "seo-digital-growth-marketing",
} as const;

export type ServiceSlug = (typeof serviceSlugs)[keyof typeof serviceSlugs];

export type ServiceIconName =
  | "Code2"
  | "Cpu"
  | "BarChart4"
  | "ShoppingBag"
  | "Smartphone"
  | "Layers"
  | "LineChart";

export type ServiceHomeIconName = ServiceIconName | "Globe" | "BarChart3" | "Search";

export type ServiceVisualVariant =
  | "blueprint"
  | "neural"
  | "telemetry"
  | "commerce"
  | "mobile"
  | "saas"
  | "growth";

export interface ServiceProcessStep {
  title: string;
  description: string;
}

export interface ServiceFaq {
  question: string;
  answer: string;
}

export interface Service {
  id: string;
  slug: ServiceSlug;
  icon: ServiceIconName;
  homeIcon: ServiceHomeIconName;
  visualVariant: ServiceVisualVariant;
  title: string;
  homeTitle: string;
  bookingService: string;
  tagline: string;
  shortDescription: string;
  description: string;
  overviewHeading: string;
  overview: string[];
  capabilities: string[];
  technologies: string[];
  process: ServiceProcessStep[];
  faq: ServiceFaq[];
  relatedProjectIds: string[];
  homeGridClass: string;
}

export const services: Service[] = [
  {
    id: "web-dev",
    slug: serviceSlugs.web,
    icon: "Code2",
    homeIcon: "Globe",
    visualVariant: "blueprint",
    title: "Web Development & Engineering",
    homeTitle: "Web Development",
    bookingService: "Web Development",
    tagline: "Ultra-fast, responsive interactive systems",
    shortDescription: "Fast, responsive, and SEO-optimized web systems tailored to your workflows.",
    description: "We develop responsive frontend applications using modern frameworks like Next.js, React, and Vite, backed by lightweight and secure APIs. Performance, modular design, and robust security are engineered directly into every line of code.",
    overviewHeading: "Frontends with a real engineering backbone.",
    overview: [
      "This service covers modern web products that need to look sharp, load cleanly, and keep complex UI states manageable. The work can include marketing surfaces, product dashboards, interactive 3D interfaces, and application frontends.",
      "The build is planned around reusable components, responsive behavior, secure integrations, and performance-minded delivery so the interface can grow without becoming brittle.",
    ],
    capabilities: [
      "Server-Side Rendering (SSR) & Static Generation",
      "WebGL, Three.js, & Framer Motion integrations",
      "API Gateway & microservices architecture",
      "Enterprise-grade performance optimization",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Node.js", "GraphQL", "Tailwind CSS"],
    process: [
      {
        title: "Discovery",
        description: "Clarify the product goals, content structure, audience, and core user flows before implementation starts.",
      },
      {
        title: "Architecture",
        description: "Define routing, component boundaries, data needs, and responsive layout rules around the existing brand direction.",
      },
      {
        title: "Development",
        description: "Build the interface with reusable React components, typed data contracts, and carefully scoped interaction states.",
      },
      {
        title: "QA",
        description: "Check key breakpoints, loading states, accessibility, motion behavior, and browser-level layout risks.",
      },
      {
        title: "Delivery",
        description: "Prepare a clean handoff with the routes, components, and assets organized for future iteration.",
      },
    ],
    faq: [
      {
        question: "Can this service improve an existing website?",
        answer: "Yes. The work can focus on a new build, a targeted rebuild, or front-end improvements inside an existing Next.js, React, or similar application.",
      },
      {
        question: "Does this include responsive design?",
        answer: "Responsive behavior is part of the implementation scope, including mobile stacking, tablet transitions, desktop containers, and interaction states.",
      },
      {
        question: "Can WebGL or advanced motion be included?",
        answer: "Yes, when it supports the experience. The goal is to use 3D and animation intentionally instead of making the page heavier than it needs to be.",
      },
    ],
    relatedProjectIds: [
      "warda-restaurant",
      "the-fix-tech",
      "house-and-shop-appliances",
      "nexa-repairs",
      "thailander-restaurant",
      "shanzara",
    ],
    homeGridClass: "md:col-span-2",
  },
  {
    id: "ai-dev",
    slug: serviceSlugs.ai,
    icon: "Cpu",
    homeIcon: "Cpu",
    visualVariant: "neural",
    title: "AI & Neural Integration",
    homeTitle: "AI Integration & Agents",
    bookingService: "AI Integration & Development",
    tagline: "Empowering software with smart automation",
    shortDescription: "Incorporate large language models and smart workflows into your business operations.",
    description: "Implement modern artificial intelligence pipelines into your software. We build Large Language Model (LLM) agents, custom semantic search indices, Retrieval-Augmented Generation (RAG) databases, and neural models that automate complex processes.",
    overviewHeading: "AI features that fit into real product workflows.",
    overview: [
      "This service is for software that needs model-backed automation, retrieval, parsing, or assistant-style workflows inside an actual application surface.",
      "The work centers on clear inputs, controlled outputs, useful guardrails, and integration points that make the AI layer maintainable rather than mysterious.",
    ],
    capabilities: [
      "Custom LLM API connectors (OpenAI, Anthropic, Gemini)",
      "Vector databases (Pinecone, pgvector) for RAG networks",
      "Autonomous workflow orchestration & automation agents",
      "Data parsing and training-set optimization",
    ],
    technologies: ["Python", "PyTorch", "LangChain", "OpenAI API", "Pinecone", "Hugging Face"],
    process: [
      {
        title: "Workflow Mapping",
        description: "Identify where model assistance is useful, what should stay deterministic, and what users need to review.",
      },
      {
        title: "Context Planning",
        description: "Plan prompts, retrieval data, semantic search needs, and structured inputs around the product workflow.",
      },
      {
        title: "Integration",
        description: "Connect model APIs, retrieval layers, queues, or parsing utilities to the app interface.",
      },
      {
        title: "Guardrails",
        description: "Shape fallback states, validation paths, and user controls so generated output is easier to inspect.",
      },
      {
        title: "Iteration",
        description: "Test outputs against real use cases and refine the experience around clarity, reliability, and speed.",
      },
    ],
    faq: [
      {
        question: "Does every project need a custom model?",
        answer: "No. Many useful AI features are built by combining existing model APIs, retrieval, prompts, and product-specific workflow design.",
      },
      {
        question: "Can this connect to existing app data?",
        answer: "Yes, when the app has usable source data and access rules. The implementation can be designed around controlled retrieval and clear permission boundaries.",
      },
      {
        question: "What should be prepared before starting?",
        answer: "Helpful inputs include sample tasks, example documents or records, expected output formats, and any constraints the assistant must respect.",
      },
    ],
    relatedProjectIds: [],
    homeGridClass: "md:col-span-1",
  },
  {
    id: "dashboards",
    slug: serviceSlugs.dashboards,
    icon: "BarChart4",
    homeIcon: "BarChart3",
    visualVariant: "telemetry",
    title: "Company Dashboards & Telemetry",
    homeTitle: "Company Dashboards",
    bookingService: "Company Dashboards",
    tagline: "Live telemetry and performance monitoring",
    shortDescription: "Interactive dashboards with real-time tracking, metrics telemetry, and high performance.",
    description: "Make decisions based on secure real-time data portals. We engineer company dashboards that render live data streams, track user events, display transaction metrics, and connect directly to cloud databases.",
    overviewHeading: "Operational interfaces built for fast reading.",
    overview: [
      "Dashboard work is about making important signals easier to scan, compare, and act on. That can include telemetry panels, internal portals, chart-heavy views, and admin-facing product surfaces.",
      "The focus is on clear information hierarchy, stable chart containers, responsive grids, and data states that communicate what is live, loading, filtered, or unavailable.",
    ],
    capabilities: [
      "WebSocket connections for real-time telemetry updates",
      "Highly-interactive charting components (Recharts, D3.js)",
      "Secure Role-Based Access Control (RBAC) schemas",
      "Database optimization for fast analytical queries",
    ],
    technologies: ["React Query", "Recharts", "Express.js", "PostgreSQL", "Redis", "WebSockets"],
    process: [
      {
        title: "Metrics Mapping",
        description: "Define the core entities, dashboard views, and data relationships that the interface needs to show.",
      },
      {
        title: "State Design",
        description: "Plan live states, empty states, filters, permissions, and layout density before building charts.",
      },
      {
        title: "Interface Build",
        description: "Create responsive dashboard panels, tables, charts, and controls that stay legible under real usage.",
      },
      {
        title: "Integration QA",
        description: "Test data flows, refresh behavior, error handling, and the way dense views collapse at tablet sizes.",
      },
      {
        title: "Handoff",
        description: "Document the dashboard patterns and reusable data display components for future portal expansion.",
      },
    ],
    faq: [
      {
        question: "Can this be used for internal teams?",
        answer: "Yes. The layout and data patterns can be shaped for internal operations, customer portals, reporting tools, or product dashboards.",
      },
      {
        question: "Do dashboards have to be real-time?",
        answer: "No. Some dashboards are real-time, while others are better served by scheduled refreshes, cached data, or manually triggered updates.",
      },
      {
        question: "Can existing data sources be used?",
        answer: "Yes, if the source data is accessible and structured enough to support the views. The frontend can be planned around current and future data sources.",
      },
    ],
    relatedProjectIds: [],
    homeGridClass: "md:col-span-1",
  },
  {
    id: "ecommerce",
    slug: serviceSlugs.ecommerce,
    icon: "ShoppingBag",
    homeIcon: "ShoppingBag",
    visualVariant: "commerce",
    title: "Custom Ecommerce Platforms",
    homeTitle: "E-commerce Development",
    bookingService: "E-commerce Development",
    tagline: "Frictionless checkout and conversion optimization",
    shortDescription: "Complete online retail setups with optimized checkout flows, inventory portals, and search filters.",
    description: "Support online retail with custom e-commerce experiences. We build secure checkout pipelines, dynamic filtering indices, multi-tier pricing structures, and inventory dashboards for cleaner purchase flows.",
    overviewHeading: "Commerce interfaces that keep buying paths clear.",
    overview: [
      "This service covers custom storefronts, headless commerce builds, product catalogs, checkout flows, inventory views, and content-managed retail experiences.",
      "The work balances product discovery, search and filtering, mobile checkout behavior, payment integrations, and operational screens that keep the store manageable.",
    ],
    capabilities: [
      "Stripe, PayPal, and Apple Pay payment processing",
      "Complex inventory tracking and supplier portal systems",
      "Frictionless checkout paths with automated cart recovery",
      "Dynamic categorization grids and instant search filtering",
    ],
    technologies: ["NextJS", "Stripe API", "PostgreSQL", "Shopify Headless", "Sanity CMS"],
    process: [
      {
        title: "Store Architecture",
        description: "Map product types, catalog structure, checkout needs, and the admin or inventory screens required.",
      },
      {
        title: "Product UX",
        description: "Shape product cards, filtering, detail pages, cart behavior, and mobile purchase paths.",
      },
      {
        title: "Checkout Setup",
        description: "Integrate payment paths and validation states with careful attention to error messaging and trust signals.",
      },
      {
        title: "Operations",
        description: "Build the supporting inventory, supplier, or content workflows needed to maintain the commerce surface.",
      },
      {
        title: "Launch QA",
        description: "Review product browsing, checkout paths, responsive behavior, SEO basics, and critical edge cases.",
      },
    ],
    faq: [
      {
        question: "Can this work with a headless commerce setup?",
        answer: "Yes. The service can support headless storefronts, custom checkout flows, and product data coming from an existing commerce or CMS platform.",
      },
      {
        question: "Does this include product filtering?",
        answer: "Filtering, search, product grids, and category views can be included when they are part of the store requirements.",
      },
      {
        question: "Can payment integrations be included?",
        answer: "Yes. Existing portfolio tooling already includes Stripe API and related checkout patterns that can be used where appropriate.",
      },
    ],
    relatedProjectIds: ["shanzara"],
    homeGridClass: "md:col-span-2",
  },
  {
    id: "mobile-apps",
    slug: serviceSlugs.mobile,
    icon: "Smartphone",
    homeIcon: "Smartphone",
    visualVariant: "mobile",
    title: "Mobile App Development",
    homeTitle: "Mobile App Development",
    bookingService: "Mobile App Development",
    tagline: "Cross-platform mobile product interfaces",
    shortDescription: "Responsive mobile applications built with modern frontend frameworks.",
    description: "Target mobile platforms with responsive application interfaces. We use React Native and Expo to build cross-platform product experiences with practical screen flows, input states, and service integrations.",
    overviewHeading: "Mobile experiences designed around smaller screens.",
    overview: [
      "This service covers mobile app interfaces, cross-platform React Native builds, offline-aware app flows, and product experiences that need to feel natural on handheld devices.",
      "The work pays close attention to compact navigation, input ergonomics, responsive state, platform conventions, and the handoff between mobile app behavior and supporting services.",
    ],
    capabilities: [
      "Cross-platform synchronization (single codebase for iOS & Android)",
      "Native module planning for camera, GPS, and biometric use cases",
      "Offline-first synchronization models using local storage caches",
      "Release-readiness support for store or internal distribution workflows",
    ],
    technologies: ["React Native", "Expo", "TypeScript", "Redux Toolkit", "SQLite", "Firebase"],
    process: [
      {
        title: "Product Scope",
        description: "Define the core mobile use cases, platform expectations, authentication needs, and offline requirements.",
      },
      {
        title: "App Structure",
        description: "Plan navigation, reusable screens, native modules, local state, and integration boundaries.",
      },
      {
        title: "Interface Build",
        description: "Implement mobile-first screens, gestures, forms, and responsive states in the established product style.",
      },
      {
        title: "Device QA",
        description: "Check layout, taps, inputs, scrolling, and edge cases across common mobile and tablet sizes.",
      },
      {
        title: "Release Prep",
        description: "Prepare the app package, deployment checklist, and support notes for store or internal release workflows.",
      },
    ],
    faq: [
      {
        question: "Can one codebase support iOS and Android?",
        answer: "Yes. React Native and Expo can support cross-platform builds while still allowing native modules where the product requires them.",
      },
      {
        question: "Can offline behavior be included?",
        answer: "Yes, if it is part of the scope. Offline storage, sync rules, and conflict handling should be planned early.",
      },
      {
        question: "Can a web app become a mobile app later?",
        answer: "Often, yes. The best path depends on the existing architecture, user flows, and whether the mobile app needs native device features.",
      },
    ],
    relatedProjectIds: [],
    homeGridClass: "md:col-span-1",
  },
  {
    id: "saas",
    slug: serviceSlugs.saas,
    icon: "Layers",
    homeIcon: "Layers",
    visualVariant: "saas",
    title: "SaaS Tools & Software",
    homeTitle: "SaaS Tools & Software",
    bookingService: "Custom Software & SaaS Tools",
    tagline: "Productized workflows and cloud software interfaces",
    shortDescription: "Build scalable, multi-tenant cloud software products that automate repeatable business workflows.",
    description: "We design custom software and SaaS interfaces that turn repeatable workflows into maintainable product surfaces, from account areas and role-based screens to billing-aware product flows and operational dashboards.",
    overviewHeading: "Software products shaped around repeatable workflows.",
    overview: [
      "This service covers custom SaaS tools, workflow products, multi-tenant portals, account areas, and productized internal systems that need a clean customer-facing or team-facing interface.",
      "The focus is on route architecture, modular UI, permissions-aware screens, onboarding paths, and product surfaces that can grow into a database-backed system later.",
    ],
    capabilities: [
      "Multi-tenant product interface architecture",
      "Role-aware screens and account-area workflows",
      "Operational dashboards for software products",
      "Reusable components for future product expansion",
    ],
    technologies: ["Next.js", "React", "TypeScript", "Node.js", "PostgreSQL", "Redis", "Tailwind CSS"],
    process: [
      {
        title: "Product Scope",
        description: "Clarify users, roles, core workflows, account areas, and the product surfaces needed for an initial release.",
      },
      {
        title: "System Shape",
        description: "Plan routing, shared components, state boundaries, and future data needs without prematurely building backend systems.",
      },
      {
        title: "Workflow UI",
        description: "Build the screens, controls, empty states, and dashboard views that support the product's main tasks.",
      },
      {
        title: "Interaction QA",
        description: "Test navigation, responsive behavior, permission-aware states, forms, and the handoff between key screens.",
      },
      {
        title: "Frontend Handoff",
        description: "Leave the static frontend architecture organized so it can later connect to APIs, database content, and admin tools.",
      },
    ],
    faq: [
      {
        question: "Does this require starting with a backend?",
        answer: "No. A front-end product architecture can be built first with static data, then connected to backend services when the product model is ready.",
      },
      {
        question: "Can this include dashboards?",
        answer: "Yes. SaaS products often need dashboards, account screens, reporting views, or operational panels as part of the user experience.",
      },
      {
        question: "Can this support multiple user roles later?",
        answer: "Yes, if the route and component structure is planned around role-aware screens from the beginning.",
      },
    ],
    relatedProjectIds: [],
    homeGridClass: "md:col-span-1",
  },
  {
    id: "seo",
    slug: serviceSlugs.seo,
    icon: "LineChart",
    homeIcon: "Search",
    visualVariant: "growth",
    title: "SEO & Digital Growth Marketing",
    homeTitle: "SEO & Digital Marketing",
    bookingService: "SEO & Digital Marketing",
    tagline: "Search visibility and cleaner acquisition paths",
    shortDescription: "Improve crawlability, search visibility, and organic acquisition with clean site structure.",
    description: "Improve organic acquisition with search-engine optimization. We build website structures that search engines can crawl efficiently, optimizing Core Web Vitals, metadata graphs, schema injection, and index foundations.",
    overviewHeading: "Technical search foundations without noisy promises.",
    overview: [
      "This service focuses on the parts of search visibility that can be designed and implemented: crawlable structure, metadata, schema, speed, content hierarchy, and analytics-ready user paths.",
      "The work can support a new site or an existing one, with recommendations translated into code-level changes, content structure, and measurable checkpoints.",
    ],
    capabilities: [
      "Core Web Vitals loading velocity optimization",
      "JSON-LD structured schema script generation",
      "Sitemap, robots.txt, and metadata automation pipelines",
      "Conversion Rate Optimization (CRO) and user telemetry audits",
    ],
    technologies: ["Google Search Console", "Google Analytics 4", "Semrush API", "Schema Markup"],
    process: [
      {
        title: "Technical Audit",
        description: "Review crawlability, metadata, index basics, performance risks, and layout issues that affect search quality.",
      },
      {
        title: "Structure Plan",
        description: "Map priority pages, headings, internal links, schemas, and content sections around the site goals.",
      },
      {
        title: "Implementation",
        description: "Apply metadata, schema, sitemap, content, and performance improvements in the existing frontend.",
      },
      {
        title: "Measurement",
        description: "Prepare analytics and search tooling so future changes can be reviewed with cleaner signals.",
      },
      {
        title: "Review",
        description: "Recheck the improved pages and record follow-up opportunities without making unsupported ranking claims.",
      },
    ],
    faq: [
      {
        question: "Does SEO guarantee a ranking position?",
        answer: "No. The service improves technical and content foundations, but search placement depends on many factors outside a single implementation pass.",
      },
      {
        question: "Can this be added to an existing site?",
        answer: "Yes. Existing pages can be audited and improved through metadata, structure, schema, performance, and content hierarchy updates.",
      },
      {
        question: "Does this include analytics setup?",
        answer: "Measurement setup can be included when the project needs search or acquisition reporting after launch.",
      },
    ],
    relatedProjectIds: [],
    homeGridClass: "md:col-span-1",
  },
];

export function getServiceUrl(service: Pick<Service, "slug">) {
  return `/services/${service.slug}`;
}

export function getServiceBySlug(slug: string) {
  return services.find((service) => service.slug === slug);
}

export function getAdjacentServices(slug: string) {
  const index = services.findIndex((service) => service.slug === slug);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: services[(index - 1 + services.length) % services.length],
    next: services[(index + 1) % services.length],
  };
}
