const fs = require('fs');
let code = fs.readFileSync('src/context/ShopContext.tsx', 'utf-8');

code = code.replace(
  /const cloudOrders = snapshot.docs.map\(doc => doc.data\(\) as Order\);\n          \/\/ sort by date descending\n          cloudOrders.sort\(\(a, b\) => new Date\(b.date\).getTime\(\) - new Date\(a.date\).getTime\(\)\);\n          setOrders\(cloudOrders\);/,
  `const cloudOrders = snapshot.docs.map(doc => doc.data() as Order);
          // sort by date descending
          cloudOrders.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          setOrders(prev => {
            if (prev.length > 0 && cloudOrders.length > prev.length) {
              playOrderSuccessSound();
            }
            return cloudOrders;
          });`
);

fs.writeFileSync('src/context/ShopContext.tsx', code);
