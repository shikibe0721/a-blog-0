# shikibe's blog

一个纯静态的个人博客。手写 HTML / CSS，没有构建步骤，双击 `index.html` 就能预览。

视觉是 **Apple 液态玻璃（Liquid Glass）**：半透明材质 + 背景模糊 + 顶部高光棱边 + 大圆角胶囊，配色是纯灰阶（强调色就是墨本身），字体全程无衬线。设计系统见 §7。

当前站点内容已清空 —— 各列表页显示空状态，等你往里填。站点级信息（站名、导航、社交）集中在一个 `SITE` 对象里。

---

## 1. 怎么用

1. 双击 `index.html` 直接预览（纯静态，无需构建、无需联网）。
2. 按 **`G`** 键或点报头右侧的网格按钮 → 打开**骨架模式**：所有可填充区域会描边并标出 `data-slot` 名称。
3. 改站点级信息（站名、导航、社交、页脚）只需动 `assets/js/shell.js` 顶部的 `SITE` 对象。
4. 往各列表页里填内容：把空状态（`.blank`）换成真实条目即可，组件类都已经备好。

---

## 2. 目录结构

```
a-blog-0/
├── index.html            首页（目录）
├── timeline.html         归档（账本式点线索引）
├── chatter.html          杂谈
├── photowall.html        照片墙
├── projects.html         项目
├── moments.html          说说
├── music.html            音乐
├── tree.html             灵境（可视化实验）
├── friends.html          友链
├── about.html            关于
├── post.html             文章详情模板
├── chatter-detail.html   杂谈详情模板
├── skeleton.html         骨架屏参考页
├── 404.html              未命中页（Cloudflare not_found_handling 用）
└── assets/
    ├── css/skeleton.css       设计令牌 + 组件层（约 700 行）
    ├── js/shell.js            站点配置 + 外壳挂载 + 图标集 + 交互
    ├── js/theme-init.js       首屏主题预设（避免闪烁）
    └── img/
        ├── favicon.svg        站标（玻璃胶囊 + 墨色书签）
        └── placeholder.svg    图片占位
```

---

## 3. 站点地图

| 路由 | 文件 | 导航名 |
|---|---|---|
| `/` | `index.html` | 首页 |
| `/timeline` | `timeline.html` | 归档 |
| `/chatter` | `chatter.html` | 杂谈 |
| `/photowall` | `photowall.html` | 照片墙 |
| `/projects` | `projects.html` | 项目 |
| `/moments` | `moments.html` | 说说 |
| `/music` | `music.html` | 音乐 |
| `/tree` | `tree.html` | 灵境 |
| `/friends` | `friends.html` | 友链 |
| `/about` | `about.html` | 关于 |
| `/posts/:slug` | `post.html` | — |
| `/chatter/:slug` | `chatter-detail.html` | — |
| — | `skeleton.html` | 骨架屏 |
| — | `404.html` | 未命中 |

> 页面间是普通 `<a>` 跳转，不含前端路由与数据请求。详情页现在是与具体内容无关的**模板**，填内容时复制一份改字段即可。

---

## 4. 页面语法（每页一致）

固定的五段结构，不允许自由发挥 —— 页面之间不一致是「看不出逻辑」的主因：

```
报头               浮空玻璃胶囊 + 分段控件导航              ← 每页都有
页头 folio        胶囊编号 + 大标题 + 导语                 ← 每页都有
工具条 toolbar     搜索胶囊 + 筛选胶囊                      ← 列表页都有，位置固定
区块标记 section-mark   玻璃胶囊标签（§ 01.1 · 全部记录）   ← 每个内容区块前都有
内容              四选一：目录列表 / 账本 / 卡片网格 / 图版网格
页脚 colophon      玻璃板
```

| 页面类型 | 结构 |
|---|---|
| 列表页（归档 / 杂谈 / 照片墙 / 项目 / 说说 / 音乐 / 友链） | folio → toolbar → mark → 内容 |
| 首页 | folio → toolbar → mark → 内容 + 边栏 |
| 工具页（灵境 / 骨架屏） | folio → mark → 内容 |
| 详情页（文章 / 杂谈详情） | article-head → mark → 正文 + 边栏 |

区块标记是「区块用途看不清」的解药：每个内容区前面都有一行等宽小字说明这块是什么。

