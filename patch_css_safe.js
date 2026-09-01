const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf-8');

code = code.replace(/\/\* Fix iOS appearance issues \*\/[\s\S]*\/\* Remove tap highlight on mobile \*\//, `/* Fix iOS appearance issues */
input[type="text"], input[type="number"], input[type="tel"], input[type="email"], input[type="password"], textarea {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 0;
}

/* Remove tap highlight on mobile */`);

fs.writeFileSync('src/index.css', code);
