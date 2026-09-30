import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative w-full h-[calc(100vh)] overflow-hidden bg-brand-black flex items-center pt-20 ">
      {/* Background Campaign Image with Crimson Glow Mask */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/home/hero/hero_section_image.webp"
          alt="Aurevilux Campaign"
          className="w-full h-full object-cover object-center  opacity-100 mt-[80px]"
        />
        {/* Shadow overlays and glowing radial gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-brand-black via-brand-black/75 to-transparent md:w-[65%]" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-transparent to-brand-black/30" />

        {/* Soft glowing ambient light points */}
        <div className="absolute left-[10%] top-[30%] w-[350px] h-[350px] bg-brand-burgundy/30 blur-[100px] pointer-events-none rounded-full" />
        <div className="absolute right-[15%] top-[20%] w-[400px] h-[400px] bg-purple-950/20 blur-[120px] pointer-events-none rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-6 md:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side Content */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8 animate-fade-in">
          <div className="space-y-3">
            <span className="text-[10px] md:text-xs tracking-[0.3em] text-brand-gold font-semibold uppercase">
              NEW AUTUMN / WINTER COLLECTION
            </span>
            <h1 className="font-serif text-6xl md:text-7xl lg:text-8xl text-white tracking-wide leading-tight text-luxury-shadow">
              Timeless <br />
              Allure<span className="text-brand-gold">.</span>
            </h1>
          </div>

          <p className="max-w-md text-sm md:text-base text-zinc-300 font-light leading-relaxed">
            Discover contemporary silhouettes crafted for confidence, elegance, and effortless sophistication.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2">
            <a
              href="#collections"
              className="btn-luxury inline-flex items-center space-x-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-7 py-3.5 rounded text-xs font-semibold tracking-[0.2em] transition-all shadow-lg shadow-brand-burgundy/30"
            >
              <span>EXPLORE COLLECTION</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            <a
              href="#lookbook"
              className="text-xs font-semibold tracking-[0.2em] border-b border-zinc-700 hover:border-brand-gold pb-1 transition-colors text-zinc-400 hover:text-white"
            >
              VIEW LOOKBOOK
            </a>
          </div>
        </div>

        {/* Right Side Evening Edit Float Card */}
        <div className="lg:col-span-4 lg:justify-self-end w-full max-w-[280px] hidden md:block animate-slide-up self-end mt-12 lg:mt-0">
          <div className="group cursor-pointer">
            <div className="glass-card p-3 rounded flex items-center space-x-4 transition-all duration-300 hover:translate-y-[-2px]">
              <div className="w-16 h-20 overflow-hidden rounded bg-zinc-950 flex-shrink-0">
                <img
                  src="/images/products/VELVET LUNA DRESS.jpeg"
                  alt="Evening Edit - Velvet Luna Dress"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex-grow flex flex-col justify-center space-y-1">
                <span className="text-[9px] tracking-[0.25em] text-brand-gold font-bold">FEATURED</span>
                <h4 className="font-serif text-xs text-white uppercase tracking-wider group-hover:text-brand-gold transition-colors">
                  EVENING EDIT
                </h4>
                <div className="flex items-center space-x-1 text-[9px] tracking-wider text-zinc-400 group-hover:text-brand-goldLight transition-colors pt-1">
                  <span>DISCOVER NOW</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator bottom left */}
      <div className="absolute bottom-10 left-6 md:left-12 flex flex-col items-center space-y-3 z-10 hidden sm:flex">
        <div className="h-10 w-[1px] bg-gradient-to-b from-brand-burgundy to-zinc-800 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1/2 bg-brand-gold animate-bounce" />
        </div>
        <span className="text-[8px] tracking-[0.3em] text-zinc-500 uppercase vertical-text">
          SCROLL
        </span>
      </div>
    </section>
  );
};

export default Hero;