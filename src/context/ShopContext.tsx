import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Product, CartItem, Order, Category, DiscountCode, LandingPage, MenuItem } from '../types';
import { INITIAL_PRODUCTS } from '../data';
import { db, collection, getDocs, doc, setDoc, deleteDoc, onSnapshot, writeBatch } from '../lib/firebaseClient';
import { getPdataFromUrl, getProdDataFromUrl } from '../lib/urlUtils';

interface ShopContextType {
  products: Product[];
  cart: CartItem[];
  addToCart: (product: Product, size: CartItem['size'], quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateCartQuantity: (cartItemId: string, quantity: number) => void;
  clearCart: () => void;
  isAdminLoggedIn: boolean;
  loginAdmin: () => void;
  logoutAdmin: () => void;
  adminUsername: string;
  setAdminUsername: (username: string) => void;
  adminPassword: string;
  setAdminPassword: (password: string) => void;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  deleteMultipleProducts: (productIds: string[]) => Promise<void>;
  pixelId: string;
  setPixelId: (id: string) => void;
  pixelAccessToken: string;
  setPixelAccessToken: (token: string) => void;
  gtmId: string;
  setGtmId: (id: string) => void;
  courierService: string;
  setCourierService: (service: string) => void;
  courierApiKey: string;
  setCourierApiKey: (key: string) => void;
  courierSecretKey: string;
  setCourierSecretKey: (key: string) => void;
  orders: Order[];
  incompleteOrders: Order[];
  placeOrder: (orderData: Omit<Order, 'id' | 'date' | 'status'>) => void;
  addOrUpdateIncompleteOrder: (id: string, orderData: Omit<Order, 'id' | 'date' | 'status'>) => void;
  deleteIncompleteOrder: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  updateOrderMetaSynced: (orderId: string, synced: boolean) => void;
  deleteOrder: (orderId: string) => void;
  blockedPhones: string[];
  blockPhone: (phone: string) => void;
  unblockPhone: (phone: string) => void;
  isPhoneBlocked: (phone: string) => boolean;
  enableDailyLimit: boolean;
  setEnableDailyLimit: (val: boolean) => void;
  whitelistedPhones: string[];
  whitelistPhone: (phone: string) => void;
  unwhitelistPhone: (phone: string) => void;
  isPhoneWhitelisted: (phone: string) => boolean;
  isDailyOrderLimitReached: (phone: string) => boolean;
  categories: Category[];
  addCategory: (category: Category) => void;
  deleteCategory: (category: Category) => void;
  categoryImages: Record<string, string[]>;
  setCategoryImage: (category: string, index: number, url: string) => void;
  consignmentMap: Record<string, string>;
  sendOrderToCourier: (orderId: string) => Promise<{ success: boolean; trackingCode?: string; message?: string }>;
  resetCourierStatus: (orderId: string) => void;
  checkBalance: () => Promise<{ success: boolean; balance?: number; message?: string }>;
  fetchCourierFraudCheck: (phone: string) => Promise<{
    success: boolean;
    total_parcel?: number;
    delivered_parcel?: number;
    cancelled_parcel?: number;
    delivery_ratio?: number;
    message?: string;
  }>;
  steadfastBalance: number;
  setSteadfastBalance: (balance: number) => void;
  steadfastPaidOut: number;
  setSteadfastPaidOut: (amount: number) => void;
  discountCodes: DiscountCode[];
  addDiscountCode: (code: DiscountCode) => void;
  deleteDiscountCode: (codeString: string) => void;
  toggleDiscountCode: (codeString: string) => void;
  validateDiscountCode: (codeString: string, cartTotal: number) => { isValid: boolean; discountAmount: number; error?: string };
  storeLogo: string;
  setStoreLogo: (logo: string) => void;
  storeBanner: string;
  setStoreBanner: (banner: string) => void;
  storeName: string;
  setStoreName: (name: string) => void;
  storeFavicon: string;
  setStoreFavicon: (favicon: string) => void;
  whatsappNumber: string;
  setWhatsappNumber: (num: string) => void;
  phoneNumber: string;
  setPhoneNumber: (num: string) => void;
  messengerUrl: string;
  setMessengerUrl: (url: string) => void;
  facebookPageUrl: string;
  setFacebookPageUrl: (url: string) => void;
  heroBadge: string;
  setHeroBadge: (badge: string) => void;
  heroTitle1: string;
  setHeroTitle1: (t1: string) => void;
  heroTitle2: string;
  setHeroTitle2: (t2: string) => void;
  heroSubtitle: string;
  setHeroSubtitle: (sub: string) => void;
  landingPages: LandingPage[];
  addLandingPage: (page: LandingPage) => void;
  updateLandingPage: (page: LandingPage) => void;
  deleteLandingPage: (id: string) => void;

  // Customization fields
  headerBgColor: string;
  setHeaderBgColor: (color: string) => void;
  headerTextColor: string;
  setHeaderTextColor: (color: string) => void;
  
  footerShow: boolean;
  setFooterShow: (show: boolean) => void;
  footerBgColor: string;
  setFooterBgColor: (color: string) => void;
  footerTextColor: string;
  setFooterTextColor: (color: string) => void;
  footerText: string;
  setFooterText: (text: string) => void;
  footerAddress: string;
  setFooterAddress: (address: string) => void;
  footerPayments: string;
  setFooterPayments: (payments: string) => void;

  btnInstantOrderShow: boolean;
  setBtnInstantOrderShow: (show: boolean) => void;
  btnInstantOrderText: string;
  setBtnInstantOrderText: (text: string) => void;
  btnInstantOrderBgColor: string;
  setBtnInstantOrderBgColor: (color: string) => void;
  btnInstantOrderTextColor: string;
  setBtnInstantOrderTextColor: (color: string) => void;

  btnAddToCartShow: boolean;
  setBtnAddToCartShow: (show: boolean) => void;
  btnAddToCartText: string;
  setBtnAddToCartText: (text: string) => void;
  btnAddToCartBgColor: string;
  setBtnAddToCartBgColor: (color: string) => void;
  btnAddToCartTextColor: string;
  setBtnAddToCartTextColor: (color: string) => void;

  btnDetailsShow: boolean;
  setBtnDetailsShow: (show: boolean) => void;
  btnDetailsText: string;
  setBtnDetailsText: (text: string) => void;
  btnDetailsBgColor: string;
  setBtnDetailsBgColor: (color: string) => void;
  btnDetailsTextColor: string;
  setBtnDetailsTextColor: (color: string) => void;

  shippingInsideCost: number;
  setShippingInsideCost: (cost: number) => void;
  shippingInsideText: string;
  setShippingInsideText: (text: string) => void;
  shippingInsideDesc: string;
  setShippingInsideDesc: (desc: string) => void;
  shippingInsideShow: boolean;
  setShippingInsideShow: (show: boolean) => void;

  shippingOutsideCost: number;
  setShippingOutsideCost: (cost: number) => void;
  shippingOutsideText: string;
  setShippingOutsideText: (text: string) => void;
  shippingOutsideDesc: string;
  setShippingOutsideDesc: (desc: string) => void;
  shippingOutsideShow: boolean;
  setShippingOutsideShow: (show: boolean) => void;

  freeShippingEnabled: boolean;
  setFreeShippingEnabled: (enabled: boolean) => void;
  freeShippingThreshold: number;
  setFreeShippingThreshold: (qty: number) => void;

  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
  showCategoryFilterBar: boolean;
  setShowCategoryFilterBar: (val: boolean) => void;
  saveStoreSettingsToCloud: (overrideSettings?: Record<string, any>) => Promise<void>;
}


// Module-level reference to prevent garbage collection of the SpeechSynthesisUtterance object
let activeUtterance: SpeechSynthesisUtterance | null = null;

export const playOrderSuccessSound = () => {
  if (localStorage.getItem("Shoker ghor_audio_alerts") === "false") {
    return;
  }
  try {
    // 1. Play high-quality chord chime
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const now = ctx.currentTime;
      
      // Osc 1: C5 (523.25 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.12, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.55);
      
      // Osc 2: E5 (659.25 Hz) starting shortly after
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.12);
      gain2.gain.setValueAtTime(0, now);
      gain2.gain.setValueAtTime(0.12, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.75);

      // Osc 3: G5 (783.99 Hz) starting slightly after Osc 2
      const osc3 = ctx.createOscillator();
      const gain3 = ctx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, now + 0.24);
      gain3.gain.setValueAtTime(0, now);
      gain3.gain.setValueAtTime(0.15, now + 0.24);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc3.connect(gain3);
      gain3.connect(ctx.destination);
      osc3.start(now + 0.24);
      osc3.stop(now + 0.95);
    }
  } catch (error) {
    console.error("Failed to play order notification sound:", error);
  }

  // 2. Speak voice notification: "স্যার, অর্ডার সাবমিট হয়েছে।"
  try {
    if ('speechSynthesis' in window) {
      // Force resume in case speaking is paused or jammed
      window.speechSynthesis.resume();
      
      let spoken = false;
      const speakText = () => {
        if (spoken) return;
        spoken = true;
        
        const voices = window.speechSynthesis.getVoices();
        
        // Find all Bengali voices
        const bnVoices = voices.filter(v => 
          v.lang.toLowerCase().startsWith('bn') || 
          v.lang.toLowerCase().includes('bangla') || 
          v.lang.toLowerCase().includes('bengali')
        );
        
        // Prioritize female Bengali voice specifically (e.g., Google, Microsoft Ananya, Sabina, etc.)
        let bnVoice = bnVoices.find(v => {
          const name = v.name.toLowerCase();
          return name.includes('female') || 
                 name.includes('ananya') || 
                 name.includes('sabina') || 
                 name.includes('google') || 
                 name.includes('woman') || 
                 name.includes('girl') || 
                 name.includes('natural') || 
                 name.includes('mitu');
        }) || bnVoices[0];
        
        let msgText = "স্যার, অর্ডার সাবমিট হইছে।";
        let msgLang = "bn-BD";
        let selectedVoice = bnVoice || null;
        
        if (!bnVoice) {
          // If no Bengali voice is installed, use a premium female English voice with phonetic spelling
          const engVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
          const femaleEngVoice = engVoices.find(v => {
            const name = v.name.toLowerCase();
            return name.includes('female') || 
                   name.includes('zira') || 
                   name.includes('samantha') || 
                   name.includes('karen') || 
                   name.includes('tessa') || 
                   name.includes('moira') || 
                   name.includes('hazel') || 
                   name.includes('google us english') ||
                   name.includes('susan') ||
                   name.includes('natural');
          }) || engVoices[0];
          
          selectedVoice = femaleEngVoice || null;
          msgText = "Sir, order sub-meet ho-ye-che";
          msgLang = "en-US";
        }
        
        const msg = new SpeechSynthesisUtterance(msgText);
        msg.lang = msgLang;
        
        // Optimum rate and feminine pitch adjustment
        msg.rate = bnVoice ? 0.95 : 0.85; 
        msg.pitch = 1.15; // Raised slightly to ensure a beautiful, sweet, clear female tone
        
        if (selectedVoice) {
          msg.voice = selectedVoice;
        }
        
        // Prevent Garbage Collection of Utterance mid-play (extremely common Chrome/Safari issue)
        activeUtterance = msg;
        
        msg.onend = () => {
          activeUtterance = null;
        };
        msg.onerror = (e) => {
          console.error("SpeechSynthesis error details:", e);
          activeUtterance = null;
        };
        
        // Safe play sequence: cancel first, wait 60ms, then speak
        window.speechSynthesis.cancel();
        setTimeout(() => {
          window.speechSynthesis.speak(msg);
        }, 60);
      };

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        speakText();
      } else {
        if ('onvoiceschanged' in window.speechSynthesis) {
          window.speechSynthesis.onvoiceschanged = () => {
            speakText();
          };
        }
        // Fallback delay to wait for voices to load
        setTimeout(speakText, 350);
      }
    }
  } catch (speechError) {
    console.error("Failed to execute text-to-speech notification:", speechError);
  }
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export const ShopProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    const urlProduct = getProdDataFromUrl();

    // Clear old cache to force fresh fetch
    localStorage.removeItem('Shoker ghor_products');

    let initialList = INITIAL_PRODUCTS;
    if (urlProduct) {
      const existsIdx = initialList.findIndex(p => p.id === urlProduct!.id);
      if (existsIdx !== -1) {
        initialList[existsIdx] = { ...initialList[existsIdx], ...urlProduct };
      } else {
        initialList = [urlProduct, ...initialList];
      }
    }

    return initialList;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const storedCart = localStorage.getItem('Shoker ghor_cart');
      if (storedCart) {
        const parsed = JSON.parse(storedCart);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error('Error parsing Shoker ghor_cart:', e);
    }
    return [];
  });

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    return localStorage.getItem('Shoker ghor_admin') === 'true';
  });

  const [adminUsername, setAdminUsername] = useState<string>(() => {
    return localStorage.getItem('Shoker ghor_admin_username') || 'Shoker ghor';
  });

  const [adminPassword, setAdminPassword] = useState<string>(() => {
    return localStorage.getItem('Shoker ghor_admin_password') || '123456';
  });

  const [pixelId, setPixelId] = useState<string>(() => {
    return localStorage.getItem('Shoker ghor_pixel_id') || '';
  });

  const [pixelAccessToken, setPixelAccessToken] = useState<string>(() => {
    return localStorage.getItem('Shoker ghor_pixel_token') || '';
  });

  const [gtmId, setGtmId] = useState<string>(() => {
    return localStorage.getItem('Shoker ghor_gtm_id') || '';
  });

  const [courierService, setCourierService] = useState<string>(() => localStorage.getItem('Shoker ghor_courier_service') || 'steadfast');
  const [courierApiKey, setCourierApiKey] = useState<string>(() => localStorage.getItem('Shoker ghor_courier_api_key') || 'SF_LIVE_API_KEY_7739');
  const [courierSecretKey, setCourierSecretKey] = useState<string>(() => localStorage.getItem('Shoker ghor_courier_secret_key') || 'SF_LIVE_SECRET_9831');

  const getMigratedStorageItem = (key: string, defaultValue: string) => {
    let val = localStorage.getItem(key);
    if (val && val.includes('/src/assets/images/')) {
      val = val.replace('/src/assets/images/', '/');
      localStorage.setItem(key, val);
    }
    return val || defaultValue;
  };

  const [storeLogo, setStoreLogo] = useState<string>(() => {
    return getMigratedStorageItem('Shoker ghor_store_logo', '/Shoker ghor_gold_logo_1785398483246.jpg');
  });

  const [storeBanner, setStoreBanner] = useState<string>(() => {
    return getMigratedStorageItem('Shoker ghor_store_banner', '/Shoker ghor_hero_banner_1785398905544.jpg');
  });

  const [storeName, setStoreName] = useState<string>(() => {
    return localStorage.getItem('Shoker ghor_store_name') || 'Shoker ghor Shop - Premium Product & Luxury Wear';
  });

  const [storeFavicon, setStoreFavicon] = useState<string>(() => {
    return getMigratedStorageItem('Shoker ghor_store_favicon', '/Shoker ghor_gold_logo_1785398483246.jpg');
  });

  const [whatsappNumber, setWhatsappNumber] = useState<string>(() => localStorage.getItem('Shoker ghor_whatsapp_number') || '8801756994483');
  const [phoneNumber, setPhoneNumber] = useState<string>(() => localStorage.getItem('Shoker ghor_phone_number') || '01756994483');
  const [messengerUrl, setMessengerUrl] = useState<string>(() => localStorage.getItem('Shoker ghor_messenger_url') || 'https://m.me/61561088721085');
  const [facebookPageUrl, setFacebookPageUrl] = useState<string>(() => localStorage.getItem('Shoker ghor_fb_page_url') || 'https://www.facebook.com/profile.php?id=61561088721085');

  const [heroBadge, setHeroBadge] = useState<string>(() => localStorage.getItem('Shoker ghor_hero_badge') || '💎 HERITAGE ELEGANCE • ROYAL COLLECTION');
  const [heroTitle1, setHeroTitle1] = useState<string>(() => localStorage.getItem('Shoker ghor_hero_title1') || 'EMBODY REGAL');
  const [heroTitle2, setHeroTitle2] = useState<string>(() => localStorage.getItem('Shoker ghor_hero_title2') || 'TRADITION');
  const [heroSubtitle, setHeroSubtitle] = useState<string>(() => localStorage.getItem('Shoker ghor_hero_subtitle') || 'Handcrafted Bangladeshi Jamdani weaves, premium royal silk, Kabli suits, and breathable luxury cotton Products designed for Eid, Weddings, and Festive Celebrations.');

  // Header state
  const [headerBgColor, setHeaderBgColor] = useState<string>(() => localStorage.getItem('Shoker ghor_header_bg_color') || '#0a1128');
  const [headerTextColor, setHeaderTextColor] = useState<string>(() => localStorage.getItem('Shoker ghor_header_text_color') || '#ffffff');

  // Footer state
  const [footerShow, setFooterShow] = useState<boolean>(() => {
    const val = localStorage.getItem('Shoker ghor_footer_show');
    return val !== null ? val === 'true' : true;
  });
  const [footerBgColor, setFooterBgColor] = useState<string>(() => localStorage.getItem('Shoker ghor_footer_bg_color') || '#ffffff');
  const [footerTextColor, setFooterTextColor] = useState<string>(() => localStorage.getItem('Shoker ghor_footer_text_color') || '#666666');
  const [footerText, setFooterText] = useState<string>(() => localStorage.getItem('Shoker ghor_footer_text') || 'Traditional Excellence.');
  const [footerAddress, setFooterAddress] = useState<string>(() => localStorage.getItem('Shoker ghor_footer_address') || 'নূরবাগ, কামরাঙ্গীরচর, ঢাকা, বাংলাদেশ');
  const [footerPayments, setFooterPayments] = useState<string>(() => localStorage.getItem('Shoker ghor_footer_payments') || 'bKash, Nagad, Rocket, VISA, COD');

  // Instant Order button state
  const [btnInstantOrderShow, setBtnInstantOrderShow] = useState<boolean>(() => {
    const val = localStorage.getItem('Shoker ghor_btn_instant_order_show');
    return val !== null ? val === 'true' : true;
  });
  const [btnInstantOrderText, setBtnInstantOrderText] = useState<string>(() => localStorage.getItem('Shoker ghor_btn_instant_order_text') || 'ইনস্ট্যান্ট অর্ডার ⚡');
  const [btnInstantOrderBgColor, setBtnInstantOrderBgColor] = useState<string>(() => localStorage.getItem('Shoker ghor_btn_instant_order_bg') || '#f59e0b');
  const [btnInstantOrderTextColor, setBtnInstantOrderTextColor] = useState<string>(() => localStorage.getItem('Shoker ghor_btn_instant_order_text_color') || '#0a0a0a');

  // Add to Cart button state
  const [btnAddToCartShow, setBtnAddToCartShow] = useState<boolean>(() => {
    const val = localStorage.getItem('Shoker ghor_btn_add_to_cart_show');
    return val !== null ? val === 'true' : true;
  });
  const [btnAddToCartText, setBtnAddToCartText] = useState<string>(() => localStorage.getItem('Shoker ghor_btn_add_to_cart_text') || 'Add to Cart');
  const [btnAddToCartBgColor, setBtnAddToCartBgColor] = useState<string>(() => localStorage.getItem('Shoker ghor_btn_add_to_cart_bg') || '#0a1128');
  const [btnAddToCartTextColor, setBtnAddToCartTextColor] = useState<string>(() => localStorage.getItem('Shoker ghor_btn_add_to_cart_text_color') || '#ffffff');

  // Details button state
  const [btnDetailsShow, setBtnDetailsShow] = useState<boolean>(() => {
    const val = localStorage.getItem('Shoker ghor_btn_details_show');
    return val !== null ? val === 'true' : true;
  });
  const [btnDetailsText, setBtnDetailsText] = useState<string>(() => localStorage.getItem('Shoker ghor_btn_details_text') || 'Details');
  const [btnDetailsBgColor, setBtnDetailsBgColor] = useState<string>(() => localStorage.getItem('Shoker ghor_btn_details_bg') || '#ffffff');
  const [btnDetailsTextColor, setBtnDetailsTextColor] = useState<string>(() => localStorage.getItem('Shoker ghor_btn_details_text_color') || '#1a1a1a');

  // Shipping customization states
  const [shippingInsideCost, setShippingInsideCost] = useState<number>(() => Number(localStorage.getItem('Shoker ghor_shipping_inside_cost') || '60'));
  const [shippingInsideText, setShippingInsideText] = useState<string>(() => localStorage.getItem('Shoker ghor_shipping_inside_text') || 'ঢাকার ভিতরে');
  const [shippingInsideDesc, setShippingInsideDesc] = useState<string>(() => localStorage.getItem('Shoker ghor_shipping_inside_desc') || 'হোম ডেলিভারি চার্জ ৳৬০ (২-৩ দিন)');
  const [shippingInsideShow, setShippingInsideShow] = useState<boolean>(() => localStorage.getItem('Shoker ghor_shipping_inside_show') !== 'false');

  const [shippingOutsideCost, setShippingOutsideCost] = useState<number>(() => Number(localStorage.getItem('Shoker ghor_shipping_outside_cost') || '120'));
  const [shippingOutsideText, setShippingOutsideText] = useState<string>(() => localStorage.getItem('Shoker ghor_shipping_outside_text') || 'ঢাকার বাইরে');
  const [shippingOutsideDesc, setShippingOutsideDesc] = useState<string>(() => localStorage.getItem('Shoker ghor_shipping_outside_desc') || 'কুরিয়ার ডেলিভারি চার্জ ৳১২০ (৩-৫ দিন)');
  const [shippingOutsideShow, setShippingOutsideShow] = useState<boolean>(() => localStorage.getItem('Shoker ghor_shipping_outside_show') !== 'false');

  const [freeShippingEnabled, setFreeShippingEnabled] = useState<boolean>(() => localStorage.getItem('Shoker ghor_free_shipping_enabled') !== 'false');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(() => Number(localStorage.getItem('Shoker ghor_free_shipping_threshold') || '3'));

  const [showCategoryFilterBar, setShowCategoryFilterBar] = useState<boolean>(() => {
    const val = localStorage.getItem('Shoker ghor_show_category_filter_bar');
    return val !== null ? val === 'true' : true;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('Shoker ghor_menu_items');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse menu items', e);
      }
    }
    return [
      { id: '1', label: 'Home', type: 'home', isActive: true },
      { id: '2', label: 'Shop', type: 'shop', link: '#shop', isActive: true },
      { id: '3', label: 'রিল ধামাকা অফার ⚡', type: 'reel', isActive: true },
      { id: '4', label: 'Categories', type: 'categories', link: '#categories', isActive: true },
      { id: '5', label: 'About Us', type: 'about', link: '#about', isActive: true },
    ];
  });

  useEffect(() => {
    localStorage.setItem('Shoker ghor_menu_items', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_show_category_filter_bar', String(showCategoryFilterBar));
  }, [showCategoryFilterBar]);

  useEffect(() => { localStorage.setItem('Shoker ghor_header_bg_color', headerBgColor); }, [headerBgColor]);
  useEffect(() => { localStorage.setItem('Shoker ghor_header_text_color', headerTextColor); }, [headerTextColor]);
  
  useEffect(() => { localStorage.setItem('Shoker ghor_footer_show', String(footerShow)); }, [footerShow]);
  useEffect(() => { localStorage.setItem('Shoker ghor_footer_bg_color', footerBgColor); }, [footerBgColor]);
  useEffect(() => { localStorage.setItem('Shoker ghor_footer_text_color', footerTextColor); }, [footerTextColor]);
  useEffect(() => { localStorage.setItem('Shoker ghor_footer_text', footerText); }, [footerText]);
  useEffect(() => { localStorage.setItem('Shoker ghor_footer_address', footerAddress); }, [footerAddress]);
  useEffect(() => { localStorage.setItem('Shoker ghor_footer_payments', footerPayments); }, [footerPayments]);

  useEffect(() => { localStorage.setItem('Shoker ghor_btn_instant_order_show', String(btnInstantOrderShow)); }, [btnInstantOrderShow]);
  useEffect(() => { localStorage.setItem('Shoker ghor_btn_instant_order_text', btnInstantOrderText); }, [btnInstantOrderText]);
  useEffect(() => { localStorage.setItem('Shoker ghor_btn_instant_order_bg', btnInstantOrderBgColor); }, [btnInstantOrderBgColor]);
  useEffect(() => { localStorage.setItem('Shoker ghor_btn_instant_order_text_color', btnInstantOrderTextColor); }, [btnInstantOrderTextColor]);

  useEffect(() => { localStorage.setItem('Shoker ghor_btn_add_to_cart_show', String(btnAddToCartShow)); }, [btnAddToCartShow]);
  useEffect(() => { localStorage.setItem('Shoker ghor_btn_add_to_cart_text', btnAddToCartText); }, [btnAddToCartText]);
  useEffect(() => { localStorage.setItem('Shoker ghor_btn_add_to_cart_bg', btnAddToCartBgColor); }, [btnAddToCartBgColor]);
  useEffect(() => { localStorage.setItem('Shoker ghor_btn_add_to_cart_text_color', btnAddToCartTextColor); }, [btnAddToCartTextColor]);

  useEffect(() => { localStorage.setItem('Shoker ghor_btn_details_show', String(btnDetailsShow)); }, [btnDetailsShow]);
  useEffect(() => { localStorage.setItem('Shoker ghor_btn_details_text', btnDetailsText); }, [btnDetailsText]);
  useEffect(() => { localStorage.setItem('Shoker ghor_btn_details_bg', btnDetailsBgColor); }, [btnDetailsBgColor]);
  useEffect(() => { localStorage.setItem('Shoker ghor_btn_details_text_color', btnDetailsTextColor); }, [btnDetailsTextColor]);

  useEffect(() => { localStorage.setItem('Shoker ghor_shipping_inside_cost', String(shippingInsideCost)); }, [shippingInsideCost]);
  useEffect(() => { localStorage.setItem('Shoker ghor_shipping_inside_text', shippingInsideText); }, [shippingInsideText]);
  useEffect(() => { localStorage.setItem('Shoker ghor_shipping_inside_desc', shippingInsideDesc); }, [shippingInsideDesc]);
  useEffect(() => { localStorage.setItem('Shoker ghor_shipping_inside_show', String(shippingInsideShow)); }, [shippingInsideShow]);

  useEffect(() => { localStorage.setItem('Shoker ghor_shipping_outside_cost', String(shippingOutsideCost)); }, [shippingOutsideCost]);
  useEffect(() => { localStorage.setItem('Shoker ghor_shipping_outside_text', shippingOutsideText); }, [shippingOutsideText]);
  useEffect(() => { localStorage.setItem('Shoker ghor_shipping_outside_desc', shippingOutsideDesc); }, [shippingOutsideDesc]);
  useEffect(() => { localStorage.setItem('Shoker ghor_shipping_outside_show', String(shippingOutsideShow)); }, [shippingOutsideShow]);

  useEffect(() => { localStorage.setItem('Shoker ghor_free_shipping_enabled', String(freeShippingEnabled)); }, [freeShippingEnabled]);
  useEffect(() => { localStorage.setItem('Shoker ghor_free_shipping_threshold', String(freeShippingThreshold)); }, [freeShippingThreshold]);

  const [landingPages, setLandingPages] = useState<LandingPage[]>(() => {
    const urlLandingPage = getPdataFromUrl();

    let parsedList: LandingPage[] = [];
    
    // Landing pages are now synced via backend

    if (parsedList.length === 0) {
      parsedList = [
        {
          id: 'lp-1',
          slug: 'summer-cotton-special',
          title: 'Summer Cotton Special Offer',
          productId: 'led-high-tops-copy-copy',
          bannerImage: 'https://cdn.shopify.com/s/files/1/0712/1820/0746/files/Generated_Image_January_25_2026_-_7_56PM.png?v=1780922542',
          headline: 'এক্সক্লুসিভ কালেকশন ২০২৬',
          subheadline: 'শহরের সেরা আরামদায়ক ও প্রিমিয়াম কোয়ালিটি প্রোডাক্ট। সীমিত সময়ের জন্য বিশেষ ডিসকাউন্ট!',
          badgeText: '☀️ SUMMER COTTON SPECIAL',
          discountPrice: 999,
          features: ['১০০% প্রিমিয়াম ', 'অরিজিনাল ডিজাইন', 'ক্যাশ অন ডেলিভারি সুবিধা', 'সারা দেশে দ্রুত হোম ডেলিভারি'],
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 'lp-2',
          slug: 'indian-katan-special',
          title: 'Indian Katan Premium Offer',
          productId: 'led-high-tops-copy-copy-copy',
          bannerImage: 'https://cdn.shopify.com/s/files/1/0712/1820/0746/files/GeneratedImageDecember11_2025-9_24PM_1_1_0a4aaf81-51b5-4c82-a4c6-c28720493b07.png?v=1780922516',
          headline: 'প্রিমিয়াম প্রোডাক্ট',
          subheadline: 'প্রোডাক্ট!',
          badgeText: '👑 EXCLUSIVE',
          discountPrice: 1450,
          features: ['১০০% অরিজিনাল প্রিমিয়াম', 'সারা দেশে ক্যাশ অন ডেলিভারি'],
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ];
    }

    if (urlLandingPage) {
      const existsIdx = parsedList.findIndex(p => p.id === urlLandingPage!.id || p.slug === urlLandingPage!.slug);
      if (existsIdx !== -1) {
        parsedList[existsIdx] = { ...parsedList[existsIdx], ...urlLandingPage };
      } else {
        parsedList.unshift(urlLandingPage);
      }
    }

    return parsedList;
  });

  // Load landing pages from Firestore and server API on startup
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let firestoreLoaded = false;
    try {
      unsubscribe = onSnapshot(collection(db, "landing_pages"), async (snapshot) => {
        firestoreLoaded = true;
        if (!snapshot.empty) {
          const cloudPages: LandingPage[] = snapshot.docs.map(doc => doc.data() as LandingPage);
          let urlLandingPage: LandingPage | null = null;
          try {
            const urlParams = new URLSearchParams(window.location.search);
            const pdata = urlParams.get('pdata');
            if (pdata) {
              urlLandingPage = JSON.parse(decodeURIComponent(escape(atob(pdata))));
            }
          } catch (e) {}

          const result = [...cloudPages];
          if (urlLandingPage) {
            const idx = result.findIndex(p => p.id === urlLandingPage!.id || p.slug === urlLandingPage!.slug);
            if (idx !== -1) {
              result[idx] = { ...result[idx], ...urlLandingPage };
            } else {
              result.unshift(urlLandingPage);
            }
          }
          setLandingPages(result);
        } else {
          // If Firestore landing_pages is empty, seed default landing pages
          const defaultPages = [
            {
              id: 'lp-1',
              slug: 'summer-cotton-special',
              title: 'Summer Cotton Special Offer',
              productId: 'led-high-tops-copy-copy',
              bannerImage: 'https://cdn.shopify.com/s/files/1/0712/1820/0746/files/Generated_Image_January_25_2026_-_7_56PM.png?v=1780922542',
              headline: 'এক্সক্লুসিভ কালেকশন ২০২৬',
              subheadline: 'শহরের সেরা ও প্রিমিয়াম কোয়ালিটি প্রোডাক্ট। সীমিত সময়ের জন্য বিশেষ ডিসকাউন্ট!',
              badgeText: '☀️ SUMMER COTTON SPECIAL',
              discountPrice: 999,
              features: ['১০০% প্রিমিয়াম অরিজিনাল ডিজাইন', 'ক্যাশ অন ডেলিভারি সুবিধা', 'সারা দেশে দ্রুত হোম ডেলিভারি'],
              isActive: true,
              createdAt: new Date().toISOString()
            },
            {
              id: 'lp-2',
              slug: 'indian-katan-special',
              title: 'Indian Katan Premium Offer',
              productId: 'led-high-tops-copy-copy-copy',
              bannerImage: 'https://cdn.shopify.com/s/files/1/0712/1820/0746/files/GeneratedImageDecember11_2025-9_24PM_1_1_0a4aaf81-51b5-4c82-a4c6-c28720493b07.png?v=1780922516',
              headline: 'প্রিমিয়াম প্রোডাক্ট',
              subheadline: 'প্রিমিয়াম প্রোডাক্ট। ও আধুনিক অনন্য মেলবন্ধন!',
              badgeText: '👑 EXCLUSIVE',
              discountPrice: 1450,
              features: ['প্রিমিয়াম ডিজাইন', '১০০% অরিজিনাল প্রিমিয়াম সারা দেশে ক্যাশ অন ডেলিভারি'],
              isActive: true,
              createdAt: new Date().toISOString()
            }
          ];
          try {
            for (const p of defaultPages) {
              await setDoc(doc(db, "landing_pages", String(p.id)), p);
            }
          } catch (seedErr) {
            console.warn("Failed to seed initial landing pages:", seedErr);
          }
          setLandingPages(defaultPages as LandingPage[]);
        }
      }, (err) => {
        console.warn("Firestore landing_pages snapshot error, using API fallback:", err);
      });
    } catch (e) {
      console.warn("Firestore listener failed:", e);
    }

    const fetchLandingPages = async () => {
      try {
        const res = await fetch('/api/landing-pages');
        if (res.ok) {
          const serverPages = await res.json();
          if (!firestoreLoaded && Array.isArray(serverPages) && serverPages.length > 0) {
            let urlLandingPage: LandingPage | null = null;
            try {
              const urlParams = new URLSearchParams(window.location.search);
              const pdata = urlParams.get('pdata');
              if (pdata) {
                urlLandingPage = JSON.parse(decodeURIComponent(escape(atob(pdata))));
              }
            } catch (e) {
              console.warn('Failed to decode landing page from URL:', e);
            }

            const result = [...serverPages];
            if (urlLandingPage) {
              const existsIdx = result.findIndex(p => p.id === urlLandingPage!.id || p.slug === urlLandingPage!.slug);
              if (existsIdx !== -1) {
                result[existsIdx] = { ...result[existsIdx], ...urlLandingPage };
              } else {
                result.unshift(urlLandingPage);
              }
            }
            setLandingPages(result);
          }
        }
      } catch (err) {
        console.error("Failed to fetch landing pages from server:", err);
      }
    };

    fetchLandingPages();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Load products from Firestore and server API on startup
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let firestoreLoaded = false;
    
    try {
      unsubscribe = onSnapshot(collection(db, "products"), async (snapshot) => {
        firestoreLoaded = true; // Always mark as loaded if we get a response
        if (!snapshot.empty) {
          const cloudProducts = snapshot.docs.map(doc => doc.data() as Product);
          let urlProd = null;
          try {
            const urlParams = new URLSearchParams(window.location.search);
            const prodData = urlParams.get('prodData');
            if (prodData) {
              urlProd = JSON.parse(decodeURIComponent(escape(atob(prodData))));
            }
          } catch (e) {}
          const result = [...cloudProducts];
          if (urlProd && !result.some(p => p.id === urlProd.id)) {
            result.unshift(urlProd);
          }
          setProducts(result);
        } else {
          // If Firestore is truly empty, seed INITIAL_PRODUCTS to Firestore
          try {
            for (const p of INITIAL_PRODUCTS) {
              await setDoc(doc(db, "products", String(p.id)), p);
            }
          } catch (seedErr) {
            console.warn("Failed to seed initial products:", seedErr);
          }
          setProducts(INITIAL_PRODUCTS);
        }
      }, (err) => {
        console.warn("Firestore products snapshot error, using API fallback:", err);
      });
    } catch (e) {
      console.warn("Firestore listener failed:", e);
    }

    const fetchProductsAPI = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const serverProducts = await res.json();
          // Only use server fallback if Firestore hasn't loaded data
          if (!firestoreLoaded && Array.isArray(serverProducts) && serverProducts.length > 0) {
            let urlProd = null;
            try {
              const urlParams = new URLSearchParams(window.location.search);
              const prodData = urlParams.get('prodData');
              if (prodData) {
                urlProd = JSON.parse(decodeURIComponent(escape(atob(prodData))));
              }
            } catch (e) {}
            const result = [...serverProducts];
            if (urlProd && !result.some(p => p.id === urlProd.id)) {
              result.unshift(urlProd);
            }
            setProducts(result);
          }
        }
      } catch (err) {
        console.error("Failed to fetch products from server:", err);
      }
    };
    fetchProductsAPI();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);


  const addLandingPage = async (page: LandingPage) => {
    setLandingPages(prev => [page, ...prev]);
    try {
      await setDoc(doc(db, "landing_pages", String(page.id)), page);
    } catch (e) {
      console.warn("Failed to write landing page to Firestore:", e);
    }
    try {
      await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page)
      });
    } catch (err) {
      console.error("Failed to save landing page to server:", err);
    }
  };

  const updateLandingPage = async (page: LandingPage) => {
    setLandingPages(prev => prev.map(p => p.id === page.id ? page : p));
    try {
      await setDoc(doc(db, "landing_pages", String(page.id)), page);
    } catch (e) {
      console.warn("Failed to update landing page in Firestore:", e);
    }
    try {
      await fetch('/api/landing-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page)
      });
    } catch (err) {
      console.error("Failed to update landing page on server:", err);
    }
  };

  const deleteLandingPage = async (id: string) => {
    setLandingPages(prev => prev.filter(p => p.id !== id));
    try {
      await deleteDoc(doc(db, "landing_pages", String(id)));
    } catch (e) {
      console.warn("Failed to delete landing page from Firestore:", e);
    }
    try {
      await fetch(`/api/landing-pages/${id}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Failed to delete landing page from server:", err);
    }
  };

  const saveStoreSettingsToCloud = async (overrideSettings?: Record<string, any>) => {
    const payload = {
      storeLogo,
      storeBanner,
      storeName,
      storeFavicon,
      whatsappNumber,
      phoneNumber,
      messengerUrl,
      facebookPageUrl,
      heroBadge,
      heroTitle1,
      heroTitle2,
      heroSubtitle,
      headerBgColor,
      headerTextColor,
      showCategoryFilterBar,
      footerShow,
      footerBgColor,
      footerTextColor,
      footerText,
      footerAddress,
      footerPayments,
      btnInstantOrderShow,
      btnInstantOrderText,
      btnInstantOrderBgColor,
      btnInstantOrderTextColor,
      btnAddToCartShow,
      btnAddToCartText,
      btnAddToCartBgColor,
      btnAddToCartTextColor,
      btnDetailsShow,
      btnDetailsText,
      btnDetailsBgColor,
      btnDetailsTextColor,
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
      menuItems,
      categories,
      categoryImages,
      pixelId,
      pixelAccessToken,
      gtmId,
      courierService,
      courierApiKey,
      courierSecretKey,
      ...overrideSettings
    };

    try {
      await setDoc(doc(db, "settings", "store"), payload, { merge: true });
    } catch (e) {
      console.warn("Failed to save settings to Firestore:", e);
    }

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn("Failed to save settings to server API:", e);
    }
  };

  const isSettingsLoadedRef = useRef(false);

  // Real-time synchronization for Incomplete Orders
  useEffect(() => {
    // Immediate load from server API as primary/backup
    const loadIncompleteOrders = () => {
      fetch('/api/incomplete-orders')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const valid = data.filter((o: any) => {
              const ph = o.customer?.phone ? o.customer.phone.replace(/\D/g, '') : '';
              return ph.length >= 11;
            });
            setIncompleteOrders(valid);
          }
        })
        .catch(e => console.warn("Failed to load incomplete orders from server API:", e));
    };

    loadIncompleteOrders();
    // Poll every 10 seconds as a reliable fallback for adblockers / VPNs
    const pollInterval = setInterval(loadIncompleteOrders, 10000);

    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = onSnapshot(collection(db, "incompleteOrders"), (snapshot) => {
        if (!snapshot.empty) {
          const cloudIncompleteOrders = snapshot.docs
            .map(doc => doc.data() as Order)
            .filter(o => {
              const ph = o.customer?.phone ? o.customer.phone.replace(/\D/g, '') : '';
              return ph.length >= 11;
            });
          cloudIncompleteOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setIncompleteOrders(cloudIncompleteOrders);
        } else {
          // If Firestore is empty or cleared, fallback to API
          loadIncompleteOrders();
        }
      }, (err) => {
        console.warn("Firestore incompleteOrders snapshot error:", err);
      });
    } catch (e) {
      console.warn("Firestore incompleteOrders listener failed:", e);
    }
    return () => {
      clearInterval(pollInterval);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Real-time synchronization for Orders
  useEffect(() => {
    // Immediate load from server API as primary/backup
    const loadOrders = () => {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setOrders(prev => {
              if (prev.length > 0 && data.length > prev.length) {
                playOrderSuccessSound();
              }
              return data;
            });
          }
        })
        .catch(e => console.warn("Failed to load orders from server API:", e));
    };

    loadOrders();
    // Poll every 10 seconds as a reliable fallback for adblockers / VPNs
    const pollInterval = setInterval(loadOrders, 10000);

    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
        if (!snapshot.empty) {
          const cloudOrders = snapshot.docs.map(doc => doc.data() as Order);
          // sort by date descending
          cloudOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setOrders(prev => {
            if (prev.length > 0 && cloudOrders.length > prev.length) {
              playOrderSuccessSound();
            }
            return cloudOrders;
          });
        } else {
          // If Firestore is empty or cleared, fallback to API
          loadOrders();
        }
      }, (err) => {
        console.warn("Firestore orders snapshot error:", err);
      });
    } catch (e) {
      console.warn("Firestore orders listener failed:", e);
    }
    return () => {
      clearInterval(pollInterval);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Real-time synchronization for Store Settings with Firestore & Server API
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = onSnapshot(doc(db, "settings", "store"), (docSnap) => {
        isSettingsLoadedRef.current = true; // Always mark as loaded from Firestore
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.storeLogo !== undefined) setStoreLogo(data.storeLogo);
          if (data.storeBanner !== undefined) setStoreBanner(data.storeBanner);
          if (data.storeName !== undefined) {
            setStoreName(data.storeName);
            document.title = data.storeName;
          }
          if (data.storeFavicon !== undefined) setStoreFavicon(data.storeFavicon);
          if (data.whatsappNumber !== undefined) setWhatsappNumber(data.whatsappNumber);
          if (data.phoneNumber !== undefined) setPhoneNumber(data.phoneNumber);
          if (data.messengerUrl !== undefined) setMessengerUrl(data.messengerUrl);
          if (data.facebookPageUrl !== undefined) setFacebookPageUrl(data.facebookPageUrl);

          if (data.heroBadge !== undefined) setHeroBadge(data.heroBadge);
          if (data.heroTitle1 !== undefined) setHeroTitle1(data.heroTitle1);
          if (data.heroTitle2 !== undefined) setHeroTitle2(data.heroTitle2);
          if (data.heroSubtitle !== undefined) setHeroSubtitle(data.heroSubtitle);

          if (data.headerBgColor !== undefined) setHeaderBgColor(data.headerBgColor);
          if (data.headerTextColor !== undefined) setHeaderTextColor(data.headerTextColor);
          if (data.showCategoryFilterBar !== undefined) setShowCategoryFilterBar(data.showCategoryFilterBar);

          if (data.footerShow !== undefined) setFooterShow(data.footerShow);
          if (data.footerBgColor !== undefined) setFooterBgColor(data.footerBgColor);
          if (data.footerTextColor !== undefined) setFooterTextColor(data.footerTextColor);
          if (data.footerText !== undefined) setFooterText(data.footerText);
          if (data.footerAddress !== undefined) setFooterAddress(data.footerAddress);
          if (data.footerPayments !== undefined) setFooterPayments(data.footerPayments);

          if (data.btnInstantOrderShow !== undefined) setBtnInstantOrderShow(data.btnInstantOrderShow);
          if (data.btnInstantOrderText !== undefined) setBtnInstantOrderText(data.btnInstantOrderText);
          if (data.btnInstantOrderBgColor !== undefined) setBtnInstantOrderBgColor(data.btnInstantOrderBgColor);
          if (data.btnInstantOrderTextColor !== undefined) setBtnInstantOrderTextColor(data.btnInstantOrderTextColor);

          if (data.btnAddToCartShow !== undefined) setBtnAddToCartShow(data.btnAddToCartShow);
          if (data.btnAddToCartText !== undefined) setBtnAddToCartText(data.btnAddToCartText);
          if (data.btnAddToCartBgColor !== undefined) setBtnAddToCartBgColor(data.btnAddToCartBgColor);
          if (data.btnAddToCartTextColor !== undefined) setBtnAddToCartTextColor(data.btnAddToCartTextColor);

          if (data.btnDetailsShow !== undefined) setBtnDetailsShow(data.btnDetailsShow);
          if (data.btnDetailsText !== undefined) setBtnDetailsText(data.btnDetailsText);
          if (data.btnDetailsBgColor !== undefined) setBtnDetailsBgColor(data.btnDetailsBgColor);
          if (data.btnDetailsTextColor !== undefined) setBtnDetailsTextColor(data.btnDetailsTextColor);

          if (data.shippingInsideCost !== undefined) setShippingInsideCost(Number(data.shippingInsideCost));
          if (data.shippingInsideText !== undefined) setShippingInsideText(data.shippingInsideText);
          if (data.shippingInsideDesc !== undefined) setShippingInsideDesc(data.shippingInsideDesc);
          if (data.shippingInsideShow !== undefined) setShippingInsideShow(Boolean(data.shippingInsideShow));

          if (data.shippingOutsideCost !== undefined) setShippingOutsideCost(Number(data.shippingOutsideCost));
          if (data.shippingOutsideText !== undefined) setShippingOutsideText(data.shippingOutsideText);
          if (data.shippingOutsideDesc !== undefined) setShippingOutsideDesc(data.shippingOutsideDesc);
          if (data.shippingOutsideShow !== undefined) setShippingOutsideShow(Boolean(data.shippingOutsideShow));

          if (data.freeShippingEnabled !== undefined) setFreeShippingEnabled(Boolean(data.freeShippingEnabled));
          if (data.freeShippingThreshold !== undefined) setFreeShippingThreshold(Number(data.freeShippingThreshold));

          if (data.menuItems !== undefined) setMenuItems(data.menuItems);
          if (data.categories !== undefined) setCategories(data.categories);
          if (data.categoryImages !== undefined) setCategoryImages(data.categoryImages);

          if (data.pixelId !== undefined) setPixelId(data.pixelId);
          if (data.pixelAccessToken !== undefined) setPixelAccessToken(data.pixelAccessToken);
          if (data.gtmId !== undefined) setGtmId(data.gtmId);
          if (data.courierService !== undefined) setCourierService(data.courierService);
          if (data.courierApiKey !== undefined) setCourierApiKey(data.courierApiKey);
          if (data.courierSecretKey !== undefined) setCourierSecretKey(data.courierSecretKey);

          isSettingsLoadedRef.current = true;
        }
      }, (err) => {
        console.warn("Firestore settings snapshot error, using API fallback:", err);
      });
    } catch (e) {
      console.warn("Firestore settings listener failed:", e);
    }

    // Fallback API fetch
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (!isSettingsLoadedRef.current && data && typeof data === 'object' && Object.keys(data).length > 0) {
          if (data.storeLogo !== undefined) setStoreLogo(data.storeLogo);
          if (data.storeBanner !== undefined) setStoreBanner(data.storeBanner);
          if (data.storeName !== undefined) {
            setStoreName(data.storeName);
            document.title = data.storeName;
          }
          if (data.storeFavicon !== undefined) setStoreFavicon(data.storeFavicon);
          if (data.whatsappNumber !== undefined) setWhatsappNumber(data.whatsappNumber);
          if (data.phoneNumber !== undefined) setPhoneNumber(data.phoneNumber);
          if (data.messengerUrl !== undefined) setMessengerUrl(data.messengerUrl);
          if (data.facebookPageUrl !== undefined) setFacebookPageUrl(data.facebookPageUrl);

          if (data.heroBadge !== undefined) setHeroBadge(data.heroBadge);
          if (data.heroTitle1 !== undefined) setHeroTitle1(data.heroTitle1);
          if (data.heroTitle2 !== undefined) setHeroTitle2(data.heroTitle2);
          if (data.heroSubtitle !== undefined) setHeroSubtitle(data.heroSubtitle);

          if (data.headerBgColor !== undefined) setHeaderBgColor(data.headerBgColor);
          if (data.headerTextColor !== undefined) setHeaderTextColor(data.headerTextColor);
          if (data.showCategoryFilterBar !== undefined) setShowCategoryFilterBar(data.showCategoryFilterBar);

          if (data.footerShow !== undefined) setFooterShow(data.footerShow);
          if (data.footerBgColor !== undefined) setFooterBgColor(data.footerBgColor);
          if (data.footerTextColor !== undefined) setFooterTextColor(data.footerTextColor);
          if (data.footerText !== undefined) setFooterText(data.footerText);
          if (data.footerAddress !== undefined) setFooterAddress(data.footerAddress);
          if (data.footerPayments !== undefined) setFooterPayments(data.footerPayments);

          if (data.btnInstantOrderShow !== undefined) setBtnInstantOrderShow(data.btnInstantOrderShow);
          if (data.btnInstantOrderText !== undefined) setBtnInstantOrderText(data.btnInstantOrderText);
          if (data.btnInstantOrderBgColor !== undefined) setBtnInstantOrderBgColor(data.btnInstantOrderBgColor);
          if (data.btnInstantOrderTextColor !== undefined) setBtnInstantOrderTextColor(data.btnInstantOrderTextColor);

          if (data.btnAddToCartShow !== undefined) setBtnAddToCartShow(data.btnAddToCartShow);
          if (data.btnAddToCartText !== undefined) setBtnAddToCartText(data.btnAddToCartText);
          if (data.btnAddToCartBgColor !== undefined) setBtnAddToCartBgColor(data.btnAddToCartBgColor);
          if (data.btnAddToCartTextColor !== undefined) setBtnAddToCartTextColor(data.btnAddToCartTextColor);

          if (data.btnDetailsShow !== undefined) setBtnDetailsShow(data.btnDetailsShow);
          if (data.btnDetailsText !== undefined) setBtnDetailsText(data.btnDetailsText);
          if (data.btnDetailsBgColor !== undefined) setBtnDetailsBgColor(data.btnDetailsBgColor);
          if (data.btnDetailsTextColor !== undefined) setBtnDetailsTextColor(data.btnDetailsTextColor);

          if (data.shippingInsideCost !== undefined) setShippingInsideCost(Number(data.shippingInsideCost));
          if (data.shippingInsideText !== undefined) setShippingInsideText(data.shippingInsideText);
          if (data.shippingInsideDesc !== undefined) setShippingInsideDesc(data.shippingInsideDesc);
          if (data.shippingInsideShow !== undefined) setShippingInsideShow(Boolean(data.shippingInsideShow));

          if (data.shippingOutsideCost !== undefined) setShippingOutsideCost(Number(data.shippingOutsideCost));
          if (data.shippingOutsideText !== undefined) setShippingOutsideText(data.shippingOutsideText);
          if (data.shippingOutsideDesc !== undefined) setShippingOutsideDesc(data.shippingOutsideDesc);
          if (data.shippingOutsideShow !== undefined) setShippingOutsideShow(Boolean(data.shippingOutsideShow));

          if (data.freeShippingEnabled !== undefined) setFreeShippingEnabled(Boolean(data.freeShippingEnabled));
          if (data.freeShippingThreshold !== undefined) setFreeShippingThreshold(Number(data.freeShippingThreshold));

          if (data.menuItems !== undefined) setMenuItems(data.menuItems);
          if (data.categories !== undefined) setCategories(data.categories);
          if (data.categoryImages !== undefined) setCategoryImages(data.categoryImages);

          if (data.pixelId !== undefined) setPixelId(data.pixelId);
          if (data.pixelAccessToken !== undefined) setPixelAccessToken(data.pixelAccessToken);
          if (data.gtmId !== undefined) setGtmId(data.gtmId);
          if (data.courierService !== undefined) setCourierService(data.courierService);
          if (data.courierApiKey !== undefined) setCourierApiKey(data.courierApiKey);
          if (data.courierSecretKey !== undefined) setCourierSecretKey(data.courierSecretKey);

          isSettingsLoadedRef.current = true;
        }
      })
      .catch(e => console.warn("API settings fetch error:", e));

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_whatsapp_number', whatsappNumber);
  }, [whatsappNumber]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_phone_number', phoneNumber);
  }, [phoneNumber]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_messenger_url', messengerUrl);
  }, [messengerUrl]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_fb_page_url', facebookPageUrl);
  }, [facebookPageUrl]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_hero_badge', heroBadge);
  }, [heroBadge]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_hero_title1', heroTitle1);
  }, [heroTitle1]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_hero_title2', heroTitle2);
  }, [heroTitle2]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_hero_subtitle', heroSubtitle);
  }, [heroSubtitle]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_store_logo', storeLogo);
  }, [storeLogo]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_store_banner', storeBanner);
  }, [storeBanner]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_store_name', storeName);
    document.title = storeName;
  }, [storeName]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_store_favicon', storeFavicon);
    let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = storeFavicon;
  }, [storeFavicon]);

  const [orders, setOrders] = useState<Order[]>([]);

  const [blockedPhones, setBlockedPhones] = useState<string[]>(() => {
    try {
      const storedBlocked = localStorage.getItem('Shoker ghor_blocked_phones');
      if (storedBlocked) return JSON.parse(storedBlocked);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [enableDailyLimit, setEnableDailyLimit] = useState<boolean>(() => {
    const saved = localStorage.getItem('Shoker ghor_enable_daily_limit');
    return saved ? saved === 'true' : true;
  });

  const [whitelistedPhones, setWhitelistedPhones] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('Shoker ghor_whitelisted_phones');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    // Clear old cache to force fresh fetch
    localStorage.removeItem('Shoker ghor_categories');

    return ['১ পিস প্রোডাক্ট অফার', '২ পিস প্রোডাক্ট (কম্বো অফার)', '৩ পিস প্রোডাক্ট (ধামাকা কম্বো)', ' প্রোডাক্ট'];
  });

  const [categoryImages, setCategoryImages] = useState<Record<string, string[]>>(() => {
    const stored = localStorage.getItem('Shoker ghor_category_images');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const migrated: Record<string, string[]> = {};
        Object.keys(parsed).forEach(k => {
          if (Array.isArray(parsed[k])) {
            migrated[k] = parsed[k];
          } else if (typeof parsed[k] === 'string') {
            migrated[k] = [parsed[k], '', ''];
          }
        });
        return migrated;
      } catch (e) {}
    }
    return {
      '১ পিস প্রোডাক্ট অফার': ['https://images.unsplash.com/photo-1583391733959-b0510f6992dd?auto=format&fit=crop&q=80&w=800', '', ''],
      '২ পিস প্রোডাক্ট (কম্বো অফার)': ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&q=80&w=800', '', ''],
      '৩ পিস প্রোডাক্ট (ধামাকা কম্বো)': ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&q=80&w=800', '', ''],
      'প্রোডাক্ট': ['https://images.unsplash.com/photo-1583391733959-b0510f6992dd?auto=format&fit=crop&q=80&w=800', '', ''],
    };
  });

  useEffect(() => {
    localStorage.setItem('Shoker ghor_category_images', JSON.stringify(categoryImages));
  }, [categoryImages]);

  const [consignmentMap, setConsignmentMap] = useState<Record<string, string>>(() => {
    try {
      const storedConsignments = localStorage.getItem('Shoker ghor_consignments');
      if (storedConsignments) return JSON.parse(storedConsignments);
    } catch (e) {
      console.error(e);
    }
    return {};
  });

  const [incompleteOrders, setIncompleteOrders] = useState<Order[]>([]);

  const [steadfastBalance, setSteadfastBalance] = useState<number>(() => {
    const saved = localStorage.getItem('Shoker ghor_steadfast_balance');
    return saved ? Number(saved) : 0;
  });

  const [steadfastPaidOut, setSteadfastPaidOut] = useState<number>(() => {
    const saved = localStorage.getItem('Shoker ghor_steadfast_paid_out');
    return saved ? Number(saved) : 0;
  });

  const [discountCodes, setDiscountCodes] = useState<DiscountCode[]>(() => {
    try {
      const stored = localStorage.getItem('Shoker ghor_discount_codes');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error(e);
    }
    return [
      { code: 'Shoker ghor100', type: 'fixed', value: 100, minPurchase: 1000, isActive: true },
      { code: 'FREE50', type: 'fixed', value: 50, minPurchase: 500, isActive: true },
      { code: 'PROMO10', type: 'percentage', value: 10, minPurchase: 1000, isActive: true }
    ];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('Shoker ghor_discount_codes', JSON.stringify(discountCodes));
  }, [discountCodes]);

  useEffect(() => {
    if (products.length > 0) {
      // Products are synced via backend, localStorage not needed
    }
  }, [products]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_pixel_id', pixelId);
  }, [pixelId]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_pixel_token', pixelAccessToken);
  }, [pixelAccessToken]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_gtm_id', gtmId);
  }, [gtmId]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_admin_username', adminUsername);
  }, [adminUsername]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_admin_password', adminPassword);
  }, [adminPassword]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_courier_service', courierService);
  }, [courierService]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_courier_api_key', courierApiKey);
  }, [courierApiKey]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_courier_secret_key', courierSecretKey);
  }, [courierSecretKey]);


  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'Shoker ghor_orders' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            if (parsed.length > orders.length) {
              playOrderSuccessSound();
            }
            setOrders(parsed);
          }
        } catch (err) {
          console.error("Error syncing cross-tab orders:", err);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [orders.length]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_blocked_phones', JSON.stringify(blockedPhones));
  }, [blockedPhones]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_enable_daily_limit', String(enableDailyLimit));
  }, [enableDailyLimit]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_whitelisted_phones', JSON.stringify(whitelistedPhones));
  }, [whitelistedPhones]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_consignments', JSON.stringify(consignmentMap));
  }, [consignmentMap]);

  useEffect(() => {
    if (categories.length > 0) {
      // Categories are synced via backend, localStorage not needed
    }
  }, [categories]);


  useEffect(() => {
    localStorage.setItem('Shoker ghor_steadfast_balance', String(steadfastBalance));
  }, [steadfastBalance]);

  useEffect(() => {
    localStorage.setItem('Shoker ghor_steadfast_paid_out', String(steadfastPaidOut));
  }, [steadfastPaidOut]);

  // Auto-sync settings to Firestore & API whenever ANY setting state updates
  useEffect(() => {
    if (!isSettingsLoadedRef.current) return;

    const timer = setTimeout(() => {
      saveStoreSettingsToCloud();
    }, 300);

    return () => clearTimeout(timer);
  }, [
    storeLogo, storeBanner, storeName, storeFavicon, whatsappNumber, phoneNumber, messengerUrl, facebookPageUrl,
    heroBadge, heroTitle1, heroTitle2, heroSubtitle, headerBgColor, headerTextColor, footerShow, footerBgColor,
    footerTextColor, footerText, footerAddress, footerPayments, btnInstantOrderShow, btnInstantOrderText,
    btnInstantOrderBgColor, btnInstantOrderTextColor, btnAddToCartShow, btnAddToCartText, btnAddToCartBgColor,
    btnAddToCartTextColor, btnDetailsShow, btnDetailsText, btnDetailsBgColor, btnDetailsTextColor,
    shippingInsideCost, shippingInsideText, shippingInsideDesc, shippingInsideShow, shippingOutsideCost,
    shippingOutsideText, shippingOutsideDesc, shippingOutsideShow, freeShippingEnabled, freeShippingThreshold,
    menuItems, categories, categoryImages, pixelId, pixelAccessToken, gtmId, courierService, courierApiKey, courierSecretKey
  ]);

  const addToCart = (product: Product, size: CartItem['size'], quantity: number) => {
    setCart((prev) => {
      const existing = prev.find(item => item.productId === product.id && item.size === size);
      if (existing) {
        return prev.map(item =>
          item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prev, { id: crypto.randomUUID(), productId: product.id, product, size, quantity }];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart((prev) => prev.filter(item => item.id !== cartItemId));
  };

  const updateCartQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart((prev) =>
      prev.map(item => item.id === cartItemId ? { ...item, quantity } : item)
    );
  };

  const clearCart = () => setCart([]);

  const loginAdmin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('Shoker ghor_admin', 'true');
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('Shoker ghor_admin');
  };

  const addProduct = async (product: Product) => {
    setProducts(prev => [product, ...prev]);
    try {
      await setDoc(doc(db, "products", String(product.id)), product);
    } catch (e) {
      console.warn("Failed to write product to Firestore:", e);
    }
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
    } catch (err) {
      console.error("Failed to add product to server database:", err);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    setCart(prev => prev.map(item => item.productId === updatedProduct.id ? { ...item, product: updatedProduct } : item));
    try {
      await setDoc(doc(db, "products", String(updatedProduct.id)), updatedProduct);
    } catch (e) {
      console.warn("Failed to update product in Firestore:", e);
    }
    try {
      await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProduct)
      });
    } catch (err) {
      console.error("Failed to update product on server database:", err);
    }
  };

  const deleteProduct = async (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setCart(prev => prev.filter(item => item.productId !== productId));
    try {
      await deleteDoc(doc(db, "products", String(productId)));
    } catch (e) {
      console.warn("Failed to delete product from Firestore:", e);
    }
    try {
      await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.error("Failed to delete product from server database:", err);
    }
  };

  const deleteMultipleProducts = async (productIds: string[]) => {
    setProducts(prev => prev.filter(p => !productIds.includes(String(p.id))));
    setCart(prev => prev.filter(item => !productIds.includes(String(item.productId))));
    try {
      const batch = writeBatch(db);
      productIds.forEach(id => {
        batch.delete(doc(db, "products", String(id)));
      });
      await batch.commit();
    } catch (e) {
      console.warn("Failed to delete products via Firestore batch:", e);
    }
    try {
      await Promise.all(productIds.map(id => 
        fetch(`/api/products/${id}`, { method: 'DELETE' }).catch(err => 
          console.error(`Failed to delete product ${id} from server:`, err)
        )
      ));
    } catch (err) {
      console.error("Failed to delete products from server database:", err);
    }
  };

  const placeOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      date: new Date().toISOString(),
      status: 'pending'
    };
    setOrders(prev => [newOrder, ...prev]);

    // Play high quality chime tone
    playOrderSuccessSound();

    // Auto-remove any incomplete orders with the same phone number
    if (orderData.customer?.phone) {
      const cleanTargetPhone = orderData.customer.phone.replace(/\D/g, '');
      setIncompleteOrders(prev => {
        const toKeep: Order[] = [];
        const toRemove: string[] = [];
        prev.forEach(io => {
          const cleanIOPhone = io.customer?.phone?.replace(/\D/g, '') || '';
          if (cleanIOPhone !== cleanTargetPhone) {
            toKeep.push(io);
          } else {
            toRemove.push(io.id);
          }
        });
        
        // Remove backend API
        toRemove.forEach(async (id) => {
          try {
            await fetch(`/api/incomplete-orders/${id}`, { method: 'DELETE' });
          } catch (e) {}
        });
        
        return toKeep;
      });
    }

    clearCart();
    
    // Save to Firestore client-side as redundant backup
    if (db) {
      try {
        await setDoc(doc(db, "orders", newOrder.id), newOrder);
      } catch (e) {
        console.warn("Failed client-side Firestore write:", e);
      }
    }

    // Save directly to server central database (which handles Firestore writing on backend securely)
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      });
    } catch (err) {
      console.error("Failed to save order to server API:", err);
    }
  };

  const addOrUpdateIncompleteOrder = async (id: string, orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    const phoneClean = orderData.customer?.phone ? orderData.customer.phone.replace(/\D/g, '') : '';
    if (!phoneClean || phoneClean.length < 11) {
      return;
    }
    let newIncomplete: Order | null = null;
    setIncompleteOrders(prev => {
      const exists = prev.some(o => o.id === id);
      if (exists) {
        return prev.map(o => {
          if (o.id === id) {
            newIncomplete = {
              ...o,
              customer: orderData.customer,
              items: orderData.items,
              total: orderData.total,
              paymentMethod: orderData.paymentMethod
            };
            return newIncomplete;
          }
          return o;
        });
      } else {
        newIncomplete = {
          ...orderData,
          id,
          date: new Date().toISOString(),
          status: 'incomplete'
        };
        return [newIncomplete, ...prev];
      }
    });

    if (newIncomplete) {
      if (db) {
        try {
          await setDoc(doc(db, "incompleteOrders", id), newIncomplete, { merge: true });
          await setDoc(doc(db, "draft_orders", id), newIncomplete, { merge: true });
        } catch (e) {
          console.warn("Failed client-side Firestore incomplete/draft write:", e);
        }
      }
      try {
        await fetch('/api/incomplete-orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newIncomplete)
        });
      } catch (err) {
        console.error("Failed to save incomplete order to server API:", err);
      }
    }
  };

  const deleteIncompleteOrder = async (id: string) => {
    setIncompleteOrders(prev => prev.filter(o => o.id !== id));
    if (db) {
      try {
        await deleteDoc(doc(db, "incompleteOrders", id));
        await deleteDoc(doc(db, "draft_orders", id));
      } catch (e) {}
    }
    try {
      await fetch(`/api/incomplete-orders/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    let updatedOrder: Order | undefined;
    setOrders(prev => {
      const list = prev.map(o => o.id === orderId ? { ...o, status } : o);
      updatedOrder = list.find(o => o.id === orderId);
      return list;
    });
    if (updatedOrder) {
      if (db) {
        try {
          await setDoc(doc(db, "orders", orderId), { status }, { merge: true });
        } catch (e) {
          console.warn("Failed client-side Firestore status update:", e);
        }
      }
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedOrder)
        });
      } catch (err) {
        console.error("Failed to update order status on server API:", err);
      }
    }
  };

  const updateOrderMetaSynced = async (orderId: string, synced: boolean) => {
    let updatedOrder: Order | undefined;
    setOrders(prev => {
      const list = prev.map(o => o.id === orderId ? { ...o, metaSynced: synced } : o);
      updatedOrder = list.find(o => o.id === orderId);
      return list;
    });
    if (updatedOrder) {
      if (db) {
        try {
          await setDoc(doc(db, "orders", orderId), { metaSynced: synced }, { merge: true });
        } catch (e) {
          console.warn("Failed client-side Firestore metaSynced update:", e);
        }
      }
      try {
        await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedOrder)
        });
      } catch (err) {
        console.error("Failed to update order metaSynced on server API:", err);
      }
    }
  };

  const deleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    if (db) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
      } catch (e) {}
    }
    try {
      await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const blockPhone = (phone: string) => {
    if (!blockedPhones.includes(phone)) {
      setBlockedPhones(prev => [...prev, phone]);
    }
  };

  const unblockPhone = (phone: string) => {
    setBlockedPhones(prev => prev.filter(p => p !== phone));
  };

  const isPhoneBlocked = (phone: string) => {
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone) return false;
    return blockedPhones.some(p => {
      const cleanBlocked = p.trim().replace(/[^0-9]/g, '');
      if (!cleanBlocked) return false;
      return cleanPhone === cleanBlocked || cleanPhone.endsWith(cleanBlocked) || cleanBlocked.endsWith(cleanPhone);
    });
  };

  const whitelistPhone = (phone: string) => {
    if (!whitelistedPhones.includes(phone)) {
      setWhitelistedPhones(prev => [...prev, phone]);
    }
  };

  const unwhitelistPhone = (phone: string) => {
    setWhitelistedPhones(prev => prev.filter(p => p !== phone));
  };

  const isPhoneWhitelisted = (phone: string) => {
    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone) return false;
    return whitelistedPhones.some(p => {
      const cleanWhitelisted = p.trim().replace(/[^0-9]/g, '');
      if (!cleanWhitelisted) return false;
      return cleanPhone === cleanWhitelisted || cleanPhone.endsWith(cleanWhitelisted) || cleanWhitelisted.endsWith(cleanPhone);
    });
  };

  const isDailyOrderLimitReached = (phone: string) => {
    if (!enableDailyLimit) return false;
    if (isPhoneWhitelisted(phone)) return false;

    const cleanPhone = phone.trim().replace(/[^0-9]/g, '');
    if (!cleanPhone) return false;

    const todayStr = new Date().toLocaleDateString('en-CA');
    
    return orders.some(order => {
      const orderCleanPhone = order.customer.phone.trim().replace(/[^0-9]/g, '');
      if (orderCleanPhone !== cleanPhone) return false;
      
      const orderLocalDate = new Date(order.date).toLocaleDateString('en-CA');
      return orderLocalDate === todayStr;
    });
  };


  const setCategoryImage = (category: string, index: number, url: string) => {
    setCategoryImages(prev => {
      const current = prev[category] || ['', '', ''];
      const next = [...current];
      next[index] = url;
      return { ...prev, [category]: next };
    });
  };

  const addCategory = (category: Category) => {
    const trimmed = category.trim();
    if (trimmed) {
      setCategories(prev => Array.from(new Set([...prev, trimmed])));
    }
  };

  const deleteCategory = (categoryToDelete: Category) => {
    setCategories(prev => prev.filter(c => c !== categoryToDelete));
  };

  const isPlaceholderKey = (key: string) => {
    const k = (key || '').trim();
    return !k || k === 'SF_LIVE_API_KEY_7739' || k === 'SF_LIVE_SECRET_9831' || k === '';
  };

  const sendOrderToCourier = async (orderId: string): Promise<{ success: boolean; trackingCode?: string; message?: string }> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return { success: false, message: 'অর্ডারটি খুঁজে পাওয়া যায়নি' };
    }

    if (isPlaceholderKey(courierApiKey) || isPlaceholderKey(courierSecretKey)) {
      return {
        success: false,
        message: 'কুরিয়ার ক্রেডেনশিয়াল সেট করা হয়নি। দয়া করে এডমিন ড্যাশবোর্ডের "Courier" -> "Settings" ট্যাবে গিয়ে আপনার Steadfast API Key এবং Secret Key সেভ করুন।'
      };
    }

    // Clean and sanitize Bangladeshi phone number: must be 11 digits starting with 01
    let cleanPhone = order.customer.phone.replace(/\D/g, ''); // keep only digits
    
    // If it contains 8801... and is preceded by zeros or other characters, extract the '01...' part
    if (cleanPhone.includes('8801')) {
      const idx = cleanPhone.indexOf('8801');
      cleanPhone = cleanPhone.substring(idx + 2); // keeps '01...'
    }
    
    // Remove remaining leading country code prefixes if any
    if (cleanPhone.startsWith('880')) {
      cleanPhone = cleanPhone.substring(2);
    } else if (cleanPhone.startsWith('88')) {
      cleanPhone = cleanPhone.substring(2);
    }
    
    // If it is 10 digits and starts with '1', prepend '0'
    if (cleanPhone.length === 10 && cleanPhone.startsWith('1')) {
      cleanPhone = '0' + cleanPhone;
    }

    // Sanitize and truncate other fields to prevent API validation errors
    const sanitizedRecipientName = order.customer.name.trim().substring(0, 90) || 'Customer';
    const rawAddress = `${order.customer.address}, ${order.customer.city || ''}`.trim();
    const sanitizedAddress = rawAddress.replace(/,\s*,/g, ',').replace(/,$/g, '').substring(0, 240) || 'Dhaka';

    // Prepare note with item titles & sizes (truncated to avoid going over limits)
    const itemsNote = order.items.map(item => {
      const prod = products.find(p => p.id === item.productId);
      const title = prod ? prod.title : 'প্রোডাক্ট';
      return `${title} (সাইজ: ${item.size}, পরিমাণ: ${item.quantity})`;
    }).join('; ').substring(0, 450);

    const payload = {
      invoice: order.id,
      recipient_name: sanitizedRecipientName,
      recipient_phone: cleanPhone,
      recipient_address: sanitizedAddress,
      cod_amount: Math.round(Number(order.total) || 0),
      note: itemsNote
    };

    try {
      // Call local proxy instead of Steadfast directly to avoid CORS
      const response = await fetch('/api/steadfast/create_order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          apiKey: courierApiKey.trim(),
          secretKey: courierSecretKey.trim(),
          payload
        })
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.status === 404 || contentType.includes('text/html')) {
        throw new Error('StaticDeploy');
      }

      const data = await response.json();

      if (response.ok && (data.status === 200 || data.consignment)) {
        const trackingCode = data.consignment?.tracking_code || data.consignment?.consignment_id || `SF-${Math.floor(100000 + Math.random() * 900000)}`;
        setConsignmentMap(prev => {
          const next = { ...prev, [orderId]: String(trackingCode) };
          localStorage.setItem('Shoker ghor_consignments', JSON.stringify(next));
          return next;
        });
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
        return { 
          success: true, 
          trackingCode: String(trackingCode), 
          message: data.message || 'SteadFast মার্চেন্ট প্যানেলে সফলভাবে এন্ট্রি হয়েছে এবং In Review স্ট্যাটাস সেট হয়েছে!' 
        };
      } else {
        let errMsg = data.message;
        if (data.errors) {
          errMsg = Object.entries(data.errors)
            .map(([field, errs]) => `${field}: ${Array.isArray(errs) ? errs.join(', ') : errs}`)
            .join('; ');
        }
        errMsg = errMsg || 'ক্রেডেনশিয়াল বা ডাটা ভুল রয়েছে। দয়া করে এডমিন সেটিংসে আপনার Steadfast API Key ও Secret Key চেক করুন।';
        return { 
          success: false, 
          message: `Steadfast মার্চেন্ট প্যানেল রেসপন্স: ${errMsg}` 
        };
      }
    } catch (err: any) {
      console.warn('Steadfast API proxy error, trying direct browser request...', err);
      // Fallback: Direct client-side fetch (using Bangladeshi user's IP directly from their browser)
      try {
        const directRes = await fetch('https://portal.steadfast.com.bd/api/v1/create_order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Api-Key': courierApiKey.trim(),
            'Secret-Key': courierSecretKey.trim(),
          },
          body: JSON.stringify(payload)
        });
        const directData = await directRes.json();
        if (directRes.ok && (directData.status === 200 || directData.consignment)) {
          const trackingCode = directData.consignment?.tracking_code || directData.consignment?.consignment_id || `SF-${Math.floor(100000 + Math.random() * 900000)}`;
          setConsignmentMap(prev => {
            const next = { ...prev, [orderId]: String(trackingCode) };
            localStorage.setItem('Shoker ghor_consignments', JSON.stringify(next));
            return next;
          });
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
          return {
            success: true,
            trackingCode: String(trackingCode),
            message: 'সার্ভার কানেকশন এরর থাকায় সরাসরি আপনার ব্রাউজার থেকে SteadFast মার্চেন্ট প্যানেলে সফলভাবে সিঙ্ক করা হয়েছে!'
          };
        } else {
          throw new Error(directData.message || 'Direct API error');
        }
      } catch (directErr: any) {
        // Try packzy
        try {
          const packzyRes = await fetch('https://portal.packzy.com/api/v1/create_order', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Api-Key': courierApiKey.trim(),
              'Secret-Key': courierSecretKey.trim(),
            },
            body: JSON.stringify(payload)
          });
          const packzyData = await packzyRes.json();
          if (packzyRes.ok && (packzyData.status === 200 || packzyData.consignment)) {
            const trackingCode = packzyData.consignment?.tracking_code || packzyData.consignment?.consignment_id || `SF-${Math.floor(100000 + Math.random() * 900000)}`;
            setConsignmentMap(prev => {
              const next = { ...prev, [orderId]: String(trackingCode) };
              localStorage.setItem('Shoker ghor_consignments', JSON.stringify(next));
              return next;
            });
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
            return {
              success: true,
              trackingCode: String(trackingCode),
              message: 'সার্ভার কানেকশন এরর থাকায় সরাসরি আপনার ব্রাউজার থেকে Packzy এপিআইতে সফলভাবে সিঙ্ক করা হয়েছে!'
            };
          }
        } catch (e) {}
      }

      const isStaticDeploy = err.message === 'StaticDeploy';
      return { 
        success: false, 
        message: isStaticDeploy 
          ? 'হোস্টিং সার্ভারে ব্যাকএন্ড (Node.js) সচল নেই বা এপিআই রুট ব্লকড। দয়া করে Orders টেবিল থেকে CSV ডাউনলোড করে সরাসরি Steadfast মার্চেন্ট প্যানেলে বাল্ক আপলোড করুন অথবা cPanel-এ Node.js Setup সম্পন্ন করুন।'
          : 'কানেকশন বা হোস্টিং সার্ভারে সমস্যা হয়েছে। Steadfast-এ অর্ডার সরাসরি পৌঁছায়নি। অনুগ্রহ করে CSV ফাইলে অর্ডার এক্সপোর্ট করে মার্চেন্ট প্যানেলে বাল্ক আপলোড করুন।' 
      };
    }
  };

  const resetCourierStatus = (orderId: string) => {
    setConsignmentMap(prev => {
      const next = { ...prev };
      delete next[orderId];
      localStorage.setItem('Shoker ghor_consignments', JSON.stringify(next));
      return next;
    });
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'pending' } : o));
  };

  const checkBalance = async (): Promise<{ success: boolean; balance?: number; message?: string }> => {
    if (isPlaceholderKey(courierApiKey) || isPlaceholderKey(courierSecretKey)) {
      return {
        success: false,
        message: 'কুরিয়ার ক্রেডেনশিয়াল সেট করা হয়নি। দয়া করে এডমিন ড্যাশবোর্ডের "Courier" -> "Settings" ট্যাবে গিয়ে আপনার Steadfast API Key এবং Secret Key সেভ করুন।'
      };
    }

    try {
      const response = await fetch('/api/steadfast/get_balance', {
        method: 'GET',
        headers: {
          'api-key': courierApiKey.trim(),
          'secret-key': courierSecretKey.trim(),
        },
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.status === 404 || contentType.includes('text/html')) {
        throw new Error('StaticDeploy');
      }

      const data = await response.json();
      
      // Support multiple possible key names from the proxy/Steadfast API (e.g., current_balance, balance, currentBalance)
      const hasBalanceField = data && (
        data.current_balance !== undefined || 
        data.balance !== undefined || 
        data.currentBalance !== undefined ||
        data.status === 200
      );

      if (response.ok && hasBalanceField) {
        const rawBalance = data.current_balance !== undefined ? data.current_balance : 
                           data.balance !== undefined ? data.balance :
                           data.currentBalance !== undefined ? data.currentBalance : 
                           (data.status === 200 && typeof data.message === 'number' ? data.message : 0);
        const balance = Number(rawBalance || 0);
        setSteadfastBalance(balance);
        return { success: true, balance };
      } else {
        const errMsg = data.message || 'ব্যালেন্স চেক করার সময় কোনো ত্রুটি হয়েছে। অনুগ্রহ করে এপিআই কি ও সিক্রেট কি চেক করুন।';
        return { success: false, message: errMsg };
      }
    } catch (err: any) {
      console.warn('Steadfast balance proxy error, trying direct browser request...', err);
      // Fallback: Direct client-side fetch (using Bangladeshi user's IP directly from their browser)
      try {
        const directRes = await fetch('https://portal.steadfast.com.bd/api/v1/get_balance', {
          method: 'GET',
          headers: {
            'Api-Key': courierApiKey.trim(),
            'Secret-Key': courierSecretKey.trim(),
          }
        });
        const directData = await directRes.json();
        if (directRes.ok && (directData.current_balance !== undefined || directData.balance !== undefined)) {
          const rawBalance = directData.current_balance !== undefined ? directData.current_balance : directData.balance;
          const balance = Number(rawBalance || 0);
          setSteadfastBalance(balance);
          return { success: true, balance };
        }
      } catch (directErr) {
        // Try packzy
        try {
          const packzyRes = await fetch('https://portal.packzy.com/api/v1/get_balance', {
            method: 'GET',
            headers: {
              'Api-Key': courierApiKey.trim(),
              'Secret-Key': courierSecretKey.trim(),
            }
          });
          const packzyData = await packzyRes.json();
          if (packzyRes.ok && (packzyData.current_balance !== undefined || packzyData.balance !== undefined)) {
            const rawBalance = packzyData.current_balance !== undefined ? packzyData.current_balance : packzyData.balance;
            const balance = Number(rawBalance || 0);
            setSteadfastBalance(balance);
            return { success: true, balance };
          }
        } catch (e) {}
      }

      const isStaticDeploy = err.message === 'StaticDeploy';
      return { 
        success: false, 
        message: isStaticDeploy 
          ? 'হোস্টিং সার্ভারে ব্যাকএন্ড (Node.js) সচল নেই। আপনি যদি cPanel বা Vercel-এ স্ট্যাটিক সাইট হিসেবে আপলোড করে থাকেন, তবে এপিআই রাউটগুলো কাজ করবে না। এপিআই কাজ করার জন্য cPanel-এ Node.js Setup App সম্পন্ন করতে হবে অথবা Steadfast সাপোর্টে কথা বলে হোস্টিং আইপি হোয়ایتলিস্ট করতে হবে।'
          : 'কানেকশন বা সার্ভারে সমস্যা হয়েছে। Steadfast-এর হোস্ট সার্ভার আপনার হোস্টিং সার্ভারটির আইপি ব্লক করে থাকতে পারে (বাংলাদেশি ফায়ারওয়াল আইপি ব্লকিং)। অনুগ্রহ করে Steadfast সাপোর্টে কথা বলে হোস্টিং আইপি হোয়ایتলিস্ট করে নিন।' 
      };
    }
  };

  const fetchCourierFraudCheck = async (phone: string): Promise<{
    success: boolean;
    total_parcel?: number;
    delivered_parcel?: number;
    cancelled_parcel?: number;
    delivery_ratio?: number;
    message?: string;
  }> => {
    if (isPlaceholderKey(courierApiKey) || isPlaceholderKey(courierSecretKey)) {
      return {
        success: false,
        message: 'কুরিয়ার ক্রেডেনশিয়াল সেট করা হয়নি।'
      };
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      return { success: false, message: 'সঠিক ফোন নম্বর প্রয়োজন।' };
    }

    try {
      const response = await fetch(`/api/steadfast/fraud_check/${cleanPhone}`, {
        method: 'GET',
        headers: {
          'api-key': courierApiKey.trim(),
          'secret-key': courierSecretKey.trim(),
        },
      });

      const contentType = response.headers.get('content-type') || '';
      if (response.status === 404 || contentType.includes('text/html')) {
        throw new Error('StaticDeploy');
      }

      const data = await response.json();
      const isSuccess = response.ok && data && (data.status === 200 || data.total_parcel !== undefined);

      if (isSuccess) {
        const total = Number(data.total_parcel || 0);
        const delivered = Number(data.delivered_parcel || 0);
        const cancelled = Number(data.cancelled_parcel || 0);
        const ratio = total > 0 ? Math.round((delivered / total) * 100) : 100;

        return {
          success: true,
          total_parcel: total,
          delivered_parcel: delivered,
          cancelled_parcel: cancelled,
          delivery_ratio: ratio,
        };
      } else {
        return {
          success: false,
          message: data.message || 'কুরিয়ার ফ্রড চেক এপিআই কোনো সঠিক তথ্য ফেরত দেয়নি।'
        };
      }
    } catch (err: any) {
      console.warn('Fraud check proxy error, trying direct browser request...', err);
      // Fallback: Direct client-side fetch (using Bangladeshi user's IP directly from their browser)
      try {
        const directRes = await fetch(`https://portal.steadfast.com.bd/api/v1/fraud_check/${cleanPhone}`, {
          method: 'GET',
          headers: {
            'Api-Key': courierApiKey.trim(),
            'Secret-Key': courierSecretKey.trim(),
          }
        });
        const directData = await directRes.json();
        if (directRes.ok && directData && (directData.status === 200 || directData.total_parcel !== undefined)) {
          const total = Number(directData.total_parcel || 0);
          const delivered = Number(directData.delivered_parcel || 0);
          const cancelled = Number(directData.cancelled_parcel || 0);
          const ratio = total > 0 ? Math.round((delivered / total) * 100) : 100;
          return {
            success: true,
            total_parcel: total,
            delivered_parcel: delivered,
            cancelled_parcel: cancelled,
            delivery_ratio: ratio,
          };
        }
      } catch (directErr) {
        // Try packzy
        try {
          const packzyRes = await fetch(`https://portal.packzy.com/api/v1/fraud_check/${cleanPhone}`, {
            method: 'GET',
            headers: {
              'Api-Key': courierApiKey.trim(),
              'Secret-Key': courierSecretKey.trim(),
            }
          });
          const packzyData = await packzyRes.json();
          if (packzyRes.ok && packzyData && (packzyData.status === 200 || packzyData.total_parcel !== undefined)) {
            const total = Number(packzyData.total_parcel || 0);
            const delivered = Number(packzyData.delivered_parcel || 0);
            const cancelled = Number(packzyData.cancelled_parcel || 0);
            const ratio = total > 0 ? Math.round((delivered / total) * 100) : 100;
            return {
              success: true,
              total_parcel: total,
              delivered_parcel: delivered,
              cancelled_parcel: cancelled,
              delivery_ratio: ratio,
            };
          }
        } catch (e) {}
      }

      const isStaticDeploy = err.message === 'StaticDeploy';
      return { 
        success: false, 
        message: isStaticDeploy 
          ? 'হোস্টিং সার্ভারে ব্যাকএন্ড (Node.js) সচল নেই বা এপিআই ব্লকড।' 
          : 'কানেকশন বা সার্ভারে সমস্যা হয়েছে। কুরিয়ার ফ্রড চেক সরাসরি কাজ করেনি।' 
      };
    }
  };

  const addDiscountCode = (code: DiscountCode) => {
    const uppercaseCode = code.code.trim().toUpperCase();
    if (!uppercaseCode) return;
    setDiscountCodes(prev => {
      const filtered = prev.filter(c => c.code !== uppercaseCode);
      return [...filtered, { ...code, code: uppercaseCode }];
    });
  };

  const deleteDiscountCode = (codeString: string) => {
    setDiscountCodes(prev => prev.filter(c => c.code !== codeString.toUpperCase()));
  };

  const toggleDiscountCode = (codeString: string) => {
    setDiscountCodes(prev => prev.map(c => c.code === codeString.toUpperCase() ? { ...c, isActive: !c.isActive } : c));
  };

  const validateDiscountCode = (codeString: string, cartTotal: number) => {
    const cleanCode = codeString.trim().toUpperCase();
    const match = discountCodes.find(c => c.code === cleanCode);
    if (!match) {
      return { isValid: false, discountAmount: 0, error: 'কুপন কোডটি সঠিক নয়!' };
    }
    if (!match.isActive) {
      return { isValid: false, discountAmount: 0, error: 'কুপন কোডটি সচল নেই!' };
    }
    if (match.minPurchase && cartTotal < match.minPurchase) {
      return { 
        isValid: false, 
        discountAmount: 0, 
        error: `এই কুপনটি ব্যবহার করতে নূন্যতম ৳${match.minPurchase} এর অর্ডার করতে হবে!` 
      };
    }
    
    let discountAmount = 0;
    if (match.type === 'percentage') {
      discountAmount = Math.round((cartTotal * match.value) / 100);
    } else {
      discountAmount = match.value;
    }
    
    return { isValid: true, discountAmount };
  };

  // Auto-sync courier balance when API keys change and are not placeholders
  useEffect(() => {
    if (!isPlaceholderKey(courierApiKey) && !isPlaceholderKey(courierSecretKey)) {
      checkBalance().catch(err => console.error("Auto balance check failed:", err));
    }
  }, [courierApiKey, courierSecretKey]);

  return (
    <ShopContext.Provider value={{
      products,
      cart,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      isAdminLoggedIn,
      loginAdmin,
      logoutAdmin,
      adminUsername,
      setAdminUsername,
      adminPassword,
      setAdminPassword,
      addProduct,
      updateProduct,
      deleteProduct,
      deleteMultipleProducts,
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
      updateOrderMetaSynced,
      deleteOrder,
      blockedPhones,
      blockPhone,
      unblockPhone,
      isPhoneBlocked,
      enableDailyLimit,
      setEnableDailyLimit,
      whitelistedPhones,
      whitelistPhone,
      unwhitelistPhone,
      isPhoneWhitelisted,
      isDailyOrderLimitReached,
      categories,
      addCategory,
      deleteCategory,
      consignmentMap,
      sendOrderToCourier,
      resetCourierStatus,
      checkBalance,
      fetchCourierFraudCheck,
      steadfastBalance,
      setSteadfastBalance,
      steadfastPaidOut,
      setSteadfastPaidOut,
      discountCodes,
      addDiscountCode,
      deleteDiscountCode,
      toggleDiscountCode,
      validateDiscountCode,
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
      saveStoreSettingsToCloud
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
