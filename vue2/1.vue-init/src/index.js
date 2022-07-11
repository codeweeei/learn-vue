import { initMixin } from './init';
import { lifecycleMixin } from './lifecycle';
import { renderMixin } from './render';
import { stateMixin } from './state';

function Vue(options) {
	// 调用 Vue.prototype._init 方法，该方法是在 initMixin 中定义的
	this._init(options);
}

// 定义 Vue.prototype._init 方法
initMixin(Vue); // _init
renderMixin(Vue); // _render
lifecycleMixin(Vue); // _update
stateMixin(Vue); // $watch

export default Vue;
