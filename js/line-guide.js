/**
 * LINE相談メッセージのコピー案内
 *
 * 目的：TENKU®︎天空睡眠スクール公式LINEに、このLPからの
 * 問い合わせだと判別できる定型文をコピーできるようにする。
 *
 * 既存の公式LINEリンク（config.js の seminarUrl）やCTAの遷移先は
 * 一切変更しない。「相談内容をコピーする」ボタンのクリップボード
 * コピーと、CTA（.js-cta）タップ時の自動コピー＋トースト表示のみを追加する。
 */
(function () {
  "use strict";

  var LINE_MESSAGE = "TENKU®︎天空睡眠スクールについて相談希望です。";

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "-1000px";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error("execCommand copy failed"));
      } catch (e) {
        reject(e);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toast = document.querySelector(".copy-toast");
    var toastTimer = null;

    function showToast(message) {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add("is-visible");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () {
        toast.classList.remove("is-visible");
      }, 3200);
    }

    // 「相談内容をコピーする」ボタン
    document.querySelectorAll(".js-copy-line-message").forEach(function (btn) {
      btn.addEventListener("click", function () {
        copyText(LINE_MESSAGE)
          .then(function () {
            showToast("コピーしました。LINEを開いて貼り付けてください");
          })
          .catch(function () {
            showToast("コピーできませんでした。上の文章を長押しでコピーしてください");
          });
      });
    });

    // 相談・申込み系CTA（.js-cta）タップ時も、遷移を妨げずに自動コピー
    document.querySelectorAll(".js-cta").forEach(function (link) {
      link.addEventListener("click", function () {
        copyText(LINE_MESSAGE)
          .then(function () {
            showToast("コピーしました。LINEを開いて貼り付けてください");
          })
          .catch(function () {
            /* コピーに失敗してもLINEへの遷移自体は妨げない */
          });
      });
    });
  });
})();
