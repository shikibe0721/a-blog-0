# shikibe's blog

一个纯静态的个人博客。手写 HTML / CSS，没有构建步骤，双击 `index.html` 就能预览。

视觉是 **Apple 液态玻璃（Liquid Glass）**：玻璃做成「棱镜」而不是「模糊」—— 四边棱线高光 + 内侧折射暗环 + 45° 对角扫掠；配色纯灰阶（强调色就是墨本身），字体全程无衬线，间距字号全部 rem（跟随系统字号缩放）。设计系统见 §7。

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
├── admin.html            在线写作后台（登录后改文章 / 发布 / 删除）
├── post.html             文章阅读页 —— 按 ?slug= 从接口取内容
├── post-1.html           文章：blog1,先看this（静态，可导入后台）
├── post-2.html           文章：My Second Blog Post（静态，可导入后台）
├── post-3.html           文章：My Third Blog Post（静态，可导入后台）
├── post-4.html           文章：My Fourth Blog Post（静态，可导入后台）
├── chatter-detail.html   杂谈详情模板
├── skeleton.html         骨架屏参考页
├── 404.html              未命中页（Cloudflare not_found_handling 用）
├── worst-case.html       最坏数据压测夹具（不部署，见 .assetsignore）
└── assets/
    ├── css/skeleton.css       设计令牌 + 玻璃材质 + 组件层（约 1500 行）
    ├── css/blog.css           动态渲染的少量补充（[hidden] 修正、加载/空状态）
    ├── css/admin.css          后台专用（只在 admin.html 加载）
    ├── js/shell.js            站点配置 + 外壳挂载 + 图标集 + 交互
    ├── js/theme-init.js       首屏主题预设（避免闪烁）
    ├── js/blog-api.js         接口客户端 + 安全 markdown 渲染 + 页面注水
    ├── js/admin.js            后台逻辑（登录 / 列表 / 编辑器 / 发布）
    ├── seed/posts.json        现有 4 篇的种子数据，供后台一键导入
    └── img/
        ├── favicon.svg        站标（玻璃胶囊 + 墨色书签）
        └── placeholder.svg    图片占位
```

> 接口那一侧（Cloudflare Worker + KV）是**另一个仓库**：`a-blog-0-api`。
> 两个 Worker 各管各的，静态站挂了不影响后台，后台挂了前台仍有静态兜底。见 §5.5 与 §9.6。

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
| `/posts/:slug` | `post.html?slug=…` | — （在线文章，从接口读） |
| — | `post-1.html` … `post-4.html` | — （静态文章，可导入后台） |
| `/chatter/:slug` | `chatter-detail.html` | — |
| — | `admin.html` | 后台（页脚有入口，`noindex`） |
| — | `skeleton.html` | 骨架屏 |
| — | `404.html` | 未命中 |

> 页面间是普通 `<a>` 跳转。**首页与归档会在运行时向接口取一次文章列表**，
> 拿到内容就替换掉静态条目，拿不到就什么都不做 —— 静态 HTML 里的条目就是兜底。
> 所以「双击 index.html 就能看」这条承诺仍然成立，只是看到的会是静态那份。

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
  tagline: "欢迎来到我的博客",

  greetings: [                // 首页那句轮换的标语（点「换一句」按顺序走）
    "今天也是元气满满的一天！✨",
    "Ciallo～(∠・ω< )⌒☆",
    // ...
  ],

  nav: [ /* 导航项：label / href / route */ ],

  socials: [                  // 边栏「联系」事实表
    // handle 是「看得见的那一半」：只给一个外链图标的话，
    // 访客不知道要联系的是哪个账号，还得点进去才知道。
    { label: "Telegram", href: "https://t.me/Shikibe0721", handle: "@Shikibe0721" },
    { label: "GitHub",   href: "https://github.com/shikibe0721", handle: "@shikibe0721" },
    { label: "X",        href: "https://x.com/Shikibe_MayuX", handle: "@Shikibe_MayuX" },
    { label: "WhatsApp", href: "https://wa.me/8618121434090", handle: "+86 181 2143 4090" },
    { label: "Email",    href: "mailto:shikibe0721@gmail.com", handle: "shikibe0721@gmail.com" },
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

> `socials` 里只有 `http(s)` 链接会加 `target="_blank"`。
> `mailto:` 加新窗口没有意义 —— 有些邮件客户端会因此开出一个空白标签页。

### 5.2 列表页：条目怎么加

首页与归档已经填好了（4 篇文章）。其余列表页还是空状态：

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

**列表按时间倒序**，`№` 是记录自己的编号（不是它在列表里的名次）——
所以首页上会看到 `№ 001 · 2026-08-19` 排在 `№ 004 · 2022-08-08` 前面。
编号是身份，排序是时间，两者不必一致。

### 5.3 详情页：两条路

**推荐走后台。** `admin.html` 里新建一篇、填标题和正文、点保存，前台立刻就有 ——
不用碰任何文件，不用重新部署。详见 §5.5。

`post.html` 现在是**阅读页**，不是模板：它按 `?slug=` 从接口取内容渲染。
访问时不带 slug（或 slug 不存在）会显示一个明确的空状态，而不是一片空白。

想手写静态页也可以 —— `post-1.html` … `post-4.html` 就是四份填好的范例：

- 结构照抄，正文用标准 HTML：`<h2>`、`<p>`、`<blockquote>`、`<pre><code>`、`<ul>`、`<table>`
- 侧栏「本篇目录」的锚点要跟正文里的 `id` 对上
- 标签用 `<span class="tag"># 标签</span>` 放在正文末尾
- 手写页与在线文章可以共存，但**手写页不在接口里** ——
  想让它出现在首页目录里，就在后台「导入」一次（见 §5.5）

