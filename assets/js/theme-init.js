/* 主题预设。
   ---------------------------------------------------------------------------
   必须在样式表之前同步执行 —— 晚一步，深色用户就会闪一次浅色。

   独立成文件而不是内联在 <head>，是为了能用严格 CSP：
   内联脚本会强制 script-src 开 'unsafe-inline'，那等于放弃脚本防护。
   拆出来之后，页面可以声明 script-src 'self'。
   --------------------------------------------------------------------------- */
(function () {
  var THEMES = ["light", "dark"];
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem("skeleton-theme");
    // 白名单校验：localStorage 是可被改写的存储，不能直接信任
    if (THEMES.indexOf(saved) === -1) {
      saved = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    root.dataset.theme = saved;
  } catch (e) {
    // file:// 或隐私模式下 localStorage 会抛异常
    root.dataset.theme = "light";
  }
})();
