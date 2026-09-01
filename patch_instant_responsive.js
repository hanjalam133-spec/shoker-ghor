const fs = require('fs');
let code = fs.readFileSync('src/components/InstantOrderLanding.tsx', 'utf-8');

code = code.replace(/text-xs sm:text-base/g, 'text-sm');
code = code.replace(/text-base sm:text-xl/g, 'text-lg');
code = code.replace(/text-lg sm:text-xl/g, 'text-lg');
code = code.replace(/text-sm sm:text-lg/g, 'text-base');
code = code.replace(/text-\[11px\] sm:text-xs/g, 'text-xs');
code = code.replace(/text-sm sm:text-base/g, 'text-base');
code = code.replace(/p-3\.5 sm:p-4/g, 'p-4');
code = code.replace(/p-3 sm:p-4/g, 'p-4');

fs.writeFileSync('src/components/InstantOrderLanding.tsx', code);
