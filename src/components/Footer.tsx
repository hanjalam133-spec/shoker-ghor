import React from 'react';
import { useShop } from '../context/ShopContext';

export const Footer: React.FC = () => {
  const { 
    storeLogo, 
    storeName, 
    phoneNumber,
    footerShow,
    footerBgColor,
    footerTextColor,
    footerText,
    footerAddress,
    footerPayments
  } = useShop();

  if (!footerShow) return null;

  const paymentMethods = footerPayments.split(',').map(p => p.trim()).filter(Boolean);

  return (
    <footer 
      className="border-t border-[#eee] py-10 text-[12px]"
      style={{ backgroundColor: footerBgColor, color: footerTextColor }}
    >
      <div className="container mx-auto px-4 md:px-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
            <img 
              src={storeLogo} 
              alt="Logo" 
              referrerPolicy="no-referrer"
              className="w-14 h-14 rounded-full border border-[var(--color-gold)] object-cover shadow-md mx-auto md:mx-0"
            />
            <div>
              <div className="font-serif font-bold text-[18px] mb-1 uppercase tracking-widest" style={{ color: footerTextColor }}>{storeName}</div>
              <div>&copy; {new Date().getFullYear()} {storeName.split('-')[0].trim()}. {footerText}</div>
            </div>
          </div>

          {paymentMethods.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <span className="font-medium" style={{ color: footerTextColor }}>Accepted Payments:</span>
              <div className="flex flex-wrap justify-center gap-3">
                {paymentMethods.map(method => (
                  <div key={method} className="w-10 h-[25px] border border-[#eee] rounded-[4px] bg-[#f9f9f9]/10 flex items-center justify-center text-[8px] font-bold" style={{ color: footerTextColor }}>
                    {method}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="text-center md:text-right text-xs">
            <p className="mb-1"><span className="font-bold">ঠিকানা:</span> {footerAddress}</p>
            <p>Support: <a href={`tel:${phoneNumber}`} className="font-bold text-[#005bd3] hover:underline">+{phoneNumber}</a></p>
          </div>
        </div>
      </div>
    </footer>
  );
};
