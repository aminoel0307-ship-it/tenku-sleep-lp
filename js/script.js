(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    // CTAボタンのリンク先を config.js の設定値で一括反映
    var seminarUrl =
      (window.SITE_CONFIG && window.SITE_CONFIG.seminarUrl) || "#";
    var ctaLinks = document.querySelectorAll(".js-cta");
    ctaLinks.forEach(function (link) {
      link.setAttribute("href", seminarUrl);
      if (/^https?:\/\//.test(seminarUrl)) {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      }
    });

    // フッター年号
    var yearEl = document.getElementById("js-year");
    if (yearEl) {
      yearEl.textContent = String(new Date().getFullYear());
    }
  });
})();
