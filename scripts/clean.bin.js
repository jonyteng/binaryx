#!/usr/bin/env node

const fs = require('fs');
const { exec, execWithResult } = require('./exec');

const successColor = '\x1b[32m%s\x1b[0m';
const failColor = '\x1b[31m%s\x1b[0m';

const clean = async () => {
  try {
    await exec('cleanRoot');
    await exec('cleanPackages');
    console.log(successColor, '--- SUCCESS: clean ---');
  } catch (e) {
    console.log(failColor, '--- FAIL: clean ---');
  }
}

(async () => {
  const npmList = await execWithResult('list');

  if (npmList.includes('rimraf') && npmList.includes('lerna')) {
    await clean();
  } else {
    await exec('install');
    await clean();
  }
})();