let id = 0;

export class Dep {
	constructor() {
		this.id = id++; // 保证每个dep的唯一性
		this.subs = []; // 用来存放watcher
	}
	// 向 watcher 中添加 dep
	depend() {
		if (Dep.target) {
			Dep.target.addDep(this);
		}
	}
	addSub(watcher) {
		this.subs.push(watcher);
	}
	// 通知更新视图
	notify() {
		this.subs.forEach((watcher) => {
			watcher.update();
		});
	}
}

/**
 * 当前正在执行的 watcher，同一时间只会有一个 watcher 在执行
 * Dep.target = 当前正在执行的 watcher
 * 通过调用 pushTarget 方法完成赋值，调用 popTarget 方法完成重置（null)
 */

Dep.target = null;
export function pushTarget(watcher) {
	Dep.target = watcher;
}
export function popTarget() {
	Dep.target = null;
}
