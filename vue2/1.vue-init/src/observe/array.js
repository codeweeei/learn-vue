const oldArrayPrototype = Array.prototype;
export const arrayMethods = Object.create(oldArrayPrototype);

let methods = ['push', 'shift', 'unshift', 'pop', 'reverse', 'sort', 'splice'];

methods.forEach((method) => {
	// 重写上述数组方法
	arrayMethods[method] = function (...args) {
		oldArrayPrototype[method].call(this, ...args);
		let inserted;
		// 注意数组新增引用类型数据时，需要对新增的数据进行劫持（push、unshift和splice）
		switch (method) {
			case 'push':
			case 'unshift':
				inserted = args;
				break;
			case 'splice':
				inserted = args.slice(2);
				break;
			default:
				break;
		}
		if (inserted) this.__ob__.observeArray(inserted);
	};
});
