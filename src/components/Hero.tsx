import React from 'react';
import { useShop } from '../context/ShopContext';

export const Hero: React.FC = () => {
  const { storeBanner } = useShop();

  // যদি ব্যানার না থাকে তবে এটি দেখাবে না
  if (!storeBanner) return null;

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