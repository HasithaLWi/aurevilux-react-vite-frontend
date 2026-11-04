export interface CollectionSceneData {
  id: string;
  number: string;
  name: string;
  line1: string;
  line2: string;
  subtitle: string;
  seasonBadge: string;
  quote: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage: string;
  modelImage: string;
  modelVideo?: string;
  thumbnail: string;
}

export const COLLECTION_SCENES: CollectionSceneData[] = [
  {
    id: "modern-silhouettes",
    number: "01",
    name: "MODERN SILHOUETTES",
    line1: "Modern",
    line2: "Silhouettes",
    seasonBadge: "HAUTE STRUCTURE",
    subtitle: "Architectural line & form.",
    quote: "Architectural line & form.",
    description:
      "Sharp shoulder tailoring meets fluid cape architecture. Modern power dressing elevated through bespoke Parisian craftsmanship.",
    ctaText: "DISCOVER SILHOUETTES",
    ctaLink: "/shop?category=all",
    backgroundImage: "/images/newcollection/new-collection-MODERN- SILHOUETTES.webp",
    modelImage: "/images/newcollection/new-collection-MODERN-SILHOUETTES-background-removed.png",
    thumbnail: "/images/newcollection/new-collection-MODERN- SILHOUETTES.webp",
  },
  {
    id: "the-evening-edit",
    number: "02",
    name: "THE EVENING EDIT",
    line1: "The Evening",
    line2: "Edit",
    seasonBadge: "NOCTURNE SERIES",
    subtitle: "Draped in midnight allure.",
    quote: "Draped in midnight allure.",
    description:
      "Sensorial velvet draping and sculptural nocturnal cuts designed for gala entrances, private soirees, and commanding twilight poise.",
    ctaText: "EXPLORE EVENING",
    ctaLink: "/shop?category=women",
    backgroundImage: "/images/newcollection/new-collection-THE-EVENING-EDIT.webp",
    modelImage: "/images/newcollection/new-collection-THE-EVENING-EDIT-background-removed.png",
    thumbnail: "/images/newcollection/new-collection-THE-EVENING-EDIT.webp",
  },
    {
    id: "autumn-collection",
    number: "03",
    name: "AUTUMN COLLECTION",
    line1: "Autumn",
    line2: "Collection",
    seasonBadge: "THE NEW SEASON",
    subtitle: "A study in silhouette.",
    quote: "A study in silhouette.",
    description:
      "Explore the essence of timeless craftsmanship and modern silhouettes. A journey through structural elegance, rich textures, and avant-garde design for the refined wardrobe.",
    ctaText: "SHOP COLLECTION",
    ctaLink: "/shop?category=new-arrivals",
    backgroundImage: "/images/newcollection/new-collection-AUTUMN-COLLECTION.webp",
    modelImage: "/images/newcollection/new-collection-AUTUMN-COLLECTION-background-removed.png",
    thumbnail: "/images/newcollection/new-collection-AUTUMN-COLLECTION.webp",
  },
  {
    id: "accessories-edit",
    number: "04",
    name: "ACCESSORIES EDIT",
    line1: "Accessories",
    line2: "Edit",
    seasonBadge: "ATELIER OBJECTS",
    subtitle: "Accents of golden luxury.",
    quote: "Accents of golden luxury.",
    description:
      "Sculpted leather handbags, hand-poured metallic hardware, and architectural jewelry designed to complete the modern haute silhouette.",
    ctaText: "VIEW ACCESSORIES",
    ctaLink: "/shop?category=accessories",
    backgroundImage: "/images/newcollection/new-collection-ACCESSORIES-EDIT.webp",
    modelImage: "/images/newcollection/new-collection-ACCESSORIES-EDIT-background-removed.png",
    thumbnail: "/images/newcollection/new-collection-ACCESSORIES-EDIT.webp",
  },
  {
    id: "new-arrivals",
    number: "05",
    name: "NEW ARRIVALS",
    line1: "New",
    line2: "Arrivals",
    seasonBadge: "AUTUMN / WINTER 2026",
    subtitle: "The latest runway curations.",
    quote: "The latest runway curations.",
    description:
      "First access to limited-edition runway drops, hand-loomed cashmere outerwear, and newly unveiled high-couture releases.",
    ctaText: "SHOP NEW ARRIVALS",
    ctaLink: "/shop?category=new-arrivals",
    backgroundImage: "/images/newcollection/new-collection-NEW-ARRIVALS.webp",
    modelImage: "/images/newcollection/new-collection-NEW-ARRIVALS-background-removed.png",
    thumbnail: "/images/newcollection/new-collection-NEW-ARRIVALS.webp",
  },
];
