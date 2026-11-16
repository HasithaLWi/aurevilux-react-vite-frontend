import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Loader2 } from "lucide-react";
import { BusinessService } from "../services/business.service";

export const PrivacyPolicyPage: React.FC = () => {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    BusinessService.getBusinessInfo()
      .then((data) => {
        setContent(data.privacyPolicy || "");
      })
      .catch((e) => console.warn("Privacy fetch note:", e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-brand-black text-white pt-28 pb-20 px-6 sm:px-12 max-w-4xl mx-auto text-left">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-brand-gold transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Boutique</span>
      </Link>

      <div className="space-y-3 border-b border-zinc-900 pb-8 mb-10">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-brand-gold" />
          <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-bold">
            CONFIDENTIALITY ACCORD
          </span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl uppercase tracking-wider text-white font-bold">
          Patron Privacy Policy
        </h1>
        <p className="text-xs text-zinc-400 uppercase tracking-widest font-mono">
          Aurevilux Haute Couture &bull; Encrypted Dossier Safeguard
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
          <Loader2 className="w-6 h-6 animate-spin text-brand-gold mb-2" />
          <span className="text-xs uppercase tracking-wider font-mono">Loading privacy covenant...</span>
        </div>
      ) : (
        <div className="prose prose-invert max-w-none text-zinc-300 text-xs sm:text-sm leading-relaxed space-y-6 font-light whitespace-pre-line">
          {content}
        </div>
      )}
    </div>
  );
};

export default PrivacyPolicyPage;
