const S3 = require("aws-sdk/clients/s3");
const s3 = new S3();
module.exports = ({ bucket, key, content }) => {
  //   console.log("uploading file to s3", { bucket, key, content });
  return new Promise((resolve, reject) =>
    s3.upload({ Bucket: bucket, Key: key, Body: content }, function(err, data) {
      if (err) return reject(err);
      console.log("done uploading", { bucket, key });
      resolve(data);
    })
  );
};
