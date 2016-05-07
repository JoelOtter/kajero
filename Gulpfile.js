var gulp = require('gulp');
var gutil = require('gulp-util');
var watchify = require('watchify');
var babelify = require('babelify');
var browserify = require('browserify');
var browserSync = require('browser-sync').create();
var source = require('vinyl-source-stream');
var sass = require('gulp-sass');

var isProduction = process.env.NODE_ENV === 'production';

// Input file
watchify.args.debug = (!isProduction);
var bundler = watchify(browserify('./src/js/app.js', watchify.args));

// Babel transform (for ES6)
bundler.transform(babelify.configure({
    sourceMapRelative: 'src/js',
    presets: ['es2015', 'react']
}));

bundler.transform('envify');
bundler.transform({
    global: isProduction,
    ignore: [
        '**/jutsu/lib/**'
    ]
}, 'uglifyify');

// Recompile on updates.
bundler.on('update', bundle);

function bundle() {
    gutil.log("Recompiling JS...");

    return bundler.bundle()
        .on('error', function(err) {
            gutil.log(err.message);
            browserSync.notify("Browserify error!");
            this.emit("end");
        })
        .pipe(source('bundle.js'))
        .pipe(gulp.dest('./src/dist'))
        .pipe(browserSync.stream({once: true}));
}

// Gulp task aliases

gulp.task('bundle', function() {
    return bundle();
});

gulp.task('sass', function() {
    return gulp.src('./src/scss/*.scss')
        .pipe(sass({
            outputStyle: 'compressed',
            noCache: true
        }))
        .on('error', function(err) {
            gutil.log(err.message);
        })
        .pipe(gulp.dest('./src/dist'))
        .pipe(browserSync.stream({once: true}));
});

// Bundle and serve page
gulp.task('default', ['sass', 'bundle'], function() {
    gulp.watch('./src/scss/*.scss', ['sass']);
    browserSync.init({
        server: './src'
    });
});

/*
 * Testing
 */

gulp.task('test-cov', require('gulp-jsx-coverage').createTask({
    src: './src/**/*-spec.js',
    istanbul: {
        preserveComments: true,
        coverageVariable: '__MY_TEST_COVERAGE__',
        exclude: /node_modules|-spec|jutsu|reshaper|smolder/
    },
    threshold: {
        type: 'lines',
        min: 90
    },
    transpile: {
        babel: {
            exclude: /node_modules/
        }
    },
    coverage: {
        reporters: ['text-summary', 'json', 'lcov'],
        directory: 'coverage'
    },
    mocha: {
        reporter: 'spec'
    }
}));
