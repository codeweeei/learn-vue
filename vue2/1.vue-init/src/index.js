import { initMixin } from './init';

function Vue(options) {
	// const vm = this;
	// vm.$options = options;
	// init(vm);
	// return vm;
	this._init(options);
}
initMixin(Vue);

export default Vue;
