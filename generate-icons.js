const fs = require('fs');
const buffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuPnAAAAAElFTkSuQmCC', 'base64');
fs.writeFileSync('src-tauri/icons/32x32.png', buffer);
fs.writeFileSync('src-tauri/icons/128x128.png', buffer);
fs.writeFileSync('src-tauri/icons/128x128@2x.png', buffer);
fs.writeFileSync('src-tauri/icons/icon.png', buffer);
