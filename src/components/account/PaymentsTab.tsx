import React, { useState } from "react";
import { Plus, X, Trash2, CreditCard } from "lucide-react";
import type { PaymentMethodCard } from "../../types";

interface PaymentsTabProps {
  paymentCards: PaymentMethodCard[];
  cardHolderPlaceholder?: string;
  onSaveCard: (card: PaymentMethodCard) => Promise<void>;
  onDeleteCard: (id: string) => void;
}

export const PaymentsTab: React.FC<PaymentsTabProps> = ({
  paymentCards,
  cardHolderPlaceholder = "CARDHOLDER NAME",
  onSaveCard,
  onDeleteCard,
}) => {
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    isDefault: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = cardForm.cardNumber.replace(/\s+/g, "");
    const masked = `•••• •••• •••• ${cleanNum.slice(-4) || "4242"}`;

    const newCard: PaymentMethodCard = {
      id: `card-${Date.now()}`,
      brand: "visa",
      cardNumber: masked,
      expiry: cardForm.expiry || "12/28",
      cardHolder: cardForm.cardHolder.toUpperCase(),
      isDefault: cardForm.isDefault,
    };

    await onSaveCard(newCard);
    setShowCardForm(false);
    setCardForm({
      cardHolder: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      isDefault: false,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h2 className="font-serif text-2xl text-white uppercase tracking-wider">
            Payment Vault
          </h2>
          <p className="text-xs text-zinc-500 mt-0.5">
            Saved payment methods encrypted with PCI-DSS luxury standards.
          </p>
        </div>
        <button
          onClick={() => setShowCardForm(true)}
          className="inline-flex items-center space-x-2 bg-brand-gold hover:bg-brand-goldHover text-brand-black px-4 py-2 text-xs font-bold tracking-widest rounded uppercase transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Card</span>
        </button>
      </div>

      {/* Add Card Form */}
      {showCardForm && (
        <form
          onSubmit={handleSubmit}
          className="border border-brand-gold/30 bg-zinc-950 p-6 rounded-lg space-y-4 w-full"
        >
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="font-serif text-sm uppercase tracking-wider text-brand-gold font-bold">
              Add Credit / Debit Card
            </h3>
            <button
              type="button"
              onClick={() => setShowCardForm(false)}
              className="text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2 space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                Cardholder Full Name
              </label>
              <input
                type="text"
                required
                placeholder={cardHolderPlaceholder}
                value={cardForm.cardHolder}
                onChange={(e) =>
                  setCardForm({ ...cardForm, cardHolder: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white rounded uppercase outline-none focus:border-brand-gold/50"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                Card Number
              </label>
              <input
                type="text"
                required
                maxLength={19}
                placeholder="4242 •••• •••• 4242"
                value={cardForm.cardNumber}
                onChange={(e) => {
                  const val = e.target.value
                    .replace(/\D/g, "")
                    .replace(/(.{4})/g, "$1 ")
                    .trim();
                  setCardForm({ ...cardForm, cardNumber: val });
                }}
                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white font-mono rounded outline-none focus:border-brand-gold/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                Expiration Date (MM/YY)
              </label>
              <input
                type="text"
                required
                maxLength={5}
                placeholder="12/28"
                value={cardForm.expiry}
                onChange={(e) =>
                  setCardForm({ ...cardForm, expiry: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white font-mono rounded outline-none focus:border-brand-gold/50"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                Security Code (CVV)
              </label>
              <input
                type="password"
                required
                maxLength={4}
                placeholder="•••"
                value={cardForm.cvv}
                onChange={(e) =>
                  setCardForm({ ...cardForm, cvv: e.target.value })
                }
                className="w-full bg-zinc-900 border border-zinc-800 px-3 py-2 text-white font-mono rounded outline-none focus:border-brand-gold/50"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <input
              type="checkbox"
              id="isDefaultCard"
              checked={cardForm.isDefault}
              onChange={(e) =>
                setCardForm({ ...cardForm, isDefault: e.target.checked })
              }
              className="accent-brand-gold"
            />
            <label
              htmlFor="isDefaultCard"
              className="text-xs text-zinc-300 font-light cursor-pointer"
            >
              Set as default payment card
            </label>
          </div>

          <div className="pt-3 border-t border-zinc-900 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowCardForm(false)}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white uppercase font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-goldHover text-brand-black px-6 py-2 text-xs font-bold tracking-widest rounded uppercase transition-colors"
            >
              Save Card
            </button>
          </div>
        </form>
      )}

      {/* Cards List or Zero State */}
      {paymentCards.length === 0 ? (
        <div className="border border-dashed border-zinc-900 bg-zinc-950/40 p-12 rounded-lg text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-brand-gold">
            <CreditCard className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-sm uppercase tracking-wider text-white font-bold">
              No Payment Methods In Atelier Vault
            </h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Your payment vault is empty. Store an encrypted credit or debit card for expedited high-jewelry checkout.
            </p>
          </div>
          <button
            onClick={() => setShowCardForm(true)}
            className="inline-flex items-center space-x-2 bg-brand-gold hover:bg-brand-goldHover text-brand-black px-5 py-2 text-xs font-bold tracking-widest rounded uppercase transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add First Card</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
          {paymentCards.map((card) => (
            <div
              key={card.id}
              className={`border p-6 rounded-lg bg-zinc-950/60 relative space-y-4 transition-all w-full ${
                card.isDefault
                  ? "border-brand-gold/40 shadow-[0_0_15px_rgba(197,168,128,0.08)]"
                  : "border-zinc-900 hover:border-zinc-800"
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold tracking-widest text-brand-gold uppercase px-2 py-0.5 rounded bg-brand-burgundy/15 border border-brand-gold/20">
                    {card.brand}
                  </span>
                  {card.isDefault && (
                    <span className="text-[9px] font-bold tracking-widest text-emerald-400 uppercase">
                      &middot; Default
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onDeleteCard(card.id!)}
                  className="text-zinc-600 hover:text-red-400"
                  title="Delete card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-1 font-mono">
                <span className="text-sm text-white tracking-widest block">
                  {card.cardNumber}
                </span>
                <div className="flex justify-between items-center text-[11px] text-zinc-500 pt-1 font-sans">
                  <span className="uppercase">{card.cardHolder}</span>
                  <span>Exp: {card.expiry}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

