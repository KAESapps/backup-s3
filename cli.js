#!/usr/bin/env node
var argv = require("minimist")(process.argv.slice(2));
const continuousFilesBackup = require("./index");

continuousFilesBackup(argv).catch(err => {
  console.error(err);
  process.exit(1);
});
