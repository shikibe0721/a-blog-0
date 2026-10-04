/* ==========================================================================
   shikibe's blog / assets/js/blog-api.js

   前台与后台共用的那一层：
     1. 接口客户端 —— 所有 fetch 都从这里出去，错误统一成 Error
     2. 安全 markdown 渲染 —— 先转义再上标记，绝不把原文当 HTML 插进 DOM
     3. 页面注水 —— 目录 / 账本 / 文章页按接口内容渲染

   ── 为什么是「注水」而不是「改成前端渲染」 ──────────────────────────────
   静态 HTML 里本来就有内容，接口挂了、JS 没加载、直接双击打开文件 ——
   页面都得照常可读。所以这里的策略是：**只在接口确实返回了内容时才替换**。
   拿不到就什么都不做，用户看到的是静态兜底。

   ── 关于安全 ────────────────────────────────────────────────────────────
   文章正文是作者自己写的，但渲染路径仍然按「不可信输入」处理：
   esc() 先把整段文本转义，之后才把 markdown 标记换成真标签。
   链接额外过一遍 safeHref()，因为转义对 `javascript:` 协议毫无作用。
   ========================================================================== */

/* -------------------------------------------------------------------------
   配置
   -------------------------------------------------------------------------
   ⚠️ 部署完 a-blog-0-api 之后，把这一行换成它给你的地址（形如
      https://a-blog-0-api.<你的子域>.workers.dev）。
      也可以在后台页的「接口地址」里改，会存进 localStorage 覆盖这里。
   ------------------------------------------------------------------------- */
const DEFAULT_API_BASE = "https://a-blog-0-api.YOUR-SUBDOMAIN.workers.dev";

const STORE_KEY = "blog-api-base";

function readStoredBase() {
  try {
    return localStorage.getItem(STORE_KEY);
  } catch {
    return null; // file:// 或隐私模式
  }
}

function writeStoredBase(value) {
  try {
    if (value) localStorage.setItem(STORE_KEY, value);
    else localStorage.removeItem(STORE_KEY);
  } catch {
    /* 存不了就算了，本次会话内仍然有效 */
  }
}

/** 优先级：?api= 参数 > localStorage > 源码里的默认值 */
const API_BASE = (() => {
  const fromQuery = new URLSearchParams(location.search).get("api");
  if (fromQuery) writeStoredBase(fromQuery.replace(/\/+$/, ""));
  return (fromQuery || readStoredBase() || DEFAULT_API_BASE).replace(/\/+$/, "");
})();

/* -------------------------------------------------------------------------
   转义与 URL 白名单
   ------------------------------------------------------------------------- */
function esc(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** 把已经转义过的字符串还原回原样，用于「校验后再一次性转义」。 */
function unesc(value) {
  return String(value ?? "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&"); // 必须最后做，否则 &amp;lt; 会被还原成 <
}

/** 只放行这几种协议。其余（javascript: / data: / vbscript: …）一律降级成 #。 */
function safeHref(escapedValue) {
  const raw = unesc(escapedValue).trim();
  if (/^[a-z][a-z0-9+.-]*:/i.test(raw)) {
    return /^(https?|mailto|tel):/i.test(raw) ? esc(raw) : "#";
  }
  return esc(raw); // 相对路径 / 锚点 / 查询串
}

/* -------------------------------------------------------------------------
   markdown → HTML（子集）
   -------------------------------------------------------------------------
   支持的语法刻意只有这些：h2–h4、粗体、斜体、行内代码、链接、
   无序/有序列表、引用、围栏代码块、分隔线、段落。

   不做表格和图片：表格在窄栏里读起来很差，图片需要上传能力
   （现在的接口只存文本）。**不支持就该保持不支持** ——
   半吊子支持的语法比不支持更让人困惑。

   入参是原始文本，出参是可以直接塞进 innerHTML 的字符串。
   ------------------------------------------------------------------------- */
function inline(escaped) {
  return escaped
    .replace(/`([^`]+)`/g, (_, code) => `<code>${code}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*\w])\*([^*\n]+)\*/g, "$1<em>$2</em>")
    .replace(/(^|\s)_([^_\n]+)_(?=\s|$)/g, "$1<em>$2</em>")
    .replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (_, text, href) => `<a href="${safeHref(href)}">${text}</a>`);
}

