export interface Product {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  price: number;
  rating: number;
  reviewsCount: number;
  category: string | any;
  categoryLabel: string;
  department?: string[] | string;
  subcategory?: string;
  description: string;
  longDescription: string;
  images: string[];
  colors: { name: string; value: string }[];
  sizes: string[];
  sizeStock?: Array<{ size: string; quantity: number }>;
  brand: string;
  inStock: boolean;
  stockCount?: number;
  isActive?: boolean;
  isDeleted?: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  specifications: { label: string; value: string }[];
  reviews: {
    id: string;
    name: string;
    rating: number;
    date: string;
    comment: string;
  }[];
}

export interface Brand {
  id: string;
  _id?: string;
  name: string;
  logo: string;
  campaignImage: string;
  description: string;
  isActive?: boolean;
  isDeleted?: boolean;
}

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

export interface Category {
  id: string;
  _id?: string;
  title: string;
  slug?: string;
  department?: string;
  parentCategory?: string;
  subcategories?: string[];
  description: string;
  image: string;
  link: string;
  buttonText: string;
}

export const categories: Category[] = [
  {
    id: "women",
    title: "WOMEN",
    description: "The Modern Silhouette. Elegant designs for the new season.",
    image: "/images/fashion_models/featured_categories_women.jpeg",
    link: "/shop?category=women",
    buttonText: "EXPLORE WOMEN",
  },
  {
    id: "men",
    title: "MEN",
    description: "Sartorial Precision. Refined style for the contemporary man.",
    image: "/images/fashion_models/featured_categories_men.jpeg",
    link: "/shop?category=men",
    buttonText: "EXPLORE MEN",
  },
  {
    id: "accessories",
    title: "ACCESSORIES",
    description: "The Essential Accent. Statement pieces to elevate every look.",
    image: "/images/products/featured_categories_accessories.jpeg",
    link: "/shop?category=accessories",
    buttonText: "SHOP ACCESSORIES",
  },
  {
    id: "new-arrivals",
    title: "NEW ARRIVALS",
    description: "The Season's Best. Discover the latest trends and styles.",
    image: "/images/fashion_models/featured_categories_new_arrivals.jpeg",
    link: "/shop?category=new-arrivals",
    buttonText: "SHOP NEW IN",
  },
];

export const brands: Brand[] = [
  {
    id: "calvin-klein",
    name: "Calvin Klein",
    logo: "/images/brands/calvin_klein.png",
    campaignImage: "/images/backgrounds/hero_section_image_03.jpeg",
    description: "Minimalist luxury, clean cuts, and iconic styles redefining modern apparel.",
  },
  {
    id: "gucci",
    name: "Gucci",
    logo: "/images/brands/gucci.png",
    campaignImage: "/images/fashion_models/model_red_dress_01.jpeg",
    description: "Eclectic, contemporary, romantic—representing the pinnacle of Italian craftsmanship.",
  },
  {
    id: "zara",
    name: "Zara",
    logo: "/images/brands/zara.png",
    campaignImage: "/images/backgrounds/new_collection_section_image.jpeg",
    description: "High fashion and hot trends translated into chic, wearable luxury collections.",
  },
  {
    id: "nike",
    name: "Nike",
    logo: "/images/brands/nike.png",
    campaignImage: "/images/backgrounds/background_1.jpeg",
    description: "Premium sportswear and revolutionary athleisure combining performance and high-street style.",
  },
  {
    id: "tommy-hilfiger",
    name: "Tommy Hilfiger",
    logo: "/images/brands/tommy_hilfiger.png",
    campaignImage: "/images/products/ASTRAL MOTO JACKET.jpeg",
    description: "Classic American cool styled with a premium twist and athletic heritage.",
  },
  {
    id: "levis",
    name: "Levi's",
    logo: "/images/brands/levis.png",
    campaignImage: "/images/backgrounds/hero_section_image_02.jpeg",
    description: "The timeless authority in luxury denim and crafted lifestyle essentials.",
  },
];

export const benefits: Benefit[] = [
  {
    id: "authentic",
    title: "Authentic Brands",
    description: "Every item in our collection is 100% original, authenticated and sourced directly from brands.",
    icon: "ShieldCheck",
  },
  {
    id: "quality",
    title: "Premium Quality",
    description: "Crafted from the finest fabrics, leathers, and precious metals with impeccable attention to detail.",
    icon: "Gem",
  },
  {
    id: "secure",
    title: "Secure Payment",
    description: "State-of-the-art security encryption ensures your payment credentials and personal details are safe.",
    icon: "CreditCard",
  },
  {
    id: "delivery",
    title: "Fast Delivery",
    description: "Complimentary, fully insured express shipping on all orders over $500, straight to your doorstep.",
    icon: "Truck",
  },
  {
    id: "returns",
    title: "Easy Returns",
    description: "Not completely satisfied? Return or exchange any item within 30 days with prepaid shipping labels.",
    icon: "RefreshCw",
  },
];

