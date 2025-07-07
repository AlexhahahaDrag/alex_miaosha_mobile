// postcss.config.js
module.exports = {
	plugins: {
		'postcss-px-to-viewport': {
			viewportWidth: 375, // 视窗的宽度，对应的是我们设计稿的宽度
			// 其他配置项根据需要添加，完整配置可以查看插件文档
		},
	},
};
