const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');

// Helper to remove directory recursively
function removeDirSync(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

// Helper to copy directory recursively with ignore list
function copyDirSync(src, dest, ignoreList = []) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });

  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    if (ignoreList.includes(entry.name)) continue;

    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, ignoreList);
    } else if (entry.isFile()) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('🚀 Starting VibeCoding Netlify Build Process...');

try {
  // 1. Clean dist directory
  console.log('🧹 Cleaning dist directory...');
  removeDirSync(DIST_DIR);
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // 2. Build Vite subproject (games)
  console.log('🎮 Building GameHub (games subproject)...');
  const gamesDir = path.join(ROOT_DIR, 'games');
  
  // Install dependencies in games if needed
  if (!fs.existsSync(path.join(gamesDir, 'node_modules'))) {
    console.log('📦 Installing dependencies in games...');
    execSync('npm install', { cwd: gamesDir, stdio: 'inherit' });
  }

  // Run build in games
  execSync('npm run build', { cwd: gamesDir, stdio: 'inherit' });

  // Copy built games/dist -> dist/games
  const gamesDist = path.join(gamesDir, 'dist');
  const targetGamesDist = path.join(DIST_DIR, 'games');
  copyDirSync(gamesDist, targetGamesDist);
  console.log('✅ GameHub built and copied to dist/games/');

  // 3. Copy static subprojects
  const staticProjects = [
    { name: 'lottery', dir: 'lottery' },
    { name: 'fishing_cv', dir: 'fishing_cv' },
    { name: 'date_invitation', dir: 'date_invitation' }
  ];

  const commonIgnores = ['node_modules', '.git', '.gitignore', 'package-lock.json', 'package.json'];

  for (const project of staticProjects) {
    const src = path.join(ROOT_DIR, project.dir);
    const dest = path.join(DIST_DIR, project.dir);
    console.log(`📁 Copying ${project.name} to dist/${project.dir}/...`);
    copyDirSync(src, dest, commonIgnores);
    console.log(`✅ ${project.name} copied successfully.`);
  }

  // 4. Copy Root index.html and assets
  const rootIndex = path.join(ROOT_DIR, 'index.html');
  if (fs.existsSync(rootIndex)) {
    fs.copyFileSync(rootIndex, path.join(DIST_DIR, 'index.html'));
    console.log('✅ Root index.html copied to dist/index.html');
  }

  // Copy _redirects if exists
  const redirectsFile = path.join(ROOT_DIR, '_redirects');
  if (fs.existsSync(redirectsFile)) {
    fs.copyFileSync(redirectsFile, path.join(DIST_DIR, '_redirects'));
    console.log('✅ _redirects copied to dist/_redirects');
  }

  // 5. Generate clean netlify.toml for dist (Drag & Drop friendly without build triggers)
  const distNetlifyToml = `[[redirects]]
  from = "/games/*"
  to = "/games/:splat"
  status = 200

[[redirects]]
  from = "/lottery/*"
  to = "/lottery/:splat"
  status = 200

[[redirects]]
  from = "/fishing_cv/*"
  to = "/fishing_cv/:splat"
  status = 200

[[redirects]]
  from = "/date_invitation/*"
  to = "/date_invitation/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
`;
  fs.writeFileSync(path.join(DIST_DIR, 'netlify.toml'), distNetlifyToml, 'utf8');
  console.log('✅ Clean netlify.toml generated in dist/ for Drag & Drop');

  console.log('\n🎉 Build completed successfully! All projects are ready in dist/ for Netlify deployment.');
} catch (error) {
  console.error('\n❌ Build failed with error:', error);
  process.exit(1);
}
