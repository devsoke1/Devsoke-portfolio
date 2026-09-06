export type ImageResolvable = {
  image: string;
  featuredMediaId?: string | null;
  featuredMedia?: {
    id: string;
    url?: string;
  } | null;
};

/**
 * Returns the public URL for a project or blog post, prioritizing
 * the self-hosted Media relation and falling back to legacy image string.
 */
export function resolveImageUrl(entity: ImageResolvable | null | undefined, defaultFallback = "/window.svg"): string {
  if (!entity) return defaultFallback;

  if (entity.featuredMedia?.id) {
    return `/media/${entity.featuredMedia.id}`;
  }

  if (entity.featuredMediaId) {
    return `/media/${entity.featuredMediaId}`;
  }

  if (entity.image?.trim()) {
    return entity.image.trim();
  }

  return defaultFallback;
}
