import adapter from '../adapters/index'

// let adapter = () => {};
// adapter = require("../adapters/index.js");

export default (config) => {
	return adapter(config);
};