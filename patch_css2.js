const fs = require('fs');
let code = fs.readFileSync('src/index.css', 'utf-8');

code = code.replace(/input, button, select, textarea \{[\s\S]*\}\n/g, "");

code += `\n
@layer base {
  input[type="text"],
  input[type="number"],
  input[type="email"],
  input[type="password"],
  input[type="tel"],
  select,
  textarea {
    @apply appearance-none bg-transparent;
  }
  
  /* Prevent zoom on focus in iOS */
  input, select, textarea {
    font-size: 16px !important;
  }
}
`;

fs.writeFileSync('src/index.css', code);
