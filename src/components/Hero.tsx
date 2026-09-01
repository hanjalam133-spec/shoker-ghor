import React from 'react';
import { useShop } from '../context/ShopContext';

export const Hero: React.FC = () => {
  const { storeBanner } = useShop();

  return (
    <div className="relative w-full h-auto overflow-hidden">
      <img 
        src={storeBanner} 
        alt="Hero Banner" 
        className="w-full h-auto object-contain block"
      />
    </div>
  );
};