---

## 5. 往里填内容

### 5.1 站点级信息：只改 `SITE`

`assets/js/shell.js` 顶部的 `SITE` 是站点级信息的唯一来源：

```js
const SITE = {
  name: "shikibe's blog",     // 报头站名
  latin: "notes",             // 站名右侧的等宽小标
  tagline: "记录 · 随笔 · 收藏",

  nav: [ /* 导航项：label / href / route */ ],

  socials: [                  // 边栏「联系」事实表
    { label: "GitHub", href: "#" },
    { label: "Email", href: "#" },
    { label: "RSS", href: "#" },
  ],

  colophon: {
    copyright: "© 2026 {{站点名}}",   // {{站点名}} 会被替换成 SITE.name
    built: "手写 HTML / CSS",
    host: "托管平台待填",              // 会显示成「手写 HTML / CSS · 托管平台待填」
    uptime: "运行 0 天",
    stack: ["SF Pro", "PingFang SC"],
    icp: { label: "备案号待填", href: "#" },
  },
};
```

改完这里，报头、页脚、边栏、抽屉菜单会一起更新。**不需要逐页去改。**

> `SITE` 里所有文本与 URL 都会过 `esc()` / `safeUrl()` 再拼进模板（见 §8）。

### 5.2 列表页：把空状态换成条目

每个列表页当前都是一段空状态：

```html
<div class="blank">
  <p class="blank__title">暂无记录</p>
  <p class="blank__desc">还没有收录任何文章或杂谈。写下第一篇后，它会出现在这里。</p>
</div>
```

替换成对应组件即可：

| 页面 | 组件 | 类 |
|---|---|---|
| 首页 / 杂谈 / 说说 / 音乐 | 目录行 | `.entry`（`.entry__meta` + `.entry__title` + `.entry__excerpt`） |
| 归档 | 账本行 | `.ledger__row`（日期 + 标题 + 点线 + 标签） |
| 项目 / 友链 | 索引卡 | `.index-card` |
| 照片墙 | 图版 | `.plate` |

### 5.3 详情页：复制模板改字段

`post.html` 与 `chatter-detail.html` 是与内容无关的模板，正文里用 `{{...}}` 标出待填位置：

- `{{文章标题}}` / `{{导语}}` / `{{编号}}` / `{{YYYY-MM-DD}}`
- 正文用标准 HTML：`<h2 id="sec-1">`、`<p>`、`<blockquote>`、`<pre><code>`、`<ul>`、`<table>`
- 侧栏的「本篇目录」锚点要跟正文里的 `id` 对上

> 图片一律用 `assets/img/placeholder.svg` 占位，`alt` 写清楚内容。
> **不要用 `src=""`**（会让浏览器重新请求当前文档），**也不要让内容图 `alt` 留空**（屏幕阅读器会整段跳过）。

### 5.4 骨架屏

每个骨架的形状和它对应的真实组件**一一对应** —— 目录行骨架和 `.entry` 同栅格，索引卡骨架和 `.index-card` 同盒模型，数据到位时切换不跳动。通用转圈圈等于没做：用户看不出「将要出现的是什么」。

| 变体 | 对应组件 |
|---|---|
| `entry:N` | `.entry` 目录行 |
| `card:N` | `.index-card` 索引卡 |
| `plate:N` | `.plate` 图版 |
| `prose:N` | 正文段落（行宽不等，模仿真实断行） |

```html
<div data-skeleton="entry:4">  ...真实内容...  </div>
```

载入时脚本渲染 4 行骨架；数据到位后调用 `Skeleton.clear(el)` 还原真实内容。预览用 `data-skeleton-hold="1600"`，正式页面不要带它。

演示页：**`skeleton.html`**（每块 1.6 秒后自动还原）。

---

## 6. 全站共用外壳

`<div data-shell="header">` / `<div data-shell="colophon">` / `<div data-shell="socials">` 是挂载点，由 `shell.js` 注入。

