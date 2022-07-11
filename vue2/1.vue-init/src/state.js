import { isFunction } from './utils';
import { observe } from './observe/index';
import { Watcher } from './observe/watcher';

export function stateMixin(Vue) {
	Vue.prototype.$watch = function (key, handler, options = {}) {
		options.user = true; // 用户watcher，与渲染watcher区分开
		new Watcher(this, key, handler, options);
	};
}
// 处理 new Vue({...})中传入的props、data、computed、watch等
export function initState(vm) {
	const opts = vm.$options;
	if (opts.data) {
		// 初始化data
		initData(vm);
	}
	if (opts.watch) {
		// 初始化 watche
		initWatch(vm, opts.watch);
	}
}

// 将data代理至vm实例上
function proxyDataToVm(vm, source, key) {
	Object.defineProperty(vm, key, {
		get() {
			return vm[source][key];
		},
		set(val) {
			vm[source][key] = val;
		},
	});
}

// 处理 data
function initData(vm) {
	// data可传入函数（返回对象）或者对象，最终取到对象（注意函数内部的this指向）
	let data = vm.$options.data;
	// 关联 data（响应式数据getter和setter） 和 vm._data
	vm._data = data = isFunction(data) ? data.call(vm) : data;
	// 代理data至vm
	for (let key in data) {
		proxyDataToVm(vm, '_data', key);
	}
	// 观测data（将其转换为响应式数据）
	observe(data);
}

// 处理 watch
function initWatch(vm, watch) {
	// watch需要为对象
	Object.keys(watch).forEach((key) => {
		let handler = watch[key];
		if (Array.isArray(handler)) {
			for (let i = 0; i < handler.length; i++) {
				createWatcher(vm, key, handler[i]);
			}
		} else {
			createWatcher(vm, key, handler);
		}
	});
}
// 创建watcher
function createWatcher(vm, key, handler) {
	return vm.$watch(key, handler);
}
