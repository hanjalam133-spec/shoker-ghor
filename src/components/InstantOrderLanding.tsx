import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Check, AlertTriangle, ShieldCheck, Truck, RotateCcw, 
  Flame, Sparkles, MessageCircle, Volume2, VolumeX, 
  Play, Pause, Heart, MessageSquare, Share2, Award, Users, ShoppingBag, Image as ImageIcon
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { Product, Size, LandingPage, BD_DISTRICTS } from '../types';
import { formatCurrency } from '../lib/utils';

interface InstantOrderLandingProps {
  onClose?: () => void;
  featuredProduct?: Product;
  landingPage?: LandingPage;
}

const SIZES: Size[] = ['38', '40', '42', '44', '46'];

// Predefined mock buyer names and cities for high converting social proof alerts
const SIMULATED_BUYERS = [
  { name: 'আরিফুল ইসলাম', city: 'মিরপুর, ঢাকা', time: '১ মিনিট আগে' },
  { name: 'মাহমুদ হাসান', city: 'উত্তরা, ঢাকা', time: '৩ মিনিট আগে' },
  { name: 'জাকির হোসেন', city: 'চট্টগ্রাম সদর', time: '৫ মিনিট আগে' },
  { name: 'ইমরান খান', city: 'রাজশাহী', time: '৭ মিনিট আগে' },
  { name: 'সাইফুল ইসলাম', city: 'সিলেট', time: '৮ মিনিট আগে' },
  { name: 'আব্দুর রহমান', city: 'খুলনা', time: '১০ মিনিট আগে' },
  { name: 'তাসনিম আহমেদ', city: 'ধানমণ্ডি, ঢাকা', time: '১২ মিনিট আগে' },
  { name: 'মোহাম্মদ আলী', city: 'কুমিল্লা', time: '১৫ মিনিট আগে' }
];