| 区域 | 槽位 | 说明 |
|---|---|---|
| 报头 | `header` | **浮起来的玻璃胶囊**：外层透明、内层毛玻璃，导航是分段控件（当前项是一枚浮起的胶囊） |
| 移动端 | `drawer` | ≤1040px 显示菜单按钮；`Esc` 关闭、**焦点陷阱**、滚动锁、焦点归还 |
| 页脚 | `colophon` | 一块玻璃板：版权 / 构建 / 运行时长 / 技术栈 / 备案 |
| 边栏 | `socials` | 由 `SITE.socials` 渲染成事实表 |
| 工具条 | `tools` | 左下：只有「回顶」一个按钮，滚动 400px 后整条出现 |

`body` 属性开关：

- `data-route="/photowall"` → 高亮对应导航项
- `data-tools="off"` → 关闭左下工具条

> 主题切换只在报头出现一次。两个入口是冗余，不是便利。

> ⚠️ **属性命名冲突**：`body` 上的开关属性**不能和子元素的挂载钩子同名**。
> `document.querySelector("[data-x]")` 按文档序会先命中 `<body>`。

### 报头断点

| 视口宽度 | 行为 |
|---|---|
| > 1180px | 完整导航，胶囊内边距 12px |
| 1040–1180px | 导航胶囊内边距收到 8px，字号 13px |
| ≤ 1040px | 收起导航，改用抽屉 |

导航项一律 `white-space: nowrap` —— 报头胶囊高度固定 56px，中文标签一旦折行就会溢出。

---

## 7. 设计系统

### 7.1 令牌

风格是 **Liquid Glass**：半透明材质 + 背景模糊 + 顶部高光棱边 + 大圆角胶囊。
色彩是**纯灰阶** —— 强调色就是「墨」本身，全站没有一个彩色。

令牌命名描述的是**材质**而不是颜色。读到 `--glass-hi-ln` 就知道那是玻璃受光的那条边。

| 令牌 | 浅色 | 深色 | 用途 |
|---|---|---|---|
| `--page` | `#eef0f3` | `#000000` | 页面底 —— 环境光渐变落在这一层 |
| `--ink` | `#0b0b0d` | `#f5f5f7` | 正文，也是唯一的强调色（实心按钮 / 选中态） |
| `--ink-2` | `#4d4d55` | `#b0b0b8` | 次级 |
| `--ink-3` | `#6b6b74` | `#8a8a92` | 三级 / 元信息 |
| `--glass` | 白 58% | 白 3% 的墨 52% | 常规面板（卡片 / 行 / 侧栏） |
| `--glass-hi` | 白 72% | 白 3% 的墨 66% | 浮层（报头 / 抽屉 / 工具条） |
| `--glass-lo` | 白 34% | 白 5% | 凹陷面（输入框 / 分段控件轨道） |
| `--glass-line` | 墨 7% | 白 10% | 面板描边 |
| `--control-line` | 墨 16% | 白 22% | **胶囊控件描边**（比面板实一档） |
| `--glass-hi-ln` | 白 90% | 白 16% | 顶部高光棱边 —— 材质的灵魂 |

**玻璃的三层配方**（`§3` 里那一条 `.glass` 规则组）：

1. 半透明底 —— 让背后的环境光透出来
2. `backdrop-filter: blur() saturate(180%)` —— 把透出来的东西糊成一片光，而不是可读的细节
3. `inset 0 1px 0` 白色 —— 模拟玻璃受光的那一条上棱边

**少任何一件，玻璃都会塌成一块灰色半透明方块。**

> ⚠️ 环境光渐变（`body::before`）不是装饰。`backdrop-filter` 需要有东西可糊 ——
> 没有那三团柔光，模糊出来是一片纯色，玻璃等于没做。

**深色不是把浅色反过来，是另起一套。** 四条经验：

1. **底色压到纯黑。** 深色下玻璃靠「比底色亮一点点 + 一条白色棱边」成立。
2. **高光棱边要更强。** 浅色 90% → 深色 16%（看似变弱，但相对黑底的亮度差更大）。
3. **噪点要压得更低。** 浅色 2.2% → 深色 1.3%，否则低亮度上会显成脏点。
4. **不给深色配暖色。** 灰阶就是灰阶，加一点暖就会读成「脏棕」。

### 7.2 对比度基线（WCAG AA，正文 ≥4.5:1）

改色前先对一遍这张表。比值均对**页面底**实测：

