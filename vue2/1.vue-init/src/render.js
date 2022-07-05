import { createElement, createTextElement } from './vnode/index';

export function renderMixin(Vue) {
	Vue.prototype._c = function () {
		// 生成vnode
		return createElement(this, ...arguments);
	};
	Vue.prototype._v = function (text) {
		// 生成vnode
		return createTextElement(this, text);
	};
	Vue.prototype._s = function (val) {
		if (typeof val === 'object') return JSON.stringify(val);
		return val;
	};
	Vue.prototype._render = function () {
		const vm = this;
		// 取出render函数（根据模板解析出来或者用户自己写的）
		let render = vm.$options.render;
		let vnode = render.call(vm);
		return vnode;
	};
}
