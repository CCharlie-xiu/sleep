// 能力code enum
// AI喊麦	aiShoutMaiService
// AI写真	aiPortraitService
// AI动漫	aiAnimeService
// AI游世界	aiTravelWorldService
// AI壁纸	aiWallpaperService
// AI美秀 MergeFaceForVideo
export const serviceCodeEnum = {
  wallpaper: "aiWallpaperService",
  avatar: "aiAvatarService",
  background: "aiBackgroundService",
  travelWorld: "aiTravelWorldService",
  anime: "aiAnimeService",
  portrait: "aiPortraitService",
  shoutMai: "aiShoutMaiService",
  MergeFaceForVideo: "MergeFaceForVideo",
  RunwayImageVideoService: "RunwayImageVideoService"
};

// 图文--->视频（不可编辑）喊麦                           photoTextToVideo
// 图片--->图片（不可编辑）写真、动漫、游世界              photoToPhoto
// 图片--->视频（不可编辑）美秀                           photoToVideo
// 图片（可编辑）--->图片  壁纸、背景、头像                editPhotoToPhoto
export const componentsEnum = {
  photoTextToVideo: "photoTextToVideo",
  photoToPhoto: "photoToPhoto",
  photoToVideo: "photoToVideo",
  editPhotoToPhoto: "editPhotoToPhoto",
};

export const aiCreationStatus = {
  Wait: "Wait", //等待开始
  Creating: "Creating", // 创作中
  Success: "Success", //已完成
  Failed: "Failed", //失败
  Deleted: "Deleted" //删除
};

export const payState = {
  UNPAID: "待支付",
  PAID: "已支付",
  REFUNDED: "已退款",
};

// 协议编码（agreementCode）映射协议类型（categoryCode）
export const categoryCodeEnum = {
  userAgreement: "yhxy", //用户协议
  payAgreement: "ffxy", //付费协议
  privacyAgreement: "ysxy", //隐私协议
  termsUseAgreement: "sytk", //使用条款
};

// 图片后缀
export const imageSuffixType = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "svg",
  "tiff",
];

// 视频后缀
export const videoSuffixType = [
  "mp4",
  "webm",
  "ogg",
  "mov",
  "avi",
  "wmv",
  "flv",
  "mkv",
];

// 开放能力枚举
export const openTypeEnum = {
  'SHARE': 'share',
}

// 空数据状态
export const emptyStatus = {
  noNetwork: "noNetwork",
  error: "error",
  empty: "empty",
};
