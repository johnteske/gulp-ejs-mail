var gulp = require('gulp'),
    util = require('gulp-util'),
    flatten = require('gulp-flatten'),
    del = require('del'),
    ejs = require('gulp-ejs'),
    sass = require('gulp-sass'),
    inline = require('gulp-inline-css');

production = !!util.env.dist; // usable in helpers
project = (util.env.project || 'project') + '/';

var dir = {
        source: 'src/' + project,
        dest: (production ? 'dist/' : 'dev/') + project
    },
    files = {
        data: ['{libs/,' + dir.source + '}**/*.{json,yml}'],
        sass: [dir.source + '*.scss', 'libs/*/styles/*.scss'],
        ejs: [dir.source + '**/*.ejs']
    };

var readData = require('./readData.js')['readData'];

var libraries = require('./libraries.js').loadLibraries();

var ejs_options = {
    readData: function(dataFile){ return readData(dir.source + dataFile) },
    production: production
};
// add library helpers and partials for access in ejs
for (var attrname in libraries) { ejs_options[attrname] = libraries[attrname]; }

gulp.task('sass', function() {
    return gulp.src(files.sass)
    .pipe(sass())
    .pipe(flatten())
    .pipe(gulp.dest(dir.dest + 'styles'));
});

gulp.task('build', ['sass'], function() {
    return gulp.src(files.ejs)
    .pipe(ejs(ejs_options, {ext:'.html'})
        .on('error', util.log))
    .pipe(gulp.dest(dir.dest))
    .pipe(inline())
    .pipe(gulp.dest(dir.dest));
});

gulp.task('clean', function () {
  return del(['dev/**/*', 'dist/**/*']);
});

gulp.task('watch', function() {
    gulp.watch([files.data, files.sass, files.ejs, 'libs/*/partials/*.ejs'], ['build']);
});

gulp.task('default', ['build', 'watch']);