> `chatter-detail.html` 仍然是空模板，用 `{{...}}` 标出待填位置，没有接接口。

> 短文章可以省掉封面图与「本篇目录」两栏 —— 没有图就不要放占位图，
> 没有小节就不要给空目录。**空的结构比没有结构更糟。**

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

### 5.5 在线后台：在浏览器里写文章

打开 **`admin.html`**（页脚也有入口），输一次管理密码，之后：

| 操作 | 结果 |
|---|---|
| 新建文章 / 改标题 / 改正文 | 点「保存」写进 Workers KV |
| 发布状态切到「已发布」 | 前台首页、归档、文章页刷新即可见 |
| 「导入现有 4 篇」 | 把仓库里 `post-1` … `post-4` 的正文搬进在线存储，之后就能在后台改了 |
| 「前台打开」 | 新标签页打开这篇的线上地址 |
| 「删除」 | 从 KV 里移除，**不可撤销** |

正文是 **Markdown**：`## 标题`、`**粗体**`、`*斜体*`、`` `代码` ``、`[链接](url)`、
`- 列表`、`> 引用`、```` ```代码块``` ````。点「预览」可以在编辑器里就地看渲染结果。
**不支持表格和图片** —— 半吊子支持比不支持更让人困惑。

#### 它是怎么连上的

```
浏览器  admin.html ──fetch──▶  a-blog-0-api（Cloudflare Worker）
                                    │
                                    └─▶ Workers KV（文章存这儿）

首页 / 归档 / post.html ──fetch──▶ 同一个接口，读已发布的文章
                              └─ 拿不到就保留静态 HTML，什么都不做
```

**接口地址**写在 `assets/js/blog-api.js` 顶部：

```js
const DEFAULT_API_BASE = "https://a-blog-0-api.YOUR-SUBDOMAIN.workers.dev";
```

部署完 Worker 之后把它换成真实地址即可。也可以不改代码，在后台页展开
「接口地址」填进去 —— 那个值存在浏览器 localStorage 里，只影响你自己这台设备，
适合先试一下再决定要不要写进源码。

#### 三件必须知道的事

1. **密码只存在 Worker 里。** 页面这边登录后拿到的是一个 7 天有效的签名令牌
   （`localStorage` 的 `blog-admin-token`）。令牌是**无状态**的 ——
   服务端不存会话，改 `TOKEN_SECRET` 就等于把所有设备踢下线。
2. **`ALLOWED_ORIGINS` 不要长期留 `*`。** 部署后改成静态站的确切地址（见 §9.6）。
3. **未保存的改动会拦你。** 切文章、关页面、点退出都会问一句。
   后台最容易出的不是报错，是「以为存了」。

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

报头用**两条规则**决定「显示完整导航还是收起成抽屉」：

| 判断依据 | 条件 | 说明 |
|---|---|---|
| 容器宽度（主力） | 胶囊 < 58rem | `@container masthead (max-width: 58rem)` |
| 视口宽度（兜底） | ≤ 1040px | `@media`，给不支持容器查询的浏览器 |

