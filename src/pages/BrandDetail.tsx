import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, ArrowLeft } from "lucide-react";
import { products, brands } from "../data/data";
import type { Brand } from "../data/data";
import { useApp } from "../context/AppContext";
import { BrandService } from "../services/brand.service";

export default function BrandDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();

  const [brand, setBrand] = useState<Brand | null>(null);

  useEffect(() => {
    if (!id) return;
    async function loadBrand() {
      try {
        const apiBrand = await BrandService.getBrandById(id!);
        if (apiBrand) {
          setBrand(apiBrand as unknown as Brand);
          return;
        }
      } catch (err) {
        console.warn("Using offline brand details:", err);
      }

      const foundBrand = brands.find((b) => b.id === id);
      if (foundBrand) {
        setBrand(foundBrand);
      }
    }
    loadBrand();
  }, [id]);

  if (!brand) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-brand-black text-zinc-400">
        <p className="font-serif tracking-widest text-lg">FINDING BRAND SPECIFICATIONS...</p>
        <button
          onClick={() => navigate("/brands")}
          className="text-xs text-brand-gold underline tracking-widest uppercase font-semibold"
        >
          Back To Brands
        </button>
      </div>
    );
  }

  // Filter products by brand name
  const brandProducts = products.filter(
    (p) =>
      p.brand.toLowerCase().replace(" ", "-") === brand.id ||
      p.brand.toLowerCase() === brand.name.toLowerCase()
  );

  return (
    <div className="bg-brand-black min-h-screen pt-20 pb-16 space-y-12">
      {/* Brand Hero Banner */}
      <div className="relative h-[300px] md:h-[400px] w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src={brand.campaignImage}
            alt={brand.name}
            className="w-full h-full object-cover object-center brightness-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-black via-brand-black/30 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 text-center max-w-2xl px-6 space-y-4">
          <button
            onClick={() => navigate("/brands")}
            className="inline-flex items-center space-x-2 text-[10px] tracking-[0.2em] font-semibold text-brand-gold hover:text-white transition-colors uppercase"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BRANDS DIRECTORY</span>
          </button>

          <div className="bg-brand-black/80 px-4 py-2 border border-zinc-800 rounded w-fit mx-auto">
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-16 object-contain filter brightness-100"
            />
          </div>

          <h1 className="font-serif text-3xl md:text-5xl text-white tracking-widest uppercase">
            {brand.name}
          </h1>
          <p className="text-xs text-zinc-300 font-light leading-relaxed">
            {brand.description}
          </p>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-8">
        <div className="border-b border-zinc-900 pb-4 flex justify-between items-center text-xs tracking-wider">
          <span className="text-zinc-500 uppercase">
            COLLECTION PIECES ({brandProducts.length} ITEMS)
          </span>
          <Link
            to="/shop"
            className="text-brand-gold hover:text-white underline underline-offset-4"
          >
            VIEW ALL PRODUCTS
          </Link>
        </div>

        {brandProducts.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-zinc-800 rounded space-y-4">
            <p className="font-serif text-sm tracking-wider text-zinc-500">
              NO PIECES CURRENTLY DISPLAYED FOR THIS LABEL
            </p>
            <Link
              to="/shop"
              className="text-xs font-semibold tracking-[0.2em] text-brand-gold hover:text-white transition-colors uppercase"
            >
              Discover other collections
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {brandProducts.map((p) => {
              const pWishlisted = isInWishlist(p.id);
              return (
                <div
                  key={p.id}
                  className="group flex flex-col justify-between border border-zinc-900 bg-brand-dark/20 p-4 rounded hover:border-zinc-800 hover:bg-brand-dark/50 transition-all duration-300"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-brand-black rounded mb-4">
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() => toggleWishlist(p)}
                      className="absolute top-3 right-3 p-2 bg-black/60 rounded-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-red-500 transition-colors z-10"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          pWishlisted ? "text-red-500 fill-red-500" : ""
                        }`}
                      />
                    </button>
                  </div>
                  <div className="space-y-2 flex-grow flex flex-col justify-between">
                    <div className="space-y-1">
                      <h3 className="font-serif text-xs tracking-wider text-white uppercase group-hover:text-brand-gold transition-colors font-medium">
                        <Link to={`/product/${p.id}`}>{p.name}</Link>
                      </h3>
                      <div className="flex justify-between items-center text-[9px] tracking-wider text-zinc-500">
                        <span>{p.brand}</span>
                        <span className="text-white font-medium">
                          ${p.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        addToCart(
                          p,
                          1,
                          p.colors?.[0]?.name || "Default",
                          p.sizes?.[0] || "One Size"
                        )
                      }
                      className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-2 text-center text-[9px] font-bold tracking-[0.2em] transition-colors rounded uppercase flex items-center justify-center space-x-1.5 mt-2"
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>ADD TO CART</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
