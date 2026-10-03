# xingyub-skeleton — 网页骨架模板

从 **xingyub.com** 的页面结构反推出来的通用骨架模板。
只保留「路由 / 分区 / 组件壳 / 视觉令牌」，所有业务内容都换成了 `{{占位}}`，按槽位填充即可复用。

---

## 1. 怎么用

1. 双击 `index.html` 直接预览（纯静态，无需构建、无需联网）。
2. 按 **`G`** 键或点顶栏 `▦` 按钮 → 打开**骨架模式**：所有可填充区域会描边并标出 `data-slot` 名称。
3. 按槽位替换 `{{...}}` 文本、把 `src=""` 补上图片地址，即得到自己的站点。
4. 改站点级信息（站名、导航、社交、页脚）只需动 `assets/js/shell.js` 顶部的 `SITE` 对象。

---

## 2. 目录结构

```
xingyub-skeleton/
├── index.html            首页
├── projects.html         项目矩阵
├── timeline.html         归档与探索
├── photowall.html        光影画廊
├── music.html            音乐馆
├── tree.html             灵境（可视化实验场）
├── moments.html          说说
├── chatter.html          云端杂谈
├── friends.html          友链
├── about.html            个人简介
├── post.html             文章详情
├── chatter-detail.html   杂谈详情
└── assets/
    ├── css/skeleton.css       设计令牌 + 布局 + 组件
    ├── js/shell.js            站点配置 + 外壳挂载 + 交互
    └── img/
        ├── favicon.svg        站点图标（12 页均已引用）
        └── placeholder.svg    图片占位（替换 src 即可）
```

---

## 3. 站点地图（对照原站路由）

| 原站路由 | 模板文件 | 导航名 | 页面标题 |
|---|---|---|---|
| `/` | `index.html` | 首页 | — |
| `/projects` | `projects.html` | 项目 | 项目矩阵 |
| `/timeline` | `timeline.html` | 归档 | 归档与探索 |
| `/photowall` | `photowall.html` | 照片墙 | 光影画廊 |
| `/music` | `music.html` | 音乐 | 音乐馆 |
| `/tree` | `tree.html` | 灵境 | — |
| `/moments` | `moments.html` | 说说 | 说说 |
| `/chatter` | `chatter.html` | 杂谈 | 云端杂谈 |
| `/friends` | `friends.html` | 友链 | 友链 |
| `/about` | `about.html` | 关于 | 个人简介 |
| `/posts/:slug` | `post.html` | — | 文章详情 |
| `/chatter/:slug` | `chatter-detail.html` | — | 杂谈详情 |

原站为 Next.js App Router 项目，模板用同名 HTML 文件平铺替代，路由语义一一对应。

---

## 4. 全站共用外壳

`<div data-shell="header">` / `<div data-shell="footer">` 是挂载点，由 `shell.js` 注入。改一处，全站生效。

| 区域 | 槽位 | 说明 |
|---|---|---|
| 顶栏 | `header` | 固定定位、滚动后磨砂、导航高亮由 `body[data-route]` 决定 |
| 移动端 | `drawer` | ≤1080px 显示右侧胶囊触发钮，展开全屏菜单；`Esc` 可关、打开时锁背景滚动 |
| 社交图标 | `socials` | 由 `SITE.socials` 渲染，首页个人卡用它 |
| 页脚 | `footer` | 版权 / 构建信息 / 运行时长 + 技术栈徽章 / 备案号 |
| 浮动层 | `float-controls` | 左下：主题切换 + 回顶（滚动 320px 后出现） |
| 浮动层 | `mascot` | 右下：吉祥物 + 工具按钮 + 气泡台词 |
| 启动屏 | `splash` | `body[data-splash="on"]` 开启，含兜底超时；同会话只播一次 |

`body` 属性开关：

- `data-route="/photowall"` → 高亮对应导航项
- `data-splash="on"` → 开启启动屏
- `data-floats="off"` → 关闭浮动控件

> 注意属性命名冲突：`body` 上的开关属性**不能和子元素的挂载钩子同名**。
> `document.querySelector("[data-x]")` 按文档序会先命中 `<body>`。启动屏因此拆成
> 开关 `data-splash`（在 body 上）+ 钩子 `data-splash-screen`（在 div 上）。

### 顶栏断点

品牌 + 10 个导航项 + 2 个按钮在 32px 间距下约需 1067px 视口。分三段处理，避免中间区间挤爆：

| 视口宽度 | 行为 |
|---|---|
| > 1180px | 完整导航（间距 32px，显示 `home` 小标） |
| 1080–1180px | 导航间距收到 18px，隐藏小标 |
| ≤ 1080px | 收起导航，改用右侧抽屉 |

导航链接一律 `white-space: nowrap` —— 顶栏高度固定 64px，中文标签一旦折行就会溢出栏体。

---

## 5. 页面槽位清单

**首页 `index.html`**
`home-search` → `profile-card`（`profile-avatar` / `profile-name` / `profile-tagline` / `profile-stats` + `data-shell="socials"`）→ `music-player` → `featured-post` → `album-entry` → `latest-chatter` → `theme-card` → `status-bar`

