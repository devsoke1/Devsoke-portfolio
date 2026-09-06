"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, AlertCircle, Loader2 } from "lucide-react";
import type { MediaItem } from "@/lib/media/types";

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (media: MediaItem) => void;
};

export default function UploadModal({
  isOpen,
  onClose,
  onUploadSuccess,
}: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate client-side format
    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(selected.type)) {
      setError("Please select a JPEG, PNG, or WebP image.");
      return;
    }

    // Max 8MB
    if (selected.size > 8 * 1024 * 1024) {
      setError("Image size exceeds 8 MB limit.");
      return;
    }

    setError(null);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select an image file to upload.");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (alt.trim()) {
        formData.append("alt", alt.trim());
      }

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Upload failed.");
      }

      onUploadSuccess(data.media);
      handleClose();
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setAlt("");
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="surface-card bg-brand-card border border-brand-rose/25 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-rose/15">
          <h3 className="text-base font-bold font-heading text-brand-fg flex items-center gap-2">
            <Upload size={18} className="text-brand-rose-text" /> Upload New Image
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-fg hover:bg-brand-rose/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleUpload} className="p-6 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Dropzone / File Picker */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-brand-rose/25 hover:border-brand-rose/50 rounded-2xl p-6 text-center bg-brand-card/50 transition-colors group flex flex-col items-center justify-center min-h-[160px]"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="relative w-full h-36 rounded-xl overflow-hidden bg-brand-bg">
                <img
                  src={previewUrl}
                  alt="Upload preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-mono text-white">
                  Click to change file
                </div>
              </div>
            ) : (
              <div className="space-y-2 flex flex-col items-center">
                <div className="p-3 rounded-full bg-brand-rose/10 text-brand-rose-text group-hover:scale-110 transition-transform">
                  <ImageIcon size={24} />
                </div>
                <p className="text-xs font-bold text-gray-200">
                  Click to select an image from your computer
                </p>
                <p className="text-[11px] font-mono text-gray-500">
                  JPEG, PNG, or WebP (up to 8 MB)
                </p>
              </div>
            )}
          </div>

          {file && (
            <div className="text-[11px] font-mono text-gray-400 flex justify-between px-1">
              <span className="truncate max-w-[240px]">{file.name}</span>
              <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
            </div>
          )}

          {/* Alt text field */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-gray-400 uppercase">
              Alt Text / Description (Optional)
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="e.g. Dashboard interface dark theme preview"
              className="w-full bg-brand-card border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-xl p-3 text-xs text-brand-fg placeholder:text-gray-600"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2.5 rounded-xl text-xs font-mono text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || isUploading}
              className="btn-primary px-5 py-2.5 text-xs shadow-md shadow-brand-rose/25 disabled:opacity-50 flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Uploading...
                </>
              ) : (
                <>
                  <Upload size={14} /> Upload Image
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

