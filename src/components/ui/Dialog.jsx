import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button.jsx';

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = 'max-w-md',
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
      aria-describedby={description ? 'dialog-description' : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#242321]/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog card - Pure White elevated surface */}
      <div
        ref={dialogRef}
        className={clsx(
          'relative z-10 w-full rounded-2xl border border-[#DEDAD2] bg-[#FFFFFF] p-6 shadow-2xl transition-all duration-200',
          maxWidth,
          className
        )}
      >
        <div className="flex items-start justify-between pb-4">
          <div>
            {title && (
              <h3 id="dialog-title" className="text-lg font-bold text-[#242321] font-display">
                {title}
              </h3>
            )}
            {description && (
              <p id="dialog-description" className="mt-1 text-sm text-[#6F6B63]">
                {description}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Tutup dialog"
            className="h-8 w-8 text-[#6F6B63] hover:text-[#242321]"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2">{children}</div>
      </div>
    </div>,
    document.body
  );
}

export default Dialog;
