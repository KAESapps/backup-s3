const S3 = require("aws-sdk/clients/s3");
const pRetry = require("p-retry");
const s3 = new S3();
const fs = require("fs");
const log = require("../log");

const upload = ({ bucket, key }) => {
  // process.stdout.write(`uploading ${key}\r`);
  return new Promise((resolve, reject) => {
    const managedUpload = s3.putObject(
      { Bucket: bucket, Key: key, Body: fs.createReadStream(key) },
      function(err, data) {
        if (err) {
          log.error("s3.putObject error", err);
          return reject(err);
        }
        // log.debug(`uploading ${key} done   `);
        resolve(data);
      }
    );
    // managedUpload.on("httpUploadProgress", function(evt) {
    //   const percent = parseInt((evt.loaded * 100) / evt.total);
    //   process.stdout.write(`uploading ${key} ${percent} %\r`);
    // });
  });
};

module.exports = arg =>
  pRetry(
    i => {
      if (i > 1) log.debug("retrying upload", { attempt: i, file: arg.key });
      return upload(arg);
    },
    { retries: 5 }
  );
