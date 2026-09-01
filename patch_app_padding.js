const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/<div className="min-h-\[100dvh\] flex flex-col font-sans bg-\[var\(--color-page-bg\)\] selection:bg-\[var\(--color-gold\)\] selection:text-\[var\(--color-navy\)\]">/g, '<div className="min-h-[100dvh] flex flex-col font-sans bg-[var(--color-page-bg)] selection:bg-[var(--color-gold)] selection:text-[var(--color-navy)] pb-[64px] md:pb-0">');

fs.writeFileSync('src/App.tsx', code);
