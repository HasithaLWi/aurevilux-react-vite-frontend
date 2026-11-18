import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { brands as fallbackBrands } from "../data/data";
import type { Brand } from "../data/data";
import { BrandService } from "../services/brand.service";

export default function Brands() {
  const [brandsList, setBrandsList] = useState<Brand[]>(fallbackBrands);

  useEffect(() => {
    async function loadBrands() {
      try {
        const apiBrands = await BrandService.getBrands();
        if (apiBrands && apiBrands.length > 0) {
          setBrandsList(apiBrands as unknown as Brand[]);
        }
      } catch (err) {
        console.warn("Using offline brand directory:", err);
      }
    }
    loadBrands();
  }, []);

  return (
    <div className="bg-brand-black min-h-screen pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-8 text-center sm:text-left space-y-2">
        <span className="text-[10px] tracking-[0.3em] text-brand-gold font-semibold uppercase">
          AUREVILUX PORTFOLIO
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-white uppercase tracking-wider">
          Brand Directory
        </h1>
        <p className="text-xs text-zinc-500 max-w-lg leading-relaxed pt-1">
          Partnering with leading global labels that embody structural innovation, meticulous
          tailoring, and sustainable luxury.
        </p>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {brandsList.map((brand) => (
          <div
            key={brand.id}
            className="group flex flex-col justify-between border border-zinc-900 bg-brand-dark/40 overflow-hidden rounded-lg shadow-xl hover:border-zinc-800 transition-all duration-500"
          >
            {/* Brand Campaign Header Image */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-brand-black border-b border-zinc-900">
              <img
                src={brand.campaignImage}
                alt={`${brand.name} Campaign`}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.7]"
              />
              {/* Brand Logo Floating Overlay */}
              <div className="absolute inset-0 bg-black/35 flex items-center justify-center p-6">
                <div className="bg-white/70 p-4 border border-zinc-800 max-w-[150px] max-h-[70px] flex items-center justify-center rounded">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="max-w-full max-h-full object-contain filter brightness-95"
                  />
                </div>
              </div>
            </div>

            {/* Description Details */}
            <div className="p-6 flex-grow flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h3 className="font-serif text-lg tracking-wider text-white uppercase group-hover:text-brand-gold transition-colors">
                  {brand.name}
                </h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed">
                  {brand.description}
                </p>
              </div>

              <div className="pt-2 border-t border-zinc-900/60">
                <Link
                  to={`/brands/${brand.id}`}
                  className="group/btn flex items-center justify-between text-[10px] tracking-[0.2em] font-semibold text-brand-gold hover:text-white transition-colors duration-200"
                >
                  <span>DISCOVER PIECES</span>
                  <ArrowRight className="w-4 h-4 text-brand-gold group-hover/btn:translate-x-1.5 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
