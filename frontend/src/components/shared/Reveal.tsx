"use client";

import type { CSSProperties, ReactNode } from "react";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { cn } from "@/lib/cn";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Stagger delay index — each step adds `staggerMs` to the transition delay. */
  staggerIndex?: number;
  staggerMs?: number;
  rootMargin?: string;
  threshold?: number;
  style?: CSSProperties;
};

/**
 * Scroll-reveal wrapper — opacity + translateY only (GPU-friendly).
 * Respects prefers-reduced-motion via CSS + hook.
 */
export function Reveal({
  children,
  className,
  staggerIndex = 0,
  staggerMs = 100,
  rootMargin,
  threshold,
  style,
}: RevealProps) {
  const { ref, visible } = useScrollReveal({ rootMargin, threshold });

  const staggerStyle: CSSProperties | undefined =
    visible && staggerIndex > 0
      ? { transitionDelay: `${staggerIndex * staggerMs}ms` }
      : undefined;

  return (
    <div
      ref={ref}
      className={cn("reveal", visible && "reveal--visible", className)}
      style={{ ...style, ...staggerStyle }}
    >
      {children}
    </div>
  );
}
