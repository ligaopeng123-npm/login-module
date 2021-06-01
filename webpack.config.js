const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NODE_ENV = process.env.NODE_ENV.trimEnd();

module.exports = {
	mode: 'development', // 环境管理
	entry: './src/index.ts',
	devtool: 'inline-source-map', // source map
	resolve: {
		extensions: ['.tsx', '.ts', '.js'],
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
			{
				test: /\.(gif|png|jpe|jpg?g)$/i,
				loader: "url-loader", // url-loader 依赖于  file-loader 要使用url-loader必须安装file-loader
				options: {
					name: "[name].[ext]", // 文件名.hash.文件扩展名 默认格式为[hash].[ext]，没有文件名
					limit: 1024 * 8, // 将小于8KB的图片转换成base64的格式
					outputPath: "assets/", // 为你的文件配置自定义 output 输出目录 ; 用来处理图片路径问题
					publicPath: "assets/", // 为你的文件配置自定义 public 发布目录 ; 用来处理图片路径问题
				},
			},
			{
				test: /\.svg/,
				loader: "url-loader", // url-loader 依赖于  file-loader 要使用url-loader必须安装file-loader
				options: {
					name: "[name].[ext]", // 文件名.hash.文件扩展名 默认格式为[hash].[ext]，没有文件名
					limit: 1024 * 8, // 将小于8KB的图片转换成base64的格式
					outputPath: "iconfont/", // 为你的文件配置自定义 output 输出目录 ; 用来处理图片路径问题
					publicPath: "assets/", // 为你的文件配置自定义 public 发布目录 ; 用来处理图片路径问题
				},
			},
		],
	},
	plugins: [
		new HtmlWebpackPlugin({
			title: '登录',
			template: "./src/index.html"
		}),
	],
	experiments: {
		outputModule: true // 让模块可以使用import导入使用
	},
	output: {
		filename: 'main.js',
		libraryTarget: 'module', //module es6模式 umd模式
		path: path.resolve(__dirname, 'dist'),
		clean: true, // 清理冗余文件
	},
	devtool: NODE_ENV == 'production' ? false : 'inline-source-map',
	target: 'web',
	devServer: {
		contentBase: path.resolve(__dirname, 'dist'),
		// 压缩代码 先注释
		compress: NODE_ENV == 'production',
		// 端口
		port: 5000,
		// 打开浏览器
		open: true
	}
};