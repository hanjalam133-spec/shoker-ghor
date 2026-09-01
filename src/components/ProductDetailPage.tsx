import React, { useState } from 'react';
import { ChevronLeft, Share2, Minus, Plus } from 'lucide-react';
import { Product, Size } from '../types';
import { useShop } from '../context/ShopContext';
import { formatCurrency, getProductSlug } from '../lib/utils';
import { Header } from './Header';
import { Footer } from './Footer';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onCartClick: () => void;
  onAdminClick: () => void;
  onInstantOrder: (product: Product) => void;
}

const SIZES: Size[] = ['38', '40', '42', '44', '46'];

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ 
  product, 
  onBack,
  onCartClick,
  onAdminClick,
  onInstantOrder
}) => {
  const { 
    addToCart,
    btnInstantOrderShow,
    btnInstantOrderText,
    btnInstantOrderBgColor,
    btnInstantOrderTextColor,
    btnAddToCartShow,
    btnAddToCartText,
    btnAddToCartBgColor,
    btnAddToCartTextColor
  } = useShop();

  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  const allImages = [product.image, ...(product.images || [])].filter(Boolean) as string[];
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const handleCopyLink = () => {
    const domain = window.location.origin && !window.location.origin.includes('localhost') ? window.location.origin : 'https://Shoker ghorbd.shop';
    const link = `${domain}/product/${getProductSlug(product)}`;
    const copyText = `🎁 ${product.title}\n🔗 লিংক: ${link}\n🛒 অর্ডার করতে ভিজিট করুন: ${domain}`;
    
    navigator.clipboard.writeText(copyText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    addToCart(product, selectedSize, quantity);
  };

  const handleInstantOrder = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    onInstantOrder(product);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-gray-50 selection:bg-[var(--color-gold)] selection:text-[var(--color-navy)]">
      <div className="bg-[var(--color-navy)] text-[var(--color-gold)] py-1.5 px-4 text-xs font-medium flex justify-center items-center z-50 border-b border-[var(--color-gold)]/20">
        <p className="tracking-wide uppercase text-[10px] md:text-xs text-center">
          ✨ FREE EXPRESS DELIVERY ACROSS BANGLADESH ON ORDERS OVER ৳5,000 ✨
        </p>
      </div>
      
      <Header 
        onCartClick={onCartClick}
        onAdminClick={onAdminClick}
        onHomeClick={onBack}
        onReelClick={() => {}}
      />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Shop
        </button>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col lg:flex-row border border-gray-100">
          {/* Image Section */}
          <div className="w-full lg:w-1/2 flex flex-col bg-gray-50">
            <div className="flex-1 relative aspect-square md:aspect-[4/5] lg:aspect-auto">
              <img 
                src={allImages[activeImageIndex] || product.image} 
                alt={product.title} 
                className="w-full h-full object-cover lg:absolute lg:inset-0"
                referrerPolicy="no-referrer"
              />
            </div>
            {allImages.length > 1 && (
              <div className="p-4 bg-white border-t border-gray-100 flex gap-3 overflow-x-auto">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 md:w-20 md:h-20 rounded-md overflow-hidden border-2 flex-shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-black scale-105 shadow-md' : 'border-gray-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-1/2 p-6 md:p-10 lg:p-12 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-yellow-600 font-bold uppercase tracking-widest">{product.category}</span>
              <button 
                onClick={handleCopyLink}
                className="text-gray-400 hover:text-black transition-colors"
                title="Share product"
              >
                {copied ? <span className="text-xs font-bold text-green-600">Copied!</span> : <Share2 className="w-5 h-5" />}
              </button>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">{product.title}</h1>
            <div className="flex items-baseline gap-3 mb-8 flex-wrap">
              <span className="text-2xl md:text-3xl text-gray-800 font-semibold">{formatCurrency(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-lg text-gray-400 line-through font-normal">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>
            
            <div className="mb-8">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 border-b pb-2">Description</h4>
              <div className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </div>
            </div>

            <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Select Size</h4>
                <a href="#" className="text-sm text-yellow-600 underline font-medium">Size Guide</a>
              </div>
              <div className="flex flex-wrap gap-3">
                {(product.sizes && product.sizes.length > 0 ? product.sizes : SIZES).map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`min-w-[56px] px-4 py-3 border rounded-md text-sm font-bold transition-all ${
                      selectedSize === size 
                        ? 'border-black bg-black text-white shadow-md' 
                        : 'border-gray-200 text-gray-800 hover:border-black bg-white'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              <div className="flex gap-4">
                <div className="flex items-center border border-gray-200 rounded-md bg-white">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center font-bold">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {btnAddToCartShow && (
                  <button 
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
                    style={product.inStock ? { backgroundColor: btnAddToCartBgColor, color: btnAddToCartTextColor } : {}}
                    className={`flex-1 py-3 px-6 rounded-md text-sm font-bold uppercase tracking-widest transition-all shadow-sm ${
                      product.inStock 
                        ? 'hover:opacity-95 hover:shadow-md' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {product.inStock ? btnAddToCartText : 'Out of Stock'}
                  </button>
                )}
              </div>
              
              {btnInstantOrderShow && (
                <button 
                  onClick={handleInstantOrder}
                  disabled={!product.inStock}
                  style={product.inStock ? { backgroundColor: btnInstantOrderBgColor, color: btnInstantOrderTextColor } : {}}
                  className={`w-full py-4 px-6 rounded-md text-sm font-extrabold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2 ${
                    product.inStock 
                      ? 'hover:opacity-95 hover:shadow-lg' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {product.inStock ? btnInstantOrderText : 'Out of Stock'}
                </button>
              )}
            </div>
            
            <div className="mt-auto pt-6 border-t border-gray-100 space-y-3">
               <p className="text-sm text-gray-600 flex items-center gap-2">
                 <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span> 
                 <span className="font-medium">In stock, ready to ship</span>
               </p>
               <p className="text-sm text-gray-600 flex items-center gap-2">
                 <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span> 
                 <span className="font-medium">Free delivery on orders over ৳ 5000</span>
               </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
