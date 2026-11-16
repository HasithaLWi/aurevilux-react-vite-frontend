import { useEffect } from "react";
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

const Home = () => {
  useEffect(() => {
    // Recalculate ScrollTrigger start points once dynamic images settle
    const refreshTriggers = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener("load", refreshTriggers);
    const timer = setTimeout(refreshTriggers, 500);

    return () => {
      window.removeEventListener("load", refreshTriggers);
      clearTimeout(timer);
    };
  }, []);

  return (

    <div className="w-full flex flex-col items-center">
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