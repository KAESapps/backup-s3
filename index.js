const { seq, ctxAssign, ite } = require("./lib/utils");
const exec = require("./lib/exec");
const path = require("path");
const fileExists = require("./lib/fileExists");
const pMap = require("p-map");
const s3Upload = require("./lib/s3Upload");
const fs = require("fs");
const pForever = require("p-forever");
const delay = require("delay");

const uploadChangedFiles = seq([
  //   ctxAssign("fullPath", ctx => path.resolve(process.cwd(), ctx.source)),
  ctxAssign("fullPath", ctx => ctx.source),
  //   ensure(pipe([ctx => fs.statSync(ctx.fullPath), stat => stat.isDirectory()])),
  ctxAssign("parentDir", ({ fullPath }) => path.dirname(fullPath)),
  ctxAssign("dirName", ({ fullPath }) => path.basename(fullPath)),
  ctxAssign("currentBackupPath", ({ parentDir, dirName }) =>
    path.join(parentDir, `current-backup-${dirName}`)
  ),
  ctxAssign("lastBackupPath", ({ parentDir, dirName }) =>
    path.join(parentDir, `last-backup-${dirName}`)
  ),
  exec(({ currentBackupPath }) => `touch ${currentBackupPath}`),
  ctxAssign(
    "modifiedFiles",
    ite(
      ctx => fileExists(ctx.lastBackupPath),
      exec(
        ({ fullPath, lastBackupPath }) =>
          `find ${fullPath} -type f -newer ${lastBackupPath}`
      ),
      exec(({ fullPath }) => `find ${fullPath} -type f`)
    )
  ),
  ctxAssign(
    "modifiedFiles",
    ({ modifiedFiles }) => (modifiedFiles ? modifiedFiles.split("\n") : [])
  ),
  ({ modifiedFiles, bucket }) =>
    console.log(`uploading ${modifiedFiles.length} to ${bucket}`),
  ({ modifiedFiles, bucket }) =>
    pMap(
      modifiedFiles,
      (key, i) => {
        return s3Upload({
          bucket,
          key,
          content: fs.createReadStream(key)
        }).then(() => console.log(`${i}/${modifiedFiles.length}`));
      },
      { concurrency: 100 }
    ),
  exec(
    ({ currentBackupPath, lastBackupPath }) =>
      `mv ${currentBackupPath} ${lastBackupPath}`
  )
]);

const defaultDelay = 1000 * 60 * 5;
module.exports = ctx =>
  pForever(() => {
    console.log(
      "start uploading changed files in ",
      ctx.source,
      "to",
      ctx.bucket
    );
    return uploadChangedFiles(ctx).then(() => {
      console.log(`done uploading files`);
      const delayInMs = ctx.delay || defaultDelay;
      console.log(`will try again in ${delayInMs} ms`);
      return delay(delayInMs);
    });
  });
