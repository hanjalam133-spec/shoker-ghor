const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Replace responsive font sizes in App.tsx
code = code.replace(/text-2xl sm:text-4xl/g, 'text-3xl');
code = code.replace(/text-xs sm:text-sm/g, 'text-sm');
code = code.replace(/w-20 h-20 sm:w-28 sm:h-28/g, 'w-24 h-24');
code = code.replace(/border-2 sm:border-4/g, 'border-2');

// Fix body overflow to prevent horizontal scroll
code = code.replace(/<div className="min-h-\[100dvh\] flex flex-col font-sans bg-\[var\(--color-page-bg\)\] selection:bg-\[var\(--color-gold\)\] selection:text-\[var\(--color-navy\)\] pb-\[64px\] md:pb-0">/g, 
  '<div className="min-h-[100dvh] w-full overflow-x-hidden flex flex-col font-sans bg-[var(--color-page-bg)] selection:bg-[var(--color-gold)] selection:text-[var(--color-navy)] pb-[64px] md:pb-0">');

code = code.replace(/<div className="min-h-\[100dvh\] flex flex-col font-sans bg-\[var\(--color-page-bg\)\] selection:bg-\[var\(--color-gold\)\] selection:text-\[var\(--color-navy\)\]">/g, 
  '<div className="min-h-[100dvh] w-full overflow-x-hidden flex flex-col font-sans bg-[var(--color-page-bg)] selection:bg-[var(--color-gold)] selection:text-[var(--color-navy)]">');

fs.writeFileSync('src/App.tsx', code);
