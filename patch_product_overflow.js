const fs = require('fs');
let code = fs.readFileSync('src/components/ProductDetailPage.tsx', 'utf-8');

code = code.replace(/<div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">/g, '<div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8 w-full overflow-x-hidden">');

fs.writeFileSync('src/components/ProductDetailPage.tsx', code);
