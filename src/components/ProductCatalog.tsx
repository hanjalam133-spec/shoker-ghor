import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { Product, Category } from '../types';

interface ProductCatalogProps {
  onViewDetails: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
  selectedCategory?: Category | 'All';
  onSelectCategory?: (category: Category | 'All') => void;
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ 
  onViewDetails, 
  onInstantOrder,
  selectedCategory: externalSelectedCategory,
  onSelectCategory
}) => {
  const { products, categories, categoryImages, showCategoryFilterBar } = useShop();
  const [internalSelectedCategory, setInternalSelectedCategory] = useState<Category | 'All'>('All');
  const [priceSort, setPriceSort] = useState<'none' | 'asc' | 'desc'>('none');

  const selectedCategory = externalSelectedCategory !== undefined ? externalSelectedCategory : internalSelectedCategory;

  const handleCategoryChange = (cat: Category | 'All') => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    } else {
      setInternalSelectedCategory(cat);
    }
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    const isAll = !selectedCategory || selectedCategory === 'All' || selectedCategory.toLowerCase() === 'all';

    if (!isAll) {
      result = result.filter(p => {
        const prodCat = (p.category || '').trim().toLowerCase();
        const selCat = (selectedCategory || '').trim().toLowerCase();
        return prodCat === selCat;
      });
    }

    if (priceSort === 'asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (priceSort === 'desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, priceSort]);

  return (
    <section id="shop" className="bg-[var(--color-page-bg)] py-10 md:py-12">
      <div className="container mx-auto px-4">
        
        {/* Filter Bar */}
        <div className="bg-white border border-[#eee] py-3 px-4 md:px-10 flex flex-col md:flex-row gap-4 md:gap-5 items-start md:items-center text-[12px] mb-8">
          {showCategoryFilterBar && (
            <>
              <strong className="text-gray-800">Filter:</strong>
              <div className="flex flex-wrap gap-2 md:gap-4">
                <button 
                  onClick={() => handleCategoryChange('All')}
                  className={`border px-4 py-1.5 rounded-[20px] cursor-pointer transition-colors font-medium ${selectedCategory === 'All' ? 'bg-[var(--color-navy)] text-[var(--color-gold)] border-[var(--color-navy)] font-bold' : 'bg-white border-[#eee] hover:bg-gray-50 text-gray-700'}`}
                >
                  All Products
                </button>
                {categories.map((cat, idx) => (
                  <button
                    key={`${cat}-${idx}`}
                    onClick={() => handleCategoryChange(cat)}
                    className={`border px-4 py-1.5 rounded-[20px] cursor-pointer transition-colors font-medium ${selectedCategory === cat ? 'bg-[var(--color-navy)] text-[var(--color-gold)] border-[var(--color-navy)] font-bold' : 'bg-white border-[#eee] hover:bg-gray-50 text-gray-700'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="md:ml-auto flex items-center gap-3">
            <label className="text-xs font-medium text-gray-700 uppercase tracking-wider">Sort:</label>
            <select 
              value={priceSort} 
              onChange={(e) => setPriceSort(e.target.value as any)}
              className="border border-[#eee] rounded-[20px] py-1.5 px-3 bg-white text-xs outline-none focus:border-[var(--color-navy)] cursor-pointer"
            >
              <option value="none">Default</option>
              <option value="asc">Price: Low to High</option>
              <option value="desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {filteredAndSortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
            {filteredAndSortedProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onViewDetails={onViewDetails} 
                onInstantOrder={onInstantOrder}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-xl text-gray-500">No products found for the selected category.</h3>
          </div>
        )}
      </div>
    </section>
  );
};
