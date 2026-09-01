export type Category = string;
export type Size = string;

export interface ProductPackage {
  id: string;
  name: string;      // e.g. "১ পিস পাঞ্জাবি"
  price: number;     // e.g. 990
  quantity: number;  // e.g. 1
  description?: string; // e.g. "১ পিস প্রিমিয়াম পাঞ্জাবি"
  images?: string[]; // Package specific pictures (1 to 3 or more)
}

export interface Product {
  id: string;
  title: string;
  price: number; // in BDT
  category: Category;
  image: string;
  images?: string[]; // Multiple pictures gallery (5-10 images support)
  gallery?: string[]; // Multiple pictures gallery (alternate name)
  sizes?: string[]; // Custom sizes set by admin (e.g. ['38', '40', '42', '44', '46'])
  description: string;
  inStock: boolean;
  rating?: number;
  reviewsCount?: number;
  packages?: ProductPackage[]; // Customizable packages for each product!
  originalPrice?: number; // Original or compare-at price before discount in BDT
}

export interface LandingPage {
  id: string;
  slug: string;
  title: string;
  productId: string;
  bannerImage: string;
  galleryImages?: string[]; // Multiple pictures gallery (5-10 images support)
  accentColor?: string; // Custom theme color (hex or CSS color)
  bgColor?: string; // Background color
  headline: string;
  subheadline: string;
  badgeText: string;
  discountPrice?: number;
  features: string[];
  videoUrl?: string;
  isActive: boolean;
  createdAt: string;
  sizes?: string[];
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  size?: Size;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  size?: Size;
  quantity: number;
  price: number;
  selectedImage?: string;
  productCode?: string;
}

export interface CustomerDetails {
  name: string;
  email?: string;
  phone: string;
  address: string;
  city: string;
  district?: string;
}

export interface Order {
  id: string;
  date: string;
  customer: CustomerDetails;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled' | 'incomplete';
  metaSynced?: boolean;
}

export interface DiscountCode {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  isActive: boolean;
}

export interface MenuItem {
  id: string;
  label: string;
  type: 'home' | 'shop' | 'reel' | 'categories' | 'about' | 'url' | 'category_filter';
  link?: string;
  categoryFilter?: string;
  isActive: boolean;
}

export const BD_DISTRICTS = [
  "ঢাকা", "চট্টগ্রাম", "রাজশাহী", "খুলনা", "বরিশাল", "সিলেট", "রংপুর", "ময়মনসিংহ",
  "কুমিল্লা", "গাজীপুর", "নারায়ণগঞ্জ", "কক্সবাজার", "নোয়াখালী", "ব্রাহ্মণবাড়িয়া",
  "ফেনী", "লক্ষ্মীপুর", "চাঁদপুর", "কিশোরগঞ্জ", "টাঙ্গাইল", "মানিকগঞ্জ",
  "মুন্সিগঞ্জ", "নরসিংদী", "ফরিদপুর", "গোপালগঞ্জ", "মাদারীপুর", "রাজবাড়ী",
  "শরীয়তপুর", "বগুড়া", "জয়পুরহাট", "নওগাঁ", "নাটোর", "পাবনা",
  "সিরাজগঞ্জ", "চাঁপাইনবাবগঞ্জ", "দিনাজপুর", "গাইবান্ধা", "কুড়িগ্রাম", "লালমনিরহাট",
  "নীলফামারী", "পঞ্চগড়", "ঠাকুরগাঁও", "বাগেরহাট", "চুয়াডাঙ্গা", "যশোর",
  "ঝিনাইদহ", "কুষ্টিয়া", "মাগুরা", "মেহেরপুর", "নড়াইল", "সাতক্ষীরা",
  "বরগুনা", "ভোলা", "ঝালকাঠি", "পটুয়াখালী", "পিরোজপুর", "হবিগঞ্জ",
  "মৌলভীবাজার", "সুনামগঞ্জ", "শেরপুর", "জামালপুর", "নেত্রকোনা", "বান্দরবান",
  "খাগড়াছড়ি", "রাঙ্গামাটি", "অন্যান্য"
];


