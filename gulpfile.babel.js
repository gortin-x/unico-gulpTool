var gulp = require('gulp');
// sass编译插件
var sass = require('gulp-sass');
sass.compiler = require('node-sass');
// less编译插件
var less = require('gulp-less');
// ES6编译
var babel = require('gulp-babel');
// eslint
var eslint = require('gulp-eslint');
// clean
var del = require('del');

var path = require('path');
var browserSync = require('browser-sync').create();
var runSequence = require('run-sequence');

// clean
gulp.task('clean', function (cb) {
    return del(['dist/**/*'], cb)
})

// js文件打包任务
gulp.task('js', function () {
    gulp.src('src/js/*.js')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(babel())
    .on('error', err => console.error(err))
    .pipe(
        gulp.dest('dist/js/')
    )
})

// html打包任务
gulp.task('html', function () {
    gulp.src('src/index.html')
    .pipe(
        gulp.dest('dist/')
    )
})

// style文件打包任务
gulp.task('style', function () {
    gulp.src(['./src/style/*.css', './src/style/*.scss', './src/style/*.less'])
    .pipe(
        sass().on('error', sass.logError)
    )
    .pipe(
        less({
            paths: [ path.join(__dirname, 'less', 'includes')]
        }).on('error', err => {
            console.error('Less Error: ', err.message);
        })
    )
    .pipe(
        gulp.dest('./dist/style/')
    )
})

// 监控文件变化,实现热更新
gulp.task('watch', function () {
    gulp.watch('src/js/*', function () {
        runSequence(
            'js',
            browserSync.reload     
        );       
    }).on('change', event => {
        if(event.type == 'deleted'){
            del('dist/js/' + path.basename(event.path));
        }
    })

    gulp.watch('src/style/*', function () {
        runSequence(
            'style',
            browserSync.reload     
        );       
    }).on('change', event => {
        if(event.type == 'deleted'){
            del('dist/style/' + path.basename(event.path, path.extname(event.path)) + '.css');
        }
    })

    gulp.watch('src/index.html', function () {
        runSequence(
            'html',
            browserSync.reload
        )
    })
})

// 本地服务任务
gulp.task('webserver', function () {
    runSequence('clean', 'html', 'style', 'js', 'watch')
    browserSync.init({
        port: 9999,
        server: {
            baseDir: ['dist']
        }
    })
})

// gulp默认任务
gulp.task('default', ['webserver']);