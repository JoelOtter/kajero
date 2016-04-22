var gulp = require('gulp');

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
