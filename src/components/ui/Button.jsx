import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { clsx } from 'clsx';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

const variantClasses = {
  primary: 'bg-[#C65D3A] hover:bg-[#A94B2D] text-white shadow-sm border border-transparent active:scale-[0.98]',
  secondary: 'bg-[#FCFBF8] hover:bg-white text-[#242321] border border-[#DEDAD2] shadow-sm active:scale-[0.98]',
  ghost: 'bg-transparent hover:bg-[#FCFBF8] text-[#6F6B63] hover:text-[#242321]',
  destructive: 'bg-[#B54A43] hover:bg-[#9E3E37] text-white shadow-sm border border-transparent active:scale-[0.98]',
  outline: 'bg-transparent border border-[#DEDAD2] hover:border-[#969189] text-[#242321] hover:bg-[#FCFBF8]',
};

const sizeClasses = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  default: 'h-10 px-4 py-2 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2.5 font-semibold',
  icon: 'h-10 w-10 p-0 rounded-xl justify-center',
};

export const Button = React.forwardRef(function Button(
  {
    children,
    className,
    variant = 'primary',
    size = 'default',
    isLoading = false,
    disabled = false,
    magnetic = false,
    type = 'button',
    onClick,
    ...props
  },
  forwardedRef
) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const buttonRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!magnetic || prefersReducedMotion || disabled || isLoading) return;
    const { clientX, clientY } = e;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) * 0.35;
    const y = (clientY - (rect.top + rect.height / 2)) * 0.35;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    if (!magnetic || prefersReducedMotion) return;
    setPosition({ x: 0, y: 0 });
  };

  const baseClass = clsx(
    'inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F5F0] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
    variantClasses[variant] || variantClasses.primary,
    sizeClasses[size] || sizeClasses.default,
    className
  );

  const content = (
    <>
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      )}
      {children}
    </>
  );

  if (magnetic && !prefersReducedMotion) {
    return (
      <motion.button
        ref={(node) => {
          buttonRef.current = node;
          if (typeof forwardedRef === 'function') forwardedRef(node);
          else if (forwardedRef) forwardedRef.current = node;
        }}
        type={type}
        className={baseClass}
        disabled={disabled || isLoading}
        onClick={onClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: 'spring', stiffness: 350, damping: 20 }}
        aria-busy={isLoading}
        {...props}
      >
        {content}
      </motion.button>
    );
  }

  return (
    <button
      ref={(node) => {
        buttonRef.current = node;
        if (typeof forwardedRef === 'function') forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      type={type}
      className={baseClass}
      disabled={disabled || isLoading}
      onClick={onClick}
      aria-busy={isLoading}
      {...props}
    >
      {content}
    </button>
  );
});

export default Button;
