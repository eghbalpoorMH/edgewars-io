const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'index.html');
const dashPath = path.join(__dirname, 'dashboard.html');
const workerPath = path.join(__dirname, 'worker.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const dash = fs.readFileSync(dashPath, 'utf8');
let worker = fs.readFileSync(workerPath, 'utf8');

function escapeTemplate(str) {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');
}

function replaceBlock(src, markerStart, markerEnd, replacement) {
  const s = src.indexOf(markerStart);
  const e = src.indexOf(markerEnd, s + markerStart.length);
  if (s === -1 || e === -1) {
    console.error('Could not find markers:', markerStart, markerEnd);
    process.exit(1);
  }
  return src.slice(0, s + markerStart.length) + replacement + src.slice(e);
}

worker = replaceBlock(worker, 'const HTML_CONTENT = `', '`;\n\nconst GRID_SIZE', escapeTemplate(html));
worker = replaceBlock(worker, 'const DASHBOARD_HTML_CONTENT = `', '`;\n\nasync function handleRequest', escapeTemplate(dash));

fs.writeFileSync(workerPath, worker, 'utf8');
console.log(`Bundled index.html (${html.length} bytes) & dashboard.html (${dash.length} bytes) into worker.js successfully.`);
