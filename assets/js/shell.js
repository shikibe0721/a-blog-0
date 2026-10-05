/* ==========================================================================
   shikibe's blog / assets/js/shell.js
   站点外壳脚本。四件事：
     1. SITE 配置 —— 站点级信息的唯一来源
     2. 挂载 masthead / colophon / tools 到 data-shell 占位节点
     3. 交互 —— 主题、抽屉（含焦点陷阱）、回顶、骨架模式
     4. ICON —— 内联 SVG 图标集，1.5px 描边

   图标为什么是内联 SVG 而不是 emoji：emoji 在不同系统上字形完全不同、
   无法继承 currentColor、也无法统一描边粗细。它们是「AI 生成网页」最明显
   的指纹之一。
   ========================================================================== */

const SITE = {
  name: "shikibe's blog",
  latin: "notes",            // 品牌右侧的等宽小标
  tagline: "欢迎来到我的博客",

  // 首页那句轮换的标语。点「换一句」按顺序走，不做随机 ——
  // 随机容易连着抽到同一条，看起来像没反应。
  greetings: [
    "今天也是元气满满的一天！✨",
    "Ciallo～(∠・ω< )⌒☆",
    "慢慢来，比较快 🐢",
    "代码写不出来就先摸会儿鱼 🐟",
    "每一个 Bug 都是成长的机会 💪",
    "今天的你比昨天更厉害了一点 📈",
    "喝杯水，休息一下再继续 ☕",
    "保持好奇，保持热爱 🔥",
    "你已经很棒了，别忘了夸夸自己 🌟",
    "前端的路很长，但风景很好 🏞️",
  ],

  nav: [
    { label: "首页", href: "index.html", route: "/" },
    { label: "归档", href: "timeline.html", route: "/timeline" },
    { label: "杂谈", href: "chatter.html", route: "/chatter" },
    { label: "照片墙", href: "photowall.html", route: "/photowall" },
    { label: "项目", href: "projects.html", route: "/projects" },
    { label: "说说", href: "moments.html", route: "/moments" },
    { label: "音乐", href: "music.html", route: "/music" },
    { label: "灵境", href: "tree.html", route: "/tree" },
    { label: "友链", href: "friends.html", route: "/friends" },
    { label: "关于", href: "about.html", route: "/about" },
  ],

  // 站点的对外入口。由 shell.js 渲染成关于页与首页侧栏的事实表。
  // handle 是「看得见的那一半」—— 只给一个外链图标的话，
  // 访客根本不知道要联系的是哪个账号，还得点进去才知道。
  socials: [
    { label: "Telegram", href: "https://t.me/Shikibe0721", handle: "@Shikibe0721" },
    { label: "GitHub", href: "https://github.com/shikibe0721", handle: "@shikibe0721" },
    { label: "X", href: "https://x.com/Shikibe_MayuX", handle: "@Shikibe_MayuX" },
    { label: "WhatsApp", href: "https://wa.me/8618121434090", handle: "+86 181 2143 4090" },
    { label: "Email", href: "mailto:shikibe0721@gmail.com", handle: "shikibe0721@gmail.com" },
  ],

  colophon: {
    copyright: "© 2026 {{站点名}}",
    built: "手写 HTML / CSS",
    // ⚠️ 以前这里写的是字面量 "{{托管平台}}"，但模板里没有对应的替换逻辑，
    //    于是 14 页页脚都在给访客显示这串大括号。现在它是一个真实的配置字段，
    //    和「备案号待填」一样，填了就显示填的内容。
    host: "托管平台待填",
    uptime: "运行 0 天",
    stack: ["SF Pro", "PingFang SC"],
    icp: { label: "备案号待填", href: "#" },
  },
};

/* -------------------------------------------------------------------------
   图标集 —— 24×24 视框，1.5px 描边，currentColor
   ------------------------------------------------------------------------- */
