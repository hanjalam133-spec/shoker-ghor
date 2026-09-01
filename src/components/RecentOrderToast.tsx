import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const SIMULATED_BUYERS = [
  { name: 'আরিফুল ইসলাম', city: 'মিরপুর, ঢাকা', time: '১ মিনিট আগে' },
  { name: 'মাহমুদ হাসান', city: 'উত্তরা, ঢাকা', time: '৩ মিনিট আগে' },
  { name: 'জাকির হোসেন', city: 'চট্টগ্রাম সদর', time: '৫ মিনিট আগে' },
  { name: 'ইমরান খান', city: 'রাজশাহী', time: '৭ মিনিট আগে' },
  { name: 'সাইফুল ইসলাম', city: 'সিলেট', time: '৮ মিনিট আগে' },
  { name: 'আব্দুর রহমান', city: 'খুলনা', time: '১০ মিনিট আগে' },
  { name: 'তাসনিম আহমেদ', city: 'ধানমণ্ডি, ঢাকা', time: '১২ মিনিট আগে' },
  { name: 'মোহাম্মদ আলী', city: 'কুমিল্লা', time: '১৫ মিনিট আগে' }
];

export const RecentOrderToast: React.FC = () => {
  const [activeAlert, setActiveAlert] = useState<typeof SIMULATED_BUYERS[0] | null>(null);
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const triggerNextAlert = () => {
      const randomBuyer = SIMULATED_BUYERS[Math.floor(Math.random() * SIMULATED_BUYERS.length)];
      setActiveAlert(randomBuyer);
      
      // Hide alert after 5 seconds
      alertTimeoutRef.current = setTimeout(() => {
        setActiveAlert(null);
        // Schedule next alert in 8-15 seconds
        const nextInterval = Math.floor(Math.random() * 7000) + 8000;
        alertTimeoutRef.current = setTimeout(triggerNextAlert, nextInterval);
      }, 5000);
    };

    // First alert triggers after 6 seconds
    const firstTimeout = setTimeout(triggerNextAlert, 6000);

    return () => {
      clearTimeout(firstTimeout);
      if (alertTimeoutRef.current) clearTimeout(alertTimeoutRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {activeAlert && (
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-20 md:bottom-6 left-6 z-50 bg-white border border-gray-100 rounded-xl p-3 shadow-2xl flex items-center gap-3 max-w-sm"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm shadow-inner">
              {activeAlert.name[0]}
            </div>
            <span className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
          </div>
          <div>
            <p className="text-[11px] font-bold text-neutral-900 font-sans">
              {activeAlert.name} ({activeAlert.city})
            </p>
            <p className="text-[10px] text-gray-500 font-sans">
              এইমাত্র একটি পাঞ্জাবি অর্ডার কনফার্ম করেছেন! <strong className="text-amber-600 font-semibold">{activeAlert.time}</strong>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
