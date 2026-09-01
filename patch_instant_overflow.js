const fs = require('fs');
let code = fs.readFileSync('src/components/InstantOrderLanding.tsx', 'utf-8');

// Find the main return block and add overflow-x-hidden
code = code.replace(/<div className="bg-gray-50 min-h-screen">/g, '<div className="bg-gray-50 min-h-screen w-full overflow-x-hidden">');

fs.writeFileSync('src/components/InstantOrderLanding.tsx', code);
