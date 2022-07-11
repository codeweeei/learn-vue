import { Watcher } from './observe/watcher';
import { nextTick } from './utils';
import { patch } from './vnode/patch';

export function lifecycleMixin(Vue) {
	Vue.prototype._update = function (vnode) {
		// 初始化及更新
		const vm = this;
		vm.$el = patch(vm.$el, vnode);
	};
	Vue.prototype.$nextTick = nextTick;
}

// 挂载vm组件至el上
export function mountComponent(vm, el) {
	// 调用render方法，生成虚拟DOM再渲染成真实DOM替换掉页面的内容
	let updateComponent = () => {
		// 后续更新可以调用updateComponent方法
		vm._update(vm._render());
	};
	// 观察者模式
	new Watcher(
		vm,
		updateComponent,
		function () {
			console.log('更新成功');
		},
		true // true 表示渲染watcher
	);
}
