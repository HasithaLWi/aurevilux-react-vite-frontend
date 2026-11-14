import React from "react";
import { Link } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import type { Product } from "../../data/data";

interface WishlistTabProps {
  wishlist: Product[];
  toggleWishlist: (item: Product) => void;
  addToCart: (
    product: Product,
    quantity: number,
    color: string,
    size: string
  ) => void;
  showToast: (message: string) => void;
}

export const WishlistTab: React.FC<WishlistTabProps> = ({
  wishlist,
  toggleWishlist,
  addToCart,
  showToast,
}) => {
  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="border-b border-zinc-900 pb-4">
        <h2 className="font-serif text-2xl text-white uppercase tracking-wider">
          My Wishlist
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Saved silhouettes, runway looks, and bespoke pieces.
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-zinc-850 rounded-lg space-y-5 w-full">
          <Heart className="w-12 h-12 text-zinc-700 stroke-[1.2] mx-auto animate-pulse" />
          <p className="font-serif text-sm tracking-wider text-zinc-400">
            YOUR WISHLIST IS CURRENTLY EMPTY
          </p>
          <Link
            to="/shop"
            className="inline-block bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold tracking-[0.2em] px-8 py-3.5 rounded transition-all uppercase"
          >
            Explore Boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full">
          {wishlist.map((item) => (
            <div
              key={item.id}
              className="border border-zinc-900 bg-zinc-950/60 rounded overflow-hidden flex flex-col justify-between group relative transition-all hover:border-zinc-800"
            >
              {/* Remove from wishlist */}
              <button
                onClick={() => toggleWishlist(item)}
                className="absolute top-2.5 right-2.5 z-10 p-1.5 bg-black/75 rounded-full text-zinc-400 hover:text-red-500 transition-colors"
                title="Remove from wishlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              <Link
                to={`/product/${item.id}`}
                className="aspect-[3/4] w-full bg-zinc-950 overflow-hidden block"
              >
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </Link>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] text-brand-gold font-bold tracking-widest uppercase block">
                    {item.brand}
                  </span>
                  <h4 className="text-xs font-serif text-white tracking-wide uppercase line-clamp-1">
                    <Link
                      to={`/product/${item.id}`}
                      className="hover:text-brand-gold transition-colors"
                    >
                      {item.name}
                    </Link>
                  </h4>
                  <span className="text-xs font-serif text-brand-gold font-bold block pt-0.5">
                    ${item.price.toLocaleString()}
                  </span>
                </div>

                {/* 1-Click Move to Bag */}
                <button
                  onClick={() => {
                    addToCart(
                      item,
                      1,
                      item.colors[0]?.name || "Noir Black",
                      item.sizes[0] || "M"
                    );
                    toggleWishlist(item);
                    showToast(`${item.name} MOVED TO SHOPPING BAG`);
                  }}
                  className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-2 rounded text-[9.5px] font-bold tracking-[0.15em] uppercase transition-colors"
                >
                  Move to Bag
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

