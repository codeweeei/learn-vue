// 观测data，进行数据劫持
import { isObject } from '../utils';

// 观测者类：检测数据的变化（类存在类型）
export class Observe {
	constructor(data) {
		// 对 data 中的所有属性进行劫持
		this.walk(data);
	}
	walk(data) {
		Object.keys(data).forEach((key) => {
			defineReactive(data, key, data[key]);
		});
	}
}
function defineReactive(data, key, val) {
	// val可能也是对象，因此需要递归处理嵌套val里的对象，劫持深层val里的对象
	observe(val);
	Object.defineProperty(data, key, {
		get() {
			return val;
		},
		set(newVal) {
			// data中某个属性赋值给一个新对象时也得劫持 vm._data.a = {b:1}
			observe(newVal);
			val = newVal;
		},
	});
}

export function observe(data) {
	// 判断是否是对象
	if (!isObject(data)) return;
	return new Observe(data);
}
