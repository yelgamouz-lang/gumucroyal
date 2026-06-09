"use client";

import Image from "next/image";
import { cn } from "@/lib/cn";

type OptimizedImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  fill?: boolean;
};

export function OptimizedImage({
  src,
  alt,
  priority = false,
  className,
  sizes = "(max-width: 768px) 100vw, 50vw",
  width = 800,
  height = 800,
  fill,
}: OptimizedImageProps) {
  const shared = {
    src,
    alt,
    priority,
    sizes,
    loading: priority ? ("eager" as const) : ("lazy" as const),
    decoding: "async" as const,
    className: cn("object-cover", className),
  };

  if (fill) {
    return <Image {...shared} fill />;
  }

  return <Image {...shared} width={width} height={height} />;
}
