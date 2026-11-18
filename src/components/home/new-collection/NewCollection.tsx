import React, { useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import {
  gsap,
  ScrollTrigger,
  useGSAP,
  motionTokens,
} from "../../../animations";
import { COLLECTION_SCENES, type CollectionSceneData } from "./collectionData";

const NewCollection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<HTMLImageElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const rightContentRef = useRef<HTMLDivElement>(null);
  const scrollTriggerInstanceRef = useRef<ScrollTrigger | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  activeIndexRef.current = activeIndex;

  const activeScene: CollectionSceneData = COLLECTION_SCENES[activeIndex];

  // Helper to transition active scene with GSAP motion
  const animateSceneTransition = useCallback((nextIndex: number) => {
    setActiveIndex(nextIndex);
    activeIndexRef.current = nextIndex;

    if (window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches) {
      return;
    }

    // 1. Model signature rise from thumbnail illusion
    if (modelRef.current) {
      gsap.fromTo(
        modelRef.current,
        {
          opacity: 0.2,
          y: 35,
          scale: 0.97,
          filter: "blur(4px)",
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.75,
          ease: "power3.out",
          clearProps: "filter",
        },
      );
    }

    // 2. Left editorial copy glide
    if (leftContentRef.current) {
      gsap.fromTo(
        leftContentRef.current.children,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "opacity,transform",
        },
      );
    }

    // 3. Right subtitle crossfade
    if (rightContentRef.current) {
      gsap.fromTo(
        rightContentRef.current,
        { opacity: 0, x: 15 },
        { opacity: 1, x: 0, duration: 0.45, ease: "power2.out" },
      );
    }
  }, []);

  const isNavigatingRef = useRef(false);

  // Direct selection of a collection scene
  const goToScene = useCallback(
    (index: number) => {
      const clampedIndex = Math.max(
        0,
        Math.min(index, COLLECTION_SCENES.length - 1),
      );
      if (clampedIndex === activeIndexRef.current) return;

      // Suppress intermediate scrub events so the target scene loads directly
      isNavigatingRef.current = true;
      animateSceneTransition(clampedIndex);

      const st = scrollTriggerInstanceRef.current;
      if (st) {
        const scrollDistance = st.end - st.start;
        const targetScroll =
          st.start +
          (clampedIndex / (COLLECTION_SCENES.length - 1)) * scrollDistance;

        // Set window scroll position directly to the target scene
        window.scrollTo({ top: targetScroll, behavior: "instant" });

        // Release suppression after the browser finishes updating scroll
        setTimeout(() => {
          isNavigatingRef.current = false;
        }, 120);
      } else {
        isNavigatingRef.current = false;
      }
    },
    [animateSceneTransition],
  );

  // Master GSAP ScrollTrigger Pinned Scene Sequence + Entrance Reveal
  useGSAP(
    () => {
      if (window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches) {
        return;
      }

      // 1. Initial Entrance ScrollTrigger (reveals Scene 1 as you scroll down from Hero)
      const entranceTl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: "top 75%",
          once: true,
        },
        defaults: {
          ease: motionTokens.ease.editorial,
        },
      });

      entranceTl
        // Atmospheric Background Glow / Zoom
        .fromTo(
          "[data-collection-bg]",
          { opacity: 0, scale: 1.08 },
          {
            opacity: 1,
            scale: 1,
            duration: 1.1,
            ease: "power2.out",
            clearProps: "opacity,transform",
          },
        )
        // Centerpiece Model Signature Rise from Below
        .fromTo(
          modelRef.current,
          {
            opacity: 0,
            y: 50,
            scale: 0.95,
            filter: "blur(6px)",
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            duration: 0.9,
            ease: "power3.out",
            clearProps: "filter",
          },
          "-=0.9",
        )
        // Left Editorial Info (eyebrow, title, copy, button)
        .fromTo(
          leftContentRef.current ? leftContentRef.current.children : [],
          {
            opacity: 0,
            y: 35,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.08,
            ease: "power2.out",
            clearProps: "opacity,transform",
          },
          "-=0.7",
        )
        // Right Narrative (season badge, quote, counter, chevrons)
        .fromTo(
          rightContentRef.current,
          {
            opacity: 0,
            x: 25,
          },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            ease: "power2.out",
            clearProps: "opacity,transform",
          },
          "-=0.5",
        )
        // Bottom 5 Thumbnails Staggered Lift
        .fromTo(
          "[data-thumbnail-card]",
          {
            opacity: 0,
            y: 35,
          },
          {
            opacity: (i) => (i === 0 ? 1 : 0.6),
            y: 0,
            duration: 0.55,
            stagger: 0.06,
            ease: "power2.out",
            clearProps: "transform",
          },
          "-=0.4",
        )
        // Bottom Indicators (Scroll to explore + progress)
        .fromTo(
          "[data-collection-footer]",
          {
            opacity: 0,
            y: 15,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            clearProps: "opacity,transform",
          },
          "-=0.3",
        );

      // 2. Master Pinned Sequence for 5 scenes
      const st = ScrollTrigger.create({
        trigger: triggerRef.current,
        start: "top top",
        end: "+=3200",
        pin: sectionRef.current,
        pinSpacing: true,
        scrub: 0.7,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          // Ignore intermediate scrub events during direct thumbnail/arrow jump
          if (isNavigatingRef.current) {
            return;
          }

          const progress = self.progress;
          const totalScenes = COLLECTION_SCENES.length;
          // Segment progress evenly across 5 scenes: [0..0.2), [0.2..0.4), etc.
          const rawIndex = Math.min(
            totalScenes - 1,
            Math.floor(progress * totalScenes),
          );

          if (rawIndex !== activeIndexRef.current) {
            animateSceneTransition(rawIndex);
          }
        },
      });

      scrollTriggerInstanceRef.current = st;

      return () => {
        entranceTl.kill();
        st.kill();
      };
    },
    { scope: triggerRef, dependencies: [animateSceneTransition] },
  );

  return (
    <div ref={triggerRef} className="relative w-full">
      <section
        ref={sectionRef}
        className="relative w-full h-screen bg-brand-black overflow-hidden flex flex-col justify-between pt-20 sm:pt-24 pb-3 sm:pb-6 px-4 sm:px-6 md:px-12 select-none"
      >
        {/* Atmospheric Background Media with Crimson Ambient Glow */}
        <div
          data-collection-bg
          className="absolute inset-0 z-0 overflow-hidden pointer-events-none"
        >
          <img
            src={activeScene.backgroundImage}
            alt={activeScene.name}
            className="w-full h-full object-cover object-center opacity-45 scale-105 transition-transform duration-1000 ease-out"
          />

          {/* Luxury Gradient Masks */}
          <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/75 to-transparent md:w-[65%]" />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-brand-black/40" />
          {/* Soft Mobile Scrim Vignette: preserves editorial text legibility over couture garments */}
          <div className="absolute inset-0 bg-gradient-to-b from-brand-black/75 via-transparent to-brand-black/85 lg:hidden z-10 pointer-events-none" />

          {/* Soft Glowing Ambient Lights */}
          <div className="absolute left-[15%] top-[25%] w-[450px] h-[450px] bg-brand-burgundy/30 blur-[130px] rounded-full" />
          <div className="absolute right-[20%] top-[35%] w-[350px] h-[350px] bg-purple-950/20 blur-[120px] rounded-full" />
        </div>

        {/* Far-Left Vertical Rotated Tag */}
        <div className="hidden lg:flex absolute left-6 top-1/2 -translate-y-1/2 rotate-180 [writing-mode:vertical-rl] z-10 items-center space-y-3 pointer-events-none">
          <span className="text-[9px] tracking-[0.35em] text-zinc-500 uppercase font-medium">
            NEW COLLECTION
          </span>
          <div className="w-[1px] h-10 bg-zinc-800" />
        </div>

        {/* Centerpiece Hero Model Cutout (Signature Model Rise Illusion) */}
        <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex items-end justify-center pointer-events-none">
            <img
              ref={modelRef}
              src={activeScene.modelImage}
              alt={`${activeScene.name} Model`}
              className="h-[72vh] sm:h-[78vh] md:h-[80vh] max-h-[820px] w-auto max-w-none object-contain object-bottom drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] gpu-accelerated"
            />
          </div>
        </div>

        {/* Main Stage Grid (Left Editorial + Right Narrative) */}
        <div className="relative z-20 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Left Column: Collection Information */}
          <div
            ref={leftContentRef}
            className="lg:col-span-7 space-y-2.5 sm:space-y-3 md:space-y-4"
          >
            <div className="flex items-center space-x-2">
              <div className="w-6 h-[1px] bg-brand-burgundy" />
              <span className="text-[10px] md:text-xs tracking-[0.3em] text-brand-gold font-semibold uppercase">
                NEW COLLECTION
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-wide leading-[1.0] sm:leading-[0.95] text-luxury-shadow">
              {activeScene.line1} <br />
              <span className="text-zinc-100">{activeScene.line2}</span>
            </h2>

            <p className="max-w-xs sm:max-w-md text-xs md:text-sm text-zinc-300 font-light leading-relaxed">
              {activeScene.description}
            </p>

            <div className="pt-1 sm:pt-2">
              <Link
                to={activeScene.ctaLink}
                className="btn-luxury inline-flex items-center space-x-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-5 sm:px-7 py-2.5 sm:py-3 rounded text-[11px] sm:text-xs font-semibold tracking-[0.2em] transition-all shadow-lg shadow-brand-burgundy/30"
              >
                <span>{activeScene.ctaText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Right Column: Subtitle, Counter & Chevron Controls */}
          <div
            ref={rightContentRef}
            className="lg:col-span-5 lg:justify-self-end flex flex-row lg:flex-col items-center lg:items-end justify-between sm:justify-start w-full sm:w-auto space-y-0 lg:space-y-4 text-left lg:text-right pt-0 sm:pt-1 lg:pt-0"
          >
            <div className="hidden sm:block border-l-2 lg:border-l-0 lg:border-r-2 border-brand-burgundy/60 pl-3 lg:pl-0 lg:pr-3 space-y-1">
              <span className="block text-[9px] md:text-[10px] tracking-[0.3em] text-zinc-400 uppercase font-semibold">
                {activeScene.seasonBadge}
              </span>
              <p className="font-serif text-sm md:text-base text-zinc-200 italic">
                {activeScene.quote}
              </p>
            </div>

            {/* Direct Navigation Chevrons + Number */}
            <div className="flex items-center space-x-3 pt-0 sm:pt-1">
              <span className="text-xs tracking-[0.25em] text-zinc-400 font-mono">
                <span className="text-brand-gold font-bold">
                  {activeScene.number}
                </span>{" "}
                / 05
              </span>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => goToScene(activeIndex - 1)}
                  disabled={activeIndex === 0}
                  aria-label="Previous Collection"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-zinc-800 bg-brand-black/60 hover:border-brand-gold hover:text-brand-gold disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center text-zinc-300"
                >
                  <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
                <button
                  onClick={() => goToScene(activeIndex + 1)}
                  disabled={activeIndex === COLLECTION_SCENES.length - 1}
                  aria-label="Next Collection"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-zinc-800 bg-brand-black/60 hover:border-brand-gold hover:text-brand-gold disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center justify-center text-zinc-300"
                >
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: 5 Collection Thumbnails */}

        {/* Footer Indicators */}
        <div
          data-collection-footer
          className="relative z-20 max-w-7xl mx-auto w-full flex flex-col gap-1 items-center justify-between text-zinc-500 text-[8px] md:text-[9px] tracking-[0.3em] uppercase pt-1 sm:pt-2"
        >
          <div className="relative z-20 max-w-7xl w-full sm:w-3/4 mx-auto pt-1 sm:pt-4 opacity-75 sm:opacity-50 hover:opacity-90 transition-opacity duration-200">
            <div className="grid grid-cols-5 gap-1.5 sm:gap-3 md:gap-4 items-end">
              {COLLECTION_SCENES.map((scene, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <button
                    key={scene.id}
                    data-thumbnail-card
                    onClick={() => goToScene(idx)}
                    className={`group relative text-left rounded overflow-hidden transition-all duration-500 focus:outline-none ${
                      isActive
                        ? "ring-1 sm:ring-2 ring-brand-gold shadow-[0_0_25px_rgba(212,175,55,0.3)] scale-[1.03] md:scale-105 z-10"
                        : "opacity-60 hover:opacity-100 border border-zinc-800/80 hover:border-zinc-700"
                    }`}
                  >
                    {/* Thumbnail Image Container */}
                    <div className="aspect-6/7 sm:aspect-[4/5] w-full overflow-hidden bg-zinc-950 relative">
                      <img
                        src={scene.thumbnail}
                        alt={scene.name}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/40 to-transparent" />

                      {/* Active Golden Highlight Bar */}
                      {isActive && (
                        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-gold to-transparent" />
                      )}
                    </div>

                    {/* Thumbnail Label Details */}
                    <div className="p-1 sm:p-2 bg-zinc-950/90 backdrop-blur-sm space-y-0.5">
                      <span
                        className={`block text-[7px] sm:text-[9px] tracking-[0.2em] font-mono ${
                          isActive
                            ? "text-brand-gold font-bold"
                            : "text-zinc-500"
                        }`}
                      >
                        {scene.number}
                      </span>
                      <h4
                        className={`text-[7px] sm:text-[9px] md:text-[10px] tracking-wider uppercase truncate font-medium ${
                          isActive
                            ? "text-white"
                            : "text-zinc-400 group-hover:text-zinc-200"
                        }`}
                      >
                        {scene.name}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            data-collection-footer
            className="relative z-20 max-w-7xl mx-auto w-full flex items-center justify-between text-zinc-500 text-[8px] md:text-[9px] tracking-[0.3em] uppercase pt-2"
          >
            {/* Left Indicator */}
            <div className="flex items-center space-x-2">
              <div className="w-6 h-[1px] bg-zinc-700" />
              <span>SCROLL TO EXPLORE</span>
            </div>

            {/* Right Progress Bar */}
            <div className="flex items-center space-x-3">
              <div className="w-24 sm:w-32 h-[2px] bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gold transition-all duration-500 ease-out"
                  style={{
                    width: `${((activeIndex + 1) / COLLECTION_SCENES.length) * 100}%`,
                  }}
                />
              </div>
              <span className="font-mono text-zinc-400">
                {activeScene.number} / 05
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NewCollection;
