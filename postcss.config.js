module.exports = {
	plugins: {
		'postcss-px-to-viewport-8-plugin': {
			viewportWidth: 375, // 视窗的宽度，对应的是我们设计稿的宽度
			viewportHeight: 667, // 视窗的高度，根据750设备的宽度来指定，一般指定1334，也可以不配置
			unitPrecision: 5, // 指定`px`转换为视窗单位值的小数位数
			viewportUnit: 'vw', // 指定需要转换成的视窗单位，建议使用vw
			selectorBlackList: ['.ignore', '.hairlines'], // 指定不转换为视窗单位的类
			minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位
			mediaQuery: false, // 允许在媒体查询中转换`px`
			exclude: /(\/|\\)(node_modules)(\/|\\)/, // 排除node_modules文件夹中的文件
		},
	},
};
