const path = require('path');
const fs = require('fs');
const postcss = require('postcss');
const CompressionWebpackPlugin = require("compression-webpack-plugin"); // 开启gzip压缩， 按需引用
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin; // 打包分析
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i; // 开启gzip压缩， 按需写入
const resolve= dir => path.join(__dirname, dir);
const IS_PROD= process.env.NODE_ENV === 'production';

// 处理less全局变量
// function getLessVaribles(fileUrl, list = {}) {
//     if (!fs.existsSync(fileUrl)) return {};
//     let lessFile = fs.readFileSync(fileUrl, 'utf8');
//     return postcss.parse(lessFile).nodes.reduce((acc, curr) => {
//       acc[`${curr.name.replace(/\:/, '')}`] = `${curr.params}`;
//       return acc;
//     }, list);
//   }
// const modifyVars = getLessVaribles(resolve('./src/assets/less/variables.less'));


module.exports = {
    // 项目打包是就会自动在src前面补上publicPath 的值
    publicPath: process.env.NODE_ENV === 'production' ? '/' : '/', // 公共路径
    // publicPath: '/',

    outputDir: 'dist',

    assetsDir: 'static',

    indexPath: 'index.html',

    filenameHashing: true,

    pages: undefined,

    // 设置为 true 后你就可以在 Vue 组件中使用 template 选项了
    runtimeCompiler: false,
 
    transpileDependencies: [],

    productionSourceMap: false,

    crossorigin: undefined,

    integrity: false,

    parallel: require('os').cpus().length > 1,
    
    chainWebpack: config => {
        // 移除prefetch插件
        config.plugins.delete('prefetch');

        config.plugins.delete('preload');

        // 压缩代码
        config.optimization.minimize(true);

        // 修复热更新
        config.resolve.symlinks(true);

        // 添加别名
        config.resolve.alias 
          .set('@', resolve('src'))
          .set('@assets', resolve('src/assets'))
          .set('@components', resolve('src/components'))
          .set('@views', resolve('src/views'))

        // 压缩图片
        // 需要npm i -D image-webpack-loader
        config.module
          .rule("images")
          .use("image-webpack-loader")
          .loader("image-webpack-loader")
          .options({
            mozjpeg: { progressive: true, quality: 65 },
            optipng: { enabled: false },
            pngquant: { quality: [0.65, 0.9], speed: 4 },
            gifsicle: { interlaced: false }
            // webp: { quality: 75 }
          });
          
          // 配置less全局变量、混合和函数
          // npm i sass-resources-loader --save-dev
          const oneOfsMap = config.module.rule('less').oneOfs.store
          oneOfsMap.forEach(item => {
            item
              .use('sass-resources-loader')
              .loader('sass-resources-loader')
              .options({
                // resources: './src/assets/less/variables.less',
                resources: [ './src/assets/styles/less/variables.less', 
                             './src/assets/styles/less/mixins.less', 
                             './src/assets/styles/less/functions.less'
                          ]
              })
              .end()
          })
          
          // 生产环境下
          config.when(IS_PROD, config => {
            // 移除console
            config.optimization.minimizer('terser').tap(options => {
              options[0].terserOptions.compress.drop_console = true;
              return options;
            })
             // 打包分析
            config.plugin("webpack-report").use(BundleAnalyzerPlugin, [
              {
                analyzerMode: "static"
              }
            ]);
            // splitChunks 单独打包第三方模块
            config.optimization.delete("splitChunks");
          })
    },

    configureWebpack: config => {
        const plugins = [];
        if (IS_PROD) {
            // 开启 gzip 压缩
            // 需要 npm i -D compression-webpack-plugin
            new CompressionWebpackPlugin({
                filename: "[path].gz[query]",
                algorithm: "gzip",
                test: productionGzipExtensions,
                threshold: 10240,
                minRatio: 0.8
            });

            // 利用splitChunks单独打包第三方模块
            config.optimization = {
                splitChunks: {
                  cacheGroups: {
                    common: {
                      name: "chunk-common",
                      chunks: "initial",
                      minChunks: 2,
                      maxInitialRequests: 5,
                      minSize: 0,
                      priority: 1,
                      reuseExistingChunk: true,
                      enforce: true
                    },
                    vendors: {
                      name: "chunk-vendors",
                      test: /[\\/]node_modules[\\/]/,
                      chunks: "initial",
                      priority: 2,
                      reuseExistingChunk: true,
                      enforce: true
                    }
                    // elementUI: {
                    //   name: "chunk-elementui",
                    //   test: /[\\/]node_modules[\\/]element-ui[\\/]/,
                    //   chunks: "all",
                    //   priority: 3,
                    //   reuseExistingChunk: true,
                    //   enforce: true
                    // },
                    // echarts: {
                    //   name: "chunk-echarts",
                    //   test: /[\\/]node_modules[\\/](vue-)?echarts[\\/]/,
                    //   chunks: "all",
                    //   priority: 4,
                    //   reuseExistingChunk: true,
                    //   enforce: true
                    // }
                  }
              }
          }
        config.plugins = [...config.plugins, ...plugins];
      }
    },

    lintOnSave: 'default',
    devServer: {
        open: false, // 是否打开浏览器
        host: '0.0.0.0',
        port: '8888',
        https: false,
        hotOnly: true,
        overlay: { // 让浏览器同时显示警告和错误
            warnings: true,
            errors: true
        },
        proxy: {
            '/api': {
                target: 'http://www.example.org',
                ws: true,
                changeOrgin: true, // 开启代理，在本地创建一个虚拟服务器
                pathRewrite: {
                    '^/api': '/api',
                    '^/api': '/'
                }
            }
        }
    },

    // chainWebpack: Function,
    css: {
        // requireModuleExtension: true,

        extract: IS_PROD, // 生产环境CSS单独打包

        // sourceMap: false,

        loaderOptions: {
            // css: {
            //     // 这里的选项会将消息传递给css-load
            // },
            // postcss: {
            //     // 这里的选项会传递给postcss-loaders
            // }
            // less: {
            //     modifyVars,
            //     javascriptEnabled: true
            // }
        }
    },
    transpileDependencies: []
}