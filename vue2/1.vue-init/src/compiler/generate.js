const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配{{}}语法 {{aaaaa}}

/**
 * 将ast树中标签的属性数组拼接成字符串，注意属性值需要使用JSON.stringify进行修饰
 * 注意 style属性 style="color:red;background:blue" 需要转成 style: {'color': 'red','background': 'blue'}
 * @param {*} attrs [{name: 'id',value: 'app'},{name: 'a',value: '1'}]
 * @return str 拼接的字符串 {id: 'app', a='1'}
 */
function genProps(attrs) {
	let str = '';
	for (let i = 0; i < attrs.length; i++) {
		let attr = attrs[i];
		if (attr.name === 'style') {
			let styleObj = {};
			// 将color:red;background:blue -> {'color': 'red','background': 'blue'}
			attr.value.replace(/([^:;]+)\:([^:;]+)/g, function () {
				styleObj[arguments[1]] = arguments[2];
			});
			attr.value = styleObj;
		}
		str += `${attr.name}:${JSON.stringify(attr.value)},`;
	}
	// str.slice(0, -1): 截取str第一个字符至倒数第一个字符，即去除最后的,
	return `{${str.slice(0, -1)}}`;
}

function gen(el) {
	if (el.type === 1) {
		// 标签元素
		return generate(el);
	} else {
		// 文本类型元素：注意hello{{xxx}}world语法里的xxx是变量，不应该保存为字符串
		// hello{{xxx}}world -> 'hello' + xxx + 'world'
		let text = el.text;
		if (defaultTagRE.test(text)) {
			let tokens = [];
			let match;
			// 注意每次循环正则的exec方法前需要将正则的lastIndex重置为0
			let lastIndex = (defaultTagRE.lastIndex = 0);
			while ((match = defaultTagRE.exec(text))) {
				// hello{{xxx}}world
				let index = match.index; // 获取匹配到{{}}的索引
				if (index > lastIndex) {
					tokens.push(JSON.stringify(text.slice(lastIndex, index))); // 取出'hello'
				}
				// 注意xxx中可能是对象，对象->字符串：[object object]；所以内部需要再处理一下xxx，这里我们约定使用_s()函数来处理
				tokens.push(`_s(${match[1].trim()})`);
				lastIndex = index + match[0].length; // match[0] -> {{xxx}}
				if (lastIndex < text.length) {
					tokens.push(JSON.stringify(text.slice(lastIndex))); // 取出'world'
				}
			}
			return `_v(${tokens.join('+')})`;
		} else {
			return `_v(${text})`;
		}
	}
}
/**
 * 获取子元素（type类型为1的）
 * @param {*} el
 */
function genChildren(el) {
	let children = el.children;
	if (children) {
		return children.map((c) => gen(c)).join(',');
	}
	return false;
}

/**
 * ! 导出函数
 * 遍历ast树，将树先拼接成字符串，然后通过 new Funtion(字符串)来生成 render函数
 * _c(...)表示创建标签节点，_v(...)创建文本节点，_s(...)表示处理{{xxx}}里的xxx
 * <div id="app" style="color:red;background:blue">hello{{aaa}}world</div> 需要返回转成如下
 * _c('div',{id:"app",style:{"color":"red","background":"blue"}},_v("hello"+_s(aaa)+"world"))
 * @param {*} el
 * @return 字符串
 */

export function generate(el) {
	let children = genChildren(el);
	let code = `_c('${el.tagName}',${
		el.attrs.length ? genProps(el.attrs) : 'undefined'
	}${children ? `,${children}` : ''})`;
	return code;
}
