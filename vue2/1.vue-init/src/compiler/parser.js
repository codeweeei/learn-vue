// 模板编译
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`; // 标签名
const qnameCapture = `((?:${ncname}\\:)?${ncname})`; //  用来获取的标签名的 match后的索引为1的
const startTagOpen = new RegExp(`^<${qnameCapture}`); // 匹配开始标签的：<div
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`); // 匹配闭合标签的
// 用来匹配属性的，可匹配 a="xxx" | a='xxx' | a=xxx
const attribute =
	/^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
const startTagClose = /^\s*(\/?)>/; //  匹配标签闭合  > 或 />

// 将解析后的结果，组装成一个树结构（利用栈结构的入栈和出栈最终生成一个树节点root对象）
function createAstElement(tagName, attrs) {
	return {
		tagName,
		type: 1,
		children: [],
		parent: null,
		attrs,
	};
}

let root = null; // 根节点
let stack = []; // 树结构
// 解析开始标签：获取开始标签名和属性键值对
function start(tagName, attributes) {
	// 循环引用
	let parent = stack[stack.length - 1];
	let element = createAstElement(tagName, attributes);
	element.parent = parent;
	if (parent) {
		parent.children.push(element);
	}
	if (!root) {
		root = element;
	}
	stack.push(element);
}
// 解析结束标签：获取结束标签名
function end(tagName) {
	// 弹出栈中最后一个
	let element = stack.pop();
	if (tagName !== element.tagName) {
		throw new Error('标签有误，没有闭合');
	}
}
// 解析文本标签：获取标签中的文本
function chars(text) {
	// 去除文本中的空格
	text = text.replace(/\s/g, '');
	let parent = stack[stack.length - 1];
	if (text) {
		parent.children.push({
			type: 3,
			text,
		});
	}
}

// 解析模板字符串，生成AST树 <div id="app">{{name}}</div>
export function parserHTML(html) {
	// 截取字符串（删除匹配完的部分）
	function advance(len) {
		html = html.substring(len);
	}
	// 解析开始标签：获取开始标签名和属性键值对数组
	function parseStartTag() {
		const start = html.match(startTagOpen);
		if (start) {
			const match = {
				tagName: start[1],
				attrs: [],
			};
			advance(start[0].length); // 截去<div html -> id="app">{{name}}</div>
			// 匹配属性：没有遇到>或/>时并且可以匹配到属性时将匹配到的属性名和值保存在attrs
			let end; // 匹配闭合标签符号
			let attr; // 匹配属性
			while (
				!(end = html.match(startTagClose)) &&
				(attr = html.match(attribute))
			) {
				match.attrs.push({
					name: attr[1],
					value: attr[3] || attr[4] || attr[5],
				});
				// 截去匹配的属性等式: id="app" -> >{{name}}</div>
				advance(attr[0].length);
			}
			// 截去匹配到的开始标签结束的>符号 -> {{name}}</div>
			if (end) advance(end[0].length);
			return match;
		}
		return false;
	}
	// 解析结束标签：获取结束标签名
	function parseEndTag() {
		const end = html.match(endTag);
		if (end) {
			advance(end[0].length);
			return end[1];
		}
		return false;
	}
	// 每解析一部分就删除解析完的那部分
	while (html) {
		let textEnd = html.indexOf('<');
		if (textEnd === 0) {
			// 解析开始标签：获取标签名和属性键值对数组
			const startTagMatch = parseStartTag();
			if (startTagMatch) {
				start(startTagMatch.tagName, startTagMatch.attrs);
				continue;
			}
			// 解析结束标签：获取结束标签名
			const endTagMatch = parseEndTag();
			if (endTagMatch) {
				end(endTagMatch);
			}
		}
		let text;
		if (textEnd > 0) {
			// {{name}}</div>
			text = html.substring(0, textEnd); // {{name}}
		}
		if (text) {
			chars(text);
			advance(text.length); // </div>
		}
	}
	return root;
}
