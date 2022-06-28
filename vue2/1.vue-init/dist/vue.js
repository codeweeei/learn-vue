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

	var Observe = /*#__PURE__*/function () {
	  function Observe(data) {
	    _classCallCheck(this, Observe);

	    // 对 data 中的所有属性进行劫持
	    this.walk(data);
	  }

	  _createClass(Observe, [{
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
	  return new Observe(data);
	}

	function initState(vm) {
	  var opts = vm.$options;

	  if (opts.data) {
	    initData(vm);
	  }
	} // 处理 data

	function initData(vm) {
	  // data可传入函数（返回对象）或者对象，最终取到对象（注意函数内部的this指向）
	  var data = vm.$options.data; // 关联 data（响应式数据getter和setter） 和 vm._data

	  vm._data = data = isFunction(data) ? data.call(vm) : data; // 观测data（将其转换为响应式数据）

	  observe(data);
	}

	function init(vm) {
	  // 初始化state
	  initState(vm);
	}

	function Vue(options) {
	  var vm = this;
	  vm.$options = options;
	  init(vm);
	  return vm;
	}

	return Vue;

}));
//# sourceMappingURL=vue.js.map
