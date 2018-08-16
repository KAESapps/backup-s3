const execa = require("execa");
module.exports = arg => ctx => {
  const cmd = typeof arg === "function" ? arg(ctx) : arg;
  console.log("executing", cmd);
  //   console.log("cwd", process.cwd());
  return execa(cmd).then(res => {
    // console.log(res);
    return res.stdout;
  });
};
