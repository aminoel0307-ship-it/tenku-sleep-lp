/**
 * マーケティング計測（GA4 / Meta Pixel / UTM）
 *
 * - GA4測定ID・MetaピクセルIDは js/config.js で設定する（空欄の場合は何も計測しない安全設計）
 * - UTMパラメータ（utm_source/medium/campaign/content/term）をURLから取得し、
 *   sessionStorageに保存してLP内の回遊・離脱後の再訪でも参照できるようにする
 * - 送信イベント：page_view / cta_click / line_click（GA4）、PageView / Lead（Meta Pixel）
 * - 既存のCTAリンク挙動（js/script.js によるhref反映、js/line-guide.js によるコピー機能）は変更しない
 */
(function () {
  "use strict";

  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var UTM_STORAGE_KEY = "amy_utm_params";

  function getConfig() {
    return window.SITE_CONFIG || {};
  }

  // URLのクエリからUTMパラメータを取得（1つでもあれば有効な値として扱う）
  function parseUtmFromLocation() {
    var params;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (e) {
      return null;
    }
    var utm = {};
    var found = false;
    UTM_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) {
        utm[key] = value;
        found = true;
      }
    });
    return found ? utm : null;
  }

  function loadStoredUtm() {
    try {
      var raw = window.sessionStorage.getItem(UTM_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      // sessionStorageが使えない環境（プライベートモード等）でも計測処理自体は継続する
      return {};
    }
  }

  function saveUtm(utm) {
    try {
      window.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    } catch (e) {
      /* 保存に失敗しても致命的ではないため無視する */
    }
  }

  function initUtm() {
    var fromUrl = parseUtmFromLocation();
    if (fromUrl) {
      saveUtm(fromUrl);
      return fromUrl;
    }
    return loadStoredUtm();
  }

  var currentUtm = initUtm();

  function getUtmParams() {
    var result = {};
    UTM_KEYS.forEach(function (key) {
      result[key] = currentUtm[key] || "";
    });
    return result;
  }

  function isGa4Ready() {
    var config = getConfig();
    return !!(config.ga4MeasurementId && typeof window.gtag === "function");
  }

  function isMetaPixelReady() {
    var config = getConfig();
    return !!(config.metaPixelId && typeof window.fbq === "function");
  }

  function sendGa4Event(eventName, params) {
    if (!isGa4Ready()) return;
    try {
      window.gtag("event", eventName, params);
    } catch (e) {
      /* 計測エラーがサイトの表示・動作に影響しないようにする */
    }
  }

  // isCustom=true の場合はMeta標準イベント以外のカスタムイベント名として送信する
  function sendMetaEvent(eventName, params, isCustom) {
    if (!isMetaPixelReady()) return;
    try {
      if (isCustom) {
        window.fbq("trackCustom", eventName, params);
      } else {
        window.fbq("track", eventName, params);
      }
    } catch (e) {
      /* 計測エラーがサイトの表示・動作に影響しないようにする */
    }
  }

  // GA4イベント共通パラメータ（brand / utm_*）を組み立てる
  function buildEventParams(extra) {
    var config = getConfig();
    var params = { brand: config.brand || "" };
    var utm = getUtmParams();
    UTM_KEYS.forEach(function (key) {
      params[key] = utm[key];
    });
    if (extra) {
      for (var key in extra) {
        if (Object.prototype.hasOwnProperty.call(extra, key)) {
          params[key] = extra[key];
        }
      }
    }
    return params;
  }

  // クリックされたリンクの遷移先が「公式LINE」かどうかを判定する。
  // config.js の seminarUrl を書き換えるだけで、全CTAの判定にも自動的に反映される。
  function isLineUrl(url) {
    if (!url) return false;
    var config = getConfig();
    if (config.seminarUrl && url === config.seminarUrl) return true;
    return /line\.me|lin\.ee/i.test(url);
  }

  function trackCtaClick(link) {
    var location = link.getAttribute("data-cta-location") || "unknown";
    var href = link.getAttribute("href") || "";

    sendGa4Event("cta_click", buildEventParams({ cta_location: location }));

    if (isLineUrl(href)) {
      sendGa4Event("line_click", buildEventParams({ cta_location: location }));
      // LINE遷移＝相談・申込につながる見込み客獲得のためLead候補イベントとして送信
      sendMetaEvent("Lead", {
        content_name: location,
        content_category: getConfig().brand || ""
      });
    }
  }

  // GA4（gtag.js）初期化。測定IDが空欄の場合は何もしない。
  function initGa4() {
    var config = getConfig();
    if (!config.ga4MeasurementId) return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    // 自動page_viewは送らず、brand/utmパラメータ付きの独自page_viewイベントのみを送信する
    window.gtag("config", config.ga4MeasurementId, { send_page_view: false });

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(config.ga4MeasurementId);
    document.head.appendChild(script);

    sendGa4Event("page_view", buildEventParams({}));
  }

  // Meta Pixel初期化。ピクセルIDが空欄の場合は何もしない。
  function initMetaPixel() {
    var config = getConfig();
    if (!config.metaPixelId) return;

    /* eslint-disable */
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    /* eslint-enable */

    window.fbq("init", config.metaPixelId);
    window.fbq("track", "PageView");
  }

  function bindCtaTracking() {
    document.querySelectorAll(".js-cta").forEach(function (link) {
      link.addEventListener("click", function () {
        trackCtaClick(link);
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initGa4();
    initMetaPixel();
    bindCtaTracking();
  });

  // 将来的にViewContent等を任意のタイミングで送信できるよう最小限のAPIを公開する
  window.AmyTracking = {
    sendGa4Event: sendGa4Event,
    sendMetaEvent: sendMetaEvent,
    getUtmParams: getUtmParams
  };
})();
