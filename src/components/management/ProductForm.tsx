import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  ShoppingBag,
  Sliders,
  Palette,
  Layers,
  FileText,
  AlertCircle,
  Film,
  Eye,
  CheckCircle2,
} from "lucide-react";
import type { Product, Brand, Category, ProductColor, ProductSpec } from "../../types";
import { ProductService } from "../../services/product.service";
import { BrandService } from "../../services/brand.service";
import { CategoryService } from "../../services/category.service";
import { UploadService } from "../../services/upload.service";
import { validateImageFile, isSupabaseStorageUrl } from "../../utils/imageValidation";
import { useLuxuryAlert } from "../../context/LuxuryAlertContext";

interface ProductFormProps {
  product: Product | null;
  onSave: (savedProduct: Product) => void;
  onCancel: () => void;
}

// Helper to robustly match a product's brand (ObjectId, name, slug, or brandDetails) to a brand in the reference list
function resolveBrandId(prod: Product | null | undefined, brandList: Brand[]): string {
  if (!brandList || brandList.length === 0) return "";
  if (!prod) return brandList[0]?._id || brandList[0]?.id || "";

  const raw = prod.brand;
  const brandDetails = (prod as any).brandDetails;

  // 1. Direct match on _id / id
  const matchById = brandList.find(
    (b) => (b._id && b._id === raw) || (b.id && b.id === raw)
  );
  if (matchById) return matchById._id || matchById.id || "";

  // 2. Match brandDetails._id or id
  if (brandDetails?._id || brandDetails?.id) {
    const targetId = brandDetails._id || brandDetails.id;
    const match = brandList.find((b) => b._id === targetId || b.id === targetId);
    if (match) return match._id || match.id || "";
  }

  // 3. Match by name (case-insensitive, e.g. "Cartier", "Chanel", "Burberry", "Gucci")
  const targetName = (
    typeof raw === "string" ? raw : brandDetails?.name || ""
  ).trim().toLowerCase();
  if (targetName) {
    const matchByName = brandList.find(
      (b) => b.name?.trim().toLowerCase() === targetName
    );
    if (matchByName) return matchByName._id || matchByName.id || "";
  }

  // 4. Match by slug
  const targetSlug = (brandDetails?.slug || "").trim().toLowerCase();
  if (targetSlug) {
    const matchBySlug = brandList.find(
      (b) => b.slug?.trim().toLowerCase() === targetSlug
    );
    if (matchBySlug) return matchBySlug._id || matchBySlug.id || "";
  }

  return brandList[0]?._id || brandList[0]?.id || "";
}

// Helper to robustly match a product's category (ObjectId, slug, title, or categoryDetails) to a category in the reference list
function resolveCategoryId(prod: Product | null | undefined, catList: Category[]): string {
  if (!catList || catList.length === 0) return "";
  if (!prod) return catList[0]?._id || catList[0]?.id || catList[0]?.slug || "";

  const raw = prod.category;
  const catDetails = (prod as any).categoryDetails;

  // 1. Direct match on _id / id
  const matchById = catList.find(
    (c) => (c._id && c._id === raw) || (c.id && c.id === raw)
  );
  if (matchById) return matchById._id || matchById.id || matchById.slug || "";

  // 2. Match categoryDetails._id or id
  if (catDetails?._id || catDetails?.id) {
    const targetId = catDetails._id || catDetails.id;
    const match = catList.find((c) => c._id === targetId || c.id === targetId);
    if (match) return match._id || match.id || match.slug || "";
  }

  // 3. Match by slug (e.g. "jewelry", "coats", "gowns", "dresses", "suits")
  const targetSlug = (
    typeof raw === "string" ? raw : catDetails?.slug || ""
  ).trim().toLowerCase();
  if (targetSlug) {
    const matchBySlug = catList.find(
      (c) => c.slug?.trim().toLowerCase() === targetSlug
    );
    if (matchBySlug) return matchBySlug._id || matchBySlug.id || matchBySlug.slug || "";
  }

  // 4. Match by title (e.g. "Jewelry", "Coats", "Gowns")
  const targetTitle = (
    catDetails?.title || (typeof raw === "string" ? raw : "")
  ).trim().toLowerCase();
  if (targetTitle) {
    const matchByTitle = catList.find(
      (c) => c.title?.trim().toLowerCase() === targetTitle
    );
    if (matchByTitle) return matchByTitle._id || matchByTitle.id || matchByTitle.slug || "";
  }

  return catList[0]?._id || catList[0]?.id || catList[0]?.slug || "";
}

