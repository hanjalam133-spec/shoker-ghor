const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf-8');

code = code.replace(/app\.use\(express\.json\(\)\);/g, 'app.use(express.json({ limit: "200mb" }));\napp.use(express.urlencoded({ limit: "200mb", extended: true }));');

// Also catch Firestore errors in server.ts so it doesn't crash the API response if document is too large
code = code.replace(/if \(db\) \{\n\s*await setDoc\(doc\(db, "products", String\(product.id\)\), product\);\n\s*\}/g, `if (db) {
        try {
          await setDoc(doc(db, "products", String(product.id)), product);
        } catch (dbErr) {
          console.warn("Failed to save to Firestore (possibly too large), but saved locally.", dbErr);
        }
      }`);

fs.writeFileSync('server.ts', code);
