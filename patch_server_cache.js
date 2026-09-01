const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(
  'app.use(express.static(distPath));',
  `app.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        } else {
          // Keep cache for assets
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
      }
    }));`
);

fs.writeFileSync('server.ts', code);
