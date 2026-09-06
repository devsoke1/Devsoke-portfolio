export type BlogStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  image: string;
  featuredMediaId?: string | null;
  featuredMedia?: {
    id: string;
    url?: string;
  } | null;
  author: string;
  readTime: string;
  status: BlogStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBlogPost extends BlogPost {
  wordCount: number;
}

export interface BlogFormValues {
  title: string;
  slug: string;
  category: string;
  summary: string;
  content: string;
  image: string;
  featuredMediaId?: string | null;
  author: string;
  readTime: string;
  status: BlogStatus;
  publishedAt?: string | null;
}

export interface BlogStats {
  total: number;
  published: number;
  draft: number;
  archived: number;
}