**为什么主力是容器查询而不是 media query**：视口宽度判断有个致命盲区 ——
用户把系统字号调到 200% 时视口没变，但胶囊里需要两倍的空间，
media query 完全看不出来，导航会硬撑着把工具按钮顶出屏幕。
容器查询量的是胶囊的实际宽度，而且阈值写 `rem` 会跟着字号一起放大。

导航项一律 `white-space: nowrap`；品牌可缩可裁（`flex: 0 1 auto` + `overflow: hidden`），
窄屏（≤520px）还会收起右侧的拉丁小标 —— 空间不够时它第一个让位。

---

## 7. 设计系统

### 7.1 令牌

风格是 **Apple Liquid Glass**。色彩是**纯灰阶** —— 强调色就是「墨」本身，全站没有一个彩色。
令牌命名描述的是**材质**而不是颜色：读到 `--rim-hi` 就知道那是玻璃棱上被打亮的那条边。

| 令牌 | 浅色 | 深色 | 用途 |
|---|---|---|---|
| `--page` | `#eef0f3` | `#000000` | 页面底 —— 环境光渐变落在这一层 |
| `--ink` | `#0b0b0d` | `#f5f5f7` | 正文，也是唯一的强调色（实心按钮 / 选中态） |
| `--ink-2` | `#4d4d55` | `#b0b0b8` | 次级 |
| `--ink-3` | `#6b6b74` | `#8a8a92` | 三级 / 元信息 |
| `--glass-fill` | 白 50% | 白 6% | 常规面板（卡片 / 行 / 侧栏） |
| `--glass-fill-hi` | 白 64% | 白 10% | 浮层（报头 / 抽屉 / 工具条） |
| `--glass-fill-lo` | 白 26% | 白 3% | 凹陷面（输入框 / 分段控件轨道） |
| `--glass-edge` | 白 72% | 白 14% | 外描边 —— 只负责把玻璃从背景里切出来 |
| `--rim-hi` | 白 95% | 白 52% | **棱边高光** —— 材质的关键 |
| `--rim-hi-soft` | 白 58% | 白 20% | 同一束光在外圈散开的那一层 |
| `--rim-dark` | 墨 14% | 黑 55% | **内侧暗环** —— 玻璃的厚度 |
| `--sheen` | 白 72% | 白 22% | 45° 对角高光扫掠 |

**玻璃是「棱镜」，不是「模糊」。** 结构有三层，`§3` 里那组规则就是它：

1. **棱边（rim）** —— 六层 `inset box-shadow`。四条窄的（1.5px）是芯，
   四条宽的（5px）是外圈散光，再加一层 1.5px 的内侧暗环。
   光在玻璃的四条边上被打亮，内侧那圈暗是玻璃厚度造成的折射。
2. **高光扫掠（sheen）** —— 45° 对角渐变，只在两个对角亮起来。
3. **投影（drop）** —— 大而软。玻璃是「浮起来」的，不是「贴上去」的。

模糊反而是配角，而且**越小的玻璃越薄**：小控件 3px（背后看得清），面板 16px，浮层 24px。

> ⚠️ **高光层压在文字下方靠的是 `isolation: isolate` + `z-index: -1`。**
> 伪元素用 `position: absolute` 会默认盖在文字上面 —— 高光扫过标题会把字洗淡。
> 建一个层叠上下文，再把伪元素放到负 z 层，它就落在「填充之上、文字之下」。
> 这样不用给每个子元素加 `position: relative`。

> ⚠️ **环境光渐变（`body::before`）不是装饰。** `backdrop-filter` 需要有东西可糊 ——
> 没有那三团柔光，模糊出来是一片纯色，玻璃等于没做。

**深色不是把浅色反过来，是另起一套。** 四条经验：

1. **底色压到纯黑。** 深色下玻璃靠「比底色亮一点点 + 一条白色棱边」成立。
2. **内侧暗环换成黑色。** 浅色下暗环是墨（14%），深色下必须是黑（55%）。
3. **噪点要压得更低。** 浅色 2.2% → 深色 1.3%，否则低亮度上会显成脏点。
4. **不给深色配暖色。** 灰阶就是灰阶，加一点暖就会读成「脏棕」。

### 7.2 对比度基线（WCAG AA，正文 ≥4.5:1）

改色前先对一遍这张表。比值均对**页面底**实测：

| 组合 | 浅色 | 深色 |
|---|---|---|
| `--ink` on `--page` | 17.22:1 | 19.29:1 |
| `--ink-2` on `--page` | 7.33:1 | 9.75:1 |
| `--ink-3` on `--page` | 4.62:1 | 6.13:1 |

