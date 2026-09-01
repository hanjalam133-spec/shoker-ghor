const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/window\.location\.hash = `#product\/\$\{encodeURIComponent\(product\.id\)\}`;/g, "window.history.pushState(null, '', `/product/${encodeURIComponent(product.id)}`);");

code = code.replace(/window\.location\.hash = '';\n\s*setCurrentLandingSlug\(null\);/g, "window.history.pushState(null, '', '/');\n              setCurrentLandingSlug(null);");

fs.writeFileSync('src/App.tsx', code);
