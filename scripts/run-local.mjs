import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const backend = path.join(root, 'backend');
const apiOnly = process.argv.includes('--api-only');

function findPhp() {
  const candidates = [];
  if (process.env.PHP_EXECUTABLE) candidates.push(process.env.PHP_EXECUTABLE);

  if (process.platform === 'win32') {
    const where = spawnSync('where.exe', ['php'], { encoding: 'utf8' });
    if (where.status === 0) candidates.push(...where.stdout.split(/\r?\n/).filter(Boolean));

    const packages = path.join(process.env.LOCALAPPDATA ?? '', 'Microsoft', 'WinGet', 'Packages');
    if (existsSync(packages)) {
      const phpPackages = readdirSync(packages)
        .filter((name) => /^PHP\.PHP\.(?:8\.[2-9]|9\.)/.test(name))
        .sort()
        .reverse();
      for (const name of phpPackages) candidates.push(path.join(packages, name, 'php.exe'));
    }
  } else {
    candidates.push('php');
  }

  for (const candidate of [...new Set(candidates)]) {
    const result = spawnSync(candidate, ['-r', 'echo PHP_VERSION_ID;'], { encoding: 'utf8' });
    if (result.status === 0 && Number(result.stdout) >= 80200) return candidate;
  }

  throw new Error('PHP 8.2 or newer is required. Set PHP_EXECUTABLE to its php executable path.');
}

const php = findPhp();
const api = spawn(php, ['artisan', 'serve', '--host=127.0.0.1', '--port=8000'], {
  cwd: backend,
  stdio: 'inherit',
});
const children = [api];

if (!apiOnly) {
  const viteEntry = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
  if (!existsSync(viteEntry)) {
    api.kill();
    throw new Error('Vite is not installed. Run npm install before starting the development servers.');
  }
  children.push(spawn(process.execPath, [viteEntry, '--host', '127.0.0.1'], {
    cwd: path.join(root, 'frontend'),
    stdio: 'inherit',
  }));
}

let stopping = false;
function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill();
  }
  process.exitCode = exitCode;
}

for (const child of children) {
  child.on('error', (error) => {
    console.error(error);
    stop(1);
  });
  child.on('exit', (code) => {
    if (!stopping) stop(code ?? 1);
  });
}

process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
