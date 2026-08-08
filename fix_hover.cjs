const fs = require('fs');
let content = fs.readFileSync('src/components/ProjectModal.tsx', 'utf-8');

// Replace wrapper classes
content = content.replace(
  /hover:scale-105 hover:-translate-y-2 hover:shadow-\[0_20px_40px_-15px_rgba\(45,212,191,0\.4\)\]/g,
  'hover:scale-[1.02] hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(45,212,191,0.3)]'
);

// We can also make the image inner zoom a bit more subtle, like 1.01 or remove it entirely
content = content.replace(
  /group-hover:scale-\[1\.02\]/g,
  'group-hover:scale-[1.01]'
);

fs.writeFileSync('src/components/ProjectModal.tsx', content);
