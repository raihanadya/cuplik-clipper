import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { clsx } from 'clsx';

export function Toast({
  type = 'success',
  message,
  onClose,
  className,
}) {
  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-[#3F7D55] shrink-0" />,
    warning: <AlertTriangle className="h-5 w-5 text-[#A86F24] shrink-0" />,
    error: <XCircle className="h-5 w-5 text-[#B54A43] shrink-0" />,
    info: <Info className="h-5 w-5 text-[#C65D3A] shrink-0" />,
  };

  const bgStyles = {
    success: 'border-[#3F7D55]/30 bg-[#FFFFFF] text-[#3F7D55] shadow-lg',
    warning: 'border-[#A86F24]/30 bg-[#FFFFFF] text-[#A86F24] shadow-lg',
    error: 'border-[#B54A43]/30 bg-[#FFFFFF] text-[#B54A43] shadow-lg',
    info: 'border-[#C65D3A]/30 bg-[#FFFFFF] text-[#C65D3A] shadow-lg',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-xl text-sm transition-all',
        bgStyles[type] || bgStyles.info,
        className
      )}
    >
      {icons[type] || icons.info}
      <span className="flex-1 font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current opacity-70 hover:opacity-100 transition-opacity p-1"
          aria-label="Tutup notifikasi"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default Toast;
