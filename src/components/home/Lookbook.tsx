import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { lookbook } from "../../data/data";
import { gsap, useGSAP, motionTokens } from "../../animations";

const Lookbook: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches) {
        return;
      }

      // Story & collage reveal
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
        defaults: {
          ease: motionTokens.ease.editorial,
        },
      });

      tl.fromTo(
        "[data-lookbook-story] > *",
        { opacity: 0, y: motionTokens.distance.reveal },
        {
          opacity: 1,
          y: 0,
          duration: motionTokens.duration.reveal,
          stagger: motionTokens.stagger.subtle,
          clearProps: "opacity,transform",
        }
      )
        .fromTo(
          "[data-lookbook-main]",
          { opacity: 0, scale: 0.96 },
          {
            opacity: 1,
            scale: 1,
            duration: motionTokens.duration.editorial,
            clearProps: "opacity,transform",
          },
          "-=0.5"
        )
        .fromTo(
          "[data-lookbook-sub]",
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: motionTokens.duration.reveal,
            stagger: motionTokens.stagger.subtle,
            clearProps: "opacity,transform",
          },
          "-=0.4"
        );

      // Quote reveal
      gsap.fromTo(
        "[data-lookbook-quote]",
        { opacity: 0, y: motionTokens.distance.editorial },
        {
          opacity: 1,
          y: 0,
          duration: motionTokens.duration.editorial,
          ease: motionTokens.ease.editorial,
          clearProps: "opacity,transform",
          scrollTrigger: {
            trigger: "[data-lookbook-quote]",
            start: "top 88%",
            once: true,
          },
        }
      );
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="lookbook"
      className="w-full py-20 md:py-28 border-t border-zinc-900 overflow-hidden relative"
    >
      <img
        className="w-full h-full absolute bg-gradient-to-r from-brand-black via-brand-black to-transparent top-0 right-0 -z-10 opacity-60 object-cover"
        src="/images/backgrounds/background_2.jpeg"
        alt="Lookbook Texture"
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-20">
        {/* Split Layout Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Left Column: Story Description */}
          <div data-lookbook-story className="lg:col-span-5 space-y-6 md:space-y-8">
            <div className="space-y-3">
              <span className="text-[10px] md:text-xs tracking-[0.3em] text-brand-burgundy font-semibold uppercase">
                {lookbook.title}
              </span>
              <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white tracking-wide leading-tight">
                {lookbook.subtitle}
              </h2>
            </div>

            <p className="text-sm text-zinc-400 font-light leading-relaxed max-w-md">
              {lookbook.description}
            </p>

            <div>
              <Link
                to="/shop"
                className="group inline-flex items-center space-x-3 border border-zinc-800 hover:border-brand-gold px-8 py-3.5 bg-transparent hover:bg-brand-gold/5 transition-all duration-300 rounded"
              >
                <span className="text-xs font-semibold tracking-[0.2em]">EXPLORE THE STORY</span>
                <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-brand-gold transition-colors" />
              </Link>
            </div>
          </div>

          {/* Right Column: Editorial Grid collage */}
          <div className="lg:col-span-7 space-y-6">
            {/* Top Main Image */}
            <div
              data-lookbook-main
              className="relative aspect-[16/12] w-full overflow-hidden rounded bg-brand-dark border border-zinc-900"
            >
              <img
                src={lookbook.images.main}
                alt="Campaign Landscape"
                className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
              />
            </div>

            {/* Bottom Two Images Side-by-Side */}
            <div className="grid grid-cols-2 gap-6">
              <div
                data-lookbook-sub
                className="relative aspect-[16/12] overflow-hidden rounded bg-brand-dark border border-zinc-900"
              >
                <img
                  src={lookbook.images.left}
                  alt="Campaign Portrait 1"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div
                data-lookbook-sub
                className="relative aspect-[16/12] overflow-hidden rounded bg-brand-dark border border-zinc-900"
              >
                <img
                  src={lookbook.images.right}
                  alt="Campaign Portrait 2"
                  className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Large Quote Block */}
        <div
          data-lookbook-quote
          className="pt-16 border-t border-zinc-900 text-center space-y-4 max-w-4xl mx-auto"
        >
          <blockquote className="font-serif text-3xl md:text-5xl lg:text-6xl text-white tracking-wide leading-snug italic font-light">
            {lookbook.quote}
          </blockquote>
          <cite className="block text-[10px] md:text-xs tracking-[0.3em] text-brand-gold font-bold not-italic pt-2">
            {lookbook.quoteCaption}
          </cite>
        </div>
      </div>
    </section>
  );
};

export default Lookbook;

