import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { brands } from "../../data/data";
import { gsap, useGSAP, motionTokens } from "../../animations";

const itemCounts: Record<string, string> = {
  "nike": "320+ ITEMS",
  "zara": "850+ ITEMS",
  "gucci": "210+ ITEMS",
  "levis": "410+ ITEMS",
  "calvin-klein": "300+ ITEMS",
  "tommy-hilfiger": "290+ ITEMS"
};

const FeaturedBrands: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches) {
        return;
      }

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
        "[data-reveal-brand-intro] > *",
        { opacity: 0, y: motionTokens.distance.subtle },
        {
          opacity: 1,
          y: 0,
          duration: motionTokens.duration.standard,
          stagger: motionTokens.stagger.subtle,
        }
      ).fromTo(
        "[data-reveal-brand-card]",
        { opacity: 0, y: motionTokens.distance.reveal },
        {
          opacity: 1,
          y: 0,
          duration: motionTokens.duration.reveal,
          stagger: motionTokens.stagger.subtle,
          clearProps: "opacity,transform",
        },
        "-=0.3"
      );
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="relative w-full py-24 md:py-32 bg-[#070708] border-t border-zinc-900/60 overflow-hidden">
      {/* Subtle red ambient glow on the right */}
      <div className="absolute right-[-10%] top-[20%] w-[45vw] h-[45vw] rounded-full bg-brand-burgundy/10 blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Title and Brand Description */}
          <div data-reveal-brand-intro className="lg:col-span-3 space-y-6 lg:pr-4">
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.35em] text-brand-burgundy font-bold uppercase block">
                FEATURED BRANDS
              </span>
              <h2 className="font-serif text-3xl md:text-4xl text-white font-medium tracking-wide leading-tight">
                Discover Iconic <br className="hidden lg:block" />
                Fashion Brands
              </h2>
            </div>
            <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm tracking-wide">
              Explore a curated selection of the world's most iconic fashion brands. Premium quality, timeless style, all in one place.
            </p>
            <div className="pt-2">
              <Link
                to="/shop"
                className="group flex items-center space-x-2 text-xs font-semibold tracking-[0.2em] text-zinc-300 hover:text-white transition-colors duration-200"
              >
                <span>EXPLORE ALL BRANDS</span>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-brand-gold group-hover:translate-x-1 transition-all duration-300" />
              </Link>
            </div>
          </div>

          {/* Right Column: Grid of Brand Cards */}
          <div className="lg:col-span-9 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 w-full">
              {brands.map((brand) => (
                <Link
                  to={`/shop?brand=${brand.id}`}
                  key={brand.id}
                  data-reveal-brand-card
                  className="group flex flex-col items-center text-center space-y-3 w-full"
                >
                  {/* The Visual Card */}
                  <div className="relative w-full aspect-[2/3] rounded-sm overflow-hidden border border-zinc-900 bg-brand-dark/40 shadow-lg group-hover:border-zinc-700/50 shadow-xl group-hover:shadow-2xl transition-all duration-500">
                    <img
                      src={brand.campaignImage}
                      alt={`${brand.name} Campaign`}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-1000 ease-out"
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-brand-black/40 group-hover:bg-brand-black/35 transition-colors pointer-events-none" />

                    {/* Centered White Logo inside card */}
                    <div className="absolute inset-0 flex items-center justify-center p-3 select-none pointer-events-none">
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="max-h-8 max-w-[85%] object-contain filter brightness-0 invert opacity-95 group-hover:opacity-100 transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Brand Info Below Card */}
                  <div className="space-y-1">
                    <span className="block text-[11px] font-semibold tracking-[0.2em] text-white uppercase group-hover:text-brand-gold transition-colors duration-300">
                      {brand.name}
                    </span>
                    <span className="block text-[9px] tracking-[0.15em] text-zinc-500 font-medium group-hover:text-zinc-400 transition-colors duration-300">
                      {itemCounts[brand.id] || "250+ ITEMS"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBrands;

