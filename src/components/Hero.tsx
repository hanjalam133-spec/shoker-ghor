import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export const Hero: React.FC = () => {
  const { storeBanner, heroBadge, heroTitle1, heroTitle2, heroSubtitle } = useShop();
  return (
    <div className="relative w-full h-[380px] sm:h-[500px] md:h-[800px] bg-[var(--color-navy)] text-white overflow-hidden flex flex-col justify-center">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-60 md:opacity-75 transition-opacity duration-500"
        style={{ backgroundImage: `url(${storeBanner})` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-navy)]/90 via-transparent to-[var(--color-navy)]/50"></div>
      
      <div className="relative container mx-auto px-4 flex flex-col items-center text-center">
        {/* Tag */}
        <div className="inline-flex items-center justify-center border border-[var(--color-gold)] rounded-full px-3 py-1 sm:px-5 sm:py-2 mb-3 sm:mb-8">
          <span className="text-[var(--color-gold)] text-[9px] sm:text-[11px] uppercase tracking-[2px] sm:tracking-[3px] font-bold">
            {heroBadge}
          </span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-[90px] font-serif leading-[1.1] mb-3 sm:mb-6 drop-shadow-lg">
          <span className="block text-white">{heroTitle1}</span>
          <span className="block text-[var(--color-gold)] mt-1 sm:mt-2">{heroTitle2}</span>
        </h1>

        {/* Subtitle */}
        <p className="text-white/80 text-xs sm:text-base md:text-lg mb-5 sm:mb-10 max-w-2xl leading-relaxed drop-shadow-md px-2 sm:px-0 line-clamp-2 sm:line-clamp-none">
          {heroSubtitle}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 w-full px-4 sm:px-0 sm:w-auto">
          <button 
            onClick={() => document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex items-center gap-2 sm:gap-3 bg-[var(--color-gold)] text-[var(--color-navy)] px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-full font-bold uppercase tracking-[1px] text-[11px] sm:text-[12px] hover:bg-white hover:text-[var(--color-navy)] transition-colors cursor-pointer w-full sm:w-auto justify-center"
          >
            EXPLORE COLLECTION <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          
          <button 
            onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
            className="border border-[var(--color-gold)] text-[var(--color-gold)] px-6 py-2.5 sm:px-8 sm:py-3.5 rounded-full font-bold uppercase tracking-[1px] text-[11px] sm:text-[12px] hover:bg-[var(--color-gold)] hover:text-[var(--color-navy)] transition-colors cursor-pointer w-full sm:w-auto justify-center"
          >
            BROWSE CATEGORIES
          </button>
        </div>
      </div>
    </div>
  );
};
