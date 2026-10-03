/* ==========================================================================
   xingyub-skeleton / assets/js/shell.js
   骨架模板的外壳脚本。职责只有四件事：
     1. SITE 配置 —— 站点级信息的唯一来源（改这里就能改全站导航/页脚）
     2. 挂载 header / footer / 浮动控件到 data-shell 占位节点
     3. 交互 —— 主题切换、移动抽屉、启动屏、滚动状态、回顶、时钟
     4. 骨架模式 —— 按 G 键给所有 data-slot 描边
   页面内容本身不走这里，全部写在各自 HTML 的 data-slot 区域里。
   ========================================================================== */

const SITE = {
  name: "xingyub's blog",
  accent: "の",
  tagline: "home",

  nav: [
    { label: "首页", href: "index.html", route: "/" },
    { label: "项目", href: "projects.html", route: "/projects" },
    { label: "归档", href: "timeline.html", route: "/timeline" },
    { label: "照片墙", href: "photowall.html", route: "/photowall" },
    { label: "音乐", href: "music.html", route: "/music" },
    { label: "灵境", href: "tree.html", route: "/tree" },
    { label: "说说", href: "moments.html", route: "/moments" },
    { label: "杂谈", href: "chatter.html", route: "/chatter" },
    { label: "友链", href: "friends.html", route: "/friends" },
    { label: "关于", href: "about.html", route: "/about" },
  ],

  socials: [
    { label: "GH", href: "#", title: "GitHub" },
    { label: "X", href: "#", title: "X / Twitter" },
    { label: "B", href: "#", title: "Bilibili" },
    { label: "M", href: "#", title: "Email" },
    { label: "R", href: "#", title: "RSS" },
  ],

  footer: {
    uptime: "0天 0小时",
    stack: ["Next.js 15", "React 19", "Tailwind 4"],
    icp: { label: "萌ICP备00000000号", href: "#" },
    copyright: "© 2026 {{站点名}}",
  },
};

/* -------------------------------------------------------------------------
   模板片段
   ------------------------------------------------------------------------- */
