import React, { useEffect } from 'react';
import { useShop } from '../context/ShopContext';

export const GTMTracker: React.FC = () => {
  const { gtmId } = useShop();

  useEffect(() => {
    if (!gtmId) return;

    // Prevent multiple injections
    if (document.getElementById('gtm-script')) return;

    // Load Google Tag Manager Script
    const script = document.createElement('script');
    script.id = 'gtm-script';
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;
      if (f && f.parentNode) { f.parentNode.insertBefore(j,f); } else { d.head.appendChild(j); }
      })(window,document,'script','dataLayer','${gtmId}');

    `;
    document.head.appendChild(script);

    // Load Google Tag Manager Noscript
    const noscript = document.createElement('noscript');
    noscript.id = 'gtm-noscript';
    noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.appendChild(noscript);

  }, [gtmId]);

  return null;
};
