const { spawn } = require('child_process');
const color = '\u001b[0m\u001b[7m\u001b[1m\u001b[32m SCRIPT \u001b[39m\u001b[22m\u001b[27m\u001b[0m %s';
const commands = {
  list: 'npm list --depth 0',
  install: 'npm install',
  cleanRoot: 'rimraf -rf node_modules package-lock.json',
  // lerna exec: run a command in each package. 
  cleanPackages: 'lerna exec -- rimraf -rf node_modules package-lock.json',
  bootstrap: 'lerna bootstrap --hoist --force-local',
  updateCheck: 'lerna exec -- ncu',
  update: 'lerna exec -- ncu -u',
};

function getSpawnArgs(command) {
  const fragments = command.split(' ');
  const commandName = fragments[0];

  fragments.splice(0, 1);
  const commandArgs = [...fragments];

  return [commandName, commandArgs];
}

function exec(name) {
  return new Promise((resolve, reject) => {
    const command = commands[name];
    const spawnArgs = getSpawnArgs(command);
  
    console.log(color, command);
    const subprocess = spawn(...spawnArgs, { stdio: 'inherit' });

    subprocess.on('exit', (code) => {
      if (code === 1) {
        reject(1);
      }

      resolve(code);
    });

    subprocess.on('error', (error) => {
      console.error(error);
      reject(error);
    });
  });
}

function execWithResult(name) {
  return new Promise((resolve, reject) => {
    const command = commands[name];
    const spawnArgs = getSpawnArgs(command);

    console.log(color, command);
    const subprocess = spawn(...spawnArgs, { stdio: 'pipe' });
  
    let chunks = [];
    let size = 0;
    subprocess.stdout.on('data', (chunk) => {
      chunks.push(chunk);
      size += chunk.length;
    });

    subprocess.stdout.on('end', () => {
      const dataBuffer = Buffer.concat(chunks, size);
      const data = dataBuffer.toString('utf8');
      resolve(data);
    });

    subprocess.on('exit', (code) => {
      if (code === 1) {
        reject(1);
      }

      resolve(code);
    });

    subprocess.on('error', (error) => {
      console.error(error);
      reject(error);
    });
  });
}

module.exports = {
  exec,
  execWithResult,
};
