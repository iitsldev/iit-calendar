const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
    const sourceLogo = path.join(__dirname, 'public', 'logo.png');
    
    if (fs.existsSync(sourceLogo)) {
        console.log('Generating icons from public/logo.png...');
        
        // Tauri icons
        try {
            // Run tauri icon command.
            // We specify the config-dir to ensure it finds tauri.conf.json correctly.
            execSync('npx tauri icon public/logo.png --config-dir src-tauri', { stdio: 'inherit' });
            console.log('Tauri icons generated successfully.');
        } catch (e) {
            console.error('CRITICAL: Failed to generate Tauri icons:', e.message);
            process.exit(1); // Exit with error so the CI/CD fails here instead of later
        }

        // Capacitor icons (if platforms exist)
        try {
            const hasAndroid = fs.existsSync(path.join(__dirname, 'android'));
            const hasIos = fs.existsSync(path.join(__dirname, 'ios'));
            
            if (hasAndroid || hasIos) {
                let cmd = 'npx @capacitor/assets generate --icon public/logo.png';
                if (hasAndroid) cmd += ' --android';
                if (hasIos) cmd += ' --ios';
                
                console.log(`Running: ${cmd}`);
                execSync(cmd, { stdio: 'inherit' });
                console.log('Capacitor assets generated successfully.');

                // Copy bell.wav to Android res/raw if it exists
                if (hasAndroid) {
                    const soundSrc = path.join(__dirname, 'public', 'bell.wav');
                    const soundDestDir = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', 'raw');
                    
                    if (fs.existsSync(soundSrc)) {
                        if (!fs.existsSync(soundDestDir)) {
                            fs.mkdirSync(soundDestDir, { recursive: true });
                        }
                        fs.copyFileSync(soundSrc, path.join(soundDestDir, 'bell.wav'));
                        console.log('Copied bell.wav to Android res/raw for notifications.');
                    } else {
                        console.log('Note: public/bell.wav not found. Native notifications will use default sound.');
                    }
                }
            } else {
                console.log('Capacitor platforms not found, skipping asset generation.');
            }
        } catch (e) {
            console.warn('Warning: Failed to generate Capacitor icons:', e.message);
            // We don't exit(1) for Capacitor yet as it might be okay if platforms aren't fully staged.
        }
    } else {
        console.error('CRITICAL: public/logo.png not found. Cannot generate icons.');
        process.exit(1);
    }
}

main();
