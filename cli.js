#!/usr/bin/env node
var argv = require("minimist")(process.argv.slice(2));
const { once, continuous } = require("./index");
process.env.INFO = "backup-s3"; // force log level INFO

(argv.continuous ? continuous : once)(argv)
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
