import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Mail, Shield, Loader2 } from "lucide-react";
import { NewsletterService } from "../../services/newsletter.service";

const InstagramIcon = () => (
  <svg
    className="w-[18px] h-[18px]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    className="w-[18px] h-[18px]"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const featuredBrands = [
  { id: "1", name: "Saint Laurent", slug: "saint-laurent" },
  { id: "2", name: "Balmain", slug: "balmain" },
  { id: "3", name: "Bottega Veneta", slug: "bottega-veneta" },
  { id: "4", name: "Valentino", slug: "valentino" },
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await NewsletterService.subscribe(email.trim());
      setStatusMessage(res.message || "THANK YOU FOR SUBSCRIBING.");
      setSubscribed(true);
      setEmail("");
      setTimeout(() => {
        setSubscribed(false);
        setStatusMessage("");
      }, 7000);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          "Subscription failed. Please check your email.",
      );
      setTimeout(() => setErrorMessage(""), 4000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="bg-brand-black border-t border-zinc-900 pt-16 pb-8 px-6 md:px-12 text-zinc-400">
      <div className=" mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
        {/* Brand Col */}
        <div className="space-y-4">
          <Link
            to="/"
            className="font-serif text-2xl tracking-[0.2em] text-white hover:text-brand-gold transition-colors duration-300 block"
          >
            AUREVILUX
          </Link>
          <p className="text-xs leading-relaxed text-zinc-500 font-light">
            Crafting confidence and contemporary elegance. Sourcing the finest
            silhouettes and bespoke designs for the refined modern wardrobe.
          </p>
          <div className="flex space-x-4 pt-2">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-brand-gold transition-colors duration-200"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="text-zinc-500 hover:text-brand-gold transition-colors duration-200"
              aria-label="Facebook"
            >
              <FacebookIcon />
            </a>
            <a
              href="mailto:concierge@aurevilux.com"
              className="text-zinc-500 hover:text-brand-gold transition-colors duration-200"
              aria-label="Email"
            >
              <Mail className="w-[18px] h-[18px]" />
            </a>
          </div>
        </div>

        {/* Collections */}
        <div>
          <h4 className="text-white text-xs font-semibold tracking-[0.15em] mb-4 uppercase">
            COLLECTIONS
          </h4>
          <ul className="space-y-2 text-xs font-light">
            <li>
              <Link
                to="/shop?category=evening-gowns"
                className="hover:text-brand-gold transition-colors"
              >
                Evening Wear
              </Link>
            </li>
            <li>
              <Link
                to="/shop?category=haute-couture"
                className="hover:text-brand-gold transition-colors"
              >
                Haute Couture
              </Link>
            </li>
            <li>
              <Link
                to="/shop?category=leather-goods"
                className="hover:text-brand-gold transition-colors"
              >
                Leather &amp; Accessories
              </Link>
            </li>
            <li>
              <Link
                to="/shop"
                className="hover:text-brand-gold transition-colors"
              >
                Autumn / Winter Edit
              </Link>
            </li>
          </ul>
        </div>

        {/* Featured Brands */}
        <div>
          <h4 className="text-white text-xs font-semibold tracking-[0.15em] mb-4 uppercase">
            ATELIER HOUSES
          </h4>
          <ul className="space-y-2 text-xs font-light">
            {featuredBrands.map((b) => (
              <li key={b.id}>
                <Link
                  to={`/brands/${b.slug}`}
                  className="hover:text-brand-gold transition-colors"
                >
                  {b.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                to="/brands"
                className="text-brand-gold/80 hover:text-brand-gold transition-colors text-[11px] uppercase font-bold tracking-wider pt-1 block"
              >
                View All Maisons &rarr;
              </Link>
            </li>
          </ul>
        </div>

        {/* Client Concierge */}
        <div>
          <h4 className="text-white text-xs font-semibold tracking-[0.15em] mb-4 uppercase">
            CLIENT CONCIERGE
          </h4>
          <ul className="space-y-2 text-xs font-light">
            <li>
              <Link
                to="/about"
                className="hover:text-brand-gold transition-colors"
              >
                Private Client Services
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-brand-gold transition-colors"
              >
                Atelier Appointments
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="hover:text-brand-gold transition-colors"
              >
                Complimentary Delivery
              </Link>
            </li>
            <li>
              <Link
                to="/about"
                className="hover:text-brand-gold transition-colors"
              >
                Brand Heritage
              </Link>
            </li>
          </ul>
        </div>

        {/* Membership Signup */}
        <div>
          <h4 className="text-white text-xs font-semibold tracking-[0.15em] mb-4 uppercase">
            MEMBERSHIP
          </h4>
          <p className="text-xs leading-relaxed text-zinc-500 mb-4 font-light">
            Become a private member. Receive early access to private trunk
            shows, lookbooks, and invitation-only seasonal releases.
          </p>
          {subscribed ? (
            <div className="text-[10px] text-brand-gold tracking-widest font-semibold bg-brand-dark/90 border border-brand-gold/40 px-3 py-2.5 rounded animate-scale-in leading-relaxed">
              {statusMessage || "THANK YOU FOR SUBSCRIBING."}
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="relative flex border-b border-zinc-800 pb-1.5 focus-within:border-brand-gold transition-colors"
            >
              <input
                type="email"
                placeholder="ENTER YOUR EMAIL"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="bg-transparent text-xs w-full outline-none text-white tracking-widest font-light placeholder-zinc-600 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading}
                aria-label="Subscribe"
                className="text-zinc-500 hover:text-brand-gold transition-colors pl-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>
            </form>
          )}
          {errorMessage && (
            <p className="text-[10px] text-red-400 mt-2 tracking-wider font-light">
              {errorMessage}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center text-[10px] tracking-widest text-zinc-600 font-light space-y-4 md:space-y-0">
        <div>
          &copy; {new Date().getFullYear()} AUREVILUX. ALL RIGHTS RESERVED.
        </div>
        <div className="flex items-center space-x-6 text-[10px] uppercase tracking-wider text-zinc-400">
          <Link to="/about" className="hover:text-brand-gold transition-colors">
            About Atelier
          </Link>
          <Link to="/terms" className="hover:text-brand-gold transition-colors">
            Terms &amp; Conditions
          </Link>
          <Link
            to="/privacy"
            className="hover:text-brand-gold transition-colors"
          >
            Privacy Covenant
          </Link>
        </div>
        <div className="flex items-center space-x-2 text-[9px] tracking-wider text-zinc-500">
          <Shield className="w-3.5 h-3.5 text-zinc-600" />
          <span>BESPOKE CLIENT PRIVACY &amp; ENCRYPTED CONCIERGE</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
