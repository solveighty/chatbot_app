const fs = require('fs');
const path = require('path');

// Crea el directorio de destino si no existe
function ensureDirectoryExistence(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
}

// Copia archivos JSON desde src a dist manteniendo la estructura de directorios
function copyJsonFiles(sourceDir, targetDir) {
    const items = fs.readdirSync(sourceDir);
    
    for (const item of items) {
        const sourcePath = path.join(sourceDir, item);
        const targetPath = path.join(targetDir, item);
        
        if (fs.statSync(sourcePath).isDirectory()) {
            ensureDirectoryExistence(targetPath);
            copyJsonFiles(sourcePath, targetPath);
        } else if (path.extname(item) === '.json') {
            ensureDirectoryExistence(path.dirname(targetPath));
            fs.copyFileSync(sourcePath, targetPath);
            console.log(`Copied: ${sourcePath} -> ${targetPath}`);
        }
    }
}

// Copiar archivos desde src/data a dist/data
const sourceDir = path.join(__dirname, '../src');
const targetDir = path.join(__dirname, '../dist');

ensureDirectoryExistence(targetDir);
copyJsonFiles(sourceDir, targetDir);

console.log('All JSON files copied successfully!');