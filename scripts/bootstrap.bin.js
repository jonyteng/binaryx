#!/usr/bin/env node

const { chmodSync } = require('fs');
const { execFileSync } = require('child_process');
const { exec } = require('./exec');

const successColor = '\x1b[32m%s\x1b[0m';
const failColor = '\x1b[31m%s\x1b[0m';

const cleanScriptFile = `${process.cwd()}/scripts/clean.bin.js`;
try {
  execFileSync(cleanScriptFile);
} catch (e) {
  chmodSync(cleanScriptFile, 0o777);
  execFileSync(cleanScriptFile);
}

const bootstrap = async () => {
  try {
    await exec('install');
    await exec('bootstrap');
    console.log(successColor, '--- SUCCESS: bootstrap ---');
  } catch (e) {
    console.log(failColor, '--- FAIL: bootstrap ---');
  }
}

bootstrap();
