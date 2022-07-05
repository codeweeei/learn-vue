import { patch } from './vnode/patch';

export function lifecycleMixin(Vue) {
	Vue.prototype._update = function (vnode) {
		// 初始化及更新
		const vm = this;
		patch(vm.$el, vnode);
	};
}

// 挂载vm组件至el上
export function mountComponent(vm, el) {
	// 调用render方法，生成虚拟DOM再渲染成真实DOM替换掉页面的内容
	let undateComponent = () => {
		// 后续更新可以调用updateComponent方法
		vm._update(vm._render());
	};
	undateComponent();
}
