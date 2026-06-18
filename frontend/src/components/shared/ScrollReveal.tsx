"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

type ScrollRevealOptions = {
  rootMargin?: string;
  threshold?: number;
};

/** IntersectionObserver hook — fires once, respects prefers-reduced-motion. */
export function useScrollReveal(options?: ScrollRevealOptions) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia(REDUCED_MOTION).matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      {
        rootMargin: options?.rootMargin ?? "0px 0px -6% 0px",
        threshold: options?.threshold ?? 0.08,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.rootMargin, options?.threshold]);

  return { ref, visible };
}

type RevealProps = ScrollRevealOptions & {
  children: ReactNode;
  className?: string;
  /** Stagger delay in seconds (e.g. 0.1 between sibling cards). */
  stagger?: number;
};

/** Fade-up reveal on scroll — opacity + translateY only (GPU-friendly). */
export function Reveal({ children, className, stagger = 0, rootMargin, threshold }: RevealProps) {
  const { ref, visible } = useScrollReveal({ rootMargin, threshold });

  const style: CSSProperties | undefined =
    stagger > 0 ? ({ "--reveal-delay": `${stagger}s` } as CSSProperties) : undefined;

  return (
    <div
      ref={ref}
      className={cn("scroll-reveal", visible && "scroll-reveal--visible", className)}
      style={style}
    >
      {children}
    </div>
  );
}
