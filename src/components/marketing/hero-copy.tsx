"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

const ease = [0.16, 1, 0.3, 1] as const;

export function HeroCopy({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { y: 14 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.7, ease }}
    >
      {children}
    </motion.div>
  );
}
