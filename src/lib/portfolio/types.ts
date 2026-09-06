export const serviceIconNames = [
  "Code2",
  "Cpu",
  "BarChart4",
  "ShoppingBag",
  "Smartphone",
  "Layers",
  "LineChart",
] as const;

export const serviceHomeIconNames = [
  ...serviceIconNames,
  "Globe",
  "BarChart3",
  "Search",
] as const;

export const serviceVisualVariants = [
  "blueprint",
  "neural",
  "telemetry",
  "commerce",
  "mobile",
  "saas",
  "growth",
] as const;

export type ServiceIconName = (typeof serviceIconNames)[number];
export type ServiceHomeIconName = (typeof serviceHomeIconNames)[number];
export type ServiceVisualVariant = (typeof serviceVisualVariants)[number];

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
  slug: string;
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
  homeGridClass: string;
  order: number;
  isPublished: boolean;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  tag: string;
  desc: string;
  longDesc: string;
  challenge: string;
  solution: string;
  image: string;
  featuredMediaId?: string | null;
  featuredMedia?: {
    id: string;
    url?: string;
  } | null;
  tech: string[];
  client: string;
  timeline: string;
  demoUrl?: string;
  order: number;
  isFeatured: boolean;
  isPublished: boolean;
  serviceSlugs: string[];
}

export type AdminService = Service & {
  relatedProjectCount: number;
};

export type AdminProject = Project & {
  relatedServices: Pick<Service, "id" | "slug" | "title">[];
};

export type ServiceOption = Pick<
  Service,
  "id" | "slug" | "title" | "order" | "isPublished"
>;
