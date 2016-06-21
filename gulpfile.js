var gulp = require('gulp')
var babel = require('gulp-babel')
var eslint = require('gulp-eslint')
var del = require('del')
var lab = require('gulp-lab')
var ugly = require('gulp-uglify')
var run = require('run-sequence')

gulp.task('build', function () {
  return gulp.src('./src/**/*.js')
    .pipe(babel({ presets: ['es2015'], plugins: ['lodash', 'transform-runtime'], env: { development: { sourceMaps: 'inline' } } }))
    .pipe(gulp.dest('./build'))
})

gulp.task('clean', function () {
  return del(['./build/**/*.js', './bin/**/*.js'])
})

gulp.task('lint', function () {
  return gulp.src(['**/**/*.js', '!node_modules/**/*.*', '!build/**/*.js', '!bin/**/*.js'])
    .pipe(eslint.format())
})

gulp.task('min', function () {
  return gulp.src('./build/**/*.js')
    .pipe(ugly())
    .pipe(gulp.dest('./bin'))
})

gulp.task('bin', function (cb) {
  return run('build', 'min', cb)
})

gulp.task('test', function () {
  return gulp.src('./test/**/*.js')
    .pipe(lab())
})

gulp.task('default', function (cb) {
  return run('test', cb)
})

gulp.task('all', function (cb) {
  return run('clean', 'lint', 'test', 'build', 'min', cb)
})
