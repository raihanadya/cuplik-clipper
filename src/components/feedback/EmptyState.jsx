import React from 'react';
import { clsx } from 'clsx';
import { Button } from '../ui/Button.jsx';

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}) {
  return (
    <div
      className={clsx(
        'flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[#DEDAD2] bg-[#FCFBF8]',
        className
      )}
    >
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F2DED5] border border-[#C65D3A]/20 text-[#C65D3A] shadow-xs">
          <Icon className="h-7 w-7" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-semibold text-[#242321] font-display">
        {title}
      </h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-[#6F6B63] leading-relaxed">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6">
          <Button
            variant={action.variant || 'primary'}
            onClick={action.onClick}
            className="shadow-sm"
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

export default EmptyState;
