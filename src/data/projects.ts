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
  tech: string[];
  client: string;
  timeline: string;
  demoUrl?: string;
  serviceSlugs: string[];
}

export const legacyDummyProjectSlugs = [
  "neuromorph",
  "vortitrade",
  "svelte-apparel",
  "docushare",
  "agentecho",
  "pulsefit",
] as const;

export const projects: Project[] = [
  {
    id: "warda-restaurant",
    slug: "warda-restaurant",
    title: "Warda Restaurant",
    category: "restaurants",
    tag: "Restaurants",
    desc: "A restaurant website for Warda Restaurant, presenting Lebanese cuisine with menu, reservation, contact, and online ordering paths.",
    longDesc:
      "Warda Restaurant's website introduces a Lebanese restaurant experience with a storefront hero, cuisine-led messaging, and clear navigation for menu, about, contact, reservations, and online ordering.",
    challenge:
      "The website needs to help visitors quickly understand the cuisine, move toward a table reservation or order-online path, and find practical restaurant information without extra friction.",
    solution:
      "Visible features include branded restaurant navigation, reservation calls to action, order-online access, menu and contact routes, food imagery, and a homepage focused on Lebanese dishes.",
    image: "/portfolio/warda-restaurant.png",
    tech: [],
    client: "Warda Restaurant",
    timeline: "",
    demoUrl: "https://wardarestaurant.co.uk/",
    serviceSlugs: ["web-development-engineering"],
  },
  {
    id: "the-fix-tech",
    slug: "the-fix-tech",
    title: "The Fix Tech",
    category: "repair-local-services",
    tag: "Repair & Local Services",
    desc: "An electronics repair and sales website with service paths for mobile devices, laptops, PlayStation repairs, CCTV, contact, and scheduling.",
    longDesc:
      "The Fix Tech website presents consumer electronics repair and sales services through a direct hero message, service navigation, scheduling calls to action, and contact routes.",
    challenge:
      "Visitors need to identify the device or service they need help with, understand that repair and sales support is available, and reach the business through a scheduling or contact path.",
    solution:
      "Visible features include service cards for device repairs and CCTV, a schedule-now CTA, service and contact navigation, WhatsApp chat access, and supporting repair-process content.",
    image: "/portfolio/the-fix-tech.png",
    tech: [],
    client: "The Fix Tech",
    timeline: "",
    demoUrl: "https://thefixtech.co.uk/",
    serviceSlugs: ["web-development-engineering"],
  },
  {
    id: "house-and-shop-appliances",
    slug: "house-and-shop-appliances",
    title: "House & Shop Appliances",
    category: "repair-local-services",
    tag: "Repair & Local Services",
    desc: "An appliance services website for repairs, installations, maintenance, quote requests, booking, and area checking.",
    longDesc:
      "House & Shop Appliances presents appliance repair, installation, and maintenance services for home and business customers with phone, quote, booking, FAQ, and service navigation.",
    challenge:
      "The website needs to make urgent appliance service paths visible, support quote and booking intent, and help visitors check whether their area is covered.",
    solution:
      "Visible features include call/text buttons, free quote and booking CTAs, a services menu, FAQ access, appliance service messaging, and a postcode-style coverage checker.",
    image: "/portfolio/house-and-shop-appliances.png",
    tech: [],
    client: "House & Shop Appliances",
    timeline: "",
    demoUrl: "https://houseandshopappliances.co.uk/",
    serviceSlugs: ["web-development-engineering"],
  },
  {
    id: "nexa-repairs",
    slug: "nexa-repairs",
    title: "Nexa Repairs",
    category: "repair-local-services",
    tag: "Repair & Local Services",
    desc: "A home appliance repair website with a bold repair-focused hero, services navigation, and clear booking/contact actions.",
    longDesc:
      "Nexa Repairs presents home appliance repair around a fast-service message, service navigation, an about route, contact access, and prominent repair booking calls to action.",
    challenge:
      "Visitors need to quickly recognize the repair category, review available service information, and start a repair request from the homepage.",
    solution:
      "Visible features include a repair-led hero, services/about/contact navigation, book-a-repair CTA, secondary services CTA, and account-oriented header actions.",
    image: "/portfolio/nexa-repairs.png",
    tech: [],
    client: "Nexa Repairs",
    timeline: "",
    demoUrl: "https://nexarepairs.co.uk/",
    serviceSlugs: ["web-development-engineering"],
  },
  {
    id: "thailander-restaurant",
    slug: "thailander-restaurant",
    title: "Thailander Restaurant",
    category: "restaurants",
    tag: "Restaurants",
    desc: "A Thai restaurant website with reservation CTAs, menu access, gallery navigation, about content, and contact information.",
    longDesc:
      "Thailander Restaurant's website presents a Thai restaurant experience with a branded hero, reserve/book actions, menu and gallery paths, about content, and contact details.",
    challenge:
      "The website needs to make the restaurant identity clear, guide visitors toward reservations or menu exploration, and support people looking for practical contact information.",
    solution:
      "Visible features include a restaurant-branded hero, reserve and book CTAs, menu and gallery navigation, a downloadable menu path, restaurant-hour content, and contact routes.",
    image: "/portfolio/thailander-restaurant.png",
    tech: [],
    client: "Thailander Restaurant",
    timeline: "",
    demoUrl: "https://thailanderrestaurant.com/",
    serviceSlugs: ["web-development-engineering"],
  },
  {
    id: "shanzara",
    slug: "shanzara",
    title: "Shanzara",
    category: "ecommerce",
    tag: "E-commerce",
    desc: "An online fashion storefront for ladies unstitched suits with category browsing, product cards, search, account, cart, and support paths.",
    longDesc:
      "Shanzara is an online fashion storefront focused on premium ladies unstitched suits, with categories for casual wear, lawn, 2 Piece, and 3 Piece collections plus product browsing and support information.",
    challenge:
      "Visitors need to browse collection categories, inspect product options, access cart/account/search tools, and find delivery or support information before buying.",
    solution:
      "Visible features include collection navigation, a large editorial hero, product cards, search/account/cart controls, delivery and return messaging, newsletter signup, and customer support forms.",
    image: "/portfolio/shanzara.png",
    tech: [],
    client: "Shanzara",
    timeline: "",
    demoUrl: "https://shanzara.com/",
    serviceSlugs: ["web-development-engineering", "custom-ecommerce-platforms"],
  },
];

export function getProjectsByIds(ids: string[]) {
  return ids
    .map((id) => projects.find((project) => project.id === id))
    .filter((project): project is Project => Boolean(project));
}

export function getProjectById(id: string) {
  return projects.find((project) => project.id === id);
}

export function getProjectUrl(project: Pick<Project, "slug">) {
  return `/work/${project.slug}`;
}

export function getAdjacentProjects(id: string) {
  const index = projects.findIndex((project) => project.id === id);

  if (index === -1) {
    return { previous: null, next: null };
  }

  return {
    previous: projects[(index - 1 + projects.length) % projects.length],
    next: projects[(index + 1) % projects.length],
  };
}

export function getRelatedProjects(currentProjectId: string, limit = 3) {
  return projects
    .filter((p) => p.id !== currentProjectId)
    .slice(0, limit);
}
