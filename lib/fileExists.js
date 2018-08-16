const fs = require("fs");
module.exports = path =>
  new Promise((resolve, reject) => {
    fs.stat(path, (err, stats) => {
      if (err) {
        // console.log("file does not exits", err);
        if (err.code === "ENOENT") {
          console.log("file does not exits", path);
          resolve(false);
        }
        return reject(err);
      }
      if (!stats.isFile()) return reject(new Error("not-a-file"));
      console.log("file exists", path);
      resolve(true);
    });
  });
