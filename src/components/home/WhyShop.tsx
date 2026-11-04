import React, { useRef } from "react";
import { ShieldCheck, Gem, CreditCard, Truck, RefreshCw } from "lucide-react";
import { benefits } from "../../data/data";
import { gsap, useGSAP, motionTokens } from "../../animations";

const WhyShop: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

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
        "[data-reveal-why-title]",
        { opacity: 0, y: motionTokens.distance.subtle },
        { opacity: 1, y: 0, duration: motionTokens.duration.standard }
      ).fromTo(
        "[data-reveal-why-card]",
        { opacity: 0, y: motionTokens.distance.reveal },
        {
          opacity: 1,
          y: 0,
          duration: motionTokens.duration.reveal,
          stagger: motionTokens.stagger.subtle,
          clearProps: "opacity,transform",
        },
        "-=0.2"
      );
    },
    { scope: sectionRef }
  );

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "ShieldCheck":
        return <ShieldCheck className="w-6 h-6 text-brand-gold stroke-[1.2]" />;
      case "Gem":
        return <Gem className="w-6 h-6 text-brand-gold stroke-[1.2]" />;
      case "CreditCard":
        return <CreditCard className="w-6 h-6 text-brand-gold stroke-[1.2]" />;
      case "Truck":
        return <Truck className="w-6 h-6 text-brand-gold stroke-[1.2]" />;
      case "RefreshCw":
        return <RefreshCw className="w-6 h-6 text-brand-gold stroke-[1.2]" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-brand-gold stroke-[1.2]" />;
    }
  };

  return (
    <section ref={sectionRef} className="bg-brand-black w-full py-16 md:py-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
        {/* Title */}
        <div data-reveal-why-title className="text-center space-y-2">
          <span className="text-[10px] tracking-[0.3em] text-brand-burgundy font-semibold uppercase">
            AUREVILUX PROMISE
          </span>
          <h2 className="font-serif text-2xl md:text-4xl text-white tracking-widest uppercase">
            Why Shop With Us
          </h2>
          <div className="w-12 h-[1px] bg-brand-burgundy mx-auto mt-4" />
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {benefits.map((b) => (
            <div
              key={b.id}
              data-reveal-why-card
              className="group p-6 rounded bg-brand-dark/30 border border-zinc-900 hover:border-zinc-800 hover:bg-brand-dark transition-colors duration-300 flex flex-col justify-between h-full"
            >
              <div className="space-y-4">
                <div className="p-3 bg-brand-black w-fit rounded border border-zinc-800/80 group-hover:border-brand-gold/30 transition-colors">
                  {getIcon(b.icon)}
                </div>
                <h3 className="font-serif text-sm tracking-wider text-white uppercase group-hover:text-brand-gold transition-colors font-medium">
                  {b.title}
                </h3>
                <p className="text-xs leading-relaxed text-zinc-500 font-light group-hover:text-zinc-400 transition-colors">
                  {b.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyShop;