export const testimonials: Testimonial[] = [
  {
    id: "sophia",
    name: "Sophia Elva",
    role: "Verified Purchaser",
    avatar: "/images/customers/sophia_elva.jpeg",
    quote: "Aurevilux has completely transformed my wardrobe. The materials are incredibly luxurious, the silhouettes are modern and flattering, and the customer service is unmatched.",
    rating: 5,
  },
  {
    id: "ethan",
    name: "Ethan Wright",
    role: "Verified Purchaser",
    avatar: "/images/customers/ethan_wright.jpeg",
    quote: "The Onyx Tailored Blazer fits like it was custom-made for me. The fabrics feel heavy, premium, and durable. Ordering was simple, and delivery was exceptionally fast.",
    rating: 5,
  },
  {
    id: "olivia",
    name: "Olivia Chen",
    role: "Verified Purchaser",
    avatar: "/images/customers/olivia_chen.jpeg",
    quote: "The Serpentine Saddle Bag is a genuine work of art. The stitching, hardware, and premium leather smell exceed all my expectations. Aurevilux is my new go-to for luxury fashion.",
    rating: 5,
  },
];

export const lookbook: Lookbook = {
  title: "THE LOOKBOOK",
  subtitle: "Modern Elegance",
  description: "A curation of timeless silhouettes and modern craftsmanship, defining confident individuality through sophisticated design and understated luxury. Tailored to perfection, styled for the avant-garde.",
  quote: "“Modern silhouettes inspired by timeless beauty.”",
  quoteCaption: "LUXURY EDITORIAL SUPPORTING CAPTION",
  images: {
    main: "/images/fashion_models/lookbook_modern_elegance_image03.jpeg",
    left: "/images/fashion_models/lookbook_modern_elegance_image02.jpeg",
    right: "/images/fashion_models/lookbook_modern_elegance_image01.jpeg",
  },
};

