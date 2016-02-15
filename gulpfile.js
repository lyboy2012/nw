var path = require('path'),
    gulp = require('gulp'),
    plugins = require('gulp-load-plugins')(),
    webpackConf = require('./webpack.config'),
    srcDir = path.resolve(process.cwd(), 'src'),
    jsDir = path.resolve(srcDir, 'js'),
    browserSync = require('browser-sync').create(),
    assets = path.resolve(process.cwd(), 'assets'),
    buildJsDir = path.resolve(srcDir, '__build'),
    rimraf = require('rimraf'); // rimraf directly 

gulp.task('hint', function() {

    return gulp.src([
            '!' + jsDir + '/lib/**/*.js',
            jsDir + '/**/*.js'
        ])
        .pipe(plugins.jshint('.jshintrc'))
        .pipe(plugins.jshint.reporter(plugins.stylish));
});

gulp.task('js', function() {
    return gulp.src(jsDir + '/**/*.js')
        .pipe(plugins.webpack(webpackConf))
        .pipe(gulp.dest(buildJsDir))
        .pipe(browserSync.stream());
});

gulp.task('styles', function() {
    return gulp.src(srcDir + '/scss/**/*.scss')
        .pipe(plugins.compass({
            css: srcDir + '/css',
            sass: srcDir + '/scss',
            image: srcDir + '/img',
            generated_images_path:srcDir + '/img',
            sourcemap: true,
            require: ['susy']
        }))
        .on('error', function(error) {
            // Would like to catch the error here 
            console.log(error);
            this.emit('end');
        })
        .pipe(gulp.dest(srcDir + '/css')) //生成css文件
        .pipe(browserSync.stream());

});
gulp.task('html', function() {
    return gulp.src(srcDir + '/*.html')
        .pipe(gulp.dest(srcDir))
        .pipe(browserSync.stream());
});



gulp.task('serve', ['js', 'styles', 'html'], function() {
    browserSync.init({
        server: {
            baseDir: srcDir,
            index: "homepage.html"
        }
    });

});

gulp.task('build-html',['build-scripts', 'build-style', 'build-images'], function() {
    var opts = {
        empty: true, //- do not remove empty attributes
        cdata: false, // - do not strip CDATA from scripts
        comments: false, // - do not remove comments
        conditionals: false, //- do not remove conditional internet explorer comments
        spare: true, // - do not remove redundant attributes
        quotes: true, // - do not remove arbitrary quotes
        loose: false // - preserve one whitespace
    };
    return gulp.src([assets+'/**/*.json',srcDir + '/*.html'])
        .pipe(plugins.revCollector({
            replaceReved: true,
            dirReplacements: {
                'css/':'css/', //?bug 不设置不替换
                '../__build':  'js'
            }
        }))
        .pipe(plugins.minifyHtml(opts))
        .pipe(gulp.dest(assets));
});




//编译字体
gulp.task('build-style:fonts', function() {
    return gulp.src(srcDir + '/fonts/**/*')
        .pipe(gulp.dest(assets + '/fonts'));

});

//编译样式
gulp.task('build-style', ['styles','build-style:fonts'], function() {
    return gulp.src(srcDir + '/css/**/*.css')
        .pipe(plugins.minifyCss())
        .pipe(plugins.rev())
        .pipe(gulp.dest(assets + '/css')) //压缩后再生成css 文件
        .pipe(plugins.rev.manifest()) //- 生成一个rev-manifest.json
        .pipe(gulp.dest(assets + '/css'));

});

gulp.task('build-scripts',['js'], function() {
    return gulp.src(buildJsDir + '/**/*')
        .pipe(plugins.uglify())
        .pipe(plugins.rev())
        .pipe(gulp.dest(assets + '/js')) //压缩后再生成js 文件
        .pipe(plugins.rev.manifest()) //- 生成一个rev-manifest.json
        .pipe(gulp.dest(assets + '/js'));

});


//编译图片
gulp.task('build-images', function() {
    return gulp.src(srcDir + '/img/**/*')
        .pipe(plugins.imagemin({
            optimizationLevel: 5,
            progressive: true,
            interlaced: true
        }))
        .pipe(gulp.dest(assets + '/img'))
        .pipe(browserSync.stream());
});



gulp.task('clean', function(cb) {
     rimraf(assets, cb);
});

gulp.task('build', ['build-html']);



gulp.task('default', ['serve'], function() {
    gulp.watch(jsDir + '/**/*.js',['hint','js'], browserSync.reload);
    gulp.watch(srcDir + '/*.html', browserSync.reload);
    //监听scss
    gulp.watch(srcDir + '/scss/**/*.scss', ['styles'], browserSync.reload);
});
