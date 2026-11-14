import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, AlertCircle } from "lucide-react";
import { AdminSidebar, type AdminTabId } from "../components/management/AdminSidebar";
import { DashboardTab } from "../components/management/DashboardTab";
import { ProductsTab } from "../components/management/ProductsTab";
import { CategoriesTab } from "../components/management/CategoriesTab";
import { BrandsTab } from "../components/management/BrandsTab";
import { InventoryTab } from "../components/management/InventoryTab";
import { ReviewsTab } from "../components/management/ReviewsTab";
import { OrdersTab } from "../components/management/OrdersTab";
import { ReturnsTab } from "../components/management/ReturnsTab";
import { ShippingTab } from "../components/management/ShippingTab";
import { CustomersTab } from "../components/management/CustomersTab";
import { NewsletterTab } from "../components/management/NewsletterTab";
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
  const [productReviews, setProductReviews] = useState<ReviewModerationItem[]>([]);
  const [websiteFeedback, setWebsiteFeedback] = useState<WebsiteFeedback[]>([]);
  const [customersList, setCustomersList] = useState<CustomerRecord[]>([]);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | undefined>(undefined);

  // Product modal trigger
  const [showProductModal, setShowProductModal] = useState(false);
  const [isBackendOffline, setIsBackendOffline] = useState(false);

  // Authenticate & Load Active User
  useEffect(() => {
    const stored = AuthService.getStoredUser();
    if (stored) {
      setCurrentUser(stored as any);
    } else {
      // Demo session for preview
      const demoAdmin = {
        name: "Alexander Sterling",
        email: "admin@aurevilux.com",
        roles: ["SUPERADMIN"],
        avatarUrl: "/images/customers/ethan_wright.jpeg",
      };
      setCurrentUser(demoAdmin);
    }
  }, []);

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
        if (fb && fb.length > 0) {
          setWebsiteFeedback(fb);
        } else {
          // Default testimonials preview
          setWebsiteFeedback([
            {
              _id: "fb-1",
              name: "Elena Rostova",
              email: "elena@rostova.com",
              role: "Private Collector, Milan",
              rating: 5,
              comment: "The bespoke packaging and courier delivery exceeded every haute couture standard.",
              isFeatured: true,
              status: "approved",
              createdAt: new Date().toISOString(),
            },
            {
              _id: "fb-2",
              name: "Lord Marcus Sterling",
              email: "marcus@sterling.co.uk",
              role: "Savile Row Patron",
              rating: 5,
              comment: "Flawless horology acquisition. Aurevilux represents the future of luxury shopping.",
              isFeatured: true,
              status: "approved",
              createdAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (e) {
        console.warn("Feedback note:", e);
      }

      // 7. Customers
      try {
        const custs = await AdminService.getCustomers();
        if (custs && custs.length > 0) {
          setCustomersList(custs);
        } else {
          setCustomersList([
            {
              _id: "c-1",
              name: "Sophia Elvah",
              email: "sophia@aurevia.com",
              username: "sophiaelvah",
              authProvider: "local",
              isActive: true,
              createdAt: "2026-01-15T00:00:00.000Z",
              ordersCount: 4,
              totalSpend: 11400,
            },
            {
              _id: "c-2",
              name: "Antoine De Beaumarchais",
              email: "antoine@paris.fr",
              username: "antoineb",
              authProvider: "google",
              isActive: true,
              createdAt: "2026-02-10T00:00:00.000Z",
              ordersCount: 2,
              totalSpend: 5900,
            },
          ]);
        }
      } catch (e) {
        console.warn("Customers note:", e);
      }

      // 8. Newsletter Subscribers
      try {
        const subs = await AdminService.getNewsletterSubscribers();
        if (subs && subs.length > 0) {
          setNewsletterSubscribers(subs);
        } else {
          setNewsletterSubscribers([
            { _id: "s-1", email: "patron.vip@couture.com", isActive: true, subscribedAt: "2026-02-01" },
            { _id: "s-2", email: "collector@geneva.ch", isActive: true, subscribedAt: "2026-02-04" },
            { _id: "s-3", email: "director@milanofashion.it", isActive: true, subscribedAt: "2026-02-11" },
          ]);
        }
      } catch (e) {
        console.warn("Newsletter note:", e);
      }

      // 9. Staff & Personnel
      try {
        const roster = await AdminService.getStaffRoster();
        if (roster && roster.staff) {
          setStaffList(roster.staff);
          setPendingInvites(roster.invites || []);
        } else {
          setStaffList([
            {
              _id: "st-1",
              name: "Alexander Sterling",
              email: "admin@aurevilux.com",
              username: "superadmin",
              roles: ["SUPERADMIN"],
              isActive: true,
              createdAt: "2026-01-01",
            },
            {
              _id: "st-2",
              name: "Claire Dupont",
              email: "claire@aurevilux.com",
              username: "claire_admin",
              roles: ["ADMIN"],
              isActive: true,
              createdAt: "2026-01-20",
            },
            {
              _id: "st-3",
              name: "Henri Laurent",
              email: "henri@aurevilux.com",
              username: "henri_staff",
              roles: ["STAFF"],
              isActive: true,
              createdAt: "2026-02-05",
            },
          ]);
        }
      } catch (e) {
        console.warn("Staff note:", e);
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

  const isStaffOrAdmin = currentUser?.roles?.some((r) =>
    ["SUPERADMIN", "SUPER_ADMIN", "ADMIN", "STAFF"].includes(r)
  );

  if (currentUser && !isStaffOrAdmin && currentUser.roles?.includes("CUSTOMER")) {
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
              You are currently authenticated with Client clearance ({currentUser.email}). The Management Suite requires administrative personnel privileges (SUPERADMIN, ADMIN, or STAFF).
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
                  Changes made in management tabs will not sync to MongoDB until backend server is running.
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
        {activeTab === "dashboard" && (
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

        {activeTab === "products" && (
          <ProductsTab
            products={productsList}
            setProducts={setProductsList}
            showModal={showProductModal}
            setShowModal={setShowProductModal}
          />
        )}

        {activeTab === "categories" && (
          <CategoriesTab
            categories={categoriesList}
            setCategories={setCategoriesList}
          />
        )}

        {activeTab === "brands" && (
          <BrandsTab
            brands={brandsList}
            setBrands={setBrandsList}
            brandApps={brandApps}
            setBrandApps={setBrandApps}
          />
        )}

        {activeTab === "inventory" && (
          <InventoryTab
            products={productsList}
            setProducts={setProductsList}
          />
        )}

        {activeTab === "reviews" && (
          <ReviewsTab
            productReviews={productReviews}
            setProductReviews={setProductReviews}
            websiteFeedback={websiteFeedback}
            setWebsiteFeedback={setWebsiteFeedback}
          />
        )}

        {activeTab === "orders" && (
          <OrdersTab
            orders={ordersList}
            setOrders={setOrdersList}
          />
        )}

        {activeTab === "returns" && <ReturnsTab />}

        {activeTab === "shipping" && (
          <ShippingTab
            orders={ordersList}
            setOrders={setOrdersList}
          />
        )}

        {activeTab === "customers" && (
          <CustomersTab
            customers={customersList}
            setCustomers={setCustomersList}
          />
        )}

        {activeTab === "newsletter" && (
          <NewsletterTab subscribers={newsletterSubscribers} />
        )}

        {activeTab === "staff" && (
          <StaffManagementTab
            currentUserRole={primaryRole}
            staffList={staffList}
            setStaffList={setStaffList}
            pendingInvites={pendingInvites}
            setPendingInvites={setPendingInvites}
          />
        )}

        {activeTab === "roles" && <RolesPermissionsTab />}

        {activeTab === "settings" && <SettingsTab />}
      </main>
    </div>
  );
}
