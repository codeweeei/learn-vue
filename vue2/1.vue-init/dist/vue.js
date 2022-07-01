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

	// 模板编译
	var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*"; // 标签名

	var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")"); //  用来获取的标签名的 match后的索引为1的

	var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 匹配开始标签的：<div

	var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配闭合标签的
	// 用来匹配属性的，可匹配 a="xxx" | a='xxx' | a=xxx

	var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
	var startTagClose = /^\s*(\/?)>/; //  匹配标签闭合  > 或 />
	// 解析开始标签：获取开始标签名和属性键值对

	function start(tagName, attributes) {
	  console.log('start：' + tagName);
	  console.log(attributes);
	} // 解析结束标签：获取结束标签名


	function end(tagName) {
	  console.log('end：' + tagName);
	} // 解析文本标签：获取标签中的文本


	function chars(text) {
	  console.log('text：' + text);
	} // html字符串解析成对应的tokens（词法分析）


	function compilerToFunction(template) {
	  // 解析模板字符串 <div id="app">{{name}}</div>
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
	  }

	  parserHTML(template);
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
	    el = document.querySelector(el); // 将模板转换为渲染函数（render），用于创建虚拟节点，增加渲染模板的性能

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
	    }
	  };
	}

	function Vue(options) {
	  // const vm = this;
	  // vm.$options = options;
	  // init(vm);
	  // return vm;
	  this._init(options);
	}

	initMixin(Vue);

	return Vue;

}));
//# sourceMappingURL=vue.js.map
