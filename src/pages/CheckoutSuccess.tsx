import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight } from "lucide-react";

interface OrderDetails {
  orderId: string;
  total: number;
  itemsCount: number;
  name: string;
  address: string;
}

export default function CheckoutSuccess() {
  const [order, setOrder] = useState<OrderDetails | null>(null);

  useEffect(() => {
    const savedOrder = sessionStorage.getItem("aurevilux_last_order");
    if (savedOrder) {
      try {
        setOrder(JSON.parse(savedOrder));
      } catch (e) {
        console.error("Error parsing order", e);
      }
    }
  }, []);

  return (
    <div className="bg-brand-black min-h-screen pt-28 pb-16 px-6 md:px-12 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-brand-burgundy/15 blur-[90px] pointer-events-none rounded-full" />

      <div className="max-w-md w-full text-center relative z-10 space-y-8 bg-brand-dark/50 border border-zinc-900 p-8 rounded-lg shadow-2xl">
        {/* Success Icon */}
        <div className="p-4 bg-brand-black w-fit mx-auto rounded-full border border-emerald-500/25">
          <CheckCircle className="w-12 h-12 text-emerald-500 stroke-[1.2]" />
        </div>

        {/* Header Message */}
        <div className="space-y-2">
          <span className="text-[9px] tracking-[0.3em] text-brand-gold font-semibold uppercase">
            TRANSACTION COMPLETED
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-white uppercase tracking-wider">
            Order Confirmed
          </h1>
          <p className="text-xs text-zinc-400 font-light">
            Thank you for shopping at Aurevilux. Your order was successfully processed.
          </p>
        </div>

        {/* Order Details Display Card */}
        {order ? (
          <div className="border border-zinc-900/60 bg-brand-black/40 rounded-lg p-5 text-xs text-zinc-400 space-y-3.5 text-left font-light leading-relaxed">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <span className="text-zinc-500 uppercase tracking-widest font-semibold text-[9px]">
                ORDER ID
              </span>
              <span className="text-white font-mono font-semibold tracking-wider">
                {order.orderId}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>CUSTOMER</span>
              <span className="text-white font-medium">{order.name}</span>
            </div>

            <div className="flex justify-between items-start">
              <span>SHIPPING ADDRESS</span>
              <span className="text-white font-medium text-right max-w-[200px] break-words">
                {order.address}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>ITEMS TOTAL</span>
              <span className="text-white font-medium">{order.itemsCount} pieces</span>
            </div>

            <div className="flex justify-between items-center border-t border-zinc-900 pt-2 text-sm mt-1">
              <span className="text-white uppercase tracking-widest font-semibold text-[9px]">
                CHARGED AMOUNT
              </span>
              <span className="text-brand-gold font-serif text-lg tracking-wider">
                ${order.total.toLocaleString()}
              </span>
            </div>
          </div>
        ) : (
          <div className="py-6 border border-zinc-900 rounded bg-brand-black/20 text-xs text-zinc-500 italic">
            Retrieving purchase receipt details...
          </div>
        )}

        {/* Information text */}
        <p className="text-[10px] text-zinc-500 leading-relaxed max-w-sm mx-auto font-light">
          An email confirmation receipt containing order details, dispatch updates, and
          tracking parameters has been sent to your registered address.
        </p>

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-zinc-900">
          <Link
            to="/"
            className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3 text-center block text-xs font-semibold tracking-[0.2em] transition-colors rounded uppercase flex items-center justify-center space-x-2"
          >
            <span>RETURN TO HOME</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/account"
            className="w-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white py-3 text-center block text-xs font-semibold tracking-[0.2em] transition-colors rounded uppercase"
          >
            VIEW IN YOUR ACCOUNT
          </Link>
        </div>
      </div>
    </div>
  );
}
