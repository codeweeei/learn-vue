/**
 * 比较新旧节点，如果旧节点是真实节点，则直接删除旧节点，将新节点
 * @param {*} oldVnode 旧节点
 * @param {*} vnode 新节点
 */
export function patch(oldVnode, vnode) {
	if (oldVnode.nodeType === 1) {
		// 真实元素
		const parentElm = oldVnode.parentNode;
		let elm = creatElm(vnode); // 根据虚拟节点，创建真实节点
		parentElm.insertBefore(elm, oldVnode.nextSibling); // 将真实节点插入至父元素下
		// 删除旧的真实元素
		parentElm.removeChild(oldVnode);
		return elm;
	}
}

function creatElm(vnode) {
	let { tag, data, children, text, vm } = vnode;
	if (typeof tag === 'string') {
		// 创建元素标签
		vnode.el = document.createElement(tag); // 虚拟节点的el属性指向真实节点
		children.forEach((child) => {
			// 将children遍历生成真实节点并添加至虚拟节点生成的真实节点
			vnode.el.appendChild(creatElm(child));
		});
	} else {
		// 创建文本标签
		vnode.el = document.createTextNode(text);
	}
	return vnode.el;
}
