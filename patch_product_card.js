const fs = require('fs');
let code = fs.readFileSync('src/components/ProductCard.tsx', 'utf-8');

code = code.replace(/text-\[9px\] sm:text-\[11px\]/g, 'text-[11px]');
code = code.replace(/py-1\.5 sm:py-2/g, 'py-2');
code = code.replace(/px-2 sm:px-3/g, 'px-3');
code = code.replace(/gap-1\.5 sm:gap-2/g, 'gap-2');
code = code.replace(/gap-\[5px\] sm:gap-\[8px\]/g, 'gap-[8px]');
code = code.replace(/px-1 text-\[8px\] sm:text-\[10px\]/g, 'px-2 text-[10px]');
code = code.replace(/h-\[220px\] md:h-\[260px\]/g, 'h-[240px]');

fs.writeFileSync('src/components/ProductCard.tsx', code);
