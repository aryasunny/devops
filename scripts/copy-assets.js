const fs = require('fs');
const path = require('path');

function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function copyDirectory(src, dest) {
  ensureDirectoryExists(dest);
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

try {
  // Ensure dist directory exists
  ensureDirectoryExists('dist');
  
  // Copy code directory
  if (fs.existsSync('code')) {
    copyDirectory('code', path.join('dist', 'code'));
    console.log('✓ Copied code directory');
  }
  
  // Copy images directory
  if (fs.existsSync('images')) {
    copyDirectory('images', path.join('dist', 'images'));
    console.log('✓ Copied images directory');
  }
  
  console.log('🎉 Assets copied successfully!');
} catch (error) {
  console.error('❌ Error copying assets:', error.message);
  process.exit(1);
}