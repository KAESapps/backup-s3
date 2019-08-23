const { seq, ctxAssign, ite } = require("./lib/utils");
const exec = require("./lib/exec");
const path = require("path");
const fileExists = require("./lib/fileExists");
const log = require("./log");
const pMap = require("p-map");
const s3Upload = require("./lib/s3Upload");
const pForever = require("p-forever");
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
  ctxAssign("modifiedFiles", ({ modifiedFiles }) =>
    modifiedFiles ? modifiedFiles.split("\n").map(path => path.slice(2)) : []
  ),
  ({ modifiedFiles, bucket }) => {
    let count = modifiedFiles.length;
    if (!count) return log.info("no files changed");
    log.info("changed files detected", { filesCount: count });
    return pMap(
      modifiedFiles,
      key =>
        s3Upload({
          bucket,
          key
        }).then(() =>
          log.info("file uploaded", { file: key, remainingFiles: --count })
        ),
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
    return uploadChangedFiles(ctx).then(() => {
      const delayInMs = ctx.delay || defaultDelay;
      log("retry scheduled", { delayInMs });
      return new Promise(resolve => setTimeout(resolve, delayInMs));
    });
  });

const init = seq([
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
  ({ fullPath, bucket }) =>
    log.info("start uploading changed files", { from: fullPath, to: bucket })
]);

exports.once = seq([init, uploadChangedFiles]);
exports.continuous = seq([init, uploadChangedFilesForever]);
