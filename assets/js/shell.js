/* ==========================================================================
   xingyub-skeleton / assets/js/shell.js
   骨架模板的外壳脚本。四件事：
     1. SITE 配置 —— 站点级信息的唯一来源
     2. 挂载 masthead / colophon / tools 到 data-shell 占位节点
     3. 交互 —— 主题、抽屉（含焦点陷阱）、回顶、骨架模式
     4. ICON —— 内联 SVG 图标集，1.5px 描边

   图标为什么是内联 SVG 而不是 emoji：emoji 在不同系统上字形完全不同、
   无法继承 currentColor、也无法统一描边粗细。它们是「AI 生成网页」最明显
   的指纹之一。
   ========================================================================== */

const SITE = {
  name: "xingyub's blog",
  latin: "archive",          // 品牌右侧的等宽小标
  tagline: "计算化学 · 机器学习 · 软件工程",

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

  socials: [
    { label: "GitHub", href: "#" },
    { label: "Email", href: "#" },
    { label: "RSS", href: "#" },
    { label: "Bilibili", href: "#" },
  ],

  colophon: {
    copyright: "© 2026 {{站点名}}",
    built: "手写 HTML / CSS",
    uptime: "运行 0 天",
    stack: ["Noto Serif SC", "IBM Plex Mono"],
    icp: { label: "萌ICP备00000000号", href: "#" },
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
        ${SITE.name}<i>${SITE.latin}</i>
      </a>
      <nav class="masthead__nav" aria-label="站内导航" data-slot="nav">
        ${SITE.nav
          .map((n) => `<a href="${n.href}" data-route="${n.route}">${n.label}</a>`)
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
      .map((n) => `<a href="${n.href}" data-route="${n.route}">${n.label}</a>`)
      .join("")}
  </div>`,

  colophon: () => `
  <footer class="colophon" data-slot="colophon">
    <div class="colophon__inner">
      <span>${SITE.colophon.copyright.replace("{{站点名}}", SITE.name)}</span>
      <span>${SITE.colophon.built} · {{托管平台}}</span>
      <span data-slot="colophon-runtime">
        ${SITE.colophon.uptime} · ${SITE.colophon.stack.join(" / ")}
      </span>
      <a href="${SITE.colophon.icp.href}">${SITE.colophon.icp.label}</a>
    </div>
  </footer>`,

  socials: () => `
  <div class="facts" data-slot="socials">
    ${SITE.socials
      .map(
        (s) => `<div class="facts__row"><span class="facts__k">${s.label}</span>` +
          `<a class="facts__v" href="${s.href}">${icon("external", 13)}</a></div>`
      )
      .join("")}
  </div>`,

  tools: () => `
  <div class="tools" data-slot="tools">
    <button class="iconbtn" type="button" data-theme-toggle aria-label="切换主题">${icon("moon")}</button>
    <button class="iconbtn is-hidden" type="button" data-to-top aria-label="回到顶部">${icon("up")}</button>
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
      scope.querySelector(`[data-route="${current}"]`)?.setAttribute("aria-current", "page");
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
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", dark ? "#16140e" : "#f7f4ec");
}

function setupTheme() {
  document.documentElement.dataset.theme = store.get("skeleton-theme") || (prefersDark() ? "dark" : "light");
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

  const open = () => {
    drawer.classList.add("is-open");
    document.body.classList.add("drawer-open");
    trigger?.setAttribute("aria-expanded", "true");
    focusables()[0]?.focus();
  };

  const close = () => {
    const wasOpen = drawer.classList.contains("is-open");
    drawer.classList.remove("is-open");
    document.body.classList.remove("drawer-open");
    trigger?.setAttribute("aria-expanded", "false");
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
  const toTop = document.querySelector("[data-to-top]");
  const onScroll = () => toTop?.classList.toggle("is-hidden", window.scrollY < 400);
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
  const toggle = () => document.documentElement.classList.toggle("show-slots");
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
   筛选标签
   ------------------------------------------------------------------------- */
function setupChips() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-chip]");
    if (!btn) return;
    btn.closest(".chips")?.querySelectorAll("[data-chip]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
  });
}

// 逐项初始化并各自兜底：任何一个环节失败都不影响其余交互。
function boot() {
  [mountShell, setupTheme, setupDrawer, setupScroll, setupSlotMode, setupChips].forEach((fn) => {
    try { fn(); } catch (err) { console.warn("[skeleton]", fn.name, err); }
  });
}

document.addEventListener("DOMContentLoaded", boot);