面板描边（`--glass-edge`）刻意只有 1.16:1 —— 玻璃的收边不该是你第一眼看到的东西。
玻璃的**可识别性主要落在棱边高光和投影上**，不靠描边。

> ⚠️ **已知边界：玻璃的收边对比度达不到 3:1。**
> 这是液态玻璃这个材质本身的代价：浅灰底 + 白色玻璃控件，边界天然低对比。
> 控件的可识别性落在**文字标签**上（`--ink-2` 7.33:1，远超 WCAG AA）。
> 若你的场景必须过 WCAG 2.2 SC 1.4.11 的 3:1，把 `--glass-edge` 改成 `--ink-3` 即可 ——
> 代价是玻璃会变成「描边盒子」，失去材质感。这是一个刻意的取舍，不是疏漏。

### 7.3 字体与间距

**全程无衬线。** 两个族，分工明确：

| 令牌 | 值 | 用途 |
|---|---|---|
| `--font` | `-apple-system` / SF Pro / PingFang SC / 微软雅黑 | 标题、正文、导航、按钮 —— **一切** |
| `--mono` | SF Mono / Menlo | 只给代码块 |

无衬线需要比衬线更松的正文行高（1.72）和更紧的大字号字距（`-0.028em`）—— 这两条不是偏好，是无衬线的光学补偿。

> ⚠️ **间距、字号、控件高度全部用 `rem`，这是刻意的。**
> 用户把系统字号调大（Dynamic Type），整个布局要跟着放大 ——
> 用 px 的话只有文字变大，盒子不变，字会挤破容器。
> 这也是为什么 `body` 上不写死 `font-size`。

- 间距基数 **4px**，全部 rem：`--s1` 0.25 · `--s2` 0.5 · `--s3` 0.75 · `--s4` 1 · `--s5` 1.25 · `--s6` 1.5 · `--s8` 2 · `--s10` 2.5 · `--s12` 3 · `--s16` 4 · `--s20` 5 · `--s24` 6rem
- 圆角：`--r-pill` 999px（**所有控件**）· `--r-2xl` 1.75rem · `--r-xl` 1.375rem · `--r-lg` 1rem · `--r-md` 0.75rem · `--r-sm` 0.5rem
- 模糊：`--blur` 3px（胶囊控件）· `--blur-panel` 16px（面板）· `--blur-float` 24px（浮层）
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

### 7.5 三个偏好信号，各自处理

无障碍不是一个开关，是三个**互相独立**的系统偏好。只做 `reduced-motion` 是常见的不完整：

| 信号 | 做法 |
|---|---|
| `prefers-reduced-motion: reduce` | 保留透明度与颜色，去掉全部位移。**不是「无动效」** —— 完全不动会让「页面已就绪」这个信号消失 |
| `prefers-reduced-transparency: reduce` | 玻璃转**磨砂实色**（填充拉到 94%+），并**撤掉 `backdrop-filter`** —— 实色背景上再模糊只是白烧 GPU |
| `prefers-contrast: more` | 近实色底 + 纯墨描边，`--ink-3` 提到 `--ink-2` |

> ⚠️ **`prefers-contrast` 那条必须同时写 `html[data-theme="dark"]`。**
> 深色主题块的选择器是 `(0,1,1)`，只写 `:root` `(0,1,0)` 会被它压过去 ——
> 深色用户开高对比度会**完全没有效果**。

还有一条不在偏好里但同样必须有的：`@supports not (backdrop-filter)` 降级。
模糊层失效时要把半透明度拉到 92% 以上，否则文字会浮在环境光上读不清。
少了它，旧浏览器上整站不可读。

### 7.6 稳健性：容器不能被内容撑破

用最坏数据压过一轮（夹具留在 `worst-case.html`，见 `.assetsignore`）。
四个真问题，都修了：

| 症状 | 根因 | 修法 |
|---|---|---|
| 200% 字号下整页横向溢出 | `.toolbar__search` 的 `min-width` 写成 rem 值，放大后 440px > 手机视口 | `min-width: 0` |
| 同上，卡片网格撑破 | `minmax(17.5rem, 1fr)` 的下限放大后大于容器 | `minmax(min(17.5rem, 100%), 1fr)` |
| 无空格长英文撑破正文栏 | 只给 `.prose a` 加了 `overflow-wrap`，普通段落漏了 | 加到 `.prose` 上 |
| 报头在窄屏 / 大字号下把工具按钮顶出屏幕 | 导航按**视口宽度**隐藏，但字号放大后视口没变 | 改用**容器查询** |

