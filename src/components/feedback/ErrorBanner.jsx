import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button.jsx';
import { getFriendlyErrorMessage } from '../../utils/errorMessages.js';

export function ErrorBanner({
  error,
  title = 'Terjadi Kesalahan',
  onRetry,
  className,
}) {
  if (!error) return null;

  const message = getFriendlyErrorMessage(error);

  return (
    <div
      role="alert"
      className={clsx(
        'rounded-2xl border border-[#B54A43]/40 bg-[#B54A43]/10 p-4 sm:p-5 text-[#B54A43] shadow-xs',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-[#B54A43] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-[#B54A43] font-display">
            {title}
          </h4>
          <p className="mt-1 text-xs text-[#B54A43]/90 leading-relaxed">
            {message}
          </p>
          {onRetry && (
            <div className="mt-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={onRetry}
                className="text-xs gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Coba Lagi
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ErrorBanner;
