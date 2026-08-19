import { readFile, writeFile } from 'node:fs/promises';
const html = await readFile('index.html', 'utf8');
const source = html
  .replace(/  <style>[\s\S]*?<\/style>/, '  <link rel="stylesheet" href="styles.css">\n  <link rel="stylesheet" href="v4.css">')
  .replace(/  <script>[\s\S]*?<\/script>\s*<\/body>/, '  <script type="module" src="app.js"></script>\n</body>');
await writeFile('index.html', source, 'utf8');