function mdToHtml(source) {
  const lines = String(source ?? "").replace(/\r\n?/g, "\n").split("\n");
  const out = [];
  let para = [];
  let list = null;
  let i = 0;

  const flushPara = () => {
    if (!para.length) return;
    out.push(`<p>${inline(esc(para.join(" ")))}</p>`);
    para = [];
  };
  const closeList = () => {
    if (!list) return;
    out.push(`</${list}>`);
    list = null;
  };

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();

    // 围栏代码块：内部原样保留，不做任何行内替换
    const fence = line.match(/^```([\w+-]*)\s*$/);
    if (fence) {
      flushPara();
      closeList();
      const buf = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i].trim())) {
        buf.push(lines[i]);
        i++;
      }
      i++; // 吃掉收尾的 ```
      const lang = fence[1] ? ` class="language-${esc(fence[1])}"` : "";
      out.push(`<pre><code${lang}>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }

    if (!line) {
      flushPara();
      closeList();
      i++;
      continue;
    }

    // 只认 h2–h4：h1 是文章标题，正文里再出现一个会把大纲打乱
    const heading = line.match(/^(#{2,4})\s+(.*)$/);
    if (heading) {
      flushPara();
      closeList();
      const level = heading[1].length;
      out.push(`<h${level}>${inline(esc(heading[2]))}</h${level}>`);
      i++;
      continue;
    }

    if (/^(---|\*\*\*|___)$/.test(line)) {
      flushPara();
      closeList();
      out.push("<hr>");
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      flushPara();
      closeList();
      const buf = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        buf.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote><p>${inline(esc(buf.join(" ")))}</p></blockquote>`);
      continue;
    }

    const bullet = line.match(/^[-*+]\s+(.*)$/);
    const ordered = line.match(/^\d+[.)]\s+(.*)$/);
    if (bullet || ordered) {
      flushPara();
      const want = bullet ? "ul" : "ol";
      if (list !== want) {
        closeList();
        out.push(`<${want}>`);
        list = want;
      }
      out.push(`<li>${inline(esc((bullet || ordered)[1]))}</li>`);
      i++;
      continue;
    }

    closeList();
    para.push(line);
    i++;
  }

  flushPara();
  closeList();
  return out.join("\n");
}

/* -------------------------------------------------------------------------
   接口客户端
   ------------------------------------------------------------------------- */
async function request(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(API_BASE + path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (cause) {
    // 网络层失败（离线 / 地址写错 / 被 CSP 拦下）—— 给一句人话
    const err = new Error("连不上接口。检查网络，或后台页里的「接口地址」是否填对。");
    err.status = 0;
    err.cause = cause;
    throw err;
  }

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    /* 非 JSON（比如被某个代理挡下的 HTML 错误页），下面按状态码兜底 */
  }

  if (!response.ok) {
    const err = new Error((data && data.error) || `请求失败（HTTP ${response.status}）`);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}

function query(params) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== false) qs.set(k, v === true ? "1" : String(v));
  }
  const s = qs.toString();
  return s ? `?${s}` : "";
}

const BlogAPI = {
  base: API_BASE,

  setBase(value) {
    const clean = String(value || "").trim().replace(/\/+$/, "");
    writeStoredBase(clean);
    return clean;
  },

  health: () => request("/api/health"),

  login: (password) => request("/api/login", { method: "POST", body: { password } }),

  /** all=1 会带出草稿，需要令牌。 */
  list: ({ all = false, meta = false, token } = {}) =>
    request(`/api/posts${query({ all, "fields": meta ? "meta" : undefined })}`, { token }),

  get: (slug, token) => request(`/api/posts/${encodeURIComponent(slug)}`, { token }),

  create: (post, token) => request("/api/posts", { method: "POST", body: post, token }),

  save: (post, token) =>
    request(`/api/posts/${encodeURIComponent(post.slug)}`, { method: "PUT", body: post, token }),

  remove: (slug, token) =>
    request(`/api/posts/${encodeURIComponent(slug)}`, { method: "DELETE", token }),

  /** 新建时用：写 POST，其余用 PUT。后台不用关心这个区别。 */
  write: (post, { isNew = false, token } = {}) =>
    isNew ? BlogAPI.create(post, token) : BlogAPI.save(post, token),
};

