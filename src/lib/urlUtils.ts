import { LandingPage, Product } from '../types';

export const getPdataFromUrl = (): LandingPage | null => {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    let pdataStr = searchParams.get('pdata');

    if (!pdataStr && window.location.hash) {
      const hashQueryIndex = window.location.hash.indexOf('?');
      if (hashQueryIndex !== -1) {
        const hashParams = new URLSearchParams(window.location.hash.substring(hashQueryIndex));
        pdataStr = hashParams.get('pdata');
      }
    }

    if (pdataStr) {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(pdataStr))));
      if (decoded && (decoded.slug || decoded.id)) {
        return decoded as LandingPage;
      }
    }
  } catch (e) {
    console.warn('Failed to parse pdata from URL:', e);
  }
  return null;
};

export const getProdDataFromUrl = (): Product | null => {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    let prodDataStr = searchParams.get('prodData');

    if (!prodDataStr && window.location.hash) {
      const hashQueryIndex = window.location.hash.indexOf('?');
      if (hashQueryIndex !== -1) {
        const hashParams = new URLSearchParams(window.location.hash.substring(hashQueryIndex));
        prodDataStr = hashParams.get('prodData');
      }
    }

    if (prodDataStr) {
      const decoded = JSON.parse(decodeURIComponent(escape(atob(prodDataStr))));
      if (decoded && decoded.id) {
        return decoded as Product;
      }
    }
  } catch (e) {
    console.warn('Failed to parse prodData from URL:', e);
  }
  return null;
};
