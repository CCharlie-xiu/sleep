const system = uni.getSystemInfoSync();

const isIos = system.platform === "ios";
const isIosAndMac = system.platform === "ios" || system.platform === "mac";
const systemInfo = system.system;
const platform = system.platform;
const osName = system.osName;
const deviceId = system.deviceId;

export {
	system,
	isIos,
	isIosAndMac,
	systemInfo,
	platform,
	osName,
	deviceId
};