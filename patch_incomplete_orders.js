const fs = require('fs');
let code = fs.readFileSync('src/context/ShopContext.tsx', 'utf-8');

// Replace localStorage initialization for incompleteOrders
code = code.replace(
  /const \[incompleteOrders, setIncompleteOrders\] = useState<Order\[\]>\(\(\) => \{[\s\S]*?return \[\];\n  \}\);/,
  `const [incompleteOrders, setIncompleteOrders] = useState<Order[]>([]);`
);

// Add onSnapshot for incompleteOrders
code = code.replace(
  /\/\/ Real-time synchronization for Orders\n  useEffect\(\(\) => \{/,
  `// Real-time synchronization for Incomplete Orders
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    try {
      unsubscribe = onSnapshot(collection(db, "incompleteOrders"), (snapshot) => {
        if (!snapshot.empty) {
          const cloudIncompleteOrders = snapshot.docs.map(doc => doc.data() as Order);
          cloudIncompleteOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setIncompleteOrders(cloudIncompleteOrders);
        } else {
          setIncompleteOrders([]);
        }
      }, (err) => {
        console.warn("Firestore incompleteOrders snapshot error:", err);
      });
    } catch (e) {
      console.warn("Firestore incompleteOrders listener failed:", e);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Real-time synchronization for Orders
  useEffect(() => {`
);

// Remove incompleteOrders localStorage sync
code = code.replace(
  /  useEffect\(\(\) => \{\n    localStorage\.setItem\('elham_incomplete_orders', JSON\.stringify\(incompleteOrders\)\);\n  \}, \[incompleteOrders\]\);\n/,
  ``
);

// Update addOrUpdateIncompleteOrder to save to Firestore
code = code.replace(
  /const addOrUpdateIncompleteOrder = \(id: string, orderData: Omit<Order, 'id' \| 'date' \| 'status'>\) => \{\n    setIncompleteOrders\(prev => \{\n      const exists = prev\.some\(o => o\.id === id\);\n      if \(exists\) \{\n        return prev\.map\(o => o\.id === id \? \{\n          \.\.\.o,\n          customer: orderData\.customer,\n          items: orderData\.items,\n          total: orderData\.total,\n          paymentMethod: orderData\.paymentMethod\n        \} : o\);\n      \} else \{\n        const newIncomplete: Order = \{\n          \.\.\.orderData,\n          id,\n          date: new Date\(\)\.toISOString\(\),\n          status: 'incomplete'\n        \};\n        return \[newIncomplete, \.\.\.prev\];\n      \}\n    \}\);\n  \};/,
  `const addOrUpdateIncompleteOrder = async (id: string, orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    let newIncomplete: Order | null = null;
    setIncompleteOrders(prev => {
      const exists = prev.some(o => o.id === id);
      if (exists) {
        return prev.map(o => {
          if (o.id === id) {
            newIncomplete = {
              ...o,
              customer: orderData.customer,
              items: orderData.items,
              total: orderData.total,
              paymentMethod: orderData.paymentMethod
            };
            return newIncomplete;
          }
          return o;
        });
      } else {
        newIncomplete = {
          ...orderData,
          id,
          date: new Date().toISOString(),
          status: 'incomplete'
        };
        return [newIncomplete, ...prev];
      }
    });

    if (newIncomplete) {
      try {
        await setDoc(doc(db, "incompleteOrders", id), newIncomplete, { merge: true });
      } catch (e) {
        console.warn("Failed to write incomplete order to Firestore:", e);
      }
    }
  };`
);

// Update deleteIncompleteOrder to delete from Firestore
code = code.replace(
  /const deleteIncompleteOrder = \(id: string\) => \{\n    setIncompleteOrders\(prev => prev\.filter\(o => o\.id !== id\)\);\n  \};/,
  `const deleteIncompleteOrder = async (id: string) => {
    setIncompleteOrders(prev => prev.filter(o => o.id !== id));
    try {
      await deleteDoc(doc(db, "incompleteOrders", id));
    } catch (e) {
      console.warn("Failed to delete incomplete order from Firestore:", e);
    }
  };`
);

// Update placeOrder to delete incomplete order from Firestore when it is converted
code = code.replace(
  /if \(orderData\.customer\?\.phone\) \{\n      const cleanTargetPhone = orderData\.customer\.phone\.replace\(\/\\D\/g, ''\);\n      setIncompleteOrders\(prev => prev\.filter\(io => \{\n        const cleanIOPhone = io\.customer\?\.phone\?\.replace\(\/\\D\/g, ''\) \|\| '';\n        return cleanIOPhone !== cleanTargetPhone;\n      \}\)\);\n    \}/,
  `if (orderData.customer?.phone) {
      const cleanTargetPhone = orderData.customer.phone.replace(/\\D/g, '');
      setIncompleteOrders(prev => {
        const toKeep: Order[] = [];
        const toRemove: string[] = [];
        prev.forEach(io => {
          const cleanIOPhone = io.customer?.phone?.replace(/\\D/g, '') || '';
          if (cleanIOPhone !== cleanTargetPhone) {
            toKeep.push(io);
          } else {
            toRemove.push(io.id);
          }
        });
        
        // Remove from Firestore
        toRemove.forEach(async (id) => {
          try {
            await deleteDoc(doc(db, "incompleteOrders", id));
          } catch (e) {}
        });
        
        return toKeep;
      });
    }`
);

fs.writeFileSync('src/context/ShopContext.tsx', code);
