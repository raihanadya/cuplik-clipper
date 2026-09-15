import React from 'react';
import { clsx } from 'clsx';

export const Input = React.forwardRef(function Input(
  {
    id,
    label,
    error,
    helperText,
    icon: Icon,
    endAdornment,
    className,
    type = 'text',
    disabled = false,
    required = false,
    ...props
  },
  ref
) {
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);
  const errorId = inputId ? `${inputId}-error` : undefined;
  const helperId = inputId ? `${inputId}-helper` : undefined;

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-[#242321]">
            {label} {required && <span className="text-[#B54A43]">*</span>}
          </label>
        </div>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="pointer-events-none absolute left-3.5 flex items-center text-[#6F6B63]">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={clsx(
            'flex h-11 w-full rounded-xl border bg-[#FCFBF8] focus:bg-[#FFFFFF] px-3.5 py-2 text-sm text-[#242321] placeholder:text-[#6F6B63] shadow-xs transition-colors outline-none',
            'focus-visible:ring-2 focus-visible:ring-[#C65D3A]/40 focus-visible:border-[#C65D3A]',
            Icon ? 'pl-10' : 'pl-3.5',
            endAdornment ? 'pr-10' : 'pr-3.5',
            error
              ? 'border-[#B54A43] focus-visible:border-[#B54A43] focus-visible:ring-[#B54A43]/30'
              : 'border-[#DEDAD2] hover:border-[#969189]',
            disabled && 'opacity-50 cursor-not-allowed bg-[#F7F5F0]',
            className
          )}
          {...props}
        />
        {endAdornment && (
          <div className="absolute right-3 flex items-center text-[#6F6B63]">
            {endAdornment}
          </div>
        )}
      </div>
      {error ? (
        <p id={errorId} className="text-xs font-medium text-[#B54A43] flex items-center gap-1">
          {error}
        </p>
      ) : helperText ? (
        <p id={helperId} className="text-xs text-[#6F6B63]">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
