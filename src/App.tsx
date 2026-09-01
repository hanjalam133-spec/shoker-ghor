import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCatalog } from './components/ProductCatalog';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { Footer } from './components/Footer';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { PixelTracker } from './components/PixelTracker';
import { GTMTracker } from './components/GTMTracker';
import { InstantOrderLanding } from './components/InstantOrderLanding';
import { ContactWidget } from './components/ContactWidget';
import { MobileBottomNav } from './components/MobileBottomNav';
import { RecentOrderToast } from './components/RecentOrderToast';
import { Product } from './types';
import { getProductSlug } from './lib/utils';

function AppContent() {
  const { isAdminLoggedIn, landingPages, categories, categoryImages, products } = useShop();
  const [currentView, setCurrentView] = useState<'home' | 'admin' | 'reel-offer'>('home');
  const [reelProduct, setReelProduct] = useState<Product | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | 'All'>('All');
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  const scrollCategory = (direction: 'left' | 'right') => {
    if (categoryScrollRef.current) {
      const scrollAmount = direction === 'left' ? -260 : 260;
      categoryScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Auto carousel effect for circular categories ("GOL SOBI OTO CERASOOL")
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (categoryScrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          categoryScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          categoryScrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
        }
      }
    }, 2800);
    return () => clearInterval(interval);
  }, []);
  
  const getLandingSlugFromUrl = () => {
    const hash = window.location.hash;
    const pathname = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.has('landing')) {
      return urlParams.get('landing');
    }

    if (hash.startsWith('#landing/')) {
      try {
        const rawSlug = hash.replace('#landing/', '');
        return decodeURIComponent(rawSlug.split('?')[0].split('/')[0]);
      } catch (e) {
        return hash.replace('#landing/', '').split('?')[0].split('/')[0];
      }
    }

    if (pathname.startsWith('/landing/')) {
      try {
        const rawSlug = pathname.replace('/landing/', '');
        return decodeURIComponent(rawSlug.split('?')[0].split('/')[0]);
      } catch (e) {
        return pathname.replace('/landing/', '').split('?')[0].split('/')[0];
      }
    }

    if (hash && hash.startsWith('#') && hash.length > 1) {
      const cleanHash = hash.replace('#', '').split('?')[0].split('/')[0];
      if (cleanHash && cleanHash !== 'home' && cleanHash !== 'shop' && cleanHash !== 'admin' && cleanHash !== 'cart') {
        return cleanHash;
      }
    }

    try {
      if (urlParams.has('pdata')) {
        const pdata = urlParams.get('pdata');
        if (pdata) {
          const decoded = JSON.parse(decodeURIComponent(escape(atob(pdata))));
          if (decoded && (decoded.slug || decoded.id)) {
            return decoded.slug || decoded.id;
          }
        }
      }
    } catch (e) {}

    return null;
  };

  const [currentLandingSlug, setCurrentLandingSlug] = useState<string | null>(getLandingSlugFromUrl);

  React.useEffect(() => {
    const handleRouteChange = () => {
      setCurrentLandingSlug(getLandingSlugFromUrl());
    };
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);
    return () => {
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Handle URL Path and Hash Routes for Products
  React.useEffect(() => {
    const handleProductRouteChange = () => {
      const pathname = window.location.pathname;
      const hash = window.location.hash;
      const urlParams = new URLSearchParams(window.location.search);
      let prodId: string | null = null;

      if (urlParams.has('product')) {
        prodId = urlParams.get('product');
      } else if (pathname.startsWith('/product/')) {
        try {
          prodId = decodeURIComponent(pathname.replace('/product/', ''));
        } catch (e) {
          prodId = pathname.replace('/product/', '');
        }
      } else if (hash.startsWith('#product/')) {
        try {
          prodId = decodeURIComponent(hash.replace('#product/', ''));
        } catch (e) {
          prodId = hash.replace('#product/', '');
        }
      }

      try {
        if (urlParams.has('prodData')) {
          const prodDataStr = urlParams.get('prodData');
          if (prodDataStr) {
            const decodedProd = JSON.parse(decodeURIComponent(escape(atob(prodDataStr))));
            if (decodedProd && decodedProd.id) {
              setSelectedProduct(decodedProd);
              return;
            }
          }
        }
      } catch (e) {}

      if (prodId) {
        const cleanProdId = prodId.split('/')[0].split('?')[0];
        const foundProd = products.find(p => {
          const idMatch = p.id === cleanProdId;
          const slugMatch = getProductSlug(p) === cleanProdId;
          const oldSlugMatch = p.title.replace(/\s+/g, '-').toLowerCase() === cleanProdId.toLowerCase();
          return idMatch || slugMatch || oldSlugMatch;
        });
        if (foundProd) {
          setSelectedProduct(foundProd);
        }
      } else {
        setSelectedProduct(prev => {
          const params = new URLSearchParams(window.location.search);
          if (prev && !window.location.pathname.startsWith('/product/') && !window.location.hash.startsWith('#product/') && !params.has('product') && !params.has('prodData')) {
            return null;
          }
          return prev;
        });
      }
    };

    handleProductRouteChange();

    window.addEventListener('popstate', handleProductRouteChange);
    window.addEventListener('hashchange', handleProductRouteChange);
    return () => {
      window.removeEventListener('popstate', handleProductRouteChange);
      window.removeEventListener('hashchange', handleProductRouteChange);
    };
  }, [products]);

  const handleAdminClick = () => {
    if (isAdminLoggedIn) {
      setCurrentView('admin');
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  React.useEffect(() => {
    if (isAdminLoggedIn && isAdminLoginOpen) {
      setIsAdminLoginOpen(false);
      setCurrentView('admin');
    }
  }, [isAdminLoggedIn, isAdminLoginOpen]);

  React.useEffect(() => {
    if (!isAdminLoggedIn && currentView === 'admin') {
      setCurrentView('home');
    }
  }, [isAdminLoggedIn, currentView]);

  // Clean pdata from URL if we are not on a landing page
  React.useEffect(() => {
    if (!currentLandingSlug) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('pdata')) {
          const url = new URL(window.location.href);
          url.searchParams.delete('pdata');
          window.history.replaceState({}, '', url.pathname + url.search + url.hash);
        }
      } catch (e) {
        console.warn('Failed to clean URL:', e);
      }
    }
  }, [currentLandingSlug]);

  if (currentLandingSlug) {
    const normalizedSlug = (currentLandingSlug || '').trim().toLowerCase();
    const matchedLanding = landingPages.find(p => 
      p.slug.trim().toLowerCase() === normalizedSlug || 
      p.id === currentLandingSlug ||
      p.slug.trim().toLowerCase().includes(normalizedSlug) ||
      normalizedSlug.includes(p.slug.trim().toLowerCase())
    ) || landingPages[0];
    return (
      <div className="min-h-[100dvh] w-full overflow-x-hidden flex flex-col font-sans bg-[var(--color-page-bg)] selection:bg-[var(--color-gold)] selection:text-[var(--color-navy)] pb-[64px] md:pb-0">
        <div className="bg-[var(--color-navy)] text-[var(--color-gold)] py-1.5 px-4 text-xs font-medium flex justify-center items-center z-50 border-b border-[var(--color-gold)]/20">
          <p className="tracking-wide uppercase text-[10px] md:text-xs text-center font-bold">
            ⚡ {matchedLanding?.title || 'এক্সক্লুসিভ ল্যান্ডিং পেজ অফার'} ⚡
          </p>
        </div>
        <main className="flex-1">
          <InstantOrderLanding 
            onClose={() => {
              window.history.pushState(null, '', '/');
              setCurrentLandingSlug(null);
              try {
                const url = new URL(window.location.href);
                url.searchParams.delete('pdata');
                window.history.replaceState({}, '', url.pathname + url.search + url.hash);
              } catch (e) {
                console.warn('Failed to clean URL in onClose:', e);
              }
              if (isAdminLoggedIn) {
                setCurrentView('admin');
              } else {
                setCurrentView('home');
              }
            }}
            landingPage={matchedLanding}
          />
        </main>
        <ContactWidget />
      </div>
    );
  }

  if (currentView === 'admin' && isAdminLoggedIn) {
    return <AdminDashboard />;
  }

  if (selectedProduct) {
    return (
      <div className="min-h-[100dvh] w-full overflow-x-hidden flex flex-col font-sans bg-[var(--color-page-bg)] selection:bg-[var(--color-gold)] selection:text-[var(--color-navy)] pb-[64px] md:pb-0">
        <ProductDetailPage 
          product={selectedProduct}
          onBack={() => {
            setSelectedProduct(null);
            window.history.pushState(null, '', '/');
          }}
          onCartClick={() => setIsCartOpen(true)}
          onAdminClick={handleAdminClick}
          onInstantOrder={(product) => {
            setSelectedProduct(null);
            setReelProduct(product);
            setCurrentView('reel-offer');
            window.history.pushState(null, '', '/');
          }}
        />
        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          onCheckout={() => setIsCheckoutOpen(true)}
        />
        <CheckoutModal 
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)} 
        />
        <AdminLogin 
          isOpen={isAdminLoginOpen}
          onClose={() => setIsAdminLoginOpen(false)} 
        />
        <ContactWidget />
        <RecentOrderToast />
        <MobileBottomNav 
          onHomeClick={() => {
            setSelectedProduct(null);
            setCurrentView('home');
          }}
          onCartClick={() => setIsCartOpen(true)}
          onAdminClick={handleAdminClick}
        />
      </div>
    );
  }

  if (currentView === 'reel-offer') {
    return (
      <div className="min-h-[100dvh] w-full overflow-x-hidden flex flex-col font-sans bg-[var(--color-page-bg)] selection:bg-[var(--color-gold)] selection:text-[var(--color-navy)] pb-[64px] md:pb-0">
        <div className="bg-[var(--color-navy)] text-[var(--color-gold)] py-1.5 px-4 text-xs font-medium flex justify-center items-center z-50 border-b border-[var(--color-gold)]/20">
          <p className="tracking-wide uppercase text-[10px] md:text-xs text-center font-bold">
            ⚡ ওয়ান পেজ ফাস্ট অর্ডার ধামাকা - কুরিয়ার ডেলিভারি সার্ভিস ⚡
          </p>
        </div>
        <Header 
          onCartClick={() => setIsCartOpen(true)}
          onAdminClick={handleAdminClick}
          onHomeClick={() => {
            setReelProduct(null);
            setCurrentView('home');
          }}
          onReelClick={() => setCurrentView('reel-offer')}
        />
        <main className="flex-1">
          <InstantOrderLanding 
            onClose={() => {
              setReelProduct(null);
              setCurrentView('home');
            }}
            featuredProduct={reelProduct || undefined}
          />
        </main>
        <Footer />
        <ContactWidget />
        <MobileBottomNav 
          onHomeClick={() => {
            setReelProduct(null);
            setCurrentView('home');
          }}
          onCartClick={() => setIsCartOpen(true)}
          onAdminClick={handleAdminClick}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full overflow-x-hidden flex flex-col font-sans bg-[var(--color-page-bg)] selection:bg-[var(--color-gold)] selection:text-[var(--color-navy)] pb-[64px] md:pb-0">
      {/* Top Banner */}
      <div className="bg-[var(--color-navy)] text-[var(--color-gold)] py-1.5 px-4 text-xs font-medium flex justify-center items-center z-50 border-b border-[var(--color-gold)]/20">
        <p className="tracking-wide uppercase text-[10px] md:text-xs text-center">
          ✨ FREE EXPRESS DELIVERY ACROSS BANGLADESH ON ORDERS OVER ৳5,000 ✨
        </p>
      </div>

      <Header 
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={handleAdminClick}
        onHomeClick={() => setCurrentView('home')}
        onReelClick={() => setCurrentView('reel-offer')}
        onCategoryFilterSelect={setActiveCategoryFilter}
      />

      <main className="flex-1">
        <Hero />
        
        {/* Dynamic Circular Categories Carousel Section ("GOL SOBI KERASOL") */}
        <section id="categories" className="py-10 md:py-14 bg-gradient-to-b from-amber-50/40 via-white to-gray-50 border-y border-amber-100 relative">
          <div className="container mx-auto px-4 text-center">
            <div className="mb-6 sm:mb-8">
              <span className="text-[var(--color-navy)] text-xs font-bold uppercase tracking-[2px] bg-amber-100 px-3 py-1 rounded-full border border-amber-200 inline-block mb-2">
                ক্যাটেগরি কালেকশন
              </span>
              <h2 className="text-3xl font-serif font-bold text-gray-900 tracking-tight">
                এক্সক্লুসিভ ক্যাটেগরি সমূহ
              </h2>
              <p className="text-sm text-gray-600 mt-1 max-w-xl mx-auto">
                পছন্দের ক্যাটেগরি সিলেক্ট করুন এবং চমৎকার সব পাঞ্জাবি কালেকশন ব্রাউজ করুন
              </p>
            </div>

            {/* Carousel Container with Controls */}
            <div className="relative max-w-5xl mx-auto px-2 sm:px-12">
              
              {/* Left Carousel Button */}
              <button
                onClick={() => scrollCategory('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 bg-white hover:bg-[var(--color-navy)] hover:text-[var(--color-gold)] text-gray-800 rounded-full shadow-lg border border-amber-200 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                title="আগের ক্যাটেগরি"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Scrollable Circular Items Track */}
              <div 
                ref={categoryScrollRef}
                className="flex items-center gap-5 sm:gap-8 overflow-x-auto scrollbar-none py-3 px-2 scroll-smooth snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* All Category Circle */}
                <button
                  onClick={() => {
                    setActiveCategoryFilter('All');
                    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="group flex flex-col items-center gap-2 cursor-pointer transition-transform duration-300 hover:scale-105 shrink-0 snap-center"
                >
                  <div className={`w-24 h-24 rounded-full overflow-hidden border-2 shadow-md transition-all flex items-center justify-center bg-[var(--color-navy)] ${activeCategoryFilter === 'All' ? 'border-[var(--color-gold)] ring-4 ring-amber-300/50 scale-105' : 'border-amber-200 group-hover:border-[var(--color-gold)]'}`}>
                    <span className="text-white text-sm font-bold tracking-wider uppercase text-center px-1">
                      ALL<br />PRODUCTS
                    </span>
                  </div>
                  <span className={`text-sm font-bold transition-colors ${activeCategoryFilter === 'All' ? 'text-[var(--color-navy)] underline underline-offset-4 font-extrabold' : 'text-gray-700 group-hover:text-black'}`}>
                    সকল পাঞ্জাবি
                  </span>
                </button>

                {/* Dynamic Categories */}
                {categories.map((cat, idx) => {
                  const imgList = Array.isArray(categoryImages[cat]) ? categoryImages[cat] : [categoryImages[cat] || ''];
                  const imgUrl = imgList[0] || 'https://images.unsplash.com/photo-1583391733959-b0510f6992dd?auto=format&fit=crop&q=80&w=800';
                  const isSelected = activeCategoryFilter === cat;
                  return (
                    <button
                      key={`${cat}-${idx}`}
                      onClick={() => {
                        setActiveCategoryFilter(cat);
                        document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="group flex flex-col items-center gap-2 cursor-pointer transition-transform duration-300 hover:scale-105 shrink-0 snap-center"
                    >
                      <div className={`w-24 h-24 rounded-full overflow-hidden border-2 shadow-md transition-all bg-gray-100 ${isSelected ? 'border-[var(--color-gold)] ring-4 ring-amber-400/50 scale-105' : 'border-amber-200 group-hover:border-[var(--color-gold)]'}`}>
                        <img 
                          src={imgUrl} 
                          alt={cat}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <span className={`text-sm font-bold transition-colors text-center max-w-[100px] leading-tight ${isSelected ? 'text-[var(--color-navy)] underline underline-offset-4 font-extrabold' : 'text-gray-800 group-hover:text-amber-700'}`}>
                        {cat}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Carousel Button */}
              <button
                onClick={() => scrollCategory('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 bg-white hover:bg-[var(--color-navy)] hover:text-[var(--color-gold)] text-gray-800 rounded-full shadow-lg border border-amber-200 flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95"
                title="পরের ক্যাটেগরি"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

            </div>
          </div>
        </section>

        <ProductCatalog 
          selectedCategory={activeCategoryFilter}
          onSelectCategory={(cat) => setActiveCategoryFilter(cat)}
          onViewDetails={(product) => {
            setSelectedProduct(product);
            window.history.pushState(null, '', `/product/${getProductSlug(product)}`);
          }} 
          onInstantOrder={(product) => {
            setReelProduct(product);
            setCurrentView('reel-offer');
          }}
        />
        
        <section id="about" className="py-20 bg-[var(--color-navy)] text-white">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">The Shoker ghor Legacy</h2>
            <div className="w-16 h-1 bg-[var(--color-gold)] mx-auto mb-8"></div>
            <p className="text-lg text-white/80 leading-relaxed">
              For generations, we have been crafting premium panjabis that embody the rich cultural heritage of South Asia. Using only the finest silks, breathable cottons, and intricate zardozi embroidery, Shoker ghor Shop offers more than just clothing — we offer a statement of elegance, tradition, and uncompromising quality.
            </p>
          </div>
        </section>
      </main>

      <Footer />

      {/* Modals & Drawers */}
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        onCheckout={() => setIsCheckoutOpen(true)}
      />
      
      <CheckoutModal 
        isOpen={isCheckoutOpen} 
        onClose={() => setIsCheckoutOpen(false)} 
      />
      
      <AdminLogin 
        isOpen={isAdminLoginOpen} 
        onClose={() => setIsAdminLoginOpen(false)} 
      />
      <ContactWidget />
      <RecentOrderToast />
      <MobileBottomNav 
        onHomeClick={() => {
          setSelectedProduct(null);
          setCurrentView('home');
        }}
        onCartClick={() => setIsCartOpen(true)}
        onAdminClick={handleAdminClick}
      />
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <PixelTracker />
      <GTMTracker />
      <AppContent />
    </ShopProvider>
  );
}
