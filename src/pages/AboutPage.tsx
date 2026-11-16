import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, MapPin, Mail, Phone, Loader2 } from "lucide-react";
import { BusinessService, type BusinessInfo } from "../services/business.service";

export const AboutPage: React.FC = () => {
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    BusinessService.getBusinessInfo()
      .then((data) => setBusiness(data))
      .catch((e) => console.warn("Business info fetch note:", e))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold mb-3" />
        <span className="text-xs uppercase tracking-widest font-mono">
          Loading Maison Provenance...
        </span>
      </div>
    );
  }

  const lookbook = business?.lookbook;

  return (
    <div className="min-h-screen bg-brand-black text-white pt-28 pb-24 text-left">
      {/* 1. Hero Header */}
      <section className="px-6 sm:px-12 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-gold" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold">
            THE MAISON HERITAGE
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl uppercase tracking-wider text-white font-bold leading-tight">
          {business?.name || "Aurevilux Haute Couture"}
        </h1>
        <p className="font-serif text-lg sm:text-2xl text-zinc-300 font-light max-w-3xl leading-relaxed italic border-l-2 border-brand-gold pl-4">
          &ldquo;{business?.tagline || "Crafting confidence and contemporary elegance."}&rdquo;
        </p>
      </section>

      {/* 2. Editorial Hero Imagery */}
      <section className="px-6 sm:px-12 max-w-6xl mx-auto my-14">
        <div className="relative aspect-[21/9] rounded-xl overflow-hidden border border-zinc-900 bg-zinc-950 shadow-2xl">
          <img
            src={lookbook?.mainImage || "/images/fashion_models/luxury_lookbook_hero.jpg"}
            alt="Atelier Aurevilux Editorial"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute bottom-6 left-6 sm:bottom-10 sm:left-10 max-w-xl">
            <span className="text-[10px] uppercase font-mono tracking-widest text-brand-gold block mb-1">
              {lookbook?.subtitle || "THE LOOKBOOK"} &bull; {lookbook?.quoteCaption || "Editorial"}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl uppercase text-white font-bold">
              {lookbook?.title || "Modern Elegance"}
            </h2>
          </div>
        </div>
      </section>

      {/* 3. The Story & Manifesto */}
      <section className="px-6 sm:px-12 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-16">
        <div className="space-y-6">
          <span className="text-[10px] tracking-[0.25em] uppercase text-brand-gold font-bold block">
            PROVENANCE & CRAFTSMANSHIP
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl uppercase text-white font-semibold leading-snug">
            Timeless Silhouettes, Uncompromising Precision
          </h2>
          <div className="text-zinc-300 text-xs sm:text-sm leading-relaxed space-y-4 font-light">
            <p>
              {lookbook?.story ||
                "Founded on the principles of immaculate bespoke tailoring and rare artisan sourcing, Aurevilux represents the pinnacle of modern luxury. Each collection is carefully orchestrated in limited quantities to preserve exclusivity and honor timeless craftsmanship."}
            </p>
            <p>
              From rare archival silks to hand-embellished evening wear and horological masterworks, our curation is dedicated to the discerning collector who seeks distinction beyond the ordinary.
            </p>
          </div>
          <div className="pt-2 flex items-center gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase tracking-widest rounded transition-colors shadow-lg shadow-brand-burgundy/20"
            >
              <span>Explore Collection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/brands"
              className="inline-flex items-center gap-2 px-6 py-3 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-widest rounded transition-colors"
            >
              <span>Partner Maisons</span>
            </Link>
          </div>
        </div>

        {/* Dual Editorial Silhouettes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-zinc-900 bg-zinc-950">
            <img
              src={lookbook?.leftImage || "/images/fashion_models/featured_categories_men.jpg"}
              alt="Editorial Left"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-zinc-900 bg-zinc-950 mt-6 sm:mt-10">
            <img
              src={lookbook?.rightImage || "/images/fashion_models/featured_categories_women.jpg"}
              alt="Editorial Right"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* 4. Atelier Flagship & Concierge Coordinates */}
      <section className="px-6 sm:px-12 max-w-6xl mx-auto my-16">
        <div className="bg-[#0e0e12] border border-zinc-900 rounded-xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-gold">
              <MapPin className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Flagship Atelier</span>
            </div>
            <p className="font-serif text-white text-base">
              {business?.address || "12 Place Vendôme, 75001 Paris, France"}
            </p>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              Private Salon by Appointment
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-gold">
              <Mail className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Client Concierge</span>
            </div>
            <p className="font-mono text-zinc-200 text-sm">
              {business?.email || "concierge@aurevilux.com"}
            </p>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              24/7 Bespoke Inquiries
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-brand-gold">
              <Phone className="w-4 h-4" />
              <span className="text-[10px] uppercase font-bold tracking-widest">Direct Salon Line</span>
            </div>
            <p className="font-mono text-zinc-200 text-sm">
              {business?.phone || "+33 1 42 68 00 00"}
            </p>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              Encrypted Voice & Wire
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