三条值得记住的：

1. **`overflow-wrap: anywhere`，不要用 `word-break: break-all`。**
   只有 `anywhere` 会**影响 min-content 尺寸** —— 也就是真正把容器收回来。
   而它只在「没有别的断行机会」时才断，正常中英文段落完全不受影响；
   `break-all` 会把 `performance` 这种词从中间劈开。

2. **`rem` 里的 `min-width` 是个陷阱。**
   它在默认字号下看着很合理，用户一放大就变成「比视口还宽」。
   凡是 `min-width` / `minmax()` 的下限，要么用 `0`，要么用 `min(值, 100%)` 夹住。

3. **报头的收缩必须用容器查询，不能用 media query。**
   视口宽度判断有个致命盲区：200% 字号下视口没变，但胶囊里需要两倍的空间。
   容器查询量的是胶囊实际宽度，而且阈值写 `rem` 会跟着字号一起放大 ——
   「字号变大 → 阈值变大 → 更早收起导航」，方向正好是对的。

```css
.masthead__inner { container-type: inline-size; container-name: masthead; }
@container masthead (max-width: 58rem) { .masthead__nav { display: none; } }
```

> 抽屉因此改成**常驻渲染**（只靠 `visibility` / `opacity` 藏），不再靠 media query 开关。
> 因为「该不该显示汉堡」由容器查询决定，而抽屉是报头的兄弟节点，容器查询管不到它。
> `visibility: hidden` 不参与绘制也不接收点击，没有成本。

### 7.7 移动端基线

| 项 | 做法 | 为什么 |
|---|---|---|
| 点按灰块 | `-webkit-tap-highlight-color: transparent` | iOS/Android 会给可点元素盖一层半透明高亮，是最响的「这是个网页」信号 |
| 300ms 点按延迟 | `touch-action: manipulation` | 告诉浏览器「这里不会双击缩放」，`click` 立即触发 |
| 长按选中按钮文字 | 控件上 `user-select: none` | ⚠️ **绝不要加在 `body` 上** —— 正文是内容，用户要能复制 |
| 下拉刷新抢滚动 | `html { overscroll-behavior: none }` | |
| 地址栏导致的溢出 | `100dvh` 而不是 `100vh` | `100vh` 是「地址栏收起后」的高度，加载时会溢出 |
| 刘海 / 灵动岛 | `viewport-fit=cover` + `env(safe-area-inset-*)` | 少了 meta 标签，`env()` 全是 0 |
| 状态栏颜色 | **两条** `theme-color`，按 `prefers-color-scheme` 分开 | 只写一条，浅色模式会拿到深色状态栏（或反过来） |
| 输入框聚焦放大整页 | 输入框 `font-size: 1rem`（≥16px） | ⚠️ 不要用 `maximum-scale=1` 去压 —— 那是无障碍事故，要治因 |

> 主题切换时 `shell.js` 会把**两条** `theme-color` 一起改写。
> 因为「系统浅色 + 手动切深色」这个组合下，生效的是浅色那条，但它该显示深色。
> 两条同写，浏览器取哪条都是对的。

### 7.8 核心组件

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

> 本站现在由**两个 Cloudflare Worker**组成：
>
> | Worker | 仓库 | 类型 |
> |---|---|---|
> | `a-blog-0` | 本仓库 | 纯静态资源托管（没有 `main`，零计费调用） |
> | `a-blog-0-api` | `a-blog-0-api` | 有脚本 + KV 绑定，提供写作接口 |
>
> 下面 §9.1–§9.5 讲静态站这个；§9.6 讲接口那个。
> **静态站不需要接口也能正常跑** —— 接口只是让「在线改文章」这件事成立。

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

### 9.6 第二个 Worker：`a-blog-0-api`

代码在**另一个仓库** `a-blog-0-api`，部署步骤写在那边的 `README.md` 里。这里只说三件必须知道的事：

**① 建好之后要回来改两处地址。**

| 位置 | 改成 |
|---|---|
| `assets/js/blog-api.js` 的 `DEFAULT_API_BASE` | 新 Worker 的地址 |
| `_headers` 里 `connect-src` 的 `https://*.workers.dev` | 建议收窄成那个 Worker 的确切地址 |

**不改第一处，后台会提示「接口地址还没填」** —— 这是刻意的，避免你对着一个
`YOUR-SUBDOMAIN` 的占位地址反复点登录却不知道为什么没反应。

