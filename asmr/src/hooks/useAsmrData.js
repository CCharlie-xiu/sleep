import { ref } from 'vue'

/**
 * ASMR 数据管理 Hook
 * 管理所有静态数据和当前状态
 */
export function useAsmrData() {
  // 音频文件映射
  const asmrMap = {
    wind: ['asmr/wind1.ogg', 'asmr/wind2.ogg', 'asmr/wind3.wav', 'asmr/wind4.ogg'],
    birds: ['asmr/birds1.ogg', 'asmr/birds2.wav', 'asmr/birds3.wav', 'asmr/birds4.wav'],
    chocolate: ['asmr/chocolate1.ogg', 'asmr/chocolate2.ogg', 'asmr/chocolate3.ogg', 'asmr/chocolate4.ogg'],
    ear: ['asmr/ear1.wav', 'asmr/ear2.wav', 'asmr/ear3.wav', 'asmr/ear4.wav'],
    paper: ['asmr/paper1.ogg', 'asmr/paper2.ogg', 'asmr/paper3.ogg', 'asmr/paper4.ogg'],
  }

  // 全部声音列表
  const allList = [
    { name: '雨林', desc: '湿润宁静的森林雨声，细雨落叶间，洗涤心灵烦躁感', bg: '#0F2A1D', accent: '#6FCF97', key: 'birds', imgUrl: 'images/Gemini_Generated_Image_g9www3g9www3g9ww.png' },
    { name: '深海', desc: '低频安抚深度睡眠，海水涌动声，仿佛潜入宁静海底', bg: '#050B1E', accent: '#1BCEDB', key: 'chocolate', imgUrl: 'images/Gemini_Generated_Image_slrmudslrmudslrm.png' },
    { name: '极光', desc: '北欧夜空冥想，星光闪烁下，心灵漂浮于极光之中', bg: '#0E1028', accent: '#9BFFEC', key: 'ear', imgUrl: 'images/Gemini_Generated_Image_d5q93xd5q93xd5q9.png' },
    { name: '风铃', desc: '清脆悦耳的风铃声，微风拂过窗前，带来夏日清凉感', bg: '#101820', accent: '#FFD166', key: 'paper', imgUrl: 'images/Gemini_Generated_Image_25jhe25jhe25jhe2.png' },
    { name: '鸟鸣', desc: '清晨自然鸟叫声，阳光洒落林间，唤醒轻柔的早晨', bg: '#1A2E3B', accent: '#7ED957', key: 'birds', imgUrl: 'images/Gemini_Generated_Image_g9www3g9www3g9ww.png' },
    { name: '溪流', desc: '潺潺溪水声，山间流水奔流，沁人心脾静心安神', bg: '#081A2F', accent: '#7ABEFF', key: 'paper', imgUrl: 'images/Gemini_Generated_Image_slrmudslrmudslrm.png' },
    { name: '虫鸣', desc: '夏日昆虫鸣叫，夜晚静谧中，虫声伴随入眠深处', bg: '#070B18', accent: '#FF8C42', key: 'birds', imgUrl: 'images/Gemini_Generated_Image_g9www3g9www3g9ww.png' },
    { name: '海浪', desc: '宁静海滩波浪声，海水轻拍礁石，心随浪花平静', bg: '#081226', accent: '#4FC3F7', key: 'chocolate', imgUrl: 'images/Gemini_Generated_Image_d5q93xd5q93xd5q9.png' },
    { name: '营火', desc: '温暖的木柴火焰声，轻轻劈啪响，带来冬夜温馨感', bg: '#2B1610', accent: '#FF7043', key: 'wind', imgUrl: 'images/Gemini_Generated_Image_d5q93xd5q93xd5q9.png' },
  ]

  // 推荐分类列表
  const recommendList = [
    {
      name: '万物自然声',
      keyvalue: [
        { name: '雨林', desc: '湿润宁静的森林雨声，细雨落叶间，洗涤心灵烦躁感', bg: '#0F2A1D', accent: '#6FCF97', key: 'birds', imgUrl: 'images/Gemini_Generated_Image_g9www3g9www3g9ww.png' },
        { name: '深海', desc: '低频安抚深度睡眠，海水涌动声，仿佛潜入宁静海底', bg: '#050B1E', accent: '#1BCEDB', key: 'chocolate', imgUrl: 'images/Gemini_Generated_Image_slrmudslrmudslrm.png' },
        { name: '极光', desc: '北欧夜空冥想，星光闪烁下，心灵漂浮于极光之中', bg: '#0E1028', accent: '#9BFFEC', key: 'ear', imgUrl: 'images/Gemini_Generated_Image_d5q93xd5q93xd5q9.png' },
      ],
    },
    {
      name: '纯净频率音',
      keyvalue: [
        { name: '风铃', desc: '清脆悦耳的风铃声，微风拂过窗前，带来夏日清凉感', bg: '#101820', accent: '#FFD166', key: 'paper', imgUrl: 'images/Gemini_Generated_Image_25jhe25jhe25jhe2.png' },
        { name: '鸟鸣', desc: '清晨自然鸟叫声，阳光洒落林间，唤醒轻柔的早晨', bg: '#1A2E3B', accent: '#7ED957', key: 'birds', imgUrl: 'images/Gemini_Generated_Image_g9www3g9www3g9ww.png' },
        { name: '溪流', desc: '潺潺溪水声，山间流水奔流，沁人心脾静心安神', bg: '#081A2F', accent: '#7ABEFF', key: 'paper', imgUrl: 'images/Gemini_Generated_Image_slrmudslrmudslrm.png' },
      ],
    },
    {
      name: '空灵冥想曲',
      keyvalue: [
        { name: '虫鸣', desc: '夏日昆虫鸣叫，夜晚静谧中，虫声伴随入眠深处', bg: '#070B18', accent: '#FF8C42', key: 'birds', imgUrl: 'images/Gemini_Generated_Image_g9www3g9www3g9ww.png' },
        { name: '海浪', desc: '宁静海滩波浪声，海水轻拍礁石，心随浪花平静', bg: '#081226', accent: '#4FC3F7', key: 'chocolate', imgUrl: 'images/Gemini_Generated_Image_d5q93xd5q93xd5q9.png' },
        { name: '钟摆', desc: '沉稳机械钟摆声，规律摆动中，带来时间的安心感', bg: '#0E0E0E', accent: '#A78BFA', key: 'ear', imgUrl: 'images/Gemini_Generated_Image_slrmudslrmudslrm.png' },
      ],
    },
    {
      name: '柔和器乐音',
      keyvalue: [
        { name: '沙漏', desc: '古老沙漏漏沙声，细沙缓落，象征光阴流逝宁静', bg: '#1A140D', accent: '#E6C79C', key: 'wind', imgUrl: 'images/Gemini_Generated_Image_g9www3g9www3g9ww.png' },
        { name: '烛光', desc: '温馨摇曳烛光声，火焰轻晃，夜晚的柔光与暖意感', bg: '#140A06', accent: '#FFB703', key: 'chocolate', imgUrl: 'images/Gemini_Generated_Image_d5q93xd5q93xd5q9.png' },
        { name: '雨滴', desc: '滴答雨滴声，窗外雨声点点，静谧时光缓缓流淌', bg: '#0A1322', accent: '#8ECDF4', key: 'paper', imgUrl: 'images/Gemini_Generated_Image_slrmudslrmudslrm.png' },
      ],
    },
    {
      name: '意境解压场',
      keyvalue: [
        { name: '心跳', desc: '沉稳心跳声，仿佛身体节奏，带来安全与平静感', bg: '#1B0D12', accent: '#E63946', key: 'ear', imgUrl: 'images/Gemini_Generated_Image_g9www3g9www3g9ww.png' },
        { name: '钟表', desc: '优雅机械钟表声，滴答作响，提醒时间的缓慢流动', bg: '#121212', accent: '#C7B7A3', key: 'wind', imgUrl: 'images/Gemini_Generated_Image_d5q93xd5q93xd5q9.png' },
        { name: '铃铛', desc: '清脆悦耳的铃铛声，轻敲响起，带来清新愉悦感受', bg: '#0E0E0E', accent: '#FFD166', key: 'chocolate', imgUrl: 'images/Gemini_Generated_Image_25jhe25jhe25jhe2.png' },
      ],
    },
  ]

  // 当前播放列表
  const sounds = ref([
    { name: '雨林', desc: '湿润宁静的森林雨声，细雨落叶间，洗涤心灵烦躁感', bg: '#0F2A1D', accent: '#6FCF97', key: 'birds', imgUrl: 'images/Gemini_Generated_Image_g9www3g9www3g9ww.png' },
    { name: '深海', desc: '低频安抚深度睡眠，海水涌动声，仿佛潜入宁静海底', bg: '#050B1E', accent: '#1BCEDB', key: 'chocolate', imgUrl: 'images/Gemini_Generated_Image_slrmudslrmudslrm.png' },
    { name: '极光', desc: '北欧夜空冥想，星光闪烁下，心灵漂浮于极光之中', bg: '#0E1028', accent: '#9BFFEC', key: 'ear', imgUrl: 'images/Gemini_Generated_Image_d5q93xd5q93xd5q9.png' },
    { name: '风铃', desc: '清脆悦耳的风铃声，微风拂过窗前，带来夏日清凉感', bg: '#101820', accent: '#FFD166', key: 'paper', imgUrl: 'images/Gemini_Generated_Image_25jhe25jhe25jhe2.png' },
    { name: '鸟鸣', desc: '清晨自然鸟叫声，阳光洒落林间，唤醒轻柔的早晨', bg: '#1A2E3B', accent: '#7ED957', key: 'birds', imgUrl: 'images/Gemini_Generated_Image_g9www3g9www3g9ww.png' },
    { name: '溪流', desc: '潺潺溪水声，山间流水奔流，沁人心脾静心安神', bg: '#081A2F', accent: '#7ABEFF', key: 'paper', imgUrl: 'images/Gemini_Generated_Image_slrmudslrmudslrm.png' },
    { name: '虫鸣', desc: '夏日昆虫鸣叫，夜晚静谧中，虫声伴随入眠深处', bg: '#070B18', accent: '#FF8C42', key: 'birds', imgUrl: 'images/Gemini_Generated_Image_g9www3g9www3g9ww.png' },
    { name: '海浪', desc: '宁静海滩波浪声，海水轻拍礁石，心随浪花平静', bg: '#081226', accent: '#4FC3F7', key: 'chocolate', imgUrl: 'images/Gemini_Generated_Image_d5q93xd5q93xd5q9.png' },
    { name: '营火', desc: '温暖的木柴火焰声，轻轻劈啪响，带来冬夜温馨感', bg: '#2B1610', accent: '#FF7043', key: 'wind', imgUrl: 'images/Gemini_Generated_Image_d5q93xd5q93xd5q9.png' },
  ])

  // 当前选中索引
  const currentIndex = ref(0)

  /**
   * 更新播放列表
   * @param {Array} newSounds - 新的声音列表
   */
  const updateSounds = (newSounds) => {
    sounds.value = newSounds
    currentIndex.value = 0 // 重置索引
  }

  return {
    sounds,
    allList,
    recommendList,
    asmrMap,
    currentIndex,
    updateSounds,
  }
}

