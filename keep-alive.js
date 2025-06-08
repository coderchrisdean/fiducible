import { exec } from 'child_process';

function startServer() {
  const server = exec('npx tsx server/index.ts', (error, stdout, stderr) => {
    if (error) {
      console.error(`Server error: ${error}`);
      setTimeout(startServer, 5000);
      return;
    }
    console.log(`Server output: ${stdout}`);
    if (stderr) console.error(`Server stderr: ${stderr}`);
  });

  server.stdout.on('data', (data) => {
    console.log(data.toString());
  });

  server.stderr.on('data', (data) => {
    console.error(data.toString());
  });

  server.on('exit', (code) => {
    console.log(`Server exited with code ${code}`);
    if (code !== 0) {
      console.log('Restarting server in 5 seconds...');
      setTimeout(startServer, 5000);
    }
  });

  return server;
}

console.log('Starting persistent server...');
startServer();

// Keep the process alive
setInterval(() => {
  console.log('Keep-alive ping');
}, 30000);