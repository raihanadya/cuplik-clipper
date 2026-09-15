import React from 'react';
import { AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

export function InlineFieldError({ error, className }) {
  if (!error) return null;

  return (
    <p className={clsx('flex items-center gap-1.5 text-xs text-rose-400 font-medium mt-1', className)}>
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{error}</span>
    </p>
  );
}

export default InlineFieldError;
