const fs = require('fs');
let code = fs.readFileSync('src/context/ShopContext.tsx', 'utf-8');

// Remove localStorage setting
code = code.replace(
  /\n  useEffect\(\(\) => \{\n    localStorage.setItem\('Shoker ghor_orders', JSON.stringify\(orders\)\);\n  \}, \[orders\]\);/,
  ``
);

// Remove handleStorage
code = code.replace(
  /\n  useEffect\(\(\) => \{\n    const handleStorage = \(e: StorageEvent\) => \{\n      if \(e\.key === 'Shoker ghor_orders' && e\.newValue\) \{\n        try \{\n          const parsed = JSON\.parse\(e\.newValue\);\n          if \(Array\.isArray\(parsed\)\) \{\n            if \(parsed\.length > orders\.length\) \{\n              playOrderSuccessSound\(\);\n            \}\n            setOrders\(parsed\);\n          \}\n        \} catch \(err\) \{\n          console\.error\("Error syncing orders from storage:", err\);\n        \}\n      \}\n    \};\n    window\.addEventListener\('storage', handleStorage\);\n    return \(\) => window\.removeEventListener\('storage', handleStorage\);\n  \}, \[orders\.length\]\);/,
  ``
);

fs.writeFileSync('src/context/ShopContext.tsx', code);
