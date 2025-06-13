interface LogoProps {
  className?: string
  size?: number
}

export function Logo({ className = "", size = 32 }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 font-bold ${className}`}>
      <div
        className="rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground"
        style={{ width: size, height: size }}
      >
        <span className="text-sm font-bold">AI</span>
      </div>
      <span>Strategic AI</span>
    </div>
  )
}
