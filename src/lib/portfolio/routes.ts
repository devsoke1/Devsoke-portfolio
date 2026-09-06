export const serviceSlugs = {
  web: "web-development-engineering",
  ai: "ai-neural-integration",
  dashboards: "company-dashboards-telemetry",
  ecommerce: "custom-ecommerce-platforms",
  mobile: "mobile-app-development",
  saas: "saas-tools-software",
  seo: "seo-digital-growth-marketing",
} as const;

export function getServiceUrl(service: Pick<{ slug: string }, "slug">) {
  return `/services/${service.slug}`;
}

export function getProjectUrl(project: Pick<{ slug: string }, "slug">) {
  return `/work/${project.slug}`;
}
