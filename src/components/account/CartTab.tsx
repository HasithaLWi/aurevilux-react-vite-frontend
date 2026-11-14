import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import type { CartItem } from "../../context/AppContext";

interface CartTabProps {
  cart: CartItem[];
  cartTotal: number;
  removeFromCart: (productId: string, color: string, size: string) => void;
  updateCartQuantity: (
    productId: string,
    color: string,
    size: string,
    quantity: number
  ) => void;
  clearCart: () => void;
}

export const CartTab: React.FC<CartTabProps> = ({
  cart,
  cartTotal,
  removeFromCart,
  updateCartQuantity,
  clearCart,
}) => {
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // percent
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

  const discountAmount = (cartTotal * appliedDiscount) / 100;
  const subtotalAfterDiscount = cartTotal - discountAmount;
  const shippingFee = cartTotal > 500 || cartTotal === 0 ? 0 : 35;
  const taxFee = Math.round(subtotalAfterDiscount * 0.08);
  const grandTotal = subtotalAfterDiscount + shippingFee + taxFee;

  return (
    <div className="space-y-8 animate-fade-in w-full">
      <div className="border-b border-zinc-900 pb-4">
        <h2 className="font-serif text-2xl text-white uppercase tracking-wider">
          Shopping Bag
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Review your selections, apply coupon codes, and proceed to checkout.
        </p>
      </div>

      {cart.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-zinc-850 rounded-lg space-y-5 w-full">
          <ShoppingBag className="w-12 h-12 text-zinc-700 stroke-[1.2] mx-auto" />
          <p className="font-serif text-sm tracking-wider text-zinc-400">
            YOUR SHOPPING BAG IS CURRENTLY EMPTY
          </p>
          <Link
            to="/shop"
            className="inline-block bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold tracking-[0.2em] px-8 py-3.5 rounded transition-all uppercase"
          >
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="hidden sm:grid grid-cols-12 text-[10px] tracking-[0.25em] text-zinc-500 font-bold uppercase pb-3 border-b border-zinc-900">
              <div className="col-span-6">ITEM</div>
              <div className="col-span-2 text-center">QUANTITY</div>
              <div className="col-span-2 text-right">PRICE</div>
              <div className="col-span-2 text-right">TOTAL</div>
            </div>

            <div className="divide-y divide-zinc-900">
              {cart.map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 py-5"
                >
                  {/* Info */}
                  <div className="col-span-12 sm:col-span-6 flex space-x-4">
                    <div className="w-16 h-20 bg-zinc-900 rounded overflow-hidden flex-shrink-0 border border-zinc-900">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-center space-y-1">
                      <span className="text-[9px] tracking-widest text-brand-gold font-semibold uppercase">
                        {item.product.brand}
                      </span>
                      <h3 className="font-serif text-xs text-white uppercase tracking-wider">
                        <Link
                          to={`/product/${item.product.id}`}
                          className="hover:text-brand-gold transition-colors"
                        >
                          {item.product.name}
                        </Link>
                      </h3>
                      <div className="flex space-x-3 text-[10px] text-zinc-500 tracking-wider">
                        <span>
                          Color:{" "}
                          <span className="text-zinc-300">
                            {item.selectedColor}
                          </span>
                        </span>
                        <span>
                          Size:{" "}
                          <span className="text-zinc-300">
                            {item.selectedSize}
                          </span>
                        </span>
                      </div>
                      <button
                        onClick={() =>
                          removeFromCart(
                            item.product.id,
                            item.selectedColor,
                            item.selectedSize
                          )
                        }
                        className="text-red-400 hover:text-red-300 text-[9.5px] font-semibold tracking-wider text-left pt-1 flex items-center gap-1 sm:hidden w-fit"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>REMOVE</span>
                      </button>
                    </div>
                  </div>

                  {/* Quantity */}
                  <div className="col-span-6 sm:col-span-2 flex justify-center">
                    <div className="inline-flex items-center border border-zinc-800 bg-zinc-900/50 rounded">
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.product.id,
                            item.selectedColor,
                            item.selectedSize,
                            item.quantity - 1
                          )
                        }
                        className="px-2.5 py-1 text-zinc-400 hover:text-white"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateCartQuantity(
                            item.product.id,
                            item.selectedColor,
                            item.selectedSize,
                            item.quantity + 1
                          )
                        }
                        className="px-2.5 py-1 text-zinc-400 hover:text-white"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="col-span-3 sm:col-span-2 text-right hidden sm:block text-xs font-medium text-zinc-400">
                    ${item.product.price.toLocaleString()}
                  </div>

                  {/* Line Total & Remove */}
                  <div className="col-span-3 sm:col-span-2 text-right flex items-center justify-end space-x-3">
                    <span className="font-serif text-sm font-semibold text-brand-gold">
                      ${(item.product.price * item.quantity).toLocaleString()}
                    </span>
                    <button
                      onClick={() =>
                        removeFromCart(
                          item.product.id,
                          item.selectedColor,
                          item.selectedSize
                        )
                      }
                      className="text-zinc-600 hover:text-red-400 transition-colors hidden sm:block"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex justify-between items-center text-xs">
              <button
                onClick={clearCart}
                className="text-[10px] tracking-widest text-zinc-500 hover:text-red-400 uppercase font-semibold transition-colors"
              >
                Clear Shopping Bag
              </button>
              <Link
                to="/shop"
                className="text-[10px] tracking-widest text-brand-gold hover:text-white uppercase font-bold"
              >
                Continue Shopping &rarr;
              </Link>
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-4 border border-zinc-900 bg-zinc-950/70 p-6 md:p-8 rounded-lg space-y-6 sticky top-8">
            <h3 className="font-serif text-base uppercase tracking-wider text-white border-b border-zinc-900 pb-3">
              Order Summary
            </h3>

            {/* Promo Form */}
            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold block">
                Promo Code
              </label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Ticket className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="AUREVILUX10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 pl-9 pr-3 py-2 text-xs text-white rounded uppercase outline-none focus:border-brand-gold/50"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold tracking-widest px-4 py-2 rounded uppercase transition-colors"
                >
                  Apply
                </button>
              </div>
              {promoSuccess && (
                <p className="text-[10px] text-emerald-400 font-semibold">
                  {promoSuccess}
                </p>
              )}
              {promoError && (
                <p className="text-[10px] text-red-400 font-semibold">
                  {promoError}
                </p>
              )}
            </form>

            {/* Calculation Details */}
            <div className="space-y-3 text-xs border-t border-zinc-900 pt-4">
              <div className="flex justify-between text-zinc-400">
                <span>Bag Subtotal</span>
                <span>${cartTotal.toLocaleString()}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Private Client Discount (10%)</span>
                  <span>-${discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between text-zinc-400">
                <span>White-Glove Shipping</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-brand-gold">Complimentary</span>
                  ) : (
                    `$${shippingFee}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-zinc-400">
                <span>Estimated Luxury Tax (8%)</span>
                <span>${taxFee.toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center text-white font-serif font-bold text-base pt-3 border-t border-zinc-900">
                <span>Grand Total</span>
                <span className="text-brand-gold text-lg">
                  ${grandTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Checkout CTA */}
            <Link
              to="/checkout"
              className="w-full block text-center bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3.5 rounded text-xs font-bold tracking-[0.2em] uppercase transition-all shadow-lg shadow-brand-burgundy/15"
            >
              Proceed To Checkout
            </Link>

            <div className="pt-2 flex items-center justify-center space-x-2 text-[10px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
              <span>Complimentary Authenticity Guarantee</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

