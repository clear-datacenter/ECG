var gulp   = require('gulp'),
    pump   = require('pump'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename');

gulp.task('default', function(cb) {
    pump([
        gulp.src('js/ECG.js'),
        uglify(),
        rename(function(path) {
            path.basename += '.min'
        }),
        gulp.dest('dest')
    ], cb);
});
