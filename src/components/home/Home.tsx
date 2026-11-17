import { useState, useEffect } from "react";
import Hero from "./hero/Hero";
import NewCollection from "./NewCollection";
import FeaturedCategories from "./FeaturedCategories";
import BestSellers from "./BestSellers";
import Lookbook from "./Lookbook";
import FeaturedBrands from "./FeaturedBrands";
import WhyShop from "./WhyShop";
import Testimonials from "./Testimonials";
import Newsletter from "./Newsletter";
import { ScrollTrigger } from "../../animations";
import { FloatingFeedbackPrompt } from "../common/FloatingFeedbackPrompt";
import { preloadHomeImages } from "../../utils/preloadHomeImages";
import { HomeSkeleton } from "./HomeSkeleton";

const Home = () => {
  const [showOverlay, setShowOverlay] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Preload & GPU-decode all Hero and New Collection imagery
    preloadHomeImages(4000).then(() => {
      if (!isMounted) return;
      setFadeOut(true);
      setTimeout(() => {
        if (isMounted) {
          setShowOverlay(false);
          ScrollTrigger.refresh();
        }
      }, 600);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Recalculate ScrollTrigger start points once live components settle
    const refreshTriggers = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("load", refreshTriggers);
    const timer = setTimeout(refreshTriggers, 600);

    return () => {
      window.removeEventListener("load", refreshTriggers);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div className="w-full flex flex-col items-center relative">
      {/* Luxury Golden Shimmer Skeleton Overlay (Mounts on top; fades out gracefully without DOM shift) */}
      {showOverlay && (
        <div
          className={`fixed inset-0 z-40 transition-opacity duration-600 ease-out pointer-events-none ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}
        >
          <HomeSkeleton />
        </div>
      )}

      {/* 1. Preserved Hero Campaign with interactive video */}
      <Hero />

      {/* 2. Brand Spotlight / Autumn Collection */}
      <NewCollection />

      {/* 3. Masonry Category Selection */}
      <FeaturedCategories />

      {/* 4. Filterable Premium Product Catalog */}
      <BestSellers />

      {/* 5. Lookbook Collage & Large Quote */}
      <Lookbook />

      {/* 6. Partner Brands Showcase */}
      <FeaturedBrands />

      {/* 7. USP / Benefits Grid */}
      <WhyShop />

      {/* 8. Testimonials Review Slider */}
      <Testimonials />

      {/* 9. Membership Join Segment */}
      <Newsletter />

      {/* 10. First-Visit Luxury Floating Feedback Concierge */}
      <FloatingFeedbackPrompt />
    </div>
  );
};

export default Home;