#!/usr/bin/env node

const meow = require('meow');
const path = require('path');
const tinypost = require('../');

const cliName = 'tinypost'
const cli = meow(`
  Usage
    ${cliName} glob ...

  Options
    --config config path 
    --out-dir destination directory

  Example
    ${cliName} posts/ --out-dir dist/
    ${cliName} posts/**/*.md --out-dir dist/
    ${cliName} posts/**/*.md wiki/**/*.md
`);

const input = cli.input || [];

if (input.length < 1) {
  process.exit(-1);
}

tinypost(input, cli.flags);