export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onCancel,
}) => {
  const { showAlert } = useLuxuryAlert();
  const isEditing = Boolean(product);

  // Reference data
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingRefs, setIsLoadingRefs] = useState(true);

  // Form Fields
  const [name, setName] = useState(product?.name || "");
  const [slug, setSlug] = useState(product?.slug || "");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [departments, setDepartments] = useState<string[]>(() => {
    const dept = product?.department;
    if (Array.isArray(dept) && dept.length > 0) {
      return dept.map((d) => String(d).toUpperCase());
    }
    if (typeof dept === "string" && dept.trim()) {
      return [dept.trim().toUpperCase()];
    }
    return ["WOMEN"];
  });
  const [price, setPrice] = useState<number | string>(product?.price ?? 1200);
  const [stockCount, setStockCount] = useState<number | string>(product?.stockCount ?? 10);
  const [description, setDescription] = useState(product?.description || "");
  const [longDescription, setLongDescription] = useState(product?.longDescription || "");
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [colors, setColors] = useState<ProductColor[]>(product?.colors || []);
  const [sizes, setSizes] = useState<string[]>(product?.sizes || ["XS", "S", "M", "L"]);
  const [sizeStock, setSizeStock] = useState<Array<{ size: string; quantity: number }>>(() => {
    if (product?.sizeStock && product.sizeStock.length > 0) {
      return product.sizeStock;
    }
    const defaultSizes = product?.sizes || ["XS", "S", "M", "L"];
    const baseQty = Math.max(1, Math.floor(Number(product?.stockCount || 10) / (defaultSizes.length || 1)));
    return defaultSizes.map((s) => ({ size: s, quantity: baseQty }));
  });
  const [specifications, setSpecifications] = useState<ProductSpec[]>(
    product?.specifications && product.specifications.length > 0
      ? product.specifications
      : [
          { label: "Material", value: "100% Virgin Wool & Silk Lining" },
          { label: "Craftsmanship", value: "Handcrafted in Florence Atelier" },
        ]
  );
  const [isActive, setIsActive] = useState<boolean>(product?.isActive ?? true);
  const [isBestSeller, setIsBestSeller] = useState<boolean>(product?.isBestSeller ?? false);
  const [isNewArrival, setIsNewArrival] = useState<boolean>(product?.isNewArrival ?? true);

  // Cinematic Editorial Video state (optional)
  const [backgroundVideo, setBackgroundVideo] = useState(
    product?.editorialVideo?.backgroundVideo || ""
  );
  const [transparentVideoWebm, setTransparentVideoWebm] = useState(
    product?.editorialVideo?.transparentVideoWebm || ""
  );
  const [transparentVideoHevc, setTransparentVideoHevc] = useState(
    product?.editorialVideo?.transparentVideoHevc || ""
  );
  const [videoPoster, setVideoPoster] = useState(
    product?.editorialVideo?.poster || ""
  );
  const [videoDuration, setVideoDuration] = useState<number | string>(
    product?.editorialVideo?.duration ?? 7
  );

  // Color input state
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#0a0a0c");

  // Size input state
  const [customSize, setCustomSize] = useState("");

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingVideoField, setUploadingVideoField] = useState<
    "backgroundVideo" | "transparentVideoWebm" | "transparentVideoHevc" | "poster" | null
  >(null);
  const [previewMedia, setPreviewMedia] = useState<{
    url: string;
    title: string;
    isVideo: boolean;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load brands and categories for dropdowns
  useEffect(() => {
    async function loadRefs() {
      try {
        const [bList, cList] = await Promise.all([
          BrandService.getBrands(true),
          CategoryService.getCategories(),
        ]);
        const validBrands = bList || [];
        const validCategories = cList || [];
        setBrands(validBrands);
        setCategories(validCategories);

        // Resolve brand and category selection accurately
        setSelectedBrand(resolveBrandId(product, validBrands));
        setSelectedCategory(resolveCategoryId(product, validCategories));
      } catch (e) {
        console.warn("Failed to load reference brands or categories:", e);
      } finally {
        setIsLoadingRefs(false);
      }
    }
    loadRefs();
  }, [product]);

  // Synchronize brand and category whenever references or product change
  useEffect(() => {
    if (brands.length > 0) {
      setSelectedBrand(resolveBrandId(product, brands));
    }
  }, [product, brands]);

  useEffect(() => {
    if (categories.length > 0) {
      setSelectedCategory(resolveCategoryId(product, categories));
    }
  }, [product, categories]);

  // Synchronize all form fields if product prop changes
  useEffect(() => {
    if (product) {
      setName(product.name || "");
      setSlug(product.slug || "");
      const dept = product.department;
      if (Array.isArray(dept) && dept.length > 0) {
        setDepartments(dept.map((d) => String(d).toUpperCase()));
      } else if (typeof dept === "string" && dept.trim()) {
        setDepartments([dept.trim().toUpperCase()]);
      } else {
        setDepartments(["WOMEN"]);
      }
      setPrice(product.price ?? 1200);
      setStockCount(product.stockCount ?? 10);
      setDescription(product.description || "");
      setLongDescription(product.longDescription || "");
      setImages(product.images || []);
      setColors(product.colors || []);
      setSizes(product.sizes || ["XS", "S", "M", "L"]);
      if (product.sizeStock && product.sizeStock.length > 0) {
        setSizeStock(product.sizeStock);
      } else {
        const defaultSizes = product.sizes || ["XS", "S", "M", "L"];
        const baseQty = Math.max(1, Math.floor(Number(product.stockCount || 10) / (defaultSizes.length || 1)));
        setSizeStock(defaultSizes.map((s) => ({ size: s, quantity: baseQty })));
      }
      setSpecifications(
        product.specifications && product.specifications.length > 0
          ? product.specifications
          : [
              { label: "Material", value: "100% Virgin Wool & Silk Lining" },
              { label: "Craftsmanship", value: "Handcrafted in Florence Atelier" },
            ]
      );
      setIsActive(product.isActive ?? true);
      setIsBestSeller(product.isBestSeller ?? false);
      setIsNewArrival(product.isNewArrival ?? true);
      setBackgroundVideo(product.editorialVideo?.backgroundVideo || "");
      setTransparentVideoWebm(product.editorialVideo?.transparentVideoWebm || "");
      setTransparentVideoHevc(product.editorialVideo?.transparentVideoHevc || "");
      setVideoPoster(product.editorialVideo?.poster || "");
      setVideoDuration(product.editorialVideo?.duration ?? 7);
    }
  }, [product]);

  // Auto-generate slug when name changes (if creating or slug not manually modified)
  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  // Toggle department in array
  const toggleDepartment = (dept: string) => {
    setDepartments((prev) =>
      prev.includes(dept)
        ? prev.length > 1
          ? prev.filter((d) => d !== dept)
          : prev
        : [...prev, dept]
    );
  };

  // Handle Supabase Multi-Image Upload (Max 5)
  // Validates file types and sizes; uploads to Supabase and saves links to database
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    if (images.length + files.length > 5) {
      showAlert("warning", "Aurevilux policy allows a maximum of 5 images per luxury piece.", "Image Limit Reached");
      e.target.value = "";
      return;
    }

    // 1. Optimize validation logic for all selected files
    for (const file of files) {
      const val = validateImageFile(file, { maxSizeMB: 5 });
      if (!val.valid) {
        showAlert("warning", val.error || `File ${file.name} failed image validation.`);
        e.target.value = "";
        return;
      }
    }

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const res = await UploadService.uploadAndReplace(file, {
          folder: "products",
          bucket: "aurevilux-products",
          validation: { maxSizeMB: 5 },
        });
        const url = res?.publicUrl || (res as any)?.url;
        if (url) uploadedUrls.push(url);
      }

      const nextImages = [...images, ...uploadedUrls];
      setImages(nextImages);

      // 2. If editing an existing product, persist new image links to database immediately
      if (isEditing && product) {
        const prodId = product._id || product.id || product.slug;
        if (prodId) {
          await ProductService.updateProduct(prodId, { images: nextImages });
        }
      }

      showAlert("success", `Successfully uploaded ${uploadedUrls.length} piece image(s) to Supabase Storage & saved to database.`);
    } catch (err: any) {
      showAlert("error", "Supabase image upload failed: " + (err.message || err));
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = async (index: number) => {
    const targetUrl = images[index];
    const nextImages = images.filter((_, i) => i !== index);
    setImages(nextImages);

    // 1. If image was in Supabase storage, purge it so no orphaned files remain
    if (targetUrl && isSupabaseStorageUrl(targetUrl)) {
      try {
        await UploadService.deleteImage(targetUrl);
      } catch (err) {
        console.warn("Could not purge product photo from Supabase:", err);
      }
    }

    // 2. If editing an existing product, update database immediately
    if (isEditing && product) {
      const prodId = product._id || product.id || product.slug;
      if (prodId) {
        try {
          await ProductService.updateProduct(prodId, { images: nextImages });
        } catch {}
      }
    }

    showAlert("info", "Piece photo removed and purged from Supabase Storage.");
  };

  // ─── Handle Supabase Video Upload (Bucket: aurevilux-videos) ───────────────────
  // 1. Checks if video already in Supabase; if so, purges previous video from storage.
  // 2. Uploads new video to Supabase Storage bucket.
  // 3. Immediately saves link to database if editing existing piece.
  const handleVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "backgroundVideo" | "transparentVideoWebm" | "transparentVideoHevc" | "poster"
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    let previousUrl = "";
    if (field === "backgroundVideo") previousUrl = backgroundVideo;
    else if (field === "transparentVideoWebm") previousUrl = transparentVideoWebm;
    else if (field === "transparentVideoHevc") previousUrl = transparentVideoHevc;
    else if (field === "poster") previousUrl = videoPoster;

    setUploadingVideoField(field);

    try {
      const isPoster = field === "poster";
      const targetBucket = isPoster ? "aurevilux-products" : "aurevilux-videos";
      const targetFolder = isPoster ? "products/posters" : "videos";

      // 1 & 2. Upload to Supabase bucket aurevilux-videos (or aurevilux-products for poster)
      // Server checks if previousUrl is in Supabase; if so, purges it from storage
      const res = await UploadService.uploadVideoAndReplace(file, {
        bucket: targetBucket,
        folder: targetFolder,
        previousUrl: previousUrl || undefined,
        validation: isPoster
          ? {
              allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
              allowedExtensions: ["jpg", "jpeg", "png", "webp", "avif"],
              maxSizeMB: 15,
            }
          : {
              allowedMimeTypes: [
                "video/webm",
                "video/mp4",
                "video/quicktime",
                "video/x-matroska",
                "video/ogg",
              ],
              allowedExtensions: ["webm", "mp4", "mov", "mkv", "ogv"],
              maxSizeMB: 100,
            },
      });

      const newUrl = res?.publicUrl || (res as any)?.url;
      if (!newUrl) {
        throw new Error("No public URL returned from Supabase storage.");
      }

      // Update local state
      let updatedBg = backgroundVideo;
      let updatedWebm = transparentVideoWebm;
      let updatedHevc = transparentVideoHevc;
      let updatedPoster = videoPoster;

      if (field === "backgroundVideo") {
        setBackgroundVideo(newUrl);
        updatedBg = newUrl;
      } else if (field === "transparentVideoWebm") {
        setTransparentVideoWebm(newUrl);
        updatedWebm = newUrl;
      } else if (field === "transparentVideoHevc") {
        setTransparentVideoHevc(newUrl);
        updatedHevc = newUrl;
      } else if (field === "poster") {
        setVideoPoster(newUrl);
        updatedPoster = newUrl;
      }

      // 3. Save link to database immediately if editing existing product
      if (isEditing && product) {
        const prodId = product._id || product.id || product.slug;
        if (prodId) {
          const editorialVideoPayload = {
            backgroundVideo: updatedBg.trim() || undefined,
            transparentVideoWebm: updatedWebm.trim() || undefined,
            transparentVideoHevc: updatedHevc.trim() || undefined,
            poster: updatedPoster.trim() || undefined,
            duration: Number(videoDuration) || 7,
          };

          await ProductService.updateProduct(prodId, {
            editorialVideo: editorialVideoPayload,
          });
          showAlert(
            "success",
            `Video uploaded to Supabase (${targetBucket}) and link saved to database.`
          );
        }
      } else {
        showAlert(
          "success",
          `Video uploaded to Supabase (${targetBucket}). Link ready for database submission.`
        );
      }
    } catch (err: any) {
      console.error("Video upload error:", err);
      showAlert("error", "Supabase video upload failed: " + (err.message || err));
    } finally {
      setUploadingVideoField(null);
      e.target.value = "";
    }
  };

  // Remove single video field and purge from Supabase Storage
  const handleClearVideoField = async (
    field: "backgroundVideo" | "transparentVideoWebm" | "transparentVideoHevc" | "poster"
  ) => {
    let targetUrl = "";
    let updatedBg = backgroundVideo;
    let updatedWebm = transparentVideoWebm;
    let updatedHevc = transparentVideoHevc;
    let updatedPoster = videoPoster;

    if (field === "backgroundVideo") {
      targetUrl = backgroundVideo;
      setBackgroundVideo("");
      updatedBg = "";
    } else if (field === "transparentVideoWebm") {
      targetUrl = transparentVideoWebm;
      setTransparentVideoWebm("");
      updatedWebm = "";
    } else if (field === "transparentVideoHevc") {
      targetUrl = transparentVideoHevc;
      setTransparentVideoHevc("");
      updatedHevc = "";
    } else if (field === "poster") {
      targetUrl = videoPoster;
      setVideoPoster("");
      updatedPoster = "";
    }

    if (targetUrl && isSupabaseStorageUrl(targetUrl)) {
      try {
        await UploadService.deleteVideo(targetUrl);
      } catch (err) {
        console.warn("Could not purge video from Supabase:", err);
      }
    }

    if (isEditing && product) {
      const prodId = product._id || product.id || product.slug;
      if (prodId) {
        try {
          const hasAny = Boolean(
            updatedBg.trim() ||
            updatedWebm.trim() ||
            updatedHevc.trim() ||
            updatedPoster.trim()
          );

          await ProductService.updateProduct(prodId, {
            editorialVideo: hasAny
              ? {
                  backgroundVideo: updatedBg.trim() || undefined,
                  transparentVideoWebm: updatedWebm.trim() || undefined,
                  transparentVideoHevc: updatedHevc.trim() || undefined,
                  poster: updatedPoster.trim() || undefined,
                  duration: Number(videoDuration) || 7,
                }
              : null,
          });
        } catch {}
      }
    }

    showAlert("info", "Video removed and purged from Supabase Storage.");
  };

  // Clear all video fields and purge from Supabase Storage
  const handleClearAllVideos = async () => {
    const urlsToPurge = [
      backgroundVideo,
      transparentVideoWebm,
      transparentVideoHevc,
      videoPoster,
    ].filter((u) => u && isSupabaseStorageUrl(u));

    setBackgroundVideo("");
    setTransparentVideoWebm("");
    setTransparentVideoHevc("");
    setVideoPoster("");
    setVideoDuration(7);

    for (const url of urlsToPurge) {
      try {
        await UploadService.deleteVideo(url);
      } catch (err) {
        console.warn("Could not purge video from Supabase:", err);
      }
    }

    if (isEditing && product) {
      const prodId = product._id || product.id || product.slug;
      if (prodId) {
        try {
          await ProductService.updateProduct(prodId, {
            editorialVideo: null,
          });
        } catch {}
      }
    }

    showAlert("info", "All video assets purged from Supabase Storage and database cleared.");
  };

  // Color management
  const handleAddColor = () => {
    if (!newColorName.trim()) return;
    setColors((prev) => [...prev, { name: newColorName.trim(), value: newColorHex }]);
    setNewColorName("");
    setNewColorHex("#0a0a0c");
  };

  const handleRemoveColor = (idx: number) => {
    setColors((prev) => prev.filter((_, i) => i !== idx));
  };

  // Size management
  const handleAddSize = (sz: string) => {
    const s = sz.trim();
    if (!s || sizes.includes(s)) return;
    setSizes((prev) => [...prev, s]);
    setSizeStock((prev) => [...prev, { size: s, quantity: 5 }]);
    setStockCount((prev) => Number(prev) + 5);
  };

  const handleRemoveSize = (sz: string) => {
    setSizes((prev) => prev.filter((s) => s !== sz));
    setSizeStock((prev) => {
      const updated = prev.filter((s) => s.size !== sz);
      const newTotal = updated.reduce((sum, item) => sum + item.quantity, 0);
      setStockCount(newTotal);
      return updated;
    });
  };

  const handleUpdateSizeQty = (sz: string, qty: number) => {
    const safeQty = Math.max(0, qty);
    setSizeStock((prev) => {
      const updated = prev.map((item) =>
        item.size === sz ? { ...item, quantity: safeQty } : item
      );
      const newTotal = updated.reduce((sum, item) => sum + item.quantity, 0);
      setStockCount(newTotal);
      return updated;
    });
  };

  const handleStockCountChange = (val: string) => {
    setStockCount(val);
    const num = Number(val);
    if (!isNaN(num) && num >= 0 && sizeStock.length === 1) {
      setSizeStock([{ size: sizeStock[0].size, quantity: num }]);
    }
  };

  // Specifications management
  const handleAddSpec = () => {
    setSpecifications((prev) => [...prev, { label: "", value: "" }]);
  };

  const handleUpdateSpec = (idx: number, field: "label" | "value", val: string) => {
    setSpecifications((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const handleRemoveSpec = (idx: number) => {
    setSpecifications((prev) => prev.filter((_, i) => i !== idx));
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Piece name is required.");
      return;
    }
    if (images.length === 0) {
      setErrorMessage("At least one luxury piece imagery photo is required.");
      return;
    }
    if (!selectedBrand) {
      setErrorMessage("Please select a Maison / Brand.");
      return;
    }
    if (!selectedCategory) {
      setErrorMessage("Please select a Category.");
      return;
    }

    const numericPrice = Number(price);
    const numericStock = Number(stockCount);

    if (isNaN(numericPrice) || numericPrice <= 0) {
      setErrorMessage("Please enter a valid price in USD.");
      return;
    }
    if (isNaN(numericStock) || numericStock < 0) {
      setErrorMessage("Please enter a valid stock unit count.");
      return;
    }

    // Resolve category label & title
    const catObj = categories.find(
      (c) => c._id === selectedCategory || c.id === selectedCategory || c.slug === selectedCategory
    );
    const catTitle = catObj?.title || selectedCategory;
    const primaryDept = departments[0] || "COUTURE";
    const catLabel = `${primaryDept} / ${catTitle.toUpperCase()}`;

    const finalSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const hasAnyVideo = Boolean(
      backgroundVideo.trim() ||
      transparentVideoWebm.trim() ||
      transparentVideoHevc.trim() ||
      videoPoster.trim()
    );

    const editorialVideoPayload = hasAnyVideo
      ? {
          backgroundVideo: backgroundVideo.trim() || undefined,
          transparentVideoWebm: transparentVideoWebm.trim() || undefined,
          transparentVideoHevc: transparentVideoHevc.trim() || undefined,
          poster: videoPoster.trim() || undefined,
          duration: Number(videoDuration) || 7,
        }
      : null;

    const payload: Partial<Product> = {
      name: name.trim(),
      slug: finalSlug,
      brand: selectedBrand,
      category: selectedCategory,
      categoryLabel: catLabel,
      department: departments.map((d) => String(d).toUpperCase()),
      price: numericPrice,
      stockCount: numericStock,
      inStock: numericStock > 0,
      description: description.trim() || `${name.trim()} tailored for Aurevilux atelier fine living.`,
      longDescription: longDescription.trim() || description.trim() || `${name.trim()} tailored for Aurevilux atelier fine living.`,
      images: images.slice(0, 5),
      colors,
      sizes,
      sizeStock,
      specifications: specifications.filter((s) => s.label.trim() && s.value.trim()),
      isActive,
      isBestSeller,
      isNewArrival,
      editorialVideo: editorialVideoPayload,
    };

    setIsSaving(true);
    try {
      let savedResult: Product;
      if (isEditing && product) {
        const id = product._id || product.id || product.slug;
        savedResult = await ProductService.updateProduct(id, payload);
        showAlert("success", `Piece "${savedResult.name}" updated successfully.`);
      } else {
        savedResult = await ProductService.createProduct(payload);
        showAlert("success", `Piece "${savedResult.name}" created and added to catalog.`);
      }

      // Ensure returned product has populated brand name and category slug for immediate UI consistency
      const brandObj = brands.find(
        (b) => (b._id && b._id === selectedBrand) || (b.id && b.id === selectedBrand)
      );
      const enhancedResult: Product = {
        ...savedResult,
        brand: brandObj?.name || (savedResult as any).brand || selectedBrand,
        brandDetails: brandObj
          ? { _id: brandObj._id || brandObj.id, name: brandObj.name, slug: brandObj.slug || "" }
          : (savedResult as any).brandDetails,
        category: catObj?.slug || (savedResult as any).category || selectedCategory,
        categoryDetails: catObj
          ? { _id: catObj._id || catObj.id, title: catObj.title, slug: catObj.slug || "" }
          : (savedResult as any).categoryDetails,
        categoryLabel: catLabel,
      };
      onSave(enhancedResult);
    } catch (err: any) {
      console.error("Failed to save product:", err);
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to persist luxury piece in database.";
      setErrorMessage(msg);
      showAlert("error", msg, "Atelier Persistence Error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full text-left space-y-8 animate-fade-in pb-16">
      {/* Top Bar Navigation & Actions */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 bg-[#121216] hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800 transition-colors"
            title="Return to Catalog Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
                ATELIER WORKSHOP
              </span>
              <span className="text-zinc-600 text-xs">&bull;</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                {isEditing ? "PRODUCT EDITING SUITE" : "NEW PIECE CREATION"}
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
              {isEditing ? `Edit: ${name || "Untitled Piece"}` : "Add Luxury Piece"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs uppercase tracking-wider rounded font-medium transition-colors"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isUploading}
            className="px-6 py-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2 shadow-lg shadow-brand-burgundy/30 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEditing ? "Save & Publish Changes" : "Create & Publish Piece"}</span>
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-4 bg-red-950/40 border border-red-900 text-red-200 text-xs rounded-lg flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider block">Submission Error</span>
            <p className="mt-0.5 font-light">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: 2 Cols Wide - Core Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Essential Information */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3">
              <ShoppingBag className="w-4 h-4 text-brand-gold" />
              <h2 className="font-serif text-base uppercase text-white tracking-wider font-semibold">
                Essential Identification
              </h2>
            </div>

            <div className="space-y-4">
              {/* Row 1: Piece Title & URL Slug */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                    Piece Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sculpted Silk Organza Gown"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-sm px-3.5 py-2.5 rounded text-white outline-none focus:border-brand-gold font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="sculpted-silk-organza-gown"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3.5 py-2.5 rounded text-zinc-300 font-mono outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* Row 2: Maison / Brand & Taxonomy Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                    Maison / Brand *
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    disabled={isLoadingRefs}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3.5 py-2.5 rounded text-white outline-none focus:border-brand-gold cursor-pointer"
                  >
                    {brands.length === 0 ? (
                      <option value="">No Maisons Registered</option>
                    ) : (
                      brands.map((b) => (
                        <option key={b.id || b._id} value={b._id || b.id}>
                          {b.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                    Taxonomy Category *
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    disabled={isLoadingRefs}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3.5 py-2.5 rounded text-white outline-none focus:border-brand-gold cursor-pointer"
                  >
                    {categories.length === 0 ? (
                      <option value="">No Categories Registered</option>
                    ) : (
                      categories.map((c) => (
                        <option key={c.id || c._id} value={c._id || c.id || c.slug}>
                          {c.title}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Row 3: Atelier Departments */}
              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-2">
                  Atelier Departments (Select all applicable)
                </label>
                <div className="flex flex-wrap gap-2">
                  {["WOMEN", "MEN", "ACCESSORIES"].map((dept) => {
                    const isSelected = departments.includes(dept);
                    return (
                      <button
                        type="button"
                        key={dept}
                        onClick={() => toggleDepartment(dept)}
                        className={`px-3.5 py-1.5 rounded text-xs font-mono font-semibold uppercase tracking-wider transition-all border ${
                          isSelected
                            ? "bg-brand-burgundy/80 text-white border-brand-burgundy shadow-sm"
                            : "bg-[#0a0a0c] text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
                        }`}
                      >
                        {dept}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Editorial & Atelier Description */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3">
              <FileText className="w-4 h-4 text-brand-gold" />
              <h2 className="font-serif text-base uppercase text-white tracking-wider font-semibold">
                Editorial & Storytelling
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                  Short Atelier Synopsis
                </label>
                <textarea
                  rows={2}
                  placeholder="Architectural lines tailored with Parisian craftsmanship..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs p-3 rounded text-white outline-none focus:border-brand-gold leading-relaxed"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                  Comprehensive Provenance & Craftsmanship Story
                </label>
                <textarea
                  rows={5}
                  placeholder="Every piece is assembled through over forty hours of hand-guided stitchwork..."
                  value={longDescription}
                  onChange={(e) => setLongDescription(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs p-3 rounded text-white outline-none focus:border-brand-gold leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Luxury Variations (Colors & Sizes) */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3">
              <Palette className="w-4 h-4 text-brand-gold" />
              <h2 className="font-serif text-base uppercase text-white tracking-wider font-semibold">
                Variations (Colors & Sizing)
              </h2>
            </div>

            {/* Colors */}
            <div className="space-y-3">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                Color Palette ({colors.length})
              </span>

              <div className="flex flex-wrap gap-2 items-center">
                {colors.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-[#0a0a0c] border border-zinc-800 px-3 py-1.5 rounded text-xs text-white"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-zinc-700"
                      style={{ backgroundColor: c.value }}
                    />
                    <span className="font-serif">{c.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">{c.value}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveColor(idx)}
                      className="text-zinc-500 hover:text-red-400 ml-1"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Color Form */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Color Name (e.g. Obsidian Noir)"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddColor();
                    }
                  }}
                  className="bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold flex-1"
                />
                <div className="flex items-center gap-2 bg-[#0a0a0c] border border-zinc-800 px-2 py-1 rounded">
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(e) => setNewColorHex(e.target.value)}
                    className="w-6 h-6 rounded border-0 cursor-pointer bg-transparent"
                  />
                  <span className="text-[10px] text-zinc-400 font-mono uppercase">{newColorHex}</span>
                </div>
                <button
                  type="button"
                  onClick={handleAddColor}
                  className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Sizing */}
            <div className="space-y-3 pt-3 border-t border-zinc-900">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                Available Sizes ({sizes.length})
              </span>

              <div className="flex flex-wrap gap-2 items-center">
                {sizes.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center gap-1.5 bg-[#0a0a0c] border border-zinc-800 px-2.5 py-1 rounded text-xs font-mono text-white"
                  >
                    <span>{s}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSize(s)}
                      className="text-zinc-500 hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Quick Size Presets & Custom Input */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] text-zinc-500 uppercase font-mono">Quick Add:</span>
                {["XS", "S", "M", "L", "XL", "XXL", "38", "40", "42", "44", "One Size"].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handleAddSize(preset)}
                    className="text-[10px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white px-2 py-0.5 rounded font-mono"
                  >
                    +{preset}
                  </button>
                ))}
                <div className="flex items-center gap-1 ml-auto">
                  <input
                    type="text"
                    placeholder="Custom size..."
                    value={customSize}
                    onChange={(e) => setCustomSize(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSize(customSize);
                        setCustomSize("");
                      }
                    }}
                    className="bg-[#0a0a0c] border border-zinc-800 text-xs px-2.5 py-1 rounded text-white outline-none w-28 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handleAddSize(customSize);
                      setCustomSize("");
                    }}
                    className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded text-[10px] font-semibold uppercase"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Size Stock Allocations */}
              {sizes.length > 0 && (
                <div className="pt-3 border-t border-zinc-900/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-brand-gold uppercase tracking-widest font-semibold block">
                      Inventory Allocation per Size (Total: {stockCount} units)
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      Real-time SKU variant tracking
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {sizeStock.map((item) => (
                      <div
                        key={item.size}
                        className="bg-[#0a0a0c] border border-zinc-800/80 p-2 rounded flex items-center justify-between gap-2"
                      >
                        <span className="text-xs font-mono font-semibold text-white">
                          {item.size}
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateSizeQty(item.size, parseInt(e.target.value) || 0)
                            }
                            className="w-14 bg-zinc-900 border border-zinc-700 text-xs px-2 py-0.5 rounded text-right text-brand-gold font-mono outline-none focus:border-brand-gold"
                          />
                          <span className="text-[9px] text-zinc-500 font-mono">pcs</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Card 4: Atelier Specifications */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-brand-gold" />
                <h2 className="font-serif text-base uppercase text-white tracking-wider font-semibold">
                  Atelier Specifications
                </h2>
              </div>
              <button
                type="button"
                onClick={handleAddSpec}
                className="text-[10px] text-brand-gold hover:underline uppercase tracking-wider font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Specification</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {specifications.map((spec, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Attribute (e.g. Material, Origin)"
                    value={spec.label}
                    onChange={(e) => handleUpdateSpec(idx, "label", e.target.value)}
                    className="bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-zinc-300 w-1/3 outline-none focus:border-brand-gold font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Specification Detail (e.g. 100% Cashmere)"
                    value={spec.value}
                    onChange={(e) => handleUpdateSpec(idx, "value", e.target.value)}
                    className="bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white flex-1 outline-none focus:border-brand-gold"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpec(idx)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 5: Cinematic Editorial Video Introduction (Optional) */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2.5">
                <Film className="w-4 h-4 text-brand-gold" />
                <div>
                  <h2 className="font-serif text-base uppercase text-white tracking-wider font-semibold">
                    Cinematic Video Introduction (Optional)
                  </h2>
                  <span className="text-[10px] text-zinc-500 font-mono block">
                    Two-layer synchronized luxury campaign opening &bull; Supabase Storage (aurevilux-videos)
                  </span>
                </div>
              </div>
              {(backgroundVideo || transparentVideoWebm || transparentVideoHevc || videoPoster) && (
                <button
                  type="button"
                  onClick={handleClearAllVideos}
                  className="text-[10px] text-zinc-500 hover:text-red-400 uppercase tracking-wider font-mono flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  <span>Clear All Videos</span>
                </button>
              )}
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              When specified, a synchronized two-layer editorial video introduction plays on page load: the background video fills the screen, and the transparent model moves in the foreground. Upload videos directly to the <span className="text-brand-gold font-mono">aurevilux-videos</span> Supabase bucket; previous files are automatically replaced and removed.
            </p>

            <div className="space-y-4 pt-1">
              {/* Row 1: Background Video + Transparent Video WebM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Background Video */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                      Background Video URL (WebM / MP4)
                    </label>
                    {backgroundVideo && isSupabaseStorageUrl(backgroundVideo) && (
                      <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Supabase Video
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="e.g. /media/videos/gown-bg.webm"
                        value={backgroundVideo}
                        onChange={(e) => setBackgroundVideo(e.target.value)}
                        className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3.5 py-2.5 rounded text-white font-mono outline-none focus:border-brand-gold pr-14"
                      />
                      {backgroundVideo && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewMedia({
                                url: backgroundVideo,
                                title: "Background Video Preview",
                                isVideo: true,
                              })
                            }
                            title="Preview video"
                            className="p-1 text-zinc-400 hover:text-brand-gold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearVideoField("backgroundVideo")}
                            title="Remove & purge from Supabase"
                            className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <label
                      className={`flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-brand-gold/60 text-zinc-300 hover:text-brand-gold rounded text-[11px] font-mono uppercase tracking-wider cursor-pointer transition-all shrink-0 ${
                        uploadingVideoField === "backgroundVideo"
                          ? "opacity-60 pointer-events-none"
                          : ""
                      }`}
                      title="Upload video to Supabase aurevilux-videos bucket"
                    >
                      {uploadingVideoField === "backgroundVideo" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-brand-gold" />
                      )}
                      <span>
                        {uploadingVideoField === "backgroundVideo" ? "Uploading..." : "Upload"}
                      </span>
                      <input
                        type="file"
                        accept="video/webm,video/mp4,video/*,.webm,.mp4"
                        onChange={(e) => handleVideoUpload(e, "backgroundVideo")}
                        disabled={uploadingVideoField !== null}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-1 block">
                    Original scene with background intact &bull; WebM or MP4
                  </span>
                </div>

                {/* 2. Transparent Foreground Video WebM */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                      Transparent Foreground Video (VP9 WebM with Alpha)
                    </label>
                    {transparentVideoWebm && isSupabaseStorageUrl(transparentVideoWebm) && (
                      <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Supabase Video
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="e.g. /media/videos/gown-fg-vp9.webm"
                        value={transparentVideoWebm}
                        onChange={(e) => setTransparentVideoWebm(e.target.value)}
                        className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3.5 py-2.5 rounded text-white font-mono outline-none focus:border-brand-gold pr-14"
                      />
                      {transparentVideoWebm && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewMedia({
                                url: transparentVideoWebm,
                                title: "Transparent Foreground VP9 Preview",
                                isVideo: true,
                              })
                            }
                            title="Preview video"
                            className="p-1 text-zinc-400 hover:text-brand-gold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearVideoField("transparentVideoWebm")}
                            title="Remove & purge from Supabase"
                            className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <label
                      className={`flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:border-brand-gold/60 text-zinc-300 hover:text-brand-gold rounded text-[11px] font-mono uppercase tracking-wider cursor-pointer transition-all shrink-0 ${
                        uploadingVideoField === "transparentVideoWebm"
                          ? "opacity-60 pointer-events-none"
                          : ""
                      }`}
                      title="Upload VP9 WebM alpha video to Supabase aurevilux-videos bucket"
                    >
                      {uploadingVideoField === "transparentVideoWebm" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-gold" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-brand-gold" />
                      )}
                      <span>
                        {uploadingVideoField === "transparentVideoWebm" ? "Uploading..." : "Upload"}
                      </span>
                      <input
                        type="file"
                        accept="video/webm,.webm"
                        onChange={(e) => handleVideoUpload(e, "transparentVideoWebm")}
                        disabled={uploadingVideoField !== null}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-1 block">
                    Same video with background removed (Chrome/Firefox/Edge)
                  </span>
                </div>
              </div>

              {/* Row 2: Safari HEVC + Poster Frame + Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 3. Safari HEVC Alpha */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                      Safari HEVC Alpha (Optional MP4)
                    </label>
                    {transparentVideoHevc && isSupabaseStorageUrl(transparentVideoHevc) && (
                      <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Supabase
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="e.g. /media/videos/gown-fg-hevc.mp4"
                        value={transparentVideoHevc}
                        onChange={(e) => setTransparentVideoHevc(e.target.value)}
                        className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3.5 py-2.5 rounded text-white font-mono outline-none focus:border-brand-gold pr-14"
                      />
                      {transparentVideoHevc && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewMedia({
                                url: transparentVideoHevc,
                                title: "Safari HEVC Alpha Video Preview",
                                isVideo: true,
                              })
                            }
                            title="Preview video"
                            className="p-1 text-zinc-400 hover:text-brand-gold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearVideoField("transparentVideoHevc")}
                            title="Remove & purge from Supabase"
                            className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <label
                      className={`flex items-center gap-1.5 px-2.5 py-2 bg-zinc-900 border border-zinc-800 hover:border-brand-gold/60 text-zinc-300 hover:text-brand-gold rounded text-[11px] font-mono uppercase tracking-wider cursor-pointer transition-all shrink-0 ${
                        uploadingVideoField === "transparentVideoHevc"
                          ? "opacity-60 pointer-events-none"
                          : ""
                      }`}
                      title="Upload HEVC MP4 to Supabase aurevilux-videos bucket"
                    >
                      {uploadingVideoField === "transparentVideoHevc" ? (
                        <Loader2 className="w-3 h-3 animate-spin text-brand-gold" />
                      ) : (
                        <Upload className="w-3 h-3 text-brand-gold" />
                      )}
                      <span>
                        {uploadingVideoField === "transparentVideoHevc" ? "..." : "Upload"}
                      </span>
                      <input
                        type="file"
                        accept="video/mp4,video/quicktime,.mp4,.mov"
                        onChange={(e) => handleVideoUpload(e, "transparentVideoHevc")}
                        disabled={uploadingVideoField !== null}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-1 block">
                    Apple Safari / iOS transparent video
                  </span>
                </div>

                {/* 4. Poster Frame Preview URL */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                      Poster Frame Preview URL (Optional)
                    </label>
                    {videoPoster && isSupabaseStorageUrl(videoPoster) && (
                      <span className="text-[9px] text-emerald-400 flex items-center gap-1 font-mono">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Supabase
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="e.g. /images/products/gown-poster.webp"
                        value={videoPoster}
                        onChange={(e) => setVideoPoster(e.target.value)}
                        className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3.5 py-2.5 rounded text-white font-mono outline-none focus:border-brand-gold pr-14"
                      />
                      {videoPoster && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              setPreviewMedia({
                                url: videoPoster,
                                title: "Poster Frame Preview",
                                isVideo: false,
                              })
                            }
                            title="Preview poster"
                            className="p-1 text-zinc-400 hover:text-brand-gold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearVideoField("poster")}
                            title="Remove & purge from Supabase"
                            className="p-1 text-zinc-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <label
                      className={`flex items-center gap-1.5 px-2.5 py-2 bg-zinc-900 border border-zinc-800 hover:border-brand-gold/60 text-zinc-300 hover:text-brand-gold rounded text-[11px] font-mono uppercase tracking-wider cursor-pointer transition-all shrink-0 ${
                        uploadingVideoField === "poster"
                          ? "opacity-60 pointer-events-none"
                          : ""
                      }`}
                      title="Upload poster image to Supabase"
                    >
                      {uploadingVideoField === "poster" ? (
                        <Loader2 className="w-3 h-3 animate-spin text-brand-gold" />
                      ) : (
                        <Upload className="w-3 h-3 text-brand-gold" />
                      )}
                      <span>{uploadingVideoField === "poster" ? "..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*,.webp,.jpg,.jpeg,.png"
                        onChange={(e) => handleVideoUpload(e, "poster")}
                        disabled={uploadingVideoField !== null}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <span className="text-[9px] text-zinc-500 mt-1 block">
                    High-res preview while buffering
                  </span>
                </div>

                {/* 5. Intro Duration */}
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                    Intro Duration (Seconds)
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    step="0.5"
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3.5 py-2.5 rounded text-brand-gold font-mono outline-none focus:border-brand-gold"
                  />
                  <span className="text-[9px] text-zinc-500 mt-1 block">
                    Auto-dissolve timing (Default: 7s)
                  </span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[10px] font-mono">
                <span className="text-zinc-500">
                  Status:{" "}
                  {backgroundVideo && transparentVideoWebm ? (
                    <span className="text-emerald-400 font-semibold">
                      &bull; Editorial Video Configured (Dual-Layer Active &bull; Supabase Storage)
                    </span>
                  ) : backgroundVideo ? (
                    <span className="text-brand-gold font-semibold">
                      &bull; Single Background Video Configured &bull; Supabase Storage
                    </span>
                  ) : (
                    <span className="text-zinc-500">
                      &bull; No Video (Standard Gallery Direct Load)
                    </span>
                  )}
                </span>
                {uploadingVideoField && (
                  <span className="text-brand-gold flex items-center gap-1.5 animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Uploading asset to Supabase (aurevilux-videos)...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: 1 Col Wide - Pricing, Stock & Imagery */}
        <div className="space-y-6">
          {/* Card 5: Valuation & Stock Count */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3">
              <Sliders className="w-4 h-4 text-brand-gold" />
              <h2 className="font-serif text-base uppercase text-white tracking-wider font-semibold">
                Valuation & Inventory
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                  Retail Price (USD $) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-serif font-bold text-sm">
                    $
                  </span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-sm pl-8 pr-3.5 py-2.5 rounded text-brand-gold font-serif font-bold outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                  Available Stock Units *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={stockCount}
                  onChange={(e) => handleStockCountChange(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-sm px-3.5 py-2.5 rounded text-white font-mono outline-none focus:border-brand-gold"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  {Number(stockCount) > 0 ? (
                    <span className="text-emerald-400 font-semibold">&bull; Listed as In Stock</span>
                  ) : (
                    <span className="text-red-400 font-semibold">&bull; Listed as Out of Stock</span>
                  )}
                </span>
              </div>
            </div>

            {/* Visibility & Merchandising Toggles */}
            <div className="space-y-3 pt-3 border-t border-zinc-900">
              <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-zinc-900/40">
                <div>
                  <span className="text-xs text-white uppercase font-semibold block">Storefront Visibility</span>
                  <span className="text-[10px] text-zinc-500 block">Live in boutique vs Atelier archive</span>
                </div>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0a0a0c] border-zinc-800 text-brand-burgundy focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-zinc-900/40">
                <div>
                  <span className="text-xs text-white uppercase font-semibold block">New Arrival Highlight</span>
                  <span className="text-[10px] text-zinc-500 block">Feature in New In collections</span>
                </div>
                <input
                  type="checkbox"
                  checked={isNewArrival}
                  onChange={(e) => setIsNewArrival(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0a0a0c] border-zinc-800 text-brand-burgundy focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-zinc-900/40">
                <div>
                  <span className="text-xs text-white uppercase font-semibold block">Best Seller Prestige</span>
                  <span className="text-[10px] text-zinc-500 block">Mark as high-demand atelier piece</span>
                </div>
                <input
                  type="checkbox"
                  checked={isBestSeller}
                  onChange={(e) => setIsBestSeller(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0a0a0c] border-zinc-800 text-brand-burgundy focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* Card 6: Supabase Image Gallery */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-brand-gold" />
                <h2 className="font-serif text-base uppercase text-white tracking-wider font-semibold">
                  Imagery Gallery
                </h2>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono">
                {images.length}/5 photos
              </span>
            </div>

            {/* Gallery Thumbnails */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {images.map((imgUrl, idx) => (
                <div
                  key={idx}
                  className="relative aspect-[3/4] rounded-lg bg-[#0a0a0c] border border-zinc-800 overflow-hidden group"
                >
                  <img
                    src={imgUrl}
                    alt={`Piece angle ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {idx === 0 && (
                    <span className="absolute top-1.5 left-1.5 bg-brand-gold/90 text-black text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shadow">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1.5 right-1.5 p-1 bg-black/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              {/* Upload Dropzone */}
              {images.length < 5 && (
                <label className="aspect-[3/4] border-2 border-dashed border-zinc-800 hover:border-brand-gold/60 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors text-zinc-500 hover:text-zinc-300 p-3 text-center">
                  <Upload className="w-5 h-5 mb-1.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">
                    Upload Photo
                  </span>
                  <span className="text-[8px] text-zinc-600 uppercase mt-0.5">
                    Supabase Bucket
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {isUploading && (
              <div className="flex items-center gap-2 text-xs text-brand-gold pt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Storing images in Supabase Storage...</span>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Media Preview Modal */}
      {previewMedia && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="bg-[#101014] border border-brand-gold/30 rounded-xl p-5 max-w-2xl w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-brand-gold" />
                <h3 className="font-serif text-sm uppercase tracking-wider text-white">
                  {previewMedia.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="p-1 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-lg overflow-hidden bg-black flex items-center justify-center min-h-[260px] max-h-[60vh] border border-zinc-900">
              {previewMedia.isVideo ? (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[58vh] w-auto max-w-full rounded"
                >
                  Your browser does not support HTML5 video preview.
                </video>
              ) : (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.title}
                  className="max-h-[58vh] w-auto max-w-full object-contain rounded"
                />
              )}
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-zinc-400">
              <span className="truncate max-w-md">{previewMedia.url}</span>
              <a
                href={previewMedia.url}
                target="_blank"
                rel="noreferrer"
                className="text-brand-gold hover:underline uppercase tracking-wider text-[10px]"
              >
                Open in tab &rarr;
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
