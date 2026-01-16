export function getStorageSync(key){
	let value = uni.getStorageSync(key);
	// #ifdef MP-KUAISHOU
	value && (value = JSON.parse(value));
	// #endif
	return value || null;
}

export function setStorageSync(key,data){
	// #ifdef MP-KUAISHOU
	data = JSON.stringify(data);
	// #endif
	uni.setStorageSync(key,data)
}

export function removeStorageSync(key){
	uni.removeStorageSync(key)
}


const Storage = {
	getStorageSync,
	setStorageSync,
	removeStorageSync,
}

export default Storage