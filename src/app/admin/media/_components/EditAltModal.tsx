"use client";

import { useState } from "react";
import { Edit2, X, AlertCircle, Loader2, Save } from "lucide-react";
import type { MediaItem } from "@/lib/media/types";
import { updateMediaAltAction } from "../actions";

type EditAltModalProps = {
  media: MediaItem | null;
  onClose: () => void;
  onSuccess: (updated: { id: string; alt: string | null }) => void;
};

export default function EditAltModal({
  media,
  onClose,
  onSuccess,
}: EditAltModalProps) {
  const [alt, setAlt] = useState(media?.alt ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!media) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const res = await updateMediaAltAction(media.id, alt.trim() || null);
      if (!res.success) {
        throw new Error(res.error || "Failed to update alt text.");
      }

      onSuccess({ id: media.id, alt: alt.trim() || null });
      onClose();
    } catch (err: unknown) {
      const errorObj = err as Error;
      setError(errorObj.message || "Failed to update alt text.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="surface-card bg-brand-card border border-brand-rose/25 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-brand-rose/15">
          <h3 className="text-base font-bold font-heading text-brand-fg flex items-center gap-2">
            <Edit2 size={16} className="text-brand-rose-text" /> Edit Alt Text
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-brand-fg hover:bg-brand-rose/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200 text-xs flex items-center gap-2">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="h-28 rounded-xl overflow-hidden bg-brand-bg border border-brand-rose/15">
            <img
              src={media.url}
              alt={media.alt || media.originalFilename}
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono text-gray-400 uppercase">
              Alt Text / Accessibility Label
            </label>
            <input
              type="text"
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              placeholder="Describe this image for screen readers and SEO"
              className="w-full bg-brand-card border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-xl p-3 text-xs text-brand-fg placeholder:text-gray-600"
              maxLength={300}
            />
            <p className="text-[10px] font-mono text-gray-500 text-right">
              {alt.length}/300
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-mono text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary px-5 py-2.5 text-xs shadow-md shadow-brand-rose/25 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> Save Alt Text
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

