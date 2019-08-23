const execa = require("execa");
module.exports = arg => ctx => {
  let args = typeof arg === "function" ? arg(ctx) : arg;
  let cmd;
  if (Array.isArray(args)) {
    cmd = args.shift();
  } else {
    cmd = args;
    args = [];
  }
  // console.debug("executing", cmd);
  //   console.debug("cwd", process.cwd());
  return execa(cmd, args).then(res => {
    // console.debug(res);
    return res.stdout;
  });
};
