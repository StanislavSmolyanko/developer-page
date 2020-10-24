const { src, dest, parallel, series, watch } = require('gulp'),
    browserSync                            = require('browser-sync').create(),
    sass                                   = require('gulp-sass'),
    autoprefixer                           = require('gulp-autoprefixer'),
    cleancss                               = require('gulp-clean-css'),
    fileinclude                            = require('gulp-file-include'),
    del                                    = require('del'),
    groupMedia                             = require('gulp-group-css-media-queries'),
    rename                                 = require('gulp-rename'),
    uglify                                 = require('gulp-uglify-es').default,
    babel                                  = require('gulp-babel'),
    imageMin                               = require('gulp-imagemin'),
    webp                                   = require('gulp-webp'),
    webpCSS                                = require('gulp-webpcss'),
    ttf2woff                               = require('gulp-ttf2woff'),
    ttf2woff2                              = require('gulp-ttf2woff2');


function browsersync() {
    browserSync.init({
        server: {
            baseDir: 'dist/'
        },
        notify: false
    })
}

function html() {
    return src('src/index.html')
    .pipe(dest('dist/'))
    .pipe(browserSync.stream())
}

function styles() {
    return src('src/scss/style.scss')
    .pipe(sass())
    .pipe(autoprefixer({
        overrideBroeserslist: 'last 10 versions'
    }))
    .pipe(groupMedia())
    .pipe(webpCSS({}))
    .pipe(dest('dist/css'))
    .pipe(cleancss())
    .pipe(rename({
        extname: '.min.css'
    }))
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream())
}

function js() {
    return src('src/js/main.js')
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(dest('dist/js'))
    .pipe(uglify())
    .pipe(rename({
        extname: '.min.js'
    }))
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream())
}

function imagemin() {
    return src('src/img/*')
    .pipe(webp())
    .pipe(dest('dist/img/'))
    .pipe(src('src/img/*'))
    .pipe(imageMin([
        imageMin.gifsicle({interlaced: true}),
        imageMin.mozjpeg({quality: 75, progressive: true}),
        imageMin.optipng({optimizationLevel: 5}),
        imageMin.svgo({
            plugins: [
                {removeViewBox: true},
                {cleanupIDs: false}
            ]
        })
    ]))
    .pipe(dest('dist/img/'))
    .pipe(browserSync.stream())
}

function fonts() {
    return src('src/fonts/*.ttf')
    .pipe(ttf2woff())
    .pipe(dest('dist/fonts/'))
    .pipe(src('src/fonts/*.ttf'))
    .pipe(ttf2woff2())
    .pipe(dest('dist/fonts/'))
}

function startwatch() {
    watch(['src/scss/**/*.scss'], styles);
    watch(['src/*.html'], html);
    watch(['src/js/main.js'], js);
    watch(['src/img/*{jpg,png,gif,svg,ico,webp}'], imagemin);
}

function clean() {
    return del('dist')
}


exports.browsersync = browsersync;
exports.html        = html;
exports.styles      = styles;
exports.clean       = clean;
exports.js          = js;
exports.imagemin    = imagemin;
exports.fonts       = fonts;
exports.default     = parallel(series(clean, html, styles, js, imagemin, browsersync), startwatch);