export const motionTokens = {
  duration: {
    micro: 0.2,
    fast: 0.3,
    standard: 0.45,
    reveal: 0.7,
    editorial: 1.0,
    cinematic: 1.2,
  },
  ease: {
    smooth: "power2.out",
    editorial: "power3.out",
    cinematic: "power4.out",
    exit: "power2.in",
    expo: "expo.out",
  },
  stagger: {
    tight: 0.06,
    subtle: 0.08,
    standard: 0.12,
    spread: 0.18,
  },
  distance: {
    subtle: 12,
    reveal: 24,
    editorial: 40,
    wide: 60,
  },
  mediaQueries: {
    reducedMotion: "(prefers-reduced-motion: reduce)",
    finePointer: "(hover: hover) and (pointer: fine)",
  },
} as const;

export type MotionTokens = typeof motionTokens;
