export const MOTION_TRANSITIONS = {
  springGentle: { type: 'spring', stiffness: 260, damping: 25 },
  springSnappy: { type: 'spring', stiffness: 400, damping: 30 },
  springBouncy: { type: 'spring', stiffness: 500, damping: 20 },
  easeSmooth: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1.0] },
  easeFast: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1.0] },
};

export const FADE_VARIANTS = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: MOTION_TRANSITIONS.easeSmooth },
  exit: { opacity: 0, transition: MOTION_TRANSITIONS.easeFast },
};

export const SLIDE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: MOTION_TRANSITIONS.springGentle },
  exit: { opacity: 0, y: -10, transition: MOTION_TRANSITIONS.easeFast },
};