| 组合 | 浅色 | 深色 |
|---|---|---|
| `--ink` on `--page` | 17.22:1 | 19.29:1 |
| `--ink-2` on `--page` | 7.33:1 | 9.75:1 |
| `--ink-3` on `--page` | 4.62:1 | 6.13:1 |

面板描边（`--glass-line`）刻意只有 1.16:1 —— 玻璃的收边不该是你第一眼看到的东西。

> ⚠️ **已知边界：控件的边界对比度达不到 3:1。**
> `--control-line` 在浅色下是 1.42:1，低于 WCAG 2.2 SC 1.4.11 要求的 3:1。
> 这是液态玻璃这个材质本身的代价：浅灰底 + 白色玻璃控件，边界天然低对比。
> 控件的可识别性主要落在**文字标签**上（`--ink-2` 7.33:1，远超要求）。
> 要做到 3:1 只能上中灰描边，那会直接毁掉玻璃的观感 —— 这是一个刻意的取舍，
> 不是疏漏。若你的场景必须过 1.4.11，把 `--control-line` 改成 `--ink-3` 即可。

### 7.3 字体与间距

**全程无衬线。** 两个族，分工明确：

| 令牌 | 值 | 用途 |
|---|---|---|
| `--font` | `-apple-system` / SF Pro / PingFang SC / 微软雅黑 | 标题、正文、导航、按钮 —— **一切** |
| `--mono` | SF Mono / Menlo | 只给代码块 |

无衬线需要比衬线更松的正文行高（1.72）和更紧的大字号字距（`-0.028em`）—— 这两条不是偏好，是无衬线的光学补偿。

- 间距基数 **4px**：`--s1` 4 · `--s2` 8 · `--s3` 12 · `--s4` 16 · `--s5` 20 · `--s6` 24 · `--s8` 32 · `--s10` 40 · `--s12` 48 · `--s16` 64 · `--s20` 80 · `--s24` 96
- 圆角：`--r-pill` 999px（**所有控件**）· `--r-2xl` 28 · `--r-xl` 22 · `--r-lg` 16 · `--r-md` 12 · `--r-sm` 8
- 模糊：`--blur` 20px（面板）· `--blur-strong` 30px（浮层）
- 动效：见 §7.4

### 7.4 动效

正文按块**淡入 + 12px 上浮 + 极轻微缩放**，`--dur-enter` 340ms，`--stagger` 50ms 依次错开，只给前四块排延迟。

曲线只有三条，都有出处，**没有一条是随手写的**：

| 令牌 | 值 | 用在 |
|---|---|---|
| `--ease` | `ease` | 悬停 / 颜色变化 —— 不给颜色变化配重曲线 |
| `--ease-out` | `cubic-bezier(0.23, 1, 0.32, 1)` | 一切「进入 / 离开 / 出现」 |
| `--ease-drawer` | `cubic-bezier(0.32, 0.72, 0, 1)` | 抽屉（位移大时才需要） |

**没有 `ease-in`。** 它起步慢，正好拖住用户正在盯着的那一刻 —— 200ms 的 `ease-in` 感觉上比 200ms 的 `ease-out` 更慢。

时长：`--dur-fast` 140ms（悬停 / 按压）· `--dur` 240ms（抽屉 / 浮层）· `--dur-slow` 380ms。

三条刻意的选择：

- **只动 `transform` 和 `opacity`。** 这两个属性跳过布局和绘制，走 GPU。
- **入场不用 `scale(0)`。** 从 `0.99` 起 —— 现实里没有东西是从「无」里冒出来的。
- **报头与页脚只做淡入，不做位移。** 顶栏滑一下会让人觉得整个页面在抖。

> ⚠️ **悬停位移必须做指针门控。** 触摸设备上点按会补发一次 `:hover`，
> 卡片会先跳起来再落回去 —— 一次点按看到两段位移。
> 所以凡是「悬停才发生的位移」都关在 `@media (hover: hover) and (pointer: fine)` 里。
> 颜色与投影的变化不在此列：它们在触摸上是无害的。

`prefers-reduced-motion` 下保留 80ms 淡入，并关掉全部悬停位移 —— 要的是少动，不是不动。

### 7.5 核心组件

