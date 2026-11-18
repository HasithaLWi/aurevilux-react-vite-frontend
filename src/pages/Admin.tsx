import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, AlertCircle } from "lucide-react";
import {
  AdminSidebar,
  type AdminTabId,
} from "../components/management/AdminSidebar";
import { DashboardTab } from "../components/management/DashboardTab";
import { ProductsTab } from "../components/management/ProductsTab";
import { CategoriesTab } from "../components/management/CategoriesTab";
import { BrandsTab } from "../components/management/BrandsTab";
import { InventoryTab } from "../components/management/InventoryTab";
import { ReviewsTab } from "../components/management/ReviewsTab";
import { OrdersTab } from "../components/management/OrdersTab";
import { CouriersTab } from "../components/management/CouriersTab";
import { CustomersTab } from "../components/management/CustomersTab";
import { NewsletterTab } from "../components/management/NewsletterTab";
import { ReportsTab } from "../components/management/ReportsTab";
import { StaffManagementTab } from "../components/management/StaffManagementTab";
import { RolesPermissionsTab } from "../components/management/RolesPermissionsTab";
import { SettingsTab } from "../components/management/SettingsTab";

import { products as initialProducts } from "../data/data";
import type {
  Product,
  Order,
  Brand,
  BrandApp,
  Category,
  WebsiteFeedback,
  NewsletterSubscriber,
  CustomerRecord,
} from "../types";
import { ProductService } from "../services/product.service";
import { OrderService } from "../services/order.service";
import { BrandService } from "../services/brand.service";
import { CategoryService } from "../services/category.service";
import {
  AdminService,
  type AnalyticsData,
  type ReviewModerationItem,
} from "../services/admin.service";
import { AuthService } from "../services/auth.service";

