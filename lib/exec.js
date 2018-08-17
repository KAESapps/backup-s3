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
  console.log("executing", cmd);
  //   console.log("cwd", process.cwd());
  return execa(cmd, args).then(res => {
    // console.log(res);
    return res.stdout;
  });
};