| 组件 | 类 | 用途 |
|---|---|---|
| 报头 | `.masthead` + `.masthead__inner` | **浮空玻璃胶囊**；外层透明、内层毛玻璃 |
| 导航 | `.masthead__nav` | **分段控件**：整体是凹陷轨道，当前项是浮起的胶囊 |
| 页码头 | `.folio` + `.folio__num` / `__title` / `__desc` | 胶囊编号 + 大标题 + 导语 |
| 章节标记 | `.section-mark` | 玻璃胶囊（⚠️ 必须 `display:flex` + `width:fit-content`，见下） |
| **目录行** | `.entry` | 签名组件：编号列 + 内容列，**独立的玻璃板**，悬停抬升 |
| 头条 | `.lead-entry` | 目录行的放大版，28px 圆角大板 |
| 账本 | `.ledger` + `.ledger__row` / `__leader` | 胶囊索引行（归档页） |
| 索引卡 | `.index-card` | 项目 / 友链的玻璃卡 |
| 图版 | `.plate` | 图像带框 + 图注 |
| 边栏注 | `.margin-note` | 玻璃板旁注 |
| 事实表 | `.facts` | 键值对齐（侧栏 / 关于页） |
| 控件 | `.btn` · `.field` · `.chip` · `.tag` | **一律胶囊**，同高 38px（触摸设备 44px） |
| 空状态 | `.blank` | 无框留白；`.blank--tall` 才是玻璃板 |
| 分栏 | `.split` | 内容 + 272px 边栏 |
| 工具 | `.mt-3`…`.mt-12` · `.mb-5`…`.mb-10` · `.maxw-sm` / `--md` | 只用令牌值的间距工具 |

> ⚠️ **`.section-mark` 必须写 `display: flex` + `width: fit-content`，不能写 `inline-flex`。**
> 它落在 `<p>` 上，改成 `inline-flex` 会让相邻的两个章节标记掉进同一个行盒里并排显示。
>
> ⚠️ **`.split` 里的 `.section-mark` 必须 `grid-column: 1 / -1`。**
> 详情页（`post` / `chatter-detail`）把章节标记放在了 `.split` 里面，而它是第一个子元素 ——
> 不跨列的话栅格会把它当第一列，正文被挤到 272px 的右栏、侧栏掉到第二行，整页塌掉。

**页面里没有任何 inline style** —— 需要间距就加工具类。

---

## 8. 安全约定

模板本身没有后端，但有几条边界必须在往里填内容时守住。

### 8.1 配置值一律走 `esc()`

`SITE` 里的文本和 URL 会直接拼进模板字符串。`shell.js` 已经把所有插值点包了转义：

```js
function esc(v) {
  return String(v ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
```

**自己加新的配置项时，照做。** 一个 `&` 就能破坏页面结构；如果 `SITE` 的值来自 CMS 或用户输入，那就是直接的 XSS。

### 8.2 `Skeleton.show()` 不转义

`Skeleton.show(el, variant, count)` 只渲染内置的形状模板，是安全的。
**但如果你接了真实数据**（比如把接口返回的标题填进骨架），必须自己转义：

```js
el.innerHTML = entries.map((e) => `<h2>${esc(e.title)}</h2>`).join("");
```

### 8.3 URL 必须过 `safeUrl()`，不能只过 `esc()`

`esc()` 转义的是 HTML 实体，**对协议毫无作用** ——
`<a href="javascript:alert(1)">` 转义完还是可点击执行。所以进 `href` 的值走 `safeUrl()`：

```js
function safeUrl(v) {
  const url = String(v ?? "").trim();
  const colon = url.indexOf(":"), slash = url.indexOf("/");
  // 没有 scheme，或冒号在第一个斜杠之后 = 相对路径 / 锚点 / 查询串
  if (colon === -1 || (slash !== -1 && colon > slash)) return esc(url);
  if (/^(https?|mailto|tel):/i.test(url)) return esc(url);
  return "#";   // javascript: / data: / vbscript: … 一律降级
}
```

判定规则是「**看 scheme 位置**」而不是「看前缀像不像」：`index.html` 没有冒号所以放行，`https://x.com` 冒号在斜杠前所以查白名单，`javascript:x` 冒号在斜杠前且不在白名单所以拦截。

### 8.4 CSP

13 页都带了：

```
default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:;
font-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'
```