export default function Admin() {
  const navigate = useNavigate();

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTabId>("dashboard");

  // Current logged in executive user
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    roles?: string[];
    role?: string;
    avatarUrl?: string;
  } | null>(null);

  // Live Atelier State
  const [productsList, setProductsList] = useState<Product[]>(initialProducts);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [brandsList, setBrandsList] = useState<Brand[]>([]);
  const [brandApps, setBrandApps] = useState<BrandApp[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [productReviews, setProductReviews] = useState<ReviewModerationItem[]>(
    [],
  );
  const [websiteFeedback, setWebsiteFeedback] = useState<WebsiteFeedback[]>([]);
  const [customersList, setCustomersList] = useState<CustomerRecord[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<
    NewsletterSubscriber[]
  >([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | undefined>(
    undefined,
  );

  // Product modal trigger & External Edit trigger
  const [showProductModal, setShowProductModal] = useState(false);
  const [externalEditProduct, setExternalEditProduct] = useState<Product | null>(null);
  const [isBackendOffline, setIsBackendOffline] = useState(false);

  // Authenticate & Load Active User
  useEffect(() => {
    const stored = AuthService.getStoredUser();
    if (stored) {
      setCurrentUser(stored as any);
    } else {
      // No stored user — ProtectedRoute should have caught this,
      // but just in case, redirect to login
      navigate("/login");
    }
  }, [navigate]);

  // Fetch Live Backoffice Data
  useEffect(() => {
    async function loadBackoffice() {
      // 1. Analytics
      try {
        const a = await AdminService.getAnalytics();
        if (a) setAnalytics(a);
      } catch (e: any) {
        if (e.code === "ERR_NETWORK" || !e.response) {
          setIsBackendOffline(true);
        }
        console.warn("Analytics note:", e);
      }

      // 2. Products
      try {
        const p = await ProductService.getProducts({ includeInactive: true });
        if (p && p.length > 0) setProductsList(p);
      } catch (e) {
        console.warn("Products note:", e);
      }

      // 3. Orders
      try {
        const o = await OrderService.getAllOrdersAdmin();
        if (o && o.length > 0) {
          setOrdersList(o);
        } else {
          const local = localStorage.getItem("aurevilux_orders");
          if (local) setOrdersList(JSON.parse(local));
        }
      } catch (e) {
        const local = localStorage.getItem("aurevilux_orders");
        if (local) setOrdersList(JSON.parse(local));
      }

      // 4. Brands & Applications
      try {
        const b = await BrandService.getBrands(true);
        if (b && b.length > 0) setBrandsList(b);
        const apps = await AdminService.getBrandApplications();
        if (apps && apps.length > 0) setBrandApps(apps);
      } catch (e) {
        console.warn("Brands note:", e);
      }

      // 5. Categories
      try {
        const c = await CategoryService.getCategories();
        if (c && c.length > 0) setCategoriesList(c);
      } catch (e) {
        console.warn("Categories note:", e);
      }

      // 6. Product Reviews & Website Feedback
      try {
        const revs = await AdminService.getReviewsForModeration();
        if (revs && revs.length > 0) setProductReviews(revs);
      } catch (e) {
        console.warn("Reviews note:", e);
      }

      try {
        const fb = await AdminService.getAllFeedback();
        setWebsiteFeedback(fb || []);
      } catch (e) {
        console.warn("Feedback note:", e);
        setWebsiteFeedback([]);
      }

      // 7. Customers
      try {
        const custs = await AdminService.getCustomers();
        setCustomersList(custs || []);
      } catch (e) {
        console.warn("Customers note:", e);
        setCustomersList([]);
      }

      // 8. Newsletter Subscribers
      try {
        const subs = await AdminService.getNewsletterSubscribers();
        setNewsletterSubscribers(subs || []);
      } catch (e) {
        console.warn("Newsletter note:", e);
        setNewsletterSubscribers([]);
      }

      // 9. Staff & Personnel
      try {
        const roster = await AdminService.getStaffRoster();
        if (roster && roster.staff) {
          setStaffList(roster.staff);
          setPendingInvites(roster.invites || []);
        } else {
          setStaffList([]);
          setPendingInvites([]);
        }
      } catch (e) {
        console.warn("Staff note:", e);
        setStaffList([]);
        setPendingInvites([]);
      }
    }

    loadBackoffice();
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate("/login");
  };

  const primaryRole =
    currentUser?.roles?.[0] || currentUser?.role || "SUPERADMIN";

  const isSuper = primaryRole === "SUPERADMIN" || primaryRole === "SUPER_ADMIN";
  const isAdmin = primaryRole === "ADMIN" || isSuper;

  const tabAccess: Record<string, boolean> = {
    dashboard: true,
    products: true,
    categories: isAdmin,
    brands: isAdmin,
    inventory: true,
    reviews: true,
    couriers: isAdmin,
    orders: true,
    customers: true,
    newsletter: isAdmin,
    reports: isAdmin,
    staff: isAdmin,
    roles: isSuper,
    settings: isSuper,
  };

  const isStaffOrAdmin = currentUser?.roles?.some((r) =>
    ["SUPERADMIN", "SUPER_ADMIN", "ADMIN", "STAFF"].includes(r),
  );

  if (
    currentUser &&
    !isStaffOrAdmin &&
    currentUser.roles?.includes("CUSTOMER")
  ) {
    return (
      <div className="min-h-screen w-full bg-brand-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#0e0e12] border border-amber-900/60 rounded-xl p-8 space-y-6 shadow-2xl">
          <div className="w-14 h-14 rounded-full bg-amber-950/80 border border-amber-800/80 flex items-center justify-center mx-auto text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-xl tracking-widest text-white uppercase">
              Access Restricted
            </h2>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              You are currently authenticated with Client clearance (
              {currentUser.email}). The Management Suite requires administrative
              personnel privileges (SUPERADMIN, ADMIN, or STAFF).
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => navigate("/account")}
              className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3 rounded text-xs font-bold tracking-widest uppercase transition-colors"
            >
              Go to Client Suite
            </button>
            <button
              onClick={() => {
                AuthService.logout();
                navigate("/login");
              }}
              className="w-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white py-2.5 rounded text-xs tracking-widest uppercase transition-colors"
            >
              Switch to Staff Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-brand-black min-h-screen w-full flex flex-col md:flex-row text-white font-sans antialiased">
      {/* 1. ATELIER SIDEBAR (Strictly matching annotated screenshot) */}
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* 2. MAIN ATELIER CONTENT VIEWPORT (Full width, no restrictive max-w) */}
      <main className="flex-1 w-full p-6 md:p-10 overflow-y-auto">
        {/* Backend Offline Banner */}
        {isBackendOffline && (
          <div className="mb-6 p-4 bg-[#1f1214] border border-amber-800/80 rounded-lg text-amber-200 text-xs flex items-center justify-between shadow-xl">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <div>
                <span className="font-bold tracking-wider uppercase text-amber-300">
                  Atelier Backend Offline (http://localhost:5000)
                </span>
                <p className="text-[11px] text-zinc-400 font-light">
                  Changes made in management tabs will not sync to MongoDB until
                  backend server is running.
                </p>
              </div>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-amber-500/10 border border-amber-500/40 text-amber-300 text-[10px] tracking-widest font-semibold uppercase rounded hover:bg-amber-500/20 transition-colors"
            >
              Retry Sync
            </button>
          </div>
        )}
        {/* Tab Authorization Guard */}
        {!tabAccess[activeTab] && (
          <div className="p-8 bg-[#101014] border border-red-900/50 rounded-lg text-center space-y-4 max-w-lg mx-auto my-12">
            <ShieldAlert className="w-10 h-10 text-red-400 mx-auto" />
            <h3 className="font-serif text-lg text-white uppercase tracking-wider font-bold">
              Clearance Restricted
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed font-light">
              Your profile clearance (<span className="text-brand-gold font-mono font-semibold">{primaryRole}</span>) does not have authorization to view or manage the <span className="uppercase text-white font-semibold">{activeTab}</span> suite.
            </p>
            <button
              onClick={() => setActiveTab("dashboard")}
              className="px-4 py-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs uppercase tracking-wider font-bold rounded transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {tabAccess[activeTab] && activeTab === "dashboard" && (
          <DashboardTab
            analytics={analytics}
            products={productsList}
            orders={ordersList}
            setActiveTab={setActiveTab}
            onOpenAddProduct={() => {
              setActiveTab("products");
              setShowProductModal(true);
            }}
          />
        )}

        {tabAccess[activeTab] && activeTab === "products" && (
          <ProductsTab
            products={productsList}
            setProducts={setProductsList}
            showModal={showProductModal}
            setShowModal={setShowProductModal}
            externalEditProduct={externalEditProduct}
            onClearExternalEdit={() => setExternalEditProduct(null)}
          />
        )}

        {tabAccess[activeTab] && activeTab === "categories" && (
          <CategoriesTab
            categories={categoriesList}
            setCategories={setCategoriesList}
          />
        )}

        {tabAccess[activeTab] && activeTab === "brands" && (
          <BrandsTab
            brands={brandsList}
            setBrands={setBrandsList}
            brandApps={brandApps}
            setBrandApps={setBrandApps}
          />
        )}

        {tabAccess[activeTab] && activeTab === "inventory" && (
          <InventoryTab
            products={productsList}
            setProducts={setProductsList}
            onEditProduct={(p) => {
              setExternalEditProduct(p);
              setActiveTab("products");
            }}
          />
        )}

        {tabAccess[activeTab] && activeTab === "reviews" && (
          <ReviewsTab
            productReviews={productReviews}
            setProductReviews={setProductReviews}
            websiteFeedback={websiteFeedback}
            setWebsiteFeedback={setWebsiteFeedback}
          />
        )}

        {tabAccess[activeTab] && activeTab === "couriers" && (
          <CouriersTab />
        )}

        {tabAccess[activeTab] && activeTab === "orders" && (
          <OrdersTab orders={ordersList} setOrders={setOrdersList} />
        )}

        {tabAccess[activeTab] && activeTab === "customers" && (
          <CustomersTab
            customers={customersList}
            setCustomers={setCustomersList}
          />
        )}

        {tabAccess[activeTab] && activeTab === "newsletter" && (
          <NewsletterTab
            subscribers={newsletterSubscribers}
            setSubscribers={setNewsletterSubscribers}
          />
        )}

        {tabAccess[activeTab] && activeTab === "reports" && (
          <ReportsTab
            orders={ordersList}
            products={productsList}
            currentUser={currentUser}
          />
        )}

        {tabAccess[activeTab] && activeTab === "staff" && (
          <StaffManagementTab
            currentUserRole={primaryRole}
            staffList={staffList}
            setStaffList={setStaffList}
            pendingInvites={pendingInvites}
            setPendingInvites={setPendingInvites}
          />
        )}

        {tabAccess[activeTab] && activeTab === "roles" && <RolesPermissionsTab />}

        {tabAccess[activeTab] && activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
