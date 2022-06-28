import { isFunction } from './utils';
import { observe } from './observe/index';

// 处理 new Vue({...})中传入的props、data、computed、watch等
export function initState(vm) {
	const opts = vm.$options;
	if (opts.data) {
		initData(vm);
	}
}

// 处理 data
function initData(vm) {
	// data可传入函数（返回对象）或者对象，最终取到对象（注意函数内部的this指向）
	let data = vm.$options.data;
	// 关联 data（响应式数据getter和setter） 和 vm._data
	vm._data = data = isFunction(data) ? data.call(vm) : data;
	// 观测data（将其转换为响应式数据）
	observe(data);
}
