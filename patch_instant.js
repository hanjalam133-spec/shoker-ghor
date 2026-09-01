const fs = require('fs');
let code = fs.readFileSync('src/components/InstantOrderLanding.tsx', 'utf-8');

// Fix the ID issue
code = code.replace(/return \(currentProduct\.packages && currentProduct\.packages\.length > 0\)\n\s*\? currentProduct\.packages\n\s*: fallbackPackages;/g, `const pkgs = (currentProduct.packages && currentProduct.packages.length > 0) ? currentProduct.packages : fallbackPackages; return pkgs.map((p, idx) => ({ ...p, id: p.id || \`legacy-pkg-\$\{idx\}\` }));`);

// Add thumbnail
code = code.replace(/<div className="flex items-center gap-3">/g, `<div className="flex items-center gap-3">
                            {(pkg.images && pkg.images.length > 0 && pkg.images.filter(Boolean).length > 0) ? (
                              <div className="w-12 h-12 rounded overflow-hidden border-2 border-gray-200 shrink-0 bg-white">
                                <img src={pkg.images.filter(Boolean)[0]} alt={pkg.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                               currentProduct.image ? (
                                <div className="w-10 h-10 rounded overflow-hidden border border-gray-200 shrink-0 bg-white">
                                  <img src={currentProduct.image} alt={pkg.name} className="w-full h-full object-cover opacity-80" />
                                </div>
                               ) : null
                            )}`);

fs.writeFileSync('src/components/InstantOrderLanding.tsx', code);
