// 观测data，进行数据劫持
import { isObject } from '../utils';
import { arrayMethods } from './array';
import { Dep } from './dep';

// 观测者类：检测数据的变化（类存在类型）
export class Observe {
	constructor(data) {
		this.dep = new Dep(); // 数据可能是对象或数组
		// 将观测实例作为属性保存至观测的对象，注意该属性不能被枚举，否则会陷入this.walk(data)中的死循环
		Object.defineProperty(data, '__ob__', {
			value: this,
			enumerable: false,
		});
		// 对 data 中的所有属性进行劫持（注意数组的递归监控）
		if (Array.isArray(data)) {
			data.__proto__ = arrayMethods;
			// 对数组中的引用类型进行劫持
			this.observeArray(data);
		} else {
			this.walk(data);
		}
	}
	observeArray(data) {
		data.forEach((item) => observe(item));
	}
	// 遍历数据的所有属性，并调用defineReactive方法
	walk(data) {
		Object.keys(data).forEach((key) => {
			defineReactive(data, key, data[key]);
		});
	}
}
// 数组值为引用类型时，依赖收集
function dependArray(value) {
	for (let i = 0; i < value.length; i++) {
		let current = value[i]; // current是数组里面的数组 [[[[[]]]]]
		current.__ob__ && current.__ob__.dep.depend();
		if (Array.isArray(current)) {
			dependArray(current);
		}
	}
}

function defineReactive(data, key, val) {
	// val可能也是对象，因此需要递归处理嵌套val里的对象，劫持深层val里的对象
	let childOb = observe(val);
	//dep 存储依赖的变量，每个属性字段都有一个属于自己的dep，用于收集属于该字段的依赖
	let dep = new Dep();
	Object.defineProperty(data, key, {
		get() {
			//如果存在需要被收集的依赖
			if (Dep.target) {
				/* 将依赖收集到该属性的 dep 中 */
				dep.depend();
				if (childOb) {
					// childOb 可能是数组，可能是对象，对象本身也要收集依赖（$set）
					childOb.dep.depend();
					if (Array.isArray(val)) {
						// 嵌套数组也进行依赖收集
						dependArray(val);
					}
				}
			}
			return val;
		},
		set(newVal) {
			// data中某个属性赋值给一个新对象时也得劫持 vm._data.a = {b:1}
			if (newVal !== val) {
				observe(newVal);
				val = newVal;
				//在set方法中执行依赖器中的所有依赖
				dep.notify();
			}
		},
	});
}

export function observe(data) {
	// 判断是否是对象
	if (!isObject(data)) return;
	if (data.__ob__) return data.__ob__;
	return new Observe(data);
}