**② `connect-src` 不是可选项。** 少了它，`fetch` 会被浏览器直接拦掉，
控制台报 `Refused to connect`，看起来像接口挂了，其实是 CSP 拦的。
页面 `<meta>` 里那份比 `_headers` 多两个本地来源（`127.0.0.1` / `localhost`），
是给本地联调用的；**两份 CSP 取交集，所以线上并不会因此放宽**。

**③ 静态站和接口是解耦的。** 接口没部署、部署错了、或者临时挂了 ——
首页和归档会安静地退回静态 HTML，文章页会显示「读不到这篇文章」。
**没有一种失败会让整站变成空白。**

### 9.7 其他托管

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
- **玻璃在 `backdrop-filter` 不可用时自动降级**：`@supports not` 里把半透明度拉到 92% 以上，
  否则文字会浮在环境光上读不清。这条不是可选项 —— 少了它，旧浏览器上整站不可读。
- **玻璃的收边对比度低于 WCAG 2.2 SC 1.4.11 的 3:1**（浅色 1.16:1）。这是液态玻璃材质的
  固有代价，取舍理由见 §7.2。需要过 1.4.11 时把 `--glass-edge` 改成 `--ink-3`。
- **报头的导航收起依赖容器查询**（`@container`）。Chrome 105+ / Safari 16+ / Firefox 110+
  都支持；不支持的浏览器会走 `@media` 兜底，但那条在「大字号 + 宽视口」的组合下会漏判。
- **`worst-case.html` 不部署**（列在 `.assetsignore` 里）。它是回归夹具，不是页面。
- **在线文章依赖接口可用。** 接口挂了：首页/归档退回静态条目，文章页显示空状态。
  文章页本身**没有静态兜底** —— 它的内容本来就不在 HTML 里。
- **markdown 只支持一个子集**（见 §5.5）。没有表格、没有图片、没有脚注。
  刻意如此：不支持就说清楚，比半吊子支持好。
- **后台是单管理员单密码。** 没有多用户、没有角色、没有审计日志。
  对一个人的博客够用，对多人协作不够 —— 那需要的是另一套东西。
- **令牌存在 `localStorage`，有效期 7 天。** 共享设备上用完记得点「退出」。
  真正吊销要换 Worker 的 `TOKEN_SECRET`（所有设备一起下线）。
- **`assets/seed/posts.json` 会随站点一起部署。** 里面就是那 4 篇已公开的文章正文，
  没有额外信息泄露；但要知道它是公开可读的。

---

## 11. 改这个站时的四条自检

1. **换色测试** —— 把配色换成 slate + blue，如果看起来没差多少，说明颜色是默认值不是选择。
   本项目是纯灰阶，这条要反过来测：**加任何一点彩色都应该是刺眼的**，那才说明灰阶是刻意的。
2. **眯眼测试** —— 模糊看，还能分出正文区、导航、主行动吗？层级太平就会糊成一片。
   玻璃面板靠**棱边高光和投影**分层，不是靠描边 —— 把 `--rim-hi` 调成透明试试，
   如果画面没塌，说明你根本没在用玻璃的结构。
3. **签名测试** —— 能指出五个具体的签名元素吗？
   （本项目：浮空玻璃胶囊报头、分段控件导航、棱镜式四边高光、45° 对角扫掠、胶囊徽标）
4. **令牌测试** —— 把 CSS 变量名念出来。念着像某个产品，还是像在填模板？
   （`--rim-hi-soft` 念出来就是「棱边高光在外圈散开的那一层」，不是 `--surface-3`）

### 改之前先跑一遍压测

```bash
python3 -m http.server 8000
# 打开 http://localhost:8000/worst-case.html
```

把系统字号调到 200%（或浏览器缩放 200%），再看一遍。
**容器被内容撑破的问题，只有在这种条件下才暴露得出来** —— 默认字号下一切都正常。

### 改了后台或接口之后

后台那条链路（登录 → 编辑 → 发布 → 前台可见）横跨两个仓库，
静态页面自己看不出来对不对。至少手工走一遍：

1. `admin.html` 登录 → 新建一篇 → 状态选「已发布」→ 保存
2. 打开首页，确认这篇出现在目录里、链接是 `post.html?slug=…`
3. 打开那篇，确认标题 / 正文 / 标签都渲染了
4. 把它改成「草稿」再保存，确认首页目录里**消失**、直连链接显示「没有这篇文章」

接口那一侧的逻辑测试在 `a-blog-0-api` 仓库里（`npm test`，26 条断言，不需要联网）。
