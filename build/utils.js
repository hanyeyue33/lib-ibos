var path = require('path')
var config = require('../config')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var fs = require("fs-extra")
var chalk = require('chalk')
var babel = require('babel-core')

exports.assetsPath = function (_path) {
  var assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory
  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  var cssLoader = {
    loader: 'css-loader',
    options: {
      minimize: process.env.NODE_ENV === 'production',
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    var loaders = [cssLoader]
    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
      //服务端渲染使用
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'style-loader'
      })
    } else {
      return ['style-loader'].concat(loaders)
    }
  }

  // http://vuejs.github.io/vue-loader/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  var output = []
  var loaders = exports.cssLoaders(options)
  for (var extension in loaders) {
    var loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }
  return output
}

//处理对应的文件
exports.dealFiles = function (dir,fileType,cb) {

    if (!fs.existsSync(dir)) {
        console.log(chalk.red("Can't find this directory : " + dir));
        return;
    }

    fs.readdir(dir,function (err, files) {
        if(err){
            console.log(chalk.red(err))
            return;
        }

        files.forEach(file => {
            const fileDir = path.join(dir,file);
            fs.stat(fileDir,(err,stats) => {
                if(err) throw err;

                //是文件就执行对应的方法
                if(stats.isFile()){
                    if(fileType.test(file)){
                        cb && cb(fileDir)
                        // console.log(file+ '：我被执行啦')
                    }
                    // console.log(chalk.blue("我是文件: "+file))
                    // 如果是目录就继续遍历文件
                }else if(stats.isDirectory()){
                    exports.dealFiles(fileDir,fileType,cb)
                    // console.log(chalk.yellow("我是目录 "+fileDir))
                }
            })
        })
    })
}


exports.babelCompile = function (file,outputDir,option) {
    // babel 编译
    babel.transformFile(file, option, function (err, result) {
        if (err) throw err
        // console.log(result.options.sourceFileName)

        const outputFile = path.relative(outputDir,file)
        // 把编译完的结果输出到对应目录
        fs.outputFile(outputFile, result.code, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("Build complete!");
        });
    })
}