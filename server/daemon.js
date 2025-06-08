import { exec } from 'child_process';
import { writeFileSync, existsSync } from 'fs';

function startServer() {
  console.log('Starting Fiducible daemon...');
  
  const server = exec('npx tsx server/index.ts', {
    env: { ...process.env, NODE_ENV: 'development', PORT: '5000' },
    cwd: process.cwd()
  });

  server.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  server.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  server.on('close', (code) => {
    console.log(`Server closed with code ${code}`);
    if (code !== 0) {
      console.log('Restarting in 2 seconds...');
      setTimeout(startServer, 2000);
    }
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
    setTimeout(startServer, 2000);
  });

  // Keep process alive
  process.stdin.resume();
}

startServer();