const ICON = {
  search: '<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/>',
  moon: '<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z"/>',
  sun: '<circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1"/><rect x="13.5" y="3.5" width="7" height="7" rx="1"/><rect x="3.5" y="13.5" width="7" height="7" rx="1"/><rect x="13.5" y="13.5" width="7" height="7" rx="1"/>',
  up: '<path d="M12 19.5V5M6 11l6-6 6 6"/>',
  menu: '<path d="M3.5 7h17M3.5 12h17M3.5 17h17"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  external: '<path d="M13 5h6v6M19 5l-7.5 7.5"/><path d="M17.5 14v4.5a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-11a1 1 0 0 1 1-1H10"/>',
  tag: '<path d="M3.5 11.5V4.5a1 1 0 0 1 1-1h7l9 9-8 8-9-9z"/><circle cx="8" cy="8" r="1.4"/>',
  calendar: '<rect x="3.5" y="5.5" width="17" height="15" rx="1.5"/><path d="M3.5 10h17M8 3.5v4M16 3.5v4"/>',
  image: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><circle cx="9" cy="10" r="1.6"/><path d="M4 17l5-4.5 4 3.5 3-2.5 4 3.5"/>',
  music: '<path d="M9 18V6l10-2v12"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="16.5" cy="16" r="2.5"/>',
  dot: '<circle cx="12" cy="12" r="3"/>',
};

/* -------------------------------------------------------------------------
   转义
   -------------------------------------------------------------------------
   SITE 配置的值会直接拼进模板字符串。不转义的话，一个 & 或 < 就能破坏
   页面结构；如果 SITE 的值来自 CMS / 用户输入，那就是直接的 XSS。
   凡是配置里的文本与 URL，一律走 esc()。
   ------------------------------------------------------------------------- */
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* URL 白名单。
   esc() 只转义 HTML 实体，对协议毫无作用 ——
   `<a href="javascript:alert(1)">` 点击就会执行，转义救不了。
   凡是进 href 的值，先过 safeUrl()。 */
function safeUrl(value) {
  const url = String(value ?? "").trim();
  const colon = url.indexOf(":");
  const slash = url.indexOf("/");
  // 没有 scheme，或冒号出现在第一个斜杠之后 = 相对路径 / 锚点 / 查询串，安全
  if (colon === -1 || (slash !== -1 && colon > slash)) return esc(url);
  // 有 scheme：只放行这几种
  if (/^(https?|mailto|tel):/i.test(url)) return esc(url);
  // 其余（javascript: / data: / vbscript: …）一律降级为 #，绝不进 href
  return "#";
}

/** 渲染一个图标：icon("search", 16) */
function icon(name, size = 18) {
  const path = ICON[name];
  if (!path) return "";
  return (
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" ` +
    `stroke="currentColor" stroke-width="1.5" stroke-linecap="round" ` +
    `stroke-linejoin="round" aria-hidden="true" focusable="false">${path}</svg>`
  );
}

/* -------------------------------------------------------------------------
   模板片段
   ------------------------------------------------------------------------- */
const tpl = {
  header: () => `
  <header class="masthead" data-masthead>
    <div class="masthead__inner">
      <a class="masthead__brand" href="index.html" data-slot="brand">
        ${esc(SITE.name)}<span>${esc(SITE.latin)}</span>
      </a>
      <nav class="masthead__nav" aria-label="站内导航" data-slot="nav">
        ${SITE.nav
          .map((n) => `<a href="${safeUrl(n.href)}" data-route="${esc(n.route)}">${esc(n.label)}</a>`)
          .join("")}
      </nav>
      <div class="masthead__tools">
        <button class="iconbtn" type="button" data-theme-toggle aria-label="切换主题">${icon("moon")}</button>
        <button class="iconbtn" type="button" data-slot-toggle aria-label="骨架模式（快捷键 G）">${icon("grid")}</button>
        <button class="iconbtn drawer-trigger" type="button" data-drawer-open
                aria-label="打开菜单" aria-controls="site-drawer" aria-expanded="false">${icon("menu")}</button>
      </div>
    </div>
  </header>

  <div class="drawer" id="site-drawer" data-drawer role="dialog" aria-modal="true" aria-label="站内导航">
    <button class="iconbtn drawer__close" type="button" data-drawer-close aria-label="关闭菜单">${icon("close")}</button>
    ${SITE.nav
      .map((n) => `<a href="${safeUrl(n.href)}" data-route="${esc(n.route)}">${esc(n.label)}</a>`)
      .join("")}
  </div>`,

  colophon: () => `
  <footer class="colophon" data-slot="colophon">
    <div class="colophon__inner">
      <span>${esc(SITE.colophon.copyright.replace("{{站点名}}", SITE.name))}</span>
      <span>${esc(SITE.colophon.built)} · ${esc(SITE.colophon.host)}</span>
      <span data-slot="colophon-runtime">
        ${esc(SITE.colophon.uptime)} · ${esc(SITE.colophon.stack.join(" / "))}
      </span>
      <a href="skeleton.html">骨架屏参考</a>
      <!-- 后台入口。放在页脚而不是导航栏：它不是内容，
           每天被访客点一次和每天被自己点十次，是两件不同的事。 -->
      <a href="admin.html" rel="nofollow">后台</a>
      <a href="${safeUrl(SITE.colophon.icp.href)}">${esc(SITE.colophon.icp.label)}</a>
    </div>
  </footer>`,

  socials: () => `
  <div class="facts" data-slot="socials">
    ${SITE.socials
      .map((s) => {
        // 只有 http(s) 才开新窗口 —— mailto: 加 target="_blank" 没有意义，
        // 有些邮件客户端会因此开出一个空白标签页。
        const isHttp = /^https?:/i.test(String(s.href));
        const ext = isHttp ? ' target="_blank" rel="noopener noreferrer"' : "";
        return (
          `<div class="facts__row"><span class="facts__k">${esc(s.label)}</span>` +
          `<a class="facts__v" href="${safeUrl(s.href)}"${ext}>` +
          `${esc(s.handle || s.label)}${icon("external", 12)}` +
          (isHttp ? `<span class="sr-only">（新窗口打开）</span>` : "") +
          `</a></div>`
        );
      })
      .join("")}
  </div>`,

  /* 只放「回到顶部」一个按钮。
     主题切换已经在报头里常驻，不在这里重复第二遍 ——
     两个入口是冗余，不是便利。
     整条工具条在滚动 400px 之前完全不出现，所以不会留下空槽位。 */
  tools: () => `
  <div class="tools" data-tools-bar data-slot="tools">
    <button class="iconbtn" type="button" data-to-top aria-label="回到顶部">${icon("up")}</button>
  </div>`,
};

