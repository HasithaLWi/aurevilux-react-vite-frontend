export interface HeroLookCard {
  tag: string;
  title: string;
  spec: string;
  price: string;
  image: string;
  link: string;
}

export interface HeroSlideData {
  id: string;
  number: string;
  eyebrow: string;
  line1: string;
  line2: string;
  seasonBadge: string;
  quote: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  backgroundImage: string;
  modelImage: string;
  lookCard: HeroLookCard;
}

export const HERO_SLIDES: HeroSlideData[] = [
  {
    id: "timeless-allure",
    number: "01",
    eyebrow: "NEW AUTUMN / WINTER COLLECTION",
    line1: "Timeless",
    line2: "Allure",
    seasonBadge: "AUTUMN / WINTER 2026",
    quote: "Crafted for confidence, elegance & effortless poise.",
    description:
      "Discover contemporary silhouettes crafted for confidence, elegance, and effortless sophistication. Architectural lines tailored with Parisian craftsmanship.",
    ctaText: "EXPLORE COLLECTION",
    ctaLink: "/shop?category=all",
    secondaryCtaText: "VIEW LOOKBOOK",
    secondaryCtaLink: "#lookbook",
    backgroundImage: "/images/home/hero/hero_section_image-new.webp",
    modelImage: "/images/home/hero/hero_section_image-new-rbg.png",
    lookCard: {
      tag: "ATELIER SELECTION",
      title: "VELVET LUNA WING GOWN",
      spec: "Pure Silk Velvet • Midnight Plum",
      price: "$2,850",
      image: "/images/products/VELVET LUNA DRESS.jpeg",
      link: "/shop",
    },
  },
  {
    id: "modern-elegance",
    number: "02",
    eyebrow: "NOCTURNE SERIES",
    line1: "Modern",
    line2: "Elegance",
    seasonBadge: "THE EVENING EDIT",
    quote: "Where architectural tailoring meets midnight allure.",
    description:
      "Sensorial velvet draping and structured eveningwear designed for commanding gala entrances, private soirees, and twilight poise.",
    ctaText: "DISCOVER EVENING",
    ctaLink: "/shop?category=women",
    secondaryCtaText: "VIEW LOOKBOOK",
    secondaryCtaLink: "#lookbook",
    backgroundImage: "/images/newcollection/new-collection-THE-EVENING-EDIT.webp",
    modelImage: "/images/newcollection/new-collection-THE-EVENING-EDIT-background-removed.png",
    lookCard: {
      tag: "NOCTURNE PIECE",
      title: "ASTRAL CAPE JACKET",
      spec: "Hand-Tailored Silk & Wool Lapels",
      price: "$1,950",
      image: "/images/products/ASTRAL MOTO JACKET.jpeg",
      link: "/shop",
    },
  },
  {
    id: "haute-couture",
    number: "03",
    eyebrow: "THE NEW SEASON",
    line1: "Haute",
    line2: "Couture",
    seasonBadge: "AUTUMN COLLECTION",
    quote: "A study in structural elegance & rich textures.",
    description:
      "A journey through structural elegance, rich textures, and avant-garde design for the refined haute couture wardrobe.",
    ctaText: "SHOP COLLECTION",
    ctaLink: "/shop?category=new-arrivals",
    secondaryCtaText: "VIEW LOOKBOOK",
    secondaryCtaLink: "#lookbook",
    backgroundImage: "/images/newcollection/new-collection-AUTUMN-COLLECTION.webp",
    modelImage: "/images/newcollection/new-collection-AUTUMN-COLLECTION-background-removed.png",
    lookCard: {
      tag: "RUNWAY EDIT",
      title: "ONIX SCULPTED BLAZER",
      spec: "Italian Structured Cashmere",
      price: "$2,400",
      image: "/images/products/ONIX TAILORED BLAZER.jpeg",
      link: "/shop",
    },
  },
  {
    id: "bespoke-silhouettes",
    number: "04",
    eyebrow: "HAUTE STRUCTURE",
    line1: "Bespoke",
    line2: "Silhouettes",
    seasonBadge: "MODERN SILHOUETTES",
    quote: "Architectural line & form elevated by Parisian mastery.",
    description:
      "Sharp shoulder tailoring meets fluid cape architecture. Modern power dressing elevated through bespoke atelier artistry.",
    ctaText: "SHOP SILHOUETTES",
    ctaLink: "/shop?category=all",
    secondaryCtaText: "VIEW LOOKBOOK",
    secondaryCtaLink: "#lookbook",
    backgroundImage: "/images/newcollection/new-collection-MODERN- SILHOUETTES.webp",
    modelImage: "/images/newcollection/new-collection-MODERN-SILHOUETTES-background-removed.png",
    lookCard: {
      tag: "COUTURE OBJECT",
      title: "SERPENTINE SADDLE BAG",
      spec: "Gold Hardware • Calfskin Leather",
      price: "$1,650",
      image: "/images/products/SEPENTINE SADDLE BAG.jpeg",
      link: "/shop",
    },
  },
];
