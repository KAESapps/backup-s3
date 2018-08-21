const { seq, ctxAssign, ite } = require("./lib/utils");
const exec = require("./lib/exec");
const path = require("path");
const fileExists = require("./lib/fileExists");
const pMap = require("p-map");
const s3Upload = require("./lib/s3Upload");
const pForever = require("p-forever");
const delay = require("delay");
const defaultDelay = 1000 * 60 * 5;

const uploadChangedFiles = seq([
  exec(({ currentBackupPath }) => ["touch", currentBackupPath]),
  ctxAssign(
    "modifiedFiles",
    ite(
      ctx => fileExists(ctx.lastBackupPath),
      exec(({ lastBackupPath }) => [
        "find",
        "-type",
        "f",
        "-cnewer",
        lastBackupPath
      ]),
      exec(() => ["find", "-type", "f"])
    )
  ),
  ctxAssign(
    "modifiedFiles",
    ({ modifiedFiles }) =>
      modifiedFiles ? modifiedFiles.split("\n").map(path => path.slice(2)) : []
  ),
  // ({ modifiedFiles, bucket }) => console.log(modifiedFiles),
  ({ modifiedFiles, bucket }) =>
    console.log(`uploading ${modifiedFiles.length} files to ${bucket}`),
  ({ modifiedFiles, bucket }) => {
    let count = modifiedFiles.length;
    return pMap(
      modifiedFiles,
      key =>
        s3Upload({
          bucket,
          key
        }).then(() => console.log(`restant ${--count}`)),
      { concurrency: 1 }
    );
  },
  exec(({ currentBackupPath, lastBackupPath }) => [
    "mv",
    currentBackupPath,
    lastBackupPath
  ])
]);

const uploadChangedFilesForever = ctx =>
  pForever(() => {
    console.log(
      "start uploading changed files in ",
      ctx.fullPath,
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

module.exports = seq([
  ctxAssign("fullPath", process.cwd()),
  //   ensure(pipe([ctx => fs.statSync(ctx.fullPath), stat => stat.isDirectory()])),
  ctxAssign("parentDir", ({ fullPath }) => path.dirname(fullPath)),
  ctxAssign("dirName", ({ fullPath }) => path.basename(fullPath)),
  ctxAssign("currentBackupPath", ({ parentDir, dirName }) =>
    path.join(parentDir, `current-backup-${dirName}`)
  ),
  ctxAssign("lastBackupPath", ({ parentDir, dirName }) =>
    path.join(parentDir, `last-backup-${dirName}`)
  ),
  uploadChangedFilesForever
]);
