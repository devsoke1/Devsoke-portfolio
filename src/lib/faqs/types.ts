export const faqPlacements = [
  "HOME",
  "ABOUT",
  "SERVICES_INDEX",
  "SERVICE_DETAIL",
  "CONTACT",
] as const;

export type FaqPlacementValue = (typeof faqPlacements)[number];

export const faqPlacementLabels: Record<FaqPlacementValue, string> = {
  HOME: "Homepage",
  ABOUT: "About",
  SERVICES_INDEX: "Services overview",
  SERVICE_DETAIL: "Service detail",
  CONTACT: "Contact",
};

export type FaqServiceSummary = {
  id: string;
  slug: string;
  title: string;
};

export type PublicFaq = {
  id: string;
  key: string;
  question: string;
  answer: string;
  placement: FaqPlacementValue;
  serviceId: string | null;
  order: number;
};

export type AdminFaq = PublicFaq & {
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  service: FaqServiceSummary | null;
};

export type AdminFaqFilters = {
  query?: string;
  placement?: FaqPlacementValue;
  status?: "published" | "draft";
};
