// Asset pipeline: resize photos -> web/public/photos/<slug>/NN.jpg, copy audio,
// emit web/src/data/media-manifest.json with dimensions.
import { execSync } from 'node:child_process';
import { mkdirSync, existsSync, readdirSync, copyFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = 'D:/WHU/比赛&活动/社会实践/古街记忆';
// 第二轮调研成果（已入库）：24 个街道文件夹，照片多为 PNG，东美嵌套一层并含录音
const SRC = join(ROOT, '调研成果【图片+中英文介绍】/调研成果【图片+中英文介绍】');
const WEB = join(ROOT, 'web');
const PHOTOS_OUT = join(WEB, 'public/photos');
const AUDIO_OUT = join(WEB, 'public/audio');

// street slug -> source folder (relative to SRC)
const STREETS = [
  { slug: 'kuanzhai',   src: '四川省成都市青羊区宽窄巷子' },
  { slug: 'jinli',      src: '四川省成都市锦里古街' },
  { slug: 'huanglongxi',src: '四川省成都市黄龙溪古街' },
  { slug: 'jiulong',    src: '四川省乐山市九龙巷' },
  { slug: 'heita',      src: '四川省德阳市黑塔街' },
  { slug: 'yanyun',     src: '四川省自贡市盐运古街' },
  { slug: 'xihutang',   src: '四川省自贡市西湖塘老街' },
  { slug: 'wenming',    src: '云南省昆明市文明街' },
  { slug: 'xunjin',     src: '云南省昆明市巡津街' },
  { slug: 'tuodong',    src: '云南省昆明市拓东路' },
  { slug: 'nlgx',       src: '北京市南锣鼓巷' },
  { slug: 'guozijian',  src: '北京市国子监街' },
  { slug: 'gujie',      src: '山西省运城市盬街' },
  { slug: 'jinshang',   src: '山西省祁县晋商老街' },
  { slug: 'shudian',    src: '河南省开封市书店街' },
  { slug: 'gushizi',    src: '河南省濮阳市古十字街' },
  { slug: 'pingjiang',  src: '江苏省苏州市平江路' },
  { slug: 'tunxi',      src: '安徽省黄山市屯溪区屯溪老街' },
  { slug: 'chengji',    src: '湖北省荆州市程集老街' },
  { slug: 'tingsiqiao', src: '湖北省咸宁市汀泗桥古街' },
  { slug: 'tanhualin',  src: '湖北省武汉市昙华林' },
  { slug: 'sanfang',    src: '福建省福州市三坊七巷' },
  { slug: 'xijie',      src: '福建省泉州市泉州西街' },
  { slug: 'dongmei',    src: '福建省漳州东美古街' },
];

const isImg = f => /\.(jpe?g|png)$/i.test(f);
const list = dir => { try { return existsSync(dir) ? readdirSync(dir).filter(isImg) : []; } catch { return []; } };
const q = p => JSON.stringify(p);
const dims = f => {
  try {
    const out = execSync(`ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 ${q(f)}`).toString().trim();
    const [w, h] = out.split('x').map(Number);
    return { w, h };
  } catch { return { w: 1600, h: 1200 }; }
};

mkdirSync(PHOTOS_OUT, { recursive: true });
mkdirSync(AUDIO_OUT, { recursive: true });

const manifest = {};
let total = 0;
for (const s of STREETS) {
  const outDir = join(PHOTOS_OUT, s.slug);
  mkdirSync(outDir, { recursive: true });
  // 新资料夹 = 定稿选图；为空则保留现有产物（如西湖塘老街，照片仅在第一轮素材）
  const srcDir = join(SRC, s.src);
  let files = list(srcDir).map(f => join(srcDir, f));
  if (files.length === 0) {
    const oldDir = join(ROOT, '调研成果/调研成果', s.src);
    const oldFiles = list(oldDir).map(f => join(oldDir, f));
    if (oldFiles.length > 0) files = oldFiles; // 本地仍有旧素材则重建
    // 否则 files 为空 → 不动现有 outDir，清单直接收录现有文件
  }
  // 源有选图：全量替换（先清空旧产物）
  if (files.length > 0) {
    for (const f of list(outDir)) unlinkSync(join(outDir, f));
  }
  // natural sort by number in name, then name
  files.sort((a, b) => {
    const na = a.match(/(\d+)\.(jpe?g|png)$/i), nb = b.match(/(\d+)\.(jpe?g|png)$/i);
    if (na && nb) return +na[1] - +nb[1];
    if (na) return -1; if (nb) return 1;
    return a.localeCompare(b, 'zh');
  });
  manifest[s.slug] = list(outDir).map(f => {
    const { w, h } = dims(join(outDir, f));
    return { f, w, h };
  });
  let i = manifest[s.slug].length;
  for (const f of files) {
    i++;
    const name = String(i).padStart(2, '0') + '.jpg';
    const out = join(outDir, name);
    execSync(`ffmpeg -y -v error -i ${q(f)} -vf "scale='w=1600:h=1600:force_original_aspect_ratio=decrease'" -q:v 4 ${q(out)}`);
    const { w, h } = dims(out);
    manifest[s.slug].push({ f: name, w, h });
    total++;
  }
  console.log(s.slug, manifest[s.slug].length, 'photos');
}

// audio：检查清单（文件随 git 保存，源素材已不在磁盘）
const AUDIO_CHECK = ['xihutang-1.m4a', 'xihutang-2.m4a', 'dongmei-1.m4a', 'dongmei-2.m4a'];
// audio：沿用 git 内已有文件（旧源素材已不在磁盘），仅缺失时报警
for (const a of AUDIO_CHECK) {
  if (!existsSync(join(AUDIO_OUT, a))) console.error('MISSING AUDIO:', a);
}
console.log('audio checked');

writeFileSync(join(WEB, 'src/data/media-manifest.json'), JSON.stringify(manifest, null, 1));
console.log('TOTAL PHOTOS:', total);
