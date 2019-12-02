# Laravel Mix Favicon Generator

**Laravel Mix extension to generate favicons and include them into the HTML from single PNG/JPG/SVG image.**

## Note

When mix hot is running, just add your file into `inputPath` (only PNG/JPG/SVG, recommended) which will generate favicons for your website and inject HTML into your blade, if enabled*. See options for more detail.

## Installation

Install the extension:

```sh
npm install laravel-mix-favicon-generator
```

Next require the extension inside your Laravel Mix config and call `favicon()` in your pipeline:

```js
// webpack.mix.js
const mix = require('laravel-mix');
require('laravel-mix-favicon');

mix.js('resources/js/app.js', 'public/js')
    .sass('resources/sass/app.scss', 'public/css')
    .favicon();
```

## Options

#### Default options

If nothing is passed to the extension inside your Laravel Mix config, the following options will be used:

```js
{
    inputPath: 'resources/assets/favicon/generate',
    inputFile: '*.{jpg,png,svg}',
    publicPath: 'public',
    output: '/assets/favicon',
    usePathAsIs: true,
    dataFile: 'faviconData.json',
    blade: 'resources/views/blocks/favicon.blade.php',
    reload: false,
    debug: false,
    compression: 0,
    scalingAlgorithm: 'Mitchell',
    bgColor: '#ffffff',
    appName: 'Web App',
    chromeManifest: {
      name: 'Web App',
      display: 'standalone',
      orientation: 'portrait',
      on_conflict: 'override',
      declared: true
    }
}
```

#### Option details

* `inputPath` (string). Your favicon data path. There will be temporarily saved generated JSON for injecting HTML code (if `blade` option enabled).
* `inputFile` (string). File to watch (attention, file will be deleted).
* `publicPath` (string). Your application's public path.
* `output` (string). Where generated files will be saved. Relative to the `publicPath` option.
* `usePathAsIs` (boolean). Force RealFaviconGenerator to insert the path everywhere (use absolute path).
* `dataFile` (string). Temporary data file while generating HTML.
* `blade` (string or boolean). Path to blade file, where generated HTML code will be saved. This will overwrite whole file. _Note: set this option to `false` to disabled injecting HTML code._
* `reload` (boolean). Whenever to reload browser after success. _Note: this option has no effect if you are using [laravel-mix-blade-reload](https://www.npmjs.com/package/laravel-mix-blade-reload) extension._
* `debug` (boolean). Whenever to log extension events messages to the console.
* `bgColor` (string). Theme color (meta).
* `appName` (string). Application name (meta).
* `chromeManifest` (object). site.webmanifest settings.
* `compression` (num). Set the compression level, from 0 (no compression) to 5 (highest compression level).
* `scalingAlgorithm` (string). Set the scaling algorithm. Possible values: Mitchell, NearestNeighbor, Cubic, Bilinear, Lanczos, Spline