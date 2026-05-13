const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
    const sourceLogo = path.join(__dirname, 'public', 'logo.png');
    
    if (fs.existsSync(sourceLogo)) {
        console.log('Generating icons from public/logo.png...');
        
        // Tauri icons
        try {
            execSync('npx @tauri-apps/cli icon public/logo.png', { stdio: 'inherit' });
        } catch (e) {
            console.error('Failed to generate Tauri icons:', e.message);
        }

        // Capacitor icons (if platforms exist)
        try {
            execSync('npx @capacitor/assets generate --icon public/logo.png', { stdio: 'inherit' });
        } catch (e) {
            console.error('Failed to generate Capacitor icons (this is normal if platforms are not initialized):', e.message);
        }
    } else {
        console.log('public/logo.png not found, skipping icon generation.');
    }
}

main();
