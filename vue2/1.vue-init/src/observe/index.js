// 观测data，进行数据劫持
import { isObject } from '../utils';
import { arrayMethods } from './array';

// 观测者类：检测数据的变化（类存在类型）
export class Observe {
	constructor(data) {
		// 将观测实例作为属性保存至观测的对象，注意该属性不能被枚举，否则会陷入this.walk(data)中的死循环
		Object.defineProperty(data, '__ob__', {
			value: this,
			enumerable: false,
		});
		// 对 data 中的所有属性进行劫持（注意数组的递归监控）
		if (Array.isArray(data)) {
			data._proto_ = arrayMethods;
			// 对数组中的引用类型进行劫持
			this.observeArray(data);
		} else {
			this.walk(data);
		}
	}
	observeArray(data) {
		data.forEach((item) => observe(item));
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
	if (data.__ob__) return;
	return new Observe(data);
}
