#!/usr/bin/env node
var argv = require("minimist")(process.argv.slice(2));
const { once, continuous } = require("./index");

(argv.continous ? once : continuous)(argv).catch(err => {
  console.error(err);
  process.exit(1);
});
