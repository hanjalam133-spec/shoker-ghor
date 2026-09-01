import React from 'react';
import { ShoppingBag, Search, Menu, X, Crown, Lock } from 'lucide-react';
import { useShop } from '../context/ShopContext';

interface HeaderProps {
  onCartClick: () => void;
  onAdminClick: () => void;
  onHomeClick: () => void;
  onReelClick: () => void;
  onCategoryFilterSelect?: (category: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onCartClick, onAdminClick, onHomeClick, onReelClick, onCategoryFilterSelect }) => {
  const { cart, isAdminLoggedIn, logoutAdmin, storeLogo, storeName, headerBgColor, headerTextColor, menuItems } = useShop();
  const [isMobileMenuOpen, React_useState] = React.useState(false);
  const setIsMobileMenuOpen = (val: boolean) => React_useState(val);

  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const displayStoreName = storeName ? (storeName.split(' - ')[0] || storeName) : 'Shoker ghor';

  const renderMenuItem = (item: any, isMobile: boolean = false) => {
    if (!item.isActive) return null;

    const baseClass = isMobile 
      ? "text-left text-[14px] uppercase tracking-[1px] font-medium opacity-80 hover:opacity-100 hover:text-[var(--color-gold)] w-full block py-1 cursor-pointer bg-transparent border-none outline-none"
      : "uppercase tracking-[1px] text-[13px] font-medium transition-colors opacity-85 hover:opacity-100 hover:text-[var(--color-gold)] cursor-pointer bg-transparent border-none outline-none";

    const handleClick = () => {
      if (isMobile) {
        setIsMobileMenuOpen(false);
      }
      
      switch (item.type) {
        case 'home':
          onHomeClick();
          break;
        case 'shop':
          onHomeClick();
          setTimeout(() => {
            const el = document.getElementById('shop');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          break;
        case 'reel':
          onReelClick();
          break;
        case 'categories':
          onHomeClick();
          setTimeout(() => {
            const el = document.getElementById('categories');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          break;
        case 'about':
          onHomeClick();
          setTimeout(() => {
            const el = document.getElementById('about');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          break;
        case 'category_filter':
          onHomeClick();
          if (onCategoryFilterSelect && item.categoryFilter) {
            onCategoryFilterSelect(item.categoryFilter);
          }
          setTimeout(() => {
            const el = document.getElementById('shop');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
          break;
        case 'url':
          if (item.link) {
            if (item.link.startsWith('http')) {
              window.open(item.link, '_blank');
            } else {
              window.location.hash = item.link;
            }
          }
          break;
        default:
          break;
      }
    };

    if (item.type === 'reel') {
      return (
        <button 
          key={item.id}
          onClick={handleClick} 
          className={isMobile 
            ? "text-left text-[14px] uppercase tracking-[1px] text-amber-400 font-bold flex items-center gap-2 cursor-pointer w-full py-1 bg-transparent border-none outline-none"
            : "text-amber-400 hover:text-white uppercase tracking-[1px] text-[13px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer bg-transparent border-none outline-none"
          }
        >
          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          {item.label}
        </button>
      );
    }

    if (item.type === 'home') {
      return (
        <button 
          key={item.id}
          onClick={handleClick}
          className={isMobile ? baseClass : "text-[var(--color-gold)] uppercase tracking-[1px] text-[13px] font-medium transition-colors bg-transparent border-none outline-none cursor-pointer"}
        >
          {item.label}
        </button>
      );
    }

    return (
      <button 
        key={item.id}
        onClick={handleClick}
        className={baseClass}
        style={!isMobile ? { color: headerTextColor } : undefined}
      >
        {item.label}
      </button>
    );
  };

  return (
    <header 
      className="sticky top-0 z-40 w-full border-b border-white/10 shadow-md"
      style={{ backgroundColor: headerBgColor, color: headerTextColor }}
    >
      <div className="container mx-auto px-4 h-[90px] flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button className="lg:hidden p-2" style={{ color: headerTextColor }} onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div 
          className="flex items-center gap-3.5 cursor-pointer group"
          onClick={onHomeClick}
        >
          <img 
            src={storeLogo} 
            alt="Store Logo" 
            referrerPolicy="no-referrer"
            className="w-14 h-14 rounded-full border border-[var(--color-gold)] object-cover shadow-[0_0_15px_rgba(212,175,55,0.25)] group-hover:scale-105 transition-all duration-300"
          />
          <div className="flex flex-col">
            <h1 className="text-[22px] font-serif font-bold text-[var(--color-gold)] tracking-[2px] uppercase leading-none group-hover:text-[var(--color-gold-light)] transition-colors">
              {displayStoreName}
            </h1>
            <span className="text-[10px] tracking-[3px] uppercase mt-1 opacity-70" style={{ color: headerTextColor }}>Luxury Panjabi</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {menuItems.map(item => renderMenuItem(item, false))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-4 md:space-x-6">
          {/* Search */}
          <div className="hidden xl:flex items-center bg-[#1a2332]/40 border border-white/10 rounded-full px-4 py-2 w-[200px]">
            <Search className="w-4 h-4 mr-2 opacity-50" style={{ color: headerTextColor }} />
            <input 
              type="text" 
              placeholder="Search Panjabi..." 
              style={{ color: headerTextColor }}
              className="bg-transparent border-none outline-none text-[13px] w-full placeholder:opacity-50"
            />
          </div>

          <button 
            className="hover:opacity-80 transition-opacity"
            style={{ color: headerTextColor }}
            onClick={onAdminClick}
            title={isAdminLoggedIn ? "Admin Dashboard" : "Admin Login"}
          >
            <Lock className="w-5 h-5" />
          </button>
          
          <button 
            className="hover:opacity-80 transition-opacity relative"
            style={{ color: headerTextColor }}
            onClick={onCartClick}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-red-600 rounded-full">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[var(--color-navy)]/90 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="fixed inset-y-0 left-0 w-[280px] shadow-xl flex flex-col p-6 border-r border-white/10" 
            style={{ backgroundColor: headerBgColor, color: headerTextColor }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <img 
                  src={storeLogo} 
                  alt="Store Logo" 
                  referrerPolicy="no-referrer"
                  className="w-10 h-10 rounded-full border border-[var(--color-gold)] object-cover shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                />
                <h2 className="text-lg font-serif font-bold text-[var(--color-gold)] tracking-[2px] uppercase">{displayStoreName}</h2>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 opacity-50 hover:opacity-100" style={{ color: headerTextColor }}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-6">
              {menuItems.map(item => renderMenuItem(item, true))}
              <button 
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onAdminClick();
                }} 
                className="text-left text-[14px] uppercase tracking-[1px] font-medium flex items-center gap-2 mt-4 pt-4 border-t border-white/10 opacity-80 hover:opacity-100 hover:text-[var(--color-gold)] cursor-pointer bg-transparent border-none outline-none"
                style={{ color: headerTextColor }}
              >
                <Lock className="w-4 h-4" />
                {isAdminLoggedIn ? 'Admin Dashboard' : 'Admin Login'}
              </button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
