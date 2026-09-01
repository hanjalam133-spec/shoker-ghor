const fs = require('fs');
let code = fs.readFileSync('src/components/InstantOrderLanding.tsx', 'utf-8');

code = code.replace(/const currentProduct: Product = selectedProduct \|\| featuredProduct \|\| products\[0\] \|\| \{/g, `const currentProduct: Product = (landingPage ? products.find(p => p.id === landingPage.productId) : selectedProduct) || featuredProduct || products[0] || {`);

fs.writeFileSync('src/components/InstantOrderLanding.tsx', code);
