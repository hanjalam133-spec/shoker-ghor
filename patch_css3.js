const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf-8');

code = code.replace(/  \/\* Prevent zoom on focus in iOS \*\/[\s\S]*\}\n\}/, '}');

fs.writeFileSync('src/index.css', code);