/* -------------------------------------------------------------------------
   渲染片段
   ------------------------------------------------------------------------- */
const postUrl = (slug) => `post.html?slug=${encodeURIComponent(slug)}`;

function entryHtml(post, index) {
  return (
    `<a class="entry" href="${postUrl(post.slug)}">` +
    `<div class="entry__meta"><span class="entry__no">№ ${String(index).padStart(3, "0")}</span>` +
    `<span class="num">${esc(post.date)}</span></div>` +
    `<div><h2 class="entry__title">${esc(post.title)}</h2>` +
    `<p class="entry__excerpt">${esc(post.excerpt || "（没有摘要）")}</p></div>` +
    `</a>`
  );
}

function ledgerRowHtml(post) {
  return (
    `<a class="ledger__row" href="${postUrl(post.slug)}">` +
    `<span class="ledger__date num">${esc(post.date)}</span>` +
    `<span class="ledger__title">${esc(post.title)}</span>` +
    `<span class="ledger__leader" aria-hidden="true"></span>` +
    `<span class="ledger__tag">文章</span>` +
    `</a>`
  );
}

/* -------------------------------------------------------------------------
   注水
   -------------------------------------------------------------------------
   每一个都以「失败即静默」为原则：接口不可用时页面必须和以前一模一样。
   唯一例外是文章页 —— 那里如果拿不到内容，静态 HTML 只是一句「正在读取」，
   必须换成明确的空状态，否则用户会以为页面坏了。
   ------------------------------------------------------------------------- */

/** 目录页：拿到内容就整体替换，否则保持静态条目 */
async function hydrateCatalog() {
  const el = document.querySelector("[data-catalog]");
  if (!el) return;

  const { posts } = await BlogAPI.list({ meta: true });
  if (!posts.length) return;

  el.innerHTML = posts.map((p, i) => entryHtml(p, i + 1)).join("");
  el.setAttribute("data-hydrated", "1");
}

/** 归档页：同上，换的是账本行 */
async function hydrateLedger() {
  const el = document.querySelector("[data-ledger]");
  if (!el) return;

  const { posts } = await BlogAPI.list({ meta: true });
  if (!posts.length) return;

  el.innerHTML = posts.map(ledgerRowHtml).join("");
  el.setAttribute("data-hydrated", "1");
}

