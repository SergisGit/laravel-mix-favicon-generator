const mix = require('laravel-mix');
const chokidar = require('chokidar');
const fs = require('fs');
const realFavicon = require('gulp-real-favicon');
const shell = require('shelljs');

class Favicon {

  name() {
    return 'favicon';
  }

  dependencies() {
    return ['chokidar', 'gulp-real-favicon', 'shelljs'];
  }

  register(options) {
    this.options = Object.assign({
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
    }, options || {});
  }

  boot() {
    let self = this;
    let sourcePath = this.options.inputPath + '/' + this.options.inputFile;

    this.mkdir(this.options.inputPath);

    chokidar.watch(sourcePath, {
      ignoreInitial: false
    }).on('add', (_path) => {
      self.generateFavicon(_path);
    });
  }

  webpackConfig(webpackConfig) {
    this.webpackOriginalAfterCallback = webpackConfig.devServer.after;

    let self = this;

    this.log('webpack config updated');
    webpackConfig.devServer.after = (app, server) => {
      self.after(app, server);
    };
  }

  after(app, server) {
    if (typeof this.webpackOriginalAfterCallback === 'function') {
      this.webpackOriginalAfterCallback(app, server);
    }

    this.serverHandler = server;
    this.log('webpack server handler attached');
  }

  reload() {
    if (this.options.reload === true && typeof mix.bladeReload !== 'function' && typeof this.serverHandler !== 'undefined') {
      this.serverHandler.sockWrite(this.serverHandler.sockets, 'content-changed');
    }

    return void (8);
  }

  generateFavicon(_path) {
    let self = this;
    let dataFilePath = this.options.inputPath + '/' + this.options.dataFile;
    let destinationPath = this.options.publicPath + '/' + this.options.output;

    this.mkdir(path.dirname(dataFilePath));
    this.clearDir(destinationPath);

    self.log('Favicon is generating, wait a moment, please...');

    realFavicon.generateFavicon({
      masterPicture: _path,
      dest: destinationPath,
      iconsPath: this.options.output,
      design: {
        desktop_browser: {},
        ios: {
          app_name: this.options.appName,
          picture_aspect: 'no_change',
          assets: {
            ios6_and_prior_icons: false,
            ios7_and_later_icons: true,
            precomposed_icons: false,
            declare_only_default_icon: false
          }
        },
        windows: {
          app_name: this.options.appName,
          picture_aspect: 'no_change',
          background_color: this.options.bgColor,
          onConflict: 'override',
          assets: {
            windows_80_ie_10_tile: true,
            windows_10_ie_11_edge_tiles: {
              small: false,
              medium: true,
              big: true,
              rectangle: false
            }
          }
        },
        android_chrome: {
          picture_aspect: 'no_change',
          themeColor: this.options.bgColor,
          manifest: this.options.chromeManifest,
          assets: {
            legacyIcon: false,
            lowResolutionIcons: false
          }
        }
      },
      settings: {
        compression: this.options.compression,
        scaling_algorithm: this.options.scalingAlgorithm,
        error_on_image_too_small: false,
        readme_file: false,
        html_code_file: false,
        use_path_as_is: this.options.usePathAsIs
      },
      markupFile: dataFilePath
    }, () => {
      if (self.options.blade !== false && self.options.blade !== null) {
        self.mkdir(path.dirname(self.options.blade));

        let html = JSON.parse(
          fs.readFileSync(dataFilePath)
        ).favicon.html_code;

        fs.writeFile(path.normalize(self.options.blade), html, (err) => {
          if (err) {
            self.error(err);
          } else {
            fs.unlinkSync(_path);
            fs.unlinkSync(dataFilePath);
            self.log('Favicon was generated! [HTML in: ' + self.options.blade + ']');
            self.reload();
          }
        });
      } else {
        fs.unlinkSync(_path);
        fs.unlinkSync(dataFilePath);
        self.log('Favicon was generated! [without injecting HTML]');
      }
    });
  }

  log(message) {
    if (this.options.debug === true) {
      console.log('laravel-mix-' + this.name() + ': ' + message);
    }
  }

  error(message) {
    console.error('laravel-mix-' + this.name() + ': ' + message);
  }

  mkdir(directory) {
    if (!fs.existsSync(directory)) {
      shell.mkdir('-p', directory);
    }
  }

  clearDir(directory) {
    if (fs.existsSync(directory)) {
      fs.readdir(directory, (err, files) => {
        if (err) throw err;

        for (let file of files) {
          fs.unlink(path.join(directory, file), err => {
            if (err) throw err;
          });
        }
      });
    }
  }

}

mix.extend('favicon', new Favicon());