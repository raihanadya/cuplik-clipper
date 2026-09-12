const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const obfuscateFile = (inputPath, outputPath) => {
  const code = fs.readFileSync(inputPath, 'utf8');
  const result = JavaScriptObfuscator.obfuscate(code, {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    disableConsoleOutput: true,
    identifierNamesGenerator: 'hexadecimal',
    selfDefending: true,
    simplify: true,
    splitStrings: true,
    splitStringsChunkLength: 10,
    stringArray: true,
    stringArrayCallsTransform: true,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'function',
    stringArrayThreshold: 0.75,
    transformObjectKeys: true,
    unicodeEscapeSequence: false,
  });
  
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, result.getObfuscatedCode());
};

// Obfuscate semua file di src/
const srcDir = './src';
const distDir = './dist';

const processDir = (src, dist) => {
  if (!fs.existsSync(dist)) {
    fs.mkdirSync(dist, { recursive: true });
  }
  
  const items = fs.readdirSync(src);
  items.forEach(item => {
    const srcPath = path.join(src, item);
    const distPath = path.join(dist, item);
    const stat = fs.statSync(srcPath);
    
    if (stat.isDirectory()) {
      processDir(srcPath, distPath);
    } else if (item.endsWith('.js')) {
      obfuscateFile(srcPath, distPath);
      console.log(`✓ ${srcPath} → ${distPath}`);
    }
  });
};

console.log('Obfuscating source code...\n');
processDir(srcDir, distDir);
console.log('\n✓ Build selesai! Output di folder dist/');
