const {src,dest,watch,parallel,series} = require('gulp');

const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const autoPrefixer = require('gulp-autoprefixer');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();
const imagemin = require('gulp-imagemin');
const del = require('del');


function browsersync(){
  browserSync.init({
    server:{
      baseDir:'./app/',
    },
    notify:false,
  })
} 

function buildStyles() {
  return src('./app/sass/style.scss')
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(concat('style.min.css'))
    // autoprefixer для кроссбраузорности
    .pipe(autoPrefixer({
      overrideBrowserslist:['last 10 versions'],
      grid:true,
    }))
    .pipe(dest('./app/css'))
    .pipe(browserSync.stream())
};

function scripts(){
  return src([
    './node_modules/jquery/dist/jquery.js',
    './node_modules/slick-carousel/slick/slick.js',
    './app/js/main.js'
  ])
  .pipe(concat('main.min.js'))
  .pipe(uglify())
  .pipe(dest('./app/js'))
  .pipe(browserSync.stream())
}

function images(){
  return src('./app/images/**/*.*')
  .pipe(imagemin([
  imagemin.gifsicle({interlaced: true}),
	imagemin.mozjpeg({quality: 75, progressive: true}),
	imagemin.optipng({optimizationLevel: 5}),
	imagemin.svgo({
		plugins: [
			{
				name: 'removeViewBox',
				active: true
			},
			{
				name: 'cleanupIDs',
				active: false
			}
		]
	})
]))
  .pipe(dest('./dist/images'))
}

function build(){
  return src([
    './app/**/*.html',
    './app/css/style.min.css',
    './app/js/main.min.js',
  ],{base:'./app'})
  .pipe(dest('dist'))
}

function cleanDist(){
  return del('dist')
}

function watching() {
  // Просмотрит все файлы в папке и найдёт все с расширением .scss
  watch('./app/sass/**/*.scss',series('buildStyles'));
  // Просматривает каждый .js файл но исключает main.min 
  // так как иначе он запускается 2 раза
  watch(['./app/js/**/*.js','!./app/js/main.min.js'],series('scripts'));
  watch('./app/**/*.html').on('change',browserSync.reload);
}

exports.buildStyles = buildStyles;
exports.scripts = scripts;
exports.browsersync = browsersync;
exports.watching = watching;
exports.images = images;
exports.cleanDist = cleanDist;
exports.build = series(cleanDist,images,build);

exports.default = parallel(buildStyles,scripts,browsersync,watching);


