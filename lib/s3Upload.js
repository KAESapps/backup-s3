const S3 = require("aws-sdk/clients/s3");
const pRetry = require("p-retry");

const upload = ({ bucket, key, content }) => {
  const s3 = new S3();
  // console.log("uploading file to s3", { bucket, key, content });
  return new Promise((resolve, reject) =>
    s3.putObject(
      // s3.upload(
      { Bucket: bucket, Key: key, Body: content },
      // { partSize: 5 * 1024 * 1024, queueSize: 4 },
      function(err, data) {
        if (err) {
          console.error(err);
          return reject(err);
        }
        console.log("done uploading", { bucket, key });
        resolve(data);
      }
    )
  );
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
