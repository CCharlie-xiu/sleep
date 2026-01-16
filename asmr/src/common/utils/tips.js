/**
 * 提示与加载工具类
 */

export default class Tips {
	constructor() {
		this.isLoading = false;
	}
	/**
	 * 弹出提示框
	 */
	static success(title, icon = "success", duration = 1000) {
		setTimeout(() => {
			uni.showToast({
				title,
				icon,
				mask: true,
				duration
			});
		}, 300);
		if (duration > 0) {
			return new Promise((resolve, reject) => {
				setTimeout(() => {
					resolve();
				}, duration);
			}).catch((e) => { });
		}
	}
	/**
	content ,
	showCancel,
	title = '提示',
	showTitle = true,
	cancelText = '取消',
	confirmText = '确定',
	mask = true,
	cancelColor = '#999' ,
	titleColor = '#eb0a00',
	confirmColor = '#eb0a00'
	 * 弹出确认窗口
	 */
	static confirm({
		content = "",
		showCancel = false,
		title = "提示",
		showTitle = true,
		cancelText = "取消",
		confirmText = "确定",
		mask = true,
		cancelColor = "#999999",
		titleColor = "#eb0a00",
		confirmColor = "#eb0a00"
	}, payload = {}) {
		return new Promise((resolve, reject) => {
			uni.showModal({
				title,
				content,
				showCancel,
				success: res => {
					if (res.confirm) {
						resolve(payload);
					} else if (res.cancel) {
						reject(payload);
					}
				},
				fail: res => {
					reject(payload);
				}
			});
		}).catch((e) => { });
	}
	static toast(title, onHide, icon = "none", duration = 1000) {
		if (title && title.length > 9) {
			setTimeout(() => {
				uni.showToast({
					title,
					icon,
					mask: true,
					duration
				});
			}, 300);
			// 隐藏结束回调
			if (onHide) {
				setTimeout(() => {
					onHide();
				}, 500);
			}
		} else {
			const pages = getCurrentPages();
			const page = pages[pages.length - 1];
			const vm = page.$vm;
			if (vm && vm.$refs && vm.$refs.uToast) {
				vm.$refs.uToast.show({ title: title, icon: false })
			} else {
				setTimeout(() => {
					uni.showToast({
						title,
						icon,
						mask: true,
						duration
					});
				}, 300);
				// 隐藏结束回调
				if (onHide) {
					setTimeout(() => {
						onHide();
					}, 500);
				}
			}
		}

	}
	/**
	 * 警告框
	 */
	static alert(title) {
		uni.showToast({
			title,
			mask: true,
			duration: 1500
		});
	}

	/**
	 * 错误框debug
	 */

	static errorDebug(title, onHide) {
		if (process.env.NODE_ENV != "development") {
			return;
		}
		uni.showToast({
			title,
			// image: "../../static/error.png",
			icon: "none",
			mask: true,
			duration: 1500
		});
		// 隐藏结束回调
		if (onHide) {
			setTimeout(() => {
				onHide();
			}, 500);
		}
	}

	/**
	 * 错误框
	 */

	static error(title, onHide) {
		uni.showToast({
			title,
			mask: true,
			duration: 1500
		});
		// 隐藏结束回调
		if (onHide) {
			setTimeout(() => {
				onHide();
			}, 500);
		}
	}
	/**
	 * 弹出加载提示
	 */
	static loading(title = "请稍后") {
		if (Tips.isLoading) {
			return;
		}
		Tips.isLoading = true;
		// #ifdef MP-ALIPAY
		my.showLoading({
			content: title,
			mask: true
		});
		// #endif
		// #ifndef MP-ALIPAY
		const pages = getCurrentPages();
		const page = pages[pages.length - 1];
		const vm = page.$vm;
		if (vm && vm.$refs && vm.$refs.aLoading) {
			vm.$refs.aLoading.show()
		} else {
			uni.showLoading({
				title,
				mask: true
			});
		}
		// #endif
	}
	/**
	 * 加载完毕
	 */
	static loaded() {
		if (Tips.isLoading) {
			Tips.isLoading = false;
			const pages = getCurrentPages();
			const page = pages[pages.length - 1];
			const vm = page.$vm;
			if (vm && vm.$refs && vm.$refs.aLoading) {
				vm.$refs.aLoading.hide()
			} else {
				uni.hideLoading();
			}
		}
	}
	/**
	 * 隐藏toast
	 */
	static hideToast() {
		uni.hideToast();
	}
}

/**
 * 静态变量，是否加载中
 */
Tips.isLoading = false;

Tips.install = (app) => {
	const globalProperties = app.config.globalProperties;
	globalProperties.$Tips = Tips;

};