/* -------------------------------------------------------------------------
   挂载
   ------------------------------------------------------------------------- */
function mountShell() {
  document.querySelectorAll("[data-shell]").forEach((el) => {
    const key = el.getAttribute("data-shell");
    if (tpl[key]) el.outerHTML = tpl[key]();
  });

  if (document.body.dataset.tools !== "off") {
    document.body.insertAdjacentHTML("beforeend", tpl.tools());
  }

  // 高亮当前导航项（限定在导航容器内，避免命中 body 上的同名属性）
  const current = document.body.dataset.route;
  if (current) {
    document.querySelectorAll(".masthead__nav, .drawer").forEach((scope) => {
      // CSS.escape：route 里若含引号或反斜杠，直接拼进选择器会抛 SyntaxError
      const sel = `[data-route="${CSS.escape(current)}"]`;
      scope.querySelector(sel)?.setAttribute("aria-current", "page");
    });
  }
}

/* -------------------------------------------------------------------------
   存储与偏好
   ------------------------------------------------------------------------- */
const store = {
  get(k) {
    try { return localStorage.getItem(k); } catch { return null; }
  },
  set(k, v) {
    try { localStorage.setItem(k, v); } catch { /* file:// 或隐私模式下忽略 */ }
  },
};

function prefersDark() {
  try { return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false; }
  catch { return false; }
}

function syncThemeIcons() {
  const dark = document.documentElement.dataset.theme === "dark";
  document.querySelectorAll("[data-theme-toggle]").forEach((b) => {
    b.innerHTML = icon(dark ? "sun" : "moon");
    b.setAttribute("aria-label", dark ? "切换到浅色主题" : "切换到深色主题");
  });
  // 页面上有两条 theme-color，按 prefers-color-scheme 分开（无 JS 时的默认）。
  // 用户手动切换主题后，两条都要改写 —— 否则「系统浅色 + 手动深色」这个组合
  // 会让状态栏和页面底差一档色。两条同写，浏览器取哪条都是对的。
  // 取值与 skeleton.css 的 --page 保持一致。
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.setAttribute("content", dark ? "#000000" : "#eef0f3");
  });
}

function setupTheme() {
  // localStorage 是可被改写的存储，值必须过白名单再写进 dataset
  const saved = store.get("skeleton-theme");
  document.documentElement.dataset.theme =
    ["light", "dark"].includes(saved) ? saved : (prefersDark() ? "dark" : "light");
  syncThemeIcons();

  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-theme-toggle]")) return;
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    store.set("skeleton-theme", next);
    syncThemeIcons();
  });
}

/* -------------------------------------------------------------------------
   抽屉：Esc 关闭 + 焦点陷阱 + 焦点归还 + 滚动锁
   ------------------------------------------------------------------------- */
