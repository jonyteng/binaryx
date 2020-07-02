#!/usr/bin/env node

const exec = require('./exec');

const successColor = '\x1b[32m%s\x1b[0m';
const failColor = '\x1b[31m%s\x1b[0m';

(async () => {
  if (process.argv[process.argv.length - 1] === '-u') {
    try {
      await exec('update');
      console.log(successColor, '--- SUCCESS: update ---');
    } catch (e) {
      console.log(failColor, '--- FAIL: update ---');
    }
  } else {
    try {
      await exec('updateCheck');
      console.log(successColor, '--- SUCCESS: update-check ---');
    } catch (e) {
      console.log(failColor, '--- FAIL: update-check ---');
    }
  }
})();
