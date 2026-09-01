const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/onBack=\{\(\) => \{\n\s*setSelectedProduct\(null\);\n\s*const urlParams = new URLSearchParams\(window\.location\.search\);\n\s*if \(window\.location\.pathname\.startsWith\('\/product\/'\)\) \{\n\s*window\.history\.pushState\(null, '', '\/'\);\n\s*\} else if \(window\.location\.hash\.startsWith\('#product\/'\)\) \{\n\s*window\.location\.hash = '';\n\s*\} else if \(urlParams\.has\('product'\) \|\| urlParams\.has\('prodData'\)\) \{\n\s*window\.history\.pushState\(null, '', '\/'\);\n\s*\}\n\s*\}\}/g, `onBack={() => {
            setSelectedProduct(null);
            window.history.pushState(null, '', '/');
          }}`);

code = code.replace(/onInstantOrder=\{\(product\) => \{\n\s*setSelectedProduct\(null\);\n\s*setReelProduct\(product\);\n\s*setCurrentView\('reel-offer'\);\n\s*const urlParams = new URLSearchParams\(window\.location\.search\);\n\s*if \(window\.location\.pathname\.startsWith\('\/product\/'\)\) \{\n\s*window\.history\.pushState\(null, '', '\/'\);\n\s*\} else if \(window\.location\.hash\.startsWith\('#product\/'\)\) \{\n\s*window\.location\.hash = '';\n\s*\} else if \(urlParams\.has\('product'\) \|\| urlParams\.has\('prodData'\)\) \{\n\s*window\.history\.pushState\(null, '', '\/'\);\n\s*\}\n\s*\}\}/g, `onInstantOrder={(product) => {
            setSelectedProduct(null);
            setReelProduct(product);
            setCurrentView('reel-offer');
            window.history.pushState(null, '', '/');
          }}`);
fs.writeFileSync('src/App.tsx', code);
