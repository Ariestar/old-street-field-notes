// Asset pipeline: resize photos -> web/public/photos/<slug>/NN.jpg, copy audio,
// emit web/src/data/media-manifest.json with dimensions.
import { execSync } from 'node:child_process';
import { mkdirSync, existsSync, readdirSync, copyFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = 'D:/WHU/比赛&活动/社会实践/古街记忆';
const SRC = join(ROOT, '调研成果/调研成果');
const EXTRACTED = join(SRC, '_extracted');
const WEB = join(ROOT, 'web');
const PHOTOS_OUT = join(WEB, 'public/photos');
const AUDIO_OUT = join(WEB, 'public/audio');

// street slug -> source folder (relative to SRC), fallback EXTRACTED
const STREETS = [
  { slug: 'kuanzhai',   src: '四川省成都市青羊区宽窄巷子', ex: null },
  { slug: 'jinli',      src: '四川省成都市锦里古街',       ex: null },
  { slug: 'huanglongxi',src: '四川省成都市黄龙溪古街',     ex: '四川省成都市黄龙溪古街' },
  { slug: 'jiulong',    src: '四川省乐山市九龙巷',         ex: '四川省乐山市九龙巷' },
  { slug: 'heita',      src: '四川省德阳市黑塔街',         ex: '四川省德阳市黑塔街' },
  { slug: 'yanyun',     src: '四川省自贡市盐运古街',       ex: null },
  { slug: 'xihutang',   src: '四川省自贡市西湖塘老街',     ex: '四川省自贡市西湖塘老街' },
  { slug: 'wenming',    src: '云南省昆明市文明街',         ex: null },
  { slug: 'xunjin',     src: '云南省昆明市巡津街',         ex: '云南省昆明市巡津街' },
  { slug: 'tuodong',    src: '云南省昆明市拓东路',         ex: '云南省昆明市拓东路' },
  { slug: 'nlgx',       src: '北京市南锣鼓巷',             ex: null },
  { slug: 'guozijian',  src: '北京市国子监街',             ex: null },
  { slug: 'gujie',      src: '山西省运城市盬街',           ex: null },
  { slug: 'jinshang',   src: '山西省祁县晋商老街',         ex: null },
  { slug: 'shudian',    src: '河南省开封市书店街',         ex: null },
  { slug: 'gushizi',    src: '河南省濮阳市古十字街',       ex: null },
  { slug: 'pingjiang',  src: '江苏省苏州市平江路',         ex: null },
  { slug: 'tunxi',      src: '安徽省黄山市屯溪区屯溪老街', ex: null },
  { slug: 'chengji',    src: '湖北省荆州市程集老街',       ex: null },
  { slug: 'tingsiqiao', src: '湖北省咸宁市汀泗桥古街',     ex: null },
  { slug: 'sanfang',    src: '福建省福州市三坊七巷',       ex: null },
  { slug: 'xijie',      src: '福建省泉州市泉州西街',       ex: null },
  { slug: 'dongmei',    src: '福建省漳州东美古街',         ex: '福建省漳州东美古街' },
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
  let files = list(join(SRC, s.src)).map(f => join(SRC, s.src, f));
  if (s.ex) files = files.concat(list(join(EXTRACTED, s.ex)).map(f => join(EXTRACTED, s.ex, f)));
  // natural sort by number in name, then name
  files.sort((a, b) => {
    const na = a.match(/(\d+)\.(jpe?g|png)$/i), nb = b.match(/(\d+)\.(jpe?g|png)$/i);
    if (na && nb) return +na[1] - +nb[1];
    if (na) return -1; if (nb) return 1;
    return a.localeCompare(b, 'zh');
  });
  manifest[s.slug] = [];
  let i = 0;
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

// audio
const AUDIO = [
  { out: 'xihutang-1.m4a', src: join(EXTRACTED, '四川省自贡市西湖塘老街/古街访谈 1.m4a') },
  { out: 'xihutang-2.m4a', src: join(EXTRACTED, '四川省自贡市西湖塘老街/古街访谈 2.m4a') },
  { out: 'dongmei-1.m4a',  src: join(EXTRACTED, '福建省漳州东美古街/录音1.m4a') },
  { out: 'dongmei-2.m4a',  src: join(EXTRACTED, '福建省漳州东美古街/录音2.m4a') },
];
for (const a of AUDIO) copyFileSync(a.src, join(AUDIO_OUT, a.out));
console.log('audio copied');

writeFileSync(join(WEB, 'src/data/media-manifest.json'), JSON.stringify(manifest, null, 1));
console.log('TOTAL PHOTOS:', total);
