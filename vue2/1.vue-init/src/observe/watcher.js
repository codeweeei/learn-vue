import { popTarget, pushTarget } from './dep';
import { queueWatcher } from './scheduler';

// vm,updateComponent,function () {console.log('更新成功');},true
let id = 0;

// 每个组件渲染的时候都会对应一个watcher
export class Watcher {
	constructor(vm, exprOrFn, cb, options) {
		this.vm = vm;
		// exprOrFn值为字符串（watch）或updateComponent方法
		this.exprOrFn = exprOrFn;
		this.user = !!options.user; // 表示是否是用户watcher
		this.cb = cb;
		this.options = options;
		this.id = id++;
		this.deps = []; // 依赖的属性
		this.depsId = new Set();
		if (typeof exprOrFn === 'string') {
			this.getter = function () {
				// 当数据取值时，会进行依赖收集
				// 注意 age.n 嵌套的情况：vm['age.n'] -> vm['age']['n']
				let path = exprOrFn.split('.');
				let obj = vm;
				for (let i = 0; i < path.length; i++) {
					obj = obj[path[i]];
				}
				return obj;
			};
		} else {
			this.getter = exprOrFn;
		}
		// 默认初始化取值(第一次取值)
		this.value = this.get();
	}
	// 用户更新数据时重新调用即可
	get() {
		// 一个watcher可以监听多个属性，一个属性可以对应多个watcher；因此使用dep来收集依赖
		pushTarget(this);
		const value = this.getter();
		popTarget();
		return value;
	}
	// 更新视图
	update() {
		// 多次调用update时，可以先将watcher缓存下来，等会一起更新
		queueWatcher(this);
	}
	run() {
		let newValue = this.get();
		let oldValue = this.value;
		this.value = newValue; // 为了保证下一次更新时
		if (this.user) {
			// 用户watcher
			this.cb.call(this.vm, newValue, oldValue);
		}
	}
	addDep(dep) {
		let id = dep.id;
		if (!this.depsId.has(id)) {
			this.depsId.add(id);
			this.deps.push(dep);
			dep.addSub(this);
		}
	}
}
