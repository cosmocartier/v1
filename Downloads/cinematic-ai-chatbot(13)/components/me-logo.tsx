"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface MELogoProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  variant?: "default" | "sidebar" | "collapsed" | "mobile"
  className?: string
  priority?: boolean
}

const sizeMap = {
  xs: { width: 20, height: 20 },
  sm: { width: 28, height: 28 },
  md: { width: 36, height: 36 },
  lg: { width: 44, height: 44 },
  xl: { width: 52, height: 52 },
}

export function MELogo({ size = "md", variant = "default", className, priority = false }: MELogoProps) {
  const { width, height } = sizeMap[size]

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Image
        src="/images/me-logo.png"
        alt="ME"
        width={width}
        height={height}
        priority={priority}
        className={cn(
          "object-contain transition-none",
          // Ensure bright white appearance on dark backgrounds
          "brightness-0 invert",
          // Hover effects for interactive contexts
          variant === "sidebar" && "group-hover:brightness-110",
          variant === "collapsed" && "hover:brightness-110",
        )}
        style={{
          // Force bright white with full opacity
          filter: "brightness(0) invert(1)",
          opacity: 1,
        }}
      />
    </div>
  )
}
