const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

if (!code.includes('app.use("/api",')) {
  code = code.replace(
    /const app = express\(\);\nconst PORT = process.env.PORT \|\| 3000;/,
    `const app = express();\nconst PORT = process.env.PORT || 3000;\n\n  // Prevent caching for API routes\n  app.use("/api", (req, res, next) => {\n    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');\n    res.setHeader('Pragma', 'no-cache');\n    res.setHeader('Expires', '0');\n    next();\n  });`
  );
  fs.writeFileSync('server.ts', code);
}
