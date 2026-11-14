import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppContextProvider } from "./context/AppContext";
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

// Dedicated Portals (Isolated Layouts)
import Account from "./pages/Account";
import Admin from "./pages/Admin";

// Standard Storefront Layout with Luxury Header and Footer
const StorefrontLayout = () => {
  return (
    <div className="min-h-screen bg-brand-black text-zinc-100 flex flex-col selection:bg-brand-burgundy selection:text-white">
      <NavBar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  "997178440277-12np226o5k54cvq6ie9ajvs5ql90e171.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AppContextProvider>
        <Router>
          <Routes>
            {/* Consumer Storefront Routes */}
            <Route element={<StorefrontLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/checkout/success" element={<CheckoutSuccess />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/brands" element={<Brands />} />
              <Route path="/brands/:id" element={<BrandDetail />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Login initialTab="register" />} />
              <Route path="/reset-password" element={<ResetPassword />} />
            </Route>

            {/* Dedicated Customer Dashboard Portal (Separate Layout) */}
            <Route path="/account" element={<Account />} />

            {/* Dedicated Admin Portal (Separate Layout) */}
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Router>
      </AppContextProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
