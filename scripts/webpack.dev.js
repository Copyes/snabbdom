const os = require('os')
const path = require('path')
const webpack = require("webpack")
const HtmlWebpackPlugin = require('html-webpack-plugin')
// node.js 命令行框架 yargs,获取里面的配置项信息
const argv = require('yargs').argv
const env = argv.env
const args = argv._
// 你的lib的名字，可以考虑可配
let libraryName = args[0]
// webpack配置
const config = {
	// 入口文件
    entry: path.resolve(__dirname , `../src/${libraryName}.js`),
    devServer: {
        contentBase: '../dist'
    },
	// 出口文件
	output: {
		path: path.resolve(__dirname, '../dist'),
		publicPath: '/',
        filename: 'dist/[name].js',
        chunkFilename: 'dist/[id].js'
	},
	// 指定了每个文件在处理过程中将被哪些模块处理,因为我们是es6写的，所以用babel,eslint也可以打开
	module: {	
		rules: [
			{
				test: /(\.jsx|\.js)$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			}
		]
    },
    plugins: [
        // 将js插入到对应的html中
        new HtmlWebpackPlugin({
            filename: '../dist/index.html', // 生成的html存放路径，相对于publicPath
            template: './index.html', // html模板路径,
            inject: 'body' //js插入的位置，true/'head'/'body'/false
        })
    ],
	// 解析
	resolve: {
		modules: [path.resolve(__dirname, '../src')], // 告诉 webpack 解析模块时应该搜索的目录。
		extensions: ['.json', '.js']  // 自动解析确定的扩展。默认值为：
	}
}

module.exports = config