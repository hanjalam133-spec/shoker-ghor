import React from 'react';
import { Product } from '../types';
import { formatCurrency, getProductSlug } from '../lib/utils';
import { useShop } from '../context/ShopContext';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onInstantOrder: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, onInstantOrder }) => {
  const { 
    addToCart,
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
    btnDetailsTextColor
  } = useShop();

  return (
    <div className="flex flex-col bg-white border border-[#eee] transition-transform duration-200 hover:-translate-y-1">
      <a 
        href={`/product/${getProductSlug(product)}`}
        className="relative h-[240px] bg-[#f0f0f0] flex items-center justify-center overflow-hidden cursor-pointer group block" 
        onClick={(e) => {
          e.preventDefault();
          onViewDetails(product);
        }}
      >
        <img 
          src={product.image} 
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
            <span className="bg-[var(--color-navy)] text-white px-4 py-2 font-bold uppercase tracking-wider text-xs">Out of Stock</span>
          </div>
        )}
        <span className="absolute top-[10px] left-[10px] bg-[var(--color-navy)] text-[var(--color-gold)] text-[9px] px-2 py-1 uppercase tracking-wider z-10">
          {(product.category || 'Product').split(' ')[0]}
        </span>
      </a>
      
      <div className="p-[15px] flex flex-col flex-1">
        <h3 className="text-[16px] font-serif mb-[5px] text-[#1a1a1a] line-clamp-1 hover:text-[var(--color-gold)] transition-colors">
          <a 
            href={`/product/${getProductSlug(product)}`}
            onClick={(e) => {
              e.preventDefault();
              onViewDetails(product);
            }}
          >
            {product.title}
          </a>
        </h3>
        <div className="flex items-baseline gap-2 mb-[12px] mt-auto flex-wrap">
          <span className="text-[var(--color-gold)] font-bold text-[18px]">
            {formatCurrency(product.price)}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-gray-400 line-through text-[13px] font-normal">
              {formatCurrency(product.originalPrice)}
            </span>
          )}
        </div>
        
        <div className="flex flex-col gap-2">
          {btnInstantOrderShow && (
            <button 
              className="w-full py-2 px-3 text-[11px] font-extrabold uppercase cursor-pointer border transition-colors flex items-center justify-center gap-1 shadow-sm"
              style={{ backgroundColor: btnInstantOrderBgColor, color: btnInstantOrderTextColor, borderColor: btnInstantOrderBgColor }}
              onClick={(e) => {
                e.stopPropagation();
                onInstantOrder(product);
              }}
            >
              {btnInstantOrderText}
            </button>
          )}
          
          {(btnAddToCartShow || btnDetailsShow) && (
            <div className="flex gap-[8px]">
              {btnAddToCartShow && (
                <button 
                  className="flex-1 py-2 px-2 text-[10px] uppercase font-bold cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed truncate border"
                  style={{ backgroundColor: btnAddToCartBgColor, color: btnAddToCartTextColor, borderColor: btnAddToCartBgColor }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.inStock) {
                      addToCart(product, '42', 1);
                    }
                  }}
                  disabled={!product.inStock}
                >
                  {btnAddToCartText}
                </button>
              )}
              {btnDetailsShow && (
                <a 
                  href={`/product/${getProductSlug(product)}`}
                  className="flex-1 py-2 px-2 text-[10px] uppercase font-bold cursor-pointer transition-colors truncate border text-center flex items-center justify-center"
                  style={{ backgroundColor: btnDetailsBgColor, color: btnDetailsTextColor, borderColor: '#ddd' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onViewDetails(product);
                  }}
                >
                  {btnDetailsText}
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
