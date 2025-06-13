"use client"

import { MELogo } from "@/components/me-logo"

export function LogoVisibilityTest() {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 p-4 bg-black/80 backdrop-blur rounded-lg border border-white/20">
      <h3 className="text-white text-sm font-bold">Logo Visibility Test</h3>

      {/* Dark background test */}
      <div className="bg-black p-4 rounded border border-white/20">
        <p className="text-white text-xs mb-2">Dark Background (#000000)</p>
        <MELogo size="md" />
      </div>

      {/* Neo-brutalist dark background test */}
      <div className="bg-[#0B0B0B] p-4 rounded border border-white/20">
        <p className="text-white text-xs mb-2">Sidebar Background (#0B0B0B)</p>
        <MELogo size="md" variant="sidebar" />
      </div>

      {/* Main background test */}
      <div className="bg-[#0E0E0E] p-4 rounded border border-white/20">
        <p className="text-white text-xs mb-2">Main Background (#0E0E0E)</p>
        <MELogo size="md" />
      </div>

      {/* Size test */}
      <div className="bg-black p-4 rounded border border-white/20">
        <p className="text-white text-xs mb-2">Size Variations</p>
        <div className="flex items-center gap-2">
          <MELogo size="xs" />
          <MELogo size="sm" />
          <MELogo size="md" />
          <MELogo size="lg" />
          <MELogo size="xl" />
        </div>
      </div>
    </div>
  )
}
