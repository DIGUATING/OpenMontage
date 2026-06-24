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

const studioUiTranslations = [
  ["File an issue", "反馈问题"],
  ["Open GitHub Repo", "打开 GitHub 仓库"],
  ["Set input props...", "设置输入参数..."],
  ["Render on web...", "网页渲染..."],
  ["Render...", "渲染..."],
  ["About Remotion", "关于 Remotion"],
  ["Restart Studio Server", "重启 Studio 服务"],
  ["Join Discord community", "加入 Discord 社区"],
  ["Acknowledgements", "鸣谢"],
  ["Changelog", "更新日志"],
  ["License", "许可证"],
  ["Docs", "文档"],
  ["Ask AI", "询问 AI"],
  ["Color Picker", "取色器"],
  ["Timing Editor", "时间编辑器"],
  ["Install packages", "安装软件包"],
  ["Install...", "安装..."],
  ["Preview size", "预览尺寸"],
  ["Preview Size", "预览尺寸"],
  ["Zoom and Pan Gestures", "缩放和平移手势"],
  ["Disable Zoom and Pan Gestures", "关闭缩放和平移手势"],
  ["Enable Zoom and Pan Gestures", "开启缩放和平移手势"],
  ["Show Rulers", "显示标尺"],
  ["Hide Rulers", "隐藏标尺"],
  ["Show Guides", "显示参考线"],
  ["Hide Guides", "隐藏参考线"],
  ["Left Sidebar", "左侧栏"],
  ["Right Sidebar", "右侧栏"],
  ["Transparency as checkerboard", "透明背景显示为棋盘格"],
  ["Show transparency as checkerboard (T)", "透明背景显示为棋盘格 (T)"],
  ["Quick Switcher", "快速切换器"],
  ["Timeline: Set In Mark", "时间轴：设置入点标记"],
  ["Timeline: Set Out Mark", "时间轴：设置出点标记"],
  ["Timeline: Clear In and Out Mark", "时间轴：清除入点和出点标记"],
  ["Timeline: Go to frame", "时间轴：跳转到帧"],
  ["In Mark", "入点标记"],
  ["Out Mark", "出点标记"],
  ["Clear In/Out Marks", "清除入点/出点标记"],
  ["Go to frame", "跳转到帧"],
  ["Go Fullscreen", "进入全屏"],
  ["Fullscreen", "全屏"],
  ["Responsive", "自适应"],
  ["Expanded", "展开"],
  ["Collapsed", "折叠"],
  ["Compositions", "合成列表"],
  ["Assets", "素材"],
  ["Search...", "搜索..."],
  ["Duration ", "时长 "],
  ["Duration", "时长"],
  ["Render", "渲染"],
  ["Fit", "适应"],
  ["Zoom out timeline", "缩小时间轴"],
  ["Zoom in timeline", "放大时间轴"],
  ["Change the playback rate", "更改播放速度"],
  ["Jump to beginning", "跳到开头"],
  ["Step back one frame", "后退一帧"],
  ["Step forward one frame", "前进一帧"],
  ["Loop video", "循环播放"],
  ["Mute video", "静音"],
  ["Unmute video", "取消静音"],
  ["Mark In (I) - right click to clear", "设置入点 (I) - 右键清除"],
  ["Mark Out (O) - right click to clear", "设置出点 (O) - 右键清除"],
  ["Show transparency as checkerboard", "透明背景显示为棋盘格"],
  ["Enter fullscreen preview (F)", "进入全屏预览 (F)"],
  ["Exit fullscreen preview (F)", "退出全屏预览 (F)"],
  ["Enter fullscreen preview", "进入全屏预览"],
  ["Exit fullscreen preview", "退出全屏预览"],
  ["Copy staticFile() name", "复制 staticFile() 名称"],
  ["Open in Explorer", "在资源管理器中打开"],
  ["Open in Finder", "在访达中打开"],
  ["Toggle Left Sidebar", "切换左侧栏"],
  ["Toggle Right Sidebar", "切换右侧栏"],
  ["Actions", "操作"],
  ["Documentation", "文档搜索"],
  ["Play", "播放"],
  ["Pause", "暂停"],
  ["File", "文件"],
  ["View", "视图"],
  ["Tools", "工具"],
  ["Packages", "软件包"],
  ["Help", "帮助"],
];

const studioUiRawFragments = [
  ["Timeline zoom (", "时间轴缩放 ("],
];

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeJsString(value, quote) {
  return value.replace(/\\/g, "\\\\").replace(new RegExp(escapeRegExp(quote), "g"), `\\${quote}`);
}

function replaceQuotedText(source, from, to) {
  let next = source;
  for (const quote of ["'", '"', "`"]) {
    const escapedFrom = escapeJsString(from, quote);
    const escapedTo = escapeJsString(to, quote);
    next = next.replace(
      new RegExp(`${escapeRegExp(quote)}${escapeRegExp(escapedFrom)}${escapeRegExp(quote)}`, "g"),
      `${quote}${escapedTo}${quote}`,
    );
  }
  return next;
}

function patchStudioUiText(source) {
  let next = source;
  for (const [from, to] of studioUiTranslations) {
    next = replaceQuotedText(next, from, to);
  }
  for (const [from, to] of studioUiRawFragments) {
    next = next.replace(new RegExp(escapeRegExp(from), "g"), to);
  }
  return next;
}

function walkJavaScriptFiles(dir, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkJavaScriptFiles(fullPath, files);
    } else if (entry.isFile() && (entry.name.endsWith(".js") || entry.name.endsWith(".mjs"))) {
      files.push(fullPath);
    }
  }

  return files;
}

function patchGenericStudioUi(target) {
  let source = fs.readFileSync(target, "utf8");
  source = patchStudioUiText(source);
  fs.writeFileSync(target, source);
}

function patchCjs(target) {
  if (!fs.existsSync(target)) {
    throw new Error(`Remotion Studio file not found: ${target}`);
  }

  let source = patchStudioUiText(fs.readFileSync(target, "utf8"));

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

  let source = patchStudioUiText(fs.readFileSync(target, "utf8"));
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

const studioDistDir = path.join(root, "node_modules", "@remotion", "studio", "dist");
for (const file of walkJavaScriptFiles(studioDistDir)) {
  patchGenericStudioUi(file);
}

const cacheDir = path.join(root, "node_modules", ".cache", "webpack");
fs.rmSync(cacheDir, { recursive: true, force: true });

console.log("Patched Remotion Studio composition list and Chinese UI labels.");
