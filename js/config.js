/**
 * サイト共通設定
 *
 * 無料説明会の申込み先URL（公式LINEの友だち追加URL）をここで一元管理しています。
 * 申込み先が変わった場合は、下記の seminarUrl の値だけを書き換えてください。
 * ページ内の「無料説明会に申し込む」等、申込みに関するCTAボタンすべてに
 * 自動で反映されます（新しいタブで開きます）。
 *
 * ga4MeasurementId / metaPixelId は、値が空欄（""）の間は計測コードが
 * 一切実行されない安全設計になっています（js/tracking.js 参照）。
 * 発行済みのIDが用意でき次第、下記の値を書き換えてください。
 */
window.SITE_CONFIG = {
  // 公式LINE（無料相談・お問い合わせ窓口）
  seminarUrl: "https://lin.ee/C0byPWO",

  // ブランド識別子（GA4/Metaイベントの brand パラメータとして送信）
  brand: "tenku-sleep",

  // GA4 測定ID（例："G-XXXXXXXXXX"）。未発行の間は空欄のままにしてください。
  ga4MeasurementId: "G-ECL14TWQ9G",

  // Meta Pixel ID（例："000000000000000"）。未発行の間は空欄のままにしてください。
  metaPixelId: "2084827158805378"
};
