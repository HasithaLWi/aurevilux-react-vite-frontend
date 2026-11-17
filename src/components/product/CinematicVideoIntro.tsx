/**
 * CinematicVideoIntro — Aurevilux Luxury Cinematic Product Introduction
 *
 * THE 3-LAYER "SANDWICH" DEPTH ARCHITECTURE:
 *   Layer 1 (z-10): Pristine original background video (100% brightness, no darkening gradients).
 *   Layer 2 (z-20): Editorial typography (Brand, massive serif title, price/season).
 *                   Sits BEHIND the model, but IN FRONT OF the room/background video.
 *   Layer 3 (z-30): Transparent foreground video (model only with alpha channel).
 *                   Sits directly in front of the typography.
 *                   Because Layer 1 underneath has the EXACT identical pixels, any imperfect
 *                   alpha cutout edges blend seamlessly into the background video below!
 *   Layer 4 (z-40): Shopping Panel on hover (and Skip Intro button), giving 100% user agency.
 *
 * High-Performance Smooth Sync Engine:
 *   - Dynamic playbackRate ramping (1.08x / 0.92x) for drift correction (< 40ms).
 *   - ZERO hard currentTime seeks during normal playback (prevents VP9 buffer flushes).
 *   - Native timeupdate (~4Hz) instead of 60-144Hz RAF loop.
 */

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { gsap } from "../../animations";
import { X } from "lucide-react";
import type { EditorialVideoSource } from "../../types";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CinematicVideoIntroProps {
  editorialVideo: EditorialVideoSource;
  productName: string;
  brand?: string;
  price?: number;
  /** Called when the intro dissolves and the gallery should become visible */
  onIntroComplete: () => void;
}

// ─── Helper: detect data-saver or very slow network ──────────────────────────
function shouldSkipForDataSaver(): boolean {
  const conn = (navigator as any).connection;
  if (!conn) return false;
  if (conn.saveData) return true;
  if (conn.effectiveType === "2g" || conn.effectiveType === "slow-2g") return true;
  return false;
}

// ─── Component ────────────────────────────────────────────────────────────────