function setupDrawer() {
  const drawer = document.querySelector("[data-drawer]");
  const trigger = document.querySelector("[data-drawer-open]");
  if (!drawer) return;

  const focusables = () =>
    [...drawer.querySelectorAll('a[href], button:not([disabled])')].filter(
      (el) => el.offsetParent !== null
    );

  // 抽屉是 aria-modal 的对话框，背景必须对辅助技术不可达。
  // 只做焦点陷阱不够 —— 屏幕阅读器仍能用虚拟光标读到背景内容。
  const backdrop = () =>
    [document.querySelector(".masthead"), document.querySelector("main"), document.querySelector(".colophon")].filter(Boolean);

  const open = () => {
    drawer.classList.add("is-open");
    document.body.classList.add("drawer-open");
    trigger?.setAttribute("aria-expanded", "true");
    backdrop().forEach((el) => el.setAttribute("inert", ""));
    focusables()[0]?.focus();
  };

  const close = () => {
    const wasOpen = drawer.classList.contains("is-open");
    drawer.classList.remove("is-open");
    document.body.classList.remove("drawer-open");
    trigger?.setAttribute("aria-expanded", "false");
    backdrop().forEach((el) => el.removeAttribute("inert"));
    if (wasOpen) trigger?.focus();
  };

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-drawer-open]")) open();
    else if (e.target.closest("[data-drawer-close]")) close();
  });

  document.addEventListener("keydown", (e) => {
    if (!drawer.classList.contains("is-open")) return;

    if (e.key === "Escape") { close(); return; }
    if (e.key !== "Tab") return;

    // 焦点陷阱：Tab 到首尾时回绕，不允许跑进背景内容
    const list = focusables();
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault(); last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault(); first.focus();
    }
  });
}

/* -------------------------------------------------------------------------
   滚动状态
   ------------------------------------------------------------------------- */
function setupScroll() {
  // 工具条整条显隐，而不是隐藏其中一个按钮 ——
  // 用 opacity 藏按钮会留下一个空槽位，看起来像坏掉的控件。
  const tools = document.querySelector("[data-tools-bar]");
  const onScroll = () => {
    tools?.classList.toggle("is-shown", window.scrollY >= 400);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-to-top]")) window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* -------------------------------------------------------------------------
   骨架模式：按 G 描边所有 data-slot
   ------------------------------------------------------------------------- */
function setupSlotMode() {
  const sync = () => {
    const on = document.documentElement.classList.contains("show-slots");
    document.querySelectorAll("[data-slot-toggle]").forEach((b) => b.setAttribute("aria-pressed", String(on)));
  };
  const toggle = () => {
    document.documentElement.classList.toggle("show-slots");
    sync();
  };
  sync();
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-slot-toggle]")) toggle();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "g" || e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = document.activeElement?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;
    toggle();
  });
}

/* -------------------------------------------------------------------------
   首页标语轮换
   -------------------------------------------------------------------------
   原站用的是 Typed.js（CDN 打字机效果）。这里没有照搬，两个原因：
     1. CSP 是 script-src 'self'，不允许外链脚本 —— 引 CDN 就得放宽 CSP，
        而放宽 CSP 换一个打字机动效不值得。
     2. 打字机的逐字跳动和本站克制的材质风格冲突：一句话在屏幕上跳十几下，
        读者会先注意到「在动」而不是「写了什么」。

   改成用户点一下才换、只做交叉淡入。用 WAAPI 而不是 CSS 类切换 ——
   连续点的时候 WAAPI 会从当前值重定向，CSS 过渡在这里要多写一个状态类。
   只在首页存在目标节点时启动，其余页面直接返回。
   ------------------------------------------------------------------------- */
function setupGreeting() {
  const el = document.querySelector("[data-greeting]");
  if (!el) return;
  const btn = document.querySelector("[data-greeting-next]");
  const lines = SITE.greetings || [];
  if (!lines.length) return;

  // 首屏随机起一句，之后按顺序走
  let i = Math.floor(Math.random() * lines.length);
  el.textContent = lines[i];

  if (!btn) return;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  btn.addEventListener("click", () => {
    i = (i + 1) % lines.length;
    // 减少动效时直接换字，不做淡入淡出
    if (reduce || !el.animate) { el.textContent = lines[i]; return; }

    el.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: 120, easing: "ease", fill: "forwards",
    }).finished.then(() => {
      el.textContent = lines[i];
      el.animate([{ opacity: 0 }, { opacity: 1 }], {
        duration: 180, easing: "cubic-bezier(0.23, 1, 0.32, 1)", fill: "forwards",
      });
    });
  });
}

