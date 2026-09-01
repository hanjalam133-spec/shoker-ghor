import React from 'react';
import { Home, Menu, ShoppingBag, User, PhoneCall } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface MobileBottomNavProps {
  onHomeClick: () => void;
  onCartClick: () => void;
  onAdminClick: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onHomeClick,
  onCartClick,
  onAdminClick,
}) => {
  const { cart, whatsappNumber } = useShop();

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cleanPhoneForWa = whatsappNumber.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhoneForWa}?text=Assalamu%20Alaikum%20Shoker ghor%20Shop!%20I%20want%20to%20know%20more%20about%20your%20products.`;

  const handleCategoryClick = () => {
    // Scroll to categories section smoothly
    const element = document.getElementById('categories');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // Fallback: scroll to shop or top
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] h-[64px] flex md:hidden items-center justify-around px-2">
      {/* Category Button */}
      <button 
        onClick={handleCategoryClick}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-gray-600 hover:text-[var(--color-navy)] active:scale-95 transition-all"
      >
        <Menu className="w-5 h-5 text-gray-500" />
        <span className="text-[10px] font-bold mt-1 tracking-tight text-gray-600">Category</span>
      </button>

      {/* Whatsapp Button */}
      <a 
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-gray-600 hover:text-[#25D366] active:scale-95 transition-all"
      >
        {/* Custom Whatsapp icon using simple SVG or styling */}
        <svg className="w-5 h-5 fill-current text-gray-500" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.714-1.466L0 24zm6.59-4.846c1.6.95 3.498 1.45 5.411 1.451 5.48-.002 9.938-4.463 9.942-9.946.002-2.656-1.03-5.153-2.903-7.03C17.228 1.743 14.73 1.714 12.012 1.71c-5.48 0-9.94 4.46-9.944 9.943-.001 1.913.501 3.78 1.457 5.385L2.566 21.48l4.081-1.326z"/>
        </svg>
        <span className="text-[10px] font-bold mt-1 tracking-tight text-gray-600">Whatsapp</span>
      </a>

      {/* Raised Home Button */}
      <div className="relative flex-1 flex justify-center -mt-6">
        <button 
          onClick={onHomeClick}
          className="flex flex-col items-center justify-center group"
        >
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-500/40 border-4 border-white group-hover:scale-110 active:scale-90 transition-transform duration-200">
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold mt-1 tracking-tight text-green-600">Home</span>
        </button>
      </div>

      {/* Cart Button */}
      <button 
        onClick={onCartClick}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-gray-600 hover:text-[var(--color-navy)] active:scale-95 transition-all relative"
      >
        <ShoppingBag className="w-5 h-5 text-gray-500" />
        {cartItemsCount > 0 && (
          <span className="absolute top-1 right-4 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-white bg-red-600 rounded-full">
            {cartItemsCount}
          </span>
        )}
        <span className="text-[10px] font-bold mt-1 tracking-tight text-gray-600">Cart ({cartItemsCount})</span>
      </button>

      {/* Login Button */}
      <button 
        onClick={onAdminClick}
        className="flex flex-col items-center justify-center flex-1 h-full py-1 text-gray-600 hover:text-[var(--color-navy)] active:scale-95 transition-all"
      >
        <User className="w-5 h-5 text-gray-500" />
        <span className="text-[10px] font-bold mt-1 tracking-tight text-gray-600">Login</span>
      </button>
    </div>
  );
};
