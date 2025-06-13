"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Switch } from "@/components/ui/switch"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  return (
    <div className="flex items-center space-x-2 sm:space-x-3 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] p-2 sm:p-0">
      <Sun
        className={`h-5 w-5 sm:h-[1.4rem] sm:w-[1.4rem] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          theme === "dark"
            ? "text-muted-foreground scale-75 rotate-12 opacity-60"
            : "text-foreground scale-100 rotate-0 opacity-100"
        }`}
      />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={toggleTheme}
        aria-label="Toggle theme"
        className="transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 data-[state=checked]:bg-foreground data-[state=unchecked]:bg-muted scale-110 sm:scale-100"
      />
      <Moon
        className={`h-5 w-5 sm:h-[1.4rem] sm:w-[1.4rem] transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          theme === "light"
            ? "text-muted-foreground scale-75 rotate-12 opacity-60"
            : "text-foreground scale-100 rotate-0 opacity-100"
        }`}
      />
    </div>
  )
}
