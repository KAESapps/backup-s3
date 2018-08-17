const S3 = require("aws-sdk/clients/s3");
const pRetry = require("p-retry");
const s3 = new S3();
const fs = require("fs");

const upload = ({ bucket, key }) => {
  process.stdout.write(`uploading ${key}\r`);
  return new Promise((resolve, reject) => {
    // const managedUpload = s3.upload(
    const managedUpload = s3.putObject(
      { Bucket: bucket, Key: key, Body: fs.createReadStream(key) },
      // { partSize: 5 * 1024 * 1024, queueSize: 4 },
      function(err, data) {
        if (err) {
          console.error(err);
          return reject(err);
        }
        console.log("done uploading", key);
        resolve(data);
      }
    );
    managedUpload.on("httpUploadProgress", function(evt) {
      const percent = parseInt((evt.loaded * 100) / evt.total);
      process.stdout.write(`uploading ${key} ${percent} %\r`);
    });
  });
};
// module.exports = upload;
module.exports = arg =>
  pRetry(
    i => {
      if (i > 1) console.log("retrying", i, arg.key);
      return upload(arg);
    },
    { retries: 5 }
  );
