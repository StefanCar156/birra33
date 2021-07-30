// list dependencies
const { src, dest, watch, series } = require("gulp")
const sass = require("gulp-sass")(require("sass"))
const prefix = require("gulp-autoprefixer")
const minify = require("gulp-clean-css")
const terser = require("gulp-terser")
const imageMin = require("gulp-imagemin")

// create functions

// scss
const compileScss = () => {
  return src("src/scss/**/*.scss")
    .pipe(sass())
    .pipe(prefix())
    .pipe(minify())
    .pipe(dest("dist/css"))
}

// js
const jsMin = () => {
  return src("src/js/*.js").pipe(terser()).pipe(dest("dist/js"))
}

// images
const optimizeImg = () => {
  return src("src/images/*.{jpg,png}")
    .pipe(
      imageMin([
        imageMin.mozjpeg({ quality: 80, progressive: true }),
        imageMin.optipng({ optimizationLevel: 2 }),
      ])
    )
    .pipe(dest("dist/images"))
}

// Favicon
const compileFavIcon = () => {
  return src("src/images/*.ico").pipe(dest("dist"))
}

// create watchTask
const watchTask = () => {
  watch("src/scss/**/*.scss", compileScss)
  watch("src/js/*.js", jsMin)
  watch("src/images/*.{jpg,png}", optimizeImg)
  watch("src/images/*.ico", compileFavIcon)
}

// default gulp
exports.default = series(
  compileScss,
  jsMin,
  optimizeImg,
  compileFavIcon,
  watchTask
)
