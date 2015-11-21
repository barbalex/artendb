'use strict'

const gulp = require('gulp')
const shell = require('gulp-shell')
const passFile = require('../couchpass.json')

const userName = passFile.user
const password = passFile.pass

const request = `couchapp push http://${userName}:${password}@127.0.0.1:5984/ae`

console.log('request: ', request)

gulp.task('build_couchapp', shell.task([request]))
