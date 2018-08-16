exports.pipe = require("p-pipe");
exports.seq = tasks =>
  exports.pipe(
    tasks.map(task => ctx => Promise.resolve(task(ctx)).then(() => ctx))
  );

exports.ctxAssign = (variable, fn) => ctx => {
  if (!fn) return { [variable]: ctx };
  if (!ctx) ctx = {};
  if (typeof fn === "function") {
    return Promise.resolve(fn(ctx)).then(res => {
      if (variable) {
        ctx[variable] = res;
      }
      return ctx;
    });
  } else {
    ctx[variable] = fn;
    return Promise.resolve(ctx);
  }
};

const invokeOrReturn = (arg, ctx, defaut) => {
  if (!arg) return defaut;
  return typeof arg === "function" ? arg(ctx) : arg;
};
exports.ite = (cond, truthy, falsy) => ctx =>
  Promise.resolve(cond(ctx)).then(
    res =>
      res
        ? invokeOrReturn(truthy, ctx, true)
        : invokeOrReturn(falsy, ctx, false)
  );
