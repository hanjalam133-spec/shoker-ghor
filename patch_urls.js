const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Change pushState for products
code = code.replace(/window\.history\.pushState\(null, '', \`\/\?product=\$\{encodeURIComponent\(product\.id\)\}\`\);/g, "window.history.pushState(null, '', `/product/${encodeURIComponent(product.id)}`);");

// Change pushState for back buttons
code = code.replace(/window\.history\.pushState\(null, '', '\/'\);/g, "window.history.pushState(null, '', '/');");

fs.writeFileSync('src/App.tsx', code);
