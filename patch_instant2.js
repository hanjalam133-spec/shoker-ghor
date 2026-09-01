const fs = require('fs');
let code = fs.readFileSync('src/components/InstantOrderLanding.tsx', 'utf-8');

code = code.replace(/fullUrl = \`\$\{domain\}\/\?landing=\$\{encodeURIComponent\(slug\)\}\`;/g, "fullUrl = `${domain}/landing/${encodeURIComponent(slug)}`;");
code = code.replace(/fullUrl = \`\$\{domain\}\/\?product=\$\{encodeURIComponent\(currentProduct\.id\)\}\`;/g, "fullUrl = `${domain}/product/${encodeURIComponent(currentProduct.id)}`;");

code = code.replace(/path = \`\/\?landing=\$\{encodeURIComponent\(landingPage\.slug \|\| landingPage\.id\)\}\`;/g, "path = `/landing/${encodeURIComponent(landingPage.slug || landingPage.id)}`;");
code = code.replace(/path = \`\/\?product=\$\{encodeURIComponent\(currentProduct\.id\)\}\`;/g, "path = `/product/${encodeURIComponent(currentProduct.id)}`;");

fs.writeFileSync('src/components/InstantOrderLanding.tsx', code);
