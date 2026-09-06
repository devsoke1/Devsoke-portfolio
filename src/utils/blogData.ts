export interface BlogPost {
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
}

export const DEFAULT_POSTS: BlogPost[] = [
  {
    slug: "designing-saas-dashboards",
    title: "Designing High-Converting Dashboards for SaaS Products",
    category: "Design",
    summary: "Visual hierarchy and state controls inside company analytics dashboards that reduce user friction.",
    author: "Devsoke",
    date: "August 20, 2026",
    readTime: "2 min read",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    content: `
# Designing High-Converting Dashboards for SaaS Products

In the world of Software as a Service (SaaS), the dashboard is the core of the user experience. It's the central page where users monitor their data, check telemetry stats, and track key indicators. A cluttered dashboard leads to user fatigue, while an overly simple dashboard lacks the analytical depth required.

## 1. Prioritize Visual Hierarchy

Information must be laid out in order of importance. The top-left corner should display primary indicators (e.g., system load, total sales), while deeper analyses should be positioned lower down or in separate tabs.

*   **Primary Metrics (KPIs):** Show big, bold numbers.
*   **Secondary Metrics (Graphs):** Place graphs immediately below KPIs.
*   **Tabular details:** Reserve the bottom sections for tabular data grids.

## 2. Eliminate Visual Clutter

Avoid displaying every dataset on one single view. Leverage progressive disclosure, such as expandable accordion panels or hover tabs, to reveal secondary details only when the user requests them. This keeps the layout elegant and fast.

## 3. Implement Glassmorphism and Micro-Animations

Modern aesthetics improve engagement. Use glassmorphism filters (backdrop blur) and custom borders to segment sections. Combine these styles with fluid animations (like Framer Motion spring curves) to make metrics morph smoothly when the user interacts with tabs.
    `,
  },
  {
    slug: "accelerating-nextjs-performance",
    title: "Accelerating Next.js Applications for Stronger PageSpeed Scores",
    category: "Tech",
    summary: "How we improve Core Web Vitals, scripts, and server-side components for faster page experiences.",
    author: "Devsoke",
    date: "August 15, 2026",
    readTime: "2 min read",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    content: `
# Accelerating Next.js Applications for Stronger PageSpeed Scores

Page loading velocity is a primary search-engine ranking factor. Even small improvements can make e-commerce experiences feel more responsive. Next.js is configured for performance by default, but minor styling blocks or massive client bundles can drag down loading metrics.

## 1. Leverage React Server Components (RSC)

Server Components download zero client-side JavaScript by default, reducing initial bundle files. Keep interactive features (which require client components like state hooks or event listeners) contained in small leaf components.

## 2. Dynamic Component Imports

Do not import heavy libraries (like Three.js, R3F, or charting libraries) directly onto standard pages. Instead, load them dynamically:
\`\`\`typescript
import dynamic from 'next/dynamic';
const HeavyCanvas = dynamic(() => import('@/components/HeavyCanvas'), { ssr: false });
\`\`\`
This excludes the heavy 3D files from the initial page loading assets, letting visitors load text layouts immediately.

## 3. Core Web Vital Standards

*   **LCP (Largest Contentful Paint):** Preload primary hero images.
*   **FID (First Input Delay):** Keep JavaScript main thread processes short and responsive.
*   **CLS (Cumulative Layout Shift):** Provide specific dimensions (width and height) for images to reserve rendering frames.
    `,
  },
  {
    slug: "future-of-webgl-threejs-2026",
    title: "The Future of WebGL & 3D Interactive Interfaces in 2026",
    category: "Design",
    summary: "How modern WebGL, React Three Fiber, and shader pipelines transform modern corporate websites into memorable visual benchmarks.",
    author: "Devsoke",
    date: "August 22, 2026",
    readTime: "1 min read",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    content: `
# The Future of WebGL & 3D Interactive Interfaces in 2026

Interactive graphics have evolved from niche experimental demos into high-converting enterprise features. Today, leading technology brands utilize 3D canvas viewports to present hardware products, architecture diagrams, and software metrics in real-time.

## 1. Zero-Lag Shader Optimization

By utilizing instanced meshes and lightweight GLSL shaders, 3D scenes can stay smooth on mobile smartphones without draining device batteries.

*   **Particle Systems:** Point cloud distributions computed with buffer geometries.
*   **Morphing Distortions:** Dynamic materials reacting smoothly to mouse gestures.
*   **Dynamic Lighting:** Minimal light sources paired with baked environment maps.

## 2. Progressive Canvas Loading

To protect strong Lighthouse results, 3D scenes should be dynamically loaded in client-only boundaries. This ensures the primary HTML and textual hierarchy render quickly before WebGL contexts initialize.
    `,
  },
  {
    slug: "leveraging-llms-task-automation",
    title: "Leveraging Large Language Models for Task Automation",
    category: "AI",
    summary: "How semantic models can parse unstructured company documents and automate data collection.",
    author: "Devsoke",
    date: "August 10, 2026",
    readTime: "2 min read",
    image: "https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80",
    content: `
# Leveraging Large Language Models for Task Automation

Artificial Intelligence has shifted from simple predictive models to agentic platforms. Modern language models can execute complex commands, process invoices, write content, and organize telemetry data.

## 1. RAG (Retrieval-Augmented Generation) Architectures

Standard language models are limited by static knowledge databases. Retrieval-Augmented Generation queries database files to find matching context, passing it to the language model to generate precise replies.

1.  **Extract:** Read company docs.
2.  **Embed:** Generate semantic vectors using OpenAI/Hugging Face embeddings.
3.  **Store:** Save vectors inside vector databases (Pinecone, pgvector).
4.  **Retrieve:** Match client prompts with database entries and compose replies.

## 2. Autonomous Agents

Agents don't just answer questions; they perform actions. By linking language models with custom tools (API connectors, email scripts, SQL executors), AI agents can manage invoices or coordinate schedule slots autonomously.
    `,
  },
];

export function getBlogPosts(): BlogPost[] {
  return DEFAULT_POSTS;
}

export function saveBlogPost(post: BlogPost): void {
  void post;
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return DEFAULT_POSTS.find((post) => post.slug === slug);
}
