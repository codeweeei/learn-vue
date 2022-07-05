import { generate } from './generate';
import { parserHTML } from './parser';

// html词法解析（开始标签、结束标签、属性和文本） -> ast语法树（用来描述html语法）-> code字符串 -> render函数 -> vdom -> 生成真实dom
export function compilerToFunction(template) {
	// 获取根ast语法树
	let root = parserHTML(template);
	// generate 生成code 用来生成render函数
	let code = generate(root);
	let render = new Function(`with(this){return ${code}}`); // code中可能使用到数据，数据在vm上
	return render;
}
