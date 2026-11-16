import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Ticket,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { OrderService } from "../services/order.service";

export default function Cart() {
  const { cart, removeFromCart, updateCartQuantity, cartTotal, clearCart } =
    useApp();
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState(0); // in percent
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState("");

  // Live Stock Availability State
  const [stockStatus, setStockStatus] = useState<
    Record<string, { available: number; requested: number }>
  >({});
  const [hasStockIssue, setHasStockIssue] = useState(false);

  // Validate cart against backend database on load & when cart changes
  useEffect(() => {
    async function checkAvailability() {
      if (cart.length === 0) {
        setStockStatus({});
        setHasStockIssue(false);
        return;
      }

      const itemsPayload = cart.map((item) => ({
        productId:
          (item.product as any)._id || item.product.id || item.product.slug,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
      }));

      try {
        const res = await OrderService.validateCart(itemsPayload);
        if (!res.valid && res.unavailable) {
          const map: Record<string, { available: number; requested: number }> =
            {};
          for (const unav of res.unavailable) {
            map[unav.productId] = {
              available: unav.available,
              requested: unav.requested,
            };
          }
          setStockStatus(map);
          setHasStockIssue(true);
        } else {
          setStockStatus({});
          setHasStockIssue(false);
        }
      } catch (e) {
        console.warn("Cart stock verification error:", e);
      }
    }

    checkAvailability();
  }, [cart]);

  // Remove all completely sold-out pieces
  const handleRemoveSoldOut = () => {
    cart.forEach((item) => {
      const pId =
        (item.product as any)._id || item.product.id || item.product.slug;
      const status = stockStatus[pId];
      if (status && status.available === 0) {
        removeFromCart(item.product.id, item.selectedColor, item.selectedSize);
      }
    });
  };

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

      {/* Live Stock Notification Banner */}
      {hasStockIssue && cart.length > 0 && (
        <div className="p-4 bg-[#1e1315] border border-amber-900/60 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-200 text-xs shadow-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider block text-amber-300">
                Atelier Availability Notice
              </span>
              <p className="text-[11px] text-zinc-400 font-light">
                Certain pieces in your shopping bag have limited atelier
                availability or are currently sold out.
              </p>
            </div>
          </div>
          <button
            onClick={handleRemoveSoldOut}
            className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] uppercase font-bold tracking-wider rounded transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Remove Sold Out Pieces
          </button>
        </div>
      )}

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

            {cart.map((item) => {
              const pId =
                (item.product as any)._id ||
                item.product.id ||
                item.product.slug;
              const itemStock = stockStatus[pId];
              return (
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

                      {/* Stock Alert Labels */}
                      {itemStock && itemStock.available === 0 && (
                        <span className="text-[9px] bg-red-950/80 text-red-400 border border-red-800 px-2 py-0.5 rounded font-mono uppercase font-bold w-fit mt-1">
                          Sold Out in Atelier
                        </span>
                      )}
                      {itemStock &&
                        itemStock.available > 0 &&
                        itemStock.available < item.quantity && (
                          <span className="text-[9px] bg-amber-950/80 text-amber-400 border border-amber-800 px-2 py-0.5 rounded font-mono uppercase font-bold w-fit mt-1">
                            Only {itemStock.available} Available in Atelier
                          </span>
                        )}

                      {/* Delete trigger on mobile */}
                      <button
                        onClick={() =>
                          removeFromCart(
                            item.product.id,
                            item.selectedColor,
                            item.selectedSize,
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
                    {(() => {
                      const sizeStockEntry = (
                        item.product as any
                      )?.sizeStock?.find(
                        (s: any) => s.size === item.selectedSize,
                      );
                      const maxStock = sizeStockEntry
                        ? sizeStockEntry.quantity
                        : ((item.product as any).stockCount ?? 99);
                      const isAtMax = item.quantity >= maxStock;

                      return (
                        <div className="inline-flex items-center border border-zinc-800 bg-brand-dark/20 rounded">
                          <button
                            type="button"
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.selectedColor,
                                item.selectedSize,
                                item.quantity - 1,
                              )
                            }
                            className="px-2 py-1 text-zinc-500 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3.5 text-xs font-semibold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={isAtMax}
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.selectedColor,
                                item.selectedSize,
                                item.quantity + 1,
                              )
                            }
                            className="px-2 py-1 text-zinc-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-opacity"
                            title={
                              isAtMax
                                ? `Max available in size ${item.selectedSize}: ${maxStock}`
                                : undefined
                            }
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      );
                    })()}
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
                            item.selectedSize,
                          )
                        }
                        className="text-zinc-600 hover:text-red-500 transition-colors hidden sm:block"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

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
                <span className="text-white font-medium">
                  ${cartTotal.toLocaleString()}
                </span>
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
                  <span className="text-brand-gold font-bold">
                    COMPLIMENTARY
                  </span>
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
                <span className="text-brand-gold font-semibold">
                  AUREVILUX10
                </span>{" "}
                FOR A 10% DISCOUNT.
              </p>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-center pt-2 text-sm border-t border-zinc-900/60 mt-4">
              <span className="text-white font-medium tracking-wider">
                TOTAL ESTIMATED
              </span>
              <span className="text-brand-gold font-serif text-xl tracking-wider">
                ${grandTotal.toLocaleString()}
              </span>
            </div>

            {/* Checkout Action */}
            <div className="space-y-3">
              {hasStockIssue &&
              Object.values(stockStatus).some((s) => s.available === 0) ? (
                <div className="space-y-2">
                  <button
                    disabled
                    className="w-full bg-zinc-900 border border-red-900/60 text-red-400 py-4 text-center block text-xs font-bold tracking-[0.2em] rounded uppercase cursor-not-allowed opacity-80"
                  >
                    RESOLVE OUT-OF-STOCK PIECES
                  </button>
                  <button
                    type="button"
                    onClick={handleRemoveSoldOut}
                    className="w-full text-center text-[10px] text-zinc-400 hover:text-white uppercase tracking-wider underline block cursor-pointer"
                  >
                    Purge Out-of-Stock Pieces
                  </button>
                </div>
              ) : (
                <Link
                  to="/checkout"
                  className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-4 text-center block text-xs font-bold tracking-[0.2em] transition-colors rounded uppercase shadow-lg shadow-brand-burgundy/15"
                >
                  PROCEED TO CHECKOUT
                </Link>
              )}
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
