import { initState } from './state';
import { compilerToFunction } from './compiler/index';
import { mountComponent } from './lifecycle';

// 初始化vue
export function initMixin(Vue) {
	// 初始化state
	Vue.prototype._init = function (options) {
		const vm = this;
		// 将options放置vm的$options上
		vm.$options = options;
		// 对数据进行初始化
		initState(vm);

		// 处理el，将数据挂载在el指向的模板上
		if (vm.$options.el) {
			vm.$mount(vm.$options.el);
		}
	};
	Vue.prototype.$mount = function (el) {
		// 获取模板
		const vm = this;
		const options = vm.$options;
		el = document.querySelector(el);
		vm.$el = el;
		// 将模板转换为渲染函数（render），用于创建虚拟节点，增加渲染模板的性能
		if (!options.render) {
			// 用户没有传入render函数时使用template模板
			let template = options.template;
			if (!template && el) {
				// 用户没有传入template模板时将el作为template
				template = el.outerHTML; // outerHTML 不带空格
				// 将模板转为render渲染函数
				let render = compilerToFunction(template);
				options.render = render;
			}
		}
		// 将vm组件挂载在el上
		mountComponent(vm, el);
	};
}
