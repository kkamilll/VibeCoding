const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg'
};

const server = http.createServer((req, res) => {
  let reqUrl = decodeURIComponent(req.url.split('?')[0]);
  if (reqUrl === '/') reqUrl = '/index.html';

  let filePath = path.join(ROOT_DIR, reqUrl);

  // If path is a directory, look for index.html
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    if (!reqUrl.endsWith('/')) {
      res.writeHead(301, { Location: reqUrl + '/' });
      return res.end();
    }
    filePath = path.join(filePath, 'index.html');
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=UTF-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>404 - Page Not Found | VibeCoding</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #090a16; color: #fff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center; }
            h1 { font-size: 3rem; color: #a78bfa; margin-bottom: 1rem; }
            a { color: #38bdf8; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div>
            <h1>404 - Page Not Found</h1>
            <p>The requested URL <code>${reqUrl}</code> was not found on VibeCoding dev server.</p>
            <p><a href="/">← Back to VibeCoding Hub</a></p>
          </div>
        </body>
        </html>
      `);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`
==================================================
🚀 VibeCoding Dev Server Running!
--------------------------------------------------
🌐 Local URL:   ${url}
🎮 GameHub:     ${url}/games/
🎡 Lottery Hub: ${url}/lottery/
🎣 Catch My CV: ${url}/fishing_cv/
💖 Date Invite: ${url}/date_invitation/
==================================================
Press Ctrl+C to stop the server.
  `);

  // Open browser automatically
  const startCmd = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${startCmd} ${url}`);
});
