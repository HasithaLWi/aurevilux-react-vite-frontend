import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Eye, Trash2 } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Wishlist() {
  const { wishlist, toggleWishlist, addToCart } = useApp();

  const handleMoveToCart = (product: any) => {
    // Add to cart with default options (first color, first size)
    const color = product.colors?.[0]?.name || "Default";
    const size = product.sizes?.[0] || "One Size";
    addToCart(product, 1, color, size);

    // Remove from wishlist
    toggleWishlist(product);
  };

  return (
    <div className="bg-brand-black min-h-screen pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-8 text-center sm:text-left space-y-2">
        <span className="text-[10px] tracking-[0.3em] text-brand-gold font-semibold uppercase">
          SAVED PIECES
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-white uppercase tracking-wider">
          Wishlist
        </h1>
      </div>

      {wishlist.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-zinc-800 rounded space-y-6">
          <Heart className="w-12 h-12 text-zinc-700 stroke-[1.2] mx-auto animate-pulse" />
          <p className="font-serif text-sm tracking-wider text-zinc-400">
            YOUR WISHLIST IS CURRENTLY EMPTY
          </p>
          <Link
            to="/shop"
            className="inline-block bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold tracking-[0.2em] px-8 py-3.5 rounded transition-all duration-300 uppercase"
          >
            Explore Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {wishlist.map((product) => (
            <div
              key={product.id}
              className="group flex flex-col justify-between border border-zinc-900 bg-brand-dark/30 p-4 rounded hover:border-zinc-800 hover:bg-brand-dark transition-all duration-300"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/5] overflow-hidden bg-brand-black rounded mb-4">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />

                {/* Remove button */}
                <button
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-3 right-3 p-2 bg-black/60 rounded-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-red-500 transition-colors z-10"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Product details */}
              <div className="space-y-3 flex-grow flex flex-col justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] tracking-widest text-brand-gold font-semibold uppercase">
                    {product.brand}
                  </span>
                  <h3 className="font-serif text-sm tracking-wider text-white uppercase group-hover:text-brand-gold transition-colors font-medium">
                    <Link to={`/product/${product.id}`}>{product.name}</Link>
                  </h3>
                  <div className="flex justify-between items-center text-[10px] tracking-wider text-zinc-500 pt-1">
                    <span>{product.categoryLabel}</span>
                    <span className="text-white font-medium text-xs">
                      ${product.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => handleMoveToCart(product)}
                    className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-2.5 text-center text-[10px] font-bold tracking-[0.2em] transition-colors rounded uppercase flex items-center justify-center space-x-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>ADD TO BAG</span>
                  </button>

                  <Link
                    to={`/product/${product.id}`}
                    className="w-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white py-2 text-center text-[9px] font-bold tracking-[0.2em] transition-all rounded uppercase block flex items-center justify-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>VIEW PIECE</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
