const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

code = code.replace(/footerPayments: footerPaymentsInput,/g, `footerPayments: footerPaymentsInput,
                      shippingInsideCost: shippingInsideCostInput,
                      shippingInsideText: shippingInsideTextInput,
                      shippingInsideDesc: shippingInsideDescInput,
                      shippingInsideShow: shippingInsideShowInput,
                      shippingOutsideCost: shippingOutsideCostInput,
                      shippingOutsideText: shippingOutsideTextInput,
                      shippingOutsideDesc: shippingOutsideDescInput,
                      shippingOutsideShow: shippingOutsideShowInput,
                      freeShippingEnabled: freeShippingEnabledInput,
                      freeShippingThreshold: freeShippingThresholdInput,`);

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
