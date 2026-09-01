import React, { useState } from 'react';
import { Phone, MessageCircle, MessageSquare, Facebook, X, HeartHandshake } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useShop } from '../context/ShopContext';

export const ContactWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { whatsappNumber, phoneNumber, messengerUrl, facebookPageUrl } = useShop();

  const cleanPhoneForWa = whatsappNumber.replace(/[^0-9]/g, '');
  
  const waUrl = `https://wa.me/${cleanPhoneForWa}?text=Assalamu%20Alaikum%20Elham%20Shop!%20I%20want%20to%20know%20more%20about%20your%20products.`;
  const telUrl = `tel:${phoneNumber}`;
  const smsUrl = `sms:${phoneNumber}?body=Assalamu%20Alaikum%20Elham%20Shop!%20I%20want%20to%20order.`;
  const fbMessengerUrl = messengerUrl.startsWith('http') ? messengerUrl : `https://m.me/${messengerUrl}`;
  const fbPageUrl = facebookPageUrl;

  const contactOptions = [
    {
      id: "whatsapp",
      name: "হোয়াটসঅ্যাপ (WhatsApp)",
      icon: <MessageCircle className="w-5 h-5 fill-white text-[#25D366]" />,
      url: waUrl,
      color: "bg-[#25D366]",
      hoverColor: "hover:bg-[#20ba56]",
      shadow: "shadow-[#25D366]/30",
    },
    {
      id: "call",
      name: "কল করুন (Call Now)",
      icon: <Phone className="w-5 h-5 fill-white text-[#005bd3]" />,
      url: telUrl,
      color: "bg-[#005bd3]",
      hoverColor: "hover:bg-[#004bb4]",
      shadow: "shadow-[#005bd3]/30",
    },
    {
      id: "facebook",
      name: "ফেসবুক মেসেজ (Facebook)",
      icon: <Facebook className="w-5 h-5 fill-white text-[#1877F2]" />,
      url: fbMessengerUrl,
      alternativeUrl: fbPageUrl,
      color: "bg-[#1877F2]",
      hoverColor: "hover:bg-[#166fe5]",
      shadow: "shadow-[#1877F2]/30",
    },
    {
      id: "sms",
      name: "এসএমএস (SMS Message)",
      icon: <MessageSquare className="w-5 h-5 fill-white text-[#f39c12]" />,
      url: smsUrl,
      color: "bg-[#f39c12]",
      hoverColor: "hover:bg-[#d68910]",
      shadow: "shadow-[#f39c12]/30",
    },
  ];

  return (
    <div 
      id="contact-floating-widget" 
      className="fixed bottom-20 lg:bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto"
    >
      {/* Expanded Menu Options */}
      <AnimatePresence>
        {isOpen && (
          <div className="flex flex-col items-end gap-3 mb-2">
            {contactOptions.map((option, index) => (
              <motion.div
                key={option.id}
                initial={{ opacity: 0, y: 15, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  transition: { delay: index * 0.05, type: "spring", stiffness: 300, damping: 25 }
                }}
                exit={{ 
                  opacity: 0, 
                  y: 10, 
                  scale: 0.9,
                  transition: { delay: (contactOptions.length - 1 - index) * 0.04, duration: 0.15 }
                }}
                className="flex items-center gap-3 group"
              >
                {/* Text Label */}
                <span className="bg-white border border-gray-100 text-[#1a1a1a] px-3 py-1.5 rounded-lg text-xs font-bold shadow-md opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 select-none whitespace-nowrap">
                  {option.name}
                </span>

                {/* Circular Button */}
                <a
                  href={option.url}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noopener noreferrer"
                  className={`${option.color} ${option.hoverColor} text-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg ${option.shadow} transition-all duration-300 hover:scale-110 active:scale-95`}
                  title={option.name}
                >
                  {option.icon}
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main Trigger Floating Action Button */}
      <div className="flex items-center gap-2.5">
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="bg-white border border-[#e52e04]/10 text-[#e52e04] font-bold text-xs py-2 px-3.5 rounded-full shadow-lg select-none whitespace-nowrap animate-bounce flex items-center gap-1.5"
            style={{ animationDuration: '3s' }}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#e52e04] animate-pulse"></span>
            প্রয়োজনে যোগাযোগ করুন
          </motion.div>
        )}
        <motion.button
          id="contact-main-fab"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-300 cursor-pointer ${
            isOpen ? 'bg-[#202223] hover:bg-black' : 'bg-[#e52e04] hover:bg-[#c92400]'
          }`}
          whileTap={{ scale: 0.95 }}
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          {isOpen ? (
            <X className="w-6 h-6 stroke-[2.5]" />
          ) : (
            <div className="relative flex items-center justify-center">
              {/* Soft outer pulse effect */}
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#e52e04]/40 animate-ping opacity-75"></span>
              <HeartHandshake className="w-7 h-7 relative z-10" />
            </div>
          )}
        </motion.button>
      </div>
    </div>
  );
};