/** 文章页：按 ?slug= 取一篇 */
async function hydratePost() {
  const root = document.querySelector("[data-post-page]");
  if (!root) return;

  const slug = new URLSearchParams(location.search).get("slug");
  const loading = root.querySelector("[data-post-loading]");
  const ready = root.querySelector("[data-post-ready]");
  const empty = root.querySelector("[data-post-empty]");

  const showEmpty = (title, desc) => {
    if (loading) loading.hidden = true;
    if (ready) ready.hidden = true;
    if (!empty) return;
    empty.hidden = false;
    const t = empty.querySelector("[data-empty-title]");
    const d = empty.querySelector("[data-empty-desc]");
    if (t) t.textContent = title;
    if (d) d.innerHTML = desc;
  };

  if (!slug) {
    showEmpty(
      "没指定文章",
      '链接里缺 <code>slug</code> 参数。去 <a href="timeline.html">归档</a> 里挑一篇，' +
        '或者到 <a href="admin.html">后台</a> 写一篇新的。'
    );
    return;
  }

  let post;
  try {
    ({ post } = await BlogAPI.get(slug));
  } catch (err) {
    if (err.status === 404) {
      showEmpty("没有这篇文章", '它可能被删掉了，或者链接里的 slug 不对。去 <a href="timeline.html">归档</a> 看看。');
    } else {
      showEmpty("读不到这篇文章", `${esc(err.message)} <a href="timeline.html">回归档</a>`);
    }
    return;
  }

  const setText = (sel, value) => {
    const node = root.querySelector(sel);
    if (node) node.textContent = value;
  };

  document.title = `${post.title} · shikibe's blog`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute("content", post.excerpt || post.title);

  // 编号按「已发布列表里的位置」算，和目录页保持一致
  let number = "—";
  try {
    const { posts } = await BlogAPI.list({ meta: true });
    const at = posts.findIndex((p) => p.slug === post.slug);
    if (at >= 0) number = String(at + 1).padStart(3, "0");
  } catch {
    /* 编号只是装饰，拿不到就算了 */
  }

  const metaBox = root.querySelector("[data-post-meta]");
  if (metaBox) {
    const bits = [`№ ${esc(number)}`, `<span class="num">${esc(post.date)}</span>`];
    if (post.author) bits.push(esc(post.author));
    for (const tag of post.tags || []) bits.push(`<span class="tag"># ${esc(tag)}</span>`);
    // 用换行而不是空串拼接：flex 容器会忽略纯空白文本节点（视觉不变），
    // 但屏幕阅读器读到的就是分开的几个词，而不是「0012026-10-04shikibe」。
    metaBox.innerHTML = bits
      .map((b) => (b.startsWith("<") ? b : `<span>${b}</span>`))
      .join("\n");
  }

  setText("[data-post-title]", post.title);
  const standfirst = root.querySelector("[data-post-standfirst]");
  if (standfirst) {
    if (post.excerpt) standfirst.textContent = post.excerpt;
    else standfirst.remove();
  }
  setText("[data-post-author]", post.author || "站长");

  const body = root.querySelector("[data-post-body]");
  if (body) body.innerHTML = mdToHtml(post.body);

  // 侧栏「其它记录」：同一份列表里取最近三篇别人
  const related = root.querySelector("[data-post-related]");
  if (related) {
    try {
      const { posts } = await BlogAPI.list({ meta: true });
      const others = posts.filter((p) => p.slug !== post.slug).slice(0, 3);
      related.innerHTML = others.length
        ? others
            .map(
              (p) =>
                `<div class="facts__row"><a class="facts__k" href="${postUrl(p.slug)}">${esc(p.title)}</a>` +
                `<span class="facts__v num">${esc(p.date)}</span></div>`
            )
            .join("")
        : `<div class="facts__row"><span class="facts__v">暂时没有别的</span></div>`;
    } catch {
      /* 保持模板里的静态兜底 */
    }
  }

  // 已经登录的话，顺手给一个「编辑这篇」的入口
  if (readToken()) {
    const aside = root.querySelector("[data-post-aside]");
    if (aside) {
      const link = document.createElement("a");
      link.className = "btn btn--ghost mt-4";
      link.href = `admin.html?slug=${encodeURIComponent(post.slug)}`;
      link.textContent = "编辑这篇";
      aside.appendChild(link);
    }
  }

  if (loading) loading.hidden = true;
  if (ready) ready.hidden = false;
}

/** 后台用得到的令牌读写，放在这里是为了「谁在存」只有一个地方 */
function readToken() {
  try {
    return localStorage.getItem("blog-admin-token") || "";
  } catch {
    return "";
  }
}

function bootHydration() {
  // 各自兜底：一个页面同时挂了目录和账本也不该互相影响
  [hydrateCatalog, hydrateLedger, hydratePost].forEach((fn) => {
    try {
      fn().catch((err) => console.warn("[blog-api]", fn.name, err));
    } catch (err) {
      console.warn("[blog-api]", fn.name, err);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootHydration);
} else {
  bootHydration();
}

// 后台页要用同一份实现，挂到全局
window.BlogAPI = BlogAPI;
window.BlogRender = { esc, unesc, safeHref, mdToHtml, postUrl, readToken };
