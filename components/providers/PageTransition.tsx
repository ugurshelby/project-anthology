'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <div key={pathname}>{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname} className="relative flex flex-1 flex-col">
        {children}
        <motion.div
          className="page-transition-sweep"
          initial={{ x: '-100%' }}
          animate={{ x: ['-100%', '0%', '100%'] }}
          transition={{
            duration: 0.5,
            times: [0, 0.5, 1],
            ease: ['easeIn', 'easeOut'],
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}
