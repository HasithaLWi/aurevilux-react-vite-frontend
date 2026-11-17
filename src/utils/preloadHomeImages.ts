import { HERO_SLIDES } from "../components/home/hero/heroData";
import { COLLECTION_SCENES } from "../components/home/new-collection/collectionData";

// Module-level cache so in-session navigation to Home doesn't re-wait
let hasPreloadedInSession = false;

/**
 * Preloads and GPU-decodes all high-resolution imagery for both
 * the Hero Carousel and New Collection components before first paint.
 *
 * @param timeoutMs Maximum time to wait before gracefully revealing content (default: 4500ms)
 */
export const preloadHomeImages = (timeoutMs = 4500): Promise<void> => {
  if (hasPreloadedInSession) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const urls = new Set<string>();

    // 1. Gather all Hero slides assets
    HERO_SLIDES.forEach((slide) => {
      if (slide.backgroundImage) urls.add(slide.backgroundImage);
      if (slide.modelImage) urls.add(slide.modelImage);
      if (slide.lookCard?.image) urls.add(slide.lookCard.image);
    });

    // 2. Gather all New Collection scenes assets
    COLLECTION_SCENES.forEach((scene) => {
      if (scene.backgroundImage) urls.add(scene.backgroundImage);
      if (scene.modelImage) urls.add(scene.modelImage);
      if (scene.thumbnail) urls.add(scene.thumbnail);
    });

    if (urls.size === 0) {
      hasPreloadedInSession = true;
      resolve();
      return;
    }

    let loadedCount = 0;
    const total = urls.size;
    let isDone = false;

    const finish = () => {
      if (!isDone) {
        isDone = true;
        hasPreloadedInSession = true;
        resolve();
      }
    };

    // Safety timeout: If connection is poor, smoothly proceed rather than freeze
    const timer = setTimeout(finish, timeoutMs);

    const onAssetDone = () => {
      loadedCount++;
      if (loadedCount >= total) {
        clearTimeout(timer);
        finish();
      }
    };

    urls.forEach((src) => {
      const img = new Image();
      img.onload = () => {
        if ("decode" in img) {
          img.decode().catch(() => {}).finally(onAssetDone);
        } else {
          onAssetDone();
        }
      };
      img.onerror = onAssetDone;
      img.src = src;
    });
  });
};
