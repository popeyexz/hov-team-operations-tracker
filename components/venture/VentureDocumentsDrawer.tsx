'use client';

import React, { useEffect, useState, useRef } from 'react';
import { X, UploadCloud, FileText, Download, Trash2, Loader2, Paperclip, ExternalLink } from 'lucide-react';
import { Venture, VentureDocument } from '@/lib/types';
import { getVentureDocuments, uploadVentureDocument, deleteVentureDocument } from '@/app/actions/document-actions';
import { formatDateDDMMYYYY } from '@/lib/utils';
import { useActiveProfile } from '@/context/ActiveProfileContext';

interface VentureDocumentsDrawerProps {
  venture: Venture | null;
  isOpen: boolean;
  onClose: () => void;
}

export function VentureDocumentsDrawer({ venture, isOpen, onClose }: VentureDocumentsDrawerProps) {
  const { activeProfile } = useActiveProfile();
  const [docs, setDocs] = useState<VentureDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocs = async () => {
    if (!venture) return;
    setLoading(true);
    try {
      const data = await getVentureDocuments(venture.id);
      setDocs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && venture) {
      fetchDocs();
    }
  }, [isOpen, venture]);

  if (!isOpen || !venture) return null;

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('ventureId', venture.id);
      if (activeProfile) {
        formData.append('profileId', activeProfile.id);
      }

      const res = await uploadVentureDocument(formData);
      if (res.success && res.document) {
        setDocs((prev) => [res.document!, ...prev]);
      } else {
        setError(res.error || 'Failed to upload document');
      }
    } catch (e: any) {
      setError(e.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (doc: VentureDocument) => {
    if (!confirm(`Delete "${doc.name}"?`)) return;
    const res = await deleteVentureDocument(doc.id, doc.file_url);
    if (res.success) {
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl h-full glass-panel border-l border-white/20 p-6 sm:p-8 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Paperclip className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Documents & Assets
              </span>
              <h2 className="text-base sm:text-lg font-bold text-white">{venture.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full glass-pill hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {error}
          </div>
        )}

        {/* Upload Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all duration-200 mb-6 ${
            dragOver
              ? 'border-sky-400 bg-sky-500/10 scale-[1.01]'
              : 'border-white/15 hover:border-white/30 bg-white/5 hover:bg-white/[0.07]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
          />

          <div className="flex flex-col items-center">
            {uploading ? (
              <Loader2 className="w-8 h-8 text-sky-400 animate-spin mb-2" />
            ) : (
              <UploadCloud className="w-8 h-8 text-slate-400 group-hover:text-white mb-2" />
            )}
            <div className="text-xs sm:text-sm font-semibold text-white">
              {uploading ? 'Uploading to Supabase Storage...' : 'Click or Drag files to upload'}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Decks, agreements, spreadsheets, brand guidelines (up to 50MB)
            </p>
          </div>
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 pb-2">
            <span>Repository Assets ({docs.length})</span>
            <span>Backed by Supabase Storage</span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading documents...</div>
          ) : docs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 bg-white/5 rounded-2xl border border-white/5">
              No files uploaded for {venture.name} yet.
            </div>
          ) : (
            docs.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3.5 rounded-2xl glass-card hover:bg-white/10 transition-colors border border-white/10 group"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className="p-2 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/30 shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-medium text-white truncate max-w-xs sm:max-w-md">
                      {doc.name}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-2">
                      <span>{formatFileSize(doc.file_size)}</span>
                      <span>•</span>
                      <span>{formatDateDDMMYYYY(doc.created_at)}</span>
                      {doc.uploader && (
                        <>
                          <span>•</span>
                          <span className="text-sky-300">by {doc.uploader.full_name}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl glass-pill hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                    title="Open / Download"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-2 rounded-xl glass-pill hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
