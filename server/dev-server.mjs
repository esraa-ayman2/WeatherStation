import { spawn } from 'node:child_process';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const spawnOptions = {
  stdio: 'inherit',
  shell: process.platform === 'win32',
};
const chat = spawn(npmCommand, ['run', 'chat-api'], spawnOptions);
const angular = spawn(npmCommand, ['exec', '--', 'ng', 'serve'], spawnOptions);

function stop() {
  chat.kill();
  angular.kill();
}

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
chat.on('exit', (code) => {
  if (code && code !== 130) angular.kill();
});
angular.on('exit', (code) => {
  if (code && code !== 130) chat.kill();
});
