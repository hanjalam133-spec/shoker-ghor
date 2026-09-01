const fs = require('fs');
let code = fs.readFileSync('src/context/ShopContext.tsx', 'utf-8');

code = code.replace(
  /const placeOrder = \(orderData: Omit<Order, 'id' \| 'date' \| 'status'>\) => {/,
  `const placeOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {`
);

code = code.replace(
  /clearCart\(\);\n  };/,
  `clearCart();
    
    // Save to Firestore
    try {
      await setDoc(doc(db, "orders", newOrder.id), newOrder);
    } catch (e) {
      console.warn("Failed to write order to Firestore:", e);
    }
  };`
);

code = code.replace(
  /const updateOrderStatus = \(orderId: string, status: Order\['status'\]\) => \{\n    setOrders\(prev => prev\.map\(o => o\.id === orderId \? \{ \.\.\.o, status \} : o\)\);\n  \};/,
  `const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    try {
      await setDoc(doc(db, "orders", orderId), { status }, { merge: true });
    } catch (e) {
      console.warn("Failed to update order status in Firestore:", e);
    }
  };`
);

code = code.replace(
  /const updateOrderMetaSynced = \(orderId: string, synced: boolean\) => \{\n    setOrders\(prev => prev\.map\(o => o\.id === orderId \? \{ \.\.\.o, metaSynced: synced \} : o\)\);\n  \};/,
  `const updateOrderMetaSynced = async (orderId: string, synced: boolean) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, metaSynced: synced } : o));
    try {
      await setDoc(doc(db, "orders", orderId), { metaSynced: synced }, { merge: true });
    } catch (e) {
      console.warn("Failed to update order metaSynced in Firestore:", e);
    }
  };`
);

code = code.replace(
  /const deleteOrder = \(orderId: string\) => \{\n    setOrders\(prev => prev\.filter\(o => o\.id !== orderId\)\);\n  \};/,
  `const deleteOrder = async (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    try {
      await deleteDoc(doc(db, "orders", orderId));
    } catch (e) {
      console.warn("Failed to delete order from Firestore:", e);
    }
  };`
);

fs.writeFileSync('src/context/ShopContext.tsx', code);
