const fs = require('fs');
let code = fs.readFileSync('src/components/AdminDashboard.tsx', 'utf-8');

const compressFunc = `
// Image compression helper
const compressImage = (file: File, maxWidth: number = 1000): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};
`;

code = code.replace(/import React, \{ useState, useEffect \} from "react";/, "import React, { useState, useEffect } from 'react';\n" + compressFunc);

code = code.replace(/const reader = new FileReader\(\);\n\s*reader\.onloadend = \(\) => \{\n\s*setFormData\(prev => \(\{ ...prev, image: reader\.result as string \}\)\);\n\s*\};\n\s*reader\.readAsDataURL\(file\);/g, 
  "compressImage(file).then(res => setFormData(prev => ({ ...prev, image: res })));");

code = code.replace(/const reader = new FileReader\(\);\n\s*reader\.onloadend = \(\) => \{\n\s*setFormData\(prev => \(\{\n\s*\.\.\.prev,\n\s*gallery: \[\.\.\.\(prev\.gallery \|\| \[\]\), reader\.result as string\]\n\s*\}\)\);\n\s*\};\n\s*reader\.readAsDataURL\(file\);/g,
  "compressImage(file).then(res => setFormData(prev => ({ ...prev, gallery: [...(prev.gallery || []), res] })));");

code = code.replace(/const reader = new FileReader\(\);\n\s*reader\.onloadend = \(\) => \{\n\s*setLandingForm\(prev => \(\{\n\s*\.\.\.prev,\n\s*galleryImages: \[\.\.\.\(prev\.galleryImages \|\| \[\]\), reader\.result as string\]\n\s*\}\)\);\n\s*\};\n\s*reader\.readAsDataURL\(file\);/g,
  "compressImage(file).then(res => setLandingForm(prev => ({ ...prev, galleryImages: [...(prev.galleryImages || []), res] })));");

code = code.replace(/const reader = new FileReader\(\);\n\s*reader\.onloadend = \(\) => \{\n\s*const updated = \[\.\.\.formData\.packages\];\n\s*const currentImgs = \[\.\.\.\(updated\[idx\]\.images \|\| \['', '', ''\]\)\];\n\s*while\(currentImgs\.length < 3\) currentImgs\.push\(''\);\n\s*currentImgs\[imgIdx\] = reader\.result as string;\n\s*updated\[idx\] = \{ \.\.\.updated\[idx\], images: currentImgs \};\n\s*setFormData\(\{ \.\.\.formData, packages: updated \}\);\n\s*\};\n\s*reader\.readAsDataURL\(file\);/g,
  "compressImage(file).then(res => { const updated = [...formData.packages]; const currentImgs = [...(updated[idx].images || ['', '', ''])]; while(currentImgs.length < 3) currentImgs.push(''); currentImgs[imgIdx] = res; updated[idx] = { ...updated[idx], images: currentImgs }; setFormData({ ...formData, packages: updated }); });");

fs.writeFileSync('src/components/AdminDashboard.tsx', code);
