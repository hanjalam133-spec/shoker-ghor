const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/min-h-screen/g, 'min-h-[100dvh]');

fs.writeFileSync('src/App.tsx', code);
