# vue-init

## rollup 打包配置

## 响应式处理

### 1.  响应式入口

- src/index.js

```js
import { initMixin } from './init'
function Vue(options) {
    // 初始化操作
    this._init(options)
}
// 给Vue原型上添加初始化Vue的_init方法
initMixin(Vue)
export default Vue
```

### 2. 初始化Vue

### 2. options.data的数据劫持 getter 和 setter

1. data中某个属性值是对象的话，需要递归来进行数据劫持
2. 将data中某个属性值设置为一个新对象时，需要对该新对象进行数据劫持
3. 将 vm.\_data 代理至 vm 上，方便直接使用vm.xxx来获取和设置数据

### 4. 数组的递归监控

1. 如果对数组的拦截消耗太大，因此内部数组通过索引取值不采用 defineProperty 劫持

2. push、shift、pop、unshift、reverse、sort 和 splice 这些数组方法都会改变原数组，因此 vue2 内部会重写这些数组方法

3. 如果数组中的数据是引用类型，还需要进行监控（递归劫持）

4. 如果数组中新增数据是引用类型时，还需要对新增的数据进行劫持

   ## 模板编译

   

   