**归档 `timeline.html`**
`page-head` → `archive-search` → `archive-filters` → `timeline`（按年分组：`timeline__year` + `timeline__item`）→ `timeline-empty`

**项目 `projects.html`**
`page-head` → `project-filters` → `project-grid`（`col-4` 项目卡：缩略图 / 名称 / 说明 / 技术标签）→ `project-empty`

**照片墙 `photowall.html`**
`page-head`（标题 + 副标题 + 搜索）→ `album-grid`（`album` 堆叠纸片卡，hover 显示「N 张照片 / Click to Open」）→ `lightbox-placeholder`

**音乐 `music.html`**
`page-head` → `now-playing`（封面 / 曲名 / 艺术家 / 进度条）→ `playlist` → `music-empty`

**灵境 `tree.html`**
`page-head` → `canvas-stage`（Canvas / WebGL 挂载区）→ `scene-controls` → `scene-notes`

**说说 `moments.html`**
`page-head` → `moments-search` → `moment-feed`（`moment-item`：头像 / 昵称 / 时间 / 心情 / 正文 / 话题 / 可选配图）→ `moments-more`

**杂谈 `chatter.html`**
`page-head` → `chatter-search` → `chatter-filters` → `chatter-masonry`（CSS 多列瀑布流卡片）→ `chatter-more`

**友链 `friends.html`**
`page-head` → `friends-search` → `friend-grid` → `friend-apply`（申请表单字段）

**关于 `about.html`**
`profile-dossier`（`avatar` / `bio-body` 支持标题、列表、引用）→ `contact-card` → `site-meta`

**文章详情 `post.html`**
`post-cover` → `post-head`（标签 / 标题 / 时间 / 阅读量）→ `post-toc` → `post-body`（`prose` 排版：h2/h3/引用/代码块/列表/表格）→ `author-card` → `recommend-card`

**杂谈详情 `chatter-detail.html`**
`chatter-cover` → `chatter-head` → `chatter-body` → `author-card` → `calendar`（有记录的日期加下划线、今天高亮）→ `recent-records`

---

## 6. 设计令牌（`skeleton.css` 顶部 `:root`）

| 令牌 | 值 | 用途 |
|---|---|---|
| `--brand` | `#6366f1` | 主色，导航高亮 / 按钮 / 链接 |
| `--brand-2` | `#a855f7` | 渐变中段 |
| `--brand-3` | `#ec4899` | 渐变末段，槽位描边色 |
| `--bg` / `--fg` | `#f8fafc` / `#0f172a` | 浅色主题底色与文字 |
| `--card` | `rgba(255,255,255,.55)` | 玻璃卡片底 |
| `--r-lg` | `24px` | 卡片圆角 |
| `--maxw` | `1152px` | 常规页宽（`--maxw-wide` 为 1280px） |
| `--font-body` | Noto Serif SC 衬线 | 正文 |
| `--font-ui` | Geist 无衬线 | 标题 / 导航 / 按钮 |

深色主题由 `html[data-theme="dark"]` 覆盖同名变量，主题偏好写入 `localStorage`，首次访问跟随系统。

---

## 7. 常用类速查

| 类 | 作用 |
|---|---|
| `.page` / `.page--wide` | 页面容器，内置顶栏留白 |
| `.card` + `.card__body` | 玻璃卡片；`.card--pad-lg` 加大内边距 |
| `.grid-12` + `.col-4/.col-5/.col-7/.col-8/.col-12` | 12 栅格，≤1024px 自动堆叠 |
| `.media-card` | 大图 + 渐变遮罩 + 文案（`--tall` / `--xl` 加高，`__scrim--left` 左向遮罩） |
| `.masonry` | 瀑布流多列 |
| `.timeline` / `.album` / `.project` / `.player` / `.calendar` | 各页专属组件 |
| `.prose` | 正文排版（含代码块、引用、表格） |
| `.empty` | 空状态 |
| `.stack` / `.row` / `.spread` / `.fill` | 布局工具 |
| `html.show-slots` | 骨架模式，描边所有 `data-slot` |

---

## 8. 已知边界

- 页面间为普通 `<a>` 跳转，不含前端路由与数据请求；接入框架时把 `shell.js` 的 `SITE` 配置与组件壳平移过去即可。
- 粒子背景、吉祥物动画、灯箱在原站是客户端组件，模板里保留结构位与样式，行为需自行接续。
- 图片占位统一用 `assets/img/placeholder.svg`（内联 SVG，不产生额外请求）。**不要用 `src=""`** —— 空 src 会让浏览器重新请求当前文档，N 张图就是 N 次多余请求。替换时直接改 `src` 值即可。
- 首屏主题由 `html[data-theme]` 决定，HTML 里硬编码 `light`，`shell.js` 载入后才切到用户偏好，因此深色用户会看到一次极短的浅色闪烁。介意的话在 `<head>` 里加一段内联脚本提前设 `data-theme`。
- 顶栏 `--header-h` 固定 64px，导航项超过约 10 个时需自行调整断点。
