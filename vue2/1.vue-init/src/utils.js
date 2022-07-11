// 工具库

export function isFunction(val) {
	return typeof val === 'function';
}

export function isObject(val) {
	return typeof val === 'object';
	// return Object.prototype.toString.call(val) === '[object Object]';
}

// Vue数据异步更新原理
let callbackFn = [];
let watting = false; // 防抖
function flushCallbacks() {
	for (let i = 0; i < callbackFn.length; i++) {
		callbackFn[i]();
	}
	callbackFn = [];
	watting = false;
}
export function nextTick(callback) {
	callbackFn.push(callback);
	if (!watting) {
		// 这里异步vue2中考虑了兼容性问题,这里我们就不考虑浏览器兼容性问题了
		Promise.resolve().then(flushCallbacks);
		watting = true;
	}
}
