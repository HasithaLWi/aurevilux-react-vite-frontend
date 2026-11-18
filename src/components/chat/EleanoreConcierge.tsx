import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Minus,
  Loader2,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import {
  ConciergeService,
  type ChatMessage,
  type ConciergeStatusResponse,
} from "../../services/concierge.service";

const LOGO_SRC = "/logo/eleanore-logo.png";
const LOGO_FALLBACK = "/logo/Éléanore/Éléanore Luxury Assistant Logo.png";

const SUGGESTIONS = [
  "Curate an evening look",
  "Cashmere care tips",
  "Shipping & white-glove delivery",
  "Bespoke sizing guide",
];

/**
 * Formats message text into clean, elegant typography without raw asterisks.
 */
const FormattedMessage: React.FC<{ content: string; isAssistant: boolean }> = ({
  content,
  isAssistant,
}) => {
  if (!isAssistant) {
    return <div className="whitespace-pre-wrap font-sans text-xs">{content}</div>;
  }

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={pIdx} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
        return (
          <span key={pIdx} className="text-brand-gold italic">
            {part.slice(1, -1)}
          </span>
        );
      }
      return part;
    });
  };

  const lines = content.split("\n");

  return (
    <div className="space-y-2 text-xs leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return null;

        const bulletMatch = trimmed.match(/^([\*\-\•]|\d+\.)\s+(.+)$/);
        if (bulletMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 my-1 text-zinc-200">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-gold mt-1.5 shrink-0" />
              <div className="flex-1">{renderInline(bulletMatch[2])}</div>
            </div>
          );
        }

        return (
          <p key={idx} className="text-zinc-200">
            {renderInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};

export const EleanoreConcierge: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTeaser, setShowTeaser] = useState(false);
  const [teaserDismissed, setTeaserDismissed] = useState(false);
  const [status, setStatus] = useState<ConciergeStatusResponse | null>(null);

  // Chat message state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 1. Check if Concierge is enabled by Maison administration
  useEffect(() => {
    let isMounted = true;
    async function checkStatus() {
      try {
        const data = await ConciergeService.getStatus();
        if (isMounted && data) {
          setStatus(data);
          // Set initial greeting
          if (data.welcomeMessage) {
            setMessages([
              {
                role: "assistant",
                content: data.welcomeMessage,
              },
            ]);
          }
        }
      } catch (err) {
        console.error("[Éléanore Frontend] Status probe error:", err);
      }
    }
    checkStatus();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Timed floating teaser on storefront arrival (2s delay)
  useEffect(() => {
    if (isOpen || teaserDismissed) {
      setShowTeaser(false);
      return;
    }

    // Appears 2 seconds after customer lands on storefront
    const showTimer = setTimeout(() => {
      if (!isOpen && !teaserDismissed) {
        setShowTeaser(true);
      }
    }, 2000);

    return () => clearTimeout(showTimer);
  }, [isOpen, teaserDismissed]);

  const handleDismissTeaser = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowTeaser(false);
    setTeaserDismissed(true);
  };

  // Auto-scroll messages to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isSending, isOpen]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const handleOpenChat = () => {
    setIsOpen(true);
    setShowTeaser(false);
  };

  const handleClearChat = () => {
    const welcome =
      status?.welcomeMessage ||
      "Hello. I am Éléanore, your Aurevilux client advisor. How may I assist you today?";
    setMessages([
      {
        role: "assistant",
        content: welcome,
      },
    ]);
    setErrorNotice(null);
  };

  // 3. Send message with strict 5-turn memory window
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isSending) return;

    setInputMessage("");
    setErrorNotice(null);

    // Append user query to UI
    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: query },
    ];
    setMessages(updatedMessages);
    setIsSending(true);

    try {
      // Slices to last 10 messages (5 turns) before calling API
      const historyWindow = messages.slice(-10);
      const res = await ConciergeService.sendMessage(query, historyWindow);

      if (res && res.reply) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: res.reply },
        ]);
      } else {
        throw new Error("Empty reply payload received from concierge service.");
      }
    } catch (err: any) {
      // STRICT NO-FALLBACK: Log technical error in console, never show fake bot message
      console.error("[Éléanore Concierge Error]:", err?.response?.data || err?.message || err);

      setErrorNotice(
        "Éléanore is momentarily unavailable in the salon. For immediate assistance, our atelier team is at your disposal at concierge@aurevilux.com or +33 1 42 68 00 00."
      );
    } finally {
      setIsSending(false);
    }
  };

  // If disabled in admin settings, do not render
  if (status && status.enabled === false) {
    return null;
  }

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. FLOATING ARRIVAL TEASER TOAST (Appears on Customer Storefront Arrival)  */}
      {/* ========================================================================= */}
      {showTeaser && !isOpen && (
        <div className="fixed bottom-24 right-6 z-40 max-w-sm animate-fade-in select-none">
          <div
            onClick={handleOpenChat}
            className="group relative bg-[#101014]/95 backdrop-blur-xl border border-brand-gold/40 hover:border-brand-gold rounded-xl p-4 shadow-[0_15px_40px_rgba(0,0,0,0.85)] cursor-pointer transition-all duration-300 hover:-translate-y-1"
          >
            {/* Dismiss Button */}
            <button
              type="button"
              onClick={handleDismissTeaser}
              aria-label="Dismiss concierge teaser"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 hover:border-brand-gold text-zinc-400 hover:text-white flex items-center justify-center transition-colors shadow-lg cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>

            <div className="flex items-start gap-3.5">
              <div className="relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-brand-gold via-brand-burgundy to-brand-gold/40 shrink-0 shadow-md">
                <img
                  src={LOGO_SRC}
                  alt="Éléanore"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = LOGO_FALLBACK;
                  }}
                  className="w-full h-full object-cover rounded-full"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
              </div>

              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-serif tracking-widest text-brand-gold uppercase font-bold">
                    Éléanore
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase font-mono tracking-wider">
                    • Haute Concierge
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">
                  Hello. I am at your service. Inquire about our latest collections, styling advice, or shipping.
                </p>
                <div className="pt-1 flex items-center gap-1 text-[10px] font-semibold text-brand-gold group-hover:text-white transition-colors uppercase tracking-wider">
                  <span>Consult Éléanore</span>
                  <span>&rarr;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. FLOATING TRIGGER BADGE (Fixed Bottom Right)                             */}
      {/* ========================================================================= */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 select-none">
          <button
            type="button"
            onClick={handleOpenChat}
            aria-label="Open Éléanore Luxury Concierge"
            className="group relative flex items-center justify-center w-17 h-17 rounded-full bg-gradient-to-tr from-brand-black via-[#16161c] to-brand-black border border-brand-gold/60 hover:border-brand-gold shadow-[0_10px_30px_rgba(0,0,0,0.85)] hover:shadow-brand-gold/20 hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            {/* Glowing gold ambient ring */}
            <div className="absolute inset-0 rounded-full bg-brand-gold/10 group-hover:bg-brand-gold/20 blur-sm transition-all" />

            <div className="relative w-14 h-14 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-brand-gold/80 to-brand-gold/20">
              <img
                src={LOGO_SRC}
                alt="Éléanore"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = LOGO_FALLBACK;
                }}
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            {/* Online Green Pulsing Indicator */}
            <span className="absolute top-0 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 ring-2 ring-black" />
            </span>
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. LUXURY CONCIERGE CHAT WINDOW (Storefront Only)                         */}
      {/* ========================================================================= */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[94vw] sm:w-[420px] h-[640px] max-h-[88vh] bg-[#0c0c10]/95 backdrop-blur-2xl border border-brand-gold/40 rounded-2xl shadow-[0_25px_65px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden animate-fade-in select-none">
          {/* Header Strip */}
          <div className="px-5 py-4 border-b border-zinc-900 bg-gradient-to-r from-[#14141a] via-[#101014] to-[#14141a] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-brand-gold via-brand-burgundy to-brand-gold/40 shrink-0 shadow-md">
                <img
                  src={LOGO_SRC}
                  alt="Éléanore Logo"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = LOGO_FALLBACK;
                  }}
                  className="w-full h-full object-cover rounded-full"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-black" />
              </div>

              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-sm text-white tracking-[0.2em] uppercase font-bold">
                    Éléanore
                  </h3>
                  <span className="text-[8px] bg-brand-gold/15 text-brand-gold px-1.5 py-0.5 rounded font-mono uppercase font-bold border border-brand-gold/30">
                    Atelier Concierge
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-light block">
                  12 Place Vendôme, Paris • Online Stylist
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-zinc-400">
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear conversation"
                aria-label="Clear chat conversation"
                className="w-7 h-7 rounded hover:bg-zinc-800/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Minimize Concierge"
                className="w-7 h-7 rounded hover:bg-zinc-800/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Concierge"
                className="w-7 h-7 rounded hover:bg-zinc-800/80 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 text-left">
            {messages.map((msg, idx) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div
                  key={idx}
                  className={`flex gap-3 ${isAssistant ? "justify-start" : "justify-end"
                    }`}
                >
                  {isAssistant && (
                    <div className="w-7 h-7 rounded-full overflow-hidden p-0.5 bg-brand-gold/30 shrink-0 mt-1">
                      <img
                        src={LOGO_SRC}
                        alt="Éléanore"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = LOGO_FALLBACK;
                        }}
                        className="w-full h-full object-cover rounded-full"
                      />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${isAssistant
                      ? "bg-[#141419] border border-zinc-800/90 text-zinc-200 shadow-md"
                      : "bg-brand-burgundy/80 text-white border border-brand-burgundyHover shadow-md"
                      }`}
                  >
                    <FormattedMessage content={msg.content} isAssistant={isAssistant} />
                  </div>
                </div>
              );
            })}

            {/* Thinking / Dispatching Indicator */}
            {isSending && (
              <div className="flex items-center gap-3 justify-start">
                <div className="w-7 h-7 rounded-full overflow-hidden p-0.5 bg-brand-gold/30 shrink-0">
                  <img
                    src={LOGO_SRC}
                    alt="Éléanore"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = LOGO_FALLBACK;
                    }}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="bg-[#141419] border border-zinc-800/90 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-zinc-400 text-xs shadow-md">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold" />
                  <span className="font-serif tracking-widest text-[11px] uppercase text-zinc-300">
                    Éléanore is consulting the salon...
                  </span>
                </div>
              </div>
            )}

            {/* STRICT NO FALLBACK: Dignified Luxury Unavailable Notice */}
            {errorNotice && (
              <div className="p-3.5 rounded-xl bg-red-950/25 border border-red-900/40 text-red-200/90 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-red-400 font-semibold text-[11px] uppercase tracking-wider">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Salon Concierge Notice</span>
                </div>
                <p className="text-[11px] leading-relaxed text-zinc-300">
                  {errorNotice}
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Pills */}
          <div className="px-4 py-2 border-t border-zinc-900/80 bg-[#09090c] flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {SUGGESTIONS.map((sugg, i) => (
              <button
                key={i}
                type="button"
                disabled={isSending}
                onClick={() => handleSendMessage(sugg)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-brand-gold/50 text-[10px] text-zinc-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {sugg}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-zinc-900 bg-[#0c0c10] flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Inquire with Éléanore on pieces, sizing, styling..."
              disabled={isSending}
              className="flex-1 bg-[#141419] border border-zinc-800/80 focus:border-brand-gold/60 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              aria-label="Send message"
              className="w-10 h-10 rounded-xl bg-brand-burgundy hover:bg-brand-burgundyHover disabled:bg-zinc-800 text-white disabled:text-zinc-600 flex items-center justify-center transition-colors shadow-md cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Sub-Caption */}
          <div className="px-4 py-1.5 bg-[#08080a] border-t border-zinc-900/40 text-[9px] text-zinc-500 flex items-center justify-between font-mono">
            <span>AUREVILUX ATELIER CONCIERGE</span>
            <span>5-TURN MEMORY PROTOCOL</span>
          </div>
        </div>
      )}
    </>
  );
};
