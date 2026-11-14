import React, { useState } from "react";
import { Save, CheckCircle } from "lucide-react";

export const SettingsTab: React.FC = () => {
  const [atelierName, setAtelierName] = useState("Aurevilux Haute Couture");
  const [conciergeEmail, setConciergeEmail] = useState("concierge@aurevilux.com");
  const [currency, setCurrency] = useState("USD ($)");
  const [freeShippingMin, setFreeShippingMin] = useState(2500);
  const [emailNotifyOrders, setEmailNotifyOrders] = useState(true);
  const [emailNotifyInventory, setEmailNotifyInventory] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6 w-full text-left max-w-4xl">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5">
        <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
          BACKOFFICE CONFIGURATION
        </span>
        <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
          Boutique & Atelier Parameters
        </h1>
      </div>

      {saved && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded flex items-center gap-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>Atelier configuration parameters successfully updated!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: General Atelier Identity */}
        <div className="bg-[#101014] border border-zinc-900 rounded-lg p-5 space-y-4">
          <h3 className="font-serif text-sm text-white uppercase tracking-wider font-semibold border-b border-zinc-900 pb-2">
            Maison Identity & Concierge
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                Atelier Brand Name
              </label>
              <input
                type="text"
                value={atelierName}
                onChange={(e) => setAtelierName(e.target.value)}
                className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
              />
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                Concierge Support Email
              </label>
              <input
                type="email"
                value={conciergeEmail}
                onChange={(e) => setConciergeEmail(e.target.value)}
                className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Commerce & Pricing Parameters */}
        <div className="bg-[#101014] border border-zinc-900 rounded-lg p-5 space-y-4">
          <h3 className="font-serif text-sm text-white uppercase tracking-wider font-semibold border-b border-zinc-900 pb-2">
            Pricing & Courier Thresholds
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                Operational Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none uppercase"
              >
                <option value="USD ($)">USD ($) - United States Dollar</option>
                <option value="EUR (€)">EUR (€) - Eurozone</option>
                <option value="GBP (£)">GBP (£) - British Pound</option>
                <option value="CHF (CHF)">CHF (CHF) - Swiss Franc</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                Complimentary White-Glove Shipping Minimum ($)
              </label>
              <input
                type="number"
                min="0"
                value={freeShippingMin}
                onChange={(e) => setFreeShippingMin(Number(e.target.value))}
                className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Notification Toggles */}
        <div className="bg-[#101014] border border-zinc-900 rounded-lg p-5 space-y-3">
          <h3 className="font-serif text-sm text-white uppercase tracking-wider font-semibold border-b border-zinc-900 pb-2">
            Automated Transmissions
          </h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifyOrders}
                onChange={(e) => setEmailNotifyOrders(e.target.checked)}
                className="rounded bg-brand-black border-zinc-800 text-brand-burgundy focus:ring-0"
              />
              <span className="text-xs text-zinc-300">
                Dispatch instant email alert when high-value order is submitted
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifyInventory}
                onChange={(e) => setEmailNotifyInventory(e.target.checked)}
                className="rounded bg-brand-black border-zinc-800 text-brand-burgundy focus:ring-0"
              />
              <span className="text-xs text-zinc-300">
                Notify inventory managers when stock reaches critical threshold (&le; 5 units)
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-6 py-2.5 rounded text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Atelier Parameters</span>
          </button>
        </div>
      </form>
    </div>
  );
};
