const fs = require("fs");
const log = require("../log");

module.exports = path =>
  new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        if (err.code === "ENOENT") {
          log.debug("file does not exits", { path });
          resolve(false);
        }
        return reject(err);
      }
      if (!stats.isFile()) return reject(new Error("not-a-file"));
      log.debug("file exists", { path });
      resolve(true);
    });
  });
