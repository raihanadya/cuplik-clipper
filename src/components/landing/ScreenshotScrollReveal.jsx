import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

export function ScreenshotScrollReveal({ children, className }) {
  const containerRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.45], [10, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.45], [0.93, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [0.75, 1]);

  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div ref={containerRef} className={`perspective-[1200px] ${className || ''}`}>
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          transformStyle: 'preserve-3d',
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default ScreenshotScrollReveal;
