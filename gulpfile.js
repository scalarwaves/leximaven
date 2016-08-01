var gulp = require('gulp')
var babel = require('gulp-babel')
var del = require('del')
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

gulp.task('delete', function () {
  return del([
    'build/**/*',
    'build',
    'coverage/**/*',
    'coverage',
    '.nyc_output/*',
    '.nyc_output',
    'test/output/*',
    'test/output'
  ])
})

gulp.task('clean', function (cb) {
  return run('delete', 'dbuild', cb)
})

gulp.task('lint', function () {
  return gulp.src(['**/**/*.js', '!node_modules/**/*.*', '!build/**/*.js'])
    .pipe(eslint.format())
})

gulp.task('bin', function (cb) {
  return run('dbuild', cb)
})

gulp.task('default', function (cb) {
  return run('clean', 'test', cb)
})

gulp.task('all', function (cb) {
  return run('clean', 'lint', 'test', cb)
})
