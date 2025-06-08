import { spawn } from 'child_process';
import fs from 'fs';

// Kill any existing server process
try {
  const pidFile = '.server.pid';
  if (fs.existsSync(pidFile)) {
    const oldPid = fs.readFileSync(pidFile, 'utf8').trim();
    try {
      process.kill(oldPid, 'SIGTERM');
    } catch (e) {
      // Process already dead
    }
  }
} catch (e) {
  // Ignore errors
}

// Start new server
const server = spawn('npx', ['tsx', 'server/index.ts'], {
  detached: true,
  stdio: ['ignore', 'pipe', 'pipe']
});

// Write PID to file
fs.writeFileSync('.server.pid', server.pid.toString());

// Log output
server.stdout.on('data', (data) => {
  console.log(data.toString());
});

server.stderr.on('data', (data) => {
  console.error(data.toString());
});

// Detach from parent
server.unref();

console.log(`Server started with PID: ${server.pid}`);

// Keep script alive for a few seconds to capture initial output
setTimeout(() => {
  console.log('Server startup script complete');
  process.exit(0);
}, 10000);