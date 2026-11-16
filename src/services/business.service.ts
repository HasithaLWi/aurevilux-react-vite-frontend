import { api } from "./api";

export interface BusinessLookbook {
  title: string;
  subtitle: string;
  quote: string;
  quoteCaption: string;
  description: string;
  story: string;
  mainImage: string;
  leftImage: string;
  rightImage: string;
  galleryImages: string[];
}

export interface BusinessInfo {
  _id?: string;
  name: string;
  legalName: string;
  tagline: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  freeShippingThreshold: number;
  termsAndConditions: string;
  privacyPolicy: string;
  lookbook: BusinessLookbook;
  createdAt?: string;
  updatedAt?: string;
}

export const BusinessService = {
  // Retrieve singleton business info (public)
  getBusinessInfo: async (): Promise<BusinessInfo> => {
    try {
      const { data } = await api.get<{ message: string; data: BusinessInfo }>("/business");
      return data.data;
    } catch (err) {
      console.warn("Could not fetch business info from server, using fallback:", err);
      return {
        name: "Aurevilux Haute Couture",
        legalName: "Aurevilux Luxury Group S.A.",
        tagline:
          "Crafting confidence and contemporary elegance. Sourcing the finest silhouettes and bespoke designs for the refined modern wardrobe.",
        email: "concierge@aurevilux.com",
        phone: "+33 1 42 68 00 00",
        address: "12 Place Vendôme, 75001 Paris, France",
        currency: "USD ($) - UNITED STATES DOLLAR",
        freeShippingThreshold: 2500,
        termsAndConditions: `# Aurevilux Terms of Service & Bespoke Client Accord\n\nWelcome to Aurevilux Haute Couture. By accessing our private salon and digital boutique, you enter into a binding covenant with Aurevilux Luxury Group.`,
        privacyPolicy: `# Aurevilux Patron Privacy & Confidentiality Covenant\n\nAt Aurevilux, the privacy and discretion of our patrons is of paramount importance. This covenant details the safeguarding of your private dossier.`,
        lookbook: {
          title: "Modern Elegance",
          subtitle: "THE LOOKBOOK",
          quote:
            "A curation of timeless silhouettes and modern craftsmanship, defining confident individuality through sophisticated design and understated luxury. Tailored to perfection, styled for the avant-garde.",
          quoteCaption: "Atelier Aurevilux Editorial",
          description:
            "A curation of timeless silhouettes and modern craftsmanship, defining confident individuality through sophisticated design and understated luxury. Tailored to perfection, styled for the avant-garde.",
          story:
            "Founded on the principles of immaculate bespoke tailoring and rare artisan sourcing, Aurevilux represents the pinnacle of modern luxury. Each collection is carefully orchestrated in limited quantities to preserve exclusivity and honor timeless craftsmanship.",
          mainImage: "/images/fashion_models/luxury_lookbook_hero.jpg",
          leftImage: "/images/fashion_models/featured_categories_men.jpg",
          rightImage: "/images/fashion_models/featured_categories_women.jpg",
          galleryImages: [],
        },
      };
    }
  },

  // Update business info (Admin/Superadmin)
  updateBusinessInfo: async (info: Partial<BusinessInfo>): Promise<BusinessInfo> => {
    const { data } = await api.put<{ message: string; data: BusinessInfo }>("/business", info);
    return data.data;
  },
};