export const InstantOrderLanding: React.FC<InstantOrderLandingProps> = ({ onClose, featuredProduct, landingPage }) => {
  const {
    products,
    placeOrder,
    isPhoneBlocked,
    isDailyOrderLimitReached,
    validateDiscountCode,
    pixelId,
    pixelAccessToken,
    storeLogo,
    storeName,
    phoneNumber,
    whatsappNumber,
    addOrUpdateIncompleteOrder,
    shippingInsideCost,
    shippingInsideText,
    shippingInsideDesc,
    shippingInsideShow,
    shippingOutsideCost,
    shippingOutsideText,
    shippingOutsideDesc,
    shippingOutsideShow,
    freeShippingEnabled,
    freeShippingThreshold,
    categoryImages
  } = useShop();

  // State management
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    if (landingPage) {
      const found = products.find(p => p.id === landingPage.productId);
      if (found) return found;
    }
    if (featuredProduct) return featuredProduct;
    // Default to the Samsung Punjabi or the first product in the list
    return products.find(p => p.id === 'led-high-tops-copy-copy') || products[0] || null;
  });

  // Sync selectedProduct when props change or products load
  useEffect(() => {
    if (landingPage) {
      const found = products.find(p => p.id === landingPage.productId);
      if (found) setSelectedProduct(found);
    } else if (featuredProduct) {
      setSelectedProduct(featuredProduct);
    } else if (products.length > 0 && (!selectedProduct || !products.find(p => p.id === selectedProduct.id))) {
      setSelectedProduct(products.find(p => p.id === 'led-high-tops-copy-copy') || products[0]);
    }
  }, [featuredProduct, landingPage, products]);

  // Safe fallback product object to guarantee no runtime null/undefined crashes
  const currentProduct: Product = (landingPage ? products.find(p => p.id === landingPage.productId) : selectedProduct) || featuredProduct || products[0] || {
    id: 'default-Product',
    title: 'প্রিমিয়াম কটন প্রোডাক্ট',
    price: 1450,
    image: 'https://images.unsplash.com/photo-1583391733959-b0510f6992dd?auto=format&fit=crop&q=80&w=800',
    category: 'সেমসেং প্রোডাক্ট',
    description: 'প্রিমিয়াম কোয়ালিটি সুতি প্রোডাক্ট। শহরের সেরা আরামদায়ক ও ট্রেন্ডি ডিজাইন।',
    inStock: true,
    sizes: ['38', '40', '42', '44', '46'],
    rating: 5,
    reviewsCount: 120
  };

  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const domain = window.location.origin && !window.location.origin.includes('localhost') ? window.location.origin : 'https://Shoker ghorbd.shop';
    let fullUrl = domain;
    if (landingPage) {
      const slug = landingPage.slug || landingPage.id;
      fullUrl = `${domain}/landing/${encodeURIComponent(slug)}`;
    } else if (currentProduct) {
      fullUrl = `${domain}/product/${encodeURIComponent(currentProduct.id)}`;
    } else {
      fullUrl = `${domain}/`;
    }
    const title = currentProduct?.title || landingPage?.title || 'প্রিমিয়াম প্রোডাক্ট কালেকশন';
    const copyText = `🎁 ${title}\n🔗 লিংক: ${fullUrl}\n🛒 অর্ডার করতে ভিজিট করুন: ${domain}`;

    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  // Sync activeImage whenever currentProduct id or default image changes
  useEffect(() => {
    if (currentProduct) {
      setActiveImage(currentProduct.image);
    }
  }, [currentProduct.id, currentProduct.image]);

  // Find the original base product from shop products to get its pristine image and gallery
  const baseProduct = products.find(p => p.id === currentProduct.id);
  const originalImage = baseProduct?.image || currentProduct.image;
  const originalGallery = baseProduct?.gallery || currentProduct.gallery || [];

  // Combine them into a stable static list of images representing all styles/colors without duplication
  const allImages = Array.from(new Set([
    originalImage,
    ...originalGallery,
    ...(landingPage?.galleryImages || [])
  ])).filter(Boolean) as string[];

  // Use custom discountPrice if this is the linked landing page product
  const activeProductPrice = (landingPage && currentProduct.id === landingPage.productId && landingPage.discountPrice)
    ? landingPage.discountPrice 
    : (currentProduct.price || 0);

  const availableSizes = landingPage?.sizes !== undefined ? landingPage.sizes : (currentProduct.sizes || []);

  const [selectedSize, setSelectedSize] = useState<Size | undefined>(() => {
    if (availableSizes && availableSizes.length > 0) {
      return availableSizes.includes('42') ? '42' : availableSizes[0];
    }
    return undefined;
  });

  // Keep selectedSize synced when availableSizes change
  useEffect(() => {
    if (availableSizes && availableSizes.length > 0) {
      if (!selectedSize || !availableSizes.includes(selectedSize)) {
        setSelectedSize(availableSizes[0]);
      }
    } else {
      setSelectedSize(undefined);
    }
  }, [availableSizes]);

  const [quantity, setQuantity] = useState(1);

  // Derive packages
  const packagesList = useMemo(() => {
    const fallbackPackages = [
      {
        id: 'default-pkg-1',
        name: '১ পিস প্রোডাক্ট অফার',
        price: activeProductPrice,
        quantity: 1,
        description: 'স্ট্যান্ডার্ড প্যাক'
      },
      {
        id: 'default-pkg-2',
        name: '২ পিস প্রোডাক্ট (কম্বো অফার)',
        price: Math.round(activeProductPrice * 2 - 130),
        quantity: 2,
        description: '৳১৩০ ডিসকাউন্ট!'
      },
      {
        id: 'default-pkg-3',
        name: '৩ পিস প্রোডাক্ট (ধামাকা কম্বো)',
        price: Math.round(activeProductPrice * 3 - 470),
        quantity: 3,
        description: '৳৪৭০ ছাড় + ফ্রি ডেলিভারি!'
      }
    ];

    const pkgs = (currentProduct.packages && currentProduct.packages.length > 0) ? currentProduct.packages : fallbackPackages; return pkgs.map((p, idx) => ({ ...p, id: p.id || `legacy-pkg-${idx}` }));
  }, [currentProduct.id, currentProduct.packages, activeProductPrice]);

  const [selectedPackageId, setSelectedPackageId] = useState<string>('');

  // Auto-select first package when packagesList changes
  useEffect(() => {
    if (packagesList && packagesList.length > 0) {
      setSelectedPackageId(packagesList[0].id);
    } else {
      setSelectedPackageId('');
    }
  }, [packagesList]);

  const selectedPackage = useMemo(() => {
    return packagesList.find(p => p.id === selectedPackageId) || packagesList[0];
  }, [packagesList, selectedPackageId]);

  const pkgImages = useMemo(() => {
    const pkgImgs = (selectedPackage as any)?.images;
    if (pkgImgs && Array.isArray(pkgImgs)) {
      const filtered = pkgImgs.filter(Boolean);
      if (filtered.length > 0) return filtered;
    }
    if (selectedPackage && categoryImages && categoryImages[selectedPackage.name]) {
      const imgs = categoryImages[selectedPackage.name];
      if (Array.isArray(imgs)) {
        const filtered = imgs.filter(Boolean);
        if (filtered.length > 0) return filtered;
      }
    }
    return allImages;
  }, [selectedPackage, categoryImages, allImages]);

  const [shippingMethod, setShippingMethod] = useState<'inside' | 'outside'>(() => {
    if (shippingInsideShow === false && shippingOutsideShow === true) {
      return 'outside';
    }
    return 'inside';
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; amount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [orderStep, setOrderStep] = useState<1 | 2>(1); // 1: Checkout Form, 2: Order Placed Successfully
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Video Mockup states
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [likesCount, setLikesCount] = useState(1420);
  const [isLiked, setIsLiked] = useState(false);
  const [reelProgress, setReelProgress] = useState(0);

  // Form Fields
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Dhaka',
    district: 'ঢাকা',
    paymentMethod: 'COD'
  });

  // Live order calculations with safe fallbacks
  const subtotal = selectedPackage 
    ? (selectedPackage.price * quantity) 
    : (activeProductPrice * quantity);

  const isFreeShipping = selectedPackage 
    ? (selectedPackage.description?.toLowerCase().includes('ফ্রি') || 
       selectedPackage.description?.toLowerCase().includes('free') || 
       selectedPackage.name.toLowerCase().includes('ফ্রি') || 
       selectedPackage.name.toLowerCase().includes('free') ||
       (freeShippingEnabled && selectedPackage.quantity >= freeShippingThreshold))
    : (freeShippingEnabled && quantity >= freeShippingThreshold);

  const shippingCharge: number = isFreeShipping 
    ? 0 
    : (shippingMethod === 'inside' ? shippingInsideCost : shippingOutsideCost);
  const discountAmount = appliedCoupon ? appliedCoupon.amount : 0;
  const total = Math.max(0, subtotal + shippingCharge - discountAmount);

  const draftOrderIdRef = useRef<string>(`INC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`);

  const saveDraftOrder = (customData = formData) => {
    const phoneClean = (customData.phone || '').trim().replace(/\D/g, '');
    // N/A Prevention: Only save as draft if phone has at least 11 digits
    if (phoneClean.length >= 11) {
      if (currentProduct && addOrUpdateIncompleteOrder) {
        const selectedImgUrl = activeImage || currentProduct.image;
        const idx = allImages.indexOf(selectedImgUrl);
        const productCode = idx !== -1 ? `প্রোডাক্ট কোড #${idx + 1}` : undefined;
        const packageDisplaySuffix = selectedPackage ? ` [প্যাকেজ: ${selectedPackage.name}]` : '';

        addOrUpdateIncompleteOrder(draftOrderIdRef.current, {
          customer: {
            name: customData.name,
            phone: customData.phone,
            address: customData.address,
            city: customData.city || 'Dhaka',
            district: customData.district || 'ঢাকা'
          },
          items: [
            {
              productId: currentProduct.id,
              quantity: selectedPackage ? (selectedPackage.quantity * quantity) : quantity,
              price: selectedPackage ? Math.round(selectedPackage.price / selectedPackage.quantity) : activeProductPrice,
              size: selectedSize,
              selectedImage: selectedImgUrl,
              productCode: `${productCode ? productCode : 'প্রোডাক্ট'}${packageDisplaySuffix}`
            }
          ],
          total,
          paymentMethod: customData.paymentMethod || 'COD'
        });
      }
    }
  };

  useEffect(() => {
    saveDraftOrder(formData);
  }, [formData, currentProduct, activeProductPrice, quantity, selectedSize, total, addOrUpdateIncompleteOrder, landingPage, activeImage, allImages, selectedPackage]);

  const getWhatsappUrl = (text?: string) => {
    let cleanNum = (whatsappNumber || phoneNumber || '01756994483').trim().replace(/[^0-9]/g, '');
    if (cleanNum.length === 11 && cleanNum.startsWith('01')) {
      cleanNum = '88' + cleanNum;
    }
    const textParam = text ? `?text=${encodeURIComponent(text)}` : '';
    return `https://wa.me/${cleanNum}${textParam}`;
  };

  // Recent Sales Alert State
  const [activeAlert, setActiveAlert] = useState<typeof SIMULATED_BUYERS[0] | null>(null);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Visitor Count State
  const [visitorCount, setVisitorCount] = useState(48);

  // Countdown timer state (hours:minutes:seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 2, minutes: 48, seconds: 35 });

  // Size chart toggle modal
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  // Simulated visitors count tick
  useEffect(() => {
    const interval = setInterval(() => {
      setVisitorCount(prev => {
        const delta = Math.floor(Math.random() * 7) - 3;
        const next = prev + delta;
        return next > 25 ? (next < 80 ? next : 75) : 30;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Simulated countdown timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 2, minutes: 59, seconds: 59 }; // reset
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Reel progression tick
  useEffect(() => {
    let progressInterval: NodeJS.Timeout;
    if (isVideoPlaying) {
      progressInterval = setInterval(() => {
        setReelProgress(prev => (prev >= 100 ? 0 : prev + 0.8));
      }, 100);
    }
    return () => clearInterval(progressInterval);
  }, [isVideoPlaying]);

  // Social Proof Alerts Cycle
  useEffect(() => {
    const triggerNextAlert = () => {
      const randomBuyer = SIMULATED_BUYERS[Math.floor(Math.random() * SIMULATED_BUYERS.length)];
      setActiveAlert(randomBuyer);
      
      // Hide alert after 5 seconds
      alertTimeoutRef.current = setTimeout(() => {
        setActiveAlert(null);
        // Schedule next alert in 8-15 seconds
        const nextInterval = Math.floor(Math.random() * 7000) + 8000;
        alertTimeoutRef.current = setTimeout(triggerNextAlert, nextInterval);
      }, 5000);
    };

    // First alert triggers after 4 seconds
    const firstTimeout = setTimeout(triggerNextAlert, 4000);

    return () => {
      clearTimeout(firstTimeout);
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, []);

  // Helper to send events to both Facebook Pixel (client-side) and Meta Conversions API (server-side CAPI)
  const trackMetaEvent = useCallback((eventName: string, customData?: any, userData?: any) => {
    // 1. Client-Side Pixel Event
    if (pixelId && (window as any).fbq) {
      try {
        (window as any).fbq('track', eventName, customData || {});
        console.log(`[Meta-Pixel] Client-side tracking fired: ${eventName}`, customData);
      } catch (err) {
        console.error(`[Meta-Pixel] Client-side error for ${eventName}:`, err);
      }
    }

    // 2. Server-Side Conversions API (CAPI) Event via Proxy
    if (pixelId && pixelAccessToken) {
      fetch('/api/fb-capi/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pixelId,
          pixelAccessToken,
          event_name: eventName,
          event_source_url: window.location.href,
          custom_data: customData,
          user_data: userData
        })
      })
      .then(res => res.json())
      .then(data => console.log(`[Meta-CAPI] Server-side tracking fired: ${eventName}`, data))
      .catch(err => console.error(`[Meta-CAPI] Server-side error for ${eventName}:`, err));
    }
  }, [pixelId, pixelAccessToken]);

  // Facebook Pixel & CAPI automatic ViewContent tracking on mount and product change
  useEffect(() => {
    if (currentProduct && currentProduct.id) {
      trackMetaEvent('ViewContent', {
        content_name: currentProduct.title,
        content_ids: [currentProduct.id],
        content_type: 'product',
        value: activeProductPrice,
        currency: 'BDT'
      });
    }
  }, [currentProduct.id, activeProductPrice, currentProduct.title, trackMetaEvent]);

  // Facebook Pixel & CAPI automatic InitiateCheckout tracking when user begins to fill form
  const [hasInitiatedCheckout, setHasInitiatedCheckout] = useState(false);
  useEffect(() => {
    if (!hasInitiatedCheckout && (formData.name.trim().length > 0 || formData.phone.trim().length > 0)) {
      setHasInitiatedCheckout(true);

      const userData: any = {};
      if (formData.phone.trim()) userData.ph = formData.phone.trim();
      if (formData.name.trim()) userData.fn = formData.name.trim();

      trackMetaEvent('InitiateCheckout', {
        content_name: currentProduct.title,
        content_ids: [currentProduct.id],
        content_type: 'product',
        value: total,
        currency: 'BDT'
      }, userData);
    }
  }, [formData.name, formData.phone, hasInitiatedCheckout, currentProduct.id, currentProduct.title, total, trackMetaEvent]);

  // Handle item change, scroll back to form if clicked
  const handleProductChange = (prod: Product) => {
    setSelectedProduct(prod);
    setActiveImage(prod.image);
    if (prod.sizes && prod.sizes.length > 0) {
      if (!selectedSize || !prod.sizes.includes(selectedSize)) {
        setSelectedSize(prod.sizes[0]);
      }
    } else {
      setSelectedSize(undefined);
    }
    
    // Track ViewContent for the chosen product
    trackMetaEvent('ViewContent', {
      content_name: prod.title,
      content_ids: [prod.id],
      content_type: 'product',
      value: prod.price,
      currency: 'BDT'
    });
  };

  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setCouponError(null);
    if (!couponCode.trim()) return;

    const result = validateDiscountCode(couponCode, subtotal);
    if (result.isValid) {
      setAppliedCoupon({ code: couponCode.trim().toUpperCase(), amount: result.discountAmount });
      setCouponError(null);
    } else {
      setAppliedCoupon(null);
      setCouponError(result.error || 'ভুল কুপন কোড!');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError(null);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.name.trim()) {
      setErrorMsg('দয়া করে আপনার নাম লিখুন।');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 11) {
      setErrorMsg('সঠিক ১১ ডিজিটের মোবাইল নাম্বার দিন।');
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg('দয়া করে আপনার বিস্তারিত ঠিকানা লিখুন।');
      return;
    }

    if (isPhoneBlocked(formData.phone)) {
      setErrorMsg('দুঃখিত, কুরিয়ার স্টেটমেন্ট জটিলতার কারণে অর্ডারটি গ্রহণ করা সম্ভব হচ্ছে না। অনুগ্রহ করে অন্য নম্বরে ট্রাই করুন।');
      return;
    }

    if (isDailyOrderLimitReached(formData.phone)) {
      setErrorMsg('দুঃখিত, এই নম্বর থেকে আজকে ইতিমধ্যেই একটি অর্ডার করা হয়েছে। প্রতিদিন একটির বেশি অর্ডার করা সম্ভব নয়। জরুরি প্রয়োজনে দয়া করে আমাদের সাপোর্টে যোগাযোগ করুন।');
      return;
    }

    // Prepare order details
    const selectedImgUrl = activeImage || currentProduct.image;
    const idx = allImages.indexOf(selectedImgUrl);
    const productCode = idx !== -1 ? `প্রোডাক্ট কোড #${idx + 1}` : undefined;
    const packageDisplaySuffix = selectedPackage ? ` [প্যাকেজ: ${selectedPackage.name}]` : '';

    const orderItems = [{
      productId: currentProduct.id,
      size: selectedSize,
      quantity: selectedPackage ? (selectedPackage.quantity * quantity) : quantity,
      price: selectedPackage ? Math.round(selectedPackage.price / selectedPackage.quantity) : activeProductPrice,
      selectedImage: selectedImgUrl,
      productCode: `${productCode ? productCode : 'প্রোডাক্ট'}${packageDisplaySuffix}`
    }];

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await placeOrder({
        customer: {
          name: formData.name,
          email: '',
          phone: formData.phone,
          address: formData.address,
          city: formData.city || 'Dhaka',
          district: formData.district || 'ঢাকা'
        },
        items: orderItems,
        total,
        paymentMethod: formData.paymentMethod
      });

      // Fire client-side Pixel and server-side CAPI Purchase tracking automatically!
      trackMetaEvent('Purchase', {
        value: total,
        currency: 'BDT',
        content_type: 'product',
        content_ids: [currentProduct.id],
        content_name: currentProduct.title,
        num_items: selectedPackage ? (selectedPackage.quantity * quantity) : quantity
      }, {
        ph: formData.phone.trim(),
        fn: formData.name.trim()
      });

      setOrderStep(2);
      setErrorMsg(null);
    } catch (err: any) {
      console.error("Order submission failed:", err);
      setErrorMsg('অর্ডার সম্পন্ন করা সম্ভব হয়নি। দয়া করে আবার চেষ্টা করুন বা সরাসরি আমাদের সাথে যোগাযোগ করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  return (
    <div className="bg-neutral-50 min-h-screen text-gray-900 pb-16 font-sans">
      
      {/* Dynamic Urgent Bar */}
      <div className="bg-gradient-to-r from-red-700 via-red-600 to-amber-600 text-white py-2 px-4 text-xs font-semibold flex flex-wrap justify-between items-center gap-2 relative z-20 shadow-sm">
        <div className="flex items-center gap-2 mx-auto sm:mx-0">
          <Flame className="w-4 h-4 animate-bounce text-yellow-300" />
          <span className="tracking-wide text-center sm:text-left">
            🔥 অফার ধামাকা! আজ অর্ডার করলেই পাচ্ছেন ২৫% বিশেষ ছাড় এবং সারা দেশে ক্যাশ অন ডেলিভারি!
          </span>
        </div>
        <div className="flex items-center gap-3 mx-auto sm:mx-0">
          <div className="flex items-center gap-1 bg-black/30 px-2.5 py-0.5 rounded text-[11px]">
            <span>অফারের সময় বাকি:</span>
            <span className="font-mono font-bold text-yellow-300">
              {timeLeft.hours.toString().padStart(2, '0')}:{timeLeft.minutes.toString().padStart(2, '0')}:{timeLeft.seconds.toString().padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Top Header Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full border-2 border-[var(--color-gold)] overflow-hidden bg-[var(--color-navy)] flex items-center justify-center">
              {storeLogo ? (
                <img 
                  src={storeLogo} 
                  alt="Store Logo" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-serif font-bold text-white text-lg">E</span>
              )}
            </div>
            <div>
              <h1 className="font-serif font-bold text-base text-gray-900 leading-none">
                {storeName ? (storeName.split(' - ')[0] || storeName) : 'Shoker ghor Shop'}
              </h1>
              <span className="text-[10px] text-gray-500 block"></span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {onClose && (
              <button
                onClick={onClose}
                className="bg-neutral-100 hover:bg-neutral-200 text-gray-800 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-gray-300 cursor-pointer"
              >
                🏠 হোম পেজ
              </button>
            )}
            <a 
              href={`tel:${phoneNumber}`}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1 transition-colors"
            >
              📞 {phoneNumber}
            </a>
          </div>
        </div>
      </header>

      {/* Page Link & Share Box */}
      <div className="max-w-6xl mx-auto px-4 mt-3">
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5 overflow-hidden w-full sm:w-auto flex-1">
            <div className="p-2 bg-amber-500 text-white rounded-lg shrink-0">
              <Share2 className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-amber-900 truncate">
                🎁 {currentProduct.title || landingPage?.title || 'প্রিমিয়াম প্রোডাক্ট কালেকশন'}
              </p>
              <p className="text-[11px] font-mono text-amber-800 truncate select-all">
                {(() => {
                  const domain = window.location.origin && !window.location.origin.includes('localhost') ? window.location.origin : 'https://Shoker ghorbd.shop';
                  let path = '';
                  if (landingPage) {
                    path = `/landing/${encodeURIComponent(landingPage.slug || landingPage.id)}`;
                  } else if (currentProduct) {
                    path = `/product/${encodeURIComponent(currentProduct.id)}`;
                  } else {
                    path = '/';
                  }
                  return `${domain}${path}`;
                })()}
              </p>
            </div>
          </div>
          <button
            onClick={handleCopyLink}
            className="w-full sm:w-auto bg-[#005bd3] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
          >
            {copied ? '✅ সফলভাবে কপি হয়েছে!' : '📋 প্রোডাক্ট লিংক কপি করুন'}
          </button>
        </div>
      </div>

      {/* Render Arched Banner Box ONLY for Custom Landing Pages */}
      {landingPage ? (
        <>
          {/* High-Converting Landing Page Arched Banner Box (Matching Screenshot Style) */}
          <section className="bg-gradient-to-b from-[#600000] via-[#800000] to-[#500000] text-white pt-8 pb-12 px-4 text-center relative overflow-hidden shadow-xl">
            <div className="max-w-3xl mx-auto space-y-6 relative z-10">
              
              {/* Top Green Ribbon Badge */}
              <div className="inline-block bg-emerald-600 text-white font-extrabold text-sm px-6 py-2 rounded-full shadow-lg border border-emerald-400 tracking-wide animate-pulse">
                {landingPage.badgeText || '৬টি সেরা মানের প্রোডাক্ট - ফ্রি হোম ডেলিভারি - সারা দেশে'}
              </div>

              {/* Arched Photo Frame Box */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-3xl border-2 border-amber-300/40 shadow-2xl max-w-lg mx-auto">
                <div className="relative rounded-2xl overflow-hidden border-4 border-white aspect-[4/3] bg-neutral-900">
                  <img 
                    src={activeImage || currentProduct.image} 
                    alt={currentProduct.title} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-center p-4">
                    <p className="text-white font-serif font-bold text-lg drop-shadow-md">
                      {landingPage.headline || currentProduct.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Click to Order Glowing Button */}
              <div>
                <button
                  onClick={() => {
                    // Fire AddToCart event (both Client Pixel and Server CAPI)
                    trackMetaEvent('AddToCart', {
                      content_name: currentProduct.title,
                      content_ids: [currentProduct.id],
                      content_type: 'product',
                      value: activeProductPrice,
                      currency: 'BDT',
                      num_items: quantity
                    });
                    document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-700 hover:to-red-700 text-white font-black text-lg px-8 py-3.5 rounded-full shadow-2xl border-2 border-yellow-300 transition-all hover:scale-105 active:scale-95 animate-bounce cursor-pointer"
                >
                  অর্ডার করতে ক্লিক করুন 👇
                </button>
              </div>
            </div>
          </section>

          {/* Package Photo Showcase Grid ("ছক্কা প্যাকেজে থাকবে ১টি করে প্রোডাক্ট") */}
          <section className="py-8 bg-amber-50/50 border-b border-amber-100 px-4">
            <div className="max-w-4xl mx-auto text-center space-y-4">
              <div className="bg-[#800000] text-amber-300 font-extrabold text-base py-2.5 px-6 rounded-xl inline-block shadow-md border border-amber-400/40">
                {selectedPackage ? `${selectedPackage.name} - আপনার পছন্দের প্রোডাক্টটি সিলেক্ট করুন:` : 'প্যাকেজে থাকবে প্রোডাক্ট। আপনার পছন্দের ডিজাইন সিলেক্ট করুন-'}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {pkgImages.map((imgUrl, idx) => (
                  <div 
                    key={idx}
                    onClick={() => {
                      setActiveImage(imgUrl);
                      // Track AddToCart for choosing variant/package item
                      trackMetaEvent('AddToCart', {
                        content_name: currentProduct.title,
                        content_ids: [currentProduct.id],
                        content_type: 'product',
                        value: activeProductPrice,
                        currency: 'BDT'
                      });
                      // Scroll to order form smoothly
                      document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`bg-white p-2 rounded-2xl border-2 shadow-sm transition-all cursor-pointer group ${(activeImage || currentProduct.image) === imgUrl ? 'border-amber-500 ring-4 ring-amber-300/50 scale-105' : 'border-gray-200 hover:border-amber-400'}`}
                  >
                    <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100">
                      <img 
                        src={imgUrl} 
                        alt={`Product Option ${idx + 1}`} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <span className="block text-[11px] font-bold text-gray-800 mt-1.5">
                      ডিজাইন / ছবি #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      ) : null}

      <div className="max-w-6xl mx-auto px-4 pt-6 md:pt-8">

        {/* Standard Reel Offer Banner Box (Matching screenshot 2: ✨ রিল ধামাকা অফার | 🔥 45 জন এই মুহূর্তে এই অর্ডার পেজটি দেখছেন) */}
        {!landingPage && (
          <div className="flex flex-wrap justify-between items-center gap-3 mb-6 bg-white border border-gray-200 p-4 rounded-xl shadow-xs">
            <div className="flex items-center gap-2.5">
              <span className="bg-amber-100 text-amber-900 text-xs font-extrabold uppercase px-3 py-1 rounded-full animate-pulse flex items-center gap-1 border border-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-current" /> ✨ রিল ধামাকা অফার
              </span>
              <div className="text-xs text-gray-600 font-medium">
                🔥 <span className="text-red-600 font-extrabold">{visitorCount} জন</span> এই মুহূর্তে এই অর্ডার পেজটি দেখছেন
              </div>
            </div>
            {onClose && (
              <button 
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Core Layout Split */}
        {orderStep === 1 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: Facebook Reel Mockup & Product Card (lg:span-5) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Premium Reel Video Showcase Mockup */}
              <div className="relative aspect-[9/16] max-h-[640px] w-full mx-auto rounded-2xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-950 flex flex-col justify-end">
                
                {/* Product Image simulating a high quality video frame */}
                <div className="absolute inset-0 z-0">
                  <motion.img 
                    key={currentProduct.id}
                    src={activeImage || currentProduct.image} 
                    alt={currentProduct.title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover select-none"
                    initial={{ scale: 1.05, opacity: 0.8 }}
                    animate={{ scale: isVideoPlaying ? 1.0 : 1.02, opacity: 1 }}
                    transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                  />
                  {/* Subtle darkening gradient overlay matching Facebook reels */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30"></div>
                </div>

                {/* Video Play State Indicator */}
                <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                  <AnimatePresence>
                    {!isVideoPlaying && (
                      <motion.div 
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        className="p-4 rounded-full bg-black/60 text-white"
                      >
                        <Play className="w-8 h-8 fill-current" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Floating Media Controls (Right side of Reel overlay) */}
                <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center gap-5">
                  
                  {/* Profile Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden bg-amber-500 flex items-center justify-center font-serif text-white font-bold">
                      E
                    </div>
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black text-[9px] font-extrabold px-1 rounded">
                      LIVE
                    </span>
                  </div>

                  {/* Reel Likes */}
                  <button onClick={toggleLike} className="flex flex-col items-center text-white cursor-pointer group">
                    <div className="p-2.5 rounded-full bg-black/45 hover:bg-black/60 transition-colors">
                      <Heart className={`w-5 h-5 transition-transform ${isLiked ? 'text-red-500 fill-current scale-125' : 'text-white'}`} />
                    </div>
                    <span className="text-[10px] font-bold mt-1 text-gray-200">{likesCount}</span>
                  </button>

                  {/* Comments Mock */}
                  <div className="flex flex-col items-center text-white">
                    <div className="p-2.5 rounded-full bg-black/45">
                      <MessageSquare className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold mt-1 text-gray-200">284</span>
                  </div>

                  {/* Share Button */}
                  <button onClick={handleCopyLink} className="flex flex-col items-center text-white cursor-pointer group">
                    <div className="p-2.5 rounded-full bg-black/45 hover:bg-black/60 transition-colors">
                      <Share2 className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-[10px] font-bold mt-1 text-gray-200">{copied ? 'কপি!' : 'Share'}</span>
                  </button>

                  {/* Sound Toggle */}
                  <button 
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className="p-2.5 rounded-full bg-black/45 text-white hover:bg-black/60 transition-colors"
                  >
                    {isVideoMuted ? <VolumeX className="w-5 h-5 text-amber-400" /> : <Volume2 className="w-5 h-5 text-white" />}
                  </button>
                </div>

                {/* Overlay Text & Product Banner inside Reel */}
                <div className="p-4 z-10 text-white space-y-3 relative">
                  
                  {/* Creator Info */}
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[14px] text-[var(--color-gold-light)] flex items-center gap-1">
                      @Shoker ghorbd <ShieldCheck className="w-4 h-4 text-sky-400 fill-current" />
                    </span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Follow</span>
                  </div>

                  {/* Reel caption text */}
                  <p className="text-xs text-neutral-200 leading-relaxed max-w-[85%]">
                    আমাদের স্পেশাল <strong className="text-yellow-400">{currentProduct.title}</strong>। প্রিমিয়াম স্নাব বাটন ফিনিশিং এবং আরামদায়ক কটন কাপড় যা আপনাকে দেবে গর্জিয়াস ও রাজকীয় লুক! ✨ 
                  </p>

                  {/* Sound Music track info */}
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-300 bg-white/10 px-2 py-1 rounded w-fit overflow-hidden">
                    <span className="animate-pulse">🎵 Shoker ghor Original Sound (Aesthetic Heritage Track)</span>
                  </div>

                  {/* Reel interactive mini banner */}
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 p-2.5 rounded-xl flex items-center gap-3 mt-1.5">
                    <img 
                      src={activeImage || currentProduct.image} 
                      alt="Thumbnail" 
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 object-cover rounded-md border border-white/20"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{currentProduct.title}</p>
                      <p className="text-[12px] font-extrabold text-[#95bf47]">{formatCurrency(activeProductPrice)}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsVideoPlaying(!isVideoPlaying);
                      }}
                      className="bg-[#d4af37] text-neutral-950 font-bold text-[10px] px-3 py-1.5 rounded uppercase hover:bg-yellow-400 transition-colors"
                    >
                      {isVideoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                    </button>
                  </div>
                </div>

                {/* Reel Progress Line Bar */}
                <div className="w-full bg-white/10 h-1 relative z-20">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-amber-500 h-full transition-all duration-100"
                    style={{ width: `${reelProgress}%` }}
                  ></div>
                </div>
              </div>

              {/* Product Photo Gallery Grid (5-10 Sobi Gallery) */}
              <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wide flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-500" /> প্রোডাক্টর এইচডি ছবিসমূহ ({allImages.length} টি ছবি)
                  </h4>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-extrabold">
                    অর্ডার করতে ছবিতে ট্যাপ করুন
                  </span>
                </div>
                
                {/* Horizontal / Grid Photo Thumbnails */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        // Switch active image preview and scroll to form
                        setActiveImage(img);
                        document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer group ${
                        (activeImage || currentProduct.image) === img 
                          ? 'border-[var(--color-gold)] ring-2 ring-amber-300 shadow-md scale-105' 
                          : 'border-gray-200 hover:border-amber-400'
                      }`}
                    >
                      <img 
                        src={img} 
                        alt={`Photo ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product highlights and Trust cards */}
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm space-y-4">
                <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide border-b border-gray-100 pb-2 flex items-center gap-1">
                  <Award className="w-4 h-4 text-amber-500" /> কেন Shoker ghor Shop থেকে প্রোডাক্ট কিনবেন?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-neutral-50 rounded-lg text-center flex flex-col items-center justify-center border border-gray-50">
                    <Truck className="w-5 h-5 text-[#d4af37] mb-1.5" />
                    <span className="text-[10px] font-bold text-gray-700 block">ক্যাশ অন ডেলিভারি</span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">ডেলিভারি পেয়ে পেমেন্ট</span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg text-center flex flex-col items-center justify-center border border-gray-50">
                    <ShieldCheck className="w-5 h-5 text-emerald-500 mb-1.5" />
                    <span className="text-[10px] font-bold text-gray-700 block">১০০% কালার গ্যারান্টি</span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">ফেব্রিক ও ফিনিশিং ১০০%</span>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-lg text-center flex flex-col items-center justify-center border border-gray-50">
                    <RotateCcw className="w-5 h-5 text-blue-500 mb-1.5" />
                    <span className="text-[10px] font-bold text-gray-700 block">সহজ রিটার্ন সুবিধা</span>
                    <span className="text-[9px] text-gray-500 block mt-0.5">সাইজ পরিবর্তন বা বদল</span>
                  </div>
                </div>
              </div>

              {/* Quick WhatsApp helper */}
              <div className="bg-[#e8f5e9] border border-green-100 rounded-xl p-4 flex items-center justify-between text-xs text-green-900 font-semibold">
                <div className="flex items-center gap-2">
                  <div className="bg-green-500 text-white p-1.5 rounded-full">
                    <MessageCircle className="w-4 h-4 fill-current" />
                  </div>
                  <div>
                    <span className="block font-bold">ফোন বা হোয়াটসঅ্যাপে অর্ডার করুন</span>
                    <span className="block text-[10px] text-green-700 font-normal">কোনো সমস্যা হলে সরাসরি কথা বলুন আমাদের সাথে</span>
                  </div>
                </div>
                <a 
                  href={getWhatsappUrl(`আসসালামু আলাইকুম, আমি ${currentProduct.title} সম্পর্কে জানতে চাই।`)} 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded font-bold text-[11px] transition-colors whitespace-nowrap"
                >
                  যোগাযোগ করুন
                </a>
              </div>
            </div>

            {/* RIGHT COLUMN: Selection & Order Form (lg:span-7) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Product Selection Slider */}
              <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1">ধাপ ১: আপনার পছন্দের প্রোডাক্ট ও সাইজ বেছে নিন</h3>
                  <h2 className="text-xl font-bold font-serif text-neutral-900">পণ্য নির্বাচন করুন (Select Product Style)</h2>
                </div>
                
                {/* Horizontal Product Quick Scroller */}
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-200">
                  {products.map(prod => {
                    const isSelected = currentProduct.id === prod.id;
                    return (
                      <button
                        key={prod.id}
                        onClick={() => handleProductChange(prod)}
                        className={`flex-shrink-0 flex items-center gap-3 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-neutral-900 bg-neutral-900 text-white shadow-md' 
                            : 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
                        }`}
                        style={{ width: '220px' }}
                      >
                        <img 
                          src={prod.image} 
                          alt={prod.title} 
                          className="w-12 h-14 object-cover rounded-lg border border-gray-200/50" 
                        />
                        <div className="min-w-0 flex-1">
                          <p className={`text-[11px] font-bold truncate ${isSelected ? 'text-white' : 'text-gray-800'}`}>
                            {prod.title}
                          </p>
                          <p className={`text-xs font-extrabold ${isSelected ? 'text-[var(--color-gold)]' : 'text-amber-600'}`}>
                            {formatCurrency(prod.price)}
                          </p>
                          <span className={`text-[9px] block ${isSelected ? 'text-gray-400' : 'text-gray-500'}`}>
                            {prod.category}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Active Product Details & Features Display */}
                <div className="bg-neutral-50 rounded-xl p-4 border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-amber-600 tracking-widest block">নির্বাচিত প্রোডাক্ট</span>
                    <h4 className="font-serif font-bold text-gray-900 text-lg leading-tight">{currentProduct.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed font-light mt-1.5 whitespace-pre-line">
                      {currentProduct.description}
                    </p>
                  </div>
                  <div className="flex flex-col justify-center items-center md:border-l md:border-gray-200/70 p-2 text-center bg-white rounded-lg border border-gray-100 md:border-none shadow-sm md:shadow-none">
                    <span className="text-[11px] text-gray-500">স্পেশাল রিল প্রাইস</span>
                    <span className="text-2xl font-black text-amber-600 mt-1">{formatCurrency(activeProductPrice)}</span>
                    <span className="text-[10px] text-gray-400 line-through mt-0.5">{formatCurrency(activeProductPrice + 450)}</span>
                  </div>
                </div>

                {/* Size Selector Grid with Size Chart trigger */}
                {availableSizes && availableSizes.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                        📏 আপনার সাইজ নির্বাচন করুন: <span className="text-amber-600 font-extrabold text-sm">{selectedSize}</span>
                      </label>
                      <button 
                        type="button"
                        onClick={() => setIsSizeChartOpen(true)}
                        className="text-xs text-amber-600 underline hover:text-amber-700 font-medium cursor-pointer"
                      >
                        সাইজ চার্ট দেখুন
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {availableSizes.map(size => {
                        const isSel = selectedSize === size;
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(selectedSize === size ? undefined : size)}
                            className={`px-3 py-2 rounded-md text-xs font-bold transition-all cursor-pointer border ${
                              isSel 
                                ? 'bg-neutral-900 text-white border-black shadow-xs scale-[1.02]' 
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {isSel ? `✓ ${size}` : `+ ${size}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity adjustments */}
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-xs font-bold text-gray-700">অর্ডার পরিমাণ:</span>
                  <div className="flex items-center border border-gray-200 rounded-lg bg-neutral-50 overflow-hidden">
                    <button 
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer text-lg font-bold"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-bold text-gray-900">{quantity}</span>
                    <button 
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="px-4 py-2 text-gray-600 hover:text-black hover:bg-gray-100 transition-colors cursor-pointer text-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Main One Page Checkout Form */}
              <div id="order-form" className="bg-white border-2 border-neutral-900 rounded-2xl p-4 md:p-7 shadow-lg space-y-6 relative scroll-mt-20">
                
                {/* Visual Accent Banner Box (Matching Screenshot Box) */}
                <div className="bg-[#800000] border-2 border-amber-400 text-white rounded-xl p-3.5 text-center shadow-md">
                  <h3 className="font-bold text-base text-amber-200 leading-snug">
                    অর্ডার করতে নিচের ফরমটি পূরণ করুন।
                  </h3>
                  <p className="text-xs text-white/90 font-medium mt-0.5">
                    (অগ্রিম টাকা দিতে হবে না। প্রোডাক্ট রিসিভ করে চেক করে বিল পরিশোধ করবেন!)
                  </p>
                </div>

                {/* Package Selector */}
                <div className="space-y-3 pt-1 border-b border-gray-100 pb-5">
                  <label className="text-xs font-black text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                    🎁 স্পেশাল প্যাকেজ বা অফার বেছে নিন:
                  </label>
                  <div className="grid grid-cols-1 gap-3.5">
                    {packagesList.map((pkg) => {
                      const isSelected = selectedPackageId === pkg.id;
                      const hasBadge = !!pkg.description;
                      
                      return (
                        <button
                          key={pkg.id}
                          type="button"
                          onClick={() => setSelectedPackageId(pkg.id)}
                          className={`relative flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'border-neutral-900 bg-neutral-900 text-white shadow-md scale-[1.01]'
                              : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 text-gray-800'
                          }`}
                        >
                          {hasBadge && (
                            <span className="absolute -top-2.5 right-4 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-amber-500 text-white shadow-xs">
                              {pkg.description}
                            </span>
                          )}
                          <div className="flex items-center gap-3">
                            {(pkg.images && pkg.images.length > 0 && pkg.images.filter(Boolean).length > 0) ? (
                              <div className="w-12 h-12 rounded overflow-hidden border-2 border-gray-200 shrink-0 bg-white">
                                <img src={pkg.images.filter(Boolean)[0]} alt={pkg.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                               currentProduct.image ? (
                                <div className="w-10 h-10 rounded overflow-hidden border border-gray-200 shrink-0 bg-white">
                                  <img src={currentProduct.image} alt={pkg.name} className="w-full h-full object-cover opacity-80" />
                                </div>
                               ) : null
                            )}
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              isSelected ? 'border-amber-400 bg-amber-400' : 'border-gray-400'
                            }`}>
                              {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-neutral-900"></span>}
                            </div>
                            <div>
                              <span className={`text-sm font-extrabold block ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                {pkg.name}
                              </span>
                              <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-gray-300' : 'text-gray-500'}`}>
                                পরিমাণ: {pkg.quantity} পিস প্রোডাক্ট
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-base font-black block ${isSelected ? 'text-[var(--color-gold)]' : 'text-amber-600'}`}>
                              {formatCurrency(pkg.price)}
                            </span>
                            {pkg.quantity > 1 && (
                              <span className="text-[10px] block mt-0.5 line-through text-gray-400">
                                {formatCurrency(activeProductPrice * pkg.quantity)}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex flex-col gap-3 w-full">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-800 font-semibold leading-relaxed">{errorMsg}</p>
                    </div>
                    {errorMsg.includes("প্রতিদিন একটির বেশি") && (
                      <div className="flex flex-wrap gap-2.5 pl-8">
                        <a 
                          href={`https://wa.me/8801756994483?text=Assalamu%20Alaikum!%20My%20order%20was%20blocked%20by%20daily%20limit.%20Please%20whitelist%20my%20number:%20${formData.phone}`}
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba56] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow transition-all hover:scale-105 active:scale-95"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                          হোয়াটসঅ্যাপে যোগাযোগ (WhatsApp)
                        </a>
                        <a 
                          href="https://m.me/61561088721085" 
                          target="_blank"
                          referrerPolicy="no-referrer"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow transition-all hover:scale-105 active:scale-95"
                        >
                          ফেসবুক পেজে মেসেজ (Facebook)
                        </a>
                      </div>
                    )}
                  </div>
                )}

                <form onSubmit={handleOrderSubmit} className="space-y-4">
                  
                  {/* Full Name field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">আপনার নাম <span className="text-red-500">*</span></label>
                    <input 
                      required 
                      type="text" 
                      value={formData.name} 
                      onChange={e => {
                        const updated = { ...formData, name: e.target.value };
                        setFormData(updated);
                        saveDraftOrder(updated);
                      }}
                      onInput={e => {
                        const updated = { ...formData, name: (e.target as HTMLInputElement).value };
                        setFormData(updated);
                        saveDraftOrder(updated);
                      }}
                      onBlur={() => saveDraftOrder(formData)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-black outline-none bg-neutral-50"
                      placeholder="যেমন: আরিফুল ইসলাম"
                    />
                  </div>

                  {/* Phone Number field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">মোবাইল নাম্বার <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">
                        +88
                      </span>
                      <input 
                        required 
                        type="tel" 
                        maxLength={11}
                        value={formData.phone} 
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          const updated = { ...formData, phone: val };
                          setFormData(updated);
                          saveDraftOrder(updated);
                        }} 
                        onInput={e => {
                          const val = (e.target as HTMLInputElement).value.replace(/[^0-9]/g, '');
                          const updated = { ...formData, phone: val };
                          setFormData(updated);
                          saveDraftOrder(updated);
                        }}
                        onBlur={() => saveDraftOrder(formData)}
                        className="w-full border border-gray-300 rounded-lg p-3 pl-11 text-sm focus:ring-1 focus:ring-black outline-none bg-neutral-50 font-mono font-semibold"
                        placeholder="017XXXXXXXX"
                      />
                    </div>
                  </div>

                  {/* Detailed Address field */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">সম্পূর্ণ ঠিকানা (গ্রাম, থানা, রোড) <span className="text-red-500">*</span></label>
                    <textarea 
                      required 
                      rows={2}
                      value={formData.address} 
                      onChange={e => {
                        const updated = { ...formData, address: e.target.value };
                        setFormData(updated);
                        saveDraftOrder(updated);
                      }}
                      onInput={e => {
                        const updated = { ...formData, address: (e.target as HTMLTextAreaElement).value };
                        setFormData(updated);
                        saveDraftOrder(updated);
                      }}
                      onBlur={() => saveDraftOrder(formData)}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-black outline-none bg-neutral-50"
                      placeholder="যেমন: হাউজ নং- ১২, রোড নং- ৫, ব্লক- সি, মিরপুর ১০"
                    />
                  </div>

                  {/* District Selection */}
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">জেলা নির্বাচন করুন (District) <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={formData.district || 'ঢাকা'}
                      onChange={e => {
                        const updated = { ...formData, district: e.target.value };
                        setFormData(updated);
                        saveDraftOrder(updated);
                      }}
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-1 focus:ring-black outline-none bg-neutral-50 font-medium cursor-pointer"
                    >
                      {BD_DISTRICTS.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Shipping Selector & Delivery Location */}
                  {(shippingInsideShow || shippingOutsideShow) && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-gray-800 mb-2.5">ডেলিভারি এরিয়া নির্বাচন করুন:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {shippingInsideShow && (
                          <label className={`flex items-center p-3.5 border rounded-xl cursor-pointer transition-all ${shippingMethod === 'inside' ? 'border-neutral-900 bg-neutral-50' : 'border-gray-200'}`}>
                            <input 
                              type="radio" 
                              name="shipping_area" 
                              checked={shippingMethod === 'inside'} 
                              onChange={() => {
                                setShippingMethod('inside');
                                setFormData({ ...formData, city: 'Dhaka' });
                              }}
                              className="w-4 h-4 text-neutral-900 focus:ring-black cursor-pointer"
                            />
                            <div className="ml-3">
                              <span className="text-xs font-bold text-neutral-900 block">{shippingInsideText}</span>
                              <span className="text-[10px] text-neutral-500 block">{shippingInsideDesc}</span>
                            </div>
                          </label>
                        )}

                        {shippingOutsideShow && (
                          <label className={`flex items-center p-3.5 border rounded-xl cursor-pointer transition-all ${shippingMethod === 'outside' ? 'border-neutral-900 bg-neutral-50' : 'border-gray-200'}`}>
                            <input 
                              type="radio" 
                              name="shipping_area" 
                              checked={shippingMethod === 'outside'} 
                              onChange={() => {
                                setShippingMethod('outside');
                                setFormData({ ...formData, city: 'Outside Dhaka' });
                              }}
                              className="w-4 h-4 text-neutral-900 focus:ring-black cursor-pointer"
                            />
                            <div className="ml-3">
                              <span className="text-xs font-bold text-neutral-900 block">{shippingOutsideText}</span>
                              <span className="text-[10px] text-neutral-500 block">{shippingOutsideDesc}</span>
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Payment Method - cash on delivery highlighted */}
                  <div className="pt-2 bg-amber-50/50 border border-amber-200/60 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                      <span className="text-xs font-bold text-amber-900 uppercase">পেমেন্ট মেথড (Payment Option)</span>
                    </div>
                    <label className="flex items-center p-3.5 border border-amber-300 bg-white rounded-lg cursor-pointer">
                      <input 
                        type="radio" 
                        name="payment_choice" 
                        defaultChecked 
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500" 
                      />
                      <span className="ml-3 text-xs font-bold text-gray-950">ক্যাশ অন ডেলিভারি (হাতে পেয়ে টাকা পরিশোধ করবেন)</span>
                    </label>
                    <p className="text-[10px] text-amber-800 font-light mt-2 leading-relaxed">
                      💡 <strong>সুবিধা:</strong> আপনার অর্ডারকৃত প্রোডাক্টটি ডেলিভারি ম্যানের থেকে বুঝে নিয়ে দেখে সম্পূর্ণ পেমেন্ট করতে পারবেন। কোনো অ্যাডভান্স পেমেন্ট করার প্রয়োজন নেই।
                    </p>
                  </div>

                  {/* Promo coupon input widget (Disabled as requested) */}
                  {/* Order Summary Calculations Card */}
                  <div className="pt-4 mt-6 border-t border-gray-200 space-y-2.5 text-xs">
                    <div className="flex justify-between text-gray-600">
                      <span>পণ্যের সাবটোটাল (Subtotal)</span>
                      <span className="font-semibold">{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>কুরিয়ার ডেলিভারি চার্জ (Shipping)</span>
                      <span className="font-semibold">
                        {shippingCharge === 0 ? 'ফ্রি' : formatCurrency(shippingCharge)}
                      </span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-gray-200 text-sm">
                      <span className="font-bold text-neutral-900 uppercase">সর্বমোট পেমেন্ট (Grand Total)</span>
                      <span className="font-black text-xl text-amber-600">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  {/* Place Order Big CTA Button */}
                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-4.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group border border-neutral-800 ${
                        isSubmitting
                          ? 'bg-neutral-700 text-neutral-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-neutral-950 to-neutral-900 hover:from-amber-600 hover:to-amber-500 text-white cursor-pointer'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          অর্ডার প্রসেস হচ্ছে...
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-[var(--color-gold)] group-hover:scale-125 transition-transform" />
                          অর্ডার কনফার্ম করুন • {formatCurrency(total)}
                        </>
                      )}
                    </button>
                    <p className="text-center text-[10px] text-gray-400 mt-2">
                      🔒 আপনার তথ্য Shoker ghor Shop এ সম্পূর্ণ নিরাপদ।
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          
          /* Step 2: Order Placed Successfully screen */
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border border-gray-100 rounded-2xl max-w-2xl mx-auto p-8 md:p-12 text-center shadow-xl space-y-6"
          >
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500 shadow-sm border border-green-100">
              <Check className="w-10 h-10 stroke-[3]" />
            </div>
            
            <div className="space-y-2">
              <span className="text-[10px] bg-green-100 text-green-800 font-extrabold uppercase px-2.5 py-1 rounded">
                অর্ডার সফল হয়েছে!
              </span>
              <h2 className="text-3xl font-serif font-bold text-gray-900">আপনার অর্ডারটি কনফার্ম করা হয়েছে!</h2>
              <p className="text-xs text-gray-500">Shoker ghor Shop এ কেনাকাটা করার জন্য আপনাকে ধন্যবাদ। পরবর্তী আপডেটের জন্য আমাদের একজন প্রতিনিধি শীঘ্রই আপনার ফোনে কল করবেন।</p>
            </div>

            {/* Quick Order Details Card */}
            <div className="bg-neutral-50 border border-gray-100 p-5 rounded-xl text-left text-xs space-y-3">
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">অর্ডারকৃত পণ্য:</span>
                <span className="font-bold text-gray-900">{currentProduct.title}{selectedSize ? ` (Size: ${selectedSize})` : ''}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">পরিমাণ:</span>
                <span className="font-bold text-gray-900">{quantity} টি</span>
              </div>
              <div className="flex justify-between border-b border-gray-200/50 pb-2">
                <span className="text-gray-500">ডেলিভারি ঠিকানা:</span>
                <span className="font-bold text-gray-900 max-w-[70%] truncate text-right">{formData.address}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm">
                <span className="text-neutral-900">সর্বমোট প্রদেয় বিল:</span>
                <span className="text-amber-600 text-base">{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <a 
                href={getWhatsappUrl(`আসসালামু আলাইকুম, আমি এইমাত্র Shoker ghor Shop এ ১টি অর্ডার করেছি। পণ্য: ${currentProduct.title}`)}
                target="_blank" 
                rel="noreferrer"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                হোয়াটসঅ্যাপে আপডেট পান
              </a>
              <button 
                onClick={onClose}
                className="flex-1 bg-neutral-900 hover:bg-black text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-colors cursor-pointer"
              >
                কেনাকাটা অব্যাহত রাখুন
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating simulated Sales proof toast alerts (Social Proof) */}
      <AnimatePresence>
        {activeAlert && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-4 left-4 z-50 bg-white border border-gray-200 rounded-xl p-3 shadow-2xl flex items-center gap-3 max-w-sm animate-fade-in"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shadow-inner">
                {activeAlert.name[0]}
              </div>
              <span className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
            </div>
            <div>
              <p className="text-[11px] font-bold text-neutral-900">
                {activeAlert.name} ({activeAlert.city})
              </p>
              <p className="text-[10px] text-gray-500">
                এইমাত্র একটি পণ্য অর্ডার কনফার্ম করেছেন! <strong className="text-amber-600 font-semibold">{activeAlert.time}</strong>
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Size Chart Modal Overlay */}
      {isSizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSizeChartOpen(false)}></div>
          <div className="relative bg-white w-full max-w-md p-6 rounded-xl shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setIsSizeChartOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-lg font-bold font-serif mb-4 text-gray-900">📏 প্রোডাক্ট সাইজ চার্ট (Size Chart in Inches)</h3>
            
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="bg-neutral-100 font-bold border-b border-gray-200">
                    <th className="p-3">সাইজ (Size)</th>
                    <th className="p-3">বুক (Chest)</th>
                    <th className="p-3">লম্বা (Length)</th>
                    <th className="p-3">হাতা (Sleeve)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="p-3 font-bold bg-neutral-50">38 (M)</td>
                    <td className="p-3">38"</td>
                    <td className="p-3">38"</td>
                    <td className="p-3">22"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-neutral-50">40 (L)</td>
                    <td className="p-3">40"</td>
                    <td className="p-3">40"</td>
                    <td className="p-3">23"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-neutral-50">42 (XL)</td>
                    <td className="p-3">42"</td>
                    <td className="p-3">42"</td>
                    <td className="p-3">24"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-neutral-50">44 (XXL)</td>
                    <td className="p-3">44"</td>
                    <td className="p-3">44"</td>
                    <td className="p-3">24.5"</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold bg-neutral-50">46 (XXXL)</td>
                    <td className="p-3">46"</td>
                    <td className="p-3">45"</td>
                    <td className="p-3">25"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p className="text-[10px] text-gray-500 mt-4 leading-relaxed">
              * নোট: সাইজ ১ ইঞ্চি কম-বেশি হতে পারে। আপনার বুক বা বডির সাইজের সাথে মিলিয়ে সঠিক সাইজটি নির্বাচন করুন। কোনো সাইজ পরিবর্তন লাগলে ডেলিভারি পাওয়ার পরও বদলানোর সুবিধা পাবেন।
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
