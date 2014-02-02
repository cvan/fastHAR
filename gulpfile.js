var connect = require('gulp-connect');
var gulp = require('gulp');


gulp.task(
    'connect', connect({
        root: __dirname + '/src',
        port: process.env.PORT || process.env.port || 9000
    })
);

gulp.task('default', ['connect']);