const tpl = {
  header: () => `
  <header class="site-header" data-header>
    <div class="site-header__inner">
      <a class="brand" href="index.html" data-slot="brand">
        ${SITE.name}
        <span class="brand__accent">${SITE.accent}</span>
        <span class="brand__tag">${SITE.tagline}</span>
      </a>
      <nav class="main-nav" data-slot="main-nav">
        ${SITE.nav
          .map(
            (n) => `<a class="main-nav__link" href="${n.href}" data-route="${n.route}">${n.label}</a>`
          )
          .join("")}
      </nav>
      <div class="header-actions">
        <button class="icon-btn" type="button" data-theme-toggle title="切换主题" aria-label="切换主题">◐</button>
        <button class="icon-btn" type="button" data-slot-toggle title="骨架模式 (G)" aria-label="骨架模式">▦</button>
      </div>
    </div>
  </header>

  <button class="drawer-trigger" type="button" data-drawer-open aria-label="打开菜单">
    <span></span><span></span><span></span>
  </button>

  <div class="drawer" data-drawer>
    <button class="drawer__close" type="button" data-drawer-close aria-label="关闭菜单">×</button>
    ${SITE.nav
      .map((n) => `<a class="drawer__link" href="${n.href}" data-route="${n.route}">${n.label}</a>`)
      .join("")}
  </div>`,

  footer: () => `
  <footer class="site-footer" data-slot="footer">
    <div class="row row--wrap">
      <span>${SITE.footer.copyright.replace("{{站点名}}", SITE.name)}</span>
      <span>构建于 {{构建工具}} · 托管于 {{托管平台}}</span>
    </div>
    <a href="${SITE.footer.icp.href}">${SITE.footer.icp.label}</a>
  </footer>`,

  floats: () => `
  <div class="float-left" data-slot="float-controls">
    <button class="float-btn" type="button" data-theme-toggle title="切换主题" aria-label="切换主题">◐</button>
    <button class="float-btn is-hidden" type="button" data-to-top title="回到顶部" aria-label="回到顶部">↑</button>
  </div>

  <div class="mascot" data-slot="mascot">
    <div class="mascot__tools">
      <button class="float-btn" type="button" title="占位工具 1">＋</button>
      <button class="float-btn" type="button" title="占位工具 2">🐟</button>
    </div>
    <div class="mascot__stage">🐱</div>
    <div class="mascot__bubble">占位：吉祥物台词 / 随机提示</div>
  </div>`,

  splash: () => `
  <div class="splash" data-splash>
    <div class="splash__ring"></div>
    <h1 class="splash__name">${SITE.name}</h1>
    <p class="splash__status">INITIALIZING SYSTEM</p>
    <div class="splash__track"><span></span></div>
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

  // 浮动控件与启动屏挂到 body 末尾（不依赖页面结构）
  if (document.body.dataset.floats !== "off") {
    document.body.insertAdjacentHTML("beforeend", tpl.floats());
  }
  if (document.body.dataset.splash === "on") {
    document.body.insertAdjacentHTML("beforeend", tpl.splash());
  }

  // 高亮当前导航项（只在导航容器内匹配，避免把 body 也命中）
  const current = document.body.dataset.route;
  if (current) {
    document.querySelectorAll(".main-nav, .drawer").forEach((scope) => {
      scope.querySelector(`[data-route="${current}"]`)?.setAttribute("aria-current", "page");
    });
  }
}

/* -------------------------------------------------------------------------
   交互
   ------------------------------------------------------------------------- */

// file:// 直接打开时部分浏览器会禁用 localStorage，必须容错，
// 否则异常会中断后面的抽屉 / 滚动 / 时钟等初始化。
const store = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* 忽略：隐私模式或 file:// 下不可写 */
    }
  },
};

function prefersDark() {
  try {
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  } catch {
    return false;
  }
}

function setupTheme() {
  document.documentElement.dataset.theme = store.get("skeleton-theme") || (prefersDark() ? "dark" : "light");

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-theme-toggle]");
    if (!btn) return;
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    store.set("skeleton-theme", next);
  });
}

function setupDrawer() {
  const open = () => document.querySelector("[data-drawer]")?.classList.add("is-open");
  const close = () => document.querySelector("[data-drawer]")?.classList.remove("is-open");
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-drawer-open]")) open();
    if (e.target.closest("[data-drawer-close]")) close();
  });
}

function setupScroll() {
  const header = document.querySelector("[data-header]");
  const toTop = document.querySelector("[data-to-top]");
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 8);
    toTop?.classList.toggle("is-hidden", y < 320);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-to-top]")) window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function setupSplash() {
  const splash = document.querySelector("[data-splash]");
  if (!splash) return;
  const hide = () => splash.classList.add("is-done");
  window.addEventListener("load", () => setTimeout(hide, 700));
  setTimeout(hide, 2200); // 兜底，避免资源加载失败时卡在启动屏
}

function setupClock() {
  const el = document.querySelector("[data-clock]");
  if (!el) return;
  const tick = () => {
    const d = new Date();
    const p = (n) => String(n).padStart(2, "0");
    el.textContent = `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
  };
  tick();
  setInterval(tick, 1000);
}

function setupSlotMode() {
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-slot-toggle]")) document.documentElement.classList.toggle("show-slots");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "g" && !e.metaKey && !e.ctrlKey && !e.altKey) {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      document.documentElement.classList.toggle("show-slots");
    }
  });
}

function setupTabs() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    const group = btn.closest(".filters");
    group?.querySelectorAll("[data-filter]").forEach((b) => b.classList.remove("is-active"));
    btn.classList.add("is-active");
  });
}

// 逐项初始化并各自兜底：任何一个环节失败都不影响其余交互。
function boot() {
  [mountShell, setupTheme, setupDrawer, setupScroll, setupSplash, setupClock, setupSlotMode, setupTabs].forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.warn("[skeleton]", fn.name, err);
    }
  });
}

document.addEventListener("DOMContentLoaded", boot);
