const fs = require('fs');
const path = require('path');

// Crea el directorio de destino si no existe
function ensureDirectoryExistence(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Copia archivos JSON e imágenes desde assets a dist/data
function copyAssets(sourceDir, targetDir) {
    const items = fs.readdirSync(sourceDir);
    
    for (const item of items) {
        const sourcePath = path.join(sourceDir, item);
        const targetPath = path.join(targetDir, item);
        
        if (fs.statSync(sourcePath).isDirectory()) {
            ensureDirectoryExistence(targetPath);
            copyAssets(sourcePath, targetPath);
        } else if (path.extname(item) === '.json' || path.extname(item) === '.jpg' || path.extname(item) === '.png' || path.extname(item) === '.jpeg') {
            ensureDirectoryExistence(path.dirname(targetPath));
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`Copied: ${sourcePath} -> ${targetPath}`);
        }
    }
}

// Copia archivos JavaScript adicionales
function copyAdditionalFiles() {
    // Copiar el archivo HTML de reportes
    const htmlSource = path.join(__dirname, '../reportes_ventas.html');
    const htmlTarget = path.join(__dirname, '../dist/reportes_ventas.html');
    
    if (fs.existsSync(htmlSource)) {
        fs.copyFileSync(htmlSource, htmlTarget);
        console.log(`Copied: ${htmlSource} -> ${htmlTarget}`);
    }
}

// Copiar archivos desde assets a dist/data
const sourceDir = path.join(__dirname, '../assets');
const targetDir = path.join(__dirname, '../dist/data');

ensureDirectoryExistence(targetDir);
copyAssets(sourceDir, targetDir);

// Copiar archivos adicionales
copyAdditionalFiles();

console.log('All assets copied successfully!');