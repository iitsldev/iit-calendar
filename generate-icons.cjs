const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function main() {
    const sourceLogo = path.join(__dirname, 'public', 'logo.png');
    const hasAndroid = fs.existsSync(path.join(__dirname, 'android'));
    const hasIos = fs.existsSync(path.join(__dirname, 'ios'));
    
    // 1. Tauri Icons
    if (fs.existsSync(sourceLogo)) {
        console.log('Generating Tauri icons...');
        try {
            execSync('npx tauri icon public/logo.png', { stdio: 'inherit' });
        } catch (e) {
            console.warn('Warning: Failed to generate Tauri icons:', e.message);
        }
    }

    // 2. Capacitor Assets (Icons/Splash)
    if (hasAndroid || hasIos) {
        console.log('Generating Capacitor assets...');
        try {
            // Newer capacitor-assets might not use --icon. 
            // We try the standard generate command which looks for assets/icon.png
            execSync('npx @capacitor/assets generate', { stdio: 'inherit' });
        } catch (e) {
            console.warn('Warning: Capacitor asset generation failed. Continuing to sound sync...');
        }
    }

    // 3. Sound Synchronization (CRITICAL)
    console.log('Synchronizing sound assets...');
    
    const soundsSrcDir = path.join(__dirname, 'public', 'sounds');
    const bellSrc = path.join(__dirname, 'public', 'bell.wav');

    // Android Sync
    if (hasAndroid) {
        const androidResRaw = path.join(__dirname, 'android', 'app', 'src', 'main', 'res', 'raw');
        if (!fs.existsSync(androidResRaw)) {
            fs.mkdirSync(androidResRaw, { recursive: true });
        }

        if (fs.existsSync(bellSrc)) {
            fs.copyFileSync(bellSrc, path.join(androidResRaw, 'bell.wav'));
            console.log('Copied bell.wav to Android.');
        }

        if (fs.existsSync(soundsSrcDir)) {
            const soundFiles = fs.readdirSync(soundsSrcDir);
            soundFiles.forEach(file => {
                if (file.endsWith('.wav')) {
                    fs.copyFileSync(path.join(soundsSrcDir, file), path.join(androidResRaw, file));
                    console.log(`Copied ${file} to Android.`);
                }
            });
        }
    }

    // iOS Sync
    if (hasIos) {
        const iosDestDir = path.join(__dirname, 'ios', 'App', 'App');
        
        if (fs.existsSync(bellSrc)) {
            fs.copyFileSync(bellSrc, path.join(iosDestDir, 'bell.wav'));
            console.log('Copied bell.wav to iOS.');
        }

        if (fs.existsSync(soundsSrcDir)) {
            const soundFiles = fs.readdirSync(soundsSrcDir);
            soundFiles.forEach(file => {
                if (file.endsWith('.wav')) {
                    fs.copyFileSync(path.join(soundsSrcDir, file), path.join(iosDestDir, file));
                    console.log(`Copied ${file} to iOS.`);
                }
            });
        }
    }

    console.log('Asset synchronization complete.');
}

main();
