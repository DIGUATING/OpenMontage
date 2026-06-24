const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const cjsTarget = path.join(
  root,
  "node_modules",
  "@remotion",
  "studio",
  "dist",
  "components",
  "CompositionSelectorItem.js",
);

const cjsDescriptions = `const compositionDescriptions = {
    Explainer: '通用解释类视频模板',
    CinematicRenderer: '电影感分镜模板',
    SignalFromTomorrowWithMusic: '电影感示例样片',
    TalkingHead: '真人口播/讲解视频模板',
    TitledVideo: '给已有视频加大标题',
    HeroTitle: '单独的大标题片头',
    ProductReveal: '横版产品展示模板',
    ProductRevealVertical: '竖版产品展示模板',
    CaptionOverlayOnly: '只渲染字幕层',
    CollageBurst: '拼贴爆发式混剪模板',
    LyricOverlay: '歌词/诗句字幕模板',
    EndTag: '结尾黑底文字卡',
    EndTagOverlay: '叠加式结尾文字',
};`;

const esmDescriptions = `var compositionDescriptions = {
  Explainer: "通用解释类视频模板",
  CinematicRenderer: "电影感分镜模板",
  SignalFromTomorrowWithMusic: "电影感示例样片",
  TalkingHead: "真人口播/讲解视频模板",
  TitledVideo: "给已有视频加大标题",
  HeroTitle: "单独的大标题片头",
  ProductReveal: "横版产品展示模板",
  ProductRevealVertical: "竖版产品展示模板",
  CaptionOverlayOnly: "只渲染字幕层",
  CollageBurst: "拼贴爆发式混剪模板",
  LyricOverlay: "歌词/诗句字幕模板",
  EndTag: "结尾黑底文字卡",
  EndTagOverlay: "叠加式结尾文字"
};`;

function patchCjs(target) {
  if (!fs.existsSync(target)) {
    throw new Error(`Remotion Studio file not found: ${target}`);
  }

  let source = fs.readFileSync(target, "utf8");

  source = source.replace("const COMPOSITION_ITEM_HEIGHT = 32;", "const COMPOSITION_ITEM_HEIGHT = 58;");

  if (!source.includes("const compositionDescriptions = {")) {
    source = source.replace("const iconStyle = {\n    width: 18,\n    height: 18,\n    flexShrink: 0,\n};", `const iconStyle = {
    width: 18,
    height: 18,
    flexShrink: 0,
};
${cjsDescriptions}`);
  }

  source = source.replace(
    "    whiteSpace: 'nowrap',\n    overflow: 'hidden',\n    textOverflow: 'ellipsis',",
    "    overflow: 'hidden',\n    display: 'flex',\n    flexDirection: 'column',\n    justifyContent: 'center',\n    gap: 2,",
  );

  const descriptionLine = "    const description = item.type === 'composition' ? compositionDescriptions[item.composition.id] : null;\n";
  if (!source.includes("const description = item.type === 'composition'")) {
    source = source.replace("    if (item.type === 'folder') {", `${descriptionLine}    if (item.type === 'folder') {`);
  }

  const oldLabel = 'jsx_runtime_1.jsx("div", { style: label, children: item.composition.id })';
  const newLabel = `jsx_runtime_1.jsxs("div", { style: label, children: [jsx_runtime_1.jsx("div", { style: { fontSize: 13, fontWeight: 600, lineHeight: '16px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: item.composition.id }), description ? jsx_runtime_1.jsx("div", { style: { fontSize: 12, lineHeight: '15px', opacity: 0.78, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }, children: description }) : null] })`;

  if (source.includes(oldLabel)) {
    source = source.replace(oldLabel, newLabel);
  }

  fs.writeFileSync(target, source);
}

function patchEsm(target) {
  if (!fs.existsSync(target)) {
    return;
  }

  let source = fs.readFileSync(target, "utf8");
  if (!source.includes("__remotion-composition") || !source.includes("COMPOSITION_ITEM_HEIGHT")) {
    return;
  }

  source = source.replace("var COMPOSITION_ITEM_HEIGHT = 32;", "var COMPOSITION_ITEM_HEIGHT = 58;");

  source = source.replace(
    '  whiteSpace: "nowrap",\n  overflow: "hidden",\n  textOverflow: "ellipsis"',
    '  overflow: "hidden",\n  display: "flex",\n  flexDirection: "column",\n  justifyContent: "center",\n  gap: 2',
  );

  if (!source.includes("var compositionDescriptions = {")) {
    source = source.replace(
      'var iconStyle = {\n  width: 18,\n  height: 18,\n  flexShrink: 0\n};',
      `var iconStyle = {
  width: 18,
  height: 18,
  flexShrink: 0
};
${esmDescriptions}`,
    );
  }

  if (!source.includes('const description = item.type === "composition"')) {
    source = source.replace(
      '  if (item.type === "folder") {',
      '  const description = item.type === "composition" ? compositionDescriptions[item.composition.id] : null;\n  if (item.type === "folder") {',
    );
  }

  const importMatch = source.match(new RegExp('import \\{ jsx as (jsx\\d+), jsxs as (jsxs\\d+), Fragment as Fragment\\d+ \\} from "react/jsx-runtime";\\nvar COMPOSITION_ITEM_HEIGHT'));
  if (importMatch) {
    const jsxName = importMatch[1];
    const jsxsName = importMatch[2];
    let labelReplacements = 0;
    source = source.replace(
      /\/\* @__PURE__ \*\/ jsx\d+\("div", \{\n\s+style: (label\d*|label),\n\s+children: item\.composition\.id\n\s+\}\)/g,
      (_match, labelVar) => {
        labelReplacements += 1;
        return `/* @__PURE__ */ ${jsxsName}("div", {
            style: ${labelVar},
            children: [
              /* @__PURE__ */ ${jsxName}("div", {
                style: { fontSize: 13, fontWeight: 600, lineHeight: "16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
                children: item.composition.id
              }),
              description ? /* @__PURE__ */ ${jsxName}("div", {
                style: { fontSize: 12, lineHeight: "15px", opacity: 0.78, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
                children: description
              }) : null
            ]
          })`;
      },
    );
    if (labelReplacements > 0) {
      console.log(`Patched ${labelReplacements} composition label(s) in ${path.basename(target)}.`);
    }
  }

  fs.writeFileSync(target, source);
}

patchCjs(cjsTarget);

const esmDir = path.join(root, "node_modules", "@remotion", "studio", "dist", "esm");
if (fs.existsSync(esmDir)) {
  for (const file of fs.readdirSync(esmDir)) {
    if (file.endsWith(".js") || file.endsWith(".mjs")) {
      patchEsm(path.join(esmDir, file));
    }
  }
}

const cacheDir = path.join(root, "node_modules", ".cache", "webpack");
fs.rmSync(cacheDir, { recursive: true, force: true });

console.log("Patched Remotion Studio composition list with Chinese descriptions.");
