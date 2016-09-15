var gulp = require('gulp')
var babel = require('gulp-babel')
var del = require('del')
var eslint = require('gulp-eslint')
var run = require('run-sequence')

gulp.task('bin', function () {
  return gulp.src('./src/**/*.js')
    .pipe(babel({ presets: ['latest'], plugins: ['lodash'] }))
    .pipe(gulp.dest('./bin'))
})

gulp.task('inst', function () {
  return gulp.src('./src/**/*.js')
    .pipe(babel({ presets: ['latest'], plugins: ['lodash'], env: { test: { plugins: ['istanbul'] } } }))
    .pipe(gulp.dest('./bin'))
})

gulp.task('delete', function () {
  return del([
    'bin/**/*',
    'bin',
    'coverage/**/*',
    'coverage',
    '.nyc_output/*',
    '.nyc_output',
    'test/output/*',
    'test/output',
    'lcov.info'
  ])
})

gulp.task('clean', function (cb) {
  return run('delete', 'bin', cb)
})

gulp.task('lint', function () {
  return gulp.src(['**/**/*.js', '!node_modules/**/*.*', '!bin/**/*.js'])
    .pipe(eslint.format())
})

gulp.task('default', function (cb) {
  return run('clean', cb)
})

gulp.task('all', function (cb) {
  return run('clean', 'lint', cb)
})
