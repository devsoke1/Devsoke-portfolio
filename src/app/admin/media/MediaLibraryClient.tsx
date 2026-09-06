"use client";

import { useState } from "react";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Trash2,
  Edit2,
  HardDrive,
  CheckCircle2,
  Layers,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import AdminShell from "../_components/AdminShell";
import UploadModal from "./_components/UploadModal";
import EditAltModal from "./_components/EditAltModal";
import { deleteMediaAction } from "./actions";
import type { MediaItem, MediaStats } from "@/lib/media/types";

type AdminSummary = {
  email: string;
  name: string | null;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
};

type MediaLibraryClientProps = {
  admin: AdminSummary;
  initialMedia: MediaItem[];
  stats: MediaStats;
};

export default function MediaLibraryClient({
  admin,
  initialMedia,
  stats: initialStats,
}: MediaLibraryClientProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>(initialMedia);
  const [stats, setStats] = useState<MediaStats>(initialStats);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFormat, setSelectedFormat] = useState<string>("ALL");
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingMedia, setEditingMedia] = useState<MediaItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleUploadSuccess = (newMedia: MediaItem) => {
    setMediaList((prev) => [newMedia, ...prev]);
    setStats((prev) => ({
      totalCount: prev.totalCount + 1,
      totalSizeBytes: prev.totalSizeBytes + newMedia.size,
    }));
  };

  const handleAltSuccess = (updated: { id: string; alt: string | null }) => {
    setMediaList((prev) =>
      prev.map((item) => (item.id === updated.id ? { ...item, alt: updated.alt } : item))
    );
  };

  const handleDelete = async (item: MediaItem) => {
    if (item.usageCount > 0) {
      setActionError(
        `Cannot delete "${item.originalFilename}" because it is currently attached to ${item.projectCount} project(s) and ${item.blogCount} blog post(s). Remove those associations first.`
      );
      return;
    }

    if (!window.confirm(`Are you sure you want to permanently delete "${item.originalFilename}"?`)) {
      return;
    }

    setDeletingId(item.id);
    setActionError(null);

    try {
      const res = await deleteMediaAction(item.id);
      if (!res.success) {
        throw new Error(res.error || "Failed to delete media item.");
      }

      setMediaList((prev) => prev.filter((m) => m.id !== item.id));
      setStats((prev) => ({
        totalCount: Math.max(0, prev.totalCount - 1),
        totalSizeBytes: Math.max(0, prev.totalSizeBytes - item.size),
      }));
    } catch (err: unknown) {
      const errorObj = err as Error;
      setActionError(errorObj.message || "Failed to delete media item.");
    } finally {
      setDeletingId(null);
    }
  };

  const filteredMedia = mediaList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.originalFilename.toLowerCase().includes(q) ||
      (item.alt && item.alt.toLowerCase().includes(q)) ||
      item.id.toLowerCase().includes(q);

    const matchesFormat =
      selectedFormat === "ALL" ||
      item.mimeType.toLowerCase().includes(selectedFormat.toLowerCase());

    return matchesSearch && matchesFormat;
  });

  const totalUsedCount = mediaList.filter((m) => m.usageCount > 0).length;

  return (
    <AdminShell admin={admin} active="media">
      <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-brand-rose/15 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading text-brand-fg flex items-center gap-2.5">
              <ImageIcon className="text-brand-rose-text" size={26} />
              Self-Hosted Media Library
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Upload, optimize, and manage persistent imagery stored on server filesystem.
            </p>
          </div>

          <button
            onClick={() => setIsUploadOpen(true)}
            className="btn-primary px-5 py-3 text-xs shadow-md shadow-brand-rose/25 inline-flex items-center gap-2 w-fit"
          >
            <Upload size={15} /> Upload Image
          </button>
        </div>

        {/* Global Action Error Banner */}
        {actionError && (
          <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-2xl text-red-200 text-xs font-medium flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <span>{actionError}</span>
            </div>
            <button
              onClick={() => setActionError(null)}
              className="text-xs text-gray-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="surface-card p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wider">
                Total Files
              </span>
              <div className="text-2xl font-black font-heading text-brand-fg mt-1">
                {stats.totalCount}
              </div>
              <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                Self-hosted media items
              </div>
            </div>
            <div className="p-3 bg-brand-rose/10 rounded-2xl text-brand-rose-text">
              <ImageIcon size={22} />
            </div>
          </div>

          <div className="surface-card p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wider">
                Storage Used
              </span>
              <div className="text-2xl font-black font-heading text-brand-fg mt-1">
                {(stats.totalSizeBytes / (1024 * 1024)).toFixed(2)} MB
              </div>
              <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                Persistent disk usage
              </div>
            </div>
            <div className="p-3 bg-brand-rose/10 rounded-2xl text-brand-rose-text">
              <HardDrive size={22} />
            </div>
          </div>

          <div className="surface-card p-5 rounded-2xl shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wider">
                Active References
              </span>
              <div className="text-2xl font-black font-heading text-brand-fg mt-1">
                {totalUsedCount}
              </div>
              <div className="text-[11px] text-gray-500 font-mono mt-0.5">
                Attached to Projects & Blog
              </div>
            </div>
            <div className="p-3 bg-brand-rose/10 rounded-2xl text-brand-rose-text">
              <Layers size={22} />
            </div>
          </div>
        </div>

        {/* Filter Controls & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Format Filter Tabs */}
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-1">
            {(["ALL", "JPEG", "PNG", "WEBP"] as const).map((fmt) => (
              <button
                key={fmt}
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition-all border whitespace-nowrap ${
                  selectedFormat === fmt
                    ? "bg-brand-rose/15 border-brand-rose/40 text-brand-fg shadow-sm"
                    : "border-brand-rose/10 hover:border-brand-rose/25 bg-brand-card text-gray-400 hover:text-brand-fg"
                }`}
              >
                {fmt === "ALL" ? "All Formats" : fmt}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              placeholder="Search by filename or alt text..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-brand-card border border-brand-rose/20 focus:border-brand-rose focus:outline-none rounded-xl py-2.5 pl-10 pr-4 text-xs text-brand-fg placeholder:text-gray-500"
            />
            <Search className="absolute left-3.5 top-3 text-gray-400" size={14} />
          </div>
        </div>

        {/* Media Grid */}
        {filteredMedia.length === 0 ? (
          <div className="surface-card rounded-3xl p-16 border border-brand-rose/20 text-center max-w-md mx-auto space-y-4">
            <ImageIcon size={36} className="mx-auto text-gray-600" />
            <p className="text-sm text-gray-300">
              {mediaList.length === 0
                ? "No media files uploaded yet."
                : "No media items match your search."}
            </p>
            {mediaList.length === 0 ? (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="btn-primary px-5 py-2.5 text-xs inline-flex items-center gap-2"
              >
                <Upload size={14} /> Upload First Image
              </button>
            ) : (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedFormat("ALL");
                }}
                className="text-xs font-mono text-brand-rose-text hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                className="surface-card surface-card-hover rounded-2xl border border-brand-rose/15 overflow-hidden flex flex-col group"
              >
                {/* Image Preview Container */}
                <div className="h-44 w-full bg-brand-bg relative overflow-hidden flex items-center justify-center border-b border-brand-rose/10">
                  <img
                    src={item.url}
                    alt={item.alt || item.originalFilename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Top-right direct view button */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    title="View Raw Image in New Tab"
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-white hover:text-brand-rose-text transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <ExternalLink size={13} />
                  </a>

                  {/* Usage Badge */}
                  <div className="absolute bottom-2.5 left-2.5">
                    {item.usageCount > 0 ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 backdrop-blur-sm border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 size={11} /> Used in {item.usageCount}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 backdrop-blur-sm border border-white/10 text-gray-400">
                        Unused
                      </span>
                    )}
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1">
                    <h3
                      className="font-bold text-xs text-brand-fg truncate"
                      title={item.originalFilename}
                    >
                      {item.originalFilename}
                    </h3>
                    <p
                      className="text-[11px] text-gray-400 truncate italic"
                      title={item.alt || "No alt text set"}
                    >
                      {item.alt ? `"${item.alt}"` : "No alt text set"}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-brand-rose/10 text-[10px] font-mono text-gray-500">
                    <div className="flex items-center justify-between">
                      <span>Dimensions:</span>
                      <span className="text-gray-300 font-semibold">
                        {item.width && item.height
                          ? `${item.width} × ${item.height}`
                          : "Unknown"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Size & Format:</span>
                      <span className="text-gray-300 font-semibold uppercase">
                        {(item.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                        {item.mimeType.split("/")[1]}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Uploaded:</span>
                      <span className="text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-brand-rose/10">
                    <button
                      onClick={() => setEditingMedia(item)}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-brand-rose-text hover:underline"
                    >
                      <Edit2 size={12} /> Edit Alt
                    </button>

                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      title={
                        item.usageCount > 0
                          ? `Cannot delete: referenced by ${item.usageCount} record(s)`
                          : "Delete image permanently"
                      }
                      className={`p-2 rounded-lg border transition-colors ${
                        item.usageCount > 0
                          ? "bg-brand-card border-brand-rose/10 text-gray-600 cursor-not-allowed"
                          : "bg-red-950/30 border-red-500/25 text-red-400 hover:bg-red-900/40"
                      }`}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Edit Alt Modal */}
      <EditAltModal
        media={editingMedia}
        onClose={() => setEditingMedia(null)}
        onSuccess={handleAltSuccess}
      />
    </AdminShell>
  );
}

