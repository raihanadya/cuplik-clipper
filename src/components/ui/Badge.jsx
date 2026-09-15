import React from 'react';
import { clsx } from 'clsx';

const badgeVariants = {
  default: 'bg-[#F2DED5] text-[#C65D3A] border-[#C65D3A]/30',
  secondary: 'bg-[#FCFBF8] text-[#6F6B63] border-[#DEDAD2]',
  success: 'bg-[#3F7D55]/10 text-[#3F7D55] border-[#3F7D55]/30',
  warning: 'bg-[#A86F24]/10 text-[#A86F24] border-[#A86F24]/30',
  destructive: 'bg-[#B54A43]/10 text-[#B54A43] border-[#B54A43]/30',
  outline: 'bg-transparent text-[#242321] border-[#DEDAD2]',
};

export function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border tracking-wide whitespace-nowrap select-none',
        badgeVariants[variant] || badgeVariants.default,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
