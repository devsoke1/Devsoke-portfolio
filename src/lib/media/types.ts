export type MediaItem = {
  id: string;
  url: string; // /media/{id}
  originalFilename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string | null;
  createdAt: string;
  projectCount: number;
  blogCount: number;
  usageCount: number;
};

export type MediaStats = {
  totalCount: number;
  totalSizeBytes: number;
};

export type MediaUploadResponse =
  | {
      success: true;
      media: MediaItem;
    }
  | {
      success: false;
      error: string;
    };

