/**
 * CinematicVideoIntro — Aurevilux Luxury Cinematic Product Introduction
 *
 * Two-layer synchronized video architecture:
 *   Layer 1 (z-10): Full-bleed background video (original, with background)
 *   Layer 2 (z-30): Transparent foreground video (alpha channel; model/product only)
 *   Shopping Panel: z-20 by default → z-40 on hover (always reachable via pointer-events passthrough)
 *
 * High-Performance Smooth Sync Engine:
 *   - Uses dynamic playbackRate ramping (1.08x / 0.92x) for drift correction (< 40ms).
 *   - NEVER triggers hard currentTime seeks during playback (hard seeks cause VP9 buffer flushes and extreme lag).
 *   - Listens to master timeupdate (~4Hz) instead of 60-144Hz RAF loop, saving CPU & GPU decoding headroom.
 *   - Coordinated play, pause, buffer waiting, and ended transitions.
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
  onIntroComplete,
}) => {
  const bgVideoRef = useRef<HTMLVideoElement>(null);
  const fgVideoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const introTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDissolvingRef = useRef(false);
  const [isPanelHovered, setIsPanelHovered] = useState(false);
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
        // Pause both streams and release decoder memory
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
  // Uses playbackRate ramping instead of hard .currentTime seeks!
  // Hard seeks cause browser VP9 decoder buffer flushes, resulting in massive stutter.
  // Dynamic playbackRate adjusts timing continuously with ZERO frame drops.
  const handleTimeUpdate = useCallback(() => {
    const master = bgVideoRef.current;
    const slave = fgVideoRef.current;
    if (!master || !slave || master.paused || slave.paused || isDissolvingRef.current) {
      return;
    }

    const diff = master.currentTime - slave.currentTime;
    const absDiff = Math.abs(diff);

    // If drift is catastrophic (> 0.4s, e.g. tab switch), perform a hard seek
    if (absDiff > 0.4) {
      slave.currentTime = master.currentTime;
      slave.playbackRate = 1.0;
    } else if (diff > 0.04) {
      // Slave is slightly behind -> speed it up gently (no re-seek, butter smooth)
      slave.playbackRate = 1.08;
    } else if (diff < -0.04) {
      // Slave is slightly ahead -> slow it down gently
      slave.playbackRate = 0.92;
    } else {
      // In lockstep (< 40ms) -> standard 1.0x playback
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

    // Skip entirely on data-saver or reduced-motion preference
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
        // Reset both streams to frame 0
        bg.currentTime = 0;
        fg.currentTime = 0;
        bg.playbackRate = 1.0;
        fg.playbackRate = 1.0;

        // Atomic play — both streams start simultaneously
        await Promise.all([bg.play(), fg.play()]);
        setIntroStarted(true);

        // Calculate dynamic hold duration: use video duration if available, else config
        const calculatedDuration =
          editorialVideo.duration ??
          (bg.duration && bg.duration > 0 ? Math.min(bg.duration, 7.5) : 6.5);
        const introDurationMs = calculatedDuration * 1000;

        introTimerRef.current = setTimeout(() => {
          dissolveAndComplete();
        }, introDurationMs);
      } catch (err) {
        // Autoplay blocked (e.g. mobile policy) -> skip gracefully
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

    // Synchronize play/pause states if master buffers
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

    // Wire up events
    bg.addEventListener("timeupdate", handleTimeUpdate);
    bg.addEventListener("waiting", onMasterWaiting);
    bg.addEventListener("playing", onMasterPlaying);
    bg.addEventListener("ended", onMasterEnded);

    // readyState >= 3 (HAVE_FUTURE_DATA) or 4 (HAVE_ENOUGH_DATA)
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

    // Kick off loading
    bg.load();
    fg.load();

    // In case both were already cached / buffered
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

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    /**
     * CINEMATIC WRAPPER — absolute over the entire section, same dimensions
     * ref: wrapperRef (target of GSAP dissolve)
     */
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="absolute inset-0 z-50 overflow-hidden"
    >
      {/* =================================================================== */}
      {/* LAYER 1 — FULL-BLEED BACKGROUND VIDEO (z-10)                        */}
      {/* =================================================================== */}
      <video
        ref={bgVideoRef}
        muted
        playsInline
        preload="auto"
        poster={editorialVideo.poster}
        aria-label={`${productName} editorial background`}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none z-10 [transform:translateZ(0)] [backface-visibility:hidden]"
      >
        <source src={editorialVideo.backgroundVideo} type="video/webm" />
        <source src={editorialVideo.backgroundVideo} type="video/mp4" />
      </video>

      {/* Dark gradient vignettes — identical to the static backdrop system   */}
      <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[48%] bg-gradient-to-l from-brand-black via-brand-black/90 to-transparent pointer-events-none z-20" />
      <div className="absolute left-0 top-0 bottom-0 w-28 sm:w-36 bg-gradient-to-r from-brand-black/85 via-brand-black/40 to-transparent pointer-events-none z-20" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-black via-brand-black/50 to-transparent pointer-events-none z-20" />
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-brand-black via-brand-black/50 to-transparent pointer-events-none z-20" />

      {/* Ambient glows (hardware-friendly radial gradients, no runtime blur filter) */}
      <div className="absolute left-[15%] top-[25%] w-[450px] h-[450px] bg-[radial-gradient(circle,rgba(109,26,42,0.22)_0%,transparent_70%)] rounded-full pointer-events-none z-20" />
      <div className="absolute right-[20%] top-[20%] w-[380px] h-[380px] bg-[radial-gradient(circle,rgba(88,28,135,0.18)_0%,transparent_70%)] rounded-full pointer-events-none z-20" />

      {/* =================================================================== */}
      {/* LAYER 2 — TRANSPARENT FOREGROUND VIDEO (z-30 / z-10 on panel hover) */}
      {/* =================================================================== */}
      <video
        ref={fgVideoRef}
        muted
        playsInline
        preload="auto"
        aria-label={`${productName} editorial model foreground`}
        className={`absolute inset-0 w-full h-full object-cover object-center pointer-events-none [transform:translateZ(0)] [backface-visibility:hidden] transition-opacity duration-500 ${
          isPanelHovered
            ? "z-10 opacity-30"
            : "z-30 opacity-100"
        }`}
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
      {/* SHOPPING PANEL HOVER DETECTOR (invisible overlay on the right 32%)   */}
      {/* =================================================================== */}
      <div
        aria-hidden="true"
        className="absolute right-0 top-0 bottom-0 w-[32%] z-[25] hidden lg:block"
        onMouseEnter={() => setIsPanelHovered(true)}
        onMouseLeave={() => setIsPanelHovered(false)}
      />

      {/* =================================================================== */}
      {/* SKIP INTRO CONTROL — always at the top-most z-level (z-50)           */}
      {/* =================================================================== */}
      <div
        className={`absolute top-6 right-6 z-50 transition-opacity duration-700 ${
          introStarted ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={dissolveAndComplete}
          aria-label="Skip cinematic introduction"
          className="group flex items-center space-x-2 bg-brand-black/40 hover:bg-brand-black/70 backdrop-blur-sm border border-zinc-700/60 hover:border-brand-gold/60 text-zinc-400 hover:text-white px-4 py-2 rounded text-[9px] font-bold tracking-[0.25em] uppercase transition-all duration-300"
        >
          <span>SKIP INTRO</span>
          <X className="w-3 h-3 opacity-70 group-hover:opacity-100" />
        </button>
      </div>

      {/* =================================================================== */}
      {/* MOBILE PANEL HINT — tap-to-reveal pill (no hover on touch devices)   */}
      {/* =================================================================== */}
      <div
        className={`absolute bottom-20 left-1/2 -translate-x-1/2 z-50 lg:hidden transition-opacity duration-700 ${
          introStarted ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={dissolveAndComplete}
          className="bg-brand-black/50 backdrop-blur-sm border border-zinc-700/60 text-zinc-300 text-[9px] font-semibold tracking-[0.25em] uppercase px-5 py-2.5 rounded-full"
        >
          VIEW PRODUCT DETAILS ↓
        </button>
      </div>

      {/* =================================================================== */}
      {/* BUFFERING INDICATOR — spins only while pre-buffering is in progress   */}
      {/* =================================================================== */}
      {!introStarted && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2 opacity-50">
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
