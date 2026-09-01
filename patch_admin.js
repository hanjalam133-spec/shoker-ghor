const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(/const landingUrl = `\$\{domain\}\/\?landing=\$\{encodeURIComponent\(page.slug\)\}`;/g, "const landingUrl = `${domain}/landing/${page.slug}`;");

code = code.replace(/window.location.hash = `#landing\/\$\{page.slug\}`;/g, "window.history.pushState(null, '', `/landing/${page.slug}`); window.dispatchEvent(new PopStateEvent('popstate'));");

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
