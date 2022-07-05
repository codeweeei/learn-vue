(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

	// 工具库
	function isFunction(val) {
	  return typeof val === 'function';
	}
	function isObject(val) {
	  return Object.prototype.toString.call(val) === '[object Object]';
	}

	function _typeof(obj) {
	  "@babel/helpers - typeof";

	  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
	    return typeof obj;
	  } : function (obj) {
	    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	  }, _typeof(obj);
	}

	function _classCallCheck(instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	}

	function _defineProperties(target, props) {
	  for (var i = 0; i < props.length; i++) {
	    var descriptor = props[i];
	    descriptor.enumerable = descriptor.enumerable || false;
	    descriptor.configurable = true;
	    if ("value" in descriptor) descriptor.writable = true;
	    Object.defineProperty(target, descriptor.key, descriptor);
	  }
	}

	function _createClass(Constructor, protoProps, staticProps) {
	  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
	  if (staticProps) _defineProperties(Constructor, staticProps);
	  Object.defineProperty(Constructor, "prototype", {
	    writable: false
	  });
	  return Constructor;
	}

	var oldArrayPrototype = Array.prototype;
	var arrayMethods = Object.create(oldArrayPrototype);
	var methods = ['push', 'shift', 'unshift', 'pop', 'reverse', 'sort', 'splice'];
	methods.forEach(function (method) {
	  // 重写上述数组方法
	  arrayMethods[method] = function () {
	    var _oldArrayPrototype$me;

	    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }

	    (_oldArrayPrototype$me = oldArrayPrototype[method]).call.apply(_oldArrayPrototype$me, [this].concat(args));

	    var inserted; // 注意数组新增引用类型数据时，需要对新增的数据进行劫持（push、unshift和splice）

	    switch (method) {
	      case 'push':
	      case 'unshift':
	        inserted = args;
	        break;

	      case 'splice':
	        inserted = args.slice(2);
	        break;
	    }

	    if (inserted) this.__ob__.observeArray(inserted);
	  };
	});

	var Observe = /*#__PURE__*/function () {
	  function Observe(data) {
	    _classCallCheck(this, Observe);

	    // 将观测实例作为属性保存至观测的对象，注意该属性不能被枚举，否则会陷入this.walk(data)中的死循环
	    Object.defineProperty(data, '__ob__', {
	      value: this,
	      enumerable: false
	    }); // 对 data 中的所有属性进行劫持（注意数组的递归监控）

	    if (Array.isArray(data)) {
	      data._proto_ = arrayMethods; // 对数组中的引用类型进行劫持

	      this.observeArray(data);
	    } else {
	      this.walk(data);
	    }
	  }

	  _createClass(Observe, [{
	    key: "observeArray",
	    value: function observeArray(data) {
	      data.forEach(function (item) {
	        return observe(item);
	      });
	    }
	  }, {
	    key: "walk",
	    value: function walk(data) {
	      Object.keys(data).forEach(function (key) {
	        defineReactive(data, key, data[key]);
	      });
	    }
	  }]);

	  return Observe;
	}();

	function defineReactive(data, key, val) {
	  // val可能也是对象，因此需要递归处理嵌套val里的对象，劫持深层val里的对象
	  observe(val);
	  Object.defineProperty(data, key, {
	    get: function get() {
	      return val;
	    },
	    set: function set(newVal) {
	      // data中某个属性赋值给一个新对象时也得劫持 vm._data.a = {b:1}
	      observe(newVal);
	      val = newVal;
	    }
	  });
	}

	function observe(data) {
	  // 判断是否是对象
	  if (!isObject(data)) return;
	  if (data.__ob__) return;
	  return new Observe(data);
	}

	function initState(vm) {
	  var opts = vm.$options;

	  if (opts.data) {
	    initData(vm);
	  }
	} // 将data代理至vm实例上

	function proxyDataToVm(vm, source, key) {
	  Object.defineProperty(vm, key, {
	    get: function get() {
	      return vm[source][key];
	    },
	    set: function set(val) {
	      vm[source][key] = val;
	    }
	  });
	} // 处理 data


	function initData(vm) {
	  // data可传入函数（返回对象）或者对象，最终取到对象（注意函数内部的this指向）
	  var data = vm.$options.data; // 关联 data（响应式数据getter和setter） 和 vm._data

	  vm._data = data = isFunction(data) ? data.call(vm) : data; // 代理data至vm

	  for (var key in data) {
	    proxyDataToVm(vm, '_data', key);
	  } // 观测data（将其转换为响应式数据）


	  observe(data);
	}

	var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // 匹配{{}}语法 {{aaaaa}}

	/**
	 * 将ast树中标签的属性数组拼接成字符串，注意属性值需要使用JSON.stringify进行修饰
	 * 注意 style属性 style="color:red;background:blue" 需要转成 style: {'color': 'red','background': 'blue'}
	 * @param {*} attrs [{name: 'id',value: 'app'},{name: 'a',value: '1'}]
	 * @return str 拼接的字符串 {id: 'app', a='1'}
	 */

	function genProps(attrs) {
	  var str = '';

	  for (var i = 0; i < attrs.length; i++) {
	    var attr = attrs[i];

	    if (attr.name === 'style') {
	      (function () {
	        var styleObj = {}; // 将color:red;background:blue -> {'color': 'red','background': 'blue'}

	        attr.value.replace(/([^:;]+)\:([^:;]+)/g, function () {
	          styleObj[arguments[1]] = arguments[2];
	        });
	        attr.value = styleObj;
	      })();
	    }

	    str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
	  } // str.slice(0, -1): 截取str第一个字符至倒数第一个字符，即去除最后的,


	  return "{".concat(str.slice(0, -1), "}");
	}

	function gen(el) {
	  if (el.type === 1) {
	    // 标签元素
	    return generate(el);
	  } else {
	    // 文本类型元素：注意hello{{xxx}}world语法里的xxx是变量，不应该保存为字符串
	    // hello{{xxx}}world -> 'hello' + xxx + 'world'
	    var text = el.text;

	    if (defaultTagRE.test(text)) {
	      var tokens = [];
	      var match; // 注意每次循环正则的exec方法前需要将正则的lastIndex重置为0

	      var lastIndex = defaultTagRE.lastIndex = 0;

	      while (match = defaultTagRE.exec(text)) {
	        // hello{{xxx}}world
	        var index = match.index; // 获取匹配到{{}}的索引

	        if (index > lastIndex) {
	          tokens.push(JSON.stringify(text.slice(lastIndex, index))); // 取出'hello'
	        } // 注意xxx中可能是对象，对象->字符串：[object object]；所以内部需要再处理一下xxx，这里我们约定使用_s()函数来处理


	        tokens.push("_s(".concat(match[1].trim(), ")"));
	        lastIndex = index + match[0].length; // match[0] -> {{xxx}}

	        if (lastIndex < text.length) {
	          tokens.push(JSON.stringify(text.slice(lastIndex))); // 取出'world'
	        }
	      }

	      return "_v(".concat(tokens.join('+'), ")");
	    } else {
	      return "_v(".concat(text, ")");
	    }
	  }
	}
	/**
	 * 获取子元素（type类型为1的）
	 * @param {*} el
	 */


	function genChildren(el) {
	  var children = el.children;

	  if (children) {
	    return children.map(function (c) {
	      return gen(c);
	    }).join(',');
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


	function generate(el) {
	  var children = genChildren(el);
	  var code = "_c('".concat(el.tagName, "',").concat(el.attrs.length ? genProps(el.attrs) : 'undefined').concat(children ? ",".concat(children) : '', ")");
	  return code;
	}

	// 模板编译
	var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 标签名

	var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //  用来获取的标签名的 match后的索引为1的

	var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配开始标签的：<div

	var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配闭合标签的
	// 用来匹配属性的，可匹配 a="xxx" | a='xxx' | a=xxx

	var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
	var startTagClose = /^\s*(\/?)>/; //  匹配标签闭合  > 或 />
	// 将解析后的结果，组装成一个树结构（利用栈结构的入栈和出栈最终生成一个树节点root对象）

	function createAstElement(tagName, attrs) {
	  return {
	    tagName: tagName,
	    type: 1,
	    children: [],
	    parent: null,
	    attrs: attrs
	  };
	}

	var root = null; // 根节点

	var stack = []; // 树结构
	// 解析开始标签：获取开始标签名和属性键值对

	function start(tagName, attributes) {
	  // 循环引用
	  var parent = stack[stack.length - 1];
	  var element = createAstElement(tagName, attributes);
	  element.parent = parent;

	  if (parent) {
	    parent.children.push(element);
	  }

	  if (!root) {
	    root = element;
	  }

	  stack.push(element);
	} // 解析结束标签：获取结束标签名


	function end(tagName) {
	  // 弹出栈中最后一个
	  var element = stack.pop();

	  if (tagName !== element.tagName) {
	    throw new Error('标签有误，没有闭合');
	  }
	} // 解析文本标签：获取标签中的文本


	function chars(text) {
	  // 去除文本中的空格
	  text = text.replace(/\s/g, '');
	  var parent = stack[stack.length - 1];

	  if (text) {
	    parent.children.push({
	      type: 3,
	      text: text
	    });
	  }
	} // 解析模板字符串，生成AST树 <div id="app">{{name}}</div>


	function parserHTML(html) {
	  // 截取字符串（删除匹配完的部分）
	  function advance(len) {
	    html = html.substring(len);
	  } // 解析开始标签：获取开始标签名和属性键值对数组


	  function parseStartTag() {
	    var start = html.match(startTagOpen);

	    if (start) {
	      var match = {
	        tagName: start[1],
	        attrs: []
	      };
	      advance(start[0].length); // 截去<div html -> id="app">{{name}}</div>
	      // 匹配属性：没有遇到>或/>时并且可以匹配到属性时将匹配到的属性名和值保存在attrs

	      var _end; // 匹配闭合标签符号


	      var attr; // 匹配属性

	      while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
	        match.attrs.push({
	          name: attr[1],
	          value: attr[3] || attr[4] || attr[5]
	        }); // 截去匹配的属性等式: id="app" -> >{{name}}</div>

	        advance(attr[0].length);
	      } // 截去匹配到的开始标签结束的>符号 -> {{name}}</div>


	      if (_end) advance(_end[0].length);
	      return match;
	    }

	    return false;
	  } // 解析结束标签：获取结束标签名


	  function parseEndTag() {
	    var end = html.match(endTag);

	    if (end) {
	      advance(end[0].length);
	      return end[1];
	    }

	    return false;
	  } // 每解析一部分就删除解析完的那部分


	  while (html) {
	    var textEnd = html.indexOf('<');

	    if (textEnd === 0) {
	      // 解析开始标签：获取标签名和属性键值对数组
	      var startTagMatch = parseStartTag();

	      if (startTagMatch) {
	        start(startTagMatch.tagName, startTagMatch.attrs);
	        continue;
	      } // 解析结束标签：获取结束标签名


	      var endTagMatch = parseEndTag();

	      if (endTagMatch) {
	        end(endTagMatch);
	      }
	    }

	    var text = void 0;

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

	function compilerToFunction(template) {
	  // 获取根ast语法树
	  var root = parserHTML(template); // generate 生成code 用来生成render函数

	  var code = generate(root);
	  var render = new Function("with(this){return ".concat(code, "}")); // code中可能使用到数据，数据在vm上

	  return render;
	}

	function patch(oldVnode, vnode) {
	  if (oldVnode.nodeType === 1) {
	    // 真实元素
	    var parentElm = oldVnode.parentNode;
	    var elm = creatElm(vnode); // 根据虚拟节点，创建真实节点

	    parentElm.insertBefore(elm, oldVnode.nextSibling); // 将真实节点插入至父元素下
	    // 删除旧的真实元素

	    parentElm.removeChild(oldVnode);
	  }
	}

	function creatElm(vnode) {
	  var tag = vnode.tag;
	      vnode.data;
	      var children = vnode.children,
	      text = vnode.text;
	      vnode.vm;

	  if (typeof vnode.tag === 'string') {
	    // 创建元素标签
	    vnode.el = document.createElement(tag); // 虚拟节点的el属性指向真实节点

	    children.forEach(function (child) {
	      // 将children遍历生成真实节点并添加至虚拟节点生成的真实节点
	      vnode.el.appendChild(creatElm(child));
	    });
	  } else {
	    // 创建文本标签
	    vnode.el = document.createTextNode(text);
	  }
	}

	function lifecycleMixin(Vue) {
	  Vue.prototype._update = function (vnode) {
	    // 初始化及更新
	    var vm = this;
	    patch(vm.$el, vnode);
	  };
	} // 挂载vm组件至el上

	function mountComponent(vm, el) {
	  // 调用render方法，生成虚拟DOM再渲染成真实DOM替换掉页面的内容
	  var undateComponent = function undateComponent() {
	    // 后续更新可以调用updateComponent方法
	    vm._update(vm._render());
	  };

	  undateComponent();
	}

	function initMixin(Vue) {
	  // 初始化state
	  Vue.prototype._init = function (options) {
	    var vm = this; // 将options放置vm的$options上

	    vm.$options = options; // 对数据进行初始化

	    initState(vm); // 处理el，将数据挂载在el指向的模板上

	    if (vm.$options.el) {
	      vm.$mount(vm.$options.el);
	    }
	  };

	  Vue.prototype.$mount = function (el) {
	    // 获取模板
	    var vm = this;
	    var options = vm.$options;
	    el = document.querySelector(el);
	    vm.$el = el; // 将模板转换为渲染函数（render），用于创建虚拟节点，增加渲染模板的性能

	    if (!options.render) {
	      // 用户没有传入render函数时使用template模板
	      var template = options.template;

	      if (!template && el) {
	        // 用户没有传入template模板时将el作为template
	        template = el.outerHTML; // outerHTML 不带空格
	        // 将模板转为render渲染函数

	        var render = compilerToFunction(template);
	        options.render = render;
	      }
	    } // 将vm组件挂载在el上


	    mountComponent(vm);
	  };
	}

	function createElement(vm, tag) {
	  var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	  for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
	    children[_key - 3] = arguments[_key];
	  }

	  return vnode(vm, tag, data, data.key, children, undefined);
	}
	function createTextElement(vm, text) {
	  return vnode(vm, undefined, undefined, undefined, undefined, text);
	}
	/**
	 * ! 生成虚拟DOM节点对象
	 * { tag,data,key,children,text }
	 * @param {*} vm
	 */

	function vnode(vm, tag, data, key, children, text) {
	  return {
	    vm: vm,
	    tag: tag,
	    data: data,
	    key: key,
	    children: children,
	    text: text
	  };
	}

	function renderMixin(Vue) {
	  Vue.prototype._c = function () {
	    // 生成vnode
	    return createElement.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
	  };

	  Vue.prototype._v = function (text) {
	    // 生成vnode
	    return createTextElement(this, text);
	  };

	  Vue.prototype._s = function (val) {
	    if (_typeof(val) === 'object') return JSON.stringify(val);
	    return val;
	  };

	  Vue.prototype._render = function () {
	    var vm = this; // 取出render函数（根据模板解析出来或者用户自己写的）

	    var render = vm.$options.render;
	    var vnode = render.call(vm);
	    return vnode;
	  };
	}

	function Vue(options) {
	  this._init(options);
	}

	initMixin(Vue); // _init

	renderMixin(Vue); // _render

	lifecycleMixin(Vue); // _update

	return Vue;

}));
//# sourceMappingURL=vue.js.map
