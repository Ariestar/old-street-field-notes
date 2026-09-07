/** 站点级元信息：统计口径、实践时间、结语发现 */

export const STATS = {
  streets: 23,
  provinces: 11,
  photos: 119,
  interviews: 6,
  audioMinutes: 28,
  days: 21,
  findings: 5,
};

export const PERIOD = {
  start: '2026.07.19',
  end: '2026.08.24',
  label: '2026 夏',
};

/** 五条核心发现 —— 大字号排印区 */
export const CORE_FINDINGS = [
  {
    no: '01',
    title: '商业正在改变古街',
    en: 'COMMERCE RESHAPES THE OLD STREET',
    body:
      '从宽窄巷子到南锣鼓巷，「打卡经济」重构了古街业态。本地生活让位于旅游消费，店铺更替周期缩短至数月。最极端的样本里，主街商业化率接近 100%——而十步之外的支巷，居民生活照旧。古街正在变成「布景」，生活的街区与展示的街区一分为二。',
    streets: ['kuanzhai', 'nlgx', 'jinli'],
  },
  {
    no: '02',
    title: '建筑保存与现代生活存在冲突',
    en: 'PRESERVATION vs. LIVING',
    body:
      '九龙巷的穿斗老楼被列为危房，程集老街的清代铺面用木板封存，巡津街的法式老宅空置朽坏。原真性与宜居性互为代价：修缮到位的街区往往商业化了，保持原貌的街区正在物理衰败。「冻结式保护」与「过度活化」之间，中间道路仍然缺失。',
    streets: ['jiulong', 'chengji', 'xunjin'],
  },
  {
    no: '03',
    title: '居民的记忆 ≠ 游客看到的古街',
    en: 'TWO STREETS, ONE NAME',
    body:
      '李大爷记忆里的黄龙溪飘着豆花香，游客看到的是小吃油烟与红灯笼。东美阿婆的闽南语里，古街是「过番」的亲人寄回侨汇盖起的房子。口述史揭示：同一物理空间中并存着两个古街——记忆的街与消费的街，而后者正在覆盖前者。',
    streets: ['huanglongxi', 'dongmei', 'xihutang'],
  },
  {
    no: '04',
    title: '部分传统文化正在消失',
    en: 'VANISHING PRACTICES',
    body:
      '黄龙溪的吊脚楼拆于河道整治，打更成了表演；黑塔街的手艺铺子叮当声绝；晋商老街的票号匾额落灰无人识。消失分两种：物的消失（建筑、行当）与关系的消失（手艺与生活脱钩）。后者更彻底——物件可以进博物馆，但使用物件的生活不会复活。',
    streets: ['huanglongxi', 'heita', 'jinshang'],
  },
  {
    no: '05',
    title: '最好的保护是被持续需要',
    en: 'LIVED HERITAGE ENDURES',
    body:
      '书店街三百年还在卖文房四宝，西湖塘的茶馆仍是街坊议事堂，泉州西街的香客与食客络绎不绝。凡是被日常持续需要的古街，都不需要「保护」这个词。活态遗产的密码不在文物等级里，而在「这条街对今天的人还有没有用」这个朴素的问题里。',
    streets: ['shudian', 'xihutang', 'xijie'],
  },
];

/** 页脚团队信息 */
export const COLLECTIVE = {
  name: '古街记忆 · 实践小组',
  en: 'OLD STREET MEMORY FIELD TEAM',
  org: '武汉大学 社会实践',
  members: 12,
};
