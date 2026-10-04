/* ==========================================================================
   shikibe's blog / assets/js/admin.js

   后台页的全部逻辑。依赖 blog-api.js（接口客户端 + markdown 渲染）。

   设计上的三个取舍：

   1. **不做富文本编辑器。** 富文本要引入 contenteditable 或第三方编辑器，
      两者都会带来「粘贴进 Word 内容后 DOM 里塞满 <span style>」的问题，
      而且产物再也没法用 git 看 diff。正文就是 markdown 纯文本。
      预览面板解决「所见即所得」的需求，但保存的永远是纯文本。

   2. **状态全在 DOM 里。** 没有一个全局 state 对象跟表单互相追着同步 ——
      表单就是真相，需要什么读什么。后台只有一个编辑目标，不需要状态机。

   3. **未保存改动会拦你。** 切文章、关页面、点退出都会先问一句。
      后台最容易出的不是报错，是「以为存了」。
   ========================================================================== */

(function () {
  const { esc, mdToHtml, postUrl } = window.BlogRender;
  const API = window.BlogAPI;

  const TOKEN_KEY = "blog-admin-token";
  const AUTHOR_KEY = "blog-admin-author";
  const PLACEHOLDER_BASE = "YOUR-SUBDOMAIN";

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];

  const el = {
    status: $("[data-status]"),
    gate: $("[data-gate]"),
    app: $("[data-app]"),
    loginForm: $("[data-login-form]"),
    apiBase: $('[name="apiBase"]'),
    list: $("[data-list]"),
    count: $("[data-count]"),
    editor: $("[data-editor]"),
    editorEmpty: $("[data-editor-empty]"),
    form: $("[data-editor-form]"),
    preview: $("[data-preview]"),
    previewWrap: $("[data-preview-wrap]"),
    bodyField: $('[name="body"]'),
  };

  let token = readToken();
  let currentSlug = null;   // null = 新建
  let dirty = false;

  /* -------------------------------------------------------------------------
     小工具
     ------------------------------------------------------------------------- */
  function readToken() {
    try {
      return localStorage.getItem(TOKEN_KEY) || "";
    } catch {
      return "";
    }
  }

  function storeToken(value) {
    token = value || "";
    try {
      if (value) localStorage.setItem(TOKEN_KEY, value);
      else localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* 存不了也能用，只是刷新后要重新登录 */
    }
  }

  function setStatus(text, tone = "") {
    if (!el.status) return;
    el.status.textContent = text;
    if (tone) el.status.dataset.tone = tone;
    else delete el.status.dataset.tone;
  }

  const todayISO = () => new Date().toISOString().slice(0, 10);

  function markDirty(value) {
    dirty = value;
    document.title = (value ? "● " : "") + "后台 · shikibe's blog";
  }

  /** 未保存提醒。返回 true 表示「可以继续」。 */
  function confirmDiscard() {
    if (!dirty) return true;
    return window.confirm("当前改动还没保存，确定要丢弃吗？");
  }

  /* -------------------------------------------------------------------------
     登录
     ------------------------------------------------------------------------- */
  function showGate(message, tone = "") {
    if (el.gate) el.gate.hidden = false;
    if (el.app) el.app.hidden = true;
    if (el.apiBase) el.apiBase.value = API.base;
    if (message) setStatus(message, tone);
  }

  function showApp() {
    if (el.gate) el.gate.hidden = true;
    if (el.app) el.app.hidden = false;
  }

  async function handleLogin(event) {
    event.preventDefault();
    const password = el.loginForm.querySelector('[name="password"]').value;
    setStatus("正在登录…", "busy");
    try {
      const data = await API.login(password);
      storeToken(data.token);
      el.loginForm.reset();
      showApp();
      await loadList();
      setStatus("已登录。", "ok");
    } catch (err) {
      setStatus(err.message, "warn");
    }
  }

  function logout() {
    if (!confirmDiscard()) return;
    storeToken("");
    currentSlug = null;
    markDirty(false);
    showGate("已退出登录。");
  }

  /* -------------------------------------------------------------------------
     接口地址
     ------------------------------------------------------------------------- */
  function saveApiBase() {
    const value = el.apiBase.value.trim();
    if (!value) {
      API.setBase("");
      el.apiBase.value = API.base;
      setStatus("已恢复成源码里的默认地址。", "ok");
      return;
    }
    const clean = API.setBase(value);
    el.apiBase.value = clean;
    setStatus(`接口地址已保存：${clean}（刷新后仍生效）`, "ok");
  }

  async function testApi() {
    setStatus("正在测试连通…", "busy");
    try {
      const data = await API.health();
      setStatus(`连通正常，服务端时间 ${new Date(data.time).toLocaleString()}`, "ok");
    } catch (err) {
      setStatus(err.message, "warn");
    }
  }

  /* -------------------------------------------------------------------------
     列表
     ------------------------------------------------------------------------- */
  async function loadList() {
    setStatus("正在读取文章列表…", "busy");
    try {
      const { posts } = await API.list({ all: true, meta: true, token });
      renderList(posts);
      setStatus(`已载入 ${posts.length} 篇（含草稿）。`, "ok");
      return posts;
    } catch (err) {
      if (err.status === 401) {
        storeToken("");
        showGate("登录已过期，请重新输入密码。", "warn");
      } else {
        setStatus(err.message, "warn");
      }
      return [];
    }
  }

  function renderList(posts) {
    if (!el.list) return;
    if (el.count) el.count.textContent = `${posts.length} 篇`;

    if (!posts.length) {
      el.list.innerHTML =
        '<p class="admin__list-empty">还没有在线文章。点「新建文章」，或先「导入现有 4 篇」。</p>';
      return;
    }

    el.list.innerHTML = posts
      .map(
        (p) =>
          `<button class="admin__item" type="button" data-slug="${esc(p.slug)}" aria-current="${p.slug === currentSlug}">` +
          `<span class="admin__item-title">${esc(p.title)}</span>` +
          `<span class="admin__item-meta"><span class="num">${esc(p.date)}</span>` +
          `<span class="admin__badge${p.status === "draft" ? " admin__badge--draft" : ""}">${p.status === "draft" ? "草稿" : "已发布"}</span>` +
          `<span>${esc(p.slug)}</span></span>` +
          `</button>`
      )
      .join("");
  }

  /* -------------------------------------------------------------------------
     表单读写
     ------------------------------------------------------------------------- */
  function fillForm(post) {
    const f = el.form;
    f.elements.title.value = post?.title || "";
    f.elements.slug.value = post?.slug || "";
    f.elements.date.value = post?.date || todayISO();
    f.elements.author.value = post?.author || storedAuthor() || "";
    f.elements.tags.value = (post?.tags || []).join(", ");
    f.elements.excerpt.value = post?.excerpt || "";
    f.elements.body.value = post?.body || "";
    f.elements.status.value = post?.status || "draft";
    renderPreview();
    markDirty(false);
  }

  function storedAuthor() {
    try {
      return localStorage.getItem(AUTHOR_KEY) || "";
    } catch {
      return "";
    }
  }

  function rememberAuthor(name) {
    try {
      if (name) localStorage.setItem(AUTHOR_KEY, name);
    } catch {
      /* 无所谓 */
    }
  }

  function collect() {
    const f = el.form;
    return {
      title: f.elements.title.value.trim(),
      slug: f.elements.slug.value.trim(),
      date: f.elements.date.value,
      author: f.elements.author.value.trim(),
      tags: f.elements.tags.value
        .split(/[,，]/)
        .map((t) => t.trim().replace(/^#/, ""))
        .filter(Boolean),
      excerpt: f.elements.excerpt.value.trim(),
      body: f.elements.body.value,
      status: f.elements.status.value,
    };
  }

  function openEditor() {
    if (el.editor) el.editor.hidden = false;
    if (el.editorEmpty) el.editorEmpty.hidden = true;
  }

  function renderPreview() {
    if (!el.preview) return;
    el.preview.innerHTML = mdToHtml(el.bodyField.value) || '<p class="blank__desc">（正文还是空的）</p>';
  }

  /* -------------------------------------------------------------------------
     打开 / 新建
     ------------------------------------------------------------------------- */
  async function openPost(slug, { skipGuard = false } = {}) {
    if (!skipGuard && !confirmDiscard()) return;
    setStatus(`正在读取「${slug}」…`, "busy");
    try {
      const { post } = await API.get(slug, token);
      currentSlug = post.slug;
      fillForm(post);
      openEditor();
      renderList(await listMeta());
      setStatus(`已打开「${post.title}」。`, "ok");
    } catch (err) {
      setStatus(err.message, "warn");
    }
  }

  /** 只为了刷新左侧高亮，失败也不影响编辑 */
  async function listMeta() {
    try {
      const { posts } = await API.list({ all: true, meta: true, token });
      return posts;
    } catch {
      return [];
    }
  }

  function newPost() {
    if (!confirmDiscard()) return;
    currentSlug = null;
    fillForm(null);
    openEditor();
    el.form.elements.title.focus();
    setStatus("新文章。填好标题后点「保存」—— slug 留空会自动生成。", "");
  }

  /* -------------------------------------------------------------------------
     保存 / 删除
     ------------------------------------------------------------------------- */
  async function save() {
    const data = collect();
    if (!data.title) {
      setStatus("标题不能为空。", "warn");
      el.form.elements.title.focus();
      return;
    }

    const isNew = currentSlug === null;
    setStatus(isNew ? "正在创建…" : "正在保存…", "busy");

    try {
      const payload = isNew ? data : { ...data, slug: currentSlug };
      const result = await API.write(payload, { isNew, token });
      const post = result.post;

      currentSlug = post.slug;
      rememberAuthor(post.author);
      fillForm(post);                       // 回填服务端归一化后的结果（比如自动生成的 slug）
      openEditor();
      renderList(await listMeta());

      setStatus(
        post.status === "published"
          ? `已发布「${post.title}」。前台刷新就能看到。`
          : `已存为草稿「${post.title}」。`,
        "ok"
      );
    } catch (err) {
      setStatus(err.message, "warn");
    }
  }

  async function removePost() {
    if (currentSlug === null) return;
    const title = el.form.elements.title.value.trim() || currentSlug;
    if (!window.confirm(`确定删除「${title}」？这一步不可撤销。`)) return;

    setStatus("正在删除…", "busy");
    try {
      await API.remove(currentSlug, token);
      currentSlug = null;
      markDirty(false);
      fillForm(null);
      if (el.editor) el.editor.hidden = true;
      if (el.editorEmpty) el.editorEmpty.hidden = false;
      renderList(await listMeta());
      setStatus(`已删除「${title}」。`, "ok");
    } catch (err) {
      setStatus(err.message, "warn");
    }
  }

  /* -------------------------------------------------------------------------
     导入现有的静态文章
     -------------------------------------------------------------------------
     这一步把仓库里那 4 篇静态页面变成「可以在线改的文章」。
     刻意做成幂等的 upsert：重复点不会产生副本，只会用种子内容覆盖。
     ------------------------------------------------------------------------- */
  async function importSeed() {
    if (!window.confirm("把仓库里的 4 篇现有文章导入到在线存储？同 slug 的会被种子内容覆盖。")) return;

    setStatus("正在导入…", "busy");
    let seed;
    try {
      const res = await fetch("assets/seed/posts.json", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      seed = await res.json();
    } catch (err) {
      setStatus(`读不到 assets/seed/posts.json（${err.message}）。本地直接双击打开文件时读不了，请用 http 服务预览。`, "warn");
      return;
    }

    let ok = 0;
    const failed = [];
    for (const post of seed) {
      try {
        await API.save(post, token);
        ok++;
      } catch (err) {
        failed.push(`${post.slug}：${err.message}`);
      }
    }

    renderList(await listMeta());
    if (failed.length) setStatus(`导入 ${ok} 篇，${failed.length} 篇失败 —— ${failed.join("；")}`, "warn");
    else setStatus(`导入完成，共 ${ok} 篇。现在可以在左侧点开任意一篇改了。`, "ok");
  }

  /* -------------------------------------------------------------------------
     事件绑定
     ------------------------------------------------------------------------- */
  function bind() {
    el.loginForm?.addEventListener("submit", handleLogin);
    $("[data-api-save]")?.addEventListener("click", saveApiBase);
    $("[data-api-test]")?.addEventListener("click", testApi);

    $("[data-new]")?.addEventListener("click", newPost);
    $("[data-reload]")?.addEventListener("click", async () => {
      if (!confirmDiscard()) return;
      await loadList();
    });
    $("[data-import]")?.addEventListener("click", importSeed);
    $("[data-logout]")?.addEventListener("click", logout);

    // 列表用事件委托：内容是整体重绘的，逐个绑定会在重绘后失效
    el.list?.addEventListener("click", (event) => {
      const item = event.target.closest("[data-slug]");
      if (item) openPost(item.dataset.slug);
    });

    el.form?.addEventListener("submit", (event) => {
      event.preventDefault();
      save();
    });
    $("[data-delete]")?.addEventListener("click", removePost);

    $("[data-open]")?.addEventListener("click", () => {
      const slug = currentSlug || el.form.elements.slug.value.trim();
      if (!slug) {
        setStatus("先保存一次，拿到 slug 才能在前台打开。", "warn");
        return;
      }
      window.open(postUrl(slug), "_blank", "noopener");
    });

    // 预览切换
    $("[data-toggle-preview]")?.addEventListener("click", (event) => {
      const showPreview = el.previewWrap.hidden;
      el.previewWrap.hidden = !showPreview;
      el.bodyField.parentElement.hidden = showPreview;
      event.currentTarget.setAttribute("aria-pressed", String(showPreview));
      if (showPreview) renderPreview();
    });

    // 输入即脏；正文顺手更新预览（只在预览可见时算，省掉无用的 markdown 解析）
    el.form?.addEventListener("input", () => {
      markDirty(true);
      if (el.previewWrap && !el.previewWrap.hidden) renderPreview();
    });

    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (!el.app.hidden) save();
      }
    });

    window.addEventListener("beforeunload", (event) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  /* -------------------------------------------------------------------------
     启动
     ------------------------------------------------------------------------- */
  async function boot() {
    bind();

    if (API.base.includes(PLACEHOLDER_BASE)) {
      showGate(
        "接口地址还没填。展开下面的「接口地址」，把 a-blog-0-api 部署后得到的地址粘进去。",
        "warn"
      );
      return;
    }

    if (!token) {
      showGate("输入管理密码开始。");
      return;
    }

    // 有令牌就直接试一次；失败会走 401 分支回到登录
    showApp();
    const posts = await loadList();
    if (!posts.length && el.editorEmpty) {
      // 空库：直接把「新建」摆在眼前，省得找按钮
      setStatus("在线存储还是空的。点「新建文章」开始，或先「导入现有 4 篇」。", "");
    }

    // 从文章页的「编辑这篇」跳过来
    const want = new URLSearchParams(location.search).get("slug");
    if (want) await openPost(want, { skipGuard: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
