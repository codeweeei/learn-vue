(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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

  // 工具库
  function isFunction(val) {
    return typeof val === 'function';
  }
  function isObject(val) {
    return _typeof(val) === 'object'; // return Object.prototype.toString.call(val) === '[object Object]';
  } // Vue数据异步更新原理

  var callbackFn = [];
  var watting = false; // 防抖

  function flushCallbacks() {
    for (var i = 0; i < callbackFn.length; i++) {
      callbackFn[i]();
    }

    callbackFn = [];
    watting = false;
  }

  function nextTick(callback) {
    callbackFn.push(callback);

    if (!watting) {
      // 这里异步vue2中考虑了兼容性问题,这里我们就不考虑浏览器兼容性问题了
      Promise.resolve().then(flushCallbacks);
      watting = true;
    }
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

      var inserted;
      var ob = this.__ob__; // 注意数组新增引用类型数据时，需要对新增的数据进行劫持（push、unshift和splice）

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
          break;
      }

      if (inserted) ob.observeArray(inserted);
      console.log(ob); // 数组的observer.dep属性

      ob.dep.notify();
    };
  });

  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++; // 保证每个dep的唯一性

      this.subs = []; // 用来存放watcher
    } // 向 watcher 中添加 dep


    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        if (Dep.target) {
          Dep.target.addDep(this);
        }
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      } // 通知更新视图

    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          watcher.update();
        });
      }
    }]);

    return Dep;
  }();
  /**
   * 当前正在执行的 watcher，同一时间只会有一个 watcher 在执行
   * Dep.target = 当前正在执行的 watcher
   * 通过调用 pushTarget 方法完成赋值，调用 popTarget 方法完成重置（null)
   */

  Dep.target = null;
  function pushTarget(watcher) {
    Dep.target = watcher;
  }
  function popTarget() {
    Dep.target = null;
  }

  var Observe = /*#__PURE__*/function () {
    function Observe(data) {
      _classCallCheck(this, Observe);

      this.dep = new Dep(); // 数据可能是对象或数组
      // 将观测实例作为属性保存至观测的对象，注意该属性不能被枚举，否则会陷入this.walk(data)中的死循环

      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      }); // 对 data 中的所有属性进行劫持（注意数组的递归监控）

      if (Array.isArray(data)) {
        data.__proto__ = arrayMethods; // 对数组中的引用类型进行劫持

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
      } // 遍历数据的所有属性，并调用defineReactive方法

    }, {
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observe;
  }(); // 数组值为引用类型时，依赖收集

  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i]; // current是数组里面的数组 [[[[[]]]]]

      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }

  function defineReactive(data, key, val) {
    // val可能也是对象，因此需要递归处理嵌套val里的对象，劫持深层val里的对象
    var childOb = observe(val); //dep 存储依赖的变量，每个属性字段都有一个属于自己的dep，用于收集属于该字段的依赖

    var dep = new Dep();
    Object.defineProperty(data, key, {
      get: function get() {
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
      set: function set(newVal) {
        // data中某个属性赋值给一个新对象时也得劫持 vm._data.a = {b:1}
        if (newVal !== val) {
          observe(newVal);
          val = newVal; //在set方法中执行依赖器中的所有依赖

          dep.notify();
        }
      }
    });
  }

  function observe(data) {
    // 判断是否是对象
    if (!isObject(data)) return;
    if (data.__ob__) return data.__ob__;
    return new Observe(data);
  }

  var queue = [];
  var has = {};
  var pending = false; // 防抖作用

  function flushSchedulerQueue() {
    for (var i = 0; i < queue.length; i++) {
      queue[i].run();
    }

    queue = [];
    has = {};
    pending = false;
  }

  function queueWatcher(watcher) {
    // watcher 去重
    var id = watcher.id; // has[id] == null

    if (has[id] === undefined || has[id] === null) {
      queue.push(watcher);
      has[id] = true; // 开启更新（防抖）

      if (!pending) {
        // 注意异步执行顺序 微任务
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  var id = 0; // 每个组件渲染的时候都会对应一个watcher

  var Watcher = /*#__PURE__*/function () {
    function Watcher(vm, exprOrFn, cb, options) {
      _classCallCheck(this, Watcher);

      this.vm = vm; // exprOrFn值为字符串（watch）或updateComponent方法

      this.exprOrFn = exprOrFn;
      this.user = !!options.user; // 表示是否是用户watcher

      this.cb = cb;
      this.options = options;
      this.id = id++;
      this.deps = []; // 依赖的属性

      this.depsId = new Set();

      if (typeof exprOrFn === 'string') {
        this.getter = function () {
          // 当数据取值时，会进行依赖收集
          // 注意 age.n 嵌套的情况：vm['age.n'] -> vm['age']['n']
          var path = exprOrFn.split('.');
          var obj = vm;

          for (var i = 0; i < path.length; i++) {
            obj = obj[path[i]];
          }

          return obj;
        };
      } else {
        this.getter = exprOrFn;
      } // 默认初始化取值(第一次取值)


      this.value = this.get();
    } // 用户更新数据时重新调用即可


    _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // 一个watcher可以监听多个属性，一个属性可以对应多个watcher；因此使用dep来收集依赖
        pushTarget(this);
        var value = this.getter();
        popTarget();
        return value;
      } // 更新视图

    }, {
      key: "update",
      value: function update() {
        // 多次调用update时，可以先将watcher缓存下来，等会一起更新
        queueWatcher(this);
      }
    }, {
      key: "run",
      value: function run() {
        var newValue = this.get();
        var oldValue = this.value;
        this.value = newValue; // 为了保证下一次更新时

        if (this.user) {
          // 用户watcher
          this.cb.call(this.vm, newValue, oldValue);
        }
      }
    }, {
      key: "addDep",
      value: function addDep(dep) {
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.depsId.add(id);
          this.deps.push(dep);
          dep.addSub(this);
        }
      }
    }]);

    return Watcher;
  }();

  function stateMixin(Vue) {
    Vue.prototype.$watch = function (key, handler) {
      var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      options.user = true; // 用户watcher，与渲染watcher区分开

      new Watcher(this, key, handler, options);
    };
  } // 处理 new Vue({...})中传入的props、data、computed、watch等

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      // 初始化data
      initData(vm);
    }

    if (opts.watch) {
      // 初始化 watche
      initWatch(vm, opts.watch);
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
  } // 处理 watch


  function initWatch(vm, watch) {
    // watch需要为对象
    Object.keys(watch).forEach(function (key) {
      var handler = watch[key];

      if (Array.isArray(handler)) {
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    });
  } // 创建watcher


  function createWatcher(vm, key, handler) {
    return vm.$watch(key, handler);
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

  /**
   * 比较新旧节点，如果旧节点是真实节点，则直接删除旧节点，将新节点
   * @param {*} oldVnode 旧节点
   * @param {*} vnode 新节点
   */
  function patch(oldVnode, vnode) {
    if (oldVnode.nodeType === 1) {
      // 真实元素
      var parentElm = oldVnode.parentNode;
      var elm = creatElm(vnode); // 根据虚拟节点，创建真实节点

      parentElm.insertBefore(elm, oldVnode.nextSibling); // 将真实节点插入至父元素下
      // 删除旧的真实元素

      parentElm.removeChild(oldVnode);
      return elm;
    }
  }

  function creatElm(vnode) {
    var tag = vnode.tag;
        vnode.data;
        var children = vnode.children,
        text = vnode.text;
        vnode.vm;

    if (typeof tag === 'string') {
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

    return vnode.el;
  }

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      // 初始化及更新
      var vm = this;
      vm.$el = patch(vm.$el, vnode);
    };

    Vue.prototype.$nextTick = nextTick;
  } // 挂载vm组件至el上

  function mountComponent(vm, el) {
    // 调用render方法，生成虚拟DOM再渲染成真实DOM替换掉页面的内容
    var updateComponent = function updateComponent() {
      // 后续更新可以调用updateComponent方法
      vm._update(vm._render());
    }; // 观察者模式


    new Watcher(vm, updateComponent, function () {
      console.log('更新成功');
    }, true // true 表示渲染watcher
    );
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
    // 调用 Vue.prototype._init 方法，该方法是在 initMixin 中定义的
    this._init(options);
  } // 定义 Vue.prototype._init 方法


  initMixin(Vue); // _init

  renderMixin(Vue); // _render

  lifecycleMixin(Vue); // _update

  stateMixin(Vue); // $watch

  return Vue;

}));
//# sourceMappingURL=vue.js.map
