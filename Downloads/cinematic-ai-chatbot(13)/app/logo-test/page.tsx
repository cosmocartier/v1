"use client"

import { MELogo } from "@/components/me-logo"

export default function LogoTestPage() {
  return (
    <div className="min-h-screen bg-[#0E0E0E] p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-white text-2xl font-bold mb-8">Logo Visibility Verification</h1>

        {/* Background variations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pure black */}
          <div className="bg-black p-6 rounded-lg border border-white/20">
            <h3 className="text-white text-sm font-bold mb-4">Pure Black (#000000)</h3>
            <div className="flex justify-center">
              <MELogo size="lg" />
            </div>
          </div>

          {/* Sidebar color */}
          <div className="bg-[#0B0B0B] p-6 rounded-lg border border-white/20">
            <h3 className="text-white text-sm font-bold mb-4">Sidebar (#0B0B0B)</h3>
            <div className="flex justify-center">
              <MELogo size="lg" variant="sidebar" />
            </div>
          </div>

          {/* Main background */}
          <div className="bg-[#0E0E0E] p-6 rounded-lg border border-white/20">
            <h3 className="text-white text-sm font-bold mb-4">Main (#0E0E0E)</h3>
            <div className="flex justify-center">
              <MELogo size="lg" />
            </div>
          </div>
        </div>

        {/* Size variations */}
        <div className="bg-black p-6 rounded-lg border border-white/20">
          <h3 className="text-white text-lg font-bold mb-4">Size Variations</h3>
          <div className="flex items-center justify-center gap-6">
            <div className="text-center">
              <MELogo size="xs" />
              <p className="text-white/60 text-xs mt-2">XS (20px)</p>
            </div>
            <div className="text-center">
              <MELogo size="sm" />
              <p className="text-white/60 text-xs mt-2">SM (28px)</p>
            </div>
            <div className="text-center">
              <MELogo size="md" />
              <p className="text-white/60 text-xs mt-2">MD (36px)</p>
            </div>
            <div className="text-center">
              <MELogo size="lg" />
              <p className="text-white/60 text-xs mt-2">LG (44px)</p>
            </div>
            <div className="text-center">
              <MELogo size="xl" />
              <p className="text-white/60 text-xs mt-2">XL (52px)</p>
            </div>
          </div>
        </div>

        {/* Hover test */}
        <div className="bg-[#0B0B0B] p-6 rounded-lg border border-white/20">
          <h3 className="text-white text-lg font-bold mb-4">Interactive Test (Hover)</h3>
          <div className="flex justify-center">
            <div className="group cursor-pointer p-4 rounded hover:bg-white/5">
              <MELogo size="lg" variant="sidebar" />
            </div>
          </div>
          <p className="text-white/60 text-sm text-center mt-2">Hover over the logo to test brightness effect</p>
        </div>

        {/* Opacity verification */}
        <div className="bg-black p-6 rounded-lg border border-white/20">
          <h3 className="text-white text-lg font-bold mb-4">Opacity Verification</h3>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div style={{ opacity: 0.25 }}>
                <MELogo size="md" />
              </div>
              <p className="text-white/60 text-xs mt-2">25% Opacity</p>
            </div>
            <div className="text-center">
              <div style={{ opacity: 0.5 }}>
                <MELogo size="md" />
              </div>
              <p className="text-white/60 text-xs mt-2">50% Opacity</p>
            </div>
            <div className="text-center">
              <div style={{ opacity: 0.75 }}>
                <MELogo size="md" />
              </div>
              <p className="text-white/60 text-xs mt-2">75% Opacity</p>
            </div>
            <div className="text-center">
              <MELogo size="md" />
              <p className="text-white/60 text-xs mt-2">100% Opacity</p>
            </div>
          </div>
        </div>

        {/* CSS Filter verification */}
        <div className="bg-black p-6 rounded-lg border border-white/20">
          <h3 className="text-white text-lg font-bold mb-4">Filter Comparison</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <img src="/images/me-logo.png" alt="Original" className="w-11 h-11 mx-auto" />
              <p className="text-white/60 text-xs mt-2">Original</p>
            </div>
            <div className="text-center">
              <img
                src="/images/me-logo.png"
                alt="Inverted"
                className="w-11 h-11 mx-auto"
                style={{ filter: "invert(1)" }}
              />
              <p className="text-white/60 text-xs mt-2">Inverted</p>
            </div>
            <div className="text-center">
              <img
                src="/images/me-logo.png"
                alt="Bright White"
                className="w-11 h-11 mx-auto"
                style={{ filter: "brightness(0) invert(1)" }}
              />
              <p className="text-white/60 text-xs mt-2">Bright White</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
