const fs = require('fs');
const content = fs.readFileSync('src/context/ShopContext.tsx', 'utf-8');
const lines = content.split('\n');

const newCode = `
  // Load products from Firestore and server API on startup
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let firestoreLoaded = false;
    
    try {
      unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
        if (!snapshot.empty) {
          firestoreLoaded = true;
          const cloudProducts = snapshot.docs.map(doc => doc.data());
          let urlProd = null;
          try {
            const urlParams = new URLSearchParams(window.location.search);
            const prodData = urlParams.get('prodData');
            if (prodData) {
              urlProd = JSON.parse(decodeURIComponent(escape(atob(prodData))));
            }
          } catch (e) {}
          const result = [...cloudProducts];
          if (urlProd && !result.some(p => p.id === urlProd.id)) {
            result.unshift(urlProd);
          }
          setProducts(result);
        }
      }, (err) => {
        console.warn("Firestore products snapshot error, using API fallback:", err);
      });
    } catch (e) {
      console.warn("Firestore listener failed:", e);
    }

    const fetchProductsAPI = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const serverProducts = await res.json();
          // Only use server fallback if Firestore hasn't loaded data
          if (!firestoreLoaded && Array.isArray(serverProducts) && serverProducts.length > 0) {
            let urlProd = null;
            try {
              const urlParams = new URLSearchParams(window.location.search);
              const prodData = urlParams.get('prodData');
              if (prodData) {
                urlProd = JSON.parse(decodeURIComponent(escape(atob(prodData))));
              }
            } catch (e) {}
            const result = [...serverProducts];
            if (urlProd && !result.some(p => p.id === urlProd.id)) {
              result.unshift(urlProd);
            }
            setProducts(result);
          }
        }
      } catch (err) {
        console.error("Failed to fetch products from server:", err);
      }
    };
    fetchProductsAPI();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
`;

// lines 689 to 723 (inclusive, so indices 688 to 722)
lines.splice(688, 35, newCode);

fs.writeFileSync('src/context/ShopContext.tsx', lines.join('\n'));
