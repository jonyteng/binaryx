#!/usr/bin/env node

// eslint-disable-next-line no-unused-vars
const fs = require('fs');
const { exec, execWithResult } = require('./exec');

const successColor = '\x1b[32m%s\x1b[0m';
const failColor = '\x1b[31m%s\x1b[0m';

const clean = async () => {
  try {
    await exec('cleanPackages'); // 注意顺序：该命令依赖 lerna/rimraf
    await exec('cleanRoot');
    console.log(successColor, '--- SUCCESS: clean ---');
  } catch (e) {
    console.log(failColor, '--- FAIL: clean ---');
  }
};

(async () => {
  const npmList = await execWithResult('list');

  if (npmList.includes('rimraf') && npmList.includes('lerna')) {
    await clean();
  } else {
    await exec('install');
    await clean();
  }
})();
