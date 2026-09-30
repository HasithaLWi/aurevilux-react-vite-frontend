import { useState } from "react";
import { Menu, Search, ShoppingBag, X, ArrowRight } from "lucide-react";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { name: "HOME", href: "#" },
    { name: "COLLECTION", href: "#collections" },
    { name: "LOOKBOOK", href: "#lookbook" },
    { name: "HERITAGE", href: "#about" },
    { name: "CONCIERGE", href: "#contact" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      alert(`Searching for: ${searchQuery.trim()}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      {/* Main Luxury Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass h-[80px] flex items-center px-6 md:px-12 justify-between">
        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(true)}
          className="md:hidden text-zinc-300 hover:text-white focus:outline-none p-1"
          aria-label="Open navigation menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Brand Logo */}
        <a
          href="#"
          className="font-serif text-2xl md:text-3xl tracking-[0.25em] text-white hover:text-brand-gold transition-colors duration-300"
        >
          AUREVILUX
        </a>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-medium tracking-[0.2em]">
          {navLinks.map((link, idx) => (
            <a
              key={link.name}
              href={link.href}
              className={
                idx === 0
                  ? "text-brand-gold border-b border-brand-gold pb-1 transition-colors"
                  : "text-zinc-300 hover:text-brand-gold transition-colors duration-200 pb-1"
              }
            >
              {link.name}
            </a>
          ))}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-5 md:space-x-7">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 text-zinc-300 hover:text-brand-gold transition-colors duration-200"
            aria-label="Search"
          >
            <span className="hidden lg:inline text-[10px] tracking-[0.2em] font-medium">SEARCH</span>
            <Search className="w-[18px] h-[18px]" />
          </button>

          {/* Cart / Bag Icon */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative text-zinc-300 hover:text-brand-gold transition-colors duration-200 flex items-center"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-[18px] h-[18px]" />
            <span className="absolute -top-1.5 -right-2 bg-brand-burgundy text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center font-bold">
              0
            </span>
          </button>

          {/* Client Concierge CTA Button */}
          <a
            href="#contact"
            className="hidden sm:inline-block border border-zinc-800 hover:border-brand-gold text-[10px] tracking-[0.2em] px-4 py-2 text-zinc-300 hover:text-white rounded transition-all duration-300"
          >
            CONCIERGE
          </a>
        </div>
      </header>

      {/* Cart Slide-over Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div className="w-screen max-w-md bg-brand-dark border-l border-zinc-800 flex flex-col justify-between p-6 animate-slide-in-right">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
                <h2 className="font-serif text-lg tracking-[0.15em] text-white">PRIVATE SELECTION</h2>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Empty State */}
              <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-4 py-8">
                <div className="w-16 h-16 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
                  <ShoppingBag className="w-8 h-8 text-zinc-600 stroke-[1.2]" />
                </div>
                <h3 className="font-serif text-base tracking-widest text-white">YOUR BAG IS EMPTY</h3>
                <p className="text-xs text-zinc-500 font-light max-w-xs leading-relaxed">
                  Items selected from our private couture runway and atelier will appear here.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="btn-luxury inline-flex items-center space-x-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-6 py-3 rounded text-xs font-semibold tracking-[0.2em] transition-all"
                >
                  <span>EXPLORE COLLECTION</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Drawer Footer */}
              <div className="pt-6 border-t border-zinc-800 text-center">
                <p className="text-[10px] text-zinc-600 tracking-widest uppercase">
                  COMPLIMENTARY WHITE-GLOVE PACKAGING &amp; WORLDWIDE SHIPPING
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Search Drawer Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsSearchOpen(false)}
            className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
          />

          <div className="absolute top-0 left-0 right-0 bg-brand-dark border-b border-zinc-800 py-10 px-6 md:px-12 animate-fade-in">
            <div className="max-w-3xl mx-auto flex flex-col space-y-5">
              <div className="flex justify-between items-center">
                <span className="text-xs tracking-[0.25em] text-brand-gold font-medium uppercase">
                  SEARCH AUREVILUX ATELIER
                </span>
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  type="text"
                  placeholder="WHAT ARE YOU LOOKING FOR?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-b border-zinc-700 focus:border-brand-gold py-4 text-lg md:text-xl font-serif uppercase tracking-widest text-white outline-none placeholder-zinc-600 transition-colors"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-0 p-2 text-zinc-400 hover:text-brand-gold transition-colors"
                  aria-label="Submit search"
                >
                  <Search className="w-6 h-6" />
                </button>
              </form>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] text-zinc-500 tracking-widest">
                <span className="text-zinc-400">TRENDING:</span>
                <a href="#collections" onClick={() => setIsSearchOpen(false)} className="hover:text-brand-gold transition-colors">EVENING SILK GOWNS</a>
                <a href="#collections" onClick={() => setIsSearchOpen(false)} className="hover:text-brand-gold transition-colors">VELVET LUNA</a>
                <a href="#collections" onClick={() => setIsSearchOpen(false)} className="hover:text-brand-gold transition-colors">TAILORED CAPES</a>
                <a href="#collections" onClick={() => setIsSearchOpen(false)} className="hover:text-brand-gold transition-colors">HAUTE COUTURE</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden md:hidden">
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          <div className="absolute inset-y-0 left-0 max-w-full flex">
            <div className="w-screen max-w-xs bg-brand-dark border-r border-zinc-800 flex flex-col justify-between p-6 animate-slide-in-right">
              <div>
                <div className="flex justify-between items-center pb-6 border-b border-zinc-900">
                  <span className="font-serif tracking-[0.25em] text-lg text-white">AUREVILUX</span>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-zinc-400 hover:text-white transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex flex-col space-y-6 pt-8 text-xs tracking-[0.2em] font-medium">
                  {navLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-zinc-300 hover:text-brand-gold transition-colors"
                    >
                      {link.name}
                    </a>
                  ))}
                  <a
                    href="#contact"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-brand-gold pt-4 border-t border-zinc-900"
                  >
                    CLIENT CONCIERGE &rarr;
                  </a>
                </nav>
              </div>

              <div className="border-t border-zinc-900 pt-6">
                <p className="text-[9px] text-zinc-500 tracking-widest uppercase mb-1">BOUTIQUE CURRENCY</p>
                <div className="text-xs font-semibold text-white tracking-widest">USD ($) &middot; GLOBAL</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;