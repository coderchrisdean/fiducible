import { spawn } from 'child_process';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function startServer() {
  const server = spawn('npx', ['tsx', 'server/index.ts'], {
    cwd: join(__dirname, '..'),
    stdio: 'inherit',
    detached: false
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
    setTimeout(startServer, 2000); // Restart after 2 seconds
  });

  server.on('exit', (code, signal) => {
    console.log(`Server exited with code ${code} and signal ${signal}`);
    if (code !== 0) {
      setTimeout(startServer, 2000); // Restart if crashed
    }
  });

  console.log(`Server started with PID: ${server.pid}`);
  return server;
}

// Start the server
startServer();