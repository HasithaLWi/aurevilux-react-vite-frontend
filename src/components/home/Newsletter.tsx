import React, { useState, useRef } from "react";
import { gsap, useGSAP, motionTokens } from "../../animations";

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
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
        "[data-newsletter-bg]",
        { scale: 1.08, opacity: 0.8 },
        {
          scale: 1,
          opacity: 1,
          duration: motionTokens.duration.cinematic,
          ease: motionTokens.ease.smooth,
          clearProps: "opacity,transform,scale",
        }
      ).fromTo(
        "[data-newsletter-card]",
        { opacity: 0, y: motionTokens.distance.editorial, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: motionTokens.duration.reveal,
          clearProps: "opacity,transform,scale",
        },
        "-=0.7"
      );
    },
    { scope: sectionRef }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim() && agreed) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <section ref={sectionRef} className="relative w-full h-[90vh] py-28 md:py-36 overflow-hidden flex items-center justify-center">
      {/* Background Image of model in red suit */}
      <div className="absolute inset-0 z-0 select-none">
        <img
          data-newsletter-bg
          src="/images/fashion_models/model_red_dress_01.jpeg"
          alt="The Inner Circle Background"
          className="w-full h-full object-cover object-center scale-102"
        />
        <div className="absolute inset-0 bg-brand-dark/40 backdrop-blur-[2px]" />
      </div>

      <div className="w-full max-w-4xl mx-auto px-6 relative z-10">
        <div data-newsletter-card className="w-full bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-2xl p-8 md:p-16 shadow-2xl flex flex-col items-center text-center space-y-8 max-w-3xl mx-auto">

          {/* Header & Title */}
          <div className="space-y-4 max-w-2xl">
            <h2 className="font-serif text-2xl md:text-5xl lg:text-6xl text-white tracking-widest uppercase">
              THE INNER CIRCLE
            </h2>
            <p className="text-xs md:text-sm text-zinc-300 font-light leading-relaxed tracking-wide">
              Unlock exclusive access to our collections, private events, and a curated world of luxury.
            </p>
          </div>

          {/* Form Content */}
          {subscribed ? (
            <div className="w-full max-w-md bg-brand-dark/80 border border-brand-burgundy/40 p-6 rounded-lg space-y-2 animate-fade-in">
              <h4 className="font-serif text-brand-gold text-lg tracking-wider">WELCOME TO THE CIRCLE</h4>
              <p className="text-xs text-zinc-400 font-light">
                Your exclusive invitation code has been dispatched to your inbox.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="w-full max-w-xl mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch gap-4">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow bg-white/[0.04] border border-white/20 focus:border-white/40 px-5 py-3.5 text-xs text-white outline-none rounded-lg tracking-widest font-light placeholder-zinc-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={!agreed}
                  className={`px-8 py-3.5 text-xs font-bold tracking-[0.2em] rounded-lg transition-all duration-500 flex items-center justify-center space-x-1.5 select-none ${
                    agreed
                      ? "bg-gradient-to-r from-brand-burgundy to-[#490c17] text-white hover:from-brand-burgundyHover hover:to-[#380912] shadow-[0_0_20px_rgba(109,26,42,0.5)] cursor-pointer"
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-900"
                  }`}
                >
                  <span>JOIN</span>
                  <span className="text-[10px] pl-1 font-serif">&gt;</span>
                </button>
              </div>

              {/* Checkbox Agreement */}
              <div className="flex items-center space-x-2.5 text-left pl-1 pt-1">
                <label className="relative flex items-center justify-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-4 h-4 border border-white/20 rounded-[3px] bg-transparent peer-checked:bg-brand-burgundy peer-checked:border-brand-burgundy transition-all flex items-center justify-center">
                    {agreed && (
                      <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </label>
                <span className="text-[10px] md:text-xs text-zinc-400 font-light leading-snug tracking-wide select-none">
                  I agree to the Terms & Conditions and Privacy Policy.
                </span>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