const CinematicVideoIntro: React.FC<CinematicVideoIntroProps> = ({
  editorialVideo,
  productName,
  brand,
  price,
  onIntroComplete,
}) => {
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const fgVideoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDissolvingRef = useRef(false);
  const [introStarted, setIntroStarted] = useState(false);

  // ── Dissolve out and hand off to the normal gallery ─────────────────────────
  const dissolveAndComplete = useCallback(() => {
    if (isDissolvingRef.current) return;
    isDissolvingRef.current = true;

    if (introTimerRef.current) {
      clearTimeout(introTimerRef.current);
      introTimerRef.current = null;
    }

    if (!wrapperRef.current) {
      onIntroComplete();
      return;
    }

    // Smooth cinematic fade-out
    gsap.to(wrapperRef.current, {
      opacity: 0,
      duration: 0.8,
      ease: "power2.inOut",
      onComplete: () => {
        if (bgVideoRef.current) {
          bgVideoRef.current.pause();
        }
        if (fgVideoRef.current) {
          fgVideoRef.current.pause();
        }
        onIntroComplete();
      },
    });
  }, [onIntroComplete]);

  // ── High-Performance Smooth Sync Engine ─────────────────────────────────────
  const handleTimeUpdate = useCallback(() => {
    const master = bgVideoRef.current;
    const slave = fgVideoRef.current;
    if (!master || !slave || master.paused || slave.paused || isDissolvingRef.current) {
      return;
    }

    const diff = master.currentTime - slave.currentTime;
    const absDiff = Math.abs(diff);

    // Only hard-seek on catastrophic desync (e.g. background tab)
    if (absDiff > 0.4) {
      slave.currentTime = master.currentTime;
      slave.playbackRate = 1.0;
    } else if (diff > 0.04) {
      slave.playbackRate = 1.08;
    } else if (diff < -0.04) {
      slave.playbackRate = 0.92;
    } else {
      if (slave.playbackRate !== 1.0) {
        slave.playbackRate = 1.0;
      }
    }
  }, []);

  // ── Pre-buffering gate + atomic playback ─────────────────────────────────────
  useEffect(() => {
    const bg = bgVideoRef.current;
    const fg = fgVideoRef.current;
    if (!bg || !fg) return;

    if (
      shouldSkipForDataSaver() ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      onIntroComplete();
      return;
    }

    bg.muted = true;
    fg.muted = true;

    let bgReady = false;
    let fgReady = false;
    let started = false;

    const tryStart = async () => {
      if (!bgReady || !fgReady || started) return;
      started = true;

      try {
        bg.currentTime = 0;
        fg.currentTime = 0;
        bg.playbackRate = 1.0;
        fg.playbackRate = 1.0;

        await Promise.all([bg.play(), fg.play()]);
        setIntroStarted(true);

        const calculatedDuration =
          editorialVideo.duration ??
          (bg.duration && bg.duration > 0 ? Math.min(bg.duration, 7.5) : 6.5);
        const introDurationMs = calculatedDuration * 1000;

        introTimerRef.current = setTimeout(() => {
          dissolveAndComplete();
        }, introDurationMs);
      } catch (err) {
        console.warn("[CinematicVideoIntro] Autoplay blocked, skipping intro:", err);
        onIntroComplete();
      }
    };

    const onBgReady = () => {
      bgReady = true;
      tryStart();
    };
    const onFgReady = () => {
      fgReady = true;
      tryStart();
    };

    const onMasterWaiting = () => {
      if (!fg.paused) fg.pause();
    };
    const onMasterPlaying = () => {
      if (fg.paused && !isDissolvingRef.current) {
        fg.play().catch(() => {});
      }
    };
    const onMasterEnded = () => {
      dissolveAndComplete();
    };

    bg.addEventListener("timeupdate", handleTimeUpdate);
    bg.addEventListener("waiting", onMasterWaiting);
    bg.addEventListener("playing", onMasterPlaying);
    bg.addEventListener("ended", onMasterEnded);

    if (bg.readyState >= 3) {
      bgReady = true;
    } else {
      bg.addEventListener("canplay", onBgReady, { once: true });
    }

    if (fg.readyState >= 3) {
      fgReady = true;
    } else {
      fg.addEventListener("canplay", onFgReady, { once: true });
    }

    bg.load();
    fg.load();
    tryStart();

    return () => {
      bg.removeEventListener("canplay", onBgReady);
      fg.removeEventListener("canplay", onFgReady);
      bg.removeEventListener("timeupdate", handleTimeUpdate);
      bg.removeEventListener("waiting", onMasterWaiting);
      bg.removeEventListener("playing", onMasterPlaying);
      bg.removeEventListener("ended", onMasterEnded);
      if (introTimerRef.current) clearTimeout(introTimerRef.current);
      bg.pause();
      fg.pause();
    };
  }, [dissolveAndComplete, editorialVideo.duration, handleTimeUpdate, onIntroComplete]);

  // ── Skip on Escape key ───────────────────────────────────────────────────────
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dissolveAndComplete();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [dissolveAndComplete]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none select-none overflow-hidden"
    >
      {/* =================================================================== */}
      {/* LAYER 1 — PRISTINE ORIGINAL BACKGROUND VIDEO (z-10)                 */}
      {/* 100% natural brightness, NO darkening gradients over it, so that the*/}
      {/* transparent video pixels match 100% and hide cutout imperfections!  */}
      {/* =================================================================== */}
      <video
        ref={bgVideoRef}
        muted
        playsInline
        preload="auto"
        poster={editorialVideo.poster}
        aria-label={`${productName} background video`}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-10 [transform:translateZ(0)] [backface-visibility:hidden]"
      >
        <source src={editorialVideo.backgroundVideo} type="video/webm" />
        <source src={editorialVideo.backgroundVideo} type="video/mp4" />
      </video>

      {/* =================================================================== */}
      {/* LAYER 2 — EDITORIAL TYPOGRAPHY SANDWICH (z-[15])                    */}
      {/* Placed BEHIND the transparent model (z-30), but IN FRONT OF the    */}
      {/* original background room/video (z-10).                             */}
      {/* Creates the iconic "Model stepping in front of the text" effect!   */}
      {/* =================================================================== */}
      <div className="absolute inset-0 z-[15] flex flex-col justify-center px-8 sm:px-14 md:px-20 lg:px-24 pointer-events-none select-none">
        <div className="max-w-4xl space-y-3 sm:space-y-4">
          {/* Brand Eyebrow */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-[1px] bg-brand-gold" />
            <span className="text-[10px] sm:text-xs md:text-sm tracking-[0.35em] text-brand-gold font-bold uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              {brand || "AUREVILUX ATELIER"}
            </span>
          </div>

          {/* Majestic Headline — the transparent model in Layer 3 physically occludes this! */}
          <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl lg:text-9xl text-white tracking-tight uppercase leading-[0.92] drop-shadow-[0_15px_35px_rgba(0,0,0,0.95)]">
            {productName}
          </h1>

          {/* Pricing & Season tag */}
          {price !== undefined && (
            <div className="pt-2 flex items-center space-x-4">
              <span className="font-serif text-2xl sm:text-3xl text-brand-gold font-semibold drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
                ${price.toLocaleString()}
              </span>
              <span className="text-zinc-300 text-xs sm:text-sm tracking-[0.25em] uppercase font-light drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                &bull; COUTURE COLLECTION
              </span>
            </div>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* LAYER 3 — TRANSPARENT FOREGROUND VIDEO (z-30)                       */}
      {/* Sits directly ON TOP of the typography in Layer 2 and unhovered     */}
      {/* Shopping Panel. Because Layer 1 plays directly underneath at 1-to-1 */}
      {/* coordinates, any rough or soft alpha edges blend seamlessly into    */}
      {/* the real pixels!                                                    */}
      {/* =================================================================== */}
      <video
        ref={fgVideoRef}
        muted
        playsInline
        preload="auto"
        aria-label={`${productName} transparent model foreground`}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-30 [transform:translateZ(0)] [backface-visibility:hidden]"
      >
        {/* Safari / iOS: HEVC alpha (must be listed first) */}
        {editorialVideo.transparentVideoHevc && (
          <source
            src={editorialVideo.transparentVideoHevc}
            type='video/mp4; codecs="hvc1"'
          />
        )}
        {/* Chrome / Edge / Firefox: VP9 alpha WebM */}
        <source
          src={editorialVideo.transparentVideoWebm}
          type='video/webm; codecs="vp9"'
        />
      </video>

      {/* =================================================================== */}
      {/* LAYER 4 — SKIP INTRO & HUD CONTROLS (z-50)                          */}
      {/* Always clickable and elevated at z-50                               */}
      {/* =================================================================== */}
      <div
        className={`absolute top-6 right-6 z-50 pointer-events-auto transition-opacity duration-700 ${
          introStarted ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={dissolveAndComplete}
          aria-label="Skip cinematic introduction"
          className="group flex items-center space-x-2 bg-brand-black/60 hover:bg-brand-black/90 backdrop-blur-md border border-zinc-700/80 hover:border-brand-gold text-zinc-300 hover:text-white px-4 py-2 rounded text-[9px] font-bold tracking-[0.25em] uppercase transition-all duration-300 shadow-xl cursor-pointer"
        >
          <span>SKIP INTRO</span>
          <X className="w-3 h-3 opacity-70 group-hover:opacity-100" />
        </button>
      </div>

      {/* Mobile Discover Button */}
      <div
        className={`absolute bottom-16 left-1/2 -translate-x-1/2 z-50 lg:hidden pointer-events-auto transition-opacity duration-700 ${
          introStarted ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={dissolveAndComplete}
          className="bg-brand-black/70 backdrop-blur-md border border-zinc-700 text-white text-[9px] font-semibold tracking-[0.25em] uppercase px-5 py-2.5 rounded-full shadow-xl cursor-pointer"
        >
          DISCOVER PIECE &darr;
        </button>
      </div>

      {/* Buffering Indicator */}
      {!introStarted && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2 opacity-60">
          <div className="w-4 h-4 border border-brand-gold border-t-transparent rounded-full animate-spin" />
          <span className="text-[9px] text-zinc-400 font-mono tracking-widest uppercase">
            LOADING EDITORIAL
          </span>
        </div>
      )}
    </div>
  );
};

export default CinematicVideoIntro;
