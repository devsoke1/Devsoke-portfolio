"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Upload,
  Layers,
  X,
  Check,
  Search,
  Plus,
  RefreshCw,
} from "lucide-react";
import type { MediaItem } from "@/lib/media/types";
import UploadModal from "../media/_components/UploadModal";

type MediaPickerProps = {
  selectedMediaId: string | null;
  currentLegacyUrl?: string;
  onSelect: (mediaId: string | null, imageUrl: string) => void;
  label?: string;
};

export default function MediaPicker({
  selectedMediaId,
  currentLegacyUrl,
  onSelect,
  label = "Featured Image",
}: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const previewUrl = selectedMediaId
    ? `/media/${selectedMediaId}`
    : currentLegacyUrl || "";

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/media/list");
      if (res.ok) {
        const data = await res.json();
        setMediaList(data.media || []);
      }
    } catch (err) {
      console.error("Failed to load media items:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenPicker = () => {
    setIsOpen(true);
    loadMedia();
  };

  const handleSelectMedia = (item: MediaItem) => {
    onSelect(item.id, item.url);
    setIsOpen(false);
  };

  const handleClear = () => {
    onSelect(null, "");
  };

  const handleUploadComplete = (newMedia: MediaItem) => {
    setMediaList((prev) => [newMedia, ...prev]);
    onSelect(newMedia.id, newMedia.url);
    setIsOpen(false);
  };

  const filteredMedia = mediaList.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.originalFilename.toLowerCase().includes(q) ||
      (item.alt && item.alt.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-3">
      {/* Label and Control Buttons */}
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-300 font-mono">
          {label}
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenPicker}
            className="text-[11px] font-mono text-brand-rose-text hover:underline inline-flex items-center gap-1"
          >
            <Layers size={12} /> Choose from Media Library
          </button>
          <span>•</span>
          <button
            type="button"
            onClick={() => setIsUploadOpen(true)}
            className="text-[11px] font-mono text-brand-rose-text hover:underline inline-flex items-center gap-1"
          >
            <Upload size={12} /> Upload New
          </button>
        </div>
      </div>

      {/* Hidden input to submit with forms if needed */}
      <input type="hidden" name="featuredMediaId" value={selectedMediaId || ""} />

      {/* Current Preview Card */}
      <div className="surface-card rounded-2xl p-4 border border-brand-rose/20 bg-brand-card flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:w-36 h-28 rounded-xl overflow-hidden bg-brand-bg border border-brand-rose/15 relative flex-shrink-0 flex items-center justify-center">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Selected Preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80";
              }}
            />
          ) : (
            <div className="text-center p-3 text-gray-500 flex flex-col items-center">
              <ImageIcon size={24} className="mb-1 text-gray-600" />
              <span className="text-[10px] font-mono">No Image</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left w-full">
          <div className="text-xs font-mono truncate text-gray-300">
            {selectedMediaId ? (
              <span className="text-brand-rose-text">Self-Hosted Media (ID: {selectedMediaId})</span>
            ) : previewUrl ? (
              <span className="text-gray-400">Legacy / External Path: {previewUrl}</span>
            ) : (
              <span className="text-gray-500">No media selected</span>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
            <button
              type="button"
              onClick={handleOpenPicker}
              className="px-3 py-1.5 rounded-xl bg-brand-card border border-brand-rose/20 hover:border-brand-rose text-xs font-mono font-semibold text-brand-fg transition-colors"
            >
              Browse Library
            </button>
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-brand-rose/15 border border-brand-rose/30 hover:bg-brand-rose/25 text-xs font-mono font-semibold text-brand-fg transition-colors"
            >
              Upload Image
            </button>
            {previewUrl && (
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-xl bg-red-950/30 border border-red-500/25 hover:bg-red-900/40 text-xs font-mono text-red-400 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Choose from Library */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="surface-card bg-brand-card border border-brand-rose/25 rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-brand-rose/15">
              <div>
                <h3 className="text-base font-bold font-heading text-brand-fg flex items-center gap-2">
                  <Layers size={18} className="text-brand-rose-text" /> Media Library
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Select an uploaded image or upload a new one
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(true)}
                  className="btn-primary px-3.5 py-1.5 text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Plus size={14} /> Upload New
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-brand-fg hover:bg-brand-rose/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="p-4 border-b border-brand-rose/10 bg-brand-card/40 flex items-center gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search media by filename or alt text..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-brand-card border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-xl py-2 pl-9 pr-4 text-xs text-brand-fg placeholder:text-gray-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={14} />
              </div>
              <button
                type="button"
                onClick={loadMedia}
                title="Refresh library"
                className="p-2 rounded-xl bg-brand-card border border-brand-rose/15 text-gray-400 hover:text-brand-rose-text transition-colors"
              >
                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>

            {/* Media Grid */}
            <div className="flex-1 overflow-y-auto p-5">
              {isLoading ? (
                <div className="py-20 text-center text-xs font-mono text-gray-400">
                  Loading media library...
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <ImageIcon size={32} className="mx-auto text-gray-600" />
                  <p className="text-xs text-gray-300">
                    {searchQuery ? "No media matches your search." : "No uploaded media found."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(true)}
                    className="btn-primary px-4 py-2 text-xs inline-flex items-center gap-1.5"
                  >
                    <Upload size={14} /> Upload First Image
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredMedia.map((item) => {
                    const isSelected = selectedMediaId === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectMedia(item)}
                        className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all bg-brand-bg ${
                          isSelected
                            ? "border-brand-rose ring-2 ring-brand-rose/40"
                            : "border-brand-rose/15 hover:border-brand-rose/50"
                        }`}
                      >
                        <div className="h-32 w-full bg-brand-card relative overflow-hidden flex items-center justify-center">
                          <img
                            src={item.url}
                            alt={item.alt || item.originalFilename}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isSelected && (
                            <div className="absolute top-2 right-2 p-1 rounded-full bg-brand-rose text-white shadow-md">
                              <Check size={12} />
                            </div>
                          )}
                        </div>
                        <div className="p-2.5 space-y-1">
                          <p className="text-[11px] font-bold text-gray-200 truncate" title={item.originalFilename}>
                            {item.originalFilename}
                          </p>
                          <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                            <span className="uppercase">{item.mimeType.split("/")[1]}</span>
                            <span>{(item.size / (1024 * 1024)).toFixed(1)} MB</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-brand-rose/15 bg-brand-card flex justify-end">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadComplete}
      />
    </div>
  );
}
