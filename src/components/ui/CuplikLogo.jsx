import React from 'react';
import { clsx } from 'clsx';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';

const sizeMap = {
  sm: 'h-7 max-w-[105px]',
  default: 'h-9 max-w-[135px]',
  lg: 'h-11 max-w-[165px]',
  xl: 'h-14 max-w-[210px]',
};

export function CuplikLogo({
  size = 'default',
  className = '',
  to = ROUTES.HOME,
  clickable = true,
  alt = 'Cuplik'
}) {
  const imageElement = (
    <img
      src="/cuplik-logo.png"
      alt={alt}
      className={clsx(
        'w-auto object-contain select-none transition-transform duration-200',
        sizeMap[size] || sizeMap.default,
        clickable && 'hover:opacity-90',
        className
      )}
      loading="eager"
      decoding="async"
    />
  );

  if (clickable && to) {
    return (
      <Link
        to={to}
        className="inline-flex items-center outline-none focus-visible:ring-2 focus-visible:ring-[#C65D3A] rounded-lg"
        aria-label="Cuplik Home"
      >
        {imageElement}
      </Link>
    );
  }

  return imageElement;
}

export default CuplikLogo;
