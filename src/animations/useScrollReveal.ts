import { type RefObject } from "react";
import { gsap, useGSAP } from "./gsap";
import { motionTokens } from "./motion-tokens";

export interface ScrollRevealOptions {
  selector?: string;
  y?: number;
  x?: number;
  scale?: number;
  duration?: number;
  stagger?: number;
  ease?: string;
  start?: string;
  once?: boolean;
}

/**
 * Custom hook to safely apply GSAP ScrollTrigger reveals with component scoping and reduced motion support.
 */
export function useScrollReveal(
  scopeRef: RefObject<HTMLElement | null>,
  options: ScrollRevealOptions = {}
) {
  const {
    selector = "[data-reveal]",
    y = motionTokens.distance.reveal,
    x = 0,
    scale = 1,
    duration = motionTokens.duration.reveal,
    stagger = motionTokens.stagger.standard,
    ease = motionTokens.ease.editorial,
    start = "top 85%",
    once = true,
  } = options;

  useGSAP(
    () => {
      // Check prefers-reduced-motion
      if (window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches) {
        return;
      }

      if (!scopeRef.current) return;

      const elements = scopeRef.current.querySelectorAll(selector);
      if (!elements || elements.length === 0) return;

      gsap.from(elements, {
        opacity: 0,
        y,
        x,
        scale: scale !== 1 ? scale : undefined,
        duration,
        stagger,
        ease,
        scrollTrigger: {
          trigger: scopeRef.current,
          start,
          once,
        },
      });
    },
    { scope: scopeRef, dependencies: [selector, y, x, scale, duration, stagger, ease, start, once] }
  );
}