**没有 `'unsafe-inline'`** —— 代价是页面里不能有任何内联脚本、内联 `<style>`、`style="..."` 属性、`on*` 事件属性。
这也是为什么主题预设拆成了 `assets/js/theme-init.js` 而不是内联在 `<head>`。

> ⚠️ **`frame-ancestors` 在 `<meta>` 里会被静默忽略**（它只在 HTTP 响应头里生效）。
> 需要防嵌入（点击劫持）的话，必须在服务器响应头里加，`<meta>` 加不了。

### 8.5 外链必须带 `rel="noopener noreferrer"`

`target="_blank"` 的链接会让新页面拿到 `window.opener`，可被反向导航（tabnabbing）。
`SITE.socials` 的渲染已经带上了。填真实外链时照做。

### 8.6 `localStorage` 的值必须过白名单

`localStorage` 是可被改写的存储。主题值在写进 `dataset.theme` 之前会校验：

```js
["light", "dark"].includes(saved) ? saved : (prefersDark() ? "dark" : "light")
```

### 8.7 锚点与选择器

- 属性选择器拼接已改用 `CSS.escape()` —— route 里若含引号或反斜杠，直接拼进 `querySelector` 会抛 `SyntaxError`
- `[id]` 上设了 `scroll-margin-top`，锚点跳转不会被吸顶报头盖住

---

## 9. 部署

### 9.1 Cloudflare Workers（推荐）

纯静态站，**不需要写 Worker 脚本** —— 没有 `main` 字段就是纯资源托管，零计费调用。

```bash
npm i -g wrangler
wrangler login
wrangler deploy
```

配置已经建好，开箱可用：

| 文件 | 作用 |
|---|---|
| `wrangler.jsonc` | `assets.directory: "."` + `not_found_handling: "404-page"` |
| `.assetsignore` | 排除 `.git` / `wrangler.jsonc` / `README.md` 等不该上传的文件 |
| `_headers` | 真实 HTTP 响应头（见 §9.4） |
| `404.html` | 未命中时返回，带真正的 404 状态码 |

> **为什么站点留在仓库根目录而不是挪进 `public/`**：README 承诺「双击 index.html 即可预览」。
> 挪进子目录会破坏这个用法。改用 `.assetsignore` 排除不该上传的文件，两边都保住。

> ⚠️ **`.gitignore` 和 `.assetsignore` 是两份独立清单，别以为一份管两件事。**
> 比如 `node_modules/` 只在 `.gitignore` 里 —— 如果本地跑过 `npm i wrangler`（没加 `-g`），
> 它不会被 git 跟踪，但**会被 `wrangler deploy` 整个上传到 CDN**。
> 加依赖或换工具链时，两份清单都要过一遍。

### 9.2 从 GitHub 自动部署（Workers Builds）

Cloudflare 可以直接拉这个仓库，push 后自动部署。

```
Dashboard → Workers & Pages → Create application
  → Import a repository → 选本仓库，生产分支 main
  → Worker 名称填 a-blog-0
  → Build command：留空（纯静态，无构建步骤）
  → Deploy command：npx wrangler deploy
  → Preview command：npx wrangler preview
  → 打开「启用预览构建」
```

之后的行为：

- push 到 `main` → 部署到生产
- push 到其他分支 → 创建**该分支独立的 Worker Preview**，有自己的 Preview URL、配置与资源隔离
- Preview URL 永远指向该分支最新部署；每次部署另有固定 URL，可用于回看具体某次

#### ⚠️ Worker Preview 与 Version URL 不是一回事

| | Worker Preview | Version URL |
|---|---|---|
| 命令 | `npx wrangler preview` | `npx wrangler versions upload` |
| 用途 | **分支 / PR 隔离测试** | 测试某个已上传的版本 |
| 配置与资源 | 独立的 Preview 配置，可指向隔离资源 | 沿用该版本已有配置，**不创建分支隔离环境** |
| Workers Builds 的 Preview command | **用这个** | 不等价，不要拿来替代 |

`npx wrangler preview` **当前是有效命令**。它要求 Wrangler **4.135.0 或更高**，
`package.json` 已把版本固定在 `4.135.0`。

#### Worker 名称必须与配置完全一致

仪表板里的 Worker 名称必须与 `wrangler.jsonc` 的 `name` 完全一致，两边都是 `a-blog-0`。
不一致会导致构建失败。