export const products: Product[] = [
  {
    id: "velvet-luna-dress",
    name: "VELVET LUNA DRESS",
    slug: "velvet-luna-dress",
    price: 1290,
    rating: 4.8,
    reviewsCount: 34,
    category: "women",
    categoryLabel: "WOMEN / APPAREL",
    description: "Discover contemporary silhouettes crafted for confidence, elegance, and effortless sophistication.",
    longDescription: "Draped in premium Italian silk velvet, the Velvet Luna Dress represents a perfect harmony of structured tailoring and liquid flow. Featuring a plunging wrap-front neckline, elegant long sleeves, and a subtle side slit, this evening gown catches the light beautifully and commands attention in any luxury setting.",
    images: [
      "/images/products/VELVET LUNA DRESS.jpeg",
      "/images/fashion_models/featured_categories_women.jpeg",
      "/images/fashion_models/lookbook_modern_elegance_image01.jpeg"
    ],
    colors: [
      { name: "Obsidian Black", value: "#0A0A0A" },
      { name: "Royal Burgundy", value: "#5B121E" },
      { name: "Cream Alabaster", value: "#EAE6DF" }
    ],
    sizes: ["XS", "S", "M", "L"],
    sizeStock: [
      { size: "XS", quantity: 0 },
      { size: "S", quantity: 2 },
      { size: "M", quantity: 10 },
      { size: "L", quantity: 6 },
    ],
    brand: "Zara",
    inStock: true,
    isBestSeller: true,
    isNewArrival: false,
    specifications: [
      { label: "Material", value: "85% Silk Velvet, 15% Elastane lining" },
      { label: "Country of Origin", value: "Made in Italy" },
      { label: "Care Instructions", value: "Dry Clean Only" },
      { label: "Closure", value: "Concealed back zip closure" }
    ],
    reviews: [
      {
        id: "r1",
        name: "Sophia Elva",
        rating: 5,
        date: "May 12, 2026",
        comment: "This dress is spectacular! The velvet is extremely soft and thick. It hugs in all the right places and feels so premium. Highly recommended!"
      },
      {
        id: "r2",
        name: "Emma Watson",
        rating: 4.5,
        date: "June 2, 2026",
        comment: "Beautiful tailoring. The burgundy color is rich. Sized down slightly for a tighter fit."
      }
    ]
  },
  {
    id: "onyx-tailored-blazer",
    name: "ONYX TAILORED BLAZER",
    slug: "onyx-tailored-blazer",
    price: 1290,
    rating: 4.8,
    reviewsCount: 28,
    category: "men",
    categoryLabel: "MEN / APPAREL",
    description: "Sartorial precision. Refined style for the contemporary man.",
    longDescription: "A masterclass in modern menswear tailoring, the Onyx Tailored Blazer features clean, structured shoulders, a sharp notched lapel, and single-breasted closure. Made from breathable high-twist wool and finished with genuine horn buttons, this blazer transitions seamlessly from corporate boards to gallery openings.",
    images: [
      "/images/products/ONIX TAILORED BLAZER.jpeg",
      "/images/fashion_models/featured_categories_men.jpeg",
      "/images/fashion_models/lookbook_modern_elegance_image03.jpeg"
    ],
    colors: [
      { name: "Obsidian Black", value: "#0A0A0A" },
      { name: "Charcoal Grey", value: "#374151" },
      { name: "Cream Tan", value: "#EAE6DF" }
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    sizeStock: [
      { size: "S", quantity: 3 },
      { size: "M", quantity: 7 },
      { size: "L", quantity: 5 },
      { size: "XL", quantity: 2 },
      { size: "XXL", quantity: 0 },
    ],
    brand: "Calvin Klein",
    inStock: true,
    isBestSeller: true,
    isNewArrival: false,
    specifications: [
      { label: "Material", value: "100% Fine Merino Wool" },
      { label: "Lining", value: "100% Cupro" },
      { label: "Buttons", value: "Genuine Horn" },
      { label: "Country of Origin", value: "Made in Portugal" }
    ],
    reviews: [
      {
        id: "r3",
        name: "Ethan Wright",
        rating: 5,
        date: "April 18, 2026",
        comment: "Excellent shoulders. The cut is modern but doesn't feel constrictive. Wool texture is beautiful."
      }
    ]
  },
  {
    id: "serpentine-saddle-bag",
    name: "SERPENTINE SADDLE BAG",
    slug: "serpentine-saddle-bag",
    price: 1290,
    rating: 4.8,
    reviewsCount: 42,
    category: "accessories",
    categoryLabel: "ACCESSORIES / LEATHER",
    description: "The Essential Accent. Statement pieces to elevate every look.",
    longDescription: "A sculptural classic, the Serpentine Saddle Bag is crafted from full-grain calfskin leather, selected for its buttery softness and natural durability. Featuring a classic curved silhouette, magnetic flap closure, and customized antique gold-toned hardware including the signature 'D' emblem.",
    images: [
      "/images/products/SEPENTINE SADDLE BAG.jpeg",
      "/images/products/featured_categories_accessories.jpeg"
    ],
    colors: [
      { name: "Obsidian Black", value: "#0A0A0A" },
      { name: "Burgundy Wine", value: "#5B121E" },
      { name: "Cream Alabaster", value: "#EAE6DF" }
    ],
    sizes: ["One Size"],
    brand: "Gucci",
    inStock: true,
    isBestSeller: true,
    isNewArrival: false,
    specifications: [
      { label: "Material", value: "100% Calfskin Leather" },
      { label: "Hardware", value: "Antique Gold-Finish Metal" },
      { label: "Dimensions", value: "25.5 x 20 x 6.5 cm" },
      { label: "Strap", value: "Removable and adjustable shoulder strap" }
    ],
    reviews: [
      {
        id: "r4",
        name: "Olivia Chen",
        rating: 5,
        date: "May 29, 2026",
        comment: "Stunning craftsmanship. The leather is heavy and smooth. The metal hardware feels solid and luxurious. A perfect statement bag."
      }
    ]
  },
  {
    id: "astral-moto-jacket",
    name: "ASTRAL MOTO JACKET",
    slug: "astral-moto-jacket",
    price: 1290,
    rating: 4.8,
    reviewsCount: 19,
    category: "women",
    categoryLabel: "WOMEN / APPAREL",
    description: "Premium leather jacket tailored with asymmetrical zippers and edgy styling.",
    longDescription: "Constructed from top-grade drum-dyed lambskin leather, the Astral Moto Jacket features an asymmetric front zip closure, snap-down lapels, and zipped pockets. Structured ribs and an adjustable waist belt provide a form-fitting silhouette that embodies high-fashion rebellion.",
    images: [
      "/images/products/ASTRAL MOTO JACKET.jpeg",
      "/images/backgrounds/hero_section_image_01.jpeg"
    ],
    colors: [
      { name: "Obsidian Black", value: "#0A0A0A" },
      { name: "Midnight Red", value: "#5B121E" },
      { name: "Alabaster White", value: "#EAE6DF" }
    ],
    sizes: ["XS", "S", "M", "L", "XL"],
    brand: "Tommy Hilfiger",
    inStock: true,
    isBestSeller: true,
    isNewArrival: false,
    specifications: [
      { label: "Material", value: "100% Lambskin Leather" },
      { label: "Lining", value: "Satin lining with custom pattern" },
      { label: "Zippers", value: "Heavy-duty YKK gunmetal zippers" },
      { label: "Length", value: "Cropped waist length" }
    ],
    reviews: [
      {
        id: "r5",
        name: "Victoria S.",
        rating: 5,
        date: "June 11, 2026",
        comment: "This jacket is incredible. The leather is soft like butter but holds its shape wonderfully. Absolutely in love!"
      }
    ]
  },
  {
    id: "crimson-silk-gown",
    name: "CRIMSON SILK GOWN",
    slug: "crimson-silk-gown",
    price: 1850,
    rating: 4.9,
    reviewsCount: 15,
    category: "new-arrivals",
    categoryLabel: "NEW ARRIVALS / APPAREL",
    description: "Flowing red silk gown with elegant low-back drapery and statement sleeves.",
    longDescription: "Make an unforgettable entrance in our Crimson Silk Gown. Designed with an empire waistline, floor-length pooling silk skirt, and beautiful billowy sleeves, it features a daring open back with cross-tie silk straps. Crafted from lightweight, breathable mulberry silk.",
    images: [
      "/images/fashion_models/model_red_dress_01.jpeg",
      "/images/fashion_models/model_red_dress_2.jpeg"
    ],
    colors: [
      { name: "Scarlet Red", value: "#8A1A2E" },
      { name: "Obsidian Black", value: "#0A0A0A" }
    ],
    sizes: ["XS", "S", "M", "L"],
    brand: "Gucci",
    inStock: true,
    isBestSeller: false,
    isNewArrival: true,
    specifications: [
      { label: "Material", value: "100% Mulberry Silk" },
      { label: "Lining", value: "100% Silk Crepe de Chine" },
      { label: "Length", value: "Floor-length with slight train" },
      { label: "Origin", value: "Made in France" }
    ],
    reviews: []
  },
  {
    id: "scarlet-drape-dress",
    name: "SCARLET DRAPE DRESS",
    slug: "scarlet-drape-dress",
    price: 1650,
    rating: 4.7,
    reviewsCount: 12,
    category: "new-arrivals",
    categoryLabel: "NEW ARRIVALS / APPAREL",
    description: "Exquisite asymmetrical red midi dress with structural folds.",
    longDescription: "An architectural marvel, the Scarlet Drape Dress features asymmetrical ruching that contours the torso before draping elegantly into a midi-length hem. The dense satin fabric holds its shape, providing structured movement with every step.",
    images: [
      "/images/fashion_models/model_red_dress_2.jpeg",
      "/images/fashion_models/model_red_dress_01.jpeg"
    ],
    colors: [
      { name: "Crimson Red", value: "#7A1B2E" },
      { name: "Cream White", value: "#EAE6DF" }
    ],
    sizes: ["S", "M", "L"],
    brand: "COS",
    inStock: true,
    isBestSeller: false,
    isNewArrival: true,
    specifications: [
      { label: "Material", value: "70% Triacetate, 30% Polyester satin" },
      { label: "Origin", value: "Made in Italy" },
      { label: "Dry Clean", value: "Yes, recommended" }
    ],
    reviews: []
  },
  {
    id: "wool-trench-coat",
    name: "WOOL TRENCH COAT",
    slug: "wool-trench-coat",
    price: 1450,
    rating: 4.9,
    reviewsCount: 22,
    category: "new-arrivals",
    categoryLabel: "NEW ARRIVALS / COATS",
    description: "Double-breasted heavy wool blend trench coat in slate charcoal.",
    longDescription: "Designed for cold-weather sophistication, this heavy wool blend trench coat offers structured shoulders, a wide notched lapel, a matching waist belt, and deep storm pockets. The interior is fully lined in silk-like cupro for comfort and easy layering.",
    images: [
      "/images/backgrounds/hero_section_image_02.jpeg",
      "/images/backgrounds/background_1.jpeg"
    ],
    colors: [
      { name: "Slate Charcoal", value: "#262626" },
      { name: "Camel Brown", value: "#9A7B56" }
    ],
    sizes: ["M", "L", "XL"],
    brand: "COS",
    inStock: true,
    isBestSeller: false,
    isNewArrival: true,
    specifications: [
      { label: "Material", value: "80% Virgin Wool, 20% Cashmere" },
      { label: "Lining", value: "100% Cupro" },
      { label: "Closure", value: "Double-breasted button front" },
      { label: "Origin", value: "Made in Spain" }
    ],
    reviews: []
  },
  {
    id: "modern-elegance-suit",
    name: "MODERN ELEGANCE SUIT",
    slug: "modern-elegance-suit",
    price: 2100,
    rating: 5.0,
    reviewsCount: 16,
    category: "men",
    categoryLabel: "MEN / APPAREL",
    description: "Two-piece premium slim-fit suit in deep midnight black.",
    longDescription: "Constructed with traditional Italian techniques, the Modern Elegance Suit features canvas construction that molds to your body. Tailored in fine wool flannel with classic silk linings, it includes trousers with clean flat fronts and a jacket with structured two-button styling.",
    images: [
      "/images/fashion_models/lookbook_modern_elegance_image03.jpeg",
      "/images/products/ONIX TAILORED BLAZER.jpeg"
    ],
    colors: [
      { name: "Obsidian Black", value: "#0A0A0A" },
      { name: "Navy Blue", value: "#1E293B" }
    ],
    sizes: ["46R", "48R", "50R", "52R", "54R"],
    brand: "Calvin Klein",
    inStock: true,
    isBestSeller: false,
    isNewArrival: false,
    specifications: [
      { label: "Material", value: "100% Super 130s Wool Flannel" },
      { label: "Construction", value: "Half-Canvas" },
      { label: "Waist Type", value: "Adjustable slide-tabs on trousers" }
    ],
    reviews: []
  },
  {
    id: "luxury-pearl-necklace",
    name: "LUXURY PEARL NECKLACE",
    slug: "luxury-pearl-necklace",
    price: 850,
    rating: 4.6,
    reviewsCount: 8,
    category: "accessories",
    categoryLabel: "ACCESSORIES / JEWELRY",
    description: "Sourced freshwater pearl necklace with 18k gold clasp details.",
    longDescription: "Selected for their exceptional luster and spherical symmetry, our 8-9mm cultured freshwater pearls are hand-knotted on pure silk thread. Finished with a custom-engineered 18k yellow gold magnetic ball clasp stamped with the Aurevilux mark.",
    images: [
      "/images/products/featured_categories_accessories.jpeg",
      "/images/backgrounds/background_2.jpeg"
    ],
    colors: [
      { name: "Natural White Pearl", value: "#F8FAF5" }
    ],
    sizes: ["45cm String"],
    brand: "Gucci",
    inStock: true,
    isBestSeller: false,
    isNewArrival: false,
    specifications: [
      { label: "Pearl Type", value: "Cultured Freshwater Pearls" },
      { label: "Clasp", value: "18k Solid Yellow Gold" },
      { label: "Pearl Diameter", value: "8.5 mm average" }
    ],
    reviews: []
  },
  {
    id: "signature-leather-belt",
    name: "SIGNATURE LEATHER BELT",
    slug: "signature-leather-belt",
    price: 490,
    rating: 4.8,
    reviewsCount: 14,
    category: "accessories",
    categoryLabel: "ACCESSORIES / LEATHER",
    description: "Crafted premium leather belt with signature polished gold buckle.",
    longDescription: "A sleek finishing touch to both tailored trousers and casual denim. Made in Florence from vegetable-dyed saddle leather, it features hand-painted edges and a heavy solid brass buckle plated in 24k gold.",
    images: [
      "/images/backgrounds/background_2.jpeg",
      "/images/products/SEPENTINE SADDLE BAG.jpeg"
    ],
    colors: [
      { name: "Chestnut Brown", value: "#78350F" },
      { name: "Obsidian Black", value: "#0A0A0A" }
    ],
    sizes: ["80", "85", "90", "95", "100"],
    brand: "Calvin Klein",
    inStock: true,
    isBestSeller: false,
    isNewArrival: false,
    specifications: [
      { label: "Material", value: "Vegetable-Tanned Saddle Leather" },
      { label: "Buckle", value: "24k Gold Plated Brass" },
      { label: "Width", value: "3.5 cm" },
      { label: "Origin", value: "Made in Italy" }
    ],
    reviews: []
  }
];
