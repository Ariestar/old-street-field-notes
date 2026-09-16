// 字体子集化：把霞鹜文楷按「本站实际会渲染的字符」裁一遍。
//
// @fontsource/lxgw-wenkai 虽然把文件命名成 latin-*-normal，实际是 7-8MB 的完整 CJK 字面，
// 直接用会把 8MB 塞进首屏。这里从 src/ 的文本语料收集用到的字，重新子集化成 woff2。
//
//   bun scripts/subset-font.mjs
//
// 产物：src/assets/fonts/*.woff2 + src/styles/fonts.css
import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import subsetFont from 'subset-font';

const WEB = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = join(WEB, 'src');
const OUT_DIR = join(SRC, 'assets/fonts');
const CSS_OUT = join(SRC, 'styles/fonts.css');
const PKG = join(WEB, 'node_modules/@fontsource/lxgw-wenkai/files');

// 只保留实际用到的字重：正文 500（Medium），标题 700
const WEIGHTS = [
  { weight: 500, file: 'lxgw-wenkai-latin-500-normal.woff2' },
  { weight: 700, file: 'lxgw-wenkai-latin-700-normal.woff2' },
];

const TEXT_EXT = new Set(['.ts', '.tsx', '.css', '.html', '.json']);

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (TEXT_EXT.has(extname(p))) out.push(p);
  }
  return out;
}

// ---- 语料：src 下的全部文本 + index.html ----
const files = [...walk(SRC), join(WEB, 'index.html')].filter((f) => existsSync(f));
let corpus = '';
for (const f of files) corpus += readFileSync(f, 'utf8');

// 只留有字形意义的码点，丢掉控制符
const used = new Set();
for (const ch of corpus) {
  const cp = ch.codePointAt(0);
  if (cp >= 0x20) used.add(ch);
}
// 兜底字符：数字、常见标点、省略号等，防止动态拼接时缺字
const ALWAYS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz①②③④⑤·—…「」《》（）、，。：；！？　%‰°/-+×÷';
for (const ch of ALWAYS) used.add(ch);

const text = [...used].join('');
const cjk = [...used].filter((c) => c.codePointAt(0) >= 0x2e80).length;
console.log(`语料：${files.length} 个文件，去重 ${used.size} 字（其中 CJK ${cjk}）`);

mkdirSync(OUT_DIR, { recursive: true });

const faces = [];
for (const { weight, file } of WEIGHTS) {
  const srcPath = join(PKG, file);
  const input = readFileSync(srcPath);
  const out = await subsetFont(input, text, { targetFormat: 'woff2' });
  const outName = `lxgw-wenkai-${weight}.woff2`;
  writeFileSync(join(OUT_DIR, outName), out);
  const mb = (out.length / 1024 / 1024).toFixed(2);
  const kb = (out.length / 1024).toFixed(0);
  console.log(
    `weight ${weight}: ${(input.length / 1024 / 1024).toFixed(2)}MB -> ${kb}KB (${mb}MB)  ${outName}`,
  );
  faces.push({ weight, outName });
}

const css = `/* 由 scripts/subset-font.mjs 生成，请勿手改。
   霞鹜文楷按本站语料子集化（SIL OFL）。重新生成：bun scripts/subset-font.mjs */
${faces
  .map(
    ({ weight, outName }) => `@font-face {
  font-family: 'LXGW WenKai';
  font-style: normal;
  font-weight: ${weight};
  font-display: swap;
  src: url('../assets/fonts/${outName}') format('woff2');
}`,
  )
  .join('\n\n')}
`;
writeFileSync(CSS_OUT, css);
console.log(`已写出 ${CSS_OUT}`);
