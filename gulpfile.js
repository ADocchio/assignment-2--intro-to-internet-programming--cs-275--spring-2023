const { src, dest, series, watch } = require(`gulp`),
    CSSLinter = require(`gulp-stylelint`),
    babel = require(`gulp-babel`),
    htmlCompressor = require(`gulp-htmlmin`),
    jsCompressor = require(`gulp-uglify`),
    jsLinter = require(`gulp-eslint`),
    sass = require(`gulp-sass`)(require(`sass`)),
    browserSync = require(`browser-sync`),
    reload = browserSync.reload;

let browserChoice = `default`;

let compileCSSForDev = () => {
    return src(`styles/main.css`)
        .pipe(sass.sync({
            outputStyle: `expanded`,
            precision: 10
        }).on(`error`, sass.logError))
        .pipe(dest(`temp/styles`));
};

let lintJS = () => {
    return src(`js/*.js`)
        .pipe(jsLinter(`.eslintrc`))
        .pipe(jsLinter.formatEach(`compact`));
};

let lintCSS = () => {
    return src(`styles/main.css`)
        .pipe(CSSLinter({
            failAfterError: false,
            reporters: [
                {formatter: `string`, console: true}
            ]
        }));
};

let transpileJSForDev = () => {
    return src(`js/*.js`)
        .pipe(babel())
        .pipe(dest(`temp/scripts`));
};

let compressHTML = () => {
    return src([`index.html`])
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod`));
};

let compileCSSForProd = () => {
    return src(`styles/main.css`)
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

let copyUnprocessedAssetsForProd = () => {
    return src([
        `*.*`,       // Source all files,
        `**`,        // and all folders,
        `!index.html`, // Not index.html
        `js/*.js`,  // ignore JS;
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
                `temp`,
                `.`,
            ]
        }
    });

    watch(`js/*.js`, series(lintJS /*, transpileJSForDev*/))
        .on(`change`, reload);

    watch(`styles/main.css`, lintCSS, compileCSSForDev)
        .on(`change`, reload);

    watch(`index.html`)
        .on(`change`, reload);
};

exports.compileCSSForDev = compileCSSForDev;
exports.lintJS = lintJS;
exports.transpileJSForDev = transpileJSForDev;
exports.compressHTML = compressHTML;
exports.compileCSSForProd = compileCSSForProd;
exports.transpileJSForProd = transpileJSForProd;
exports.copyUnprocessedAssetsForProd = copyUnprocessedAssetsForProd;
exports.lintCSS = lintCSS;
exports.default = serve;
exports.serve = series(
    lintCSS,
    compileCSSForDev,
    lintJS,
    //transpileJSForDev,
    serve
);
exports.build = series(
    compressHTML,
    compileCSSForProd,
    transpileJSForProd,
    copyUnprocessedAssetsForProd
);
