const fs = require('fs');
let code = fs.readFileSync('src/context/ShopContext.tsx', 'utf-8');

// Replace order initialization
code = code.replace(
  /const \[orders, setOrders\] = useState<Order\[\]>\(\(\) => \{[\s\S]*?return defaultDemoOrders;\n  \}\);/,
  `const [orders, setOrders] = useState<Order[]>([]);`
);

// Add useEffect for orders
code = code.replace(
  /\/\/ Real-time synchronization for Store Settings with Firestore & Server API/,
  `// Real-time synchronization for Orders
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
        if (!snapshot.empty) {
          const cloudOrders = snapshot.docs.map(doc => doc.data() as Order);
          // sort by date descending
          cloudOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setOrders(cloudOrders);
        } else {
          setOrders([]);
        }
      }, (err) => {
        console.warn("Firestore orders snapshot error:", err);
      });
    } catch (e) {
      console.warn("Firestore orders listener failed:", e);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Real-time synchronization for Store Settings with Firestore & Server API`
);

fs.writeFileSync('src/context/ShopContext.tsx', code);
