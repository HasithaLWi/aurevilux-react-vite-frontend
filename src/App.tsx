import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate,
} from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppContextProvider } from "./context/AppContext";
import { LuxuryAlertProvider } from "./context/LuxuryAlertContext";
import NavBar from "./components/navbar/NavBar";
import Home from "./components/home/Home";
import Shop from "./components/shop/Shop";
import Footer from "./components/footer/Footer";

// Storefront & Client Subpages
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Wishlist from "./pages/Wishlist";
import Brands from "./pages/Brands";
import BrandDetail from "./pages/BrandDetail";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Unsubscribe from "./pages/Unsubscribe";
import TermsPage from "./pages/TermsPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import AboutPage from "./pages/AboutPage";

// Dedicated Portals (Isolated Layouts)
import Account from "./pages/Account";
import Admin from "./pages/Admin";

import { AuthService } from "./services/auth.service";

// ─── Route Guard ──────────────────────────────────────────────────────────────
const ProtectedRoute: React.FC<{
  allowedRoles?: string[];
  children: React.ReactNode;
}> = ({ allowedRoles, children }) => {
  const user = AuthService.getStoredUser();

  if (!user || !AuthService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRoles: string[] = user.roles || [];
    const hasRole = allowedRoles.some((r) => userRoles.includes(r));
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

import { EleanoreConcierge } from "./components/chat/EleanoreConcierge";

// Standard Storefront Layout with Luxury Header and Footer
const StorefrontLayout = () => {
  return (
    <div className="min-h-screen bg-brand-black text-zinc-100 flex flex-col selection:bg-brand-burgundy selection:text-white">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      {/* Éléanore AI Concierge — Storefront Only (never rendered on /admin) */}
      <EleanoreConcierge />
    </div>
  );
};

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "997178440277-12np226o5k54cvq6ie9ajvs5ql90e171.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LuxuryAlertProvider>
        <AppContextProvider>
          <Router>
            <Routes>
              {/* Consumer Storefront Routes */}
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route path="/checkout/success" element={<CheckoutSuccess />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/brands" element={<Brands />} />
                <Route path="/brands/:id" element={<BrandDetail />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/register"
                  element={<Login initialTab="register" />}
                />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPolicyPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Route>

              {/* Dedicated Customer Dashboard Portal */}
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Account />
                  </ProtectedRoute>
                }
              />

              {/* Dedicated Admin Portal (SUPERADMIN, ADMIN, STAFF only) */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute
                    allowedRoles={["SUPERADMIN", "ADMIN", "STAFF"]}
                  >
                    <Admin />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </AppContextProvider>
      </LuxuryAlertProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
