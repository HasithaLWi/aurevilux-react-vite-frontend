import React, { useRef } from "react";
import { gsap, useGSAP, motionTokens } from "../../animations";
import { useNavigate } from "react-router-dom";

const FeaturedCategories: React.FC = () => {
  interface FeaturedCategory {
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

  const categories: FeaturedCategory[] = [
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
      description:
        "Sartorial Precision. Refined style for the contemporary man.",
      image: "/images/fashion_models/featured_categories_men.jpeg",
      link: "/shop?category=men",
      buttonText: "EXPLORE MEN",
    },
    {
      id: "accessories",
      title: "ACCESSORIES",
      description:
        "The Essential Accent. Statement pieces to elevate every look.",
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
  const sectionRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();

  const handleNavigate = (department: string) => {
    if (department) {
      navigate(`/shop?search=${encodeURIComponent(department.trim())}`);
    }
  };

  useGSAP(
    () => {
      if (window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches) {
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 85%",
          once: true,
        },
        defaults: {
          ease: motionTokens.ease.editorial,
        },
      });

      tl.fromTo(
        "[data-reveal-title]",
        { opacity: 0, y: motionTokens.distance.subtle },
        { opacity: 1, y: 0, duration: motionTokens.duration.standard },
      ).fromTo(
        "[data-category-card]",
        { opacity: 0, y: motionTokens.distance.reveal },
        {
          opacity: 1,
          y: 0,
          duration: motionTokens.duration.reveal,
          stagger: motionTokens.stagger.standard,
          clearProps: "opacity,transform",
        },
        "-=0.2",
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      ref={sectionRef}
      className="bg-brand-black w-full py-20 md:py-28 border-t border-zinc-900 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Title */}
        <div data-reveal-title className="text-center mb-16 md:mb-20">
          <h2 className="font-serif text-3xl md:text-5xl text-brand-gold tracking-[0.2em] uppercase">
            Featured Categories
          </h2>
          <div className="w-12 h-[1px] bg-brand-burgundy mx-auto mt-4" />
        </div>

        {/* Asymmetric Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-16 gap-x-10 items-start">
          {categories.map((category, index) => {
            const isOffsetDown = index === 1;
            const isOffsetUp = index === 2;
            const isOffsetLower = index === 3;

            return (
              <div
                key={category.id}
                data-category-card
                className={`group relative w-full aspect-[4/3] lg:aspect-[1.4/1] overflow-hidden rounded bg-brand-dark border border-zinc-800/30 ${
                  isOffsetDown
                    ? "lg:mt-16"
                    : isOffsetUp
                      ? "lg:-mt-8"
                      : isOffsetLower
                        ? "lg:mt-8"
                        : ""
                }`}
              >
                <img
                  src={category.image}
                  alt={category.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-[0.75]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-transparent" />

                <div className="absolute bottom-6 left-6 md:bottom-8 md:left-8 space-y-2 max-w-[80%]">
                  <h3 className="font-serif text-3xl md:text-4xl text-white tracking-widest font-light uppercase">
                    {category.title}
                  </h3>
                  <p className="text-xs text-zinc-300 font-light leading-relaxed">
                    {category.description}
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => handleNavigate(category.title)}
                      className="inline-block bg-brand-gold hover:bg-brand-goldLight text-black text-[10px] font-bold tracking-[0.2em] px-5 py-2.5 rounded transition-all duration-300 uppercase shadow-md"
                    >
                      {category.buttonText}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
