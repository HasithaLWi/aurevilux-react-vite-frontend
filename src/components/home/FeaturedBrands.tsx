import React, { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { brands as fallbackBrands } from "../../data/data";
import { BrandService } from "../../services/brand.service";
import { gsap, useGSAP, motionTokens } from "../../animations";

export const FeaturedBrands: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [brandsList, setBrandsList] = useState<any[]>(fallbackBrands);

  useEffect(() => {
    BrandService.getBrands()
      .then((data) => {
        if (data && data.length > 0) {
          setBrandsList(data);
        }
      })
      .catch((e) => console.warn("Live brands fetch note:", e));
  }, []);

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
    <section ref={sectionRef} className="relative w-full py-24 md:py-32 bg-[#070708] border-t border-zinc-900/60 overflow-hidden text-left">
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
                to="/brands"
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
              {brandsList.slice(0, 6).map((brand) => {
                const brandSlug = brand.slug || brand.id;
                const brandLogo = brand.logo || "";
                const brandName = brand.name || "Maison";

                return (
                  <Link
                    to={`/brands/${brandSlug}`}
                    key={brand._id || brand.id || brandSlug}
                    data-reveal-brand-card
                    className="group relative flex flex-col items-center justify-between p-4 md:p-5 rounded-xl bg-[#0f0f12] border border-zinc-800/80 hover:border-zinc-700 transition-all duration-500 overflow-hidden min-h-[170px]"
                  >
                    {/* Top Right Dot */}
                    <div className="w-full flex justify-end">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-brand-burgundy transition-colors duration-300" />
                    </div>

                    {/* Logo Section */}
                    <div className="flex-1 flex items-center justify-center w-full py-3">
                      {brandLogo ? (
                        <div className="w-20 h-14 flex items-center justify-center p-2 rounded bg-white/[0.04] border border-zinc-800 group-hover:border-zinc-600 transition-colors">
                          <img
                            src={brandLogo}
                            alt={brandName}
                            className="max-h-10 max-w-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                          />
                        </div>
                      ) : (
                        <span className="font-serif text-white text-xs uppercase font-semibold text-center tracking-wider">
                          {brandName}
                        </span>
                      )}
                    </div>

                    {/* Bottom Metadata */}
                    <div className="w-full text-center space-y-1">
                      <h4 className="text-[11px] font-bold text-white tracking-widest uppercase font-serif truncate">
                        {brandName}
                      </h4>
                      <span className="text-[9px] text-zinc-500 tracking-wider font-mono block group-hover:text-brand-gold transition-colors">
                        HAUTE ATELIER
                      </span>
                    </div>

                    {/* Bottom accent line on hover */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-burgundy scale-x-0 group-hover:scale-x-100 transition-transform duration-500" />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedBrands;
