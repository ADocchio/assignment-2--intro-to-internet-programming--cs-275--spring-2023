const { src, dest, series, watch } = require(`gulp`),
    CSSLinter = require(`gulp-stylelint`),
    // del = require(`del`),
    babel = require(`gulp-babel`),
    htmlCompressor = require(`gulp-htmlmin`),
    // imageCompressor = require(`gulp-image`),
    jsCompressor = require(`gulp-uglify`),
    jsLinter = require(`gulp-eslint`),
    sass = require(`gulp-sass`)(require(`sass`)),
    browserSync = require(`browser-sync`),
    reload = browserSync.reload;

let browserChoice = `default`;

let compileCSSForDev = () => {
    return src(`styles/*.scss`)
        .pipe(sass.sync({
            outputStyle: `expanded`,
            precision: 10
        }).on(`error`, sass.logError))
        .pipe(dest(`temp/styles`));
};

let lintJS = () => {
    return src(`scripts/*.js`)
        .pipe(jsLinter())
        .pipe(jsLinter.formatEach(`compact`));
};

let transpileJSForDev = () => {
    return src(`scripts/*.js`)
        .pipe(babel())
        .pipe(dest(`temp/scripts`));
};

let compressHTML = () => {
    // eslint-disable-next-line max-len
    return src([`*.html`, `**/*.html`])
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod`));
};

let compileCSSForProd = () => {
    return src(`styles/*.scss`)
        .pipe(sass.sync({
            outputStyle: `compressed`,
            precision: 10
        }).on(`error`, sass.logError))
        .pipe(dest(`prod/styles`));
};

let transpileJSForProd = () => {
    return src(`scripts/*.js`)
        .pipe(babel())
        .pipe(jsCompressor())
        .pipe(dest(`prod/scripts`));
};

// let compressImages = () => {
//     return src(`assignment-2--intro-to-internet-programming--cs-275--spring-2023/img/**/*`)
//         .pipe(imageCompressor({
//             optipng: [`-i 1`, `-strip all`, `-fix`, `-o7`, `-force`],
//             pngquant: [`--speed=1`, `--force`, 256],
//             zopflipng: [`-y`, `--lossy_8bit`, `--lossy_transparent`],
//             jpegRecompress: [`--strip`, `--quality`, `medium`, `--min`, 40,
//                 `--max`, 80],
//             mozjpeg: [`-optimize`, `-progressive`],
//             gifsicle: [`--optimize`],
//             svgo: [`--enable`, `cleanupIDs`, `--disable`, `convertColors`],
//             quiet: false
//         }))
//         .pipe(dest(`prod/img`));
// };

let copyUnprocessedAssetsForProd = () => {
    return src([
        `*.*`,       // Source all files,
        `**`,        // and all folders,
        `!html/`,    // but not the HTML folder
        `!html/*.*`, // or any files in it
        `!html/**`,  // or any sub folders;
        `!img/`,     // ignore images;
        `!**/*.js`,  // ignore JS;
        `!styles/**` // and, ignore Sass/CSS.
    ], {dot: true})
        .pipe(dest(`prod`));
};

let serve = () => {
    browserSync({
        notify: true,
        reloadDelay: 50,
        browser: browserChoice,
        server: {
            baseDir: [
                `.`
            ]
        }
    });

    watch(`js/*.js`, series(lintJS, transpileJSForDev))
        .on(`change`, reload);

    watch(`styles/*.css`, compileCSSForDev)
        .on(`change`, reload);

    watch(`img/**/*`)
        .on(`change`, reload);
};

// async function clean() {
//     let fs = require(`fs`),
//         i,
//         foldersToDelete = [`./temp`, `prod`];

//     for (i = 0; i < foldersToDelete.length; i++) {
//         try {
//             fs.accessSync(foldersToDelete[i], fs.F_OK);
//             process.stdout.write(`\n\tThe ` + foldersToDelete[i] +
//                 ` directory was found and will be deleted.\n`);
//             del(foldersToDelete[i]);
//         } catch (e) {
//             process.stdout.write(`\n\tThe ` + foldersToDelete[i] +
//                 ` directory does NOT exist or is NOT accessible.\n`);
//         }
//     }

//     process.stdout.write(`\n`);
// }

let lintCSS = () => {
    return src(`styles/*.css`)
        .pipe(CSSLinter({
            failAfterError: false,
            reporters: [
                {formatter: `string`, console: true}
            ]
        }));
};

exports.compileCSSForDev = compileCSSForDev;
exports.lintJS = lintJS;
exports.transpileJSForDev = transpileJSForDev;
exports.compressHTML = compressHTML;
exports.compileCSSForProd = compileCSSForProd;
exports.transpileJSForProd = transpileJSForProd;
// exports.compressImages = compressImages;
exports.copyUnprocessedAssetsForProd = copyUnprocessedAssetsForProd;
// exports.clean = clean;
exports.default = serve;
exports.lintCSS = lintCSS;
exports.serve = series(
    compileCSSForDev,
    lintJS,
    transpileJSForDev,
    serve
);
exports.build = series(
    compressHTML,
    compileCSSForProd,
    transpileJSForProd,
    // compressImages,
    copyUnprocessedAssetsForProd
);
