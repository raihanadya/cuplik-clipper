import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  FileVideo,
  X,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  Layers,
} from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card.jsx';
import { TemplateDiagram } from '../../components/media/TemplateDiagram.jsx';
import { LAYOUT_TEMPLATES } from '../../constants/layoutTemplates.js';
import { workspaceService } from '../../features/workspace/workspaceService.js';
import { useSessionHistory } from '../../hooks/useSessionHistory.js';
import { ROUTES } from '../../constants/routes.js';
import { validateVideoFile } from '../../utils/validators.js';
import { formatFileSize } from '../../utils/formatters.js';

export function UploadPage() {
  const [file, setFile] = useState(null);
  const [template, setTemplate] = useState('slide_pembicara');
  const [customVocabulary, setCustomVocabulary] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { addSession } = useSessionHistory();

  const handleFileSelect = (selectedFile) => {
    setErrorMessage('');
    if (!selectedFile) return;

    const validation = validateVideoFile(selectedFile);
    if (!validation.isValid) {
      setErrorMessage(validation.error);
      return;
    }

    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Silakan pilih file video terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    setErrorMessage('');

    try {
      const response = await workspaceService.uploadVideo({
        file,
        template,
        customVocabulary: customVocabulary.trim() || undefined,
      });

      const sessionId = response.session_id;

      // Save to local session history repository
      addSession({
        sessionId,
        filename: file.name,
        template,
        status: response.status || 'processing',
        createdAt: new Date().toISOString(),
      });

      // Redirect immediately to the processing stage
      navigate(ROUTES.SESSION_STATUS.replace(':sessionId', sessionId));
    } catch (err) {
      setErrorMessage(
        err.message || 'Gagal mengunggah video. Pastikan format sesuai dan server terjangkau.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#242321] font-display">
          Unggah Video & Konfigurasi Pipeline
        </h2>
        <p className="mt-1 text-sm text-[#6F6B63]">
          Pilih file rekaman presentasi atau webinar untuk diekstrak menjadi klip vertikal 9:16.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-[#B54A43]/10 border border-[#B54A43]/40 text-[#B54A43] text-sm flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-[#B54A43] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">Terjadi Kesalahan Validasi / Unggah</p>
              <p className="text-xs text-[#B54A43]/90">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* 1. Drag & Drop File Upload Area */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-[#242321] block">
            1. File Rekaman Video (MP4 atau MOV, Maksimal 1 GB)
          </label>

          <input
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/quicktime,.mp4,.mov"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {!file ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={clsx(
                'cursor-pointer rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center transition-all flex flex-col items-center justify-center gap-4 group',
                isDragging
                  ? 'border-[#C65D3A] bg-[#F2DED5]/30'
                  : 'border-[#DEDAD2] bg-[#FCFBF8] hover:border-[#969189] hover:bg-[#FFFFFF]'
              )}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2DED5] text-[#C65D3A] border border-[#C65D3A]/20 group-hover:scale-105 transition-transform">
                <UploadCloud className="h-8 w-8" />
              </div>
              <div>
                <p className="text-base font-semibold text-[#242321]">
                  Tarik dan lepas file video di sini, atau{' '}
                  <span className="text-[#C65D3A] underline underline-offset-4">
                    pilih dari komputer
                  </span>
                </p>
                <p className="text-xs text-[#6F6B63] mt-1">
                  Mendukung format MP4 dan MOV hingga ukuran 1 GB. Disarankan resolusi 720p atau 1080p.
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#C65D3A]/40 bg-[#FCFBF8] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F2DED5] text-[#C65D3A] border border-[#C65D3A]/30">
                  <FileVideo className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[#242321] truncate">{file.name}</p>
                  <p className="text-xs text-[#6F6B63] font-mono">
                    {formatFileSize(file.size)} • {file.type || 'video'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#242321] bg-[#F7F5F0] hover:bg-[#EAE6DF] border border-[#DEDAD2] transition-colors"
                >
                  Ganti
                </button>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="p-1.5 rounded-lg text-[#969189] hover:text-[#B54A43] hover:bg-[#B54A43]/10 transition-colors"
                  aria-label="Batalkan pilihan file"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. Layout Template Selector (3 deterministic options) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#242321] flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#C65D3A]" />
              2. Pilih Template Tata Letak Vertikal
            </label>
            <span className="text-xs text-[#6F6B63] font-mono">Tepat 3 Template Resmi</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {LAYOUT_TEMPLATES.map((tmpl) => {
              const isSelected = template === tmpl.id;
              return (
                <div
                  key={tmpl.id}
                  onClick={() => setTemplate(tmpl.id)}
                  className={clsx(
                    'cursor-pointer rounded-2xl border p-4 transition-all flex flex-col justify-between group',
                    isSelected
                      ? 'border-[#C65D3A] bg-[#FFFFFF] ring-2 ring-[#C65D3A]/30 shadow-md'
                      : 'border-[#DEDAD2] bg-[#FCFBF8] hover:border-[#969189] hover:bg-[#FFFFFF]'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-[#F7F5F0] text-[#6F6B63] border border-[#DEDAD2]">
                        {tmpl.tag}
                      </span>
                      <div
                        className={clsx(
                          'w-4 h-4 rounded-full border flex items-center justify-center transition-colors',
                          isSelected
                            ? 'border-[#C65D3A] bg-[#C65D3A] text-white'
                            : 'border-[#DEDAD2]'
                        )}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>

                    <div className="w-full max-w-[140px] aspect-[9/16] mx-auto rounded-xl overflow-hidden border border-[#DEDAD2] mb-3 bg-[#F7F5F0]">
                      <TemplateDiagram templateId={tmpl.id} active={isSelected} />
                    </div>

                    <h4 className="text-sm font-bold text-[#242321] font-display">
                      {tmpl.label}
                    </h4>
                    <p className="text-xs text-[#6F6B63] mt-1 leading-relaxed">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#DEDAD2] text-[11px] text-[#6F6B63]">
                    Ideal: {tmpl.suitableFor}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. Custom Vocabulary Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-[#242321] block">
              3. Kamus Istilah Khusus / Custom Vocabulary (Opsional)
            </label>
            <span
              className={clsx(
                'text-xs font-mono',
                customVocabulary.length > 200 ? 'text-[#B54A43] font-bold' : 'text-[#6F6B63]'
              )}
            >
              {customVocabulary.length} / 200 karakter
            </span>
          </div>

          <textarea
            rows={3}
            maxLength={200}
            value={customVocabulary}
            onChange={(e) => setCustomVocabulary(e.target.value)}
            placeholder="Contoh: Kubernetes, microservice, Cuplik, CI/CD, Istio, Docker, idempotency"
            className="w-full rounded-xl border border-[#DEDAD2] bg-[#FFFFFF] p-3 text-sm text-[#242321] placeholder:text-[#969189] focus:border-[#C65D3A] focus:outline-none focus:ring-1 focus:ring-[#C65D3A] transition-colors"
          />

          <p className="text-xs text-[#6F6B63] flex items-center gap-1.5">
            <Info className="h-3.5 w-3.5 text-[#6F6B63] shrink-0" />
            <span>
              Pisahkan kata atau istilah teknis dengan koma. Ini membantu model ASR mengeja istilah secara akurat.
            </span>
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-[#DEDAD2] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#6F6B63]">
            *File diproses secara aman dengan kebijakan zero-retention 24 jam.
          </p>

          <Button
            type="submit"
            size="lg"
            variant="primary"
            className="w-full sm:w-auto px-8 gap-2 shadow-sm"
            disabled={!file || isUploading || customVocabulary.length > 200}
            isLoading={isUploading}
          >
            <Sparkles className="h-4 w-4" />
            {isUploading ? 'Mengunggah & Memulai Pipeline...' : 'Mulai Proses Cuplik'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default UploadPage;