/* -------------------------------------------------------------------------
   筛选标签
   -------------------------------------------------------------------------
   这里只负责「哪一个是选中的」这一件事 —— 单选切换 + 同步 aria-pressed。
   真正的筛选在 setupFilters 里，它读的就是这里维护的 is-active。
   分开的理由：about / tree 这些页面上的胶囊是静态标签或场景选择，
   它们同样需要单选行为，但没有可筛的列表，不该被卷进筛选逻辑。
   ------------------------------------------------------------------------- */
function setupChips() {
  const sync = (b) => b.setAttribute("aria-pressed", String(b.classList.contains("is-active")));

  // 初始同步：HTML 里带 is-active 的那个要同时是 aria-pressed="true"
  document.querySelectorAll("[data-chip]").forEach(sync);

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-chip]");
    if (!btn) return;
    btn.closest(".chips")?.querySelectorAll("[data-chip]").forEach((b) => {
      b.classList.remove("is-active");
      b.setAttribute("aria-pressed", "false");
    });
    btn.classList.add("is-active");
    sync(btn);
    // 换了一类，列表要立刻跟着变
    window.SiteFilter?.apply?.();
  });
}

/* -------------------------------------------------------------------------
   筛选：工具栏里的搜索框 + 分类胶囊
   -------------------------------------------------------------------------
   这些控件在 HTML 里到处都是，但很长一段时间它们只是装饰 ——
   搜索框拦下提交之后什么都不做，胶囊只切换自己的高亮。一个看起来能用
   却什么都不做的控件比没有控件更糟：用户会先怀疑是自己搜错了。

   规则只有两条，都很朴素：
     · 搜索框 —— 对条目的全部可见文字做不区分大小写的子串匹配
     · 胶囊   —— 标签是「全部」时不加条件，否则匹配条目里的
                 .tag / .ledger__tag 文字（去掉开头的 #）
   两者是「与」的关系。

   「条目」= 带 data-filter 的容器的直接子元素。页面上没有 data-filter
   就整个跳过 —— 照片墙那种还没有内容的页面不会因此冒出一句「没有匹配」。
   注水（blog-api.js 换掉列表内容）之后由它调用 SiteFilter.apply() 重放条件。
   ------------------------------------------------------------------------- */
