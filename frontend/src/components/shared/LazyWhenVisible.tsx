"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type LazyWhenVisibleProps = {
  children: ReactNode;
  rootMargin?: string;
  minHeight?: string;
};

export function LazyWhenVisible({ children, rootMargin = "240px", minHeight = "18rem" }: LazyWhenVisibleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setVisible(true);
        observer.disconnect();
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
}
