// 提取第二轮调研 docx（双语介绍 + 双语口述故事）→ 纯文本，供重写 streets.ts。
// docx = zip；用系统 tar（bsdtar 可读 zip）抽出 word/document.xml，剥标签成段。
import { readdirSync, mkdirSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';

const SRC = 'D:/WHU/比赛&活动/社会实践/古街记忆/调研成果【图片+中英文介绍】/调研成果【图片+中英文介绍】';
const OUT = 'D:/WHU/比赛&活动/社会实践/古街记忆/.tmp-docx';
const WORK = join(OUT, '_x');

rmSync(OUT, { recursive: true, force: true });
mkdirSync(WORK, { recursive: true });

const decode = (s) =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
   .replace(/&quot;/g, '"').replace(/&apos;/g, "'");

const docxText = (docxPath) => {
  const tag = String(Math.random()).slice(2, 8);
  const dir = join(WORK, tag);
  mkdirSync(dir, { recursive: true });
  execSync(`tar -C "${dir}" -xf "${docxPath}" word/document.xml`, { stdio: 'pipe' });
  const xml = readFileSync(join(dir, 'word/document.xml'), 'utf8');
  rmSync(dir, { recursive: true, force: true });
  return xml
    .replace(/<w:p[ >]/g, '\n<w:p ')
    .replace(/<w:tab[^>]*\/>/g, '\t')
    .replace(/<[^>]+>/g, '')
    .split('\n')
    .map((l) => decode(l).replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
};

const folders = readdirSync(SRC, { withFileTypes: true }).filter((d) => d.isDirectory());
let n = 0;
for (const f of folders) {
  // docx 可能直接在街道目录下，也可能多套一层同名目录（如东美古街）
  const base = join(SRC, f.name);
  let dir = base;
  try {
    const inner = readdirSync(base, { withFileTypes: true });
    if (inner.every((x) => x.isDirectory()) && inner.length === 1) dir = join(base, inner[0].name);
  } catch { /* keep base */ }
  const docs = readdirSync(dir).filter((x) => x.endsWith('.docx'));
  const slugSafe = f.name.replace(/[\\/:*?"<>|]/g, '');
  for (const d of docs) {
    const kind = d.includes('介绍') ? 'intro' : d.includes('口述') ? 'story' : 'misc';
    try {
      const text = docxText(join(dir, d));
      writeFileSync(join(OUT, `${slugSafe}__${kind}.txt`), text, 'utf8');
      n++;
      console.log('ok', slugSafe, kind, text.length, 'chars');
    } catch (e) {
      console.error('FAIL', slugSafe, d, e.message);
    }
  }
}
console.log('TOTAL', n);
