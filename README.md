# ✨ Aurevilux Frontend — Haute Couture Marketplace & Atelier Suite

[![Production Storefront](https://img.shields.io/badge/Production%20Storefront-Vercel-black?style=for-the-badge&logo=vercel)](https://aurevilux.vercel.app)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3+-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.15+-88CE02?style=for-the-badge&logo=greensock)](https://greensock.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

The visual and interactive flagship of **Aurevilux**, an ultra-luxury digital marketplace crafted for Parisian and Milanese haute couture. Built with **React 19**, **Vite 8**, **Tailwind CSS v4**, **GSAP**, and **TypeScript**, Aurevilux blends editorial luxury aesthetics with a robust, enterprise-grade back-office atelier workshop.

---

## 🌐 Live Production Deployment

* **Published Storefront & Atelier:** [`https://aurevilux.vercel.app`](https://aurevilux.vercel.app)
* **Production API Server:** [`https://aurevilux-backend.onrender.com/api/v1`](https://aurevilux-backend.onrender.com/api/v1)

---

## 💎 Design Philosophy & Aesthetic System

Aurevilux is designed to mirror the refined luxury of Place Vendôme and Parisian fashion houses:
* **Deep Noir Palette:** `#050507` backdrop, elevated with subtle `#101014` atelier card containers and `#1e1e24` borders.
* **Haute Accent Tones:** Deep Royal Burgundy (`brand-burgundy`) and Warm Champagne Gold (`brand-gold`).
* **Typography:** Editorial Serif headings for couture authority, paired with clean, geometric sans-serif and monospace numerals for SKU and currency precision.
* **Cinematic Editorial Video:** Dual-layer video introductions playing synchronized transparent model video (`VP9` WebM with alpha channel / Apple Safari `HEVC` MP4) over full-bleed ambient background footage.

---

## 🏛️ Application Architecture & Feature Modules

### 1. 🛍️ Consumer Storefront Experience
* **Hero Showcase:** Fluid typography, editorial imagery, and responsive GSAP transitions tailored for high-end boutique display.
* **New Collection Carousel:** Interactive couture slideshow with isolated transforms, smooth slide-ins, and direct lookbook previews.
* **Best Sellers Curation:** Filtered tab navigation (`ALL`, `WOMEN`, `MEN`, `ACCESSORIES`, `NEW ARRIVALS`) rendering live catalog items with 0 hardcoded fallbacks.
* **Featured Maisons:** Showcase of luxury fashion houses (Chanel, Burberry, Cartier, Hermès, Gucci, Calvin Klein) with high-contrast inverted brand emblems.
* **Shop & Faceted Discovery:** Dynamic multi-facet filtering (Atelier Department, Category Taxonomy, Maison, Price Ranges, Stock Status, and Smart Intent search for terms like *"evening"*, *"latest"*, *"bestseller"*).
* **Cinematic Product Details:** Full-screen dual-layer video opener, multi-angle high-res imagery gallery, real-time SKU size selection, color swatches, craftsmanship provenance, and client reviews.
* **Private Bag & Checkout:** Smooth cart management, address capture, shipping calculation, and verified order receipt confirmation.

### 2. 🤖 Éléanore — Haute Couture AI Concierge
* Persistent floating concierge widget on all storefront routes (automatically hidden on back-office `/admin` routes).
* Interacts as a Parisian personal stylist, answering queries regarding sizing, tailoring provenance, brand heritage, and product availability.
* Directly suggests clickable catalog pieces directly within the chat dialog.

### 3. 👔 Atelier Workshop & Executive Management Suite (`/admin`)
Secured by Role-Based Access Control (`SUPERADMIN`, `ADMIN`, `STAFF`):
* **Executive Overview Dashboard:** Net revenue, average order value, conversion rates, order dispatch pipelines, and interactive Recharts sales curves.
* **Product Catalog & Atelier Workshop:**
  - Piece identification with automatic hyphenated URL slug generation.
  - Reactive Maison / Brand and Taxonomy Category dropdowns with intelligent ObjectId resolution.
  - Multi-department selection (`WOMEN`, `MEN`, `ACCESSORIES`).
  - Size variant inventory tracker calculating real-time aggregate stock units.
  - Custom color swatch picker and atelier specifications editor.
  - Supabase Storage image uploader (up to 5 photos with automatic file validation and replacement purge).
  - Supabase Storage cinematic video uploader (`aurevilux-videos` bucket) supporting background video, VP9 alpha WebM, Safari HEVC MP4, and video posters.
* **Executive Reports & PDF Generation:**
  - Dedicated **Reports Tab** aggregating net turnover, total unit movements, category shares, and top-selling pieces.
  - Strict **A4 Paper Pagination Engine** (`@media print` rules) preventing awkward component breaks and clipping.
  - Silent one-click **PDF Download** and browser print engine formatting.
* **Logistics & Orders:** Tracking order states (`Pending` → `Processing` → `Dispatched` → `Delivered`), viewing patron addresses, and issuing branded receipts.
* **Maison Registry & Brand Applications:** Reviewing external brand applications and managing verified luxury partners.
* **Staff Management & Security:** Inviting new atelier staff via cryptographic email tokens and managing granular role assignments.
* **Atelier Settings:** Managing marketplace policies, currency formats, and switching active AI Concierge engines (**Google Gemini** / **Groq**).

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | React v19.2, Vite v8.3 |
| **Language** | TypeScript v6.0 |
| **Styling** | Tailwind CSS v4 with custom luxury themes |
| **Animation & Motion** | GSAP v3.15, `@gsap/react` |
| **Iconography** | Lucide React v1.49 |
| **Data Visualization** | Recharts v3.10 |
| **Routing** | React Router v7.18 |
| **API Client** | Axios v1.21 |
| **Authentication** | `@react-oauth/google` v0.13, JWT session storage |
| **PDF & Printing** | Custom A4 print engine stylesheet |

---

## 📂 Project Directory Structure

```
frontend/
├── public/                     # Static media, luxury brand logos, banners
├── src/
│   ├── assets/                 # Brand assets & graphics
│   ├── components/
│   │   ├── chat/               # Éléanore AI Concierge modal & floating trigger
│   │   ├── common/             # LuxuryAlert, ConfirmModal, Buttons, Inputs
│   │   ├── footer/             # Luxury footer & legal links
│   │   ├── home/               # Hero, Carousel, Best Sellers, Featured Brands
│   │   ├── management/         # Atelier Workshop Back-Office:
│   │   │   ├── ProductForm.tsx # Core product creation & video uploader
│   │   │   ├── ProductsTab.tsx # Product catalog management
│   │   │   ├── ReportsTab.tsx  # Executive analytics & metrics
│   │   │   ├── PrintableReport.tsx # Strict A4 multi-page print stylesheet
│   │   │   ├── OrdersTab.tsx   # Order fulfillment & receipts
│   │   │   ├── BrandsTab.tsx   # Maison partner registry
│   │   │   ├── InventoryTab.tsx# Real-time SKU stock allocation
│   │   │   └── SettingsTab.tsx # Atelier & AI provider configuration
│   │   ├── navbar/             # Sticky header, search drawer, bag preview
│   │   └── shop/               # Faceted catalog filter, product grid
│   ├── context/                # AppContext (Cart, User, Wishlist), LuxuryAlertContext
│   ├── pages/                  # ProductDetails, Cart, Checkout, Brands, Account, Admin
│   ├── services/               # Axios API services (Product, Auth, Order, Upload, etc.)
│   ├── types/                  # TypeScript interface definitions (Product, Brand, Order)
│   ├── utils/                  # Image validation, Supabase URL helpers, formatters
│   ├── App.tsx                 # Route hierarchy & ProtectedRoute guards
│   ├── index.css               # Tailwind CSS v4 directives & print layout rules
│   └── main.tsx                # React DOM root entrypoint
├── index.html
├── package.json
└── vite.config.ts
```

---

## ⚙️ Environment Variables Setup

Create a `.env` file in the `frontend/` directory:

```env
# Google OAuth Client ID (for patron Google sign-in)
VITE_GOOGLE_CLIENT_ID=997178440277-12np226o5k54cvq6ie9ajvs5ql90e171.apps.googleusercontent.com

# Backend API Endpoint
# Local Development:
VITE_API_BASE_URL=http://localhost:5000/api/v1

# Production Deployment (On Render):
# VITE_API_BASE_URL=https://aurevilux-backend.onrender.com/api/v1
```

---

## 🚀 Local Development Quickstart

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local Dev Server
```bash
npm run dev
```
The application will launch on `http://localhost:5173`.

### 3. Production Build & Verification
```bash
npm run build
npm run preview
```

---

## 🚢 Production Deployment (Vercel)

The frontend is deployed to **Vercel** with continuous deployment:
* Build Command: `npm run build`
* Output Directory: `dist`
* Environment Variables configured in Vercel Dashboard:
  - `VITE_API_BASE_URL=https://aurevilux-backend.onrender.com/api/v1`
  - `VITE_GOOGLE_CLIENT_ID=997178440277-12np226o5k54cvq6ie9ajvs5ql90e171.apps.googleusercontent.com`

---

## 👤 Author & Architecture
* **Lead Engineer & Designer:** Hasitha Wijesinghe
* **Project:** RAD Coursework — Aurevilux Luxury Fashion Marketplace
