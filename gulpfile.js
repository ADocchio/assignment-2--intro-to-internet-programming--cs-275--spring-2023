const { src, dest, series, watch } = require(`gulp`),
    CSSLinter = require(`gulp-stylelint`),
    babel = require(`gulp-babel`),
    htmlCompressor = require(`gulp-htmlmin`),
    cleanCSS = require(`gulp-clean-css`),
    jsCompressor = require(`gulp-uglify`),
    jsLinter = require(`gulp-eslint`),
    browserSync = require(`browser-sync`),
    reload = browserSync.reload;

let browserChoice = `firefox`;

let compileCSSForDev = (`minify-css`, () => {
    return src(`styles/*.css`)
        .pipe(cleanCSS({compatibility: `ie8`}))
        .pipe(dest(`temp/styles`));
});

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
        .pipe(dest(`temp/js`));
};

let compressHTML = () => {
    return src([`index.html`])
        .pipe(htmlCompressor({collapseWhitespace: true}))
        .pipe(dest(`prod`));
};

let compileCSSForProd = (`minify-css`, () => {
    return src(`styles/*.css`)
        .pipe(cleanCSS({compatibility: `ie8`}))
        .pipe(dest(`prod/styles`));
});

let transpileJSForProd = () => {
    return src(`js/*.js`)
        .pipe(babel())
        .pipe(jsCompressor())
        .pipe(dest(`prod/js`));
};

let copyUnprocessedAssetsForProd = () => {
    return src([
        `img*/*`,       // Source all images,
        `json*/*.json`, // and all json,
    ], {dot: true})
        .pipe(dest(`prod`));
};

let copyUnprocessedAssetsForDev = () => {
    return src([
        `img*/*`,       // Source all images,
        `json*/*.json`, // and all json,
        `index.html`    // index.html
    ], {dot: true})
        .pipe(dest(`temp`));
};

let serve = () => {
    browserSync({
        notify: true,
        reloadDelay: 50,
        browser: browserChoice,
        server: {
            baseDir: [
                `temp`,
            ]
        }
    });

    watch(`js/*.js`, series(lintJS , transpileJSForDev))
        .on(`change`, reload);

    watch(`styles/main.css`, series(lintCSS, compileCSSForDev))
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
exports.copyUnprocessedAssetsForDev = copyUnprocessedAssetsForDev;
exports.lintCSS = lintCSS;
exports.default = series(
    copyUnprocessedAssetsForDev,
    lintCSS,
    compileCSSForDev,
    lintJS,
    transpileJSForDev,
    serve
);
exports.build = series(
    compressHTML,
    compileCSSForProd,
    transpileJSForProd,
    copyUnprocessedAssetsForProd
);
