import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Trash2, Plus, Minus, ShieldCheck, Ticket } from "lucide-react";
import { useApp } from "../context/AppContext";

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, clearCart } = useApp();
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in percent
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "AUREVILUX10") {
      setAppliedDiscount(10);
      setPromoSuccess("PROMO CODE 'AUREVILUX10' APPLIED: 10% DISCOUNT");
      setPromoError("");
    } else {
      setPromoError("INVALID OR EXPIRED PROMO CODE");
      setPromoSuccess("");
    }
  };

  // Calculations
  const discountAmount = (cartTotal * appliedDiscount) / 100;
  const subtotalAfterDiscount = cartTotal - discountAmount;

  // Free shipping over $500
  const shippingFee = cartTotal > 500 || cartTotal === 0 ? 0 : 35;
  const taxFee = Math.round(subtotalAfterDiscount * 0.08); // 8% tax
  const grandTotal = subtotalAfterDiscount + shippingFee + taxFee;

  return (
    <div className="bg-brand-black min-h-screen pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-8 text-center sm:text-left space-y-2">
        <span className="text-[10px] tracking-[0.3em] text-brand-gold font-semibold uppercase">
          YOUR SELECTIONS
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-white uppercase tracking-wider">
          Shopping Bag
        </h1>
      </div>

      {cart.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-zinc-800 rounded space-y-6">
          <ShoppingBag className="w-12 h-12 text-zinc-700 stroke-[1.2] mx-auto" />
          <p className="font-serif text-sm tracking-wider text-zinc-400">
            YOUR SHOPPING BAG IS CURRENTLY EMPTY
          </p>
          <Link
            to="/shop"
            className="inline-block bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold tracking-[0.2em] px-8 py-3.5 rounded transition-all duration-300 uppercase"
          >
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="hidden sm:grid grid-cols-12 text-[10px] tracking-[0.25em] text-zinc-500 font-bold uppercase pb-3 border-b border-zinc-900">
              <div className="col-span-6">ITEM</div>
              <div className="col-span-2 text-center">QUANTITY</div>
              <div className="col-span-2 text-right">PRICE</div>
              <div className="col-span-2 text-right">TOTAL</div>
            </div>

            {cart.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-6 border-b border-zinc-900"
              >
                {/* Product Detail info */}
                <div className="col-span-12 sm:col-span-6 flex space-x-4">
                  <div className="w-20 h-24 relative overflow-hidden bg-brand-dark rounded flex-shrink-0 border border-zinc-900">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>
                  <div className="flex flex-col justify-center space-y-1">
                    <span className="text-[9px] tracking-widest text-brand-gold font-semibold uppercase">
                      {item.product.brand}
                    </span>
                    <h3 className="font-serif text-sm text-white uppercase tracking-wider">
                      <Link
                        to={`/product/${item.product.id}`}
                        className="hover:text-brand-gold transition-colors"
                      >
                        {item.product.name}
                      </Link>
                    </h3>
                    <div className="flex space-x-3 text-[10px] text-zinc-500 tracking-wider">
                      <span>
                        Color: <span className="text-zinc-300">{item.selectedColor}</span>
                      </span>
                      <span>
                        Size: <span className="text-zinc-300">{item.selectedSize}</span>
                      </span>
                    </div>
                    {/* Delete trigger on mobile */}
                    <button
                      onClick={() =>
                        removeFromCart(
                          item.product.id,
                          item.selectedColor,
                          item.selectedSize
                        )
                      }
                      className="text-red-500 hover:text-red-400 text-[10px] font-semibold tracking-wider text-left pt-1 flex items-center gap-1 sm:hidden w-fit"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>REMOVE</span>
                    </button>
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="col-span-6 sm:col-span-2 flex justify-center">
                  <div className="inline-flex items-center border border-zinc-800 bg-brand-dark/20 rounded">
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.product.id,
                          item.selectedColor,
                          item.selectedSize,
                          item.quantity - 1
                        )
                      }
                      className="px-2 py-1 text-zinc-500 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="px-3.5 text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateCartQuantity(
                          item.product.id,
                          item.selectedColor,
                          item.selectedSize,
                          item.quantity + 1
                        )
                      }
                      className="px-2 py-1 text-zinc-500 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="col-span-3 sm:col-span-2 text-right hidden sm:block text-xs font-medium text-zinc-400">
                  ${item.product.price.toLocaleString()}
                </div>

                {/* Total */}
                <div className="col-span-6 sm:col-span-2 text-right flex justify-between sm:block items-center">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase sm:hidden">
                    SUBTOTAL
                  </span>
                  <div className="flex items-center justify-end space-x-3">
                    <span className="text-xs font-semibold text-brand-gold">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                    {/* Remove trigger desktop */}
                    <button
                      onClick={() =>
                        removeFromCart(
                          item.product.id,
                          item.selectedColor,
                          item.selectedSize
                        )
                      }
                      className="text-zinc-600 hover:text-red-500 transition-colors hidden sm:block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            <div className="pt-4 flex justify-between items-center text-xs">
              <Link
                to="/shop"
                className="text-zinc-400 hover:text-brand-gold underline underline-offset-4 tracking-widest font-semibold uppercase"
              >
                &larr; CONTINUE SHOPPING
              </Link>
              <button
                onClick={clearCart}
                className="text-zinc-500 hover:text-zinc-400 tracking-widest font-semibold uppercase transition-colors"
              >
                CLEAR BAG
              </button>
            </div>
          </div>

          {/* Right Summary Card */}
          <div className="lg:col-span-4 bg-brand-dark/50 border border-zinc-900 p-6 md:p-8 rounded-lg space-y-6">
            <h3 className="font-serif text-lg text-white uppercase tracking-wider border-b border-zinc-900 pb-4">
              Order Summary
            </h3>

            {/* Calculations Breakdown */}
            <div className="space-y-4 text-xs font-light text-zinc-400 border-b border-zinc-900 pb-6">
              <div className="flex justify-between items-center">
                <span>BAG SUBTOTAL</span>
                <span className="text-white font-medium">${cartTotal.toLocaleString()}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between items-center text-emerald-500">
                  <span>DISCOUNT ({appliedDiscount}%)</span>
                  <span>-${discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>SHIPPING</span>
                {shippingFee === 0 ? (
                  <span className="text-brand-gold font-bold">COMPLIMENTARY</span>
                ) : (
                  <span className="text-white font-medium">${shippingFee}</span>
                )}
              </div>

              <div className="flex justify-between items-center">
                <span>ESTIMATED TAX (8%)</span>
                <span className="text-white font-medium">${taxFee}</span>
              </div>
            </div>

            {/* Promocode form */}
            <div className="space-y-3">
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="PROMO CODE"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="bg-brand-black border border-zinc-800 focus:border-brand-gold text-[10px] px-3.5 py-3 rounded outline-none text-white tracking-widest font-light placeholder-zinc-700 uppercase flex-grow"
                />
                <button
                  type="submit"
                  className="bg-brand-dark border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white px-4 py-3 text-[10px] font-bold tracking-widest transition-colors rounded uppercase flex items-center space-x-1"
                >
                  <Ticket className="w-3.5 h-3.5 text-brand-gold" />
                  <span>APPLY</span>
                </button>
              </form>
              {promoError && (
                <p className="text-[9px] text-red-500 font-semibold tracking-wider uppercase">
                  {promoError}
                </p>
              )}
              {promoSuccess && (
                <p className="text-[9px] text-emerald-500 font-semibold tracking-wider uppercase">
                  {promoSuccess}
                </p>
              )}
              <p className="text-[8px] text-zinc-600 tracking-wider">
                TRY THE CODE{" "}
                <span className="text-brand-gold font-semibold">AUREVILUX10</span> FOR A
                10% DISCOUNT.
              </p>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-center pt-2 text-sm border-t border-zinc-900/60 mt-4">
              <span className="text-white font-medium tracking-wider">TOTAL ESTIMATED</span>
              <span className="text-brand-gold font-serif text-xl tracking-wider">
                ${grandTotal.toLocaleString()}
              </span>
            </div>

            {/* Checkout Action */}
            <div className="space-y-3">
              <Link
                to="/checkout"
                className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-4 text-center block text-xs font-bold tracking-[0.2em] transition-colors rounded uppercase shadow-lg shadow-brand-burgundy/15"
              >
                PROCEED TO CHECKOUT
              </Link>
            </div>

            <div className="flex items-center justify-center space-x-2 text-[9px] tracking-widest text-zinc-500 pt-2 font-light">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
              <span>SECURED & ENCRYPTED CHECKOUT</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