function setupFilters() {
  const lists = [...document.querySelectorAll("[data-filter]")];
  if (!lists.length) return;

  const toolbar = document.querySelector('[data-slot="toolbar"]');
  const input = toolbar?.querySelector('input[type="search"]');
  const chips = [...(toolbar?.querySelectorAll("[data-chip]") || [])];

  // 空结果提示挂在**列表里面**。
  // ⚠️ 不能挂在列表后面：首页 / 杂谈 / 音乐 / 说说 的列表都在 .split 里，
  //    多一个兄弟节点就成了栅格子项，会把右侧边栏挤到第二行去。
  // role="status" 让它同时充当读屏播报 ——
  // 不然「筛完什么都不剩」对屏幕阅读器用户是完全静默的。
  const empties = lists.map((list) => {
    const p = document.createElement("p");
    p.className = "filter-empty";
    p.setAttribute("role", "status");
    p.hidden = true;
    p.textContent = "没有匹配的条目。换个词，或点「全部」看完整列表。";
    list.append(p);
    return p;
  });

  /** 条目上的分类标签文字，去掉 markdown 风格的 # 前缀 */
  const tagsOf = (item) =>
    [...item.querySelectorAll(".tag, .ledger__tag")]
      .map((t) => t.textContent.trim().replace(/^#\s*/, ""))
      .join(" ");

  function apply() {
    const query = (input?.value || "").trim().toLowerCase();
    const active = chips.find((c) => c.classList.contains("is-active"));
    const label = active?.textContent.trim() || "";
    // 「全部」= 不加分类条件
    const category = label === "全部" ? "" : label;

    lists.forEach((list, i) => {
      const empty = empties[i];
      // 注水会把列表内容整个换掉，提示节点也一起被冲走了 —— 先挂回去
      if (empty && empty.parentNode !== list) list.append(empty);

      let shown = 0;
      for (const item of list.children) {
        if (item === empty) continue;   // 提示节点不是条目
        const okText = !query || item.textContent.toLowerCase().includes(query);
        const okCat = !category || tagsOf(item).includes(category);
        const show = okText && okCat;
        item.hidden = !show;
        if (show) shown++;
      }
      if (empty) empty.hidden = shown > 0;
    });
  }

  input?.addEventListener("input", apply);

  // 注水会把列表内容整个换掉，换完得把当前条件重放一遍
  window.SiteFilter = { apply };
}

/* 搜索框包在 form[role=search] 里，回车会提交。
   静态模板没有后端，这里拦下提交，避免刷新页面。
   用 JS 拦而不是 onsubmit 内联属性 —— 内联属性会被 CSP 拦掉。 */
function setupSearch() {
  document.addEventListener("submit", (e) => {
    if (e.target.matches('form[role="search"]')) e.preventDefault();
  });
}

/* -------------------------------------------------------------------------
   骨架屏
   -------------------------------------------------------------------------
   形状与真实组件一一对应：目录行骨架和 .entry 同栅格，索引卡骨架和
   .index-card 同盒模型 —— 数据到位时切换不会跳动。
   通用转圈圈等于没做：用户看不出「将要出现的是什么」。

   用法：
     <div data-skeleton="entry:4">   ...真实内容...   </div>
     数据到位后调用 Skeleton.clear(el) 还原真实内容。
     预览用：再加 data-skeleton-hold="1200"，1.2 秒后自动还原。
   ------------------------------------------------------------------------- */
const SK_TPL = {
  entry: (n) => Array.from({ length: n }, () => `
    <div class="sk-entry">
      <div class="sk-entry__meta"><span class="sk sk-meta"></span><span class="sk sk-meta"></span></div>
      <div class="sk-entry__body">
        <span class="sk sk-title"></span>
        <span class="sk sk-line"></span>
        <span class="sk sk-line sk-line--mid"></span>
      </div>
    </div>`).join(""),

  card: (n) => `<div class="card-grid">${Array.from({ length: n }, () => `
    <div class="sk-card">
      <span class="sk sk-meta"></span>
      <span class="sk sk-title"></span>
      <span class="sk sk-line"></span>
      <span class="sk sk-line sk-line--short"></span>
    </div>`).join("")}</div>`,

  plate: (n) => `<div class="card-grid">${Array.from({ length: n }, () => `
    <div class="sk-plate">
      <span class="sk sk-media"></span>
      <span class="sk sk-line sk-line--short"></span>
    </div>`).join("")}</div>`,

  prose: (n) => `<div class="sk-prose">${Array.from({ length: n }, () => `
    <span class="sk sk-line"></span>`).join("")}</div>`,

  line: (n) => Array.from({ length: n }, () => `<span class="sk sk-line"></span>`).join(""),
};

/* 原始内容存在 Map 里，不写进 data-* 属性。
   写属性会让整段 HTML 出现在 DOM 里、内存翻倍，读出来还要反转义。 */
const skeletonBackup = new Map();
const skeletonReady = new WeakSet();

const Skeleton = {
  /** 把 el 的内容换成骨架，原始内容先存起来 */
  show(el, variant = "entry", count = 4) {
    if (!el) return;
    if (!skeletonBackup.has(el)) skeletonBackup.set(el, el.innerHTML);
    el.setAttribute("aria-busy", "true");
    el.innerHTML = (SK_TPL[variant] || SK_TPL.entry)(count);
  },

  /** 还原原始内容 */
  clear(el) {
    if (!el || !skeletonBackup.has(el)) return;
    el.innerHTML = skeletonBackup.get(el);
    skeletonBackup.delete(el);
    el.removeAttribute("aria-busy");
  },
};

function setupSkeletons() {
  document.querySelectorAll("[data-skeleton]").forEach((el) => {
    if (skeletonReady.has(el)) return; // 防止重复初始化时把骨架又存成原始内容
    skeletonReady.add(el);

    const [variant, count] = String(el.dataset.skeleton).split(":");
    Skeleton.show(el, variant, Number(count) || 4);

    const hold = Number(el.dataset.skeletonHold);
    if (hold > 0) setTimeout(() => Skeleton.clear(el), hold);
  });
}

// 逐项初始化并各自兜底：任何一个环节失败都不影响其余交互。
function boot() {
  [mountShell, setupTheme, setupDrawer, setupScroll, setupSlotMode, setupChips, setupFilters, setupSearch, setupSkeletons, setupGreeting].forEach((fn) => {
    try { fn(); } catch (err) { console.warn("[skeleton]", fn.name, err); }
  });
}

document.addEventListener("DOMContentLoaded", boot);
