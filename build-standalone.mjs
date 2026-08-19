import { readFile, writeFile } from 'node:fs/promises';

const [html, css, v2, v3, critical, v4, source] = await Promise.all([
  readFile('index.html', 'utf8'),
  readFile('styles.css', 'utf8'),
  readFile('v2.css', 'utf8'),
  readFile('v3.css', 'utf8'),
  readFile('critical.css', 'utf8'),
  readFile('v4.css', 'utf8'),
  readFile('app.js', 'utf8')
]);

const script = source.replace(/\nexport \{ normalizeSong, seedFrom \};\s*$/, '');
const standalone = html
  .replace('  <link rel="stylesheet" href="styles.css">', `  <style>\n${css}\n${v2}\n${v3}\n${critical}\n${v4}\n  </style>`)
  .replace('  <link rel="stylesheet" href="v4.css">\n', '')
  .replace('  <script type="module" src="app.js"></script>', `  <script>\n${script}\n  </script>`);

await writeFile('index.html', standalone, 'utf8');
