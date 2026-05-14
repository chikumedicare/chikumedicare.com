const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const imgDir = path.join(rootDir, 'images');

function getHtmlFiles(baseDir) {
  let results = [];
  const list = fs.readdirSync(baseDir);

  list.forEach(file => {
    const fullPath = path.join(baseDir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
        results = results.concat(getHtmlFiles(fullPath));
      }
    } else if (fullPath.toLowerCase().endsWith('.html')) {
      results.push(fullPath);
    }
  });

  return results;
}

function updateHtmlReferences(content) {
  return content
    .replace(/((?:src|href|data-src|poster)=["'])([^"']+?)\.png([^"']*)(["'])/gi,
      (match, prefix, filePath, suffix, quote) => `${prefix}${filePath}.webp${suffix}${quote}`)
    .replace(/(url\(["']?)([^"')]+?)\.png([^"')]*?)(["']?\))/gi,
      (match, prefix, filePath, suffix, quote) => `${prefix}${filePath}.webp${suffix}${quote}`);
}

async function optimizeImages() {
  const files = fs.readdirSync(imgDir);

  for (const file of files) {
    if (!file.toLowerCase().endsWith('.png')) {
      continue;
    }

    const inputPath = path.join(imgDir, file);
    const outputName = file.replace(/\.png$/i, '.webp');
    const outputPath = path.join(imgDir, outputName);

    console.log(`Optimizing ${file}...`);
    await sharp(inputPath)
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);

    console.log(`Saved ${outputName}`);
    fs.unlinkSync(inputPath);
  }
}

async function updateHtmlFiles() {
  console.log('Updating HTML files...');
  const htmlFiles = getHtmlFiles(rootDir);

  for (const file of htmlFiles) {
    let content = fs.readFileSync(file, 'utf8');
    const updated = updateHtmlReferences(content);

    if (updated !== content) {
      fs.writeFileSync(file, updated, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
}

async function optimize() {
  await optimizeImages();
  await updateHtmlFiles();
}

optimize().catch(error => {
  console.error('Optimization failed:', error);
  process.exitCode = 1;
});
