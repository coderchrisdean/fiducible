import { spawn } from 'child_process';
import { writeFileSync } from 'fs';

function startServer() {
  console.log('Starting Fiducible server...');
  
  const server = spawn('npx', ['tsx', 'server/index.ts'], {
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: ['ignore', 'pipe', 'pipe'],
    detached: false
  });

  writeFileSync('app.pid', server.pid.toString());

  server.stdout.on('data', (data) => {
    process.stdout.write(data);
  });

  server.stderr.on('data', (data) => {
    process.stderr.write(data);
  });

  server.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    if (code !== 0) {
      console.log('Restarting server in 3 seconds...');
      setTimeout(startServer, 3000);
    }
  });

  server.on('error', (err) => {
    console.error('Server spawn error:', err);
    setTimeout(startServer, 3000);
  });

  return server;
}

// Handle process termination
process.on('SIGTERM', () => {
  console.log('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

// Start the server
const serverProcess = startServer();

// Keep the process alive
setInterval(() => {
  console.log('Keep-alive ping - Server running');
}, 60000);