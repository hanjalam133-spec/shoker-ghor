const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(/<button\s*onClick=\{\(\) => handleOpenModal\(product\)\}\s*className="p-1.5 text-\[#6d7175\] hover:bg-\[#e1e3e5\] rounded transition-colors"\s*title="Edit"\s*>\s*<Edit2 className="w-4 h-4" \/>\s*<\/button>/, 
`<button onClick={() => {
                                  const domain = window.location.origin && !window.location.origin.includes('localhost') ? window.location.origin : 'https://elhambd.shop';
                                  const prodUrl = \`\${domain}/product/\${product.id}\`;
                                  navigator.clipboard.writeText(prodUrl);
                                  setSuccessModal({
                                    isOpen: true,
                                    title: "লিংক কপি হয়েছে",
                                    description: "প্রোডাক্টের সরাসরি লিংক ক্লিপবোর্ডে কপি করা হয়েছে!"
                                  });
                                }} className="p-1.5 text-[#6d7175] hover:bg-blue-100 hover:text-blue-600 rounded transition-colors" title="Copy Product Link">
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleOpenModal(product)} className="p-1.5 text-[#6d7175] hover:bg-[#e1e3e5] rounded transition-colors" title="Edit">
                                <Edit2 className="w-4 h-4" />
                              </button>`);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
