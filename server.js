process.env.NODE_ENV = 'production';
try {
  require('./dist/server.cjs');
} catch (err) {
  const fs = require('fs');
  const path = require('path');
  const logPath = path.join(__dirname, 'startup_error.log');
  fs.writeFileSync(logPath, err.stack || err.toString());
  console.error("Startup failed:", err);
  process.exit(1);
}
