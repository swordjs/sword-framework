import { spawn } from 'child_process';

spawn('pnpm', ['--filter', './packages/**', 'build'], {
  stdio: 'inherit'
}).on('close', (code) => {
  if (code !== 0) {
    console.error(`build failed`);
  } else {
    console.log(`build success`);
  }
});
