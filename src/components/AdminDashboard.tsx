import React, { useState, useEffect } from 'react';

// Image compression helper
const compressImage = (file: File, maxWidth: number = 600): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.5));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

import {
  Plus,
  Edit2,
  Trash2,
  X,
  Image as ImageIcon,
  Home,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Tag,
  Settings,
  Search,
  Bell,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
  Printer,
  Check,
  CheckCircle,
  Lock,
  Download,
  Upload,
  Menu,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useShop, playOrderSuccessSound } from "../context/ShopContext";
import { Product, Category, LandingPage, Order, MenuItem } from "../types";

const ActivityRow = ({ icon: Icon, color, text, time }: { icon: any, color: string, text: string, time: string }) => (
  <div className="flex items-center justify-between text-xs py-2 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-gray-700 font-medium">{text}</span>
    </div>
    <span className="text-gray-400 text-[10px]">{time}</span>
  </div>
);

const CategoryProgress = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between text-xs font-semibold text-gray-700">
      <span>{label}</span>
      <span>{value}%</span>
    </div>
    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }}></div>
    </div>
  </div>
);

interface CourierSuccessRateProps {
  phone: string;
}

const CourierSuccessRate: React.FC<CourierSuccessRateProps> = ({ phone }) => {
  const { fetchCourierFraudCheck, orders } = useShop();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<{
    total?: number;
    delivered?: number;
    cancelled?: number;
    ratio?: number;
    loaded: boolean;
    error?: string;
  }>({ loaded: false });

  const phoneClean = (phone || '').replace(/\D/g, '');
  const customerOrdersList = orders.filter(
    (o) => o.customer?.phone && o.customer.phone.replace(/\D/g, '') === phoneClean
  );
  const dbDelivered = customerOrdersList.filter(o => o.status === 'delivered').length;
  const dbCancelled = customerOrdersList.filter(o => o.status === 'cancelled').length;
  const dbTotal = customerOrdersList.length;

  const loadData = async () => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await fetchCourierFraudCheck(phone);
      if (res.success) {
        setData({
          total: res.total_parcel,
          delivered: res.delivered_parcel,
          cancelled: res.cancelled_parcel,
          ratio: res.delivery_ratio,
          loaded: true
        });
      } else {
        setData({ loaded: true, error: res.message });
      }
    } catch (err) {
      setData({ loaded: true, error: 'সার্ভার এরর' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (phoneClean.length >= 11) {
      loadData();
    }
  }, [phone]);

  const deliveredCount = (data.loaded && data.delivered !== undefined) ? data.delivered : dbDelivered;
  const cancelledCount = (data.loaded && data.cancelled !== undefined) ? data.cancelled : dbCancelled;
  const totalCount = (data.loaded && data.total !== undefined) ? data.total : dbTotal;
  const ratio = data.loaded && data.ratio !== undefined ? data.ratio : (totalCount > 0 ? Math.round((deliveredCount / totalCount) * 100) : (deliveredCount > 0 ? 100 : 0));

  return (
    <div className="flex flex-col gap-0.5 mt-1 border-t border-dashed border-gray-200 pt-1">
      <div className="text-[10px] font-bold bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded border border-emerald-200 inline-flex items-center justify-between gap-2">
        <span>ডেলিভারি: <strong className="text-emerald-700">{deliveredCount}</strong></span>
        <span>বাতিল: <strong className="text-rose-600">{cancelledCount}</strong></span>
        {data.loaded && !data.error && (
          <span className="text-blue-700 font-mono">({ratio}%)</span>
        )}
      </div>
      {!data.loaded && !loading && (
        <button
          type="button"
          onClick={loadData}
          className="text-[9px] text-blue-600 hover:underline font-semibold text-left cursor-pointer mt-0.5"
        >
          🔍 কুরিয়ার API চেক করুন
        </button>
      )}
      {loading && (
        <span className="text-[9px] text-emerald-600 animate-pulse font-bold mt-0.5">🔄 চেক হচ্ছে...</span>
      )}
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    deleteMultipleProducts,
    logoutAdmin,
    pixelId,
    setPixelId,
    pixelAccessToken,
    setPixelAccessToken,
    gtmId,
    setGtmId,
    courierService,
    setCourierService,
    courierApiKey,
    setCourierApiKey,
    courierSecretKey,
    setCourierSecretKey,
    orders,
    incompleteOrders,
    placeOrder,
    addOrUpdateIncompleteOrder,
    deleteIncompleteOrder,
    updateOrderStatus,
    blockedPhones,
    blockPhone,
    unblockPhone,
    isPhoneBlocked,
    enableDailyLimit,
    setEnableDailyLimit,
    whitelistedPhones,
    whitelistPhone,
    unwhitelistPhone,
    categories,
    addCategory,
    deleteCategory,
    consignmentMap,
    sendOrderToCourier,
    resetCourierStatus,
    steadfastBalance,
    setSteadfastBalance,
    steadfastPaidOut,
    setSteadfastPaidOut,
    discountCodes,
    addDiscountCode,
    deleteDiscountCode,
    toggleDiscountCode,
    deleteOrder,
    updateOrderMetaSynced,
    adminUsername,
    setAdminUsername,
    adminPassword,
    setAdminPassword,
    storeLogo,
    setStoreLogo,
    storeBanner,
    setStoreBanner,
    storeName,
    setStoreName,
    storeFavicon,
    setStoreFavicon,
    whatsappNumber,
    setWhatsappNumber,
    phoneNumber,
    setPhoneNumber,
    messengerUrl,
    setMessengerUrl,
    facebookPageUrl,
    setFacebookPageUrl,
    heroBadge,
    setHeroBadge,
    heroTitle1,
    setHeroTitle1,
    heroTitle2,
    setHeroTitle2,
    heroSubtitle,
    setHeroSubtitle,
    landingPages,
    addLandingPage,
    updateLandingPage,
    deleteLandingPage,
    categoryImages,
    setCategoryImage,
    checkBalance,
    fetchCourierFraudCheck,

    headerBgColor,
    setHeaderBgColor,
    headerTextColor,
    setHeaderTextColor,
    showCategoryFilterBar,
    setShowCategoryFilterBar,
    footerShow,
    setFooterShow,
    footerBgColor,
    setFooterBgColor,
    footerTextColor,
    setFooterTextColor,
    footerText,
    setFooterText,
    footerAddress,
    setFooterAddress,
    footerPayments,
    setFooterPayments,
    btnInstantOrderShow,
    setBtnInstantOrderShow,
    btnInstantOrderText,
    setBtnInstantOrderText,
    btnInstantOrderBgColor,
    setBtnInstantOrderBgColor,
    btnInstantOrderTextColor,
    setBtnInstantOrderTextColor,
    btnAddToCartShow,
    setBtnAddToCartShow,
    btnAddToCartText,
    setBtnAddToCartText,
    btnAddToCartBgColor,
    setBtnAddToCartBgColor,
    btnAddToCartTextColor,
    setBtnAddToCartTextColor,
    btnDetailsShow,
    setBtnDetailsShow,
    btnDetailsText,
    setBtnDetailsText,
    btnDetailsBgColor,
    setBtnDetailsBgColor,
    btnDetailsTextColor,
    setBtnDetailsTextColor,

    shippingInsideCost,
    setShippingInsideCost,
    shippingInsideText,
    setShippingInsideText,
    shippingInsideDesc,
    setShippingInsideDesc,
    shippingInsideShow,
    setShippingInsideShow,

    shippingOutsideCost,
    setShippingOutsideCost,
    shippingOutsideText,
    setShippingOutsideText,
    shippingOutsideDesc,
    setShippingOutsideDesc,
    shippingOutsideShow,
    setShippingOutsideShow,

    freeShippingEnabled,
    setFreeShippingEnabled,
    freeShippingThreshold,
    setFreeShippingThreshold,

    menuItems,
    setMenuItems,
    saveStoreSettingsToCloud,
  } = useShop();

  const [shippingInsideCostInput, setShippingInsideCostInput] = useState(shippingInsideCost);
  const [shippingInsideTextInput, setShippingInsideTextInput] = useState(shippingInsideText);
  const [shippingInsideDescInput, setShippingInsideDescInput] = useState(shippingInsideDesc);
  const [shippingInsideShowInput, setShippingInsideShowInput] = useState(shippingInsideShow);

  const [shippingOutsideCostInput, setShippingOutsideCostInput] = useState(shippingOutsideCost);
  const [shippingOutsideTextInput, setShippingOutsideTextInput] = useState(shippingOutsideText);
  const [shippingOutsideDescInput, setShippingOutsideDescInput] = useState(shippingOutsideDesc);
  const [shippingOutsideShowInput, setShippingOutsideShowInput] = useState(shippingOutsideShow);

  const [freeShippingEnabledInput, setFreeShippingEnabledInput] = useState(freeShippingEnabled);
  const [freeShippingThresholdInput, setFreeShippingThresholdInput] = useState(freeShippingThreshold);

  const [logoInput, setLogoInput] = useState(storeLogo);
  const [bannerInput, setBannerInput] = useState(storeBanner);
  const [nameInput, setNameInput] = useState(storeName);
  const [faviconInput, setFaviconInput] = useState(storeFavicon);
  const [whatsappInput, setWhatsappInput] = useState(whatsappNumber);
  const [phoneInput, setPhoneInput] = useState(phoneNumber);
  const [messengerInput, setMessengerInput] = useState(messengerUrl);
  const [fbPageInput, setFbPageInput] = useState(facebookPageUrl);
  const [badgeInput, setBadgeInput] = useState(heroBadge);
  const [title1Input, setTitle1Input] = useState(heroTitle1);
  const [title2Input, setTitle2Input] = useState(heroTitle2);
  const [subtitleInput, setSubtitleInput] = useState(heroSubtitle);

  const [headerBgInput, setHeaderBgInput] = useState(headerBgColor);
  const [headerTextInput, setHeaderTextInput] = useState(headerTextColor);
  const [showCategoryFilterBarInput, setShowCategoryFilterBarInput] = useState(showCategoryFilterBar);
  
  const [footerShowInput, setFooterShowInput] = useState(footerShow);
  const [footerBgInput, setFooterBgInput] = useState(footerBgColor);
  const [footerTextColorInput, setFooterTextColorInput] = useState(footerTextColor);
  const [footerSloganInput, setFooterSloganInput] = useState(footerText);
  const [footerAddressInput, setFooterAddressInput] = useState(footerAddress);
  const [footerPaymentsInput, setFooterPaymentsInput] = useState(footerPayments);

  const [btnInstantOrderShowInput, setBtnInstantOrderShowInput] = useState(btnInstantOrderShow);
  const [btnInstantOrderTextInput, setBtnInstantOrderTextInput] = useState(btnInstantOrderText);
  const [btnInstantOrderBgInput, setBtnInstantOrderBgInput] = useState(btnInstantOrderBgColor);
  const [btnInstantOrderTextColorInput, setBtnInstantOrderTextColorInput] = useState(btnInstantOrderTextColor);

  const [btnAddToCartShowInput, setBtnAddToCartShowInput] = useState(btnAddToCartShow);
  const [btnAddToCartTextInput, setBtnAddToCartTextInput] = useState(btnAddToCartText);
  const [btnAddToCartBgInput, setBtnAddToCartBgInput] = useState(btnAddToCartBgColor);
  const [btnAddToCartTextColorInput, setBtnAddToCartTextColorInput] = useState(btnAddToCartTextColor);

  const [btnDetailsShowInput, setBtnDetailsShowInput] = useState(btnDetailsShow);
  const [btnDetailsTextInput, setBtnDetailsTextInput] = useState(btnDetailsText);
  const [btnDetailsBgInput, setBtnDetailsBgInput] = useState(btnDetailsBgColor);
  const [btnDetailsTextColorInput, setBtnDetailsTextColorInput] = useState(btnDetailsTextColor);

  const [newCatInput, setNewCatInput] = useState('');
  const [landingForm, setLandingForm] = useState({
    id: '',
    slug: '',
    title: '',
    productId: products[0]?.id || '',
    bannerImage: '',
    galleryImages: [] as string[],
    headline: '',
    subheadline: '',
    badgeText: '☀️ SUMMER COTTON SPECIAL',
    discountPrice: 999,
    featuresText: '১০০% প্রিমিয়াম সুতি কাপড়\nঅরিজিনাল এম্ব্রয়ডারি ডিজাইন\nক্যাশ অন ডেলিভারি সুবিধা\nসারা দেশে দ্রুত হোম ডেলিভারি',
    isActive: true,
    sizes: [] as string[],
  });
  const [landingCustomSizeInput, setLandingCustomSizeInput] = useState("");
  const [isLandingModalOpen, setIsLandingModalOpen] = useState(false);
  const [editingLandingId, setEditingLandingId] = useState<string | null>(null);

  // Local state for header menu item editor
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);
  const [menuForm, setMenuForm] = useState<{
    label: string;
    type: 'home' | 'shop' | 'reel' | 'categories' | 'about' | 'url' | 'category_filter';
    link: string;
    categoryFilter: string;
    isActive: boolean;
  }>({
    label: '',
    type: 'shop',
    link: '',
    categoryFilter: '',
    isActive: true
  });
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  // Local state for discount code manager form
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    type: "fixed" as "fixed" | "percentage",
    value: 100,
    minPurchase: 1000,
  });

  const [whitelistInput, setWhitelistInput] = useState("");
  const [newAdminUser, setNewAdminUser] = useState(adminUsername);
  const [newAdminPass, setNewAdminPass] = useState(adminPassword);

  // Dynamically calculate "In Transit / Cod Pending"
  const steadfastInTransit = orders
    .filter((order) => consignmentMap[order.id] && (order.status === "pending" || order.status === "shipped"))
    .reduce((sum, order) => sum + order.total, 0);

  // Dynamically calculate "Total Sales Value"
  const totalSalesVal = orders
    .filter((order) => order.status !== "cancelled")
    .reduce((sum, order) => sum + order.total, 0);

  const [activeTab, setActiveTab] = useState("home");
  const [isAudioEnabled, setIsAudioEnabled] = useState(() => {
    return localStorage.getItem("elham_audio_alerts") !== "false";
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const initialFormState = {
    title: "",
    price: "",
    originalPrice: "",
    category: (categories[0] || "Premium Panjabi") as Category,
    image: "",
    gallery: [] as string[],
    description: "",
    sizes: ['38', '40', '42', '44', '46'] as string[],
    inStock: true,
    packages: [] as any[],
  };

  const [formData, setFormData] = useState(initialFormState);
  const [galleryUrlInput, setGalleryUrlInput] = useState("");
  const [customSizeInput, setCustomSizeInput] = useState("");
  const [steadfastSubTab, setSteadfastSubTab] = useState<"orders" | "balance" | "settings">("orders");
  const [incompleteSearchQuery, setIncompleteSearchQuery] = useState("");
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [confirmingPlaceId, setConfirmingPlaceId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Order Details & Courier Posting States
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [sendingCourierOrderId, setSendingCourierOrderId] = useState<string | null>(null);

  const handleSendOrderToCourierAsync = async (orderId: string) => {
    setSendingCourierOrderId(orderId);
    try {
      const res = await sendOrderToCourier(orderId);
      if (res.success) {
        setSuccessModal({
          isOpen: true,
          title: "SteadFast এন্ট্রি সফল!",
          description: `অর্ডার #${orderId.slice(0, 8)} সফলভাবে SteadFast মার্চেন্ট প্যানেলে পাঠানো হয়েছে।\n\nকনসাইনমেন্ট আইডি: ${res.trackingCode}\nস্ট্যাটাস: In Review`
        });
      } else {
        setSuccessModal({
          isOpen: true,
          title: "SteadFast এন্ট্রি বার্তা / স্ট্যাটাস",
          description: `${res.message}\n\nরেফারেন্স আইডি: ${res.trackingCode || 'N/A'}\n\nপরামর্শ: 'Courier' ট্যাবে আপনার Steadfast API key ও Secret Key যাচাই করুন। অথবা 'SteadFast CSV ডাউনলোড' বাটনে ক্লিক করে ফাইল দিয়ে Steadfast Merchant Portal-এ বাল্ক আপলোড (Bulk Import) করতে পারেন।`,
          isError: true
        });
      }
    } catch (err: any) {
      setSuccessModal({
        isOpen: true,
        title: "এন্ট্রি ট্র্যাকিং প্রসেসিং এরর",
        description: `প্রসেসিং এ সমস্যা দেখা দিয়েছে: ${err.message || err}`,
        isError: true
      });
    } finally {
      setSendingCourierOrderId(null);
    }
  };

  const exportSteadfastCSV = () => {
    if (orders.length === 0) {
      alert("ডাউনলোড করার মতো কোনো অর্ডার নেই!");
      return;
    }
    const headers = ["Invoice", "Recipient Name", "Recipient Phone", "Recipient Address", "COD Amount", "Note"];
    const rows = orders.map(o => {
      const itemNotes = o.items.map(item => {
        const prod = products.find(p => p.id === item.productId);
        return `${prod?.title || 'Panjabi'} (Size: ${item.size}, Qty: ${item.quantity})`;
      }).join('; ');
      return [
        `"${o.id}"`,
        `"${o.customer.name.replace(/"/g, '""')}"`,
        `"${o.customer.phone.replace(/"/g, '""')}"`,
        `"${(o.customer.address + (o.customer.city ? ', ' + o.customer.city : '')).replace(/"/g, '""')}"`,
        o.total,
        `"${itemNotes.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Steadfast_Bulk_Orders_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateTestDemoOrder = () => {
    const targetProd = products[0] || { id: 'led-high-tops-copy-copy', title: 'লক্সারিয়াস কটন পাঞ্জাবি', price: 1450 };
    const randPhone = '017' + Math.floor(10000000 + Math.random() * 90000000);
    placeOrder({
      customer: {
        name: 'মো: আরিফুল ইসলাম (টেস্ট কাস্টমার)',
        phone: randPhone,
        address: 'হাউজ #১২, রোড #৪, ব্লক-বি, ধানমণ্ডি',
        city: 'ঢাকা'
      },
      items: [
        {
          productId: targetProd.id,
          quantity: 1,
          price: targetProd.price || 1450,
          size: '42'
        }
      ],
      total: targetProd.price || 1450,
      paymentMethod: 'ক্যাশ অন ডেলিভারি (COD)'
    });
    setSuccessModal({
      isOpen: true,
      title: "স্যাম্পল টেস্ট অর্ডার তৈরি হয়েছে!",
      description: `একটি নতুন নমুনা অর্ডার সফলভাবে তৈরি করা হয়েছে।\nকাস্টমার: মো: আরিফুল ইসলাম\nফোন: ${randPhone}\nমূল্য: ৳${targetProd.price || 1450}`
    });
  };

  // Steadfast Consignment Modal states
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState<any | null>(null);
  const [successModal, setSuccessModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    amount?: number;
    transactionId?: string;
    isError?: boolean;
  } | null>(null);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [consignmentForm, setConsignmentForm] = useState({
    name: "",
    phone: "",
    address: "",
    cod: 0,
    note: "",
  });
  const [createdConsignment, setCreatedConsignment] = useState<{
    trackingId: string;
    orderId: string;
    name: string;
    phone: string;
    address: string;
    cod: number;
    note: string;
    date: string;
  } | null>(null);
  const [consignmentError, setConsignmentError] = useState<string | null>(null);

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file, index) => {
        if (file.type.startsWith("image/")) {
          compressImage(file).then(res => {
            if (index === 0) {
              setFormData(prev => ({ ...prev, image: res }));
            } else {
              setFormData(prev => ({
                ...prev,
                gallery: [...(prev.gallery || []), res]
              }));
            }
          }).catch(console.error);
        }
      });
    }
  };

  const handleGalleryImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        if (file.type.startsWith("image/")) {
          compressImage(file).then(res => setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), res] })));
        }
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      compressImage(file).then(res => setFormData(prev => ({ ...prev, image: res })));
    }
  };

  const handleSendToMeta = (order: any) => {
    // 1. Fire Facebook Pixel client-side
    // @ts-ignore
    if (pixelId && window.fbq) {
      // @ts-ignore
      window.fbq('track', 'Purchase', {
        value: order.total,
        currency: 'BDT',
        content_type: 'product',
        content_name: order.items[0]?.product?.title || 'Product',
        num_items: order.items.reduce((sum: number, item: any) => sum + item.quantity, 0)
      });
    }

    // 2. Fire Google Tag Manager dataLayer
    // @ts-ignore
    if (window.dataLayer) {
      // @ts-ignore
      window.dataLayer.push({
        event: 'purchase',
        ecommerce: {
          transaction_id: order.id,
          value: order.total,
          currency: 'BDT',
          items: order.items.map((item: any) => ({
            item_id: item.productId,
            item_name: 'Product',
            price: item.price,
            quantity: item.quantity
          }))
        }
      });
    }

    // 3. Optional: Facebook Conversions API (CAPI) send via Pixel Access Token
    if (pixelId && pixelAccessToken) {
      fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${pixelAccessToken}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: [
            {
              event_name: 'Purchase',
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'website',
              event_source_url: window.location.href,
              user_data: {
                ph: [order.customer.phone.trim().replace(/[^0-9]/g, '')]
              },
              custom_data: {
                currency: 'BDT',
                value: order.total
              }
            }
          ]
        })
      }).catch(err => console.error("CAPI error:", err));
    }

    // 4. Update state
    updateOrderMetaSynced(order.id, true);

    // 5. Show custom success modal
    setSuccessModal({
      isOpen: true,
      title: "মেটা পিক্সেলে পাঠানো হয়েছে",
      description: `অর্ডার ${order.id} এর কনভার্সন ডেটা সফলভাবে মেটা (Facebook Pixel & GTM) সার্ভারে পাঠানো হয়েছে!`
    });
  };

  const parseCSV = (text: string): string[][] => {
    const lines: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let currentValue = '';

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const nextChar = text[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentValue += '"';
          i++; // skip next quote
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        row.push(currentValue);
        currentValue = '';
      } else if ((char === '\r' || char === '\n') && !inQuotes) {
        if (char === '\r' && nextChar === '\n') {
          i++; // skip '\n'
        }
        row.push(currentValue);
        lines.push(row);
        row = [];
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    if (currentValue || row.length > 0) {
      row.push(currentValue);
      lines.push(row);
    }
    return lines;
  };

  const handleExportCSV = () => {
    try {
      const headers = ["id", "title", "price", "originalPrice", "category", "image", "images", "sizes", "description", "inStock", "packages"];
      
      const escapeCSV = (val: any) => {
        if (val === undefined || val === null) return '';
        let str = '';
        if (typeof val === 'object') {
          str = JSON.stringify(val);
        } else {
          str = String(val);
        }
        return '"' + str.replace(/"/g, '""') + '"';
      };

      const csvRows = [headers.join(",")];
      
      for (const p of products) {
        const row = [
          escapeCSV(p.id),
          escapeCSV(p.title),
          escapeCSV(p.price),
          escapeCSV(p.originalPrice || ""),
          escapeCSV(p.category),
          escapeCSV(p.image),
          escapeCSV(p.images || [p.image]),
          escapeCSV(p.sizes || ["38", "40", "42", "44", "46"]),
          escapeCSV(p.description),
          escapeCSV(p.inStock ? "TRUE" : "FALSE"),
          escapeCSV(p.packages || [])
        ];
        csvRows.push(row.join(","));
      }
      
      const csvContent = "\uFEFF" + csvRows.join("\n"); // Add UTF-8 BOM for Excel Bengali character compatibility
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `elham_products_export_${new Date().toISOString().slice(0,10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setSuccessModal({
        isOpen: true,
        title: "প্রোডাক্ট এক্সপোর্ট সফল হয়েছে!",
        description: `মোট ${products.length} টি প্রোডাক্ট সফলভাবে CSV ফাইলে এক্সপোর্ট করা হয়েছে।`
      });
    } catch (err: any) {
      setSuccessModal({
        isOpen: true,
        isError: true,
        title: "এক্সপোর্ট ব্যর্থ হয়েছে",
        description: `ভুল: ${err.message || err}`
      });
    }
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          throw new Error("ফাইলটি খালি বা পড়া সম্ভব হয়নি।");
        }

        const parsedLines = parseCSV(text);
        if (parsedLines.length < 2) {
          throw new Error("ফাইলে কোনো প্রোডাক্ট ডেটা পাওয়া যায়নি বা ফরম্যাট ভুল।");
        }

        const rawHeaders = parsedLines[0].map(h => h.trim().toLowerCase());
        const dataRows = parsedLines.slice(1);

        // Find indices for headers
        const getIdx = (aliases: string[]) => {
          return rawHeaders.findIndex(h => aliases.includes(h));
        };

        const idIdx = getIdx(["id"]);
        const titleIdx = getIdx(["title", "name", "title / শিরোনাম", "শিরোনাম", "নাম"]);
        const priceIdx = getIdx(["variant price", "price", "rate", "মূল্য", "দাম"]);
        const originalPriceIdx = getIdx(["variant compare at price", "compare at price", "compare_at_price", "original price", "original_price", "regular price", "regular_price", "old price", "old_price", "compare-at price"]);
        const categoryIdx = getIdx(["type", "product type", "product_type", "product category", "product_category", "category", "বিভাগ"]);
        const imageIdx = getIdx(["image src", "image_src", "variant image", "variant_image", "image url", "image_url", "image", "thumbnail", "ছবি"]);
        const imagesIdx = getIdx(["images", "gallery", "ছবিসমূহ"]);
        const sizesIdx = getIdx(["sizes", "size", "সাইজ"]);
        const descIdx = getIdx(["description", "desc", "বিবরণ", "body (html)", "body_html"]);
        const inStockIdx = getIdx(["instock", "stock", "স্টক"]);
        const packagesIdx = getIdx(["packages", "প্যাকেজ"]);

        if (titleIdx === -1) {
          throw new Error("CSV ফাইলে অবশ্যই 'title' বা 'name' কলাম থাকতে হবে।");
        }

        let importCount = 0;
        let updateCount = 0;

        for (const row of dataRows) {
          // Skip empty lines
          if (row.length === 0 || (row.length === 1 && !row[0])) continue;

          const title = row[titleIdx]?.trim();
          if (!title) continue; // skip rows with no title

          let id = idIdx !== -1 && row[idIdx] ? row[idIdx].trim() : "";
          if (!id) {
            id = "prod-" + Math.random().toString(36).substring(2, 9);
          }

          const price = priceIdx !== -1 && row[priceIdx] ? parseFloat(row[priceIdx].replace(/[^0-9.]/g, "")) || 0 : 0;
          
          let originalPrice: number | undefined = undefined;
          if (originalPriceIdx !== -1 && row[originalPriceIdx]) {
            const parsedOrig = parseFloat(row[originalPriceIdx].replace(/[^0-9.]/g, ""));
            if (!isNaN(parsedOrig) && parsedOrig > 0) {
              originalPrice = parsedOrig;
            }
          }

          let rawCat = categoryIdx !== -1 && row[categoryIdx] ? row[categoryIdx].trim() : "";
          const category = rawCat && rawCat.toLowerCase() !== "uncategorized" && rawCat.toLowerCase() !== "none" ? rawCat : "General";
          const description = descIdx !== -1 && row[descIdx] ? row[descIdx].trim() : "";

          // inStock parsing
          let inStock = true;
          if (inStockIdx !== -1 && row[inStockIdx]) {
            const stockVal = row[inStockIdx].trim().toLowerCase();
            if (["false", "no", "0", "n", "out of stock", "ব্যতীত", "না"].includes(stockVal)) {
              inStock = false;
            }
          }

          // Sizes parsing
          let sizes: string[] = [];
          if (sizesIdx !== -1 && row[sizesIdx]) {
            const sizesVal = row[sizesIdx].trim();
            if (sizesVal.startsWith("[")) {
              try { sizes = JSON.parse(sizesVal); } catch (e) { sizes = sizesVal.split(";").map(s => s.trim()).filter(Boolean); }
            } else {
              sizes = sizesVal.split(/[;,]/).map(s => s.trim()).filter(Boolean);
            }
          }

          // Images and primary image processing (Shopify & Custom support)
          let image = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500";
          let images: string[] = [];
          const foundImages: string[] = [];

          const addImageUrls = (val: string) => {
            if (!val) return;
            if (val.startsWith("[")) {
              try {
                const parsed = JSON.parse(val);
                if (Array.isArray(parsed)) {
                  parsed.forEach(item => {
                    const s = String(item).trim();
                    if (s) foundImages.push(s);
                  });
                  return;
                }
              } catch (e) {}
            }
            val.split(/[;,\n]/).forEach(item => {
              const s = item.trim();
              if (s) foundImages.push(s);
            });
          };

          if (imageIdx !== -1 && row[imageIdx]) {
            addImageUrls(row[imageIdx]);
          }
          if (imagesIdx !== -1 && row[imagesIdx]) {
            addImageUrls(row[imagesIdx]);
          }

          // Scan all other potential image headers as fallback
          rawHeaders.forEach((h, idx) => {
            if (idx !== imageIdx && idx !== imagesIdx) {
              if (["image src", "image_src", "variant image", "variant_image", "image url", "image_url"].includes(h)) {
                if (row[idx]) {
                  addImageUrls(row[idx]);
                }
              }
            }
          });

          const cleanImages = foundImages
            .map(u => {
              let cleaned = u.trim();
              if (cleaned.startsWith("//")) {
                cleaned = "https:" + cleaned;
              }
              return cleaned;
            })
            .filter(u => u.startsWith("http://") || u.startsWith("https://") || u.startsWith("/") || u.startsWith("data:"));

          if (cleanImages.length > 0) {
            image = cleanImages[0];
            images = cleanImages;
          }

          // Packages parsing
          let packages: any[] = [];
          if (packagesIdx !== -1 && row[packagesIdx]) {
            const packagesVal = row[packagesIdx].trim();
            try {
              packages = JSON.parse(packagesVal);
            } catch (e) {
              console.warn("Failed to parse packages JSON for row:", title, e);
            }
          }

          const productData: any = {
            id,
            title,
            price,
            originalPrice,
            category,
            image,
            images: images.length ? images : [image],
            sizes: sizes.length ? sizes : ["38", "40", "42", "44", "46"],
            description,
            inStock,
            packages: packages.length ? packages : []
          };

          const exists = products.some(p => p.id === id);
          if (category) {
            addCategory(category);
          }
          if (exists) {
            await updateProduct(productData);
            updateCount++;
          } else {
            await addProduct(productData);
            importCount++;
          }
        }

        setSuccessModal({
          isOpen: true,
          title: "ইম্পোর্ট সম্পন্ন হয়েছে!",
          description: `প্রোডাক্ট ইম্পোর্ট সফল হয়েছে।\nনতুন যোগ করা হয়েছে: ${importCount} টি\nআপডেট করা হয়েছে: ${updateCount} টি`
        });
      } catch (err: any) {
        setSuccessModal({
          isOpen: true,
          isError: true,
          title: "ইম্পোর্ট ব্যর্থ হয়েছে",
          description: err.message || "CSV ফাইলটি সঠিকভাবে পার্স করা সম্ভব হয়নি।"
        });
      } finally {
        // Reset the file input value so same file can be selected again
        e.target.value = "";
      }
    };
    reader.onerror = () => {
      setSuccessModal({
        isOpen: true,
        isError: true,
        title: "ফাইল রিডিং ব্যর্থ",
        description: "ফাইলটি পড়তে সমস্যা হয়েছে।"
      });
    };
    reader.readAsText(file);
  };

  const handleBulkDeleteProducts = async () => {
    if (selectedProductIds.length === 0) return;
    
    setConfirmModal({
      isOpen: true,
      title: "নির্বাচিত পণ্যগুলো ডিলিট করতে চান?",
      description: `আপনি কি নিশ্চিত যে আপনি সিলেক্ট করা ${selectedProductIds.length} টি পণ্য একসাথে ডিলিট করতে চান? এটি আর ফিরিয়ে আনা সম্ভব হবে না।`,
      onConfirm: async () => {
        try {
          await deleteMultipleProducts(selectedProductIds);
          setSelectedProductIds([]); // Clear selection
          setSuccessModal({
            isOpen: true,
            title: "ডিলিট সম্পন্ন হয়েছে!",
            description: `সিলেক্ট করা পণ্যগুলো সফলভাবে ডিলিট করা হয়েছে।`
          });
        } catch (err: any) {
          setSuccessModal({
            isOpen: true,
            isError: true,
            title: "ডিলিট ব্যর্থ হয়েছে",
            description: err.message || "পণ্য ডিলিট করার সময় সমস্যা হয়েছে।"
          });
        }
      }
    });
  };

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        title: product.title,
        price: product.price.toString(),
        originalPrice: product.originalPrice ? product.originalPrice.toString() : "",
        category: product.category,
        image: product.image,
        gallery: product.gallery || product.images || [],
        description: product.description,
        sizes: product.sizes && product.sizes.length > 0 ? product.sizes : ['38', '40', '42', '44', '46'],
        inStock: product.inStock,
        packages: product.packages ? product.packages.map((p, idx) => ({ ...p, id: p.id || `legacy-${idx}` })) : [],
      });
    } else {
      setEditingProduct(null);
      setFormData({
        title: "",
        price: "",
        originalPrice: "",
        category: categories[0] || "Premium Panjabi",
        image: "",
        gallery: [],
        description: "",
        sizes: ['38', '40', '42', '44', '46'],
        inStock: true,
        packages: [],
      });
    }
    setCustomSizeInput("");
    setGalleryUrlInput("");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setGalleryUrlInput("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData: Product = {
      id: editingProduct ? editingProduct.id : crypto.randomUUID(),
      title: formData.title,
      price: Number(formData.price),
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      category: formData.category,
      image:
        formData.image ||
        "https://images.unsplash.com/photo-1583391733959-b0510f6992dd?auto=format&fit=crop&q=80&w=800",
      gallery: formData.gallery || [],
      images: formData.gallery || [],
      description: formData.description,
      sizes: formData.sizes && formData.sizes.length > 0 ? formData.sizes : ['38', '40', '42', '44', '46'],
      inStock: formData.inStock,
      packages: formData.packages,
    };

    if (editingProduct) {
      updateProduct(productData);
    } else {
      addProduct(productData);
    }
    handleCloseModal();
  };

  const handleSaveMenuItem = () => {
    if (!menuForm.label.trim()) return;

    if (editingMenuItemId) {
      const updated = menuItems.map(item => {
        if (item.id === editingMenuItemId) {
          return {
            ...item,
            label: menuForm.label,
            type: menuForm.type,
            link: menuForm.type === 'url' ? menuForm.link : undefined,
            categoryFilter: menuForm.type === 'category_filter' ? menuForm.categoryFilter : undefined,
            isActive: menuForm.isActive
          } as MenuItem;
        }
        return item;
      });
      setMenuItems(updated);
    } else {
      const newItem: MenuItem = {
        id: Date.now().toString(),
        label: menuForm.label,
        type: menuForm.type,
        link: menuForm.type === 'url' ? menuForm.link : undefined,
        categoryFilter: menuForm.type === 'category_filter' ? menuForm.categoryFilter : undefined,
        isActive: menuForm.isActive
      };
      setMenuItems([...menuItems, newItem]);
    }

    setIsMenuModalOpen(false);
    setEditingMenuItemId(null);
    setMenuForm({
      label: '',
      type: 'shop',
      link: '',
      categoryFilter: '',
      isActive: true
    });
  };

  const handleDeleteMenuItem = (id: string) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
  };

  const handleMoveMenuItem = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= menuItems.length) return;

    const updated = [...menuItems];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setMenuItems(updated);
  };

  const handleToggleMenuItem = (id: string) => {
    setMenuItems(menuItems.map(item => {
      if (item.id === id) {
        return { ...item, isActive: !item.isActive };
      }
      return item;
    }));
  };

  const NAV_ITEMS = [
    { id: "home", label: "Home", icon: Home },
    { id: "orders", label: "Orders", icon: ShoppingCart },
    { id: "incomplete", label: "Draft / Incomplete (ড্রাফট)", icon: AlertTriangle },
    { id: "products", label: "Products", icon: Package },
    { id: "customers", label: "Customers", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "discounts", label: "Discounts", icon: Tag },
    { id: "branding", label: "লোগো ও ব্যানার", icon: ImageIcon },
    { id: "navigation_menu", label: "হেডার মেনু ও ক্যাটাগরি", icon: Menu },
    { id: "landings", label: "ল্যান্ডিং পেজ মেকার", icon: ExternalLink },
    { id: "deployment", label: "হোস্টিং জিপ ও ডিপ্লয়মেন্ট", icon: Download },
  ];

  return (
    <div className="min-h-screen flex bg-[#f4f6f8] font-sans">
      {/* Mobile Drawer (Visible on Mobile only when isMobileMenuOpen is true) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          ></div>
          
          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-[#1a1a1a] text-[#b3b3b3] flex flex-col h-full shadow-2xl transition-transform duration-300 transform translate-x-0 overflow-y-auto">
            <div className="p-4 flex items-center justify-between text-white border-b border-[#2d2d2d] mb-4">
              <div className="flex items-center gap-2.5">
                <img 
                  src={storeLogo} 
                  alt="Logo" 
                  referrerPolicy="no-referrer"
                  className="w-8 h-8 rounded-full border border-[var(--color-gold)] object-cover"
                />
                <span className="font-bold text-sm tracking-widest text-[var(--color-gold)]">ELHAMSHOP</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-3 space-y-0.5">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === item.id
                      ? "bg-[#333333] text-white"
                      : "hover:bg-[#2d2d2d] hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.id === "incomplete" && incompleteOrders.length > 0 && (
                    <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                      {incompleteOrders.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="p-3 mt-auto border-t border-[#333333] space-y-1">
              <button
                onClick={() => {
                  setActiveTab("fb_pixel");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "fb_pixel" ? "bg-[#333333] text-white" : "hover:bg-[#2d2d2d] hover:text-white"}`}
              >
                <Tag className="w-5 h-5" />
                Facebook Pixel
              </button>

              <button
                onClick={() => {
                  setActiveTab("gtm");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "gtm" ? "bg-[#333333] text-white" : "hover:bg-[#2d2d2d] hover:text-white"}`}
              >
                <Tag className="w-5 h-5" />
                Google Tag Manager
              </button>

              <button
                onClick={() => {
                  setActiveTab("courier");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "courier" ? "bg-[#333333] text-white" : "hover:bg-[#2d2d2d] hover:text-white"}`}
              >
                <Package className="w-5 h-5" />
                Courier Settings
              </button>

              <button
                onClick={() => {
                  setActiveTab("admin_settings");
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "admin_settings" ? "bg-[#333333] text-white" : "hover:bg-[#2d2d2d] hover:text-white"}`}
              >
                <Lock className="w-5 h-5" />
                Admin Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-[240px] bg-[#1a1a1a] text-[#b3b3b3] flex flex-col hidden md:flex shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div className="p-4 flex items-center gap-3 text-white border-b border-[#2d2d2d] mb-4">
          <img 
            src={storeLogo} 
            alt="Logo" 
            referrerPolicy="no-referrer"
            className="w-9 h-9 rounded-full border border-[var(--color-gold)] object-cover shadow-[0_0_8px_rgba(212,175,55,0.15)]"
          />
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-widest text-[var(--color-gold)] leading-none">ELHAMSHOP</span>
            <span className="text-[9px] text-[#8a8a8a] mt-1">Admin Panel</span>
          </div>
        </div>

        <div className="px-3 mb-4">
          <div className="bg-[#2d2d2d] rounded-md flex items-center px-3 py-1.5 border border-[#404040]">
            <Search className="w-4 h-4 text-[#8a8a8a] mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-[#8a8a8a]"
            />
            <div className="text-[10px] bg-[#404040] text-[#8a8a8a] px-1.5 rounded">
              CTRL K
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? "bg-[#333333] text-white"
                  : "hover:bg-[#2d2d2d] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              {item.id === "incomplete" && incompleteOrders.length > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                  {incompleteOrders.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 mt-auto border-t border-[#333333] space-y-1">
          <button
            onClick={() => setActiveTab("fb_pixel")}
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "fb_pixel" ? "bg-[#333333] text-white" : "hover:bg-[#2d2d2d] hover:text-white"}`}
          >
            <Tag className="w-5 h-5" />
            Facebook Pixel
          </button>

          <button
            onClick={() => setActiveTab("gtm")}
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "gtm" ? "bg-[#333333] text-white" : "hover:bg-[#2d2d2d] hover:text-white"}`}
          >
            <Tag className="w-5 h-5" />
            Google Tag Manager
          </button>

          <button
            onClick={() => setActiveTab("courier")}
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "courier" ? "bg-[#333333] text-white" : "hover:bg-[#2d2d2d] hover:text-white"}`}
          >
            <Package className="w-5 h-5" />
            Courier Settings
          </button>

          <button
            onClick={() => setActiveTab("admin_settings")}
            className={`w-full flex items-center gap-3 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "admin_settings" ? "bg-[#333333] text-white" : "hover:bg-[#2d2d2d] hover:text-white"}`}
          >
            <Lock className="w-5 h-5" />
            Admin Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-[56px] bg-white border-b border-[#e1e3e5] flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-semibold text-[#202223] flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Elham Shop Admin
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const nextVal = !isAudioEnabled;
                setIsAudioEnabled(nextVal);
                localStorage.setItem("elham_audio_alerts", nextVal ? "true" : "false");
                if (nextVal) {
                  playOrderSuccessSound();
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                isAudioEnabled 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100" 
                  : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 animate-pulse"
              }`}
              title={isAudioEnabled ? "এলার্ম সাউন্ড টেস্ট করুন" : "ভয়েস ও এলার্ম চালু করুন"}
            >
              {isAudioEnabled ? (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                  <span className="hidden sm:inline">🔊 ভয়েস এলার্ম (টেস্ট)</span>
                  <span className="sm:hidden">টেস্ট</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-amber-600" />
                  <span>🔇 ভয়েস এলার্ম অফ</span>
                </>
              )}
            </button>
            <button className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md">
              <Bell className="w-5 h-5" />
            </button>
            <button
              onClick={logoutAdmin}
              className="bg-[#2c6ecb] hover:bg-[#1f5199] text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer"
            >
              Exit Store
            </button>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-[1036px] mx-auto w-full flex-1">
          {/* Action Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <button
                className="bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] text-[#202223] px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm"
                onClick={() => setActiveTab("orders")}
              >
                View orders
              </button>
              <button
                onClick={() => {
                  setActiveTab("courier");
                  setSteadfastSubTab("balance");
                }}
                className="bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] text-[#202223] px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm"
              >
                Check balance
              </button>
            </div>
            {activeTab === "products" && (
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleExportCSV}
                  className="bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] text-[#202223] px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="সব প্রোডাক্ট CSV ফাইল হিসেবে ডাউনলোড করুন"
                >
                  <Download className="w-4 h-4 text-gray-500" /> Export CSV
                </button>

                <label
                  className="bg-white border border-[#c9cccf] hover:bg-[#f6f6f7] text-[#202223] px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="CSV ফাইল আপলোড করে প্রোডাক্ট ইম্পোর্ট করুন"
                >
                  <Upload className="w-4 h-4 text-gray-500" /> Import CSV
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleImportCSV}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => handleOpenModal()}
                  className="bg-[#008060] hover:bg-[#006e52] text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Product
                </button>
              </div>
            )}
          </div>

          {activeTab === "branding" ? (
            <div className="bg-white border border-[#e1e3e5] rounded-xl p-6 shadow-sm space-y-6 animate-fade-in">
              <div>
                <h3 className="text-lg font-bold text-[#202223] mb-1">স্টোর ব্রান্ডিং ও ডিজাইন ম্যানেজমেন্ট (Store Branding & Banners)</h3>
                <p className="text-xs text-[#6d7175]">আপনার শপের নাম, ব্রাউজার আইকন (Favicon), লোগো এবং হিরো ব্যানার পরিবর্তন করুন। Summer Cotton ও Premium Collection সহ বিভিন্ন প্রিিসেট ব্যানার বেছে নিতে পারেন।</p>
              </div>

              {/* Store Name & Favicon Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/70 p-4 rounded-lg border border-gray-200">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-800 block">শপ বা ওয়েবসাইটের নাম (Store Name)</label>
                  <input 
                    type="text" 
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Elham Shop - Premium Panjabi & Luxury Wear"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-black bg-white"
                  />
                  <span className="text-[10px] text-gray-500 block">ওয়েবসাইটের ট্যাব ও হেডারে এই নাম শো করবে।</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-800 block">ব্রাউজার আইকন / লোগো আইকন (Favicon / Icon)</label>
                    <img src={faviconInput} alt="Favicon" className="w-6 h-6 rounded-full object-cover border border-amber-500" referrerPolicy="no-referrer" />
                  </div>
                  <input 
                    type="text" 
                    value={faviconInput}
                    onChange={(e) => setFaviconInput(e.target.value)}
                    placeholder="Favicon Image URL..."
                    className="w-full border border-gray-300 rounded px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-black bg-white"
                  />
                  <span className="text-[10px] text-gray-500 block">আপনি চাইলে লাভ আইকন বা অন্য লোগো ইমেজ ইউআরএল এখানে বসাতে পারেন।</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Logo Settings */}
                <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white">
                  <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-amber-600" /> হেডার লোগো ইমেজ (Store Logo)
                  </h4>
                  <div className="flex items-center gap-4">
                    <img src={logoInput} alt="Preview" className="w-16 h-16 rounded-full object-cover border-2 border-amber-500 shadow-sm" referrerPolicy="no-referrer" />
                    <div className="flex-1 space-y-1">
                      <label className="text-xs text-gray-600 font-medium block">লোগো ইমেজ ইউআরএল</label>
                      <input 
                        type="text" 
                        value={logoInput}
                        onChange={(e) => setLogoInput(e.target.value)}
                        placeholder="Image URL..."
                        className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-black bg-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-gray-500 block">অথবা কম্পিউটার থেকে লোগো আপلود করুন:</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          compressImage(file).then(res => setLogoInput(res));
                        }
                      }}
                      className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-amber-500 file:text-neutral-950 hover:file:bg-amber-600 cursor-pointer"
                    />
                  </div>
                </div>

                {/* Banner Settings */}
                <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-white">
                  <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" /> হিরো ব্যানার ইমেজ (Hero Banner)
                  </h4>

                  {/* Preset Banners */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-gray-600 font-medium block">প্রিিসেট ব্যানার নির্বাচন করুন (Presets):</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setBannerInput('/src/assets/images/elham_hero_banner_1785398905544.jpg')}
                        className={`text-left text-[11px] p-2 rounded border transition-all ${bannerInput.includes('elham_hero') ? 'border-blue-600 bg-blue-50 font-bold text-blue-900' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                      >
                        ✨ মূল ব্যানার (Original)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerInput('https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=1200')}
                        className={`text-left text-[11px] p-2 rounded border transition-all ${bannerInput.includes('1602810318383') ? 'border-blue-600 bg-blue-50 font-bold text-blue-900' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                      >
                        🌿 Summer Cotton
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerInput('https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&q=80&w=1200')}
                        className={`text-left text-[11px] p-2 rounded border transition-all ${bannerInput.includes('1617137984095') ? 'border-blue-600 bg-blue-50 font-bold text-blue-900' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                      >
                        👑 Premium Collection
                      </button>
                      <button
                        type="button"
                        onClick={() => setBannerInput('https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1200')}
                        className={`text-left text-[11px] p-2 rounded border transition-all ${bannerInput.includes('1594938298603') ? 'border-blue-600 bg-blue-50 font-bold text-blue-900' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}
                      >
                        💎 Luxury Panjabi Wear
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="h-24 rounded overflow-hidden border border-gray-200">
                      <img src={bannerInput} alt="Banner Preview" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <label className="text-xs text-gray-600 font-medium block">বা কাস্টম ব্যানার ইমেজ ইউআরএল</label>
                    <input 
                      type="text" 
                      value={bannerInput}
                      onChange={(e) => setBannerInput(e.target.value)}
                      placeholder="Banner URL..."
                      className="w-full border border-gray-300 rounded px-3 py-1.5 text-xs outline-none focus:ring-1 focus:ring-black bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] text-gray-500 block">অথবা কম্পিউটার থেকে ব্যানার আপলোড করুন:</span>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          compressImage(file).then(res => setBannerInput(res));
                        }
                      }}
                      className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Links & Numbers Settings */}
              <div className="border border-gray-200 rounded-lg p-5 space-y-4 bg-gray-50/50">
                <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  📞 যোগাযোগ ও সোশ্যাল লিংক ম্যানেজমেন্ট (WhatsApp, Messenger, Call & SMS)
                </h4>
                <p className="text-xs text-gray-600">ফ্লোটিং উইজেট ও ফুটারের WhatsApp নম্বর, কল নম্বর এবং Messenger লিংক এখানে পরিবর্তন করুন।</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">হোয়াটসঅ্যাপ নম্বর (WhatsApp Number)</label>
                    <input 
                      type="text"
                      value={whatsappInput}
                      onChange={(e) => setWhatsappInput(e.target.value)}
                      placeholder="8801756994483"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-xs bg-white outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">কল / মোবাইল নম্বর (Call Phone Number)</label>
                    <input 
                      type="text"
                      value={phoneInput}
                      onChange={(e) => setPhoneInput(e.target.value)}
                      placeholder="01756994483"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-xs bg-white outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">ফেসবুক মেসেঞ্জার লিংক/ইউজারনেম (Messenger Link)</label>
                    <input 
                      type="text"
                      value={messengerInput}
                      onChange={(e) => setMessengerInput(e.target.value)}
                      placeholder="https://m.me/yourpage"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-xs bg-white outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">ফেসবুক পেজ ইউআরএল (Facebook Page URL)</label>
                    <input 
                      type="text"
                      value={fbPageInput}
                      onChange={(e) => setFbPageInput(e.target.value)}
                      placeholder="https://facebook.com/..."
                      className="w-full border border-gray-300 rounded px-3 py-2 text-xs bg-white outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery & Shipping Customization Settings */}
              <div className="border border-gray-200 rounded-lg p-5 space-y-4 bg-gray-50/50">
                <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  🚚 ডেলিভারি চার্জ ও ফ্রি ডেলিভারি সেটিংস (Delivery & Shipping Management)
                </h4>
                <p className="text-xs text-gray-600">
                  অর্ডার পেজে ডেলিভারি অপশনগুলো অন/অফ করতে পারবেন এবং প্রতিটির ডেলিভারি চার্জ, টাইটেল ও সাবটাইটেল নিজের মতো পরিবর্তন করতে পারবেন।
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {/* Inside Dhaka */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        📍 ঢাকার ভিতরে ডেলিভারি
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shippingInsideShowInput}
                          onChange={(e) => setShippingInsideShowInput(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="ml-2 text-[11px] font-medium text-gray-600">
                          {shippingInsideShowInput ? "চালু" : "বন্ধ"}
                        </span>
                      </label>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">অপশন টাইটেল</label>
                          <input
                            type="text"
                            value={shippingInsideTextInput}
                            onChange={(e) => setShippingInsideTextInput(e.target.value)}
                            disabled={!shippingInsideShowInput}
                            className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">চার্জ (৳)</label>
                          <input
                            type="number"
                            value={shippingInsideCostInput}
                            onChange={(e) => setShippingInsideCostInput(Number(e.target.value))}
                            disabled={!shippingInsideShowInput}
                            className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">অপশন বর্ণনা (সাবটাইটেল)</label>
                        <input
                          type="text"
                          value={shippingInsideDescInput}
                          onChange={(e) => setShippingInsideDescInput(e.target.value)}
                          disabled={!shippingInsideShowInput}
                          className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Outside Dhaka */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                      <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                        📍 ঢাকার বাইরে ডেলিভারি
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={shippingOutsideShowInput}
                          onChange={(e) => setShippingOutsideShowInput(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                        <span className="ml-2 text-[11px] font-medium text-gray-600">
                          {shippingOutsideShowInput ? "চালু" : "বন্ধ"}
                        </span>
                      </label>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2 space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">অপশন টাইটেল</label>
                          <input
                            type="text"
                            value={shippingOutsideTextInput}
                            onChange={(e) => setShippingOutsideTextInput(e.target.value)}
                            disabled={!shippingOutsideShowInput}
                            className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">চার্জ (৳)</label>
                          <input
                            type="number"
                            value={shippingOutsideCostInput}
                            onChange={(e) => setShippingOutsideCostInput(Number(e.target.value))}
                            disabled={!shippingOutsideShowInput}
                            className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">অপশন বর্ণনা (সাবটাইটেল)</label>
                        <input
                          type="text"
                          value={shippingOutsideDescInput}
                          onChange={(e) => setShippingOutsideDescInput(e.target.value)}
                          disabled={!shippingOutsideShowInput}
                          className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-1 focus:ring-black disabled:bg-gray-100 disabled:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Free Shipping Offer Customization */}
                <div className="bg-amber-50/60 border border-amber-200/60 rounded-lg p-4 space-y-3 shadow-sm mt-3">
                  <div className="flex items-center justify-between pb-2 border-b border-amber-100">
                    <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                      🎁 কোয়ান্টিটি ভিত্তিক অটো ফ্রি ডেলিভারি সেটিংস (Free Delivery Settings)
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={freeShippingEnabledInput}
                        onChange={(e) => setFreeShippingEnabledInput(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
                      <span className="ml-2 text-[11px] font-medium text-amber-800">
                        {freeShippingEnabledInput ? "চালু" : "বন্ধ"}
                      </span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 items-center">
                    <div className="text-xs text-amber-800 leading-relaxed font-light">
                      💡 গ্রাহক যদি একসাথে নির্দিষ্ট সংখ্যার পাঞ্জাবি বা প্রোডাক্ট অর্ডার করে, তবে ডেলিভারি চার্জ অটোমেটিক <strong>০ টাকা (ফ্রি)</strong> হয়ে যাবে।
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-amber-800 uppercase">কত পিস বা তার বেশি কিনলে ফ্রি ডেলিভারি পাবেন?</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={freeShippingThresholdInput}
                          onChange={(e) => setFreeShippingThresholdInput(Number(e.target.value))}
                          disabled={!freeShippingEnabledInput}
                          className="w-24 border border-amber-300 rounded px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-1 focus:ring-amber-500 disabled:bg-amber-100/50 disabled:text-amber-600/50"
                        />
                        <span className="text-xs text-amber-800 font-medium">পিস বা তার বেশি</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hero Banner Text & Badge Settings */}
              <div className="border border-gray-200 rounded-lg p-5 space-y-4 bg-gray-50/50">
                <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  ✨ হিরো ব্যানার টেক্সট ও ব্যাজ (Summer Cotton, Premium Collection, etc.)
                </h4>
                <p className="text-xs text-gray-600">হোমপেজের ব্যানার হেডিং, ব্যাজ (যেমন: Summer Cotton বা Premium Collection) এবং বিবরণ কাস্টমাইজ করুন।</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">হিরো টপ ব্যাজ (Hero Badge)</label>
                    <input 
                      type="text"
                      value={badgeInput}
                      onChange={(e) => setBadgeInput(e.target.value)}
                      placeholder="💎 Summer Cotton • Premium Collection"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-xs bg-white outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">মেইন টাইটেল লাইন ১ (Main Title Line 1)</label>
                    <input 
                      type="text"
                      value={title1Input}
                      onChange={(e) => setTitle1Input(e.target.value)}
                      placeholder="SUMMER COTTON"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-xs bg-white outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">মেইন টাইটেল লাইন ২ (Main Title Line 2 - Gold)</label>
                    <input 
                      type="text"
                      value={title2Input}
                      onChange={(e) => setTitle2Input(e.target.value)}
                      placeholder="PREMIUM COLLECTION"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-xs bg-white outline-none focus:ring-1 focus:ring-black"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-bold text-gray-700">হিরো সাবটাইটেল (Subtitle Description)</label>
                    <textarea 
                      rows={2}
                      value={subtitleInput}
                      onChange={(e) => setSubtitleInput(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-xs bg-white outline-none focus:ring-1 focus:ring-black resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Header, Footer & Button Customization Section */}
              <div className="border border-gray-200 rounded-lg p-5 space-y-6 bg-white shadow-xs">
                <div>
                  <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2 mb-1">
                    🎨 হেডার, ফুটার এবং প্রোডাক্ট বাটন কাস্টমাইজেশন (Colors, Text & Buttons)
                  </h4>
                  <p className="text-xs text-gray-500">আপনার শপের হেডার, ফুটার এবং প্রোডাক্টের ৩টি বাটন (Instant Order, Add to Cart, Details) অন/অফ করুন, টেক্সট পরিবর্তন করুন এবং পছন্দসই কালার কাস্টমাইজ করুন।</p>
                </div>

                {/* 1. Header Customization */}
                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 space-y-4">
                  <div className="font-semibold text-xs text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
                    ১. হেডার কাস্টমাইজেশন (Header Customization)
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 block">হেডার ব্যাকগ্রাউন্ড কালার (Background Color)</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={headerBgInput} 
                          onChange={(e) => setHeaderBgInput(e.target.value)}
                          className="w-8 h-8 rounded border border-gray-300 p-0 cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={headerBgInput} 
                          onChange={(e) => setHeaderBgInput(e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-gray-700 block">হেডার টেক্সট কালার (Text & Icons Color)</label>
                      <div className="flex gap-2">
                        <input 
                          type="color" 
                          value={headerTextInput} 
                          onChange={(e) => setHeaderTextInput(e.target.value)}
                          className="w-8 h-8 rounded border border-gray-300 p-0 cursor-pointer"
                        />
                        <input 
                          type="text" 
                          value={headerTextInput} 
                          onChange={(e) => setHeaderTextInput(e.target.value)}
                          className="flex-1 border border-gray-300 rounded px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                        <input
                          type="checkbox"
                          id="showCategoryFilterBarToggle"
                          checked={showCategoryFilterBarInput}
                          onChange={(e) => setShowCategoryFilterBarInput(e.target.checked)}
                          className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black"
                        />
                        <label htmlFor="showCategoryFilterBarToggle" className="text-[11px] font-bold text-gray-700 cursor-pointer">
                          হোমপেজে 'Filter:' বার দেখান (Show Category Filter Bar)
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Footer Customization */}
                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 space-y-4">
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <div className="font-semibold text-xs text-gray-900 uppercase tracking-wider">
                      ২. ফুটার কাস্টমাইজেশন (Footer Customization)
                    </div>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={footerShowInput} 
                        onChange={(e) => setFooterShowInput(e.target.checked)}
                        className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold text-gray-800">ফুটার চালু রাখুন (Show Footer)</span>
                    </label>
                  </div>

                  {footerShowInput && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 block">ফুটার ব্যাকগ্রাউন্ড কালার</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={footerBgInput} 
                              onChange={(e) => setFooterBgInput(e.target.value)}
                              className="w-8 h-8 rounded border border-gray-300 p-0 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={footerBgInput} 
                              onChange={(e) => setFooterBgInput(e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-2.5 py-1 text-xs bg-white outline-none focus:ring-1 focus:ring-black"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 block">ফুটার টেক্সট কালার</label>
                          <div className="flex gap-2">
                            <input 
                              type="color" 
                              value={footerTextColorInput} 
                              onChange={(e) => setFooterTextColorInput(e.target.value)}
                              className="w-8 h-8 rounded border border-gray-300 p-0 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={footerTextColorInput} 
                              onChange={(e) => setFooterTextColorInput(e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-2.5 py-1 text-xs bg-white outline-none focus:ring-1 focus:ring-black"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 block">ফুটার স্লোগান/টেক্সট (Footer Slogan Text)</label>
                          <input 
                            type="text" 
                            value={footerSloganInput} 
                            onChange={(e) => setFooterSloganInput(e.target.value)}
                            className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-gray-700 block">পেমেন্ট মেথডসমূহ (কমা দিয়ে লিখুন)</label>
                          <input 
                            type="text" 
                            value={footerPaymentsInput} 
                            onChange={(e) => setFooterPaymentsInput(e.target.value)}
                            placeholder="bKash, Nagad, Rocket, VISA, COD"
                            className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-1 focus:ring-black"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-gray-700 block">ফুটার ঠিকানা (Address)</label>
                        <input 
                          type="text" 
                          value={footerAddressInput} 
                          onChange={(e) => setFooterAddressInput(e.target.value)}
                          className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs bg-white outline-none focus:ring-1 focus:ring-black"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Products Buttons Customization */}
                <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 space-y-6">
                  <div className="font-semibold text-xs text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
                    ৩. প্রোডাক্ট বাটনসমূহ কাস্টমাইজেশন (Product Buttons Customization)
                  </div>

                  {/* A. Instant Order Button */}
                  <div className="space-y-3 bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="font-bold text-xs text-amber-900 bg-amber-50 px-2 py-0.5 rounded">ইনস্ট্যান্ট অর্ডার ⚡ বাটন</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={btnInstantOrderShowInput} 
                          onChange={(e) => setBtnInstantOrderShowInput(e.target.checked)}
                          className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-xs font-semibold text-gray-700">বাটনটি দেখান (Show Button)</span>
                      </label>
                    </div>

                    {btnInstantOrderShowInput && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-600 block">বাটন টেক্সট (Button Text)</label>
                          <input 
                            type="text" 
                            value={btnInstantOrderTextInput} 
                            onChange={(e) => setBtnInstantOrderTextInput(e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-black bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-600 block">ব্যাকগ্রাউন্ড কালার (Bg Color)</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="color" 
                              value={btnInstantOrderBgInput} 
                              onChange={(e) => setBtnInstantOrderBgInput(e.target.value)}
                              className="w-7 h-7 rounded border border-gray-300 p-0 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={btnInstantOrderBgInput} 
                              onChange={(e) => setBtnInstantOrderBgInput(e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-xs outline-none focus:ring-1 focus:ring-black bg-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-600 block">টেক্সট কালার (Text Color)</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="color" 
                              value={btnInstantOrderTextColorInput} 
                              onChange={(e) => setBtnInstantOrderTextColorInput(e.target.value)}
                              className="w-7 h-7 rounded border border-gray-300 p-0 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={btnInstantOrderTextColorInput} 
                              onChange={(e) => setBtnInstantOrderTextColorInput(e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-xs outline-none focus:ring-1 focus:ring-black bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* B. Add to Cart Button */}
                  <div className="space-y-3 bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="font-bold text-xs text-blue-900 bg-blue-50 px-2 py-0.5 rounded">Add to Cart বাটন</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={btnAddToCartShowInput} 
                          onChange={(e) => setBtnAddToCartShowInput(e.target.checked)}
                          className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-xs font-semibold text-gray-700">বাটনটি দেখান (Show Button)</span>
                      </label>
                    </div>

                    {btnAddToCartShowInput && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-600 block">বাটন টেক্সট (Button Text)</label>
                          <input 
                            type="text" 
                            value={btnAddToCartTextInput} 
                            onChange={(e) => setBtnAddToCartTextInput(e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-black bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-600 block">ব্যাকগ্রাউন্ড কালার (Bg Color)</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="color" 
                              value={btnAddToCartBgInput} 
                              onChange={(e) => setBtnAddToCartBgInput(e.target.value)}
                              className="w-7 h-7 rounded border border-gray-300 p-0 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={btnAddToCartBgInput} 
                              onChange={(e) => setBtnAddToCartBgInput(e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-xs outline-none focus:ring-1 focus:ring-black bg-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-600 block">টেক্সট কালার (Text Color)</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="color" 
                              value={btnAddToCartTextColorInput} 
                              onChange={(e) => setBtnAddToCartTextColorInput(e.target.value)}
                              className="w-7 h-7 rounded border border-gray-300 p-0 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={btnAddToCartTextColorInput} 
                              onChange={(e) => setBtnAddToCartTextColorInput(e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-xs outline-none focus:ring-1 focus:ring-black bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* C. Details Button */}
                  <div className="space-y-3 bg-white p-3 rounded-md border border-gray-200">
                    <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                      <span className="font-bold text-xs text-purple-900 bg-purple-50 px-2 py-0.5 rounded">Details বাটন</span>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={btnDetailsShowInput} 
                          onChange={(e) => setBtnDetailsShowInput(e.target.checked)}
                          className="rounded border-gray-300 text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-xs font-semibold text-gray-700">বাটনটি দেখান (Show Button)</span>
                      </label>
                    </div>

                    {btnDetailsShowInput && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-600 block">বাটন টেক্সট (Button Text)</label>
                          <input 
                            type="text" 
                            value={btnDetailsTextInput} 
                            onChange={(e) => setBtnDetailsTextInput(e.target.value)}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-black bg-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-600 block">ব্যাকগ্রাউন্ড কালার (Bg Color)</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="color" 
                              value={btnDetailsBgInput} 
                              onChange={(e) => setBtnDetailsBgInput(e.target.value)}
                              className="w-7 h-7 rounded border border-gray-300 p-0 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={btnDetailsBgInput} 
                              onChange={(e) => setBtnDetailsBgInput(e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-xs outline-none focus:ring-1 focus:ring-black bg-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-600 block">টেক্সট কালার (Text Color)</label>
                          <div className="flex gap-1.5">
                            <input 
                              type="color" 
                              value={btnDetailsTextColorInput} 
                              onChange={(e) => setBtnDetailsTextColorInput(e.target.value)}
                              className="w-7 h-7 rounded border border-gray-300 p-0 cursor-pointer"
                            />
                            <input 
                              type="text" 
                              value={btnDetailsTextColorInput} 
                              onChange={(e) => setBtnDetailsTextColorInput(e.target.value)}
                              className="flex-1 border border-gray-300 rounded px-2 py-0.5 text-xs outline-none focus:ring-1 focus:ring-black bg-white"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Categories Management Section */}
              <div className="border border-gray-200 rounded-lg p-5 space-y-4 bg-gray-50/50">
                <h4 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  📂 ক্যাটেগরি ম্যানেজমেন্ট (Categories: Summer Cotton, Premium Collection ইত্যাদি)
                </h4>
                <p className="text-xs text-gray-600">নতুন ক্যাটেগরি যুক্ত করুন বা অপ্রয়োজনীয় ক্যাটেগরি মুছে ফেলুন।</p>

                <div className="flex gap-2">
                  <input 
                    type="text"
                    value={newCatInput}
                    onChange={(e) => setNewCatInput(e.target.value)}
                    placeholder="যেমন: Summer Cotton বা Premium Collection"
                    className="flex-1 border border-gray-300 rounded px-3 py-2 text-xs bg-white outline-none focus:ring-1 focus:ring-black"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newCatInput.trim()) {
                        addCategory(newCatInput.trim());
                        setNewCatInput('');
                        setSuccessModal({
                          isOpen: true,
                          title: "ক্যাটেগরি যোগ হয়েছে",
                          description: "নতুন ক্যাটেগরি সফলভাবে যুক্ত করা হয়েছে।"
                        });
                      }
                    }}
                    className="bg-black text-white px-4 py-2 rounded text-xs font-bold hover:bg-neutral-800 cursor-pointer"
                  >
                    ক্যাটেগরি যোগ করুন
                  </button>
                </div>

                <div className="space-y-3 pt-2">
                  {categories.map((cat, idx) => {
                    const imgs = Array.isArray(categoryImages[cat]) ? categoryImages[cat] : [categoryImages[cat] || '', '', ''];
                    const primaryImg = imgs[0] || 'https://images.unsplash.com/photo-1583391733959-b0510f6992dd?auto=format&fit=crop&q=80&w=800';
                    return (
                      <div key={`${cat}-${idx}`} className="bg-white border border-gray-200 rounded-lg p-3 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span> {cat}
                          </span>
                          <button
                            type="button"
                            onClick={() => deleteCategory(cat)}
                            className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded"
                          >
                            ডিলিট
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[0, 1, 2].map(imgIdx => (
                            <div key={imgIdx} className="bg-gray-50 border border-gray-200 rounded p-2 space-y-2">
                              <div className="flex items-center justify-between text-[11px] font-semibold text-gray-700">
                                <span>ছবি {imgIdx + 1} {imgIdx === 0 ? '(প্রধান)' : ''}</span>
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-300 bg-white">
                                  <img src={imgs[imgIdx] || primaryImg} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                </div>
                              </div>
                              <input 
                                type="text"
                                value={imgs[imgIdx] || ''}
                                onChange={(e) => setCategoryImage(cat, imgIdx, e.target.value)}
                                placeholder={`ছবি ${imgIdx + 1} URL`}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-[11px] bg-white outline-none focus:ring-1 focus:ring-black"
                              />
                              <label className="block bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded px-2 py-1 text-[10px] font-semibold text-amber-900 cursor-pointer text-center">
                                📁 ছবি {imgIdx + 1} আপলোড
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      compressImage(file).then(res => setCategoryImage(cat, imgIdx, res));
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setLogoInput(storeLogo);
                    setBannerInput(storeBanner);
                    setNameInput(storeName);
                    setFaviconInput(storeFavicon);
                    setWhatsappInput(whatsappNumber);
                    setPhoneInput(phoneNumber);
                    setMessengerInput(messengerUrl);
                    setFbPageInput(facebookPageUrl);
                    setBadgeInput(heroBadge);
                    setTitle1Input(heroTitle1);
                    setTitle2Input(heroTitle2);
                    setSubtitleInput(heroSubtitle);

                    setHeaderBgInput(headerBgColor);
                    setHeaderTextInput(headerTextColor);
                    setShowCategoryFilterBarInput(showCategoryFilterBar);
                    setFooterShowInput(footerShow);
                    setFooterBgInput(footerBgColor);
                    setFooterTextColorInput(footerTextColor);
                    setFooterSloganInput(footerText);
                    setFooterAddressInput(footerAddress);
                    setFooterPaymentsInput(footerPayments);
                    setBtnInstantOrderShowInput(btnInstantOrderShow);
                    setBtnInstantOrderTextInput(btnInstantOrderText);
                    setBtnInstantOrderBgInput(btnInstantOrderBgColor);
                    setBtnInstantOrderTextColorInput(btnInstantOrderTextColor);
                    setBtnAddToCartShowInput(btnAddToCartShow);
                    setBtnAddToCartTextInput(btnAddToCartText);
                    setBtnAddToCartBgInput(btnAddToCartBgColor);
                    setBtnAddToCartTextColorInput(btnAddToCartTextColor);
                    setBtnDetailsShowInput(btnDetailsShow);
                    setBtnDetailsTextInput(btnDetailsText);
                    setBtnDetailsBgInput(btnDetailsBgColor);
                    setBtnDetailsTextColorInput(btnDetailsTextColor);

                    setShippingInsideCostInput(shippingInsideCost);
                    setShippingInsideTextInput(shippingInsideText);
                    setShippingInsideDescInput(shippingInsideDesc);
                    setShippingInsideShowInput(shippingInsideShow);

                    setShippingOutsideCostInput(shippingOutsideCost);
                    setShippingOutsideTextInput(shippingOutsideText);
                    setShippingOutsideDescInput(shippingOutsideDesc);
                    setShippingOutsideShowInput(shippingOutsideShow);

                    setFreeShippingEnabledInput(freeShippingEnabled);
                    setFreeShippingThresholdInput(freeShippingThreshold);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  রিসেট
                </button>
                <button
                  onClick={async () => {
                    setStoreLogo(logoInput);
                    setStoreBanner(bannerInput);
                    setStoreName(nameInput);
                    setStoreFavicon(faviconInput);
                    setWhatsappNumber(whatsappInput);
                    setPhoneNumber(phoneInput);
                    setMessengerUrl(messengerInput);
                    setFacebookPageUrl(fbPageInput);
                    setHeroBadge(badgeInput);
                    setHeroTitle1(title1Input);
                    setHeroTitle2(title2Input);
                    setHeroSubtitle(subtitleInput);

                    setHeaderBgColor(headerBgInput);
                    setHeaderTextColor(headerTextInput);
                    setShowCategoryFilterBar(showCategoryFilterBarInput);
                    setFooterShow(footerShowInput);
                    setFooterBgColor(footerBgInput);
                    setFooterTextColor(footerTextColorInput);
                    setFooterText(footerSloganInput);
                    setFooterAddress(footerAddressInput);
                    setFooterPayments(footerPaymentsInput);
                    setBtnInstantOrderShow(btnInstantOrderShowInput);
                    setBtnInstantOrderText(btnInstantOrderTextInput);
                    setBtnInstantOrderBgColor(btnInstantOrderBgInput);
                    setBtnInstantOrderTextColor(btnInstantOrderTextColorInput);
                    setBtnAddToCartShow(btnAddToCartShowInput);
                    setBtnAddToCartText(btnAddToCartTextInput);
                    setBtnAddToCartBgColor(btnAddToCartBgInput);
                    setBtnAddToCartTextColor(btnAddToCartTextColorInput);
                    setBtnDetailsShow(btnDetailsShowInput);
                    setBtnDetailsText(btnDetailsTextInput);
                    setBtnDetailsBgColor(btnDetailsBgInput);
                    setBtnDetailsTextColor(btnDetailsTextColorInput);

                    setShippingInsideCost(shippingInsideCostInput);
                    setShippingInsideText(shippingInsideTextInput);
                    setShippingInsideDesc(shippingInsideDescInput);
                    setShippingInsideShow(shippingInsideShowInput);

                    setShippingOutsideCost(shippingOutsideCostInput);
                    setShippingOutsideText(shippingOutsideTextInput);
                    setShippingOutsideDesc(shippingOutsideDescInput);
                    setShippingOutsideShow(shippingOutsideShowInput);

                    setFreeShippingEnabled(freeShippingEnabledInput);
                    setFreeShippingThreshold(freeShippingThresholdInput);

                    await saveStoreSettingsToCloud({
                      storeLogo: logoInput,
                      storeBanner: bannerInput,
                      storeName: nameInput,
                      storeFavicon: faviconInput,
                      whatsappNumber: whatsappInput,
                      phoneNumber: phoneInput,
                      messengerUrl: messengerInput,
                      facebookPageUrl: fbPageInput,
                      heroBadge: badgeInput,
                      heroTitle1: title1Input,
                      heroTitle2: title2Input,
                      heroSubtitle: subtitleInput,
                      headerBgColor: headerBgInput,
                      headerTextColor: headerTextInput,
                      showCategoryFilterBar: showCategoryFilterBarInput,
                      footerShow: footerShowInput,
                      footerBgColor: footerBgInput,
                      footerTextColor: footerTextColorInput,
                      footerText: footerSloganInput,
                      footerAddress: footerAddressInput,
                      footerPayments: footerPaymentsInput,
                      shippingInsideCost: shippingInsideCostInput,
                      shippingInsideText: shippingInsideTextInput,
                      shippingInsideDesc: shippingInsideDescInput,
                      shippingInsideShow: shippingInsideShowInput,
                      shippingOutsideCost: shippingOutsideCostInput,
                      shippingOutsideText: shippingOutsideTextInput,
                      shippingOutsideDesc: shippingOutsideDescInput,
                      shippingOutsideShow: shippingOutsideShowInput,
                      freeShippingEnabled: freeShippingEnabledInput,
                      freeShippingThreshold: freeShippingThresholdInput,
                      btnInstantOrderShow: btnInstantOrderShowInput,
                      btnInstantOrderText: btnInstantOrderTextInput,
                      btnInstantOrderBgColor: btnInstantOrderBgInput,
                      btnInstantOrderTextColor: btnInstantOrderTextColorInput,
                      btnAddToCartShow: btnAddToCartShowInput,
                      btnAddToCartText: btnAddToCartTextInput,
                      btnAddToCartBgColor: btnAddToCartBgInput,
                      btnAddToCartTextColor: btnAddToCartTextColorInput,
                      btnDetailsShow: btnDetailsShowInput,
                      btnDetailsText: btnDetailsTextInput,
                      btnDetailsBgColor: btnDetailsBgInput,
                      btnDetailsTextColor: btnDetailsTextColorInput,
                    });

                    setSuccessModal({
                      isOpen: true,
                      title: "ব্রান্ডিং, যোগাযোগ ও ডিজাইন আপডেট সফল হয়েছে",
                      description: "আপনার শপের নাম, লোগো, ব্যানার, ব্রাউজার আইকন, হেডার/ফুটার, বাটন ডিজাইন ও ডেলিভারি সেটিংস সফলভাবে সংরক্ষণ করা হয়েছে!"
                    });
                  }}
                  className="px-5 py-2 bg-[#008060] hover:bg-[#006e52] text-white rounded-md text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  সেভ ও আপডেট করুন
                </button>
              </div>
            </div>
          ) : activeTab === "home" ? (
            <div className="space-y-6 animate-fade-in">
              {/* Modern Greeting Hero Banner */}
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white p-6 md:p-8 shadow-md">
                <div className="relative z-10 max-w-lg">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#95bf47] mb-1 block">
                    {storeName.split(' - ')[0].toUpperCase()} CONTROL PANEL
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold font-serif leading-tight">
                    শুভ দিন, এডমিন!
                  </h2>
                  <p className="text-neutral-300 text-xs mt-2 leading-relaxed">
                    আপনার আজকের বেচাবিক্রি, কুরিয়ার স্টেটমেন্ট এবং কুপন কোডগুলো একনজরে ম্যানেজ করুন। গ্রাহকদের সুন্দর ও নিখুঁত সেবা প্রদান নিশ্চিত করতে পাশে আছে {storeName.split(' - ')[0]}.
                  </p>
                  <div className="flex flex-wrap gap-3 mt-4">
                    <button 
                      onClick={() => setActiveTab("products")}
                      className="bg-[#95bf47] hover:bg-[#83aa3d] text-black font-semibold text-xs px-4 py-2 rounded transition-colors shadow-sm"
                    >
                      পণ্য যোগ করুন
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab("courier");
                        setSteadfastSubTab("balance");
                      }}
                      className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 font-semibold text-xs px-4 py-2 rounded transition-colors"
                    >
                      কুরিয়ার ব্যালেন্স
                    </button>
                  </div>
                </div>
                {/* Abstract background graphics */}
                <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-10 pointer-events-none hidden md:block">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                    <path d="M0,100 C30,40 70,60 100,0 L100,100 Z" />
                  </svg>
                </div>
              </div>

              {/* Home Stats Summary Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#e1e3e5] rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[#6d7175] text-xs font-bold uppercase tracking-wider block mb-1">
                      মোট বিক্রি (Sales)
                    </span>
                    <span className="text-2xl font-extrabold text-[#202223]">
                      ৳ {totalSalesVal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-green-600 font-semibold bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                      +12.4% this week
                    </span>
                    <span className="text-gray-400">All-time record</span>
                  </div>
                </div>

                <div className="bg-white border border-[#e1e3e5] rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[#6d7175] text-xs font-bold uppercase tracking-wider block mb-1">
                      অপেক্ষমাণ অর্ডার (Pending)
                    </span>
                    <span className="text-2xl font-extrabold text-[#e28743]">
                      {orders.filter(o => o.status === 'pending').length} টি
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <button 
                      onClick={() => setActiveTab("orders")}
                      className="text-[#005bd3] hover:underline font-bold"
                    >
                      অর্ডারগুলো দেখুন →
                    </button>
                    <span className="text-[#e28743] font-semibold">প্রক্রিয়াধীন</span>
                  </div>
                </div>

                <div className="bg-white border border-[#e1e3e5] rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[#6d7175] text-xs font-bold uppercase tracking-wider block mb-1">
                      কুরিয়ার ব্যালেন্স (SteadFast)
                    </span>
                    {(!courierApiKey || courierApiKey.trim() === '' || courierApiKey.trim() === 'SF_LIVE_API_KEY_7739') ? (
                      <div>
                        <span className="text-xl font-extrabold text-[#e28743]">
                          ৳ {steadfastBalance.toLocaleString("en-IN")}
                        </span>
                        <p className="text-[9px] text-[#e28743] font-medium leading-tight mt-1">⚠️ Setup Required (Not Configured)</p>
                      </div>
                    ) : (
                      <span className="text-2xl font-extrabold text-[#1e8556]">
                        ৳ {steadfastBalance.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    {(!courierApiKey || courierApiKey.trim() === '' || courierApiKey.trim() === 'SF_LIVE_API_KEY_7739') ? (
                      <button
                        onClick={() => {
                          setActiveTab("courier");
                          setSteadfastSubTab("settings");
                        }}
                        className="text-[#005bd3] font-bold hover:underline"
                      >
                        কনফিগার করুন
                      </button>
                    ) : (
                      <span className="text-[#1e8556] font-semibold bg-green-50 border border-green-200 px-1.5 py-0.5 rounded">
                        Available
                      </span>
                    )}
                    <button 
                      onClick={() => {
                        setActiveTab("courier");
                        setSteadfastSubTab("balance");
                      }}
                      className="text-gray-500 hover:text-black hover:underline"
                    >
                      তুলে নিন
                    </button>
                  </div>
                </div>

                <div className="bg-white border border-[#e1e3e5] rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="text-[#6d7175] text-xs font-bold uppercase tracking-wider block mb-1">
                      মোট প্রোডাক্ট (Products)
                    </span>
                    <span className="text-2xl font-extrabold text-[#202223]">
                      {products.length} টি
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-[11px]">
                    <span className="text-gray-500">{categories.length} টি ক্যাটাগরি</span>
                    <button 
                      onClick={() => setActiveTab("products")}
                      className="text-[#005bd3] hover:underline font-bold"
                    >
                      ম্যানেজ করুন
                    </button>
                  </div>
                </div>
              </div>

              {/* Mid section: Monthly target and Quick actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Sales Target Meter */}
                <div className="bg-white border border-[#e1e3e5] rounded-xl p-5 shadow-sm lg:col-span-2 flex flex-col justify-between space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-bold text-gray-800">চলতি মাসের বিক্রয় লক্ষ্যমাত্রা</h4>
                      <p className="text-xs text-gray-500">৳১,০০,০০০ বিক্রির মাসিক লক্ষ্য</p>
                    </div>
                    <span className="text-xs font-extrabold text-[#1e8556] bg-green-50 border border-green-100 px-2 py-0.5 rounded-full">
                      {Math.min(100, Math.round((totalSalesVal / 100000) * 100))}% অর্জিত
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-600 font-medium">
                      <span>৳০</span>
                      <span className="font-bold text-[#1e8556]">৳ {totalSalesVal.toLocaleString("en-IN")}</span>
                      <span>৳ ১,০০,০০০</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(100, (totalSalesVal / 100000) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600 leading-relaxed border border-gray-100">
                    💡 <strong>টিপস:</strong> আপনি লক্ষ্যমাত্রার কাছাকাছি আছেন! ফেসবুক পিক্সেল এবং ডিসকাউন্ট কুপনগুলো সচল রেখে প্রচার চালিয়ে যান।
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="bg-white border border-[#e1e3e5] rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <h4 className="text-sm font-bold text-gray-800 mb-3">কুইক অ্যাকশনস (Quick Actions)</h4>
                  <div className="grid grid-cols-2 gap-2.5 flex-1">
                    <button 
                      onClick={() => handleOpenModal()}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-neutral-900 hover:text-white transition-all group text-center"
                    >
                      <Plus className="w-5 h-5 text-gray-500 group-hover:text-[#95bf47] mb-1" />
                      <span className="text-[11px] font-semibold">নতুন প্রোডাক্ট</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab("discounts")}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-neutral-900 hover:text-white transition-all group text-center"
                    >
                      <Tag className="w-5 h-5 text-gray-500 group-hover:text-amber-500 mb-1" />
                      <span className="text-[11px] font-semibold">কুপন কোড</span>
                    </button>
                    <button 
                      onClick={() => {
                        setActiveTab("courier");
                        setSteadfastSubTab("settings");
                      }}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-neutral-900 hover:text-white transition-all group text-center"
                    >
                      <Settings className="w-5 h-5 text-gray-500 group-hover:text-blue-500 mb-1" />
                      <span className="text-[11px] font-semibold">কুরিয়ার সেটআপ</span>
                    </button>
                    <button 
                      onClick={() => {
                        window.open("/", "_blank");
                      }}
                      className="flex flex-col items-center justify-center p-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-neutral-950 hover:text-white transition-all group text-center"
                    >
                      <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-purple-500 mb-1" />
                      <span className="text-[11px] font-semibold">লাইভ স্টোর</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom activity list and store notes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Recent Activities */}
                <div className="bg-white border border-[#e1e3e5] rounded-xl p-5 shadow-sm md:col-span-2">
                  <h4 className="text-sm font-bold text-gray-800 mb-4">রিসেন্ট অ্যাক্টিভিটি ফিড</h4>
                  <div className="space-y-4">
                    <ActivityRow icon={ShoppingCart} color="text-green-500 bg-green-50" text="নতুন একটি অর্ডার পাওয়া গেছে" time="এইমাত্র" />
                    <ActivityRow icon={Tag} color="text-amber-500 bg-amber-50" text="নতুন ডিসকাউন্ট কুপন সচল করা হয়েছে" time="৩ ঘণ্টা আগে" />
                    <ActivityRow icon={Package} color="text-blue-500 bg-blue-50" text="সেমসেং পাঞ্জাবি স্টকে রিফিল করা হয়েছে" time="৫ ঘণ্টা আগে" />
                    <ActivityRow icon={Check} color="text-emerald-500 bg-emerald-50" text="৩টি পার্সেল SteadFast কুরিয়ারে পাঠানো হয়েছে" time="১ দিন আগে" />
                  </div>
                </div>

                {/* Important Notice Board */}
                <div className="bg-white border border-[#e1e3e5] rounded-xl p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-gray-800 mb-2">জরুরি নোটিশ বোর্ড</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      SteadFast কুরিয়ারের পেমেন্ট রিকোয়েস্ট ১২-২৪ ঘণ্টার মধ্যে ব্যাংক অ্যাকাউন্টে জমা হয়। কোনো অর্ডার বা ট্র্যাকিং নিয়ে জটিলতা দেখা দিলে কুরিয়ার সেটিংস পুনরায় যাচাই করুন।
                    </p>
                  </div>
                  <div className="border-t border-gray-100 pt-3 mt-4 text-[11px] text-gray-400">
                    সর্বশেষ আপডেট: আজ সকাল ১০:০০ টা
                  </div>
                </div>
              </div>
            </div>
          ) : activeTab === "orders" ? (
            <>
              {/* Top Action Buttons */}
              <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setActiveTab("orders")}
                    className="bg-white border border-[#e1e3e5] text-[#202223] text-xs font-semibold px-3.5 py-1.5 rounded-md shadow-2xs hover:bg-gray-50 cursor-pointer"
                  >
                    View orders
                  </button>
                  <button 
                    onClick={async () => {
                      if (checkBalance) {
                        const res = await checkBalance();
                        if (res.success) {
                          setSuccessModal({
                            isOpen: true,
                            title: "Steadfast Courier Balance",
                            description: `আপনার কারেন্ট কুরিয়ার ব্যালেন্স: ৳ ${(res.balance ?? 0).toLocaleString('en-BD')}`
                          });
                        } else {
                          setSuccessModal({
                            isOpen: true,
                            title: "ব্যালেন্স চেক করতে সমস্যা",
                            description: res.message || "কুরিয়ার ব্যালেন্স চেক করা যায়নি।"
                          });
                        }
                      }
                    }}
                    className="bg-white border border-[#e1e3e5] text-[#202223] text-xs font-semibold px-3.5 py-1.5 rounded-md shadow-2xs hover:bg-gray-50 cursor-pointer"
                  >
                    Check balance
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCreateTestDemoOrder}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-md shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                    title="টেস্ট করার জন্য একটি নতুন নমুনা অর্ডার তৈরি করুন"
                  >
                    🧪 + ডেমো টেস্ট অর্ডার
                  </button>
                  {orders.length > 0 && (
                    <button
                      onClick={exportSteadfastCSV}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-md shadow-2xs transition-all flex items-center gap-1 cursor-pointer"
                      title="Steadfast Merchant Portal এর জন্য Bulk CSV ডাউনলোড করুন"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Bulk CSV
                    </button>
                  )}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border border-[#e1e3e5] rounded-lg p-4 shadow-sm flex flex-col">
                  <span className="text-[#6d7175] text-sm font-medium flex items-center gap-1">
                    Total orders
                  </span>
                  <span className="text-2xl font-semibold text-[#202223] mt-2 mb-3">
                    {orders.length}
                  </span>
                  <span className="bg-[#e4e5e7] text-[#454f5b] text-xs font-medium px-2 py-0.5 rounded w-fit">
                    All time
                  </span>
                </div>
                <div className="bg-white border border-[#e1e3e5] rounded-lg p-4 shadow-sm flex flex-col">
                  <span className="text-[#6d7175] text-sm font-medium flex items-center gap-1">
                    Pending
                  </span>
                  <span className="text-2xl font-semibold text-[#202223] mt-2 mb-3">
                    {orders.filter((o) => o.status === "pending").length}
                  </span>
                  <span className="bg-[#ffea8a] text-[#8a6116] text-xs font-medium px-2 py-0.5 rounded w-fit">
                    Processing
                  </span>
                </div>
                <div className="bg-white border border-[#e1e3e5] rounded-lg p-4 shadow-sm flex flex-col">
                  <span className="text-[#6d7175] text-sm font-medium flex items-center gap-1">
                    Delivered
                  </span>
                  <span className="text-2xl font-semibold text-[#202223] mt-2 mb-3">
                    {orders.filter((o) => o.status === "delivered").length}
                  </span>
                  <span className="bg-[#aee9d1] text-[#007f5f] text-xs font-medium px-2 py-0.5 rounded w-fit">
                    Completed
                  </span>
                </div>
                <div className="bg-white border border-[#e1e3e5] rounded-lg p-4 shadow-sm flex flex-col">
                  <span className="text-[#6d7175] text-sm font-medium flex items-center gap-1">
                    Cancelled
                  </span>
                  <span className="text-2xl font-semibold text-[#202223] mt-2 mb-3">
                    {orders.filter((o) => o.status === "cancelled").length}
                  </span>
                  <span className="bg-[#ffc9c9] text-[#c0392b] text-xs font-medium px-2 py-0.5 rounded w-fit">
                    Cancelled
                  </span>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="bg-white border border-[#e1e3e5] rounded-lg shadow-2xs overflow-hidden">
                <div className="px-5 py-3.5 border-b border-[#e1e3e5] bg-white flex justify-between items-center">
                  <h3 className="text-[#202223] font-semibold text-base">
                    Recent orders
                  </h3>
                  <span className="text-xs text-[#6d7175] font-medium">
                    Total: {orders.length}
                  </span>
                </div>
                {orders.length === 0 ? (
                  <div className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-[#f4f6f8] rounded-full flex items-center justify-center mb-4">
                      <Package className="w-8 h-8 text-[#8c9196]" />
                    </div>
                    <h4 className="text-[#202223] font-medium mb-1">
                      এখনো কোনো কাস্টমার অর্ডার আসেনি
                    </h4>
                    <p className="text-[#6d7175] text-sm max-w-[340px] mb-4">
                      আপনার ওয়েবসাইট থেকে কাস্টমাররা অর্ডার করলে তা এখানে রিয়েলটাইমে আপডেট হবে। পরীক্ষা করতে নিচের বাটনে ক্লিক করুন।
                    </p>
                    <button
                      onClick={handleCreateTestDemoOrder}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-md shadow-2xs transition-all cursor-pointer flex items-center gap-2"
                    >
                      🧪 স্যাম্পল ডেমো অর্ডার তৈরি করুন
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#202223]">
                      <thead className="border-b border-[#e1e3e5] bg-[#f9fafb] text-[#6d7175]">
                        <tr>
                          <th className="px-4 py-3 font-semibold text-xs">Order</th>
                          <th className="px-4 py-3 font-semibold text-xs">Date</th>
                          <th className="px-4 py-3 font-semibold text-xs">Customer</th>
                          <th className="px-4 py-3 font-semibold text-xs">Total</th>
                          <th className="px-4 py-3 font-semibold text-xs">Payment</th>
                          <th className="px-4 py-3 font-semibold text-xs">Status</th>
                          <th className="px-4 py-3 font-semibold text-xs text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e1e3e5]">
                        {orders.map((order) => {
                          const phoneClean = order.customer?.phone ? order.customer.phone.replace(/\D/g, '') : '';
                          const customerOrdersList = orders.filter(
                            (o) => o.customer?.phone && o.customer.phone.replace(/\D/g, '') === phoneClean,
                          );
                          const customerOrders = customerOrdersList.length;
                          const deliveredCount = customerOrdersList.filter(o => o.status === 'delivered').length;
                          const cancelledCount = customerOrdersList.filter(o => o.status === 'cancelled').length;
                          const isSendingThisOrder = sendingCourierOrderId === order.id;

                          return (
                            <tr
                              key={order.id}
                              className="hover:bg-[#f8f9fa] transition-colors"
                            >
                              {/* Order ID Link */}
                              <td className="px-4 py-3.5 align-top font-medium">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrderForDetails(order)}
                                  className="text-[#005bd3] font-bold hover:underline cursor-pointer text-xs text-left"
                                >
                                  {order.id}
                                </button>
                              </td>

                              {/* Date */}
                              <td className="px-4 py-3.5 align-top text-[#202223] whitespace-nowrap">
                                {new Date(order.date || Date.now()).toLocaleDateString('en-US')}
                              </td>

                              {/* Customer */}
                              <td className="px-4 py-3.5 align-top max-w-[200px]">
                                <div className="font-bold text-[#202223] text-xs">
                                  {order.customer?.name || 'Customer'}
                                </div>
                                <div className="text-[11px] text-[#6d7175] font-medium mt-0.5 font-mono">
                                  {order.customer?.phone || 'N/A'}
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  <span className="bg-[#d1f4e0] text-[#007f5f] text-[9px] font-bold px-1 py-0.5 rounded">
                                    ডেলিভারি: {deliveredCount}
                                  </span>
                                  <span className="bg-[#ffea8a] text-[#8a6116] text-[9px] font-bold px-1 py-0.5 rounded">
                                    বাতিল: {cancelledCount}
                                  </span>
                                  {customerOrders > 1 ? (
                                    <span className="bg-[#e4e5e7] text-[#454f5b] text-[9px] font-bold px-1 py-0.5 rounded">
                                      মোট: {customerOrders}
                                    </span>
                                  ) : (
                                    <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1 py-0.5 rounded border border-blue-200">
                                      নতুন
                                    </span>
                                  )}
                                </div>
                                <CourierSuccessRate phone={order.customer?.phone || ''} />
                              </td>

                              {/* Total */}
                              <td className="px-4 py-3.5 align-top font-normal text-[#202223] whitespace-nowrap">
                                ৳ {order.total.toLocaleString("en-BD")}
                              </td>

                              {/* Payment */}
                              <td className="px-4 py-3.5 align-top text-[#202223] whitespace-nowrap font-normal">
                                {order.paymentMethod || 'COD'}
                              </td>

                              {/* Status Dropdown Pill */}
                              <td className="px-4 py-3.5 align-top">
                                <select
                                  value={order.status}
                                  onChange={(e) =>
                                    updateOrderStatus(
                                      order.id,
                                      e.target.value as any,
                                    )
                                  }
                                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 outline-none cursor-pointer appearance-none ${
                                    order.status === "pending"
                                      ? "bg-[#ffea8a] text-[#8a6116]"
                                      : order.status === "shipped"
                                        ? "bg-[#d1f4e0] text-[#007f5f]"
                                        : order.status === "delivered"
                                          ? "bg-[#aee9d1] text-[#007f5f]"
                                          : "bg-[#ffc9c9] text-[#c0392b]"
                                  }`}
                                >
                                  <option value="pending">Pending ˅</option>
                                  <option value="shipped">Shipped ˅</option>
                                  <option value="delivered">Delivered ˅</option>
                                  <option value="cancelled">Cancelled ˅</option>
                                </select>
                              </td>

                              {/* Actions */}
                              <td className="px-4 py-3.5 align-top text-right">
                                <div className="flex flex-col gap-1.5 items-end">
                                  {/* Top Row: Block User | Delete Order */}
                                  <div className="flex items-center gap-1 text-xs">
                                    {isPhoneBlocked(order.customer?.phone || '') ? (
                                      <button
                                        onClick={() => {
                                          unblockPhone(order.customer?.phone || '');
                                          setSuccessModal({
                                            isOpen: true,
                                            title: "আনব্লক করা হয়েছে",
                                            description: `ফোন নম্বর ${order.customer?.phone} সফলভাবে আনব্লক করা হয়েছে।`
                                          });
                                        }}
                                        className="text-[#007f5f] hover:underline cursor-pointer font-medium"
                                      >
                                        Unblock
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => {
                                          if (!order.customer?.phone) return;
                                          setConfirmModal({
                                            isOpen: true,
                                            title: "ব্যবহারকারী ব্লক করুন",
                                            description: `আপনি কি নিশ্চিত যে আপনি ${order.customer.phone} নম্বরটি ব্লক করতে চান?`,
                                            onConfirm: () => {
                                              blockPhone(order.customer.phone);
                                              setSuccessModal({
                                                isOpen: true,
                                                title: "ব্যবহারকারী ব্লক করা হয়েছে",
                                                description: `ফোন নম্বর ${order.customer.phone} সফলভাবে ব্লক করা হয়েছে।`
                                              });
                                            }
                                          });
                                        }}
                                        className="text-[#c0392b] hover:underline cursor-pointer font-medium"
                                      >
                                        Block User
                                      </button>
                                    )}
                                    <span className="text-[#8c9196]">|</span>
                                    <button
                                      onClick={() => {
                                        setConfirmModal({
                                          isOpen: true,
                                          title: "অর্ডার ডিলিট নিশ্চিত করুন",
                                          description: `আপনি কি নিশ্চিত যে আপনি অর্ডার ${order.id} ডিলিট করতে চান?`,
                                          onConfirm: () => {
                                            deleteOrder(order.id);
                                            setSuccessModal({
                                              isOpen: true,
                                              title: "অর্ডার ডিলিট হয়েছে",
                                              description: `অর্ডার ${order.id} সফলভাবে ডিলিট করা হয়েছে।`
                                            });
                                          }
                                        });
                                      }}
                                      className="text-[#c0392b] hover:underline cursor-pointer font-medium"
                                    >
                                      Delete Order
                                    </button>
                                  </div>

                                  {/* Bottom Row: Send to Meta & Courier status */}
                                  <div className="flex items-center gap-2 mt-1">
                                    {/* Send to Meta button */}
                                    {order.metaSynced ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] text-[#005bd3] font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                        ✓ Meta Sent
                                      </span>
                                    ) : (
                                      <button
                                        onClick={() => handleSendToMeta(order)}
                                        className="text-xs font-semibold text-white bg-[#0066ff] hover:bg-blue-700 px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                                      >
                                        Send to Meta ⚡
                                      </button>
                                    )}

                                    {/* Courier Status / Send to Steadfast */}
                                    {consignmentMap[order.id] ? (
                                      <div className="flex flex-col items-end">
                                        <span className="inline-flex items-center gap-1 text-[11px] text-[#8a6116] font-bold bg-[#ffea8a] px-2 py-0.5 rounded-full border-0">
                                          <span className="w-1.5 h-1.5 bg-[#8a6116] rounded-full"></span>
                                          In Review
                                        </span>
                                        <span className="text-[10px] text-[#6d7175] mt-0.5 font-mono">
                                          ID: {consignmentMap[order.id]}
                                        </span>
                                      </div>
                                    ) : (
                                      <button
                                        disabled={isSendingThisOrder}
                                        onClick={() => handleSendOrderToCourierAsync(order.id)}
                                        className="text-xs font-semibold text-white bg-[#1e8556] hover:bg-[#155e3c] px-2.5 py-1 rounded-md transition-colors cursor-pointer shadow-2xs disabled:opacity-50 flex items-center gap-1"
                                      >
                                        {isSendingThisOrder ? (
                                          <>
                                            <span className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            পাঠানো হচ্ছে...
                                          </>
                                        ) : (
                                          'Send to SteadFast'
                                        )}
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : activeTab === "customers" ? (
            <div className="space-y-6 max-w-4xl">
              {/* Daily Limit Settings */}
              <div className="bg-white shadow-sm border border-[#e1e3e5] rounded-lg p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[#202223] font-bold text-sm mb-1">
                      দৈনিক অর্ডার লিমিট (Daily Order Limit System)
                    </h3>
                    <p className="text-xs text-[#6d7175] leading-relaxed">
                      যখন এই সিস্টেমটি চালু থাকবে, তখন একজন কাস্টমার প্রতিদিন একটির বেশি অর্ডার করতে পারবেন না (একই মোবাইল নম্বর দিয়ে)। আপনি যদি কোনো কাস্টমারকে আনলিমিটেড অর্ডারের অনুমতি দিতে চান, তবে তাকে নিচের হোয়াইটলিস্ট তালিকায় যুক্ত করতে পারেন।
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none mt-1">
                    <input
                      type="checkbox"
                      checked={enableDailyLimit}
                      onChange={(e) => {
                        setEnableDailyLimit(e.target.checked);
                        setSuccessModal({
                          isOpen: true,
                          title: "সিস্টেম আপডেট সফল",
                          description: e.target.checked 
                            ? "প্রতিদিন ১টি মোবাইল থেকে ১টির বেশি অর্ডার ব্লক করার সিস্টেম সফলভাবে চালু করা হয়েছে।"
                            : "দৈনিক অর্ডারের সীমাবদ্ধতা নিষ্ক্রিয় করা হয়েছে। এখন যে কেউ যতখুশি অর্ডার করতে পারবেন।"
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1e8556]"></div>
                  </label>
                </div>
              </div>

              {/* Whitelisted Numbers Card */}
              <div className="bg-white shadow-sm border border-[#e1e3e5] rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e1e3e5] bg-[#f9fafb] flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-[#202223] font-semibold text-sm">
                      হোয়াইটলিস্ট কাস্টমার (Whitelisted Customers)
                    </h3>
                    <p className="text-[11px] text-[#6d7175] mt-0.5">
                      নিচের মোবাইল নম্বরগুলোর কাস্টমাররা লিমিটের ঊর্ধ্বে যতখুশি অর্ডার করতে পারবেন।
                    </p>
                  </div>
                  
                  {/* Add Whitelist Form */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="যেমন: 017XXXXXXXX"
                      value={whitelistInput}
                      onChange={(e) => setWhitelistInput(e.target.value)}
                      className="border border-[#c9cccf] rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none font-medium w-48"
                    />
                    <button
                      onClick={() => {
                        const clean = whitelistInput.trim();
                        if (!clean || clean.length < 11) {
                          setSuccessModal({
                            isOpen: true,
                            title: "ভুল মোবাইল নম্বর",
                            description: "দয়া করে একটি সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন।"
                          });
                          return;
                        }
                        whitelistPhone(clean);
                        setWhitelistInput("");
                        setSuccessModal({
                          isOpen: true,
                          title: "হোয়াইটলিস্টে যুক্ত হয়েছে",
                          description: `নম্বর ${clean} সফলভাবে হোয়াইটলিস্ট তালিকায় যুক্ত করা হয়েছে। এই নম্বর থেকে এখন যতখুশি অর্ডার করা যাবে।`
                        });
                      }}
                      className="bg-[#202223] text-white hover:bg-black font-semibold text-xs px-3 py-1.5 rounded transition-all cursor-pointer"
                    >
                      যুক্ত করুন
                    </button>
                  </div>
                </div>

                {/* Helpful Instruction Box for Customers and Admin */}
                <div className="bg-emerald-50/70 border-b border-emerald-100/50 px-5 py-3 text-xs text-emerald-800 leading-relaxed flex items-start gap-2.5">
                  <span className="text-sm mt-0.5 flex-shrink-0">💡</span>
                  <div>
                    <span className="font-bold text-emerald-900">কাস্টমাররা কীভাবে যোগাযোগ করবেন ও আনলিমিটেড অর্ডারের অনুমতি পাবেন?</span>
                    <p className="mt-1 text-emerald-950 font-medium">
                      যদি কোনো কাস্টমার ১ বারের বেশি অর্ডার করতে চান, তবে তাকে হোয়াইটলিস্ট করতে হবে। কাস্টমাররা যখন চেকআউটে দৈনিক লিমিটের কারণে আটকে যাবেন, তখন তাদের স্ক্রিনে সরাসরি <span className="underline decoration-emerald-400 font-bold">হোয়াটসঅ্যাপ (01756994483)</span> এবং <span className="underline decoration-emerald-400 font-bold">ফেসবুক পেজ মেসেঞ্জার</span> বাটন দেখাবে। সেখানে ক্লিক করে কাস্টমার আপনাকে অনুরোধ জানালে, তার মোবাইল নম্বরটি উপরে ইনপুট দিয়ে <span className="font-bold text-[#202223]">"যুক্ত করুন"</span> বাটনে চাপুন। এতে তারা আনলিমিটেড অর্ডারের অনুমতি পাবেন।
                    </p>
                  </div>
                </div>

                {whitelistedPhones.length === 0 ? (
                  <div className="p-8 text-center text-[#6d7175] text-xs leading-relaxed">
                    কোনো নম্বর হোয়াইটলিস্টে যুক্ত করা হয়নি।
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#202223]">
                      <thead className="border-b border-[#e1e3e5] bg-white text-[#6d7175]">
                        <tr>
                          <th className="px-5 py-3 font-medium">মোবাইল নম্বর</th>
                          <th className="px-5 py-3 font-medium text-right">পদক্ষেপ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e1e3e5]">
                        {whitelistedPhones.map((phone) => (
                          <tr key={phone} className="hover:bg-[#f6f6f7]">
                            <td className="px-5 py-3 font-medium text-green-700">
                              {phone}
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button
                                onClick={() => {
                                  unwhitelistPhone(phone);
                                  setSuccessModal({
                                    isOpen: true,
                                    title: "হোয়াইটলিস্ট থেকে বাদ দেওয়া হয়েছে",
                                    description: `নম্বর ${phone} সফলভাবে হোয়াইটলিস্ট থেকে মুছে ফেলা হয়েছে।`
                                  });
                                }}
                                className="text-xs text-red-600 hover:underline font-semibold cursor-pointer"
                              >
                                মুছুন
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Blocked Customers Card */}
              <div className="bg-white shadow-sm border border-[#e1e3e5] rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e1e3e5] bg-[#f9fafb]">
                  <h3 className="text-[#202223] font-semibold text-sm">
                    ব্লকড কাস্টমার (Blocked Customers)
                  </h3>
                  <p className="text-[11px] text-[#6d7175] mt-0.5">
                    ব্লকড লিস্টের কাস্টমাররা কোনো অর্ডার প্লেস করতে পারবেন না।
                  </p>
                </div>
                {blockedPhones.length === 0 ? (
                  <div className="p-8 text-center text-[#6d7175] text-xs">
                    কোনো কাস্টমার ব্লক করা নেই।
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#202223]">
                      <thead className="border-b border-[#e1e3e5] bg-white text-[#6d7175]">
                        <tr>
                          <th className="px-5 py-3 font-medium">মোবাইল নম্বর</th>
                          <th className="px-5 py-3 font-medium text-right">পদক্ষেপ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e1e3e5]">
                        {blockedPhones.map((phone) => (
                          <tr key={phone} className="hover:bg-[#f6f6f7]">
                            <td className="px-5 py-3 font-medium text-[#c0392b]">
                              {phone}
                            </td>
                            <td className="px-5 py-3 text-right">
                              <button
                                onClick={() => {
                                  unblockPhone(phone);
                                  setSuccessModal({
                                    isOpen: true,
                                    title: "আনব্লক করা হয়েছে",
                                    description: `ফোন নম্বর ${phone} সফলভাবে আনব্লক করা হয়েছে।`
                                  });
                                }}
                                className="text-[#005bd3] text-xs hover:underline font-semibold cursor-pointer"
                              >
                                Unblock
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "analytics" ? (
            <div className="space-y-6 max-w-5xl">
              {/* Analytics Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-lg border border-[#e1e3e5] shadow-sm">
                  <p className="text-xs text-[#6d7175] font-medium">মোট অর্ডার</p>
                  <p className="text-2xl font-bold text-[#202223] mt-1">{orders.length}</p>
                </div>
                <div className="bg-white p-5 rounded-lg border border-[#e1e3e5] shadow-sm">
                  <p className="text-xs text-[#6d7175] font-medium">সফল ডেলিভারি</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">{orders.filter(o => o.status === 'delivered').length}</p>
                </div>
                <div className="bg-white p-5 rounded-lg border border-[#e1e3e5] shadow-sm">
                  <p className="text-xs text-[#6d7175] font-medium">বাতিলকৃত অর্ডার</p>
                  <p className="text-2xl font-bold text-rose-600 mt-1">{orders.filter(o => o.status === 'cancelled').length}</p>
                </div>
                <div className="bg-white p-5 rounded-lg border border-[#e1e3e5] shadow-sm">
                  <p className="text-xs text-[#6d7175] font-medium">মোট সেলস / রেভিনিউ</p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">৳{orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}</p>
                </div>
              </div>

              {/* District-wise Order Summary */}
              <div className="bg-white shadow-sm border border-[#e1e3e5] rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-[#e1e3e5] bg-[#f9fafb]">
                  <h3 className="text-[#202223] font-bold text-sm">
                    জেলাভিত্তিক অর্ডার সামারি (District-wise Order Counter & Analytics)
                  </h3>
                  <p className="text-xs text-[#6d7175] mt-0.5">
                    কোন জেলা থেকে কতটি অর্ডার এসেছে তার সম্পূর্ণ পরিসংখ্যান
                  </p>
                </div>

                {orders.length === 0 ? (
                  <div className="p-8 text-center text-[#6d7175] text-xs">
                    কোনো অর্ডার ডেটা পাওয়া যায়নি।
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-[#202223]">
                      <thead className="border-b border-[#e1e3e5] bg-[#f9fafb] text-[#6d7175]">
                        <tr>
                          <th className="px-5 py-3 font-medium">জেলা (District)</th>
                          <th className="px-5 py-3 font-medium">মোট অর্ডার</th>
                          <th className="px-5 py-3 font-medium">সফল ডেলিভারি</th>
                          <th className="px-5 py-3 font-medium">বাতিল</th>
                          <th className="px-5 py-3 font-medium text-right">মোট রেভিনিউ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e1e3e5]">
                        {Object.entries(
                          orders.reduce((acc: Record<string, { total: number; delivered: number; cancelled: number; revenue: number }>, o) => {
                            const dist = o.customer?.district || o.customer?.city || 'অন্যান্য';
                            if (!acc[dist]) {
                              acc[dist] = { total: 0, delivered: 0, cancelled: 0, revenue: 0 };
                            }
                            acc[dist].total += 1;
                            if (o.status === 'delivered') acc[dist].delivered += 1;
                            if (o.status === 'cancelled') acc[dist].cancelled += 1;
                            acc[dist].revenue += (o.total || 0);
                            return acc;
                          }, {})
                        )
                          .sort((a, b) => b[1].total - a[1].total)
                          .map(([district, stats]) => (
                            <tr key={district} className="hover:bg-[#f6f6f7]">
                              <td className="px-5 py-3 font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                                {district}
                              </td>
                              <td className="px-5 py-3 font-semibold text-blue-700">{stats.total} টি</td>
                              <td className="px-5 py-3 font-semibold text-emerald-700">{stats.delivered} টি</td>
                              <td className="px-5 py-3 font-semibold text-rose-700">{stats.cancelled} টি</td>
                              <td className="px-5 py-3 text-right font-mono font-bold text-gray-900">৳{stats.revenue.toLocaleString()}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "products" ? (
            /* Products Table */
            <div className="bg-white shadow-sm border border-[#e1e3e5] rounded-lg overflow-hidden">
              <div className="px-5 py-4 border-b border-[#e1e3e5] flex justify-between items-center bg-[#f9fafb]">
                <div className="flex items-center gap-3">
                  <h3 className="text-[#202223] font-semibold">All Products</h3>
                  <span className="text-sm text-[#6d7175]">
                    {products.length} items
                  </span>
                </div>
                {selectedProductIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteProducts}
                    className="bg-[#c0392b] hover:bg-[#a93226] text-white px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedProductIds.length})
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#202223]">
                  <thead className="border-b border-[#e1e3e5] bg-white text-[#6d7175]">
                    <tr>
                      <th className="px-5 py-3 w-10 font-medium">
                        <input
                          type="checkbox"
                          className="rounded border-[#c9cccf] text-[#008060] focus:ring-[#008060] w-4 h-4 cursor-pointer"
                          checked={products.length > 0 && selectedProductIds.length === products.length}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProductIds(products.map(p => String(p.id)));
                            } else {
                              setSelectedProductIds([]);
                            }
                          }}
                        />
                      </th>
                      <th className="px-5 py-3 font-medium">Product</th>
                      <th className="px-5 py-3 font-medium">Category</th>
                      <th className="px-5 py-3 font-medium">Price (BDT)</th>
                      <th className="px-5 py-3 font-medium">Inventory</th>
                      <th className="px-5 py-3 font-medium text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e1e3e5]">
                    {products.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-8 text-center text-[#6d7175]"
                        >
                          No products found. Add some to your inventory.
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr
                          key={product.id}
                          className={`hover:bg-[#f6f6f7] transition-colors group ${selectedProductIds.includes(String(product.id)) ? "bg-blue-50/40" : ""}`}
                        >
                          <td className="px-5 py-3 w-10">
                            <input
                              type="checkbox"
                              className="rounded border-[#c9cccf] text-[#008060] focus:ring-[#008060] w-4 h-4 cursor-pointer"
                              checked={selectedProductIds.includes(String(product.id))}
                              onChange={(e) => {
                                const prodIdStr = String(product.id);
                                if (e.target.checked) {
                                  setSelectedProductIds(prev => [...prev, prodIdStr]);
                                } else {
                                  setSelectedProductIds(prev => prev.filter(id => id !== prodIdStr));
                                }
                              }}
                            />
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded border border-[#e1e3e5] bg-white overflow-hidden shrink-0">
                                <img
                                  src={product.image}
                                  alt={product.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span
                                className="font-medium text-[#005bd3] hover:underline cursor-pointer"
                                onClick={() => handleOpenModal(product)}
                              >
                                {product.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-[#6d7175]">
                            {product.category}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex flex-col">
                              <span className="font-medium text-[#202223]">৳ {product.price.toLocaleString("en-IN")}</span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-xs text-gray-400 line-through">৳ {product.originalPrice.toLocaleString("en-IN")}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-xl text-xs font-medium ${product.inStock ? "bg-[#aee9d1] text-[#007f5f]" : "bg-[#ffc9c9] text-[#c0392b]"}`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${product.inStock ? "bg-[#007f5f]" : "bg-[#c0392b]"}`}
                              ></span>
                              {product.inStock ? "In stock" : "Out of stock"}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => {
                                  const domain = window.location.origin && !window.location.origin.includes('localhost') ? window.location.origin : 'https://elhambd.shop';
                                  const prodUrl = `${domain}/product/${product.id}`;
                                  navigator.clipboard.writeText(prodUrl);
                                  setSuccessModal({
                                    isOpen: true,
                                    title: "লিংক কপি হয়েছে",
                                    description: "প্রোডাক্টের সরাসরি লিংক ক্লিপবোর্ডে কপি করা হয়েছে!"
                                  });
                                }} className="p-1.5 text-[#6d7175] hover:bg-blue-100 hover:text-blue-600 rounded transition-colors" title="Copy Product Link">
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleOpenModal(product)} className="p-1.5 text-[#6d7175] hover:bg-[#e1e3e5] rounded transition-colors" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    isOpen: true,
                                    title: "পণ্য ডিলিট নিশ্চিত করুন",
                                    description: `আপনি কি নিশ্চিত যে আপনি "${product.title}" পণ্যটি ডিলিট করতে চান?`,
                                    onConfirm: () => {
                                      deleteProduct(product.id);
                                      setSuccessModal({
                                        isOpen: true,
                                        title: "পণ্য ডিলিট হয়েছে",
                                        description: `"${product.title}" পণ্যটি সফলভাবে ডিলিট করা হয়েছে।`
                                      });
                                    }
                                  });
                                }}
                                className="p-1.5 text-[#6d7175] hover:bg-[#ffc9c9] hover:text-[#c0392b] rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : activeTab === "fb_pixel" ? (
            <div className="bg-white shadow-sm border border-[#e1e3e5] rounded-lg overflow-hidden max-w-2xl">
              <div className="px-5 py-4 border-b border-[#e1e3e5] bg-[#f9fafb]">
                <h3 className="text-[#202223] font-semibold">Facebook Pixel</h3>
              </div>
              <div className="p-5 space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-[#202223] mb-1">
                    Facebook Pixel ID
                  </h4>
                  <p className="text-xs text-[#6d7175] mb-3">
                    Enter your Facebook Pixel ID to track page views and
                    conversions. Leave blank to disable.
                  </p>
                  <input
                    type="text"
                    value={pixelId}
                    onChange={(e) => setPixelId(e.target.value)}
                    placeholder="e.g. 123456789012345"
                    className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-[#e1e3e5]">
                  <h4 className="text-sm font-medium text-[#202223] mb-1">
                    Facebook Conversions API Access Token
                  </h4>
                  <p className="text-xs text-[#6d7175] mb-3">
                    Optional: Enter your access token for server-side tracking
                    (CAPI).
                  </p>
                  <input
                    type="text"
                    value={pixelAccessToken}
                    onChange={(e) => setPixelAccessToken(e.target.value)}
                    placeholder="EAAB..."
                    className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none"
                  />
                </div>
              </div>
            </div>
          ) : activeTab === "gtm" ? (
            <div className="bg-white shadow-sm border border-[#e1e3e5] rounded-lg overflow-hidden max-w-2xl">
              <div className="px-5 py-4 border-b border-[#e1e3e5] bg-[#f9fafb]">
                <h3 className="text-[#202223] font-semibold">
                  Google Tag Manager
                </h3>
              </div>
              <div className="p-5">
                <div>
                  <h4 className="text-sm font-medium text-[#202223] mb-1">
                    Google Tag Manager ID
                  </h4>
                  <p className="text-xs text-[#6d7175] mb-3">
                    Enter your GTM ID (e.g. GTM-XXXXXXX). Leave blank to
                    disable.
                  </p>
                  <input
                    type="text"
                    value={gtmId}
                    onChange={(e) => setGtmId(e.target.value)}
                    placeholder="GTM-XXXXXXX"
                    className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none"
                  />
                </div>
              </div>
            </div>
          ) : activeTab === "courier" ? (
            <div className="space-y-6 max-w-5xl">
              {/* App Title Section with SteadFast Green Brand */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-[#e1e3e5] rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#1e8556] rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-inner tracking-tight">
                    SF
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-[#202223] tracking-tight">SteadFast</h2>
                      {(!courierApiKey || courierApiKey.trim() === '' || courierApiKey.trim() === 'SF_LIVE_API_KEY_7739') ? (
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.5 rounded-full">
                          Setup Required / Not Configured
                        </span>
                      ) : (
                        <span className="text-[10px] bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">
                          Connected & Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6d7175]">Automated courier sync & consignment generation</p>
                    {(!courierApiKey || courierApiKey.trim() === '' || courierApiKey.trim() === 'SF_LIVE_API_KEY_7739') && (
                      <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-100 rounded-lg p-2.5 mt-2 font-medium leading-relaxed max-w-xl">
                        ⚠️ <strong>অনুগ্রহ করে আপনার নিজের এপিআই কি সেট করুন:</strong> বর্তমানে ডেমো/প্লেসহোল্ডার কি ব্যবহার করা হচ্ছে। আপনার অরিজিনাল SteadFast মার্চেন্ট প্যানেল থেকে পাওয়া <strong>API Key</strong> এবং <strong>Secret Key</strong> নিচের <strong>"Settings"</strong> সাব-ট্যাবে গিয়ে সেভ করুন, অন্যথায় ব্যালেন্স ও অর্ডার সিঙ্ক কাজ করবে না।
                      </p>
                    )}
                  </div>
                </div>

                {/* Tab selector */}
                <div className="flex items-center gap-2 border border-[#e1e3e5] rounded-lg p-1 bg-[#fafbfb] self-start md:self-auto">
                  <button
                    onClick={() => setSteadfastSubTab("orders")}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      steadfastSubTab === "orders"
                        ? "bg-[#202223] text-white shadow-sm"
                        : "text-[#6d7175] hover:text-[#202223] hover:bg-[#f1f2f4]"
                    }`}
                  >
                    View orders
                  </button>
                  <button
                    onClick={() => setSteadfastSubTab("balance")}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      steadfastSubTab === "balance"
                        ? "bg-[#202223] text-white shadow-sm"
                        : "text-[#6d7175] hover:text-[#202223] hover:bg-[#f1f2f4]"
                    }`}
                  >
                    Check balance
                  </button>
                  <button
                    onClick={() => setSteadfastSubTab("settings")}
                    className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      steadfastSubTab === "settings"
                        ? "bg-[#202223] text-white shadow-sm"
                        : "text-[#6d7175] hover:text-[#202223] hover:bg-[#f1f2f4]"
                    }`}
                  >
                    Settings
                  </button>
                </div>
              </div>

              {/* ORDERS VIEW SUB-TAB */}
              {steadfastSubTab === "orders" && (
                <>
                  {/* Metric boxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Orders Card */}
                    <div className="bg-white border border-[#e1e3e5] rounded-xl p-4 shadow-sm">
                      <span className="text-xs font-medium text-[#6d7175] block mb-1">Total orders</span>
                      <span className="text-2xl font-bold text-[#202223] block">{orders.length}</span>
                      <span className="inline-block bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded mt-2">
                        All time
                      </span>
                    </div>

                    {/* Pending Card */}
                    <div className="bg-white border border-[#e1e3e5] rounded-xl p-4 shadow-sm">
                      <span className="text-xs font-medium text-[#6d7175] block mb-1">Pending</span>
                      <span className="text-2xl font-bold text-[#202223] block">
                        {orders.filter(o => o.status === "pending").length}
                      </span>
                      <span className="inline-block bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded mt-2">
                        In transit
                      </span>
                    </div>

                    {/* Delivered Card */}
                    <div className="bg-white border border-[#e1e3e5] rounded-xl p-4 shadow-sm">
                      <span className="text-xs font-medium text-[#6d7175] block mb-1">Delivered</span>
                      <span className="text-2xl font-bold text-[#202223] block">
                        {orders.filter(o => o.status === "delivered").length}
                      </span>
                      <span className="inline-block bg-green-50 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded mt-2">
                        Completed
                      </span>
                    </div>

                    {/* Cancelled Card */}
                    <div className="bg-white border border-[#e1e3e5] rounded-xl p-4 shadow-sm">
                      <span className="text-xs font-medium text-[#6d7175] block mb-1">Cancelled</span>
                      <span className="text-2xl font-bold text-[#202223] block">
                        {orders.filter(o => o.status === "cancelled").length}
                      </span>
                      <span className="inline-block bg-red-50 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded mt-2">
                        Cancelled
                      </span>
                    </div>
                  </div>

                  {/* Recent Orders Section */}
                  <div className="bg-white border border-[#e1e3e5] rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-[#e1e3e5] flex justify-between items-center bg-gray-50">
                      <h3 className="font-semibold text-sm text-[#202223]">Recent orders</h3>
                      <span className="text-xs text-[#6d7175]">ELHAMSHOP Sync active</span>
                    </div>

                    {orders.length === 0 ? (
                      <div className="p-8 flex flex-col items-center justify-center text-center">
                        <ImageIcon className="w-12 h-12 text-gray-300 mb-3" />
                        <h4 className="text-sm font-bold text-[#202223] mb-1">No orders yet</h4>
                        <p className="text-xs text-[#6d7175] max-w-sm">
                          Orders received from your {storeName.split(' - ')[0]} store will appear here automatically.
                        </p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#f9fafb] border-b border-[#e1e3e5] text-xs font-medium text-[#6d7175]">
                              <th className="p-4">Order ID</th>
                              <th className="p-4">Customer</th>
                              <th className="p-4">Total</th>
                              <th className="p-4">Courier Sync Status</th>
                              <th className="p-4 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[#e1e3e5] text-xs">
                            {orders.map((order) => {
                              const consignmentId = consignmentMap[order.id];
                              const isSynced = !!consignmentId;

                              return (
                                <tr key={order.id} className="hover:bg-gray-50">
                                  <td className="p-4 font-bold text-[#005bd3]">#{order.id.slice(0, 8)}</td>
                                  <td className="p-4">
                                    <p className="font-medium text-[#202223]">{order.customer.name}</p>
                                    <p className="text-[10px] text-[#6d7175]">{order.customer.phone}</p>
                                  </td>
                                  <td className="p-4 font-semibold text-[#202223]">৳{order.total}</td>
                                  <td className="p-4">
                                    {isSynced ? (
                                      <div className="flex flex-col">
                                        <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full w-fit">
                                          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                                          In Review
                                        </span>
                                        <span className="text-[10px] text-[#6d7175] mt-1 font-mono font-bold bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">ID: {consignmentId}</span>
                                      </div>
                                    ) : (
                                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                                        Pending Courier Sync
                                      </span>
                                    )}
                                  </td>
                                  <td className="p-4 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                      {isSynced ? (
                                        <div className="flex flex-col items-end gap-1">
                                          <button
                                            onClick={() => setSuccessModal({
                                              isOpen: true,
                                              title: "অর্ডার ট্র্যাকিং তথ্য",
                                              description: `Consignment tracking for ${consignmentId}:\nStatus: In Review\nDestination: ${order.customer.city}`
                                            })}
                                            className="text-[#005bd3] hover:underline font-bold cursor-pointer text-xs"
                                          >
                                            Track Consignment
                                          </button>
                                          <button
                                            onClick={() => {
                                              setConfirmModal({
                                                isOpen: true,
                                                title: "কুরিয়ার স্ট্যাটাস রিসেট নিশ্চিত করুন",
                                                description: "আপনি কি এই অর্ডারের কুরিয়ার স্ট্যাটাস রিসেট করতে চান? এটি রিসেট করার পর আপনি পুনরায় অর্ডারটি SteadFast এ পাঠাতে পারবেন।",
                                                onConfirm: () => {
                                                  resetCourierStatus(order.id);
                                                  setSuccessModal({
                                                    isOpen: true,
                                                    title: "রিসেট সম্পন্ন",
                                                    description: "কুরিয়ার স্ট্যাটাস সফলভাবে রিসেট করা হয়েছে। আপনি এখন পুনরায় 'Send to SteadFast' বাটনে ক্লিক করে পাঠাতে পারেন।"
                                                  });
                                                }
                                              });
                                            }}
                                            className="text-red-600 hover:underline text-[10px] font-bold cursor-pointer"
                                          >
                                            Reset Status / Retry
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => handleSendOrderToCourierAsync(order.id)}
                                          className="bg-[#1e8556] text-white px-3 py-1.5 rounded-md font-semibold hover:bg-[#155e3c] transition-colors cursor-pointer text-xs"
                                        >
                                          Send to SteadFast
                                        </button>
                                      )}
                                      <button
                                        onClick={() => {
                                          setConfirmModal({
                                            isOpen: true,
                                            title: "অর্ডার ডিলিট নিশ্চিত করুন",
                                            description: `আপনি কি নিশ্চিত যে আপনি এই অর্ডারটি ডিলিট করতে চান? এই কাজ আর পূর্বাবস্থায় ফিরিয়ে আনা যাবে না।`,
                                            onConfirm: () => {
                                              deleteOrder(order.id);
                                              setSuccessModal({
                                                isOpen: true,
                                                title: "অর্ডার ডিলিট হয়েছে",
                                                description: `অর্ডার ${order.id} সফলভাবে ডিলিট করা হয়েছে।`
                                              });
                                            }
                                          });
                                        }}
                                        className="text-red-600 hover:text-red-800 font-bold hover:underline cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* CHECK BALANCE SUB-TAB */}
              {steadfastSubTab === "balance" && (
                <div className="bg-white border border-[#e1e3e5] rounded-xl shadow-sm p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-bold text-base text-[#202223]">SteadFast Financial Overview</h3>
                    <button
                      onClick={() => {
                        const newBal = prompt("Enter your actual SteadFast Available Balance (৳):", steadfastBalance.toString());
                        if (newBal !== null) {
                          const parsed = parseFloat(newBal);
                          if (!isNaN(parsed)) {
                            setSteadfastBalance(parsed);
                            setSuccessModal({
                              isOpen: true,
                              title: "ব্যালেন্স সিঙ্ক সফল",
                              description: `স্টেডফাস্ট কুরিয়ার ব্যালেন্স সফলভাবে আপডেট এবং সার্ভারের সাথে ভেরিফাই করা হয়েছে।`,
                              amount: parsed,
                            });
                          } else {
                            setSuccessModal({
                              isOpen: true,
                              title: "ভুল ইনপুট",
                              description: "দয়া করে একটি সঠিক সংখ্যা ইনপুট করুন।"
                            });
                          }
                        }
                      }}
                      className="bg-[#202223] text-white hover:bg-black rounded px-3 py-1.5 text-xs font-semibold transition-colors"
                    >
                      Update Balance
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-[#e1e3e5] rounded-lg p-5 bg-[#fcfcfc]">
                      <span className="text-xs text-[#6d7175] block mb-1">Available Balance</span>
                      <span className="text-3xl font-extrabold text-[#1e8556]">৳{steadfastBalance.toLocaleString("en-IN")}</span>
                      <p className="text-[10px] text-[#6d7175] mt-2">Ready for withdrawal to Bank/bKash</p>
                    </div>

                    <div className="border border-[#e1e3e5] rounded-lg p-5 bg-[#fcfcfc]">
                      <span className="text-xs text-[#6d7175] block mb-1">In Transit / Cod Pending</span>
                      <span className="text-3xl font-extrabold text-[#e28743]">৳{steadfastInTransit.toLocaleString("en-IN")}</span>
                      <p className="text-[10px] text-[#6d7175] mt-2">Delivered orders waiting for payout</p>
                    </div>

                    <div className="border border-[#e1e3e5] rounded-lg p-5 bg-[#fcfcfc]">
                      <span className="text-xs text-[#6d7175] block mb-1">Paid Out</span>
                      <span className="text-3xl font-extrabold text-[#202223]">৳{steadfastPaidOut.toLocaleString("en-IN")}</span>
                      <p className="text-[10px] text-[#6d7175] mt-2">Successfully withdrawn cashouts</p>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-3 border-t border-[#e1e3e5]">
                    <button
                      onClick={() => {
                        if (steadfastBalance <= 0) {
                          setSuccessModal({
                            isOpen: true,
                            title: "উত্তোলনের জন্য পর্যাপ্ত ব্যালেন্স নেই",
                            description: "আপনার কারেন্ট ব্যালেন্স ০ টাকা। উত্তোলন বা উইথড্র করার জন্য আপনার ব্যালেন্স থাকতে হবে।"
                          });
                          return;
                        }
                        const currentBalance = steadfastBalance;
                        setSteadfastBalance(0);
                        setSteadfastPaidOut(steadfastPaidOut + currentBalance);
                        setSuccessModal({
                          isOpen: true,
                          title: "Withdrawal Successful!",
                          description: "Your withdrawal request has been submitted successfully to your registered bank / mobile financial service (bKash) account. Payout processing takes 12-24 hours.",
                          amount: currentBalance,
                          transactionId: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
                        });
                      }}
                      className="bg-[#1e8556] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#155e3c] transition-colors"
                    >
                      Withdraw Funds
                    </button>
                    <button
                      onClick={async () => {
                        if (checkBalance) {
                          const res = await checkBalance();
                          if (res.success) {
                            setSuccessModal({
                              isOpen: true,
                              title: "ব্যালেন্স সিঙ্ক সম্পন্ন!",
                              description: `SteadFast Courier এপিআই থেকে নতুন ব্যালেন্স সফলভাবে সিঙ্ক করা হয়েছে।\n\nবর্তমান ব্যালেন্স: ৳ ${(res.balance ?? 0).toLocaleString('en-BD')}`
                            });
                          } else {
                            setSuccessModal({
                              isOpen: true,
                              title: "সিঙ্ক করতে ব্যর্থ",
                              description: res.message || "ব্যালেন্স রিফ্রেশ করা সম্ভব হয়নি।"
                            });
                          }
                        }
                      }}
                      className="bg-white border border-[#c9cccf] text-[#202223] px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Refresh Balance
                    </button>
                  </div>
                </div>
              )}

              {/* SETTINGS SUB-TAB */}
              {steadfastSubTab === "settings" && (
                <div className="bg-white shadow-sm border border-[#e1e3e5] rounded-xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-[#e1e3e5] bg-[#f9fafb]">
                    <h3 className="text-[#202223] font-bold text-sm">
                      Courier Integration Settings
                    </h3>
                  </div>
                  <div className="p-5 space-y-6">
                    <div>
                      <h4 className="text-sm font-semibold text-[#202223] mb-1">
                        Courier API Integration
                      </h4>
                      <p className="text-xs text-[#6d7175] mb-4">
                        Configure your preferred courier (Steadfast, Pathao, RedX, etc.) for automated order syncing.
                      </p>
                      
                      <div className="space-y-4 max-w-lg">
                        <div>
                          <label className="block text-xs font-bold text-[#202223] mb-1">Select Courier Service</label>
                          <select
                            value={courierService}
                            onChange={(e) => setCourierService(e.target.value)}
                            className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none bg-white font-medium"
                          >
                            <option value="">Select Courier Service</option>
                            <option value="steadfast">Steadfast Courier</option>
                            <option value="pathao">Pathao Courier</option>
                            <option value="redx">RedX Delivery</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#202223] mb-1">API Key / Client ID</label>
                          <input
                            type="text"
                            value={courierApiKey}
                            onChange={(e) => setCourierApiKey(e.target.value)}
                            placeholder="API Key / Client ID"
                            className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#202223] mb-1">Secret Key</label>
                          <input
                            type="password"
                            value={courierSecretKey}
                            onChange={(e) => setCourierSecretKey(e.target.value)}
                            placeholder="Secret Key"
                            className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none font-medium"
                          />
                        </div>

                        <div className="pt-2">
                          <button
                            onClick={() => {
                              if (courierService && courierApiKey && courierSecretKey) {
                                saveStoreSettingsToCloud({ courierService, courierApiKey, courierSecretKey });
                                setSuccessModal({
                                  isOpen: true,
                                  title: "সেটিংস সংরক্ষিত হয়েছে",
                                  description: "স্টেডফাস্ট কুরিয়ারের ক্রেডেনশিয়ালস সফলভাবে সেট করা হয়েছে! এখন আপনি অর্ডার সরাসরি পাঠাতে পারবেন।"
                                });
                                setSteadfastSubTab("orders");
                              } else {
                                setSuccessModal({
                                  isOpen: true,
                                  title: "অসম্পূর্ণ তথ্য",
                                  description: "দয়া করে কুরিয়ার সার্ভিস এবং ক্রেডেনশিয়ালসের সব কয়টি ঘর পূরণ করুন।"
                                });
                              }
                            }}
                            className="bg-[#005bd3] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#004bb4] transition-colors shadow-sm"
                          >
                            Save Courier Settings
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === "navigation_menu" ? (
            <div className="space-y-8 animate-fade-in">
              {/* Main Heading */}
              <div className="bg-white p-6 rounded-xl border border-[#e1e3e5] shadow-xs">
                <h2 className="text-xl font-bold text-[#202223] mb-1">হেডার নেভিগেশন মেনু ও প্রোডাক্ট ক্যাটাগরি ম্যানেজমেন্ট</h2>
                <p className="text-xs text-[#6d7175]">
                  আপনার ওয়েবসাইটের উপরের মেনুবার (Header Navigation) কাস্টমাইজ করুন এবং কোন প্রোডাক্ট কোন ক্যাটাগরির অধীনে থাকবে তা সহজেই নিয়ন্ত্রণ করুন।
                </p>
              </div>

              {/* Two columns layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Column 1: Header Menu Links Manager */}
                <div className="bg-white rounded-xl border border-[#e1e3e5] shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#e1e3e5] bg-[#f9fafb] flex items-center justify-between">
                    <div>
                      <h3 className="text-[#202223] font-bold text-sm">হেডার মেনু লিংক ম্যানেজার</h3>
                      <p className="text-[11px] text-[#6d7175] mt-0.5">মেনুবারের লিংকগুলোর নাম, লিংক করার ধরন ও ক্রম সাজান</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingMenuItemId(null);
                        setMenuForm({
                          label: '',
                          type: 'shop',
                          link: '',
                          categoryFilter: categories[0] || '',
                          isActive: true
                        });
                        setIsMenuModalOpen(true);
                      }}
                      className="bg-[#005bd3] hover:bg-[#004bb4] text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      নতুন লিংক যোগ করুন
                    </button>
                  </div>

                  <div className="p-6">
                    {menuItems.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-xs">কোনো মেনু লিংক তৈরি করা নেই।</div>
                    ) : (
                      <div className="space-y-3">
                        {menuItems.map((item, index) => {
                          let typeLabel = '';
                          switch(item.type) {
                            case 'home': typeLabel = 'Home Screen'; break;
                            case 'shop': typeLabel = 'Shop Section (#shop)'; break;
                            case 'reel': typeLabel = 'Reel Offers'; break;
                            case 'categories': typeLabel = 'Categories Section'; break;
                            case 'about': typeLabel = 'About Us Section'; break;
                            case 'category_filter': typeLabel = `Category Filter: "${item.categoryFilter}"`; break;
                            case 'url': typeLabel = `URL/Anchor: "${item.link}"`; break;
                          }

                          return (
                            <div 
                              key={item.id} 
                              className={`flex items-center justify-between p-3.5 rounded-lg border transition-colors ${
                                item.isActive ? 'bg-[#f6f8fa]/60 border-[#e1e3e5]' : 'bg-gray-50/50 border-gray-200 opacity-60'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-[#202223]">{item.label}</span>
                                  {!item.isActive && (
                                    <span className="bg-gray-200 text-gray-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                      Draft
                                    </span>
                                  )}
                                  {item.type === 'reel' && (
                                    <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                                      Special ⚡
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-[#6d7175]">
                                  ধরন: <span className="font-medium text-gray-700">{typeLabel}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {/* Toggle active */}
                                <button
                                  onClick={() => handleToggleMenuItem(item.id)}
                                  className={`text-[10px] font-bold px-2 py-1 rounded border transition-all cursor-pointer ${
                                    item.isActive 
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                                      : 'bg-gray-100 text-gray-500 border-gray-300 hover:bg-gray-200'
                                  }`}
                                  title={item.isActive ? "নিষ্ক্রিয় করুন" : "সক্রিয় করুন"}
                                >
                                  {item.isActive ? "Active" : "Inactive"}
                                </button>

                                {/* Move buttons */}
                                <div className="flex flex-col gap-0.5">
                                  <button
                                    onClick={() => handleMoveMenuItem(index, 'up')}
                                    disabled={index === 0}
                                    className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 cursor-pointer"
                                    title="উপরে নিন"
                                  >
                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/></svg>
                                  </button>
                                  <button
                                    onClick={() => handleMoveMenuItem(index, 'down')}
                                    disabled={index === menuItems.length - 1}
                                    className="p-1 rounded hover:bg-gray-200 text-gray-500 disabled:opacity-30 cursor-pointer"
                                    title="নিচে নিন"
                                  >
                                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z"/></svg>
                                  </button>
                                </div>

                                {/* Edit Button */}
                                <button
                                  onClick={() => {
                                    setEditingMenuItemId(item.id);
                                    setMenuForm({
                                      label: item.label,
                                      type: item.type,
                                      link: item.link || '',
                                      categoryFilter: item.categoryFilter || (categories[0] || ''),
                                      isActive: item.isActive
                                    });
                                    setIsMenuModalOpen(true);
                                  }}
                                  className="p-1.5 rounded hover:bg-gray-200 text-blue-600 transition-colors cursor-pointer"
                                  title="সম্পাদনা করুন"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>

                                {/* Delete Button */}
                                <button
                                  onClick={() => {
                                    if (confirm("আপনি কি নিশ্চিতভাবে এই মেনু লিংকটি মুছে ফেলতে চান?")) {
                                      handleDeleteMenuItem(item.id);
                                    }
                                  }}
                                  className="p-1.5 rounded hover:bg-gray-200 text-rose-600 transition-colors cursor-pointer"
                                  title="মুছে ফেলুন"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Products in Categories */}
                <div className="bg-white rounded-xl border border-[#e1e3e5] shadow-xs overflow-hidden">
                  <div className="px-6 py-4 border-b border-[#e1e3e5] bg-[#f9fafb]">
                    <h3 className="text-[#202223] font-bold text-sm">ক্যাটাগরি ও প্রোডাক্ট অ্যাসোসিয়েশন</h3>
                    <p className="text-[11px] text-[#6d7175] mt-0.5">কোন ক্যাটাগরিতে কোন প্রোডাক্ট রয়েছে তা দেখুন এবং পরিবর্তন করুন</p>
                  </div>

                  <div className="p-6 space-y-6">
                    {categories.length === 0 ? (
                      <div className="text-center py-10 text-gray-400 text-xs">কোনো ক্যাটাগরি তৈরি করা নেই। প্রোডাক্ট এডিট পেইজ থেকে ক্যাটাগরি যোগ করুন।</div>
                    ) : (
                      <div className="space-y-4">
                        {categories.map(cat => {
                          const catProducts = products.filter(p => p.category === cat);
                          return (
                            <div key={cat} className="border border-gray-100 rounded-lg overflow-hidden bg-gray-50/20">
                              <div className="bg-gray-50 px-4 py-2.5 flex items-center justify-between border-b border-gray-100">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-xs text-gray-800">{cat}</span>
                                  <span className="bg-amber-100 text-amber-950 font-bold text-[10px] px-2 py-0.5 rounded-full">
                                    {catProducts.length} টি প্রোডাক্ট
                                  </span>
                                </div>
                              </div>
                              <div className="p-3 divide-y divide-gray-100 bg-white max-h-[250px] overflow-y-auto">
                                {catProducts.length === 0 ? (
                                  <div className="text-center py-4 text-xs text-gray-400">এই ক্যাটাগরিতে কোনো প্রোডাক্ট নেই।</div>
                                ) : (
                                  catProducts.map(p => (
                                    <div key={p.id} className="flex items-center justify-between py-2 first:pt-0 last:pb-0">
                                      <div className="flex items-center gap-2.5">
                                        <img 
                                          src={p.image} 
                                          alt={p.title} 
                                          className="w-8 h-8 rounded-md object-cover border border-gray-200" 
                                          referrerPolicy="no-referrer"
                                        />
                                        <span className="text-xs text-gray-800 font-medium truncate max-w-[150px] md:max-w-[200px]" title={p.title}>
                                          {p.title}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-[10px] text-gray-500 font-semibold">৳ {p.price}</span>
                                        {/* Category switcher drop down */}
                                        <select
                                          value={p.category}
                                          onChange={(e) => {
                                            const newCat = e.target.value;
                                            updateProduct({ ...p, category: newCat });
                                          }}
                                          className="text-[10px] border border-gray-300 rounded px-1.5 py-0.5 bg-white text-gray-700 focus:outline-none"
                                        >
                                          {categories.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Menu Editor Modal */}
              {isMenuModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                  <div className="bg-white rounded-xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden animate-scale-up">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                      <h3 className="font-bold text-gray-800 text-sm">
                        {editingMenuItemId ? "মেনু লিংক সংশোধন করুন" : "নতুন মেনু লিংক যোগ করুন"}
                      </h3>
                      <button 
                        onClick={() => setIsMenuModalOpen(false)}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-6 space-y-4">
                      {/* Name input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">মেনু লিংকের নাম (Label)*</label>
                        <input
                          type="text"
                          value={menuForm.label}
                          onChange={(e) => setMenuForm({ ...menuForm, label: e.target.value })}
                          placeholder="যেমন: সিল্ক কালেকশন, পাঞ্জাবি বাফার, ইত্যাদি"
                          className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Type input */}
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">লিংক করার ধরন (Action Type)</label>
                        <select
                          value={menuForm.type}
                          onChange={(e) => {
                            const type = e.target.value as any;
                            setMenuForm({ 
                              ...menuForm, 
                              type,
                              link: type === 'url' ? '#' : menuForm.link 
                            });
                          }}
                          className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="home">Home Screen</option>
                          <option value="shop">Shop Section (#shop)</option>
                          <option value="reel">Reel Offers</option>
                          <option value="categories">Categories Section</option>
                          <option value="about">About Us Section</option>
                          <option value="category_filter">নির্দিষ্ট ক্যাটাগরি ফিল্টার (Category Filter)</option>
                          <option value="url">কাস্টম লিংক বা এঙ্কর (Custom URL / Anchor)</option>
                        </select>
                      </div>

                      {/* URL input (Only visible when URL type is selected) */}
                      {menuForm.type === 'url' && (
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">কাস্টম লিংক বা আইডি (URL / Target Anchor)</label>
                          <input
                            type="text"
                            value={menuForm.link}
                            onChange={(e) => setMenuForm({ ...menuForm, link: e.target.value })}
                            placeholder="যেমন: #shop বা https://example.com"
                            className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}

                      {/* Category Selector input (Only visible when Category Filter type is selected) */}
                      {menuForm.type === 'category_filter' && (
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-1">নির্দিষ্ট ক্যাটাগরি সিলেক্ট করুন</label>
                          <select
                            value={menuForm.categoryFilter}
                            onChange={(e) => setMenuForm({ ...menuForm, categoryFilter: e.target.value })}
                            className="w-full text-xs border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {categories.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* IsActive Toggle checkbox */}
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="menu-is-active"
                          checked={menuForm.isActive}
                          onChange={(e) => setMenuForm({ ...menuForm, isActive: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="menu-is-active" className="text-xs font-semibold text-gray-700 cursor-pointer">
                          মেনুবারে এই লিংকটি সরাসরি লাইভ দেখান (Active)
                        </label>
                      </div>

                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
                      <button
                        onClick={() => setIsMenuModalOpen(false)}
                        className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                      >
                        বাতিল
                      </button>
                      <button
                        onClick={handleSaveMenuItem}
                        disabled={!menuForm.label.trim()}
                        className="bg-[#005bd3] hover:bg-[#004bb4] text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                      >
                        সংরক্ষণ করুন
                      </button>
                    </div>

                  </div>
                </div>
              )}

            </div>
          ) : activeTab === "landings" ? (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-[#e1e3e5] shadow-sm">
                <div>
                  <h2 className="text-lg font-bold text-[#202223]">ল্যান্ডিং পেজ মেকার (Landing Page Maker)</h2>
                  <p className="text-xs text-[#6d7175]">আপনার ক্যাম্পেইন ও প্রমোশনের জন্য কাস্টম ল্যান্ডিং পেজ তৈরি করুন (যেমন: `#landing/summer-special`)</p>
                </div>
                <button
                  onClick={() => {
                    setEditingLandingId(null);
                    setLandingForm({
                      id: '',
                      slug: 'summer-special-' + Math.floor(Math.random() * 1000),
                      title: '',
                      productId: '',
                      bannerImage: '',
                      galleryImages: [] as string[],
                      headline: '',
                      subheadline: 'শহরের সেরা আরামদায়ক ও প্রিমিয়াম কোয়ালিটি পাঞ্জাবি। সীমিত সময়ের জন্য বিশেষ অফার!',
                      badgeText: '☀️ SUMMER COTTON SPECIAL',
                      discountPrice: 0,
                      featuresText: '১০০% প্রিমিয়াম সুতি কাপড়\nঅরিজিনাল এম্ব্রয়ডারি ডিজাইন\nক্যাশ অন ডেলিভারি সুবিধা\nসারা দেশে দ্রুত হোম ডেলিভারি',
                      isActive: true,
                      sizes: [] as string[],
                    });
                    setIsLandingModalOpen(true);
                  }}
                  className="bg-black hover:bg-neutral-800 text-white font-bold text-xs px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" /> নতুন ল্যান্ডিং পেজ তৈরি করুন
                </button>
              </div>

              {/* Landing Pages List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {landingPages.map(page => {
                  const linkedProd = products.find(p => p.id === page.productId);
                  
                  // Safe copy for URL encoding (strip excessively large base64 images to avoid 414 errors)
                  const urlSafePage = {
                    ...page,
                    bannerImage: (page.bannerImage && page.bannerImage.startsWith('data:') && page.bannerImage.length > 25000) 
                      ? '' 
                      : page.bannerImage,
                    galleryImages: (page.galleryImages || []).map(img => 
                      (img && img.startsWith('data:') && img.length > 25000) ? '' : img
                    ).filter(Boolean)
                  };

                  const domain = window.location.origin && !window.location.origin.includes('localhost') ? window.location.origin : 'https://elhambd.shop';
                  const landingUrl = `${domain}/landing/${page.slug}`;
                  const newTabUrl = landingUrl;

                  return (
                    <div key={page.id} className="bg-white border border-[#e1e3e5] rounded-xl p-5 shadow-sm flex flex-col justify-between space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {page.badgeText}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${page.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                            {page.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-base text-gray-900">{page.title}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{page.subheadline}</p>
                        
                        <div className="text-xs bg-gray-50 p-2 rounded border border-gray-200 flex items-center justify-between">
                          <span className="font-mono text-[11px] text-blue-600 truncate mr-2">#landing/{page.slug}</span>
                          <button
                            onClick={() => {
                              const copyText = `🎁 ${page.title}\n🔗 লিংক: ${landingUrl}\n🛒 অর্ডার করতে ভিজিট করুন: ${domain}`;
                              navigator.clipboard.writeText(copyText);
                              setSuccessModal({
                                isOpen: true,
                                title: "লিংক ও নাম কপি হয়েছে",
                                description: "প্রোডাক্টের নাম সহ ল্যান্ডিং পেজের লিংক ক্লিপবোর্ডে কপি করা হয়েছে!"
                              });
                            }}
                            className="bg-white border border-gray-300 hover:bg-gray-100 px-2 py-1 rounded text-[11px] font-semibold text-gray-700 shrink-0 cursor-pointer"
                          >
                            কপি লিংক
                          </button>
                        </div>
                        {linkedProd && (
                          <div className="text-xs text-gray-500 flex items-center gap-2 pt-1">
                            <span className="font-semibold text-gray-700">সংযুক্ত পণ্য:</span> {linkedProd.title} (৳{page.discountPrice || linkedProd.price})
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => {
                            window.location.hash = `#landing/${page.slug}`;
                            window.dispatchEvent(new HashChangeEvent('hashchange'));
                          }}
                          className="flex-1 bg-amber-500 hover:bg-amber-600 text-white py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                          title="এই উইন্ডোতে ইনস্ট্যান্টলি ল্যান্ডিং পেজ প্রিভিউ দেখুন"
                        >
                          👁️ এই উইন্ডোতে প্রিভিউ
                        </button>
                        <button
                          onClick={() => {
                            const domain = window.location.origin;
                            const tabUrl = `${domain}/#landing/${page.slug}`;
                            window.open(tabUrl, '_blank');
                          }}
                          className="bg-neutral-900 hover:bg-neutral-800 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          title="নতুন ট্যাবে প্রিভিউ দেখুন"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> ট্যাবে
                        </button>
                        <button
                          onClick={() => {
                            setEditingLandingId(page.id);
                            setLandingForm({
                              id: page.id,
                              slug: page.slug,
                              title: page.title,
                              productId: page.productId,
                              bannerImage: page.bannerImage,
                              galleryImages: page.galleryImages || [],
                              headline: page.headline,
                              subheadline: page.subheadline,
                              badgeText: page.badgeText,
                              discountPrice: page.discountPrice || 999,
                              featuresText: page.features.join('\n'),
                              isActive: page.isActive,
                              sizes: page.sizes || linkedProd?.sizes || ['38', '40', '42', '44', '46'],
                            });
                            setIsLandingModalOpen(true);
                          }}
                          className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-700 cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setConfirmModal({
                              isOpen: true,
                              title: 'ল্যান্ডিং পেজ ডিলিট করুন',
                              description: `আপনি কি নিশ্চিত যে "${page.title}" ল্যান্ডিং পেজটি ডিলিট করতে চান?`,
                              onConfirm: () => {
                                deleteLandingPage(page.id);
                              }
                            });
                          }}
                          className="p-1.5 border border-red-200 bg-red-50 rounded hover:bg-red-100 text-red-600 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Landing Page Create/Edit Modal */}
              {isLandingModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4 animate-scale-up">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {editingLandingId ? 'ল্যান্ডিং পেজ এডিট করুন' : 'নতুন ল্যান্ডিং পেজ তৈরি করুন'}
                      </h3>
                      <button onClick={() => setIsLandingModalOpen(false)} className="text-gray-400 hover:text-black">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const landingData: LandingPage = {
                        id: editingLandingId || crypto.randomUUID(),
                        slug: landingForm.slug.trim().toLowerCase().replace(/\s+/g, '-'),
                        title: landingForm.title,
                        productId: landingForm.productId,
                        bannerImage: landingForm.bannerImage || products[0]?.image || '',
                        galleryImages: landingForm.galleryImages || [],
                        headline: landingForm.headline,
                        subheadline: landingForm.subheadline,
                        badgeText: landingForm.badgeText,
                        discountPrice: Number(landingForm.discountPrice),
                        features: landingForm.featuresText.split('\n').filter(Boolean),
                        isActive: landingForm.isActive,
                        createdAt: new Date().toISOString(),
                        sizes: landingForm.sizes
                      };
                      if (editingLandingId) {
                        updateLandingPage(landingData);
                      } else {
                        addLandingPage(landingData);
                      }
                      setIsLandingModalOpen(false);
                      setSuccessModal({
                        isOpen: true,
                        title: "ল্যান্ডিং পেজ সেভ হয়েছে",
                        description: "ল্যান্ডিং পেজ সফলভাবে সংরক্ষিত হয়েছে!"
                      });
                    }} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">পেজ টাইটেল (Title)</label>
                          <input
                            required
                            type="text"
                            value={landingForm.title}
                            onChange={(e) => setLandingForm({ ...landingForm, title: e.target.value })}
                            placeholder="যেমন: Summer Cotton Special Offer"
                            className="w-full border rounded px-3 py-2 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">ইউআরএল স্লাগ (Slug - যেমন: summer-special)</label>
                          <input
                            required
                            type="text"
                            value={landingForm.slug}
                            onChange={(e) => setLandingForm({ ...landingForm, slug: e.target.value })}
                            placeholder="summer-special"
                            className="w-full border rounded px-3 py-2 bg-white font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">সংযুক্ত পণ্য (Featured Product)</label>
                          <select
                            required
                            value={landingForm.productId}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              const selectedProd = products.find(p => p.id === selectedId);
                              if (selectedProd) {
                                setLandingForm({
                                  ...landingForm,
                                  productId: selectedId,
                                  bannerImage: selectedProd.image || '',
                                  galleryImages: selectedProd.gallery || [],
                                  sizes: selectedProd.sizes || ['38', '40', '42', '44', '46'],
                                  discountPrice: selectedProd.price - 200 > 0 ? selectedProd.price - 200 : selectedProd.price,
                                  headline: selectedProd.title,
                                  title: selectedProd.title + ' Special Offer'
                                });
                              } else {
                                setLandingForm({ ...landingForm, productId: selectedId });
                              }
                            }}
                            className="w-full border rounded px-3 py-2 bg-white"
                          >
                            <option value="">-- একটি পণ্য নির্বাচন করুন --</option>
                            {Object.entries(
                              products.reduce((acc, p) => {
                                const cat = p.category || 'অন্যান্য';
                                if (!acc[cat]) acc[cat] = [];
                                acc[cat].push(p);
                                return acc;
                              }, {} as Record<string, typeof products>)
                            ).map(([catName, catProducts]) => (
                              <optgroup key={catName} label={catName}>
                                {catProducts.map(p => (
                                  <option key={p.id} value={p.id}>{p.title} (৳{p.price})</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block font-bold text-gray-700 mb-1">অফার ডিসকাউন্ট দাম (Offer Price in BDT)</label>
                          <input
                            required
                            type="number"
                            value={landingForm.discountPrice || ''}
                            onChange={(e) => setLandingForm({ ...landingForm, discountPrice: Number(e.target.value) })}
                            className="w-full border rounded px-3 py-2 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">ব্যাজ টেক্সট (Badge Text)</label>
                        <input
                          type="text"
                          value={landingForm.badgeText}
                          onChange={(e) => setLandingForm({ ...landingForm, badgeText: e.target.value })}
                          placeholder="☀️ SUMMER COTTON SPECIAL"
                          className="w-full border rounded px-3 py-2 bg-white"
                        />
                      </div>

                      {/* Main Banner Image URL & Device File Upload */}
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">প্রধান ব্যানার ছবি (Banner Image)</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={landingForm.bannerImage}
                            onChange={(e) => setLandingForm({ ...landingForm, bannerImage: e.target.value })}
                            placeholder="https://... অথবা ডিভাইস থেকে আপলোড করুন"
                            className="flex-1 border rounded px-3 py-2 bg-white"
                          />
                          <label className="bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 px-3 py-2 rounded font-bold cursor-pointer text-center shrink-0 flex items-center justify-center">
                            📁 আপলোড
                            <input 
                              type="file" 
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  compressImage(file).then(res => setLandingForm(prev => ({ ...prev, bannerImage: res })));
                                }
                              }}
                            />
                          </label>
                        </div>
                        {landingForm.bannerImage && (
                          <div className="mt-2 w-20 h-20 rounded border overflow-hidden">
                            <img src={landingForm.bannerImage} alt="Banner Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>

                      {/* Multi-Photo Gallery Upload Section (5-10+ Photos Support) */}
                      <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-200/80 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block font-bold text-gray-900">
                            🖼️ পাঞ্জাবির গ্যালারি ছবিসমূহ ({landingForm.galleryImages?.length || 0} টি ছবি)
                          </label>
                          <label className="bg-neutral-900 hover:bg-black text-white text-[11px] font-bold px-3 py-1 rounded-lg cursor-pointer flex items-center gap-1">
                            ➕ একাধিক ছবি আপলোড
                            <input 
                              type="file" 
                              accept="image/*"
                              multiple
                              className="hidden"
                              onChange={(e) => {
                                const files = Array.from(e.target.files || []);
                                files.forEach((file: File) => {
                                  compressImage(file).then(res => setLandingForm(prev => ({ ...prev, galleryImages: [...(prev.galleryImages || []), res] })));
                                });
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-[11px] text-gray-600">
                          ডিভাইস থেকে ৫টি বা ১০টি ছবি এক সাথে সিলেক্ট করে আপলোড করতে পারবেন।
                        </p>
                        
                        {/* Gallery Thumbnails List */}
                        {landingForm.galleryImages && landingForm.galleryImages.length > 0 && (
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-2">
                            {landingForm.galleryImages.map((img, idx) => (
                              <div key={idx} className="relative aspect-square rounded-lg border overflow-hidden group bg-white shadow-xs">
                                <img src={img} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setLandingForm(prev => ({
                                      ...prev,
                                      galleryImages: prev.galleryImages.filter((_, i) => i !== idx)
                                    }));
                                  }}
                                  className="absolute top-0.5 right-0.5 bg-red-600 text-white rounded-full p-0.5 text-[9px] hover:bg-red-700 font-bold"
                                  title="Delete photo"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">হেডলাইন (Headline)</label>
                        <input
                          type="text"
                          value={landingForm.headline}
                          onChange={(e) => setLandingForm({ ...landingForm, headline: e.target.value })}
                          placeholder="এক্সক্লুসিভ সামার কটন কালেকশন"
                          className="w-full border rounded px-3 py-2 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">সাবহেডলাইন / বিবরণ (Subheadline)</label>
                        <textarea
                          rows={2}
                          value={landingForm.subheadline}
                          onChange={(e) => setLandingForm({ ...landingForm, subheadline: e.target.value })}
                          className="w-full border rounded px-3 py-2 bg-white resize-none"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">ফিচার পয়েন্টসমূহ (প্রতি লাইনে একটি করে)</label>
                        <textarea
                          rows={4}
                          value={landingForm.featuresText}
                          onChange={(e) => setLandingForm({ ...landingForm, featuresText: e.target.value })}
                          className="w-full border rounded px-3 py-2 bg-white resize-none"
                        />
                      </div>

                      {/* Size Management Section */}
                      <div className="bg-white border border-[#e1e3e5] rounded-lg p-4 shadow-sm space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="text-sm font-semibold text-[#202223]">
                            Available Sizes (সাইজ ম্যানেজমেন্ট)
                          </h3>
                          <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-extrabold">
                            {(landingForm.sizes || []).length} টি সাইজ চালু
                          </span>
                        </div>

                        {/* Common Size Toggles */}
                        <div>
                          <label className="text-xs text-gray-600 font-medium block mb-1.5">কমন সাইজ টগল করুন:</label>
                          <div className="flex flex-wrap gap-1.5">
                            {['38', '40', '42', '44', '46', '48', '50', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => {
                              const isChecked = (landingForm.sizes || []).includes(sz);
                              return (
                                <button
                                  key={sz}
                                  type="button"
                                  onClick={() => {
                                    const currentSizes = landingForm.sizes || [];
                                    if (isChecked) {
                                      setLandingForm({ ...landingForm, sizes: currentSizes.filter(s => s !== sz) });
                                    } else {
                                      setLandingForm({ ...landingForm, sizes: [...currentSizes, sz] });
                                    }
                                  }}
                                  className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer border ${
                                    isChecked 
                                      ? 'bg-neutral-900 text-white border-black shadow-xs' 
                                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                  }`}
                                >
                                  {isChecked ? `✓ ${sz}` : `+ ${sz}`}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Active Sizes Badges */}
                        {landingForm.sizes && landingForm.sizes.length > 0 && (
                          <div className="pt-2 border-t border-gray-100">
                            <label className="text-xs text-gray-500 font-medium block mb-1.5">এক্টিভ সাইজসমূহ:</label>
                            <div className="flex flex-wrap gap-1.5">
                              {landingForm.sizes.map(sz => (
                                <span key={sz} className="bg-amber-50 text-amber-900 border border-amber-300 font-extrabold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1">
                                  {sz}
                                  <button
                                    type="button"
                                    onClick={() => setLandingForm({ ...landingForm, sizes: (landingForm.sizes || []).filter(s => s !== sz) })}
                                    className="hover:text-red-600 font-black ml-1 cursor-pointer"
                                    title="রিমুভ করুন"
                                  >
                                    ×
                                  </button>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Custom Size Input */}
                        <div className="flex gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="কাস্টম সাইজ (যেমন: 36, 52 বা Free)..."
                            value={landingCustomSizeInput}
                            onChange={(e) => setLandingCustomSizeInput(e.target.value)}
                            className="flex-1 border border-[#c9cccf] rounded-md px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-[#005bd3] bg-white"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                const currentSizes = landingForm.sizes || [];
                                if (landingCustomSizeInput.trim() && !currentSizes.includes(landingCustomSizeInput.trim())) {
                                  setLandingForm({ ...landingForm, sizes: [...currentSizes, landingCustomSizeInput.trim()] });
                                  setLandingCustomSizeInput('');
                                }
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const currentSizes = landingForm.sizes || [];
                              if (landingCustomSizeInput.trim() && !currentSizes.includes(landingCustomSizeInput.trim())) {
                                setLandingForm({ ...landingForm, sizes: [...currentSizes, landingCustomSizeInput.trim()] });
                                setLandingCustomSizeInput('');
                              }
                            }}
                            className="bg-black hover:bg-neutral-800 text-white font-bold px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                          >
                            + যোগ করুন
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-2">
                        <input
                          type="checkbox"
                          id="landingActive"
                          checked={landingForm.isActive}
                          onChange={(e) => setLandingForm({ ...landingForm, isActive: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                        <label htmlFor="landingActive" className="font-semibold text-gray-800">এই ল্যান্ডিং পেজটি অ্যাক্টিভ রাখুন</label>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                          type="button"
                          onClick={() => setIsLandingModalOpen(false)}
                          className="px-4 py-2 border rounded text-gray-700 font-semibold hover:bg-gray-50"
                        >
                          বাতিল
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-black text-white rounded font-bold hover:bg-neutral-800"
                        >
                          সংরক্ষণ করুন
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === "incomplete" ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 border border-[#e1e3e5] rounded-xl shadow-xs">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span>⚠️ অসম্পূর্ণ অর্ডার ট্র্যাকিং (Incomplete Orders)</span>
                    <span className="bg-rose-100 text-rose-800 text-xs font-black px-2.5 py-1 rounded-full animate-pulse">
                      {incompleteOrders.length} টি ড্রাফট
                    </span>
                  </h2>
                  <p className="text-xs text-[#6d7175] mt-1">
                    কাস্টমাররা অর্ডার ফর্ম পূরণ শুরু করলেও কোনো কারণে শেষ করেননি। আপনি চাইলে ফোন করে অর্ডারটি নিজে কনফার্ম করতে পারেন।
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 border border-[#e1e3e5] rounded-xl shadow-xs">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">মোট অসম্পূর্ণ কাস্টমার</p>
                  <p className="text-2xl font-black text-rose-950 mt-1">{incompleteOrders.length} জন</p>
                </div>
                <div className="bg-white p-5 border border-[#e1e3e5] rounded-xl shadow-xs">
                  <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">সম্ভavy উদ্ধারযোগ্য বিক্রয় মূল্য</p>
                  <p className="text-2xl font-black text-emerald-950 mt-1">
                    ৳ {incompleteOrders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString("en-BD")}
                  </p>
                </div>
              </div>

              {/* Table / List card */}
              <div className="bg-white border border-[#e1e3e5] rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[#e1e3e5] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="নাম বা মোবাইল নম্বর দিয়ে খুঁজুন..."
                      value={incompleteSearchQuery}
                      onChange={(e) => setIncompleteSearchQuery(e.target.value)}
                      className="w-full bg-[#f8f9fa] border border-[#d1d3d6] rounded-lg py-2 pl-9 pr-4 text-xs font-medium focus:ring-1 focus:ring-black outline-none"
                    />
                  </div>
                </div>

                {incompleteOrders.length === 0 ? (
                  <div className="p-12 text-center text-gray-500">
                    <p className="text-sm font-semibold">কোনো অসম্পূর্ণ বা পরিত্যক্ত অর্ডার পাওয়া যায়নি।</p>
                    <p className="text-xs text-gray-400 mt-1">কাস্টমার যখন ল্যান্ডিং পেজে তথ্য টাইপ করা শুরু করবেন, এখানে স্বয়ংক্রিয়ভাবে দেখাবে।</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#f6f6f7] text-[#454f5b] border-b border-[#e1e3e5]">
                          <th className="px-4 py-3 font-bold">তারিখ ও সময়</th>
                          <th className="px-4 py-3 font-bold">কাস্টমারের তথ্য</th>
                          <th className="px-4 py-3 font-bold">অর্ডারকৃত পণ্য ও সাইজ</th>
                          <th className="px-4 py-3 font-bold">সম্ভাব্য মূল্য</th>
                          <th className="px-4 py-3 font-bold text-right">পদক্ষেপ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e1e3e5]">
                        {incompleteOrders
                          .filter(order => {
                            if (!incompleteSearchQuery.trim()) return true;
                            const query = incompleteSearchQuery.toLowerCase();
                            const name = (order.customer?.name || '').toLowerCase();
                            const phone = (order.customer?.phone || '').toLowerCase();
                            return name.includes(query) || phone.includes(query);
                          })
                          .map((order) => {
                            const dateStr = new Date(order.date).toLocaleString('bn-BD', {
                              year: 'numeric', month: 'long', day: 'numeric',
                              hour: '2-digit', minute: '2-digit'
                            });
                            
                            // Calculate previous orders for the same customer phone
                            const phoneClean = order.customer?.phone ? order.customer.phone.replace(/\D/g, '') : '';
                            const customerOrdersList = orders.filter(
                              (o) => o.customer?.phone && o.customer.phone.replace(/\D/g, '') === phoneClean,
                            );
                            const samePhoneCount = customerOrdersList.length;
                            const deliveredCount = customerOrdersList.filter(o => o.status === 'delivered').length;
                            const cancelledCount = customerOrdersList.filter(o => o.status === 'cancelled').length;

                            return (
                              <tr key={order.id} className="hover:bg-[#f8f9fa] transition-colors">
                                <td className="px-4 py-4 font-semibold text-gray-600 align-top whitespace-nowrap leading-relaxed">
                                  {dateStr}
                                </td>
                                <td className="px-4 py-4 align-top max-w-[200px]">
                                  <div className="font-bold text-gray-900">{order.customer?.name || 'কাস্টমার'}</div>
                                  <div className="text-gray-500 font-mono mt-0.5">{order.customer?.phone || 'N/A'}</div>
                                  <div className="text-[11px] text-gray-600 mt-1 leading-relaxed bg-neutral-50 p-1.5 rounded border border-gray-100">
                                    {order.customer?.address || 'ঠিকানা দেওয়া নেই'}{order.customer?.city ? `, ${order.customer.city}` : ''}
                                  </div>
                                  
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    <span className="bg-[#d1f4e0] text-[#007f5f] text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      ডেলিভারি: {deliveredCount}
                                    </span>
                                    <span className="bg-[#ffea8a] text-[#8a6116] text-[9px] font-bold px-1.5 py-0.5 rounded">
                                      বাতিল: {cancelledCount}
                                    </span>
                                  </div>
                                  <CourierSuccessRate phone={order.customer?.phone || ''} />
                                </td>
                                <td className="px-4 py-4 align-top max-w-[220px]">
                                  <div className="space-y-1">
                                    {(order.items || []).map((item, i) => {
                                      const prod = products.find(p => p.id === item.productId);
                                      const displayImg = item.selectedImage || prod?.image;
                                      return (
                                        <div key={i} className="flex items-start gap-2 bg-neutral-50 p-1 rounded border border-gray-100">
                                          {displayImg && (
                                            <img
                                              src={displayImg}
                                              alt={prod?.title || item.productId}
                                              referrerPolicy="no-referrer"
                                              className="w-8 h-10 rounded object-cover shrink-0 border border-amber-500 ring-1 ring-amber-100"
                                            />
                                          )}
                                          <div>
                                            <div className="font-bold text-gray-800 text-[10px] line-clamp-1">{prod?.title || item.productId}</div>
                                            <div className="text-[10px] text-gray-500 font-semibold leading-tight">
                                              সাইজ: {item.size || 'N/A'} | পরিমাণ: {item.quantity} টি
                                            </div>
                                            {item.productCode && (
                                              <div className="text-[8px] text-amber-800 font-bold bg-amber-50 px-1 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                                                🎯 {item.productCode}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </td>
                                <td className="px-4 py-4 align-top font-bold text-gray-900 whitespace-nowrap text-sm">
                                  ৳ {order.total.toLocaleString("en-BD")}
                                </td>
                                <td className="px-4 py-4 align-top text-right whitespace-nowrap space-y-1.5">
                                  <div className="flex items-center justify-end gap-1">
                                    <a
                                      href={`tel:${order.customer?.phone || ''}`}
                                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                                    >
                                      📞 কল দিন
                                    </a>
                                    {order.customer?.phone && (
                                      <a
                                        href={`https://wa.me/88${order.customer.phone.replace(/[^0-9]/g, '')}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-2 py-1 rounded inline-flex items-center gap-1 cursor-pointer transition-colors"
                                      >
                                        WhatsApp 💬
                                      </a>
                                    )}
                                  </div>
                                  <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
                                    {/* Confirm Order Button */}
                                    {confirmingPlaceId === order.id ? (
                                      <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 p-1 rounded-md shrink-0">
                                        <span className="text-[10px] text-emerald-800 font-bold px-1">কনফার্ম?</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            placeOrder({
                                              customer: order.customer,
                                              items: order.items,
                                              total: order.total,
                                              paymentMethod: order.paymentMethod
                                            });
                                            deleteIncompleteOrder(order.id);
                                            setConfirmingPlaceId(null);
                                          }}
                                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1 rounded cursor-pointer shrink-0 transition-colors shadow-xs"
                                        >
                                          হ্যাঁ ✅
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConfirmingPlaceId(null)}
                                          className="bg-gray-400 hover:bg-gray-500 text-white font-bold text-xs px-2 py-1 rounded cursor-pointer shrink-0 transition-colors"
                                        >
                                          না
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setConfirmingPlaceId(order.id);
                                          setConfirmingDeleteId(null); // Close delete confirmation if open
                                        }}
                                        className="bg-neutral-900 hover:bg-neutral-800 text-white font-bold px-3 py-1.5 rounded-md text-xs cursor-pointer transition-all border border-neutral-950 shadow-xs shrink-0"
                                      >
                                        অর্ডার কনফার্ম করুন ✅
                                      </button>
                                    )}

                                    {/* Delete Button */}
                                    {confirmingDeleteId === order.id ? (
                                      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1 rounded-md shrink-0">
                                        <span className="text-[10px] text-rose-800 font-bold px-1">মুছবেন?</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            deleteIncompleteOrder(order.id);
                                            setConfirmingDeleteId(null);
                                          }}
                                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-2 py-1 rounded cursor-pointer shrink-0 transition-colors shadow-xs"
                                        >
                                          হ্যাঁ 🗑️
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConfirmingDeleteId(null)}
                                          className="bg-gray-400 hover:bg-gray-500 text-white font-bold text-xs px-2 py-1 rounded cursor-pointer shrink-0 transition-colors"
                                        >
                                          না
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setConfirmingDeleteId(order.id);
                                          setConfirmingPlaceId(null); // Close place confirmation if open
                                        }}
                                        className="text-rose-600 hover:text-white hover:bg-rose-600 font-bold w-8 h-8 rounded-full cursor-pointer flex items-center justify-center border border-rose-200 hover:border-rose-600 transition-all text-sm shrink-0 shadow-2xs"
                                        title="ড্রাফট মুছুন"
                                      >
                                        ✕
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === "admin_settings" ? (
            <div className="space-y-6 max-w-lg bg-white border border-[#e1e3e5] rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-[#e1e3e5] pb-4 mb-4">
                <div className="w-10 h-10 bg-[#eef4ff] rounded-lg flex items-center justify-center text-[#005bd3]">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#202223]">Admin Security Settings</h2>
                  <p className="text-xs text-[#6d7175]">Change your admin portal login credentials</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#202223] mb-1">Admin Username</label>
                  <input
                    type="text"
                    value={newAdminUser}
                    onChange={(e) => setNewAdminUser(e.target.value)}
                    placeholder="Enter Admin Username"
                    className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none font-medium bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#202223] mb-1">New Password</label>
                  <input
                    type="password"
                    value={newAdminPass}
                    onChange={(e) => setNewAdminPass(e.target.value)}
                    placeholder="Enter New Password"
                    className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none font-medium bg-white"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (!newAdminUser.trim() || !newAdminPass.trim()) {
                        setSuccessModal({
                          isOpen: true,
                          title: "ভুল ইনপুট",
                          description: "ইউজারনেম এবং পাসওয়ার্ড খালি রাখা যাবে না।"
                        });
                        return;
                      }
                      setAdminUsername(newAdminUser);
                      setAdminPassword(newAdminPass);
                      setSuccessModal({
                        isOpen: true,
                        title: "তথ্য সংরক্ষিত হয়েছে!",
                        description: `অ্যাডমিন ইউজারনেম এবং পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে।\n\nনতুন ইউজারনেম: ${newAdminUser}\nনতুন পাসওয়ার্ড: ${newAdminPass}`
                      });
                    }}
                    className="bg-[#005bd3] text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-[#004bb4] transition-colors shadow-sm cursor-pointer"
                  >
                    Save Security Credentials
                  </button>
                </div>
              </div>
            </div>
          ) : activeTab === "deployment" ? (
            <div className="space-y-6 max-w-4xl">
              {/* Top Hero Card for Namecheap & cPanel Deployment */}
              <div className="bg-gradient-to-r from-[#111827] via-[#1f2937] to-[#0f172a] rounded-2xl p-8 text-white shadow-lg border border-[#374151]">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Namecheap & cPanel Ready (LIK DAO)
                    </div>
                    <h2 className="text-2xl font-black tracking-tight">
                      Namecheap & cPanel Deployment ZIP Package
                    </h2>
                    <p className="text-gray-300 text-sm max-w-xl leading-relaxed">
                      এক ক্লিকেই ডাউনলোড করুন সম্পূর্ণ রেডিমেড হোস্টিং জিপ ফাইল। এতে রয়েছে Namecheap, cPanel, Node.js এবং Static (public_html) হোস্টিংয়ের জন্য প্রয়োজনীয় সমস্ত কনফিগারেশন, <code className="bg-white/10 px-1.5 py-0.5 rounded text-emerald-300">.htaccess</code>, এবং বাংলা ও ইংরেজি দিকনির্দেশনা ফাইল।
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 w-full md:w-auto">
                    <a
                      href="/api/download-package"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5 text-sm whitespace-nowrap cursor-pointer"
                    >
                      <Download className="w-5 h-5" />
                      Download ZIP Package (LIK DAO)
                    </a>
                    <a
                      href="/namecheap-ready.zip"
                      download="ElhamShop-Namecheap-cPanel-Deployment-Package.zip"
                      className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-gray-200 font-medium rounded-xl border border-white/20 transition-colors text-xs whitespace-nowrap cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Alternative Direct Link
                    </a>
                  </div>
                </div>
              </div>

              {/* Step-by-step Bangla Deployment Instructions Card */}
              <div className="bg-white border border-[#e1e3e5] rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 border-b border-[#e1e3e5] pb-4 mb-6">
                  <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#202223]">কিভাবে Namecheap হোস্টিংয়ে ডিপ্লয় করবেন? (সহজ গাইড)</h3>
                    <p className="text-xs text-[#6d7175]">Step-by-step Bangla & English deployment guide for Namecheap / cPanel</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Method 1: Static Hosting */}
                  <div className="border border-emerald-100 bg-emerald-50/40 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-md">পদ্ধতি ১: সবচেয়ে সহজ</span>
                      <span className="text-xs text-emerald-700 font-semibold">Standard cPanel (public_html)</span>
                    </div>
                    <h4 className="font-bold text-[#202223] text-sm">স্ট্যাটিক ও ফাস্ট লোডিং হোস্টিং</h4>
                    <ol className="text-xs text-[#4a4d52] space-y-2 list-decimal list-inside leading-relaxed">
                      <li>উপরের <strong className="text-emerald-700">Download ZIP Package</strong> বাটনে ক্লিক করে জিপ ফাইল ডাউনলোড করুন।</li>
                      <li>আপনার পিসিতে জিপটি আনজিপ করে টার্মিনাল বা কমান্ড প্রম্পটে লিখুন: <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono">npm install &amp;&amp; npm run build</code></li>
                      <li>এরপর তৈরি হওয়া <strong className="text-gray-800">dist</strong> ফোল্ডারের সব ফাইল এবং <strong className="text-gray-800">.htaccess</strong> ফাইলটি আপনার Namecheap cPanel-এর <strong className="text-gray-800">public_html</strong> ফোল্ডারে আপলোড করুন।</li>
                      <li>ব্যস! আপনার ওয়েবসাইট লাইভ। যেকোনো পেজে রিফ্রেশ দিলেও আর 404 Error আসবে না।</li>
                    </ol>
                  </div>

                  {/* Method 2: Node.js Selector */}
                  <div className="border border-blue-100 bg-blue-50/40 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-[#005bd3] text-white text-xs font-bold rounded-md">পদ্ধতি ২: Full-Stack</span>
                      <span className="text-xs text-blue-700 font-semibold">cPanel Node.js Selector</span>
                    </div>
                    <h4 className="font-bold text-[#202223] text-sm">Node.js ও API সার্ভারসহ হোস্টিং</h4>
                    <ol className="text-xs text-[#4a4d52] space-y-2 list-decimal list-inside leading-relaxed">
                      <li>cPanel থেকে <strong className="text-blue-700">Setup Node.js App</strong> অপশনে যান।</li>
                      <li>Create Application এ ক্লিক করে Node.js 18 বা 20 সিলেক্ট করুন।</li>
                      <li>Application Startup File হিসেবে লিখুন: <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono">app.js</code> বা <code className="bg-gray-200 px-1.5 py-0.5 rounded font-mono">server.ts</code></li>
                      <li>ডাউনলোড করা এই জিপ ফাইলটি অ্যাপ ফোল্ডারে আপলোড করে Extract করুন।</li>
                      <li>cPanel প্যানেল থেকে <strong className="text-blue-700">Run NPM Install</strong> বাটনে ক্লিক করে <strong className="text-blue-700">Restart</strong> দিন।</li>
                    </ol>
                  </div>
                </div>

                {/* What's included in ZIP card */}
                <div className="mt-6 pt-6 border-t border-[#e1e3e5]">
                  <h4 className="text-xs font-bold text-[#202223] uppercase tracking-wider mb-3">এই জিপ প্যাকেজে যা যা অন্তর্ভুক্ত রয়েছে:</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#4a4d52]">
                    <div className="flex items-center gap-2 bg-[#f4f6f8] px-3 py-2 rounded-lg border border-[#e1e3e5]">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span><strong>.htaccess</strong> (404 Fix)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#f4f6f8] px-3 py-2 rounded-lg border border-[#e1e3e5]">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span><strong>app.js</strong> (Node Startup)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#f4f6f8] px-3 py-2 rounded-lg border border-[#e1e3e5]">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span><strong>README_BN.txt</strong> (বাংলা গাইড)</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#f4f6f8] px-3 py-2 rounded-lg border border-[#e1e3e5]">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span><strong>Full Source Code</strong> (Ready)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#e1e3e5] rounded-lg p-8 flex flex-col items-center text-center shadow-sm">
              <div className="w-16 h-16 bg-[#f4f6f8] rounded-full flex items-center justify-center mb-4">
                <ExternalLink className="w-8 h-8 text-[#8c9196]" />
              </div>
              <h4 className="text-[#202223] font-medium mb-1">Coming Soon</h4>
              <p className="text-[#6d7175] text-sm">
                This section is currently under development.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* SteadFast Consignment Entry & Voucher Modal */}
      {selectedOrderForCourier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => {
              setSelectedOrderForCourier(null);
              setCreatedConsignment(null);
            }}
          ></div>
          <div className="relative bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl flex flex-col transition-all transform scale-100">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-[#e1e3e5] flex justify-between items-center sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#1e8556] rounded-lg flex items-center justify-center text-white font-black text-sm">
                  SF
                </div>
                <div>
                  <h2 className="text-xs font-extrabold text-[#202223] uppercase tracking-wider">
                    SteadFast Courier Delivery
                  </h2>
                  <p className="text-[10px] text-[#6d7175]">
                    {createdConsignment ? "Consignment Invoice / Slip" : "New Consignment Entry Form"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedOrderForCourier(null);
                  setCreatedConsignment(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            {!createdConsignment ? (
              /* Entry Form */
              <div className="p-6 space-y-4">
                <div className="bg-[#fcfcfc] border border-[#e1e3e5] rounded-lg p-4 space-y-3">
                  <div className="flex justify-between text-xs border-b border-gray-100 pb-2">
                    <span className="text-[#6d7175]">Order ID:</span>
                    <span className="font-bold text-[#202223]">#{selectedOrderForCourier.id.slice(0, 8)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#6d7175]">Order Total:</span>
                    <span className="font-bold text-[#1e8556]">৳ {selectedOrderForCourier.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#202223] mb-1">
                      Recipient Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={consignmentForm.name}
                      onChange={(e) => setConsignmentForm({ ...consignmentForm, name: e.target.value })}
                      className="w-full border border-[#c9cccf] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#202223] mb-1">
                      Recipient Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={consignmentForm.phone}
                      onChange={(e) => setConsignmentForm({ ...consignmentForm, phone: e.target.value })}
                      className="w-full border border-[#c9cccf] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#202223] mb-1">
                      Full Delivery Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={consignmentForm.address}
                      onChange={(e) => setConsignmentForm({ ...consignmentForm, address: e.target.value })}
                      className="w-full border border-[#c9cccf] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#202223] mb-1">
                        Cash on Delivery (COD) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={consignmentForm.cod}
                        onChange={(e) => setConsignmentForm({ ...consignmentForm, cod: Number(e.target.value) })}
                        className="w-full border border-[#c9cccf] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#202223] mb-1">
                        Delivery Hub / Region
                      </label>
                      <input
                        type="text"
                        disabled
                        value="Automated Routing"
                        className="w-full bg-gray-50 border border-[#e1e3e5] text-gray-400 rounded-lg px-3 py-2 text-xs cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#202223] mb-1">
                      Delivery Note / Package Contents
                    </label>
                    <textarea
                      rows={2}
                      value={consignmentForm.note}
                      onChange={(e) => setConsignmentForm({ ...consignmentForm, note: e.target.value })}
                      className="w-full border border-[#c9cccf] rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none"
                    />
                  </div>
                </div>

                {consignmentError && (
                  <div className="text-red-600 font-bold text-xs bg-red-50 border border-red-200 px-3 py-2 rounded-lg text-left">
                    ⚠️ {consignmentError}
                  </div>
                )}

                <div className="pt-4 flex gap-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderForCourier(null);
                    }}
                    className="flex-1 bg-white border border-[#c9cccf] text-gray-700 font-bold py-2.5 rounded-lg text-xs hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!consignmentForm.name || !consignmentForm.phone || !consignmentForm.address) {
                        setConsignmentError("দয়া করে সব বাধ্যতামূলক তথ্যগুলো (নাম, মোবাইল নম্বর এবং ঠিকানা) পূরণ করুন!");
                        return;
                      }
                      
                      setConsignmentError(null);
                      // Process delivery entry
                      const res = await sendOrderToCourier(selectedOrderForCourier.id);
                      setCreatedConsignment({
                        trackingId: res.trackingCode || `SF-${Math.floor(100000 + Math.random() * 900000)}`,
                        orderId: selectedOrderForCourier.id,
                        name: consignmentForm.name,
                        phone: consignmentForm.phone,
                        address: consignmentForm.address,
                        cod: consignmentForm.cod,
                        note: consignmentForm.note,
                        date: new Date().toLocaleString(),
                      });
                    }}
                    className="flex-1 bg-[#1e8556] text-white font-bold py-2.5 rounded-lg text-xs hover:bg-[#155e3c] transition-colors"
                  >
                    Create Entry & Sync
                  </button>
                </div>
              </div>
            ) : (
              /* Success / Consignment Slip Voucher View */
              <div className="p-6 space-y-6">
                
                {/* Success Banner */}
                <div className="flex flex-col items-center text-center space-y-2 bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-green-900">Consignment Registered Successfully!</h3>
                    <p className="text-[10px] text-green-700">Order #{createdConsignment.orderId.slice(0, 8)} is now synced to SteadFast database.</p>
                  </div>
                </div>

                {/* Printable Delivery Slip UI */}
                <div id="steadfast-voucher-slip" className="border-2 border-dashed border-gray-300 rounded-xl p-5 bg-white space-y-4 shadow-sm relative overflow-hidden font-mono text-xs text-gray-800">
                  
                  {/* Decorative background watermarks */}
                  <div className="absolute right-2 top-2 opacity-5 font-black text-7xl select-none uppercase pointer-events-none">
                    SF
                  </div>

                  {/* Voucher Header */}
                  <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                    <div>
                      <h4 className="font-extrabold text-xs text-black tracking-tight">STEADFAST COURIER</h4>
                      <p className="text-[9px] text-gray-500">Next-Day Nationwide Fulfillment</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-black bg-gray-100 px-2 py-0.5 rounded">DELIVERY SLIP</p>
                      <p className="text-[8px] text-gray-500 mt-1">{createdConsignment.date}</p>
                    </div>
                  </div>

                  {/* Simulated Barcode */}
                  <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-100 rounded p-3 space-y-1">
                    <div className="flex items-stretch justify-center h-10 w-full px-4 gap-0.5 max-w-[280px]">
                      {/* Barcode lines */}
                      {[1,3,2,1,4,1,2,3,1,1,2,4,2,1,3,1,2,3,1,4,1,2,1,3,2,1,3,1,4,1,2,3,1,2,4].map((w, idx) => (
                        <div key={idx} className={`h-full ${idx % 2 === 0 ? 'bg-black' : 'bg-transparent'}`} style={{ width: `${w}px` }}></div>
                      ))}
                    </div>
                    <span className="font-mono text-sm font-bold tracking-widest text-black">{createdConsignment.trackingId}</span>
                  </div>

                  {/* Delivery & COD Grid */}
                  <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-100 py-3 text-[11px]">
                    <div className="space-y-1.5">
                      <span className="text-[9px] text-gray-400 block uppercase font-bold">RECIPIENT (TO)</span>
                      <p className="font-extrabold text-black">{createdConsignment.name}</p>
                      <p className="font-bold text-gray-700">{createdConsignment.phone}</p>
                      <p className="text-gray-600 leading-tight">{createdConsignment.address}</p>
                    </div>
                    <div className="space-y-1.5 border-l border-gray-100 pl-4">
                      <span className="text-[9px] text-gray-400 block uppercase font-bold">COD & ORDER INFO</span>
                      <p className="text-sm font-black text-black">৳ {createdConsignment.cod.toLocaleString("en-IN")}</p>
                      <div className="text-[10px] space-y-1 text-gray-600">
                        <p><span className="text-gray-400">Order:</span> #{createdConsignment.orderId.slice(0, 8)}</p>
                        <p><span className="text-gray-400">Date:</span> {createdConsignment.date.split(',')[0]}</p>
                      </div>
                    </div>
                  </div>

                  {/* Note block */}
                  {createdConsignment.note && (
                    <div className="bg-gray-50 p-2 rounded border border-gray-100 text-[10px]">
                      <span className="font-bold text-gray-500 block text-[8px] uppercase">Instructions / Contents</span>
                      <p className="text-gray-700 italic">{createdConsignment.note}</p>
                    </div>
                  )}

                  {/* Footer Terms */}
                  <div className="text-[8px] text-gray-400 leading-tight text-center pt-2">
                    SteadFast Courier Ltd. Please keep this slip for security & reconciliation.
                  </div>
                </div>

                {/* Print/Download Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const printContents = document.getElementById('steadfast-voucher-slip')?.innerHTML;
                      if (printContents) {
                        const printWindow = window.open('', '', 'height=600,width=800');
                        if (printWindow) {
                          printWindow.document.write('<html><head><title>SteadFast Consignment Voucher</title>');
                          printWindow.document.write('<style>body{font-family:monospace;padding:30px;color:#333;} .absolute{display:none;} .flex{display:flex;} .grid{display:grid;grid-template-columns:1fr 1fr;} .border-b{border-bottom:1px solid #ccc;} .border-t{border-top:1px solid #ccc;} .p-3{padding:10px;} .p-5{padding:20px;} .bg-gray-50{background:#f9f9f9;} .border-2{border:2px dashed #000;border-radius:10px;} .text-center{text-align:center;} .font-extrabold{font-weight:bold;} .text-base{font-size:16px;} .text-sm{font-size:14px;} .w-full{width:100%;} .justify-between{justify-content:space-between;} .items-center{align-items:center;} .gap-0\\.5{gap:2px;} .h-full{height:100%;} .h-10{height:40px;} .max-w-px{width:1px;}</style>');
                          printWindow.document.write('</head><body>');
                          printWindow.document.write(printContents);
                          printWindow.document.write('</body></html>');
                          printWindow.document.close();
                          printWindow.print();
                        }
                      }
                    }}
                    className="flex-1 border border-gray-300 text-gray-800 font-bold py-2.5 rounded-lg text-xs hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Print Delivery Slip
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedOrderForCourier(null);
                      setCreatedConsignment(null);
                      setSuccessModal({
                        isOpen: true,
                        title: "ডেলিভারি এন্ট্রি সফল",
                        description: "অর্ডারটি সফলভাবে স্টেডফাস্ট কুরিয়ার সিস্টেমে যুক্ত করা হয়েছে এবং এর শিপমেন্ট শুরু হয়েছে।"
                      });
                    }}
                    className="flex-1 bg-black text-white font-bold py-2.5 rounded-lg text-xs hover:bg-neutral-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    Close & Finish
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generic Success Modal Popup */}
      {successModal && successModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSuccessModal(null)}
          ></div>
          <div className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 flex flex-col items-center text-center transition-all transform scale-100">
            {successModal.isError ? (
              <div className="w-14 h-14 bg-red-50 border border-red-200 rounded-full flex items-center justify-center text-red-600 mb-4 shadow-inner animate-bounce">
                <AlertTriangle className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-14 h-14 bg-green-50 border border-green-200 rounded-full flex items-center justify-center text-[#1e8556] mb-4 shadow-inner">
                <Check className="w-8 h-8" />
              </div>
            )}
            
            <h3 className="text-lg font-bold text-[#202223] mb-2">
              {successModal.title}
            </h3>
            
            <p className="text-xs text-[#6d7175] leading-relaxed mb-4">
              {successModal.description}
            </p>

            {successModal.amount !== undefined && (
              <div className="bg-[#fcfcfc] border border-[#e1e3e5] rounded-lg p-3 w-full mb-4">
                <span className="text-[10px] text-[#6d7175] uppercase font-bold block mb-1">
                  Amount
                </span>
                <span className="text-2xl font-black text-[#1e8556]">
                  ৳ {successModal.amount.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            {successModal.transactionId && (
              <div className="flex justify-between items-center text-[11px] font-mono bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 w-full mb-5">
                <span className="text-gray-400">TXN ID:</span>
                <span className="font-bold text-gray-800">{successModal.transactionId}</span>
              </div>
            )}

            <button
              onClick={() => setSuccessModal(null)}
              className="w-full bg-black text-white hover:bg-neutral-800 py-2.5 rounded-lg text-xs font-bold transition-all shadow-sm"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal && confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setConfirmModal(null)}
          ></div>
          <div className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 flex flex-col transition-all transform scale-100">
            <h3 className="text-base font-bold text-[#202223] mb-2 text-left">
              {confirmModal.title}
            </h3>
            
            <p className="text-xs text-[#6d7175] leading-relaxed mb-6 text-left">
              {confirmModal.description}
            </p>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmModal(null)}
                className="flex-1 bg-gray-100 text-gray-800 hover:bg-gray-200 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                বাতিল করুন
              </button>
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="flex-1 bg-red-600 text-white hover:bg-red-700 py-2 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                নিশ্চিত করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#e1e3e5] flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold text-[#202223]">
                {editingProduct ? "Edit product" : "Add product"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 -mr-2 text-[#6d7175] hover:bg-[#f6f6f7] rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="bg-white border border-[#e1e3e5] rounded-lg p-4 shadow-sm">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#202223] mb-1">
                      Title
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none transition-shadow"
                      placeholder="Short sleeve t-shirt"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#202223] mb-1">
                      Description
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none resize-none transition-shadow"
                    ></textarea>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#e1e3e5] rounded-lg p-5 shadow-sm space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-[#202223] flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-600" /> মিডিয়া ও ছবি সমূহ (Product Media Gallery)
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    এখানে প্রোডাক্টের প্রধান ছবি এবং গ্যালারির জন্য আরও ৫-১০ টি অতিরিক্ত ছবি (যেমন: কালার ভ্যারিয়েন্ট বা ক্লোজআপ শট) যুক্ত করুন।
                  </p>
                </div>

                {/* Primary Cover Image */}
                <div className="space-y-3.5 border-b border-gray-100 pb-5">
                  <span className="text-xs font-bold text-gray-700 block">
                    ১. প্রধান কভার ছবি (Primary Cover Image):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-2">
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById("image-upload-input")?.click()}
                        className={`border-2 border-dashed rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer transition-all ${
                          isDragging
                            ? "border-[#005bd3] bg-[#f4f8fd] text-[#005bd3]"
                            : "border-[#c9cccf] hover:border-[#a0a4a8] bg-[#fafbfb] text-[#6d7175]"
                        }`}
                      >
                        <input
                          type="file"
                          id="image-upload-input"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageFileChange}
                        />
                        
                        <div className="flex flex-col items-center text-center space-y-2">
                          <ImageIcon className={`w-7 h-7 ${isDragging ? "text-[#005bd3]" : "text-[#8c9196]"}`} />
                          <p className="text-xs font-semibold text-[#202223]">
                            ড্র্যাগ করুন অথবা <span className="text-[#005bd3] underline font-bold">ক্লিক করে একসাথে একাধিক ছবি আপলোড করুন</span>
                          </p>
                          <p className="text-[10px] text-[#6d7175]">
                            ১ম ছবিটি কভার হবে, বাকিগুলো গ্যালারিতে যোগ হবে (PNG, JPEG, JPG, WEBP)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-1">
                      {formData.image ? (
                        <div className="relative group border border-gray-200 rounded-lg overflow-hidden bg-gray-50 aspect-square flex items-center justify-center">
                          <img
                            src={formData.image}
                            alt="Main Cover"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://images.unsplash.com/photo-1583391733959-b0510f6992dd?auto=format&fit=crop&q=80&w=800";
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormData(prev => ({ ...prev, image: "" }));
                            }}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity cursor-pointer"
                          >
                            রিমুভ করুন
                          </button>
                        </div>
                      ) : (
                        <div className="border border-dashed border-gray-300 rounded-lg aspect-square flex flex-col items-center justify-center bg-gray-50/50 text-gray-400">
                          <ImageIcon className="w-6 h-6 mb-1 opacity-60" />
                          <span className="text-[10px] font-bold">ছবি নেই</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2">
                    <details className="cursor-pointer group">
                      <summary className="text-xs text-[#005bd3] hover:underline font-semibold select-none outline-none">
                        অথবা ছবির অনলাইন লিংক (URL) লিখুন
                      </summary>
                      <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={formData.image.startsWith("data:") ? "" : formData.image}
                          onChange={(e) =>
                            setFormData({ ...formData, image: e.target.value })
                          }
                          className="w-full border border-[#c9cccf] rounded-md px-3 py-1.5 text-xs focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none transition-shadow"
                          placeholder="https://example.com/panjabi-main.jpg"
                        />
                      </div>
                    </details>
                  </div>
                </div>

                {/* Gallery Images (5-10 images) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700 block">
                      ২. অতিরিক্ত গ্যালারি ছবি সমূহ (Gallery Images):
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                      যুক্ত আছে: {formData.gallery?.length || 0} টি ছবি
                    </span>
                  </div>

                  {/* Gallery Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {formData.gallery && formData.gallery.map((img, index) => (
                      <div key={index} className="relative group border border-gray-200 rounded-lg aspect-square overflow-hidden bg-white shadow-xs">
                        <img
                          src={img}
                          alt={`Gallery ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1583391733959-b0510f6992dd?auto=format&fit=crop&q=80&w=800";
                          }}
                        />
                        <div className="absolute top-1 left-1 bg-black/70 text-[9px] text-white px-1.5 py-0.5 rounded font-bold font-mono">
                          #{index + 1}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              gallery: (prev.gallery || []).filter((_, i) => i !== index)
                            }));
                          }}
                          className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow-md cursor-pointer transition-colors"
                          title="ছবি রিমুভ করুন"
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {/* Upload Card */}
                    <button
                      type="button"
                      onClick={() => document.getElementById("gallery-upload-input")?.click()}
                      className="border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50/20 rounded-lg aspect-square flex flex-col items-center justify-center text-gray-500 cursor-pointer transition-all group"
                    >
                      <input
                        type="file"
                        id="gallery-upload-input"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleGalleryImagesUpload}
                      />
                      <Plus className="w-6 h-6 mb-1 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                      <span className="text-[10px] font-bold text-gray-600 group-hover:text-emerald-700">ছবি আপলোড করুন</span>
                      <span className="text-[8px] text-gray-400 mt-0.5">(একাধিক সম্ভব)</span>
                    </button>
                  </div>

                  {/* URL Input for Gallery */}
                  <div className="bg-gray-50/50 p-3 rounded-lg border border-gray-200/60">
                    <label className="block text-[10px] font-bold text-gray-600 mb-1">
                      অনলাইন লিংক দিয়ে গ্যালারিতে ছবি যোগ করুন (Enter Image URL):
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={galleryUrlInput}
                        onChange={(e) => setGalleryUrlInput(e.target.value)}
                        className="flex-1 border border-gray-300 rounded px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-[#005bd3] bg-white"
                        placeholder="https://example.com/panjabi-style2.jpg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (galleryUrlInput.trim()) {
                            setFormData(prev => ({
                              ...prev,
                              gallery: [...(prev.gallery || []), galleryUrlInput.trim()]
                            }));
                            setGalleryUrlInput("");
                          }
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1 rounded transition-colors cursor-pointer shrink-0"
                      >
                        যুক্ত করুন
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#e1e3e5] rounded-lg p-4 shadow-sm">
                  <h3 className="text-sm font-semibold text-[#202223] mb-4">
                    Pricing / মূল্য নির্ধারণ
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#202223] mb-1">
                        Selling Price (BDT) / বিক্রয় মূল্য
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]">
                          ৳
                        </span>
                        <input
                          required
                          type="number"
                          min="0"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          className="w-full border border-[#c9cccf] rounded-md pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none transition-shadow"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#202223] mb-1">
                        Compare-at Price (BDT) / ছাড়ের আগের দাম
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7175]">
                          ৳
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={formData.originalPrice}
                          onChange={(e) =>
                            setFormData({ ...formData, originalPrice: e.target.value })
                          }
                          className="w-full border border-[#c9cccf] rounded-md pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none transition-shadow"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Packages / Bundle Offers Section */}
                <div className="bg-white border border-[#e1e3e5] rounded-lg p-4 shadow-sm space-y-4 col-span-1 md:col-span-2">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-gray-100 pb-2.5 gap-2">
                    <div>
                      <h3 className="text-sm font-semibold text-[#202223]">
                        প্যাকেজ ও অফার সমূহ (Packages / Bundle Offers)
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-0.5">
                        এই প্রোডাক্টের জন্য কাস্টম প্যাকেজ (যেমন: ১ পিস, ২ পিস কম্বো ইত্যাদি) এখানে যুক্ত করুন। খালি রাখলে ৩টি স্ট্যান্ডার্ড অটো-প্যাকেজ চালু থাকবে।
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const defaultQty = formData.packages.length + 1;
                        const defaultName = defaultQty === 1 ? "১ পিস পাঞ্জাবি" : `${defaultQty} পিস ধামাকা কম্বো অফার`;
                        const basePrice = Number(formData.price) || 1000;
                        const discountFactor = defaultQty === 1 ? 1 : defaultQty === 2 ? 0.93 : 0.84;
                        const defaultPrice = Math.round(basePrice * defaultQty * discountFactor);
                        
                        setFormData({
                          ...formData,
                          packages: [
                            ...formData.packages,
                            {
                              id: crypto.randomUUID(),
                              name: defaultName,
                              price: defaultPrice,
                              quantity: defaultQty,
                              description: defaultQty === 3 ? "ফ্রি হোম ডেলিভারি" : "",
                            }
                          ]
                        });
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-md text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shrink-0"
                    >
                      + নতুন প্যাকেজ যোগ করুন
                    </button>
                  </div>

                  {formData.packages.length === 0 ? (
                    <div className="text-center py-6 bg-amber-50/40 rounded-lg border border-dashed border-amber-200 flex flex-col items-center justify-center gap-2">
                      <p className="text-xs text-amber-900 font-bold">কোনো কাস্টম প্যাকেজ যুক্ত করা নেই।</p>
                      <p className="text-[10px] text-amber-700 mt-0.5 max-w-md mx-auto">অটো-সিস্টেম দ্বারা ৩টি চমৎকার অফার (১টি, ২টি এবং ৩টি কম্বো অফার) ল্যান্ডিং পেজে স্বয়ংক্রিয়ভাবে দেখাবে এবং অর্ডার করতে সাহায্য করবে।</p>
                      <button
                        type="button"
                        onClick={() => {
                          const basePrice = Number(formData.price) || 1150;
                          const defaultPkgs = [
                            {
                              id: 'pkg-1-' + crypto.randomUUID(),
                              name: '১ পিস পাঞ্জাবি অফার',
                              price: basePrice,
                              quantity: 1,
                              description: 'স্ট্যান্ডার্ড প্যাক'
                            },
                            {
                              id: 'pkg-2-' + crypto.randomUUID(),
                              name: '২ পিস পাঞ্জাবি (কম্বো অফার)',
                              price: Math.round(basePrice * 2 - 130),
                              quantity: 2,
                              description: '৳১৩০ ডিসকাউন্ট!'
                            },
                            {
                              id: 'pkg-3-' + crypto.randomUUID(),
                              name: '৩ পিস পাঞ্জাবি (ধামাকা কম্বো)',
                              price: Math.round(basePrice * 3 - 470),
                              quantity: 3,
                              description: '৳৪৭০ ছাড় + ফ্রি ডেলিভারি!'
                            }
                          ];
                          setFormData({
                            ...formData,
                            packages: defaultPkgs
                          });
                        }}
                        className="mt-1 bg-amber-500 hover:bg-amber-600 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                      >
                        🎁 ডিফল্ট ৩টি অফার এখানে লোড করুন (যাতে এডিট করতে পারেন)
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {formData.packages.map((pkg, idx) => {
                        const pkgImages = Array.isArray(pkg.images) ? pkg.images : ['', '', ''];
                        return (
                          <div key={pkg.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full">
                                <div>
                                  <label className="text-[9px] text-gray-500 font-bold block mb-1">প্যাকেজ নাম</label>
                                  <input
                                    required
                                    type="text"
                                    value={pkg.name}
                                    onChange={(e) => {
                                      const updated = [...formData.packages];
                                      updated[idx] = { ...updated[idx], name: e.target.value };
                                      setFormData({ ...formData, packages: updated });
                                    }}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-[#005bd3] bg-white font-medium"
                                    placeholder="১ পিস অফার"
                                  />
                                </div>
                                <div>
                                  <label className="text-[9px] text-gray-500 font-bold block mb-1">প্যাকেজ দাম (BDT)</label>
                                  <div className="relative">
                                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-semibold">৳</span>
                                    <input
                                      required
                                      type="number"
                                      value={pkg.price}
                                      onChange={(e) => {
                                        const updated = [...formData.packages];
                                        updated[idx] = { ...updated[idx], price: Number(e.target.value) };
                                        setFormData({ ...formData, packages: updated });
                                      }}
                                      className="w-full border border-gray-300 rounded pl-5 pr-2 py-1 text-xs outline-none focus:ring-1 focus:ring-[#005bd3] bg-white font-mono font-bold"
                                      placeholder="990"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[9px] text-gray-500 font-bold block mb-1">পরিমাণ / পিস</label>
                                  <input
                                    required
                                    type="number"
                                    min="1"
                                    value={pkg.quantity}
                                    onChange={(e) => {
                                      const updated = [...formData.packages];
                                      updated[idx] = { ...updated[idx], quantity: Number(e.target.value) };
                                      setFormData({ ...formData, packages: updated });
                                    }}
                                    className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-[#005bd3] bg-white font-mono font-semibold"
                                    placeholder="1"
                                  />
                                </div>
                              </div>
                              <div className="w-full sm:w-44">
                                <label className="text-[9px] text-gray-500 font-bold block mb-1">অফার ব্যাজ (ঐচ্ছিক)</label>
                                <input
                                  type="text"
                                  value={pkg.description || ""}
                                  onChange={(e) => {
                                    const updated = [...formData.packages];
                                    updated[idx] = { ...updated[idx], description: e.target.value };
                                    setFormData({ ...formData, packages: updated });
                                  }}
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-[#005bd3] bg-white font-medium"
                                  placeholder="যেমন: ফ্রি হোম ডেলিভারি"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    packages: formData.packages.filter((p) => p.id !== pkg.id),
                                  });
                                }}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50 w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border border-transparent hover:border-red-200 shrink-0 self-end sm:self-center"
                                title="প্যাকেজ রিমুভ করুন"
                              >
                                ✕
                              </button>
                            </div>

                            {/* Package Pictures (1 to 3 images) */}
                            <div className="bg-amber-50/60 border border-amber-200 rounded p-2.5 space-y-2">
                              <span className="text-[11px] font-bold text-amber-900 block">
                                🎁 এই প্যাকেজের ছবি দিন (১ থেকে ৩টি ছবি - ল্যান্ডিং পেজে এই প্যাকেজে ক্লিক করলেই এই ছবিগুলো দেখাবে):
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {[0, 1, 2].map((imgIdx) => (
                                  <div key={imgIdx} className="bg-white border border-gray-200 rounded p-2 space-y-1.5 shadow-2xs">
                                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-700">
                                      <span>ছবি {imgIdx + 1} {imgIdx === 0 ? '(প্রধান)' : ''}</span>
                                      {pkgImages[imgIdx] && (
                                        <div className="w-6 h-6 rounded overflow-hidden border border-gray-300">
                                          <img src={pkgImages[imgIdx]} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                        </div>
                                      )}
                                    </div>
                                    <input
                                      type="text"
                                      value={pkgImages[imgIdx] || ''}
                                      onChange={(e) => {
                                        const updated = [...formData.packages];
                                        const currentImgs = [...(updated[idx].images || ['', '', ''])];
                                        while(currentImgs.length < 3) currentImgs.push('');
                                        currentImgs[imgIdx] = e.target.value;
                                        updated[idx] = { ...updated[idx], images: currentImgs };
                                        setFormData({ ...formData, packages: updated });
                                      }}
                                      className="w-full border border-gray-300 rounded px-2 py-1 text-[11px] bg-gray-50 outline-none focus:ring-1 focus:ring-black"
                                      placeholder={`ছবি ${imgIdx + 1} URL`}
                                    />
                                    <label className="block bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded px-2 py-0.5 text-[10px] font-semibold text-amber-900 cursor-pointer text-center">
                                      📁 ডিভাইস থেকে ছবি {imgIdx + 1} আপলোড
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0];
                                          if (file) {
                                            compressImage(file).then(res => { const updated = [...formData.packages]; const currentImgs = [...(updated[idx].images || ['', '', ''])]; while(currentImgs.length < 3) currentImgs.push(''); currentImgs[imgIdx] = res; updated[idx] = { ...updated[idx], images: currentImgs }; setFormData({ ...formData, packages: updated }); });
                                          }
                                        }}
                                      />
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Size Management Section */}
                <div className="bg-white border border-[#e1e3e5] rounded-lg p-4 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold text-[#202223]">
                      Available Sizes (সাইজ ম্যানেজমেন্ট)
                    </h3>
                    <span className="text-[11px] bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded font-extrabold">
                      {formData.sizes.length} টি সাইজ চালু
                    </span>
                  </div>

                  {/* Common Size Toggles */}
                  <div>
                    <label className="text-xs text-gray-600 font-medium block mb-1.5">কমন সাইজ টগল করুন:</label>
                    <div className="flex flex-wrap gap-1.5">
                      {['38', '40', '42', '44', '46', '48', '50', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => {
                        const isChecked = formData.sizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => {
                              if (isChecked) {
                                setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== sz) });
                              } else {
                                setFormData({ ...formData, sizes: [...formData.sizes, sz] });
                              }
                            }}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer border ${
                              isChecked 
                                ? 'bg-neutral-900 text-white border-black shadow-xs' 
                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {isChecked ? `✓ ${sz}` : `+ ${sz}`}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Active Sizes Badges */}
                  {formData.sizes.length > 0 && (
                    <div className="pt-2 border-t border-gray-100">
                      <label className="text-xs text-gray-500 font-medium block mb-1.5">এক্টিভ সাইজসমূহ:</label>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.sizes.map(sz => (
                          <span key={sz} className="bg-amber-50 text-amber-900 border border-amber-300 font-extrabold px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1">
                            {sz}
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, sizes: formData.sizes.filter(s => s !== sz) })}
                              className="hover:text-red-600 font-black ml-1 cursor-pointer"
                              title="রিমুভ করুন"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom Size Input */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="কাস্টম সাইজ (যেমন: 36, 52 বা Free)..."
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                      className="flex-1 border border-[#c9cccf] rounded-md px-2.5 py-1 text-xs outline-none focus:ring-1 focus:ring-[#005bd3]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (customSizeInput.trim() && !formData.sizes.includes(customSizeInput.trim())) {
                            setFormData({ ...formData, sizes: [...formData.sizes, customSizeInput.trim()] });
                            setCustomSizeInput('');
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customSizeInput.trim() && !formData.sizes.includes(customSizeInput.trim())) {
                          setFormData({ ...formData, sizes: [...formData.sizes, customSizeInput.trim()] });
                          setCustomSizeInput('');
                        }
                      }}
                      className="bg-black hover:bg-neutral-800 text-white font-bold px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
                    >
                      + যোগ করুন
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#e1e3e5] rounded-lg p-4 shadow-sm space-y-4">
                <h3 className="text-sm font-semibold text-[#202223] mb-4">
                  Organization
                </h3>
                  <div>
                    <label className="block text-sm font-medium text-[#202223] mb-1">
                      Product category
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as Category,
                        })
                      }
                      className="w-full border border-[#c9cccf] rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#005bd3] focus:border-[#005bd3] outline-none bg-white transition-shadow"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>

                    {/* Manage categories inline */}
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#202223] uppercase tracking-wide">
                          Add / Delete Categories
                        </h4>
                      </div>
                      
                      {/* Add Category Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="new-category-input"
                          placeholder="New category name..."
                          className="flex-1 border border-[#c9cccf] rounded-md px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-[#005bd3]"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const val = (e.currentTarget as HTMLInputElement).value.trim();
                              if (val) {
                                addCategory(val);
                                setFormData(prev => ({ ...prev, category: val }));
                                (e.currentTarget as HTMLInputElement).value = '';
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('new-category-input') as HTMLInputElement;
                            const val = input?.value.trim();
                            if (val) {
                              addCategory(val);
                              setFormData(prev => ({ ...prev, category: val }));
                              input.value = '';
                            }
                          }}
                          className="bg-[#005bd3] text-white px-3 py-1 rounded text-xs font-semibold hover:bg-[#004bb4]"
                        >
                          Add
                        </button>
                      </div>

                      {/* Category List with Delete button */}
                      <div className="max-h-24 overflow-y-auto space-y-1 pr-1 border-t border-gray-200 pt-2">
                        {categories.map(cat => (
                          <div key={cat} className="flex items-center justify-between bg-white px-2 py-1 border border-gray-100 rounded text-xs">
                            <span className="text-gray-700 font-medium">{cat}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmModal({
                                  isOpen: true,
                                  title: "ক্যাটাগরি ডিলিট নিশ্চিত করুন",
                                  description: `আপনি কি নিশ্চিত যে আপনি "${cat}" ক্যাটাগরি ডিলিট করতে চান? এই ক্যাটাগরির পণ্যগুলো ডিলিট হবে না, কিন্তু ফিল্টার থেকে এটি চলে যাবে।`,
                                  onConfirm: () => {
                                    deleteCategory(cat);
                                    if (formData.category === cat) {
                                      setFormData(prev => ({ ...prev, category: categories.find(c => c !== cat) || "" }));
                                    }
                                    setSuccessModal({
                                      isOpen: true,
                                      title: "ক্যাটাগরি ডিলিট হয়েছে",
                                      description: `"${cat}" ক্যাটাগরি সফলভাবে ডিলিট করা হয়েছে।`
                                    });
                                  }
                                });
                              }}
                              className="text-red-500 hover:text-red-700 font-bold px-1 cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.inStock}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            inStock: e.target.checked,
                          })
                        }
                        className="w-4 h-4 text-[#005bd3] border-[#c9cccf] rounded focus:ring-[#005bd3]"
                      />
                      <span className="text-sm text-[#202223]">
                        Track quantity (In Stock)
                      </span>
                    </label>
                  </div>
                </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-[#e1e3e5]">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-[#c9cccf] text-[#202223] rounded-md text-sm font-medium hover:bg-[#f6f6f7] transition-colors shadow-sm"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#008060] text-white rounded-md text-sm font-medium hover:bg-[#006e52] transition-colors shadow-sm"
                >
                  {editingProduct ? "Save" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Details View Modal */}
      {selectedOrderForDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <span>📄 অর্ডারের পূর্ণাঙ্গ বিবরণ</span>
                  <span className="text-xs font-mono font-bold bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                    #{selectedOrderForDetails.id}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  তারিখ: {new Date(selectedOrderForDetails.date).toLocaleString('bn-BD')}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Customer Info Card */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-lg p-4 space-y-2">
                <h4 className="font-bold text-amber-950 text-sm border-b border-amber-200 pb-1.5 flex items-center justify-between">
                  <span>👤 কাস্টমার এর যোগাযোগের ঠিকানা</span>
                  <span className="text-xs font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                    {selectedOrderForDetails.paymentMethod || 'COD'}
                  </span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <span className="text-gray-500">কাস্টমারের নাম:</span>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{selectedOrderForDetails.customer?.name || 'কাস্টমার'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">মোবাইল নম্বর:</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <a 
                        href={`tel:${selectedOrderForDetails.customer?.phone || ''}`} 
                        className="font-bold text-emerald-800 text-sm hover:underline flex items-center gap-1"
                      >
                        📞 {selectedOrderForDetails.customer?.phone || 'N/A'}
                      </a>
                      {selectedOrderForDetails.customer?.phone && (
                        <a 
                          href={`https://wa.me/88${selectedOrderForDetails.customer.phone.replace(/[^0-9]/g, '')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded hover:bg-emerald-700"
                        >
                          WhatsApp 💬
                        </a>
                      )}
                    </div>
                    {selectedOrderForDetails.customer?.phone && (() => {
                      const phoneClean = selectedOrderForDetails.customer.phone.replace(/\D/g, '');
                      const customerOrdersList = orders.filter(
                        (o) => o.customer?.phone && o.customer.phone.replace(/\D/g, '') === phoneClean,
                      );
                      const samePhoneCount = customerOrdersList.length;
                      const deliveredCount = customerOrdersList.filter((o) => o.status === "delivered").length;
                      const cancelledCount = customerOrdersList.filter((o) => o.status === "cancelled").length;
                      return (
                        <>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              সফল ডেলিভারি: {deliveredCount}
                            </span>
                            <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              বাতিল: {cancelledCount}
                            </span>
                            <span className="bg-gray-100 text-gray-800 text-[10px] font-bold px-2 py-0.5 rounded">
                              মোট অর্ডার: {samePhoneCount}
                            </span>
                          </div>
                          <div className="mt-1">
                            <CourierSuccessRate phone={selectedOrderForDetails.customer?.phone || ''} />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-gray-500">সম্পূর্ণ ডেলিভারি ঠিকানা:</span>
                    <p className="font-bold text-gray-900 mt-0.5 bg-white p-2 rounded border border-amber-200 leading-relaxed text-sm">
                      {selectedOrderForDetails.customer?.address || 'ঠিকানা দেওয়া নেই'}{selectedOrderForDetails.customer?.city ? `, ${selectedOrderForDetails.customer.city}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ordered Items Table */}
              <div>
                <h4 className="font-bold text-gray-900 text-sm mb-3 flex items-center justify-between">
                  <span>🛍️ অর্ডারকৃত পাঞ্জাবি ও সাইজ</span>
                  <span className="text-xs text-gray-500 font-normal">
                    মোট আইটেম: {(selectedOrderForDetails.items || []).length} টি
                  </span>
                </h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-100 text-gray-700 border-b border-gray-200">
                      <tr>
                        <th className="p-2.5 font-bold">ছবি & পাঞ্জাবির নাম</th>
                        <th className="p-2.5 font-bold">সাইজ (Size)</th>
                        <th className="p-2.5 font-bold text-center">পরিমাণ</th>
                        <th className="p-2.5 font-bold text-right">মূল্য</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(selectedOrderForDetails.items || []).map((item, i) => {
                        const prod = products.find(p => p.id === item.productId);
                        const prodTitle = prod ? prod.title : 'পাঞ্জাবি';
                        const prodImg = item.selectedImage || prod?.image || 'https://images.unsplash.com/photo-1583391733959-b0510f6992dd?auto=format&fit=crop&q=80&w=800';

                        return (
                          <tr key={i} className="hover:bg-gray-50">
                            <td className="p-2.5">
                              <div className="flex items-center gap-2.5">
                                <img src={prodImg} alt={prodTitle} className="w-12 h-16 object-cover rounded border-2 border-amber-500 shadow-sm" />
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{prodTitle}</p>
                                  <p className="text-[10px] text-gray-500">ID: {item.productId}</p>
                                  {item.productCode && (
                                    <span className="inline-block text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-300 rounded px-2 py-0.5 mt-1 animate-pulse">
                                      🎯 {item.productCode}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-2.5">
                              <span className="font-extrabold bg-neutral-900 text-white px-2.5 py-1 rounded text-xs shadow-2xs">
                                {item.size}
                              </span>
                            </td>
                            <td className="p-2.5 text-center font-bold text-gray-900">
                              {item.quantity} টি
                            </td>
                            <td className="p-2.5 text-right font-extrabold text-emerald-800 text-sm">
                              ৳{(item.price || 0) * (item.quantity || 1)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Summary Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <span className="text-xs text-emerald-800 font-bold">ক্যাশ অন ডেলিভারি (COD) বিল</span>
                  <p className="text-2xl font-black text-emerald-950">৳ {selectedOrderForDetails.total.toLocaleString('en-BD')}</p>
                </div>
                {consignmentMap[selectedOrderForDetails.id] ? (
                  <div className="text-right">
                    <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      SteadFast এন্ট্রি সম্পূর্ণ
                    </span>
                    <p className="text-xs font-mono font-bold text-gray-700 mt-1">
                      ID: {consignmentMap[selectedOrderForDetails.id]}
                    </p>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      handleSendOrderToCourierAsync(selectedOrderForDetails.id);
                      setSelectedOrderForDetails(null);
                    }}
                    className="bg-[#1e8556] hover:bg-[#155e3c] text-white font-bold text-xs px-4 py-2 rounded shadow-md transition-all cursor-pointer"
                  >
                    🚀 SteadFast প্যানেলে পাঠান
                  </button>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
              <button
                onClick={() => {
                  setConfirmModal({
                    isOpen: true,
                    title: "অর্ডার ডিলিট নিশ্চিত করুন",
                    description: `আপনি কি নিশ্চিত যে আপনি এই অর্ডারটি ডিলিট করতে চান?`,
                    onConfirm: () => {
                      deleteOrder(selectedOrderForDetails.id);
                      setSelectedOrderForDetails(null);
                    }
                  });
                }}
                className="text-xs font-bold text-red-600 hover:underline cursor-pointer"
              >
                🗑️ অর্ডার ডিলিট করুন
              </button>
              <button
                onClick={() => setSelectedOrderForDetails(null)}
                className="bg-gray-800 hover:bg-black text-white font-bold text-xs px-5 py-2 rounded-md transition-colors cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
