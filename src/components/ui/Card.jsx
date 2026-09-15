import React from 'react';
import { clsx } from 'clsx';

export function Card({ className, children, ...props }) {
  return (
    <div
      className={clsx(
        'rounded-2xl border border-[#DEDAD2] bg-[#FCFBF8] p-6 shadow-xs transition-all duration-200',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div className={clsx('flex flex-col space-y-1.5 pb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, as: Component = 'h3', ...props }) {
  return (
    <Component
      className={clsx('text-lg font-semibold tracking-tight text-[#242321] font-display', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={clsx('text-sm text-[#6F6B63] leading-relaxed', className)} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ className, children, ...props }) {
  return (
    <div className={clsx('space-y-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div className={clsx('flex items-center pt-4 mt-4 border-t border-[#DEDAD2]', className)} {...props}>
      {children}
    </div>
  );
}

export default Card;
