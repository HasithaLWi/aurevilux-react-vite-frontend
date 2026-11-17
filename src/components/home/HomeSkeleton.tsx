import React from "react";

/**
 * Reusable Golden Shimmer Wireframe Block
 */
const GoldShimmer: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`relative overflow-hidden bg-[#0e0e13] border border-zinc-900/80 rounded ${className}`}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/15 to-transparent -translate-x-full animate-shimmer-gold" />
  </div>
);

/**
 * Luxury Haute Couture Home Skeleton Loader Overlay
 * Displayed as a smooth, fixed golden veil while Hero and New Collection high-res imagery preload into GPU memory.
 */
export const HomeSkeleton: React.FC = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 z-40 flex flex-col justify-between bg-brand-black px-4 sm:px-8 md:px-12 lg:px-16 pt-24 pb-8 md:pb-12 overflow-hidden select-none pointer-events-none"
    >
      {/* Soft Glowing Ambient Lights */}
      <div className="absolute left-[10%] top-[25%] w-[420px] h-[420px] bg-brand-burgundy/20 blur-[130px] rounded-full z-0" />
      <div className="absolute right-[15%] top-[20%] w-[380px] h-[380px] bg-purple-950/15 blur-[120px] rounded-full z-0" />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[500px] h-[300px] bg-brand-gold/5 blur-[140px] rounded-full z-0" />

      {/* Far-Left Vertical Accent Tag Wireframe */}
      <div className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 rotate-180 [writing-mode:vertical-rl] z-10 items-center space-y-3">
        <span className="text-[9px] tracking-[0.35em] text-zinc-600 uppercase font-mono">
          AUREVILUX ATELIER
        </span>
        <div className="w-[1px] h-10 bg-zinc-900" />
      </div>

      {/* Centerpiece Cutout Silhouette Wireframe */}
      <div className="absolute inset-0 z-10 flex items-center justify-end pr-0 sm:pr-4 md:pr-10 lg:pr-16 xl:pr-24 overflow-hidden">
        <div className="relative bottom-0 max-h-[820px] h-[68vh] sm:h-[75vh] md:h-[82vh] w-[260px] sm:w-[320px] md:w-[400px] lg:w-[440px] rounded-t-full bg-gradient-to-t from-zinc-950 via-zinc-900/30 to-transparent border-t border-brand-gold/20 shadow-[0_0_80px_rgba(197,168,128,0.05)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/10 to-transparent -translate-x-full animate-shimmer-gold" />
        </div>
      </div>

      {/* Main Stage Content: Left Editorial + Right Look Card */}
      <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 my-auto">
        {/* Left Column: Editorial Wireframe */}
        <div className="lg:col-span-8 xl:col-span-7 space-y-5">
          {/* Eyebrow Pill */}
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-[1px] bg-brand-burgundy/60" />
            <GoldShimmer className="h-3.5 w-52 rounded-sm" />
          </div>

          {/* Headline Letter Shimmers (Large Serif Style) */}
          <div className="space-y-3 pt-1">
            <GoldShimmer className="h-14 sm:h-16 md:h-20 w-[85%] max-w-lg rounded-md" />
            <div className="flex items-center gap-2">
              <GoldShimmer className="h-14 sm:h-16 md:h-20 w-[60%] max-w-sm rounded-md" />
              <div className="w-3.5 h-3.5 rounded-full bg-brand-gold/40 animate-pulse mt-4" />
            </div>
          </div>

          {/* Description Lines */}
          <div className="space-y-2 max-w-md pt-2">
            <GoldShimmer className="h-3 w-full rounded-sm" />
            <GoldShimmer className="h-3 w-[88%] rounded-sm" />
            <GoldShimmer className="h-3 w-[65%] rounded-sm" />
          </div>

          {/* Action CTA Buttons */}
          <div className="flex items-center gap-5 pt-3">
            <GoldShimmer className="h-12 w-44 rounded bg-brand-burgundy/25 border-brand-burgundy/40" />
            <GoldShimmer className="h-5 w-32 rounded-sm" />
          </div>
        </div>

        {/* Right Column: Floating Glassmorphic Look Card Skeleton */}
        <div className="lg:col-span-4 xl:col-span-5 lg:justify-self-end w-full max-w-[310px] hidden lg:block self-start lg:mt-2 xl:mt-4">
          <div className="bg-[#101014]/80 border border-brand-gold/25 rounded-lg p-3.5 shadow-2xl relative overflow-hidden space-y-2.5">
            <div className="flex items-center space-x-3.5">
              <GoldShimmer className="w-16 h-20 rounded bg-zinc-950 border-zinc-800/80 shrink-0" />
              <div className="flex-1 space-y-2">
                <GoldShimmer className="h-2.5 w-24 rounded-sm" />
                <GoldShimmer className="h-3 w-36 rounded-sm" />
                <GoldShimmer className="h-2 w-28 rounded-sm" />
                <div className="pt-1 flex items-center justify-between">
                  <GoldShimmer className="h-3.5 w-16 rounded-sm" />
                  <GoldShimmer className="h-3 w-12 rounded-sm" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Carousel Controls Wireframe */}
      <div className="relative z-20 max-w-7xl mx-auto w-full pt-6 flex items-center justify-between border-t border-zinc-900/60">
        <div className="flex items-center space-x-4">
          <GoldShimmer className="h-3 w-14 rounded-sm" />
          <div className="w-24 sm:w-36 h-[2px] bg-zinc-900 rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-brand-gold/30 animate-pulse" />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <GoldShimmer className="w-9 h-9 rounded-full" />
          <GoldShimmer className="w-9 h-9 rounded-full" />
        </div>
      </div>
    </div>
  );
};
