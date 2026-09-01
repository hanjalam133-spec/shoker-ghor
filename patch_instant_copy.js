const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf-8');

code = code.replace(/fullUrl = \`\$\{domain\}\/\?product=\$\{encodeURIComponent\(product\.id\)\}\`;/g, "fullUrl = `${domain}/product/${encodeURIComponent(product.id)}`;");
code = code.replace(/path = \`\/\?product=\$\{encodeURIComponent\(product\.id\)\}\`;/g, "path = `/product/${encodeURIComponent(product.id)}`;");

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
