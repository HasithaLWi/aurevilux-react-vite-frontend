import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  ShoppingBag,
  X,
  ArrowRight,
  User,
  LogOut,
  Trash2,
  Heart,
  ShieldCheck,
} from "lucide-react";
import { useApp } from "../../context/AppContext";
import { AuthService } from "../../services/auth.service";
import AuthModal from "../auth/AuthModal";
import { gsap, useGSAP, motionTokens } from "../../animations";

const NavBar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { cart, cartCount, cartTotal, removeFromCart, updateCartQuantity } =
    useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    username: string;
    roles: string[];
    name?: string;
    avatarUrl?: string;
  } | null>(null);

  const cartDrawerRef = useRef<HTMLDivElement>(null);
  const searchOverlayRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Cart Drawer Animation
  useGSAP(
    () => {
      if (
        !isCartOpen ||
        window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches
      )
        return;

      const tl = gsap.timeline({
        defaults: { ease: motionTokens.ease.editorial },
      });
      tl.fromTo(
        "[data-cart-backdrop]",
        { opacity: 0 },
        {
          opacity: 1,
          duration: motionTokens.duration.fast,
          ease: motionTokens.ease.smooth,
        },
      )
        .fromTo(
          "[data-cart-panel]",
          { xPercent: 100 },
          {
            xPercent: 0,
            duration: motionTokens.duration.standard,
            ease: motionTokens.ease.editorial,
          },
          0,
        )
        .fromTo(
          "[data-cart-item]",
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: motionTokens.duration.fast,
            stagger: motionTokens.stagger.tight,
          },
          "-=0.15",
        );
    },
    { scope: cartDrawerRef, dependencies: [isCartOpen] },
  );

  // Search Overlay Animation
  useGSAP(
    () => {
      if (
        !isSearchOpen ||
        window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches
      )
        return;

      const tl = gsap.timeline({
        defaults: { ease: motionTokens.ease.editorial },
      });
      tl.fromTo(
        "[data-search-backdrop]",
        { opacity: 0 },
        {
          opacity: 1,
          duration: motionTokens.duration.fast,
          ease: motionTokens.ease.smooth,
        },
      ).fromTo(
        "[data-search-panel]",
        { y: -30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: motionTokens.duration.standard,
          ease: motionTokens.ease.editorial,
        },
        0,
      );
    },
    { scope: searchOverlayRef, dependencies: [isSearchOpen] },
  );

  // Mobile Menu Drawer Animation
  useGSAP(
    () => {
      if (
        !isMobileMenuOpen ||
        window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches
      )
        return;

      const tl = gsap.timeline({
        defaults: { ease: motionTokens.ease.editorial },
      });
      tl.fromTo(
        "[data-mobile-backdrop]",
        { opacity: 0 },
        {
          opacity: 1,
          duration: motionTokens.duration.fast,
          ease: motionTokens.ease.smooth,
        },
      ).fromTo(
        "[data-mobile-panel]",
        { xPercent: -100 },
        {
          xPercent: 0,
          duration: motionTokens.duration.standard,
          ease: motionTokens.ease.editorial,
        },
        0,
      );
    },
    { scope: mobileMenuRef, dependencies: [isMobileMenuOpen] },
  );

  // Sync auth state
  useEffect(() => {
    const syncUser = () => {
      const user = AuthService.getStoredUser();
      setCurrentUser(user || null);
    };
    syncUser();
    window.addEventListener("storage", syncUser);
    return () => window.removeEventListener("storage", syncUser);
  }, []);

  const handleAuthSuccess = () => {
    const user = AuthService.getStoredUser();
    setCurrentUser(user);
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
  };

  const navLinks = [
    { name: "HOME", href: "/" },
    { name: "SHOP", href: "/shop" },
    { name: "BRANDS", href: "/brands" },
    { name: "ABOUT", href: "/about" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
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
        <Link
          to="/"
          className="font-serif text-2xl md:text-xl lg:text-3xl tracking-[0.25em] text-white hover:text-brand-gold transition-colors duration-300"
        >
          AUREVILUX
        </Link>

        {/* Desktop Navigation Menu */}
        <nav className="hidden md:flex items-center space-x-5 lg:space-x-8 text-xs font-medium tracking-[0.2em]">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <Link
                key={link.name}
                to={link.href}
                className={
                  isActive
                    ? "text-brand-gold border-b border-brand-gold pb-1 transition-colors"
                    : "text-zinc-300 hover:text-brand-gold transition-colors duration-200 pb-1"
                }
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Icons */}
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Search Trigger */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center space-x-2 text-zinc-300 hover:text-brand-gold transition-colors duration-200"
            aria-label="Search"
          >
            <span className="hidden xl:inline text-[10px] tracking-[0.2em] font-medium">
              SEARCH
            </span>
            <Search className="w-[18px] h-[18px]" />
          </button>

          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className="text-zinc-300 hover:text-brand-gold transition-colors duration-200 hidden sm:flex items-center"
            aria-label="Wishlist"
          >
            <Heart className="w-[18px] h-[18px]" />
          </Link>

          {/* Staff Management Direct Portal Link */}
          {currentUser &&
            currentUser.roles?.some((r) =>
              ["SUPERADMIN", "SUPER_ADMIN", "ADMIN", "STAFF"].includes(r),
            ) && (
              <Link
                to="/admin"
                className="hidden xl:flex items-center space-x-1 px-3 py-1 bg-brand-gold/15 border border-brand-gold/40 text-brand-gold rounded hover:bg-brand-gold/25 transition-colors text-[10px] tracking-widest font-semibold uppercase"
                title="Atelier Management Console"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-brand-gold" />
                <span>MANAGEMENT</span>
              </Link>
            )}

          {/* User Sign In / Profile Button (Always navigates to /account) */}
          {currentUser ? (
            <div className="flex items-center space-x-2 bg-brand-dark/60 border border-zinc-800 px-3 py-1.5 rounded">
              <Link
                to="/account"
                className="flex items-center space-x-1.5 hover:text-brand-gold transition-colors"
                title="Client Suite & Account"
              >
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name || currentUser.username}
                    className="w-4 h-4 rounded-full object-cover border border-brand-gold/40"
                  />
                ) : (
                  <User className="w-3.5 h-3.5 text-brand-gold" />
                )}
                <span className="text-[10px] tracking-widest text-white uppercase font-semibold hidden xl:inline">
                  {currentUser.name
                    ? currentUser.name.split(" ")[0]
                    : currentUser.username}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-zinc-500 hover:text-red-400 pl-1 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1.5 text-zinc-300 hover:text-brand-gold transition-colors duration-200 text-[10px] tracking-[0.2em] font-medium"
            >
              <User className="w-[18px] h-[18px]" />
              <span className="hidden sm:inline">SIGN IN</span>
            </Link>
          )}

          {/* Cart / Bag Link - Direct navigation to full-page shopping cart */}
          <Link
            to="/cart"
            className="relative text-zinc-300 hover:text-brand-gold transition-colors duration-200 flex items-center"
            aria-label="Shopping Bag"
          >
            <ShoppingBag className="w-[18px] h-[18px]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-brand-burgundy text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Cart Slide-over Drawer */}
      {isCartOpen && (
        <div ref={cartDrawerRef} className="fixed inset-0 z-50 overflow-hidden">
          <div
            data-cart-backdrop
            onClick={() => setIsCartOpen(false)}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            <div
              data-cart-panel
              className="w-screen max-w-md bg-brand-dark border-l border-zinc-800 flex flex-col justify-between p-6 gpu-accelerated"
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
                <div>
                  <h2 className="font-serif text-lg tracking-[0.15em] text-white">
                    PRIVATE SELECTION
                  </h2>
                  <span className="text-[10px] text-zinc-500 tracking-widest uppercase">
                    {cartCount} ITEMS IN BAG
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Cart Items List */}
              {cart.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 px-4 py-8">
                  <div className="w-16 h-16 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-zinc-600 stroke-[1.2]" />
                  </div>
                  <h3 className="font-serif text-base tracking-widest text-white">
                    YOUR BAG IS EMPTY
                  </h3>
                  <p className="text-xs text-zinc-500 font-light max-w-xs leading-relaxed">
                    Items selected from our private couture runway and atelier
                    will appear here.
                  </p>
                  <Link
                    to="/shop"
                    onClick={() => setIsCartOpen(false)}
                    className="btn-luxury inline-flex items-center space-x-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-6 py-3 rounded text-xs font-semibold tracking-[0.2em] transition-all"
                  >
                    <span>EXPLORE COLLECTION</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto py-4 space-y-4">
                  {cart.map((item, idx) => (
                    <div
                      key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}-${idx}`}
                      data-cart-item
                      className="flex space-x-4 p-3 bg-brand-black/50 border border-zinc-800/80 rounded"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-16 h-20 object-cover rounded bg-zinc-900"
                      />
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-xs font-serif text-white tracking-wider">
                            {item.product.name}
                          </h4>
                          <span className="text-[10px] text-zinc-500 block">
                            {item.selectedColor} &bull; {item.selectedSize}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                updateCartQuantity(
                                  item.product.id,
                                  item.selectedColor,
                                  item.selectedSize,
                                  item.quantity - 1,
                                )
                              }
                              className="text-zinc-400 hover:text-white px-1 text-xs"
                            >
                              -
                            </button>
                            <span className="text-xs text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateCartQuantity(
                                  item.product.id,
                                  item.selectedColor,
                                  item.selectedSize,
                                  item.quantity + 1,
                                )
                              }
                              className="text-zinc-400 hover:text-white px-1 text-xs"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-brand-gold font-semibold">
                              $
                              {(
                                item.product.price * item.quantity
                              ).toLocaleString()}
                            </span>
                            <button
                              onClick={() =>
                                removeFromCart(
                                  item.product.id,
                                  item.selectedColor,
                                  item.selectedSize,
                                )
                              }
                              className="text-zinc-600 hover:text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="pt-6 border-t border-zinc-800 space-y-3">
                  <div className="flex justify-between text-xs tracking-widest">
                    <span className="text-zinc-400 uppercase">SUBTOTAL</span>
                    <span className="text-brand-gold font-serif font-bold text-sm">
                      ${cartTotal.toLocaleString()}
                    </span>
                  </div>
                  <Link
                    to="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full block text-center bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3 rounded text-xs font-bold tracking-[0.2em] transition-all uppercase shadow-lg shadow-brand-burgundy/15"
                  >
                    VIEW BAG &amp; CHECKOUT
                  </Link>
                  <Link
                    to="/shop"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full block text-center border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white py-2.5 rounded text-[10px] font-semibold tracking-[0.2em] transition-all uppercase"
                  >
                    CONTINUE BROWSING
                  </Link>
                  <p className="text-[9px] text-zinc-600 text-center tracking-widest uppercase">
                    COMPLIMENTARY WHITE-GLOVE PACKAGING &amp; WORLDWIDE SHIPPING
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Search Drawer Overlay */}
      {isSearchOpen && (
        <div
          ref={searchOverlayRef}
          className="fixed inset-0 z-50 overflow-hidden"
        >
          <div
            data-search-backdrop
            onClick={() => setIsSearchOpen(false)}
            className="absolute inset-0 bg-black/85 backdrop-blur-md transition-opacity"
          />

          <div
            data-search-panel
            className="absolute top-0 left-0 right-0 bg-brand-dark border-b border-zinc-800 py-10 px-6 md:px-12 gpu-accelerated"
          >
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

              <form
                onSubmit={handleSearchSubmit}
                className="relative flex items-center"
              >
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
            </div>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="fixed inset-0 z-50 overflow-hidden md:hidden"
        >
          <div
            data-mobile-backdrop
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          />

          <div className="absolute inset-y-0 left-0 max-w-full flex">
            <div
              data-mobile-panel
              className="w-screen max-w-xs bg-brand-dark border-r border-zinc-800 flex flex-col justify-between p-6 gpu-accelerated"
            >
              <div>
                <div className="flex justify-between items-center pb-6 border-b border-zinc-900">
                  <span className="font-serif tracking-[0.25em] text-lg text-white">
                    AUREVILUX
                  </span>
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
                    <Link
                      key={link.name}
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-zinc-300 hover:text-brand-gold transition-colors"
                    >
                      {link.name}
                    </Link>
                  ))}
                  {currentUser ? (
                    <div className="space-y-3 pt-4 border-t border-zinc-900">
                      <Link
                        to="/account"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-brand-gold flex items-center space-x-2 text-xs"
                      >
                        {currentUser.avatarUrl ? (
                          <img
                            src={currentUser.avatarUrl}
                            alt={currentUser.name || currentUser.username}
                            className="w-4 h-4 rounded-full object-cover border border-brand-gold/40"
                          />
                        ) : (
                          <User className="w-4 h-4 text-brand-gold" />
                        )}
                        <span>
                          ACCOUNT:{" "}
                          {(
                            currentUser.name || currentUser.username
                          ).toUpperCase()}
                        </span>
                      </Link>
                      {currentUser.roles?.some((r) =>
                        [
                          "SUPERADMIN",
                          "SUPER_ADMIN",
                          "ADMIN",
                          "STAFF",
                        ].includes(r),
                      ) && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="text-brand-gold/80 flex items-center space-x-2 text-[11px]"
                        >
                          <ShieldCheck className="w-4 h-4 text-brand-gold" />
                          <span>ATELIER MANAGEMENT CONSOLE &rarr;</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          handleLogout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-zinc-500 hover:text-red-400 text-left block text-[11px]"
                      >
                        SIGN OUT
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="text-left text-brand-gold pt-4 border-t border-zinc-900 flex items-center space-x-1"
                    >
                      <User className="w-3.5 h-3.5" />
                      <span>CLIENT &amp; ATELIER SIGN IN &rarr;</span>
                    </Link>
                  )}
                </nav>
              </div>

              <div className="border-t border-zinc-900 pt-6">
                <p className="text-[9px] text-zinc-500 tracking-widest uppercase mb-1">
                  BOUTIQUE CURRENCY
                </p>
                <div className="text-xs font-semibold text-white tracking-widest">
                  USD ($) &middot; GLOBAL
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NavBar;
