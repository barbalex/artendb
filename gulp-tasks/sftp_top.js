/**
 * beamt die Dateien aus dem public-Ordner nach erfassen.ch/public
 */

'use strict'

const gulp = require('gulp')
const sftp = require('gulp-sftp')
const sftpPass = require('../sftpPass.json')

gulp.task('sftp_top', () => {
  return gulp.src(['server.js', 'couchPass.json', 'package.json'])
    .pipe(sftp({
      host: '46.101.210.208',
      port: 30000,
      remotePath: 'api',
      user: sftpPass.user,
      pass: sftpPass.pass
    }))
})
