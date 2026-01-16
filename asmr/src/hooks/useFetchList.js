import { computed, ref } from "vue";

export default () => {
  const loading = ref(false);
  const { proxy } = getCurrentInstance();
  /**
   * 统一上传方法
   */
  const uploadFile = async (options) => {
    const { id, filePath, name = "file" } = options;
    // 1. 如果是HTTPS链接，直接返回（无需上传）
    if (id) {
      return {
        accessUrl: filePath,
        id,
      };
    }
    // 2. 如果是本地文件，执行上传
    // API 调用已移除 - uploadOss
    // TODO: 需要实现文件上传逻辑
    throw new Error("文件上传功能暂不可用");
  };

  return {
    loading,
    uploadFile,
  };
};
