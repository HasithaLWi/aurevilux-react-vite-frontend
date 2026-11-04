// ============================================================================
// AUREVILUX — GLOBAL TYPE DEFINITIONS
// ============================================================================

// ----------------------------------------------------------------------------
// 1. SYSTEM USERS & AUTHENTICATION
// ----------------------------------------------------------------------------

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
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

export interface LoginCredentials {
  identifier?: string;
  username?: string;
  email?: string;
  password?: string;
}

// ----------------------------------------------------------------------------
// 2. PRODUCT CATALOG & BRANDS
// ----------------------------------------------------------------------------

export type ProductCategory = "women" | "men" | "accessories" | "new-arrivals";

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

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  rating: number;
  reviewsCount: number;
  category: ProductCategory;
  categoryLabel: string;
  description: string;
  longDescription: string;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  brand: string;
  inStock: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  specifications: ProductSpec[];
  reviews: ProductReview[];
}

export interface Brand {
  id: string;
  name: string;
  logo: string;
  campaignImage: string;
  description: string;
}

export interface Category {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  buttonText: string;
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

// ----------------------------------------------------------------------------
// 4. MARKETING & UI CONTENT
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
