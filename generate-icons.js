// Icon generation script for Capacitor apps
// This script creates the required icon sizes for iOS and Android
// Run with: node generate-icons.js

import { promises as fs } from 'fs';
import path from 'path';

const sourceIcon = './assets/Logo/app_icon.jpg';

// iOS icon sizes
const iosIcons = [
  { size: 20, name: 'icon-20.png' },
  { size: 29, name: 'icon-29.png' },
  { size: 40, name: 'icon-40.png' },
  { size: 58, name: 'icon-58.png' },
  { size: 60, name: 'icon-60.png' },
  { size: 76, name: 'icon-76.png' },
  { size: 80, name: 'icon-80.png' },
  { size: 87, name: 'icon-87.png' },
  { size: 120, name: 'icon-120.png' },
  { size: 152, name: 'icon-152.png' },
  { size: 167, name: 'icon-167.png' },
  { size: 180, name: 'icon-180.png' },
  { size: 1024, name: 'icon-1024.png' }
];

// Android icon sizes
const androidIcons = [
  { size: 48, density: 'mdpi', name: 'ic_launcher.png' },
  { size: 72, density: 'hdpi', name: 'ic_launcher.png' },
  { size: 96, density: 'xhdpi', name: 'ic_launcher.png' },
  { size: 144, density: 'xxhdpi', name: 'ic_launcher.png' },
  { size: 192, density: 'xxxhdpi', name: 'ic_launcher.png' }
];

console.log('📱 Icon Generation Instructions:');
console.log('================================');
console.log('');
console.log('Since we cannot automatically resize images in this environment,');
console.log('please manually create the following icon sizes:');
console.log('');
console.log('🍎 iOS Icons (from assets/Logo/app_icon.jpg):');
iosIcons.forEach(icon => {
  console.log(`   ${icon.size}x${icon.size}px → ios/App/App/Assets.xcassets/AppIcon.appiconset/${icon.name}`);
});

console.log('');
console.log('🤖 Android Icons (from assets/Logo/app_icon.jpg):');
androidIcons.forEach(icon => {
  console.log(`   ${icon.size}x${icon.size}px → android/app/src/main/res/mipmap-${icon.density}/${icon.name}`);
});

console.log('');
console.log('🛠️  Tools you can use:');
console.log('   • Online: https://appicon.co/ (upload your icon, download all sizes)');
console.log('   • Photoshop/GIMP: Resize manually');
console.log('   • Command line: ImageMagick (if installed)');
console.log('');
console.log('📦 For now, copying the original icon to required locations...');

// Copy the original icon to key locations for basic functionality
async function copyOriginalIcon() {
  try {
    const sourceExists = await fs.access(sourceIcon).then(() => true).catch(() => false);
    if (!sourceExists) {
      console.log('❌ Source icon not found at:', sourceIcon);
      return;
    }

    // Copy to public for web
    await fs.copyFile(sourceIcon, './public/icon-192.png');
    await fs.copyFile(sourceIcon, './public/icon-512.png');
    
    console.log('✅ Copied original icon to public directory');
    console.log('');
    console.log('⚠️  Note: For production, please generate proper icon sizes!');
    
  } catch (error) {
    console.error('Error copying icon:', error.message);
  }
}

copyOriginalIcon();