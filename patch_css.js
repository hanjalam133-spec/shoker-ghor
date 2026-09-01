const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf-8');

if (!code.includes('input, button, select, textarea')) {
code += `\n
input, button, select, textarea {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  border-radius: 0; /* Reset for iOS */
}

/* Base resets for better cross-browser consistency */
* {
  -webkit-tap-highlight-color: transparent;
}

img {
  max-width: 100%;
  height: auto;
}

html, body {
  overscroll-behavior-y: none;
  -webkit-text-size-adjust: 100%;
}
`;
fs.writeFileSync('src/index.css', code);
}
