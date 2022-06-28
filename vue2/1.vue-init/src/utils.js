// 工具库

export function isFunction(val) {
	return typeof val === 'function';
}

export function isObject(val) {
	return Object.prototype.toString.call(val) === '[object Object]';
}
