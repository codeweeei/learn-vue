import { init } from './init';

function Vue(options) {
	const vm = this;
	vm.$options = options;
	init(vm);
	return vm;
}

export default Vue;
