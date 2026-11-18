// ============================================================================
// AUREVILUX — GLOBAL TYPE DEFINITIONS
// ============================================================================

// ----------------------------------------------------------------------------
// 1. SYSTEM USERS & AUTHENTICATION
// ----------------------------------------------------------------------------

export type UserRole =
  | "SUPERADMIN"
  | "SUPER_ADMIN"
  | "ADMIN"
  | "STAFF"
  | "PRODUCT_MANAGER"
  | "ORDER_MANAGER"
  | "CUSTOMER_SUPPORT"
  | "CONTENT_MANAGER"
  | "MARKETING"
  | "CUSTOMER";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  username: string;
  password?: string;
  role: UserRole | string;
  roles?: string[];
  status?: string;
  memberSince?: string;
  avatarUrl?: string;
  token?: string;
}

export interface StaffInvite {
  id: string;
  email: string;
  name: string;
  role: UserRole | string;
  token?: string;
  expiresAt?: string;
  accepted?: boolean;
}

export interface LoginCredentials {
  identifier?: string;
  username?: string;
  email?: string;
  password?: string;
}

// ----------------------------------------------------------------------------
// 2. PRODUCT CATALOG & BRANDS
// ----------------------------------------------------------------------------

export type ProductDepartment = "MEN" | "WOMEN" | "ACCESSORIES";
export type ProductCategory = string;

export interface ProductColor {
  name: string;
  value: string; // Hex code, e.g., "#0A0A0A"
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductReview {
  id: string;
  name: string;
  rating: number;
  date: string;
  comment: string;
}

// ----------------------------------------------------------------------------
// EDITORIAL VIDEO — Optional cinematic product introduction
// Attach to any product to trigger the dual-layer video intro on page load.
// If absent (null / undefined), the product gallery loads immediately.
// ----------------------------------------------------------------------------
export interface EditorialVideoSource {
  /** Full-background original video (WebM or MP4) — displayed as the ambient backdrop */
  backgroundVideo?: string;
  /** VP9 alpha transparent WebM — foreground model on Chrome / Edge / Firefox / Android */
  transparentVideoWebm?: string;
  /** HEVC alpha transparent MP4 — foreground model on Safari / iOS / iPadOS (optional) */
  transparentVideoHevc?: string;
  /** High-res poster frame shown while both videos are pre-buffering */
  poster?: string;
  /** Override the auto-dissolve duration in seconds (default: 7) */
  duration?: number;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  price: number;
  rating: number;
  reviewsCount: number;
  category: ProductCategory;
  categoryLabel: string;
  department?: string[] | string;
  subcategory?: string;
  description: string;
  longDescription: string;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  sizeStock?: Array<{ size: string; quantity: number }>;
  brand: string;
  inStock: boolean;
  stockCount?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  specifications: ProductSpec[];
  reviews: ProductReview[];
  createdAt?: string;
  updatedAt?: string;
  /** Optional cinematic editorial video introduction — see EditorialVideoSource */
  editorialVideo?: EditorialVideoSource | null;
}

export interface Brand {
  id: string;
  _id?: string;
  name: string;
  slug?: string;
  logo: string;
  campaignImage: string;
  description: string;
  featured?: boolean;
  isActive?: boolean;
  isDeleted?: boolean;
}

export interface BrandApp {
  id: string;
  _id?: string;
  brandName?: string;
  name?: string;
  contactName?: string;
  designer?: string;
  category?: string;
  email?: string;
  contactEmail?: string;
  story?: string;
  phone?: string;
  website?: string;
  country?: string;
  status: "Pending" | "Approved" | "Rejected";
  date?: string;
  notes?: string;
}

export interface Category {
  id: string;
  _id?: string;
  title: string;
  slug?: string;
  department?: string[] | string;
  parentCategory?: string;
  subcategories?: string[];
  description: string;
  image: string;
  link: string;
  buttonText: string;
  isActive?: boolean;
}

export interface WebsiteFeedback {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role?: string;
  rating: number;
  comment: string;
  isFeatured: boolean;
  status: "pending" | "approved" | "archived";
  createdAt: string;
}

export interface NewsletterSubscriber {
  _id: string;
  id?: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

export interface CustomerRecord {
  _id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl?: string;
  authProvider: "local" | "google";
  isActive: boolean;
  createdAt: string;
  ordersCount: number;
  totalSpend: number;
}

// ----------------------------------------------------------------------------
// 3. CART & ORDERS
// ----------------------------------------------------------------------------

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
}

export interface OrderItem {
  id?: string;
  productId?: string;
  name: string;
  brand: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  color?: string;
  size?: string;
  image?: string;
}

export interface TimelineStep {
  title?: string;
  status?: string;
  date: string;
  description?: string;
  completed: boolean;
}

export type OrderStatus =
  | "Pending"
  | "Confirmed"
  | "Processing"
  | "In Transit"
  | "Out for Delivery"
  | "Delivered"
  | "Cancelled"
  | "Refunded";

export interface Order {
  id: string;
  _id?: string;
  orderNumber?: string;
  date?: string;
  createdAt?: string;
  status: OrderStatus | string;
  total: number;
  itemsCount: number;
  name?: string;
  email?: string;
  contactEmail?: string;
  story?: string;
  phone?: string;
  customer?: {
    name: string;
    email: string;
    phone?: string;
  };
  address?: string;
  shippingAddress?: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  carrier?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
  items: OrderItem[];
  timeline: TimelineStep[];
}

// ----------------------------------------------------------------------------
// 4. CUSTOMER ACCOUNT & PROFILE
// ----------------------------------------------------------------------------

export interface UserProfile {
  name: string;
  email: string;
  username?: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  password?: string;
  tier: string;
  memberSince: string;
  birthday?: string;
  gender?: string;
  avatarUrl: string;
  authProvider?: "local" | "google";
  savedAddresses?: SavedAddress[];
  savedCards?: PaymentMethodCard[];
}

export interface SavedAddress {
  id: string;
  _id?: string;
  type: "Home" | "Office" | "Other";
  isDefault: boolean;
  name: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface PaymentMethodCard {
  id: string;
  _id?: string;
  brand: "visa" | "mastercard" | "amex" | "generic";
  cardNumber: string; // Masked (e.g. "**** **** **** 4521")
  expiry: string;
  cardHolder: string;
  isDefault: boolean;
}

export interface ReturnRequest {
  id: string;
  orderId: string;
  customerName: string;
  email: string;
  reason: string;
  status: "Pending" | "Approved" | "Rejected";
  date: string;
  amount: number;
}

// ----------------------------------------------------------------------------
// 5. MARKETING & UI CONTENT
// ----------------------------------------------------------------------------

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  avatar: string;
  quote: string;
  rating: number;
}

export interface Lookbook {
  title: string;
  subtitle: string;
  description: string;
  quote: string;
  quoteCaption: string;
  images: {
    main: string;
    left: string;
    right: string;
  };
}

export interface Benefit {
  id: string;
  title: string;
  description: string;
  icon: string;
}