### 9.3 本地部署

```bash
npm install
npm run dev       # 本地起服务，行为与线上一致
npm run preview   # 创建当前分支的 Cloudflare Worker Preview
npm run deploy    # 部署到生产
```

> `package.json` 里**没有构建脚本** —— 这个站零构建。
> 那个文件存在的两个目的：固定 Wrangler 版本（Workers Builds 会读它），以及提供上面这三个脚本。

> `wrangler.jsonc` 里的 `previews` 块是 **Worker Preview 要求的**，可以留空。

### 9.4 `_headers` 是必须的，不是锦上添花

有些 CSP 指令**只在响应头里生效**，写进 `<meta>` 会被浏览器静默忽略 ——
最典型的就是 `frame-ancestors`（防点击劫持）。

页面里的 `<meta>` CSP 保留着，是给 `file://` 本地预览和其他托管用的；
Cloudflare 上用 `_headers` 补上完整版（多了 `frame-ancestors` 和几个安全响应头）。

### 9.5 ⚠️ 缓存：没有内容哈希就不能 immutable

`_headers` 里**故意没有**给 `/assets/*` 设 `max-age=31536000, immutable`。

因为文件名里**没有内容哈希** —— `skeleton.css` 就是 `skeleton.css`，每次改版覆盖同一路径。
设成一年不可变，老访客会永远拿到旧样式，而且**重新部署也修不好**（浏览器根本不回源问）。

| 方案 | 前提 | 本站 |
|---|---|---|
| `immutable` + 一年 | 文件名带内容哈希 | ✗ 未做构建 |
| `max-age=0, must-revalidate` | 无 | ✓ 现在用的 |

### 9.6 其他托管

同为纯静态，Netlify / Vercel / GitHub Pages / 任意对象存储都能直接放。
注意它们的响应头配置文件名不同（Netlify 也叫 `_headers`，Vercel 用 `vercel.json`），
但 `frame-ancestors` 那条无论在哪都必须在响应头里加。

---

## 10. 已知边界

- 页面间为普通 `<a>` 跳转，不含前端路由与数据请求。
- 灵境页的可视化区（`canvas-stage`）只留了一块等高留白，没有跑渲染循环。
- 图片占位统一用 `assets/img/placeholder.svg`，`alt` 写成图片描述。
- 外壳依赖脚本：脚本不可用时靠每页的 `<noscript>` 静态导航兜底，但那只是应急。
- 首屏主题由 `<head>` 内联脚本（`theme-init.js`）在样式表之前设好，无闪烁。
- 触摸设备上控件自动提到 44px（`@media (pointer: coarse)`），桌面保持 38px。
- 已带基础打印样式（`@media print`）：去掉环境光、噪点、报头、工具条，强制浅色，外链附 URL。
- **玻璃在 `backdrop-filter` 不可用时自动降级**：`@supports not` 里把半透明度拉到 90% 以上，
  否则文字会浮在环境光上读不清。这条不是可选项 —— 少了它，旧浏览器上整站不可读。
- **控件的边界对比度低于 WCAG 2.2 SC 1.4.11 的 3:1**（浅色 1.42:1）。这是液态玻璃材质的
  固有代价，取舍理由见 §7.2。需要过 1.4.11 时把 `--control-line` 改成 `--ink-3`。

---

## 11. 改这个站时的四条自检

1. **换色测试** —— 把配色换成 slate + blue，如果看起来没差多少，说明颜色是默认值不是选择。
   本项目是纯灰阶，这条要反过来测：**加任何一点彩色都应该是刺眼的**，那才说明灰阶是刻意的。
2. **眯眼测试** —— 模糊看，还能分出正文区、导航、主行动吗？层级太平就会糊成一片。
   玻璃面板靠投影分层，投影一弱就全糊在一起 —— 这条对本项目尤其有效。
3. **签名测试** —— 能指出五个具体的签名元素吗？
   （本项目：浮空玻璃胶囊报头、分段控件导航、胶囊徽标、大圆角玻璃卡、顶部高光棱边）
4. **令牌测试** —— 把 CSS 变量名念出来。念着像某个产品，还是像在填模板？
   （`--glass-hi-ln` 念出来就是「玻璃顶部高光棱边」，不是 `--surface-3`）
