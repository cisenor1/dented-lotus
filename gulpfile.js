/*!
 * Facebook React Starter Kit | https://github.com/kriasoft/react-starter-kit
 * Copyright (c) KriaSoft, LLC. All rights reserved. See LICENSE.txt
 */

'use strict';

// Include Gulp and other build automation tools and utilities
// See: https://github.com/gulpjs/gulp/blob/master/docs/API.md
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var del = require('del');
var path = require('path');
var merge = require('merge-stream');
var run = require("gulp-run");
var runSequence = require('run-sequence');
var webpack = require('webpack');
var browserSync = require('browser-sync');
var pagespeed = require('psi');
var argv = require('minimist')(process.argv.slice(2));

// Settings
var DEST = './dist';                         // The build output folder
var RELEASE = !!argv.release;                 // Minimize and optimize during a build?
var GOOGLE_ANALYTICS_ID = 'UA-XXXXX-X';       // https://www.google.com/analytics/web/
var AUTOPREFIXER_BROWSERS = [                 // https://github.com/ai/autoprefixer
  'ie >= 10',
  'ie_mob >= 10',
  'ff >= 30',
  'chrome >= 34',
  'safari >= 7',
  'opera >= 23',
  'ios >= 7',
  'android >= 4.4',
  'bb >= 10'
];

var src = {};
var watch = false;
var pkgs = (function () {
  var temp = {};
  var map = function (source) {
    for (var key in source) {
      temp[key.replace(/[^a-z0-9]/gi, '')] = source[key].substring(1);
    }
  };
  map(require('./package.json').dependencies);
  return temp;
}());

// The default task
gulp.task('default', ['serve']);

// Clean up
gulp.task('clean', del.bind(null, [DEST]));

// 3rd party libraries
gulp.task('vendor', function () {
  return merge(
    gulp.src('./node_modules/jquery/dist/**')
      .pipe(gulp.dest(DEST + '/vendor/jquery-' + pkgs.jquery)),
    gulp.src('./node_modules/bootstrap/dist/fonts/**')
      .pipe(gulp.dest(DEST + '/fonts'))
  );
});

// Static files
gulp.task('assets', function () {
  src.assets = 'src/assets/**';
  return gulp.src(src.assets)
    .pipe($.changed(DEST))
    .pipe(gulp.dest(DEST))
    .pipe($.size({ title: 'assets' }));
});

// Images
gulp.task('images', function () {
  src.images = 'src/images/**';
  return gulp.src(src.images)
    .pipe($.changed(DEST + '/images'))
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(DEST + '/images'))
    .pipe($.size({ title: 'images' }));
});

// HTML pages
gulp.task('pages', function () {
  src.pages = 'src/pages/**/*.html';
  return gulp.src(src.pages)
    .pipe($.changed(DEST))
    .pipe($.if(RELEASE, $.htmlmin({
      removeComments: true,
      collapseWhitespace: true,
      minifyJS: true
    })))
    .pipe(gulp.dest(DEST))
    .pipe($.size({ title: 'pages' }));
});

// CSS style sheets
gulp.task('styles', function () {
  src.styles = 'src/styles/**/*.{css,less}';
  return gulp.src('src/styles/bootstrap.less')
    .pipe($.plumber())
    .pipe($.less({
      sourceMap: !RELEASE,
      sourceMapBasepath: __dirname
    }))
    .on('error', console.error.bind(console))
    .pipe($.autoprefixer({ browsers: AUTOPREFIXER_BROWSERS }))
    .pipe($.csscomb())
    .pipe($.if(RELEASE, $.minifyCss()))
    .pipe(gulp.dest(DEST + '/css'))
    .pipe($.size({ title: 'styles' }));
});

// Bundle
gulp.task('bundle', function (cb) {
  var started = false;
  var config = require('./config/webpack.js')(RELEASE);
  var bundler = webpack(config);

  function bundle(err, stats) {
    if (err) {
      throw new $.util.PluginError('webpack', err);
    }

    !!argv.verbose && $.util.log('[webpack]', stats.toString({ colors: true }));

    if (!started) {
      started = true;
      return cb();
    }
  }

  if (watch) {
    bundler.watch(200, bundle);
  } else {
    bundler.run(bundle);
  }
});

// Build the app from source code
gulp.task('serve-live', [], function (cb) {
});

// Launch a lightweight HTTP Server
gulp.task('serve', function (cb) { 
  run("npm run webpack").exec();
  watch = true;
  // browserSync.init({
  //   server: {
  //     baseDir: "./"
  //   }
  // });

  gulp.watch('./compiled/**/*.*', function (file) {
    console.log("Caught a change in compiled");
     run("npm run webpack").exec();
  });
  gulp.watch('./style.less').on("change", (f) => {
    run("lessc ./style.less ./dist/style.css").exec().on("error",(err)=>{  
      this.emit("end");
    });
  });
  // gulp.watch('./dist/**/*.*', function (file) {
  //   console.log("Refreshing Browser " + file.path);
  //   browserSync.reload(path.relative(__dirname, file.path));
  // });
  run("node app.js").exec();
  cb();
});

// Deploy to GitHub Pages
gulp.task('deploy', function () {

  // Remove temp folder
  if (argv.clean) {
    var os = require('os');
    var path = require('path');
    var repoPath = path.join(os.tmpdir(), 'tmpRepo');
    $.util.log('Delete ' + $.util.colors.magenta(repoPath));
    del.sync(repoPath, { force: true });
  }

  return gulp.src(DEST + '/**/*')
    .pipe($.if('**/robots.txt', !argv.production ? $.replace('Disallow:', 'Disallow: /') : $.util.noop()))
    .pipe($.ghPages({
      remoteUrl: 'https://github.com/{name}/{name}.github.io.git',
      branch: 'master'
    }));
});

// Run PageSpeed Insights
// Update `url` below to the public URL for your site
gulp.task('pagespeed', pagespeed.bind(null, {
  // By default, we use the PageSpeed Insights
  // free (no API key) tier. You can use a Google
  // Developer API key if you have one. See
  // http://goo.gl/RkN0vE for info key: 'YOUR_API_KEY'
  url: 'https://example.com',
  strategy: 'mobile'
}));
