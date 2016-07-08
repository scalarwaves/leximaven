var gulp = require('gulp')
var babel = require('gulp-babel')
var del = require('del')
var exec = require('child_process').exec
var eslint = require('gulp-eslint')
var run = require('run-sequence')

gulp.task('dbuild', function () {
  return gulp.src('./src/**/*.js')
    .pipe(babel({ presets: ['es2015'], plugins: ['lodash', 'transform-runtime'], env: { development: { sourceMaps: 'inline' } } }))
    .pipe(gulp.dest('./build'))
})

gulp.task('pbuild', function () {
  return gulp.src('./src/**/*.js')
    .pipe(babel({ presets: ['es2015'], plugins: ['lodash', 'transform-runtime'] }))
    .pipe(gulp.dest('./build'))
})

gulp.task('clean', function () {
  return del([
    'build/**/*',
    'build',
    'coverage/**/*',
    'coverage',
    'test/*.out',
    'test/*.json',
    'test/.leximaven.noon'
  ])
})

gulp.task('lint', function () {
  return gulp.src(['**/**/*.js', '!node_modules/**/*.*', '!build/**/*.js', '!bin/**/*.js'])
    .pipe(eslint.format())
})

gulp.task('coveralls', function () {
  return gulp.src('coverage/lcov.info')
    .pipe(coveralls())
})

gulp.task('test', function (cb) {
  exec('npm test', function (err, stdout, stderr) {
    console.log(stdout)
    console.log(stderr)
    cb(err)
  })
})

gulp.task('bin', function (cb) {
  return run('dbuild', cb)
})

gulp.task('default', function (cb) {
  return run('clean', 'dbuild', 'test', cb)
})

gulp.task('all', function (cb) {
  return run('clean', 'lint', 'dbuild', 'test', cb)
})
