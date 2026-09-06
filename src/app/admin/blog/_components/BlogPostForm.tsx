"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  FileText,
  Save,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { AdminBlogPost, BlogStatus } from "@/lib/blog/types";
import { calculateReadTime, normalizeBlogSlug } from "@/lib/blog/validation";
import type { BlogFormState } from "../actions";
import MarkdownContent from "@/components/blog/MarkdownContent";
import MediaPicker from "../../_components/MediaPicker";

type BlogPostFormProps = {
  initialData?: AdminBlogPost | null;
  adminName?: string | null;
  action: (state: BlogFormState, formData: FormData) => Promise<BlogFormState>;
  mode: "create" | "edit";
};

const CATEGORY_SUGGESTIONS = ["Tech", "Design", "AI", "Engineering", "Architecture"];

export default function BlogPostForm({
  initialData,
  adminName,
  action,
  mode,
}: BlogPostFormProps) {
  const [formState, formAction, isPending] = useActionState<BlogFormState, FormData>(
    action,
    { message: "", errors: {} }
  );

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [category, setCategory] = useState(initialData?.category ?? "Tech");
  const [summary, setSummary] = useState(initialData?.summary ?? "");
  const [content, setContent] = useState(initialData?.content ?? "");
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(
    initialData?.featuredMediaId ?? null
  );
  const [image, setImage] = useState(
    initialData?.image ??
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80"
  );
  const [author, setAuthor] = useState(
    initialData?.author ?? (adminName ? `${adminName} (Admin)` : "Devsoke Editorial")
  );
  const [readTime, setReadTime] = useState(initialData?.readTime ?? "5 min read");
  const [status, setStatus] = useState<BlogStatus>(initialData?.status ?? "DRAFT");
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");

  // Auto-generate slug from title for new posts if slug hasn't been manually diverged
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (mode === "create" && (!slug || slug === normalizeBlogSlug(title))) {
      setSlug(normalizeBlogSlug(newTitle));
    }
  };

  const handleAutoSlug = () => {
    if (title) {
      setSlug(normalizeBlogSlug(title));
    }
  };

  const handleAutoReadTime = () => {
    if (content) {
      setReadTime(calculateReadTime(content));
    }
  };

  return (
    <form action={formAction} className="space-y-8">
      {/* Header Back & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-rose/15 pb-6">
        <div>
          <Link
            href="/admin/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-brand-fg mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Back to All Articles
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-fg flex items-center gap-2.5">
            <FileText className="text-brand-rose-text" size={26} />
            {mode === "create" ? "Write Newsroom Article" : "Edit Article"}
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            {mode === "create"
              ? "Draft new technical insights or announcements in Markdown."
              : `Updating article: "${initialData?.title}"`}
          </p>
        </div>

        {/* Top Submit & Preview Bar */}
        <div className="flex items-center gap-3">
          <div className="flex bg-brand-card p-1 rounded-xl border border-brand-rose/15">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                viewMode === "edit"
                  ? "bg-brand-rose text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileText size={13} /> Write
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all flex items-center gap-1.5 ${
                viewMode === "preview"
                  ? "bg-brand-rose text-white shadow-sm"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Eye size={13} /> Preview
            </button>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="btn-primary px-5 py-2.5 text-xs shadow-md shadow-brand-rose/25 disabled:opacity-60 flex items-center gap-2"
          >
            <Save size={14} />
            {isPending ? "Saving..." : mode === "create" ? "Create Article" : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Global Error Banner */}
      {formState.message && (
        <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl text-red-200 text-xs font-medium">
          {formState.message}
        </div>
      )}

      {/* Main Grid: Left is Content/Editor, Right is Metadata/Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols): Title, Excerpt, Content Editor */}
        <div className="lg:col-span-8 space-y-6">
          {/* Article Title */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
              Article Title <span className="text-brand-rose-text">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Accelerating Next.js Performance"
              className="w-full bg-brand-card border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-xl p-3.5 text-sm font-semibold text-brand-fg placeholder:text-gray-500"
              required
            />
            {formState.errors?.title && (
              <p className="text-red-400 text-xs font-mono">{formState.errors.title[0]}</p>
            )}
          </div>

          {/* URL Slug */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
                URL Slug <span className="text-brand-rose-text">*</span>
              </label>
              <button
                type="button"
                onClick={handleAutoSlug}
                className="text-[11px] font-mono text-brand-rose-text hover:underline inline-flex items-center gap-1"
              >
                <Wand2 size={11} /> Generate from Title
              </button>
            </div>
            <div className="flex items-center rounded-xl bg-brand-card border border-brand-rose/20 focus-within:border-brand-rose overflow-hidden px-3.5 py-1.5">
              <span className="text-xs font-mono text-gray-500 mr-1 select-none">/blog/</span>
              <input
                type="text"
                name="slug"
                value={slug}
                onChange={(e) => setSlug(normalizeBlogSlug(e.target.value))}
                placeholder="article-url-slug"
                className="w-full bg-transparent focus:outline-none text-xs font-mono text-brand-rose-text placeholder:text-gray-600 py-1.5"
                required
              />
            </div>
            {formState.errors?.slug && (
              <p className="text-red-400 text-xs font-mono">{formState.errors.slug[0]}</p>
            )}
          </div>

          {/* Excerpt / Summary */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
              Summary / Excerpt <span className="text-brand-rose-text">*</span>
            </label>
            <textarea
              name="summary"
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="A brief 1-2 sentence description shown in blog feeds and SEO search results."
              className="w-full bg-brand-card border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-xl p-3.5 text-xs text-brand-fg placeholder:text-gray-500 leading-relaxed"
              required
            />
            {formState.errors?.summary && (
              <p className="text-red-400 text-xs font-mono">{formState.errors.summary[0]}</p>
            )}
          </div>

          {/* Markdown Content Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
                Article Body (Markdown) <span className="text-brand-rose-text">*</span>
              </label>
              <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2">
                <span>{content.trim().split(/\s+/).filter(Boolean).length} words</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleAutoReadTime}
                  className="text-brand-rose-text hover:underline inline-flex items-center gap-1"
                >
                  <Sparkles size={11} /> Auto Read Time
                </button>
              </div>
            </div>

            {viewMode === "edit" ? (
              <div className="space-y-2">
                <textarea
                  name="content"
                  rows={18}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="# Article Title&#10;&#10;Write your article here using standard markdown:&#10;&#10;## Subheading&#10;Paragraph text here.&#10;&#10;* Bullet list item&#10;* Another point&#10;&#10;```typescript&#10;// Code block example&#10;const fast = true;&#10;```"
                  className="w-full bg-brand-card border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-2xl p-4 text-xs sm:text-sm font-mono text-gray-200 placeholder:text-gray-600 leading-relaxed"
                  required
                />
                <div className="flex flex-wrap gap-2 text-[11px] text-gray-500 font-mono">
                  <span>Supported: # H1, ## H2, ### H3, **bold**, `inline code`, ``` code blocks, * lists</span>
                </div>
              </div>
            ) : (
              <div className="surface-card rounded-2xl p-6 border border-brand-rose/25 bg-brand-card min-h-[400px]">
                <div className="text-xs text-brand-rose-text font-mono mb-4 pb-2 border-b border-brand-rose/15 flex items-center justify-between">
                  <span>Markdown Live Preview</span>
                  <span className="text-gray-400">{title || "Untitled Article"}</span>
                </div>
                <MarkdownContent content={content || "*No content written yet.*"} />
              </div>
            )}
            {formState.errors?.content && (
              <p className="text-red-400 text-xs font-mono">{formState.errors.content[0]}</p>
            )}
          </div>
        </div>

        {/* Right Column (4 cols): Publishing Settings & Metadata */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publication Status Card */}
          <div className="surface-card rounded-2xl p-5 border border-brand-rose/20 space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-300 border-b border-brand-rose/15 pb-2.5">
              Publication Status
            </h3>

            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-gray-400 uppercase">
                Post Status
              </label>
              <select
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as BlogStatus)}
                className="w-full bg-brand-card border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-xl p-3 text-xs font-bold text-brand-fg"
              >
                <option value="DRAFT">Draft (Admin Only)</option>
                <option value="PUBLISHED">Published (Live on Website)</option>
                <option value="ARCHIVED">Archived (Hidden from Public)</option>
              </select>
            </div>

            {initialData?.publishedAt && (
              <div className="pt-2 text-[11px] font-mono text-gray-400 space-y-1">
                <span className="text-gray-500">First Published:</span>
                <p className="text-gray-300">
                  {new Date(initialData.publishedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Metadata Card */}
          <div className="surface-card rounded-2xl p-5 border border-brand-rose/20 space-y-4">
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-gray-300 border-b border-brand-rose/15 pb-2.5">
              Article Metadata
            </h3>

            {/* Category */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-gray-400 uppercase">
                Category
              </label>
              <input
                type="text"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Tech, Design, AI..."
                className="w-full bg-brand-card border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-xl p-3 text-xs text-brand-fg"
                required
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {CATEGORY_SUGGESTIONS.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className="px-2 py-0.5 rounded bg-brand-card border border-brand-rose/15 text-[10px] font-mono text-gray-400 hover:text-brand-rose-text hover:border-brand-rose/30 transition-colors"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Author */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-gray-400 uppercase">
                Author
              </label>
              <input
                type="text"
                name="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g. Devsoke"
                className="w-full bg-brand-card border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-xl p-3 text-xs text-brand-fg"
                required
              />
            </div>

            {/* Read Time */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono text-gray-400 uppercase">
                Read Time
              </label>
              <input
                type="text"
                name="readTime"
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 5 min read"
                className="w-full bg-brand-card border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-xl p-3 text-xs text-brand-fg font-mono"
                required
              />
            </div>
          </div>

          {/* Cover Image Card */}
          <div className="surface-card rounded-2xl p-5 border border-brand-rose/20 space-y-4">
            <MediaPicker
              selectedMediaId={selectedMediaId}
              currentLegacyUrl={image}
              onSelect={(mediaId, url) => {
                setSelectedMediaId(mediaId);
                if (url) {
                  setImage(url);
                }
              }}
              label="Cover / Featured Image"
            />
            <input type="hidden" name="image" value={image || "/window.svg"} />
            {formState.errors?.image && (
              <p className="text-red-400 text-xs font-mono">{formState.errors.image[0]}</p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
