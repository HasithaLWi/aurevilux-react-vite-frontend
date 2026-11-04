import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { gsap, useGSAP, motionTokens } from "../../../animations";
import { HERO_SLIDES, type HeroSlideData } from "./heroData";

const Hero: React.FC = () => {
  const [slideIndex, setSlideIndex] = useState(0);
  const activeSlide: HeroSlideData = HERO_SLIDES[slideIndex];

  const heroContainerRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const modelRef = useRef<HTMLImageElement>(null);
  const bgRef = useRef<HTMLImageElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Manual navigation to any slide
  const goToSlide = useCallback((newIndex: number) => {
    const targetIndex = (newIndex + HERO_SLIDES.length) % HERO_SLIDES.length;
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    setSlideIndex(targetIndex);
  }, []);

  // Pause on hovering over action buttons so user can click comfortably
  const handleCtaMouseEnter = () => {
    if (timelineRef.current) {
      timelineRef.current.pause();
    }
  };

  const handleCtaMouseLeave = () => {
    if (timelineRef.current) {
      timelineRef.current.resume();
    }
  };

  // Master Motion Timeline: Typewriter cadence + Model 2.5D rise + Auto-Carousel Cycle
  useGSAP(
    () => {
      // Accessibility: Reduced motion check
      if (window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches) {
        gsap.set("[data-line1-letter], [data-line2-letter], [data-hero-dot]", {
          opacity: 1,
          y: 0,
          filter: "none",
        });
        const timer = setTimeout(() => {
          setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 4500);
        return () => clearTimeout(timer);
      }

      // 1. Initial State: Letters hidden below with blur focus
      gsap.set("[data-line1-letter], [data-line2-letter]", {
        opacity: 0,
        y: 32,
        filter: "blur(6px)",
      });
      gsap.set("[data-hero-dot]", {
        opacity: 0,
        scale: 0.3,
        y: 12,
      });

      // 2. Animate Centerpiece Model & Atmospheric Backdrop
      if (modelRef.current) {
        gsap.fromTo(
          modelRef.current,
          {
            opacity: 0.15,
            y: 40,
            scale: 0.96,
            filter: "blur(4px)",
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power3.out",
            clearProps: "filter",
          },
        );
      }

      if (bgRef.current) {
        gsap.fromTo(
          bgRef.current,
          { opacity: 0.2, scale: 1.05 },
          { opacity: 0.45, scale: 1.0, duration: 0.9, ease: "power2.out" },
        );
      }

      if (leftContentRef.current) {
        gsap.fromTo(
          "[data-hero-copy]",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.5, delay: 0.1, ease: "power2.out" },
        );
      }

      // 3. Choreographed Typewriter Sequence + Hold + Reverse Erase + Next Slide
      const slideTl = gsap.timeline({
        onComplete: () => {
          setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
        },
      });

      timelineRef.current = slideTl;

      // Animate progress bar across full timeline duration
      if (progressBarRef.current) {
        slideTl.fromTo(
          progressBarRef.current,
          { width: "0%" },
          { width: "100%", duration: 4.8, ease: "none" },
          0,
        );
      }

      slideTl
        // Step A: Line 1 letters glide up with crisp cadence
        .to(
          "[data-line1-letter]",
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.32,
            stagger: 0.025,
            ease: "power3.out",
          },
          0.05,
        )
        // Step B: Line 2 starts immediately right behind line 1
        .to(
          "[data-line2-letter]",
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.32,
            stagger: 0.025,
            ease: "power3.out",
          },
          "<0.1", // 👈 Starts just 0.1s after Line 1 begins (fluid cascade)
        )
        // Step C: Gold period pops in crisply
        .to(
          "[data-hero-dot]",
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.2,
            ease: "back.out(2)",
          },
          "-=0.08",
        )
        // Step D: Editorial Hold — let the client view and absorb the luxury look
        .to({}, { duration: 3.0 })
        // Step E: Letter-by-letter reverse erase (Backspacing + upward vertical glide)
        .to("[data-hero-dot]", {
          opacity: 0,
          y: -14,
          duration: 0.15,
          ease: "power2.in",
        })
        .to(
          "[data-line2-letter]",
          {
            opacity: 0,
            y: -24,
            filter: "blur(4px)",
            duration: 0.22,
            stagger: {
              each: 0.022,
              from: "end", // Reverse backspace order: last character erased first
            },
            ease: "power2.in",
          },
          "-=0.05",
        )
        .to(
          "[data-line1-letter]",
          {
            opacity: 0,
            y: -24,
            filter: "blur(4px)",
            duration: 0.22,
            stagger: {
              each: 0.022,
              from: "end", // Reverse backspace order
            },
            ease: "power2.in",
          },
          "-=0.08",
        );

      return () => {
        slideTl.kill();
      };
    },
    { scope: heroContainerRef, dependencies: [slideIndex] },
  );

  return (
    <section
      ref={heroContainerRef}
      className="relative w-full min-h-screen md:h-screen bg-brand-black overflow-hidden flex flex-col justify-between pt-24 md:pt-28 pb-8 px-6 md:px-12 select-none"
    >
      {/* ============================================================ */}
      {/* 1. LAYER 1: ATMOSPHERIC BACKDROP MEDIA & CRIMSON AMBIENT GLOW */}
      {/* ============================================================ */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          ref={bgRef}
          src={activeSlide.backgroundImage}
          alt={activeSlide.line1}
          className="w-full h-full object-cover object-center opacity-45 scale-100 transition-transform duration-1000 ease-out"
        />

        {/* Cinematic Gradient Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/85 to-transparent md:w-[65%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-brand-black/40" />

        {/* Soft Glowing Ambient Lights */}
        <div className="absolute left-[10%] top-[25%] w-[420px] h-[420px] bg-brand-burgundy/30 blur-[130px] rounded-full" />
        <div className="absolute right-[15%] top-[20%] w-[380px] h-[380px] bg-purple-950/20 blur-[120px] rounded-full" />
      </div>

      {/* Far-Left Vertical Rotated Accent Tag */}
      <div className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 rotate-180 [writing-mode:vertical-rl] z-10 items-center space-y-3 pointer-events-none">
        <span className="text-[9px] tracking-[0.35em] text-zinc-500 uppercase font-medium">
          AUREVILUX ATELIER
        </span>
        <div className="w-[1px] h-10 bg-zinc-800" />
      </div>

      {/* ============================================================ */}
      {/* 2. LAYER 2: CENTERPIECE CUTOUT MODEL (SIGNATURE 2.5D DEPTH)   */}
      {/* ============================================================ */}
      <div className="absolute inset-0 z-10 flex items-center justify-end pointer-events-none pr-0 sm:pr-4 md:pr-10 lg:pr-16 xl:pr-24">
        <img
          ref={modelRef}
          src={activeSlide.modelImage}
          alt={`${activeSlide.line1} Model`}
          className="h-[68vh] sm:h-[75vh] md:h-[82vh] max-h-[820px] w-auto object-contain object-bottom drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] gpu-accelerated"
        />
      </div>

      {/* ============================================================ */}
      {/* 3. LAYER 3: MAIN STAGE CONTENT (LEFT EDITORIAL HEADLINE/CTA) */}
      {/* ============================================================ */}
      <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center flex-1 my-auto">
        <div
          ref={leftContentRef}
          className="lg:col-span-8 xl:col-span-7 space-y-4 md:space-y-5"
        >
          {/* Eyebrow with gold/burgundy bar */}
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-[1px] bg-brand-burgundy" />
            <span className="text-[10px] md:text-xs tracking-[0.3em] text-brand-gold font-semibold uppercase">
              {activeSlide.eyebrow}
            </span>
          </div>

          {/* Letter-by-Letter Typewriter Display Headline */}
          <h1
            ref={titleRef}
            className="font-serif text-6xl sm:text-7xl md:text-8xl text-white tracking-wide leading-[0.95] md:leading-[0.92] text-luxury-shadow select-none"
            aria-label={`${activeSlide.line1} ${activeSlide.line2}`}
          >
            {/* Line 1 Letters */}
            <span className="block overflow-visible">
              {activeSlide.line1.split("").map((letter, idx) => (
                <span
                  key={`l1-${slideIndex}-${idx}`}
                  data-line1-letter
                  className="inline-block gpu-accelerated"
                >
                  {letter === " " ? "\u00A0" : letter}
                </span>
              ))}
            </span>

            {/* Line 2 Letters + Period Dot */}
            <span className="inline-flex items-baseline overflow-visible mt-1 md:mt-2">
              {activeSlide.line2.split("").map((letter, idx) => (
                <span
                  key={`l2-${slideIndex}-${idx}`}
                  data-line2-letter
                  className="inline-block gpu-accelerated"
                >
                  {letter === " " ? "\u00A0" : letter}
                </span>
              ))}
              <span
                data-hero-dot
                className="text-brand-gold select-none inline-block gpu-accelerated ml-0.5"
              >
                .
              </span>
            </span>
          </h1>

          {/* Editorial Paragraph Description */}
          <p
            data-hero-copy
            className="max-w-md text-xs sm:text-sm md:text-base text-zinc-300 font-light leading-relaxed"
          >
            {activeSlide.description}
          </p>

          {/* Action CTAs (Pauses timeline on hover so user can easily click) */}
          <div
            onMouseEnter={handleCtaMouseEnter}
            onMouseLeave={handleCtaMouseLeave}
            className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2"
          >
            <Link
              to={activeSlide.ctaLink}
              className="btn-luxury inline-flex items-center space-x-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-7 py-3.5 rounded text-xs font-semibold tracking-[0.2em] transition-all shadow-lg shadow-brand-burgundy/30"
            >
              <span>{activeSlide.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href={activeSlide.secondaryCtaLink}
              className="text-xs font-semibold tracking-[0.2em] border-b border-zinc-700 hover:border-brand-gold pb-1 transition-colors text-zinc-400 hover:text-white"
            >
              {activeSlide.secondaryCtaText}
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. LAYER 4: FOOTER PROGRESS BAR & CONTROLS                   */}
      {/* ============================================================ */}
      <div
        data-hero-footer
        className="relative z-20 max-w-7xl mx-auto w-full pt-4 flex flex-col sm:flex-row items-center justify-between text-zinc-500 text-[8px] md:text-[9px] tracking-[0.3em] uppercase gap-4"
      >
        {/* Left Indicator & Season Quote */}
        <div className="flex items-center space-x-3">
          <div className="w-6 h-[1px] bg-zinc-700" />
          <span className="text-zinc-400 font-mono">
            {activeSlide.seasonBadge}
          </span>
          <span className="hidden md:inline text-zinc-600">&bull;</span>
          <span className="hidden md:inline italic font-serif text-zinc-400 tracking-normal normal-case">
            "{activeSlide.quote}"
          </span>
        </div>

        {/* Center: Interactive Slide Dots */}
        <div className="flex items-center space-x-2">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === slideIndex;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Jump to ${slide.line1}`}
                className={`transition-all duration-300 rounded-full ${
                  isActive
                    ? "w-8 h-1.5 bg-brand-gold"
                    : "w-2 h-1.5 bg-zinc-800 hover:bg-zinc-600"
                }`}
              />
            );
          })}
        </div>

        {/* Right Navigation: Chevrons + Progress Bar + Counter */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <button
              type="button"
              onClick={() => goToSlide(slideIndex - 1)}
              aria-label="Previous Look"
              className="w-7 h-7 rounded-full border border-zinc-800 bg-brand-black/70 hover:border-brand-gold hover:text-brand-gold transition-colors flex items-center justify-center text-zinc-400"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => goToSlide(slideIndex + 1)}
              aria-label="Next Look"
              className="w-7 h-7 rounded-full border border-zinc-800 bg-brand-black/70 hover:border-brand-gold hover:text-brand-gold transition-colors flex items-center justify-center text-zinc-400"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="w-20 sm:w-28 h-[2px] bg-zinc-800 rounded-full overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full bg-brand-gold"
              style={{ width: "0%" }}
            />
          </div>

          <span className="font-mono text-zinc-400">
            {activeSlide.number} / {String(HERO_SLIDES.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
