import { nextTick } from '../utils';

// watcher调度相关
let queue = [];
let has = {};
let pending = false; // 防抖作用

function flushSchedulerQueue() {
	for (let i = 0; i < queue.length; i++) {
		queue[i].run();
	}
	queue = [];
	has = {};
	pending = false;
}

export function queueWatcher(watcher) {
	// watcher 去重
	let id = watcher.id;
	// has[id] == null
	if (has[id] === undefined || has[id] === null) {
		queue.push(watcher);
		has[id] = true;
		// 开启更新（防抖）
		if (!pending) {
			// 注意异步执行顺序 微任务
			nextTick(flushSchedulerQueue);
			pending = true;
		}
	}
}
