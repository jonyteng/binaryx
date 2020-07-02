#! /usr/bin/env node

const { program } = require('commander');
const { debugEnabled } = require('@binaryx/debug');
const { version } = require('./package.json');

const log = debugEnabled('@binaryx/create-binaryx-app');

program
  .version(version)
  .parse(process.argv);

console.log(program);

function createApp() {
  
}

