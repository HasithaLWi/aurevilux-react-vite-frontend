import React, { useState, useRef, useEffect } from "react";
import { Star, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { testimonials as defaultTestimonials } from "../../data/data";
import { gsap, useGSAP, motionTokens } from "../../animations";
import { api } from "../../services/api";

const customQuotes: Record<string, string> = {
  "olivia": "Loved the exceptional craftsmanship, and extremely lightweight design. The luxurious fabrics, perfect fit, and timeless elegance exceeded all expectations.",
  "ethan": "Loved the exceptional craftsmanship, and extremely lightweight design. The luxurious fabrics, perfect fit, and timeless elegance make it an absolute favorite.",
  "sophia": "Loved the exceptional craftsmanship, and extremely lightweight design. The luxurious fabrics, perfect fit, and timeless elegance are unmatched."
};

const Testimonials: React.FC = () => {
  const [items, setItems] = useState<any[]>(defaultTestimonials);
  const [activeIndex, setActiveIndex] = useState(1);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const { data } = await api.get<{ message: string; data: any[] }>("/feedback/testimonials");
        if (data.data && data.data.length > 0) {
          const mapped = data.data.map((item, idx) => ({
            id: item._id || `fb-${idx}`,
            name: item.name,
            role: item.role || "Haute Patron",
            image: `/images/customers/${idx % 2 === 0 ? "sophia_elvah.jpg" : "ethan_wright.jpeg"}`,
            quote: item.comment,
            rating: item.rating,
          }));
          setItems([...mapped, ...defaultTestimonials].slice(0, 5));
        }
      } catch (e) {
        // Fallback to default static testimonials
      }
    }
    fetchFeatured();
  }, []);

  useGSAP(
    () => {
      if (window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches) {
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 88%",
          once: true,
        },
        defaults: {
          ease: motionTokens.ease.editorial,
        },
      });

      tl.fromTo(
        "[data-reveal-testimonials-header]",
        { opacity: 0, y: motionTokens.distance.subtle },
        { opacity: 1, y: 0, duration: motionTokens.duration.standard }
      ).fromTo(
        "[data-reveal-testimonial-card]",
        { opacity: 0, y: motionTokens.distance.reveal },
        {
          opacity: 1,
          y: 0,
          duration: motionTokens.duration.reveal,
          stagger: motionTokens.stagger.standard,
          clearProps: "opacity,transform",
        },
        "-=0.2"
      );
    },
    { scope: sectionRef }
  );

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % items.length);
  };

  const handlePrev = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + items.length) % items.length);
  };

  return (
    <section ref={sectionRef} className="relative w-full py-24 md:py-32 bg-[#070708] border-t border-zinc-900/60 overflow-hidden">
      {/* Background glow points */}
      <div className="absolute right-[5%] bottom-[5%] w-[350px] h-[350px] bg-brand-burgundy/10 blur-[90px] pointer-events-none rounded-full" />
      <div className="absolute left-[5%] top-[5%] w-[300px] h-[300px] bg-purple-950/10 blur-[95px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 space-y-16">
        {/* Title */}
        <div data-reveal-testimonials-header className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-[10px] tracking-[0.35em] text-zinc-500 font-bold uppercase">
            WHAT OUR CUSTOMERS SAY
          </span>
          <h2 className="font-serif text-3xl md:text-5xl text-white font-medium tracking-wide">
            Loved by Fashion Enthusiasts
          </h2>
          <p className="text-xs text-zinc-400 font-light leading-relaxed tracking-wide">
            Discover the genuine experiences of style-makers who cherish exceptional quality, craftsmanship, and timeless design.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="w-full">
          {/* Desktop Layout */}
          <div className="hidden md:grid grid-cols-3 gap-6 lg:gap-8 items-stretch pt-6">
            {items.slice(0, 3).map((t, idx) => {
              const isActive = idx === activeIndex;
              const quoteText = customQuotes[t.id] || t.quote;

              return (
                <div
                  key={t.id}
                  data-reveal-testimonial-card
                  onClick={() => setActiveIndex(idx)}
                  className={`group relative flex flex-col justify-between p-8 lg:p-10 rounded-sm bg-brand-dark/40 backdrop-blur-md border transition-[border-color,background-color,box-shadow,transform] duration-500 cursor-pointer ${isActive
                    ? "border-brand-burgundy/60 shadow-[0_0_50px_-5px_rgba(109,26,42,0.4)] scale-102 bg-brand-dark/60 z-20"
                    : "border-zinc-900/80 hover:border-zinc-800/80 hover:bg-brand-dark/50 z-10"
                    }`}
                >

                  <div className="space-y-6">
                    {/* Stars */}
                    <div className="flex items-center space-x-1">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      ))}
                    </div>

                    {/* Customer Review Quote */}
                    <p className="text-xs lg:text-sm text-zinc-300 font-light leading-relaxed tracking-wide italic">
                      "{quoteText}"
                    </p>
                  </div>

                  {/* Customer Information Footer */}
                  <div className="flex items-center space-x-4 pt-8 border-t border-zinc-900/80 mt-6">
                    {/* <div className="relative w-12 h-12 rounded-full overflow-hidden border border-zinc-700/60 bg-zinc-900 flex-shrink-0">
                      <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                    </div> */}
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-semibold tracking-wider text-white uppercase">
                          {t.name}
                        </span>
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-950/80 border border-emerald-600/50 flex items-center justify-center">
                          <Check className="w-2 h-2 text-emerald-400 stroke-[3]" />
                        </div>
                      </div>
                      <span className="block text-[10px] tracking-widest text-zinc-500 uppercase font-medium">
                        {t.role}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden flex flex-col space-y-6">
            {items[activeIndex % items.length] && (
              <div className="p-6 rounded-sm bg-brand-dark/50 border border-brand-burgundy/60 space-y-6">
                <div className="flex items-center space-x-1">
                  {[...Array(items[activeIndex % items.length].rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="text-xs text-zinc-300 font-light leading-relaxed italic">
                  "{customQuotes[items[activeIndex % items.length].id] || items[activeIndex % items.length].quote}"
                </p>
                <div className="flex items-center space-x-4 pt-6 border-t border-zinc-900/80">
                  <img
                    src={items[activeIndex % items.length].avatar || items[activeIndex % items.length].image || "/images/customers/sophia_elvah.jpg"}
                    alt={items[activeIndex % items.length].name}
                    className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                  />
                  <div>
                    <span className="text-xs font-semibold text-white uppercase block">
                      {items[activeIndex % items.length].name}
                    </span>
                    <span className="text-[10px] text-zinc-500 uppercase">
                      {items[activeIndex % items.length].role}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Slider Controls */}
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={handlePrev}
                className="p-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs text-zinc-500 font-mono tracking-widest">
                {(activeIndex % items.length) + 1} / {items.length}
              </span>
              <button
                onClick={handleNext}
                className="p-2 rounded-full border border-zinc-800 text-zinc-400 hover:text-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
