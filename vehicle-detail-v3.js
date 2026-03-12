/**
 * CUSTOM ELEMENT — Vehicle Detail Viewer
 * Tag: <vehicle-detail-viewer>
 * COMPLETE CODE — EVERY FUNCTION INCLUDED — NO PLACEHOLDERS
 */

const IC = {
  back:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevL:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevR:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  phone:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.62 3.36 2 2 0 0 1 3.62 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`,
  mail:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,
  map:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
  globe:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
  star:     `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  car:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  check:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  checkFill:`<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z"/></svg>`,
  send:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  calc:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8" y2="10"/><line x1="12" y1="10" x2="12" y2="10"/><line x1="16" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="8" y2="14"/><line x1="12" y1="14" x2="12" y2="14"/><line x1="16" y1="14" x2="16" y2="14"/><line x1="8" y1="18" x2="12" y2="18"/></svg>`,
  dealer:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  twitter:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>`,
  facebook: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>`,
  whatsapp: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
  link:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
  play:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  rotate:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  tour:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>`,
  report:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
};

function ic(name, size = 16) {
  return `<span class="vdv-ic" style="width:${size}px;height:${size}px;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">${IC[name] || ''}</span>`;
}

function _injectGlobalStyles(s) {
  const id  = 'vdv-global-styles';
  let el    = document.getElementById(id);
  if (!el) { el = document.createElement('style'); el.id = id; document.head.appendChild(el); }
  const fs  = Number(s.fontSize) || 14;
  const fs2 = Math.max(11, fs - 1);
  const fs3 = Math.max(10, fs - 2);
  el.textContent = `
  vehicle-detail-viewer *, vehicle-detail-viewer *::before, vehicle-detail-viewer *::after{box-sizing:border-box;margin:0;padding:0}
  vehicle-detail-viewer{display:block;width:100%;font-family:${s.fontFamily};font-size:${fs}px}
  .vdv-ic{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;vertical-align:middle}
  .vdv-ic svg{width:100%;height:100%}
  .vdv-container{background:${s.bgColor};max-width:1400px;margin:0 auto;padding:32px 20px}
  .vdv-hero{display:grid;grid-template-columns:1fr 380px;gap:28px;margin-bottom:32px}
  .vdv-summary{background:${s.cardBg};border:1px solid ${s.cardBorder};border-radius:16px;padding:24px;display:flex;flex-direction:column;gap:16px;position:sticky;top:16px;align-self:flex-start}
  .vdv-summary-loading{display:flex;flex-direction:column;align-items:center;gap:12px;padding:40px 0;color:${s.metaColor}}
  .vdv-spinner{width:36px;height:36px;border:3px solid ${s.cardBorder};border-top-color:${s.accentColor};border-radius:50%;animation:vdv-spin .8s linear infinite}
  @keyframes vdv-spin{to{transform:rotate(360deg)}}
  .vdv-badges{display:flex;gap:6px;flex-wrap:wrap}
  .vdv-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:12px;font-size:${fs3}px;font-weight:700;text-transform:uppercase}
  .vdv-badge-new{background:${s.badgeNewBg};color:${s.badgeNewText}}
  .vdv-badge-used{background:${s.badgeUsedBg};color:${s.badgeUsedText}}
  .vdv-badge-rent{background:${s.badgeRentBg};color:${s.badgeRentText}}
  .vdv-badge-auction{background:${s.badgeAuctionBg};color:${s.badgeAuctionText}}
  .vdv-badge-featured{background:${s.accentColor};color:#fff}
  .vdv-badge-sold,.vdv-badge-rented{background:#374151;color:#9ca3af}
  .vdv-vehicle-title{font-size:${fs+10}px;font-weight:800;color:${s.titleColor};line-height:1.3}
  .vdv-vehicle-sub{font-size:${fs2}px;color:${s.metaColor}}
  .vdv-price-block{padding:16px;background:${s.bgColor};border-radius:10px;border:1px solid ${s.cardBorder}}
  .vdv-price-main{font-size:${fs+14}px;font-weight:800;color:${s.priceColor}}
  .vdv-price-orig{font-size:${fs+2}px;color:${s.priceOrigColor};text-decoration:line-through;margin-left:8px}
  .vdv-price-note{font-size:${fs2}px;color:${s.metaColor};margin-top:4px}
  .vdv-price-rental,.vdv-price-monthly{font-size:${fs2}px;color:${s.bodyColor};margin-top:4px}
  .vdv-quick-specs{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .vdv-qs{display:flex;flex-direction:column;gap:2px;background:${s.bgColor};padding:10px 12px;border-radius:8px;border:1px solid ${s.cardBorder}}
  .vdv-qs-label{font-size:${fs3}px;color:${s.specLabelColor};text-transform:uppercase;letter-spacing:.4px}
  .vdv-qs-value{font-size:${fs2}px;font-weight:600;color:${s.specValueColor}}
  .vdv-btn{width:100%;padding:14px;border-radius:10px;font-size:${fs}px;font-weight:700;border:none;cursor:pointer;transition:all .2s;font-family:${s.fontFamily};display:inline-flex;align-items:center;justify-content:center;gap:7px}
  .vdv-btn-accent{background:${s.btnBg};color:${s.btnText}}
  .vdv-btn-accent:hover{background:${s.accentHover}}
  .vdv-btn-ghost{background:transparent;color:${s.btnGhostText};border:2px solid ${s.btnGhostBorder};text-decoration:none}
  .vdv-btn-ghost:hover{background:${s.btnGhostBorder};color:${s.btnText}}
  .vdv-share{display:flex;gap:8px;justify-content:center}
  .vdv-share-btn{width:40px;height:40px;border-radius:50%;border:1px solid ${s.shareBorder};background:${s.shareBg};color:${s.shareIconColor||s.metaColor};display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;padding:0}
  .vdv-share-btn:hover{background:${s.shareHover};color:${s.bgColor};border-color:${s.shareHover}}
  .vdv-share-btn svg{width:17px;height:17px;fill:currentColor}
  .vdv-tabs{display:flex;gap:4px;border-bottom:2px solid ${s.cardBorder};margin-bottom:24px;flex-wrap:wrap}
  .vdv-tab{padding:10px 20px;background:none;border:none;color:${s.metaColor};font-size:${fs2}px;font-weight:600;cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-2px;transition:all .2s;font-family:${s.fontFamily}}
  .vdv-tab:hover{color:${s.bodyColor}}
  .vdv-tab.active{color:${s.accentColor};border-bottom-color:${s.accentColor}}
  .vdv-tab-content{min-height:200px;margin-bottom:32px}
  .vdv-tab-panel{display:none}
  .vdv-tab-panel.active{display:block}
  .vdv-specs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:24px}
  .vdv-specs-group-title{font-size:${fs3}px;font-weight:700;color:${s.sectionTitleColor};text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid ${s.cardBorder}}
  .vdv-spec-row{display:flex;justify-content:space-between;padding:8px 12px;border-radius:6px}
  .vdv-spec-row:nth-child(even){background:${s.specRowAltBg}}
  .vdv-spec-label{font-size:${fs3}px;color:${s.specLabelColor}}
  .vdv-spec-value{font-size:${fs3}px;color:${s.specValueColor};font-weight:500;text-align:right;max-width:60%}
  .vdv-features-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px}
  .vdv-feature-group-title{font-size:${fs3}px;font-weight:700;color:${s.sectionTitleColor};text-transform:uppercase;letter-spacing:.5px;margin-bottom:10px;padding-bottom:6px;border-bottom:1px solid ${s.cardBorder}}
  .vdv-feature-list{display:flex;flex-direction:column;gap:6px}
  .vdv-feature-item{display:flex;align-items:center;gap:8px;font-size:${fs3}px;color:${s.bodyColor}}
  .vdv-feature-check{color:${s.accentColor};flex-shrink:0}
  .vdv-history-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
  .vdv-history-card{background:${s.cardBg};border:1px solid ${s.cardBorder};border-radius:10px;padding:16px}
  .vdv-history-card-title{font-size:${fs3}px;font-weight:700;color:${s.sectionTitleColor};margin-bottom:8px}
  .vdv-history-card-body{font-size:${fs3}px;color:${s.bodyColor};line-height:1.6}
  .vdv-media-section{display:flex;flex-direction:column;gap:20px}
  .vdv-gallery-full{display:flex;flex-direction:column;gap:12px}
  .vdv-gallery-main{width:100%;aspect-ratio:16/9;border-radius:16px;overflow:hidden;background:${s.cardBg};position:relative}
  .vdv-gallery-img{width:100%;height:100%;object-fit:cover;display:block}
  .vdv-gallery-thumbs{display:flex;gap:8px;flex-wrap:wrap}
  .vdv-thumb{width:72px;height:52px;border-radius:8px;overflow:hidden;cursor:pointer;border:2px solid ${s.galleryThumbBorder};transition:border-color .2s;flex-shrink:0}
  .vdv-thumb.active{border-color:${s.galleryThumbActive}}
  .vdv-thumb img{width:100%;height:100%;object-fit:cover}
  .vdv-video-embed{position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px}
  .vdv-video-embed iframe{position:absolute;top:0;left:0;width:100%;height:100%;border:0}
  .vdv-youtube-placeholder{position:relative;cursor:pointer}
  .vdv-youtube-placeholder img{width:100%;height:auto;border-radius:12px}
  .vdv-play-overlay{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;background:rgba(0,0,0,.7);border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff}
  .vdv-section{background:${s.cardBg};border:1px solid ${s.cardBorder};border-radius:16px;padding:28px;margin-bottom:24px}
  .vdv-section-title{font-size:${fs+6}px;font-weight:700;color:${s.sectionTitleColor};margin-bottom:20px;display:flex;align-items:center;gap:8px}
  .vdv-related-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:16px}
  .vdv-related-card{background:${s.cardBg};border:1px solid ${s.cardBorder};border-radius:12px;overflow:hidden;cursor:pointer;transition:transform .2s}
  .vdv-related-card:hover{transform:translateY(-4px)}
  .vdv-related-card img{width:100%;height:160px;object-fit:cover}
  .vdv-related-info{padding:12px}
  .vdv-related-title{font-weight:700;color:${s.titleColor};margin-bottom:4px}
  .vdv-related-price{font-size:18px;font-weight:800;color:${s.priceColor}}
  .vdv-calc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;margin-bottom:20px}
  .vdv-calc-field{display:flex;flex-direction:column;gap:6px}
  .vdv-label{font-size:${fs3}px;color:${s.formLabelColor};font-weight:600}
  .vdv-input{padding:10px 14px;background:${s.calcInputBg};border:1px solid ${s.calcInputBorder};border-radius:8px;color:${s.calcInputText};font-size:${fs2}px}
  .vdv-calc-results{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px}
  .vdv-calc-result{background:${s.calcResultBg};border:1px solid ${s.cardBorder};border-radius:10px;padding:16px;text-align:center}
  .vdv-calc-result-label{font-size:${fs3}px;color:${s.metaColor};margin-bottom:6px}
  .vdv-calc-result-value{font-size:${fs+8}px;font-weight:800;color:${s.calcResultText}}
  .vdv-form{display:flex;flex-direction:column;gap:16px}
  .vdv-form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .vdv-form-field{display:flex;flex-direction:column;gap:6px}
  .vdv-form-checkboxes{display:flex;gap:20px;flex-wrap:wrap}
  .vdv-check-label{display:flex;align-items:center;gap:8px;font-size:${fs2}px;color:${s.bodyColor};cursor:pointer}
  .vdv-check-label input{accent-color:${s.accentColor}}
  .vdv-form-msg{padding:12px 16px;border-radius:8px;font-size:${fs2}px;font-weight:500;margin-top:8px;display:flex;align-items:center;gap:8px}
  .vdv-form-msg.success{background:#166534;color:#bbf7d0}
  .vdv-form-msg.error{background:#7c2d12;color:#fed7aa}
  .vdv-dealer-grid{display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:start}
  .vdv-dealer-logo{width:100px;height:70px;object-fit:contain;border-radius:8px;background:${s.bgColor};padding:8px;border:1px solid ${s.cardBorder}}
  .vdv-dealer-info{display:flex;flex-direction:column;gap:8px}
  .vdv-dealer-name{font-size:${fs+6}px;font-weight:700;color:${s.titleColor}}
  .vdv-dealer-detail{font-size:${fs3}px;color:${s.bodyColor};display:flex;align-items:center;gap:6px}
  .vdv-dealer-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:4px}
  .vdv-dealer-btn{padding:8px 18px;border-radius:8px;font-size:${fs3}px;font-weight:600;cursor:pointer;transition:all .2s;border:1px solid ${s.accentColor};background:transparent;color:${s.accentColor};font-family:${s.fontFamily};text-decoration:none;display:inline-flex;align-items:center;gap:6px}
  .vdv-dealer-btn:hover{background:${s.accentColor};color:${s.btnText}}
  @media(max-width:1024px){.vdv-hero{grid-template-columns:1fr}.vdv-summary{position:static}}
  @media(max-width:768px){.vdv-container{padding:20px 12px}}
  `;
}

class VehicleDetailViewer extends HTMLElement {
    constructor() {
        super();
        this.state = { vehicleData: null, isLoading: true, gallery: [], activeGalleryIdx: 0 };
        this.initialRenderDone = false;
        this._tabsRendered = { specs: false, features: false, history: false, media: false };
        const raw = this.getAttribute('style-props');
        this.styleProps = raw ? JSON.parse(raw) : this._defaultStyleProps();
    }

    static get observedAttributes() { return ['vehicle-data', 'style-props']; }

    _defaultStyleProps() {
        return {
            fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', fontSize:14,
            bgColor:'#0f1117', accentColor:'#f97316', accentHover:'#ea580c',
            titleColor:'#ffffff', bodyColor:'#94a3b8', metaColor:'#64748b',
            cardBg:'#1a1d27', cardBorder:'#2a2d3a', sectionTitleColor:'#f97316',
            priceColor:'#f97316', priceOrigColor:'#64748b',
            specLabelColor:'#64748b', specValueColor:'#e2e8f0', specRowAltBg:'#141720',
            badgeNewBg:'#166534', badgeNewText:'#bbf7d0',
            badgeUsedBg:'#1e3a5f', badgeUsedText:'#93c5fd',
            badgeRentBg:'#4c1d95', badgeRentText:'#ddd6fe',
            badgeAuctionBg:'#7c2d12', badgeAuctionText:'#fed7aa',
            calcInputBg:'#141720', calcInputBorder:'#2a2d3a', calcInputText:'#ffffff',
            calcResultBg:'#1a1d27', calcResultText:'#f97316',
            formInputBg:'#141720', formInputBorder:'#2a2d3a', formInputText:'#ffffff', formLabelColor:'#94a3b8',
            btnBg:'#f97316', btnText:'#ffffff', btnGhostBorder:'#f97316', btnGhostText:'#f97316',
            shareBg:'#1a1d27', shareBorder:'#2a2d3a', shareIconColor:'#94a3b8', shareHover:'#f97316',
            galleryThumbBorder:'#2a2d3a', galleryThumbActive:'#f97316', iconColor:'#64748b',
        };
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (!newVal || oldVal === newVal) return;
        if (name === 'vehicle-data') {
            try {
                const data = JSON.parse(newVal);
                this.state.vehicleData = data;
                this.state.isLoading   = false;
                let gallery = [];
                try {
                    if (typeof data.gallery === 'string' && data.gallery) gallery = JSON.parse(data.gallery);
                    else if (Array.isArray(data.gallery)) gallery = data.gallery;
                } catch(e) {}
                if (data.primaryImage && !gallery.some(g => (g.url || g) === data.primaryImage)) {
                    gallery.unshift({ url: data.primaryImage, alt: data.title || 'Vehicle' });
                }
                this.state.gallery = gallery;
                this.state.activeGalleryIdx = 0;
                if (this.initialRenderDone) requestAnimationFrame(() => this._renderVehicle());
            } catch(e) { console.error('vehicle-data parse error', e.message); }
        } else if (name === 'style-props') {
            try {
                this.styleProps = { ...this.styleProps, ...JSON.parse(newVal) };
                if (document.getElementById('vdv-global-styles')) _injectGlobalStyles(this.styleProps);
            } catch(e) {}
        }
    }

    connectedCallback() {
        if (!this.initialRenderDone) this._initUI();
    }

    _initUI() {
        _injectGlobalStyles(this.styleProps);
        this.innerHTML = this._shell();
        this.initialRenderDone = true;
        if (!this.state.isLoading && this.state.vehicleData) this._renderVehicle();
    }

    _shell() {
        return `
<div class="vdv-container">
    <div class="vdv-hero">
        <div class="vdv-summary" id="vdvSummary">
            <div class="vdv-summary-loading"><div class="vdv-spinner"></div><p>Loading vehicle details...</p></div>
        </div>
    </div>
    <div class="vdv-tabs">
        <button class="vdv-tab active" data-tab="specs">Specifications</button>
        <button class="vdv-tab" data-tab="features">Features</button>
        <button class="vdv-tab" data-tab="history">History</button>
        <button class="vdv-tab" data-tab="media">Media & Gallery</button>
    </div>
    <div class="vdv-tab-content">
        <div class="vdv-tab-panel active" id="vdvTabSpecs"></div>
        <div class="vdv-tab-panel" id="vdvTabFeatures"></div>
        <div class="vdv-tab-panel" id="vdvTabHistory"></div>
        <div class="vdv-tab-panel" id="vdvTabMedia"></div>
    </div>
    <div class="vdv-section" id="vdvRelatedSection" style="display:none">
        <h2 class="vdv-section-title">Related Vehicles You May Like</h2>
        <div class="vdv-related-grid" id="vdvRelatedGrid"></div>
    </div>
    <div class="vdv-section" id="vdvCalc" style="display:none">
        <h2 class="vdv-section-title">${ic('calc', 20)} Finance Calculator</h2>
        <div class="vdv-calc-grid">
            <div class="vdv-calc-field"><label class="vdv-label">Vehicle Price</label><input type="number" class="vdv-input" id="calcPrice"/></div>
            <div class="vdv-calc-field"><label class="vdv-label">Down Payment</label><input type="number" class="vdv-input" id="calcDown" value="0"/></div>
            <div class="vdv-calc-field"><label class="vdv-label">Interest Rate (% / yr)</label><input type="number" class="vdv-input" id="calcRate" value="6.9" step="0.1"/></div>
            <div class="vdv-calc-field"><label class="vdv-label">Loan Term (months)</label><input type="number" class="vdv-input" id="calcTerm" value="60"/></div>
        </div>
        <div class="vdv-calc-results">
            <div class="vdv-calc-result"><div class="vdv-calc-result-label">Monthly Payment</div><div class="vdv-calc-result-value" id="calcMonthly">—</div></div>
            <div class="vdv-calc-result"><div class="vdv-calc-result-label">Total Cost</div><div class="vdv-calc-result-value" id="calcTotal">—</div></div>
            <div class="vdv-calc-result"><div class="vdv-calc-result-label">Total Interest</div><div class="vdv-calc-result-value" id="calcInterest">—</div></div>
        </div>
    </div>
    <div class="vdv-section" id="vdvLead" style="display:none">
        <h2 class="vdv-section-title" id="vdvLeadTitle">${ic('send', 20)} Interested in this vehicle?</h2>
        <form class="vdv-form" id="vdvLeadForm" onsubmit="return false;">
            <div class="vdv-form-row">
                <div class="vdv-form-field"><label class="vdv-label">Full Name *</label><input type="text" class="vdv-input" id="leadName" required/></div>
                <div class="vdv-form-field"><label class="vdv-label">Email *</label><input type="email" class="vdv-input" id="leadEmail" required/></div>
            </div>
            <div class="vdv-form-row">
                <div class="vdv-form-field"><label class="vdv-label">Phone</label><input type="tel" class="vdv-input" id="leadPhone"/></div>
                <div class="vdv-form-field"><label class="vdv-label">Preferred Contact Time</label><input type="text" class="vdv-input" id="leadContactTime" placeholder="e.g. Weekday mornings"/></div>
            </div>
            <div class="vdv-form-field"><label class="vdv-label">Message</label><textarea class="vdv-input vdv-textarea" id="leadMessage" rows="4" placeholder="Ask about this vehicle…"></textarea></div>
            <div class="vdv-form-checkboxes">
                <label class="vdv-check-label"><input type="checkbox" id="leadFinancing"/> Interested in financing</label>
                <label class="vdv-check-label"><input type="checkbox" id="leadTestDrive"/> Request a test drive</label>
                <label class="vdv-check-label"><input type="checkbox" id="leadTradeIn"/> Have a trade-in</label>
            </div>
            <button type="submit" class="vdv-btn vdv-btn-accent" id="vdvLeadSubmit">${ic('send', 16)} Send Enquiry</button>
            <div class="vdv-form-msg" id="vdvLeadMsg" style="display:none"></div>
        </form>
    </div>
    <div class="vdv-section" id="vdvDealer" style="display:none">
        <h2 class="vdv-section-title">${ic('dealer', 20)} Dealer Information</h2>
        <div class="vdv-dealer-grid" id="vdvDealerContent"></div>
    </div>
</div>`;
    }

    _renderVehicle() {
        const v = this.state.vehicleData;
        if (!v || !this.initialRenderDone) return;
        this._renderSummary(v);
        this._renderTabSpecs(v);
        this._bindTabs(v);
        this._renderCalc(v);
        this._renderLead(v);
        this._renderDealer(v);
        this._renderRelatedListings(v);
        this._bindCalc();
        this._bindLeadForm(v);
        this._bindShare(v);
    }

    _renderSummary(v) {
        const title = v.title || `${v.year||''} ${v.make||''} ${v.model||''}`.trim() || 'Vehicle';
        const sub   = [v.bodyStyle, v.drivetrain, v.fuelType].filter(Boolean).join(' · ');
        const listBadge   = this._badge(v.listingType, v.condition);
        const statusBadge = (v.status==='sold'||v.status==='rented') ? `<span class="vdv-badge vdv-badge-${v.status}">${v.status}</span>` : '';
        const featBadge   = v.featured ? `<span class="vdv-badge vdv-badge-featured">${ic('star',11)} Featured</span>` : '';
        const quickSpecs  = [
            ['Year',v.year],['Make',v.make],['Model',v.model],
            ['Mileage',v.mileage?Number(v.mileage).toLocaleString()+' mi':null],
            ['Transmission',v.transmission],['Engine',v.engine],
            ['Exterior',v.exteriorColor],['Doors',v.doors],
        ].filter(([,val])=>val);

        this.querySelector('#vdvSummary').innerHTML = `
            <div class="vdv-badges">${listBadge}${statusBadge}${featBadge}</div>
            <div class="vdv-vehicle-title">${this._esc(title)}</div>
            ${sub ? `<div class="vdv-vehicle-sub">${this._esc(sub)}</div>` : ''}
            <div class="vdv-price-block">${this._priceHTML(v)}</div>
            <div class="vdv-quick-specs">
                ${quickSpecs.map(([l,val])=>`
                    <div class="vdv-qs">
                        <div class="vdv-qs-label">${l}</div>
                        <div class="vdv-qs-value">${this._esc(String(val))}</div>
                    </div>`).join('')}
            </div>
            <button class="vdv-btn vdv-btn-accent" id="vdvEnquireBtn">${ic('send',16)} Send Enquiry</button>
            ${v.dealerPhone ? `<a class="vdv-btn vdv-btn-ghost" href="tel:${v.dealerPhone}" style="text-decoration:none">${ic('phone',16)} Call Dealer</a>` : ''}
            <div class="vdv-share" id="vdvShareBtns">
                <button class="vdv-share-btn" data-share="twitter"  title="Share on X">${IC.twitter}</button>
                <button class="vdv-share-btn" data-share="facebook" title="Share on Facebook">${IC.facebook}</button>
                <button class="vdv-share-btn" data-share="whatsapp" title="Share on WhatsApp">${IC.whatsapp}</button>
                <button class="vdv-share-btn" data-share="copy"     title="Copy link">${IC.link}</button>
            </div>`;

        this.querySelector('#vdvEnquireBtn').addEventListener('click', () => {
            this.querySelector('#vdvLead')?.scrollIntoView({ behavior: 'smooth' });
        });
    }

    _priceHTML(v) {
        const sym = v.currency==='INR'?'₹':v.currency==='EUR'?'€':v.currency==='GBP'?'£':'$';
        const fmt = n => sym + Number(n).toLocaleString();
        if (v.listingType === 'rent') return `
            <div class="vdv-price-main">${v.rentalPricePerDay?fmt(v.rentalPricePerDay)+'<small>/day</small>':'Contact for price'}</div>
            ${v.rentalPricePerWeek?`<div class="vdv-price-rental">${fmt(v.rentalPricePerWeek)}/week</div>`:''}
            ${v.rentalPricePerMonth?`<div class="vdv-price-rental">${fmt(v.rentalPricePerMonth)}/month</div>`:''}`;
        if (v.listingType === 'auction') return `
            <div class="vdv-price-main">Starts ${v.auctionStartPrice?fmt(v.auctionStartPrice):'—'}</div>
            ${v.auctionReservePrice?`<div class="vdv-price-note">Reserve: ${fmt(v.auctionReservePrice)}</div>`:''}
            ${v.auctionEndDate?`<div class="vdv-price-note">Ends: ${this._fmtDate(v.auctionEndDate)}</div>`:''}`;
        const base = (v.salePrice && v.salePrice < v.price) ? v.salePrice : v.price;
        return `
            <div>
                <span class="vdv-price-main">${base?fmt(base):'Price on request'}</span>
                ${v.salePrice&&v.price&&v.salePrice<v.price?`<span class="vdv-price-orig">${fmt(v.price)}</span>`:''}
            </div>
            ${v.priceNegotiable?`<div class="vdv-price-note">Negotiable</div>`:''}
            ${v.monthlyPayment?`<div class="vdv-price-monthly">Est. ${fmt(v.monthlyPayment)}/mo</div>`:''}`;
    }

    _badge(type, condition) {
        const map = { new:['new','New'], used:['used','Used'], rent:['rent','Rent/Lease'], auction:['auction','Auction'] };
        const [cls, label] = map[type] || ['used', condition || type || 'Used'];
        return `<span class="vdv-badge vdv-badge-${cls}">${label}</span>`;
    }

    _renderTabSpecs(v) {
        const groups = [
            ['Identity',[['VIN',v.vin],['Stock #',v.stockNumber],['Year',v.year],['Make',v.make],['Model',v.model],['Trim',v.trim],['Body Style',v.bodyStyle],['Condition',v.condition],['Exterior Color',v.exteriorColor],['Interior Color',v.interiorColor]]],
            ['Engine & Performance',[['Engine',v.engine],['Displacement',v.engineDisplacement],['Cylinders',v.cylinders],['Horsepower',v.horsepower?v.horsepower+' hp':null],['Torque',v.torque?v.torque+' lb-ft':null],['Transmission',v.transmission],['Drivetrain',v.drivetrain],['Fuel Type',v.fuelType],['MPG City',v.mpgCity?v.mpgCity+' mpg':null],['MPG Highway',v.mpgHighway?v.mpgHighway+' mpg':null],['Electric Range',v.range?v.range+' mi':null]]],
            ['Dimensions & Capacity',[['Mileage',v.mileage?Number(v.mileage).toLocaleString()+' mi':null],['Doors',v.doors],['Seating',v.seatingCapacity?v.seatingCapacity+' seats':null],['Towing',v.towingCapacity?Number(v.towingCapacity).toLocaleString()+' lbs':null],['Weight',v.weight?Number(v.weight).toLocaleString()+' lbs':null]]],
        ].filter(([,rows])=>rows.some(([,val])=>val));
        this.querySelector('#vdvTabSpecs').innerHTML = `<div class="vdv-specs-grid">${groups.map(([gt,rows])=>`
            <div class="vdv-specs-group">
                <div class="vdv-specs-group-title">${gt}</div>
                ${rows.filter(([,val])=>val).map(([l,val])=>`
                    <div class="vdv-spec-row"><span class="vdv-spec-label">${l}</span><span class="vdv-spec-value">${this._esc(String(val))}</span></div>`).join('')}
            </div>`).join('')}</div>`;
    }

    _bindTabs(v) {
        const tabs   = this.querySelectorAll('.vdv-tab');
        const panels = {
            specs:    this.querySelector('#vdvTabSpecs'),
            features: this.querySelector('#vdvTabFeatures'),
            history:  this.querySelector('#vdvTabHistory'),
            media:    this.querySelector('#vdvTabMedia'),
        };
        tabs.forEach(tab => tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            Object.values(panels).forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            const key = tab.dataset.tab;
            panels[key]?.classList.add('active');
            if (key === 'features' && !this._tabsRendered.features) { this._renderTabFeatures(v); this._tabsRendered.features = true; }
            if (key === 'history'  && !this._tabsRendered.history)  { this._renderTabHistory(v);  this._tabsRendered.history  = true; }
            if (key === 'media'    && !this._tabsRendered.media)    { this._renderTabMedia(v);    this._tabsRendered.media    = true; }
        }));
    }

    _renderTabFeatures(v) {
        const groups = [
            ['Safety',   v.safetyFeatures || v.features],
            ['Tech',     v.techFeatures],
            ['Exterior', v.exteriorFeatures],
            ['Interior', v.interiorFeatures],
            ['Packages', v.packages],
        ].filter(([,val])=>val);
        if (!groups.length) { this.querySelector('#vdvTabFeatures').innerHTML = `<p style="color:${this.styleProps.metaColor}">No features listed.</p>`; return; }
        this.querySelector('#vdvTabFeatures').innerHTML = `<div class="vdv-features-grid">${groups.map(([gt,csv])=>`
            <div><div class="vdv-feature-group-title">${gt}</div><div class="vdv-feature-list">
                ${csv.split(',').map(f=>f.trim()).filter(Boolean).map(f=>`<div class="vdv-feature-item"><span class="vdv-feature-check">${ic('check',13)}</span>${this._esc(f)}</div>`).join('')}
            </div></div>`).join('')}</div>`;
    }

    _renderTabHistory(v) {
        const cards = [
            { title:'Ownership',          body: v.owners?`${v.owners} previous owner(s)`:null },
            { title:'Accident History',   body: v.accidentHistory?'Accident reported':'No accidents reported' },
            { title:'Service History',    body: v.serviceHistory||null },
            { title:'CARFAX Report',      body: v.carfaxUrl?`<a class="vdv-media-link" href="${v.carfaxUrl}" target="_blank" rel="noopener">${ic('report',14)} View Report</a>`:null, raw:true },
            { title:'Warranty',           body: v.warrantyType?`${v.warrantyType}${v.warrantyMonths?' · '+v.warrantyMonths+' months':''}`:null },
            { title:'Certified Pre-Owned',body: v.certifiedPreOwned?'Yes — CPO':null },
        ].filter(c=>c.body);
        this.querySelector('#vdvTabHistory').innerHTML = cards.length
            ? `<div class="vdv-history-grid">${cards.map(c=>`<div class="vdv-history-card"><div class="vdv-history-card-title">${c.title}</div><div class="vdv-history-card-body">${c.raw?c.body:this._esc(c.body)}</div></div>`).join('')}</div>`
            : `<p style="color:${this.styleProps.metaColor}">No history information available.</p>`;
    }

    _renderTabMedia(v) {
        let html = `<div class="vdv-media-section">`;
        if (this.state.gallery && this.state.gallery.length) {
            html += `<div class="vdv-gallery-full">
                <div class="vdv-gallery-main" id="vdvGalleryMainMedia"></div>
                <div class="vdv-gallery-thumbs" id="vdvGalleryThumbsMedia"></div>
            </div>`;
        }
        if (v.videoUrl) {
            const ytMatch = v.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
            if (ytMatch) {
                html += `<div class="vdv-youtube-placeholder" data-id="${ytMatch[1]}">
                    <img src="https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg" loading="lazy" alt="Video">
                    <div class="vdv-play-overlay">${ic('play', 48)}</div>
                </div>`;
            }
        }
        if (v.video360Url) html += `<div><div class="vdv-specs-group-title">360° View</div><a class="vdv-media-link" href="${v.video360Url}" target="_blank" rel="noopener">${ic('rotate',14)} Open 360° View</a></div>`;
        if (v.tourUrl)     html += `<div><div class="vdv-specs-group-title">Virtual Tour</div><a class="vdv-media-link" href="${v.tourUrl}" target="_blank" rel="noopener">${ic('tour',14)} Open Virtual Tour</a></div>`;
        html += `</div>`;
        this.querySelector('#vdvTabMedia').innerHTML = html;
        this._renderGalleryInMedia();
        this.querySelectorAll('.vdv-youtube-placeholder').forEach(placeholder => {
            placeholder.addEventListener('click', () => {
                const id = placeholder.dataset.id;
                placeholder.outerHTML = `<div class="vdv-video-embed"><iframe src="https://www.youtube.com/embed/${id}" allowfullscreen loading="lazy" title="Vehicle Video"></iframe></div>`;
            });
        });
    }

    _renderGalleryInMedia() {
        const gallery  = this.state.gallery;
        const mainEl   = this.querySelector('#vdvGalleryMainMedia');
        const thumbsEl = this.querySelector('#vdvGalleryThumbsMedia');
        if (!gallery || !gallery.length) return;
        this._setGalleryImageMedia(0);
        const frag = document.createDocumentFragment();
        gallery.forEach((item, idx) => {
            const url = this._imgUrl(item.url || item, 150, 110, 70);
            const div = document.createElement('div');
            div.className = `vdv-thumb${idx === 0 ? ' active' : ''}`;
            div.dataset.idx = idx;
            div.innerHTML = `<img src="${url}" alt="Photo ${idx+1}" loading="lazy" decoding="async" width="72" height="52"/>`;
            div.addEventListener('click', () => this._setGalleryImageMedia(idx));
            frag.appendChild(div);
        });
        thumbsEl.innerHTML = '';
        thumbsEl.appendChild(frag);
    }

    _setGalleryImageMedia(idx) {
        const gallery = this.state.gallery;
        if (!gallery || idx >= gallery.length) return;
        this.state.activeGalleryIdx = idx;
        const item   = gallery[idx];
        const url    = this._imgUrl(item.url || item, 1200, 700, 80);
        const alt    = item.alt || this.state.vehicleData?.title || 'Vehicle';
        const mainEl = this.querySelector('#vdvGalleryMainMedia');
        mainEl.innerHTML = `
            <img class="vdv-gallery-img" src="${url}" alt="${this._esc(alt)}"
                loading="lazy"
                decoding="async"
                width="1200" height="700"/>`;
        this._syncThumbMedia(idx);
    }

    _syncThumbMedia(idx) {
        this.querySelectorAll('.vdv-thumb').forEach((t, i) => t.classList.toggle('active', i === idx));
    }

    _renderRelatedListings(v) {
        const related = v.relatedListings || [];
        const container = this.querySelector('#vdvRelatedSection');
        const grid = this.querySelector('#vdvRelatedGrid');
        if (!related.length) {
            container.style.display = 'none';
            return;
        }
        container.style.display = 'block';
        grid.innerHTML = related.map(r => `
            <div class="vdv-related-card" data-slug="${r.slug}">
                <img src="${this._imgUrl(r.primaryImage,300,200,75)}" alt="${r.title}" loading="lazy">
                <div class="vdv-related-info">
                    <div class="vdv-related-title">${r.title || `${r.year||''} ${r.make||''} ${r.model||''}`}</div>
                    <div class="vdv-related-price">${r.salePrice || r.price ? '$'+Number(r.salePrice || r.price).toLocaleString() : 'Call for Price'}</div>
                </div>
            </div>
        `).join('');
        grid.querySelectorAll('.vdv-related-card').forEach(card => {
            card.addEventListener('click', () => {
                this.dispatchEvent(new CustomEvent('navigate-to-vehicle', { detail: { slug: card.dataset.slug }, bubbles: true, composed: true }));
            });
        });
    }

    _renderCalc(v) {
        if (!v.financeEnabled && !v.price) return;
        this.querySelector('#vdvCalc').style.display = 'block';
        const p = this.querySelector('#calcPrice'); if (p) p.value = v.salePrice || v.price || 0;
        const d = this.querySelector('#calcDown');  if (d && v.downPayment)    d.value = v.downPayment;
        const r = this.querySelector('#calcRate');  if (r && v.interestRate)   r.value = v.interestRate;
        const t = this.querySelector('#calcTerm');  if (t && v.loanTermMonths) t.value = v.loanTermMonths;
        this._computeLoan();
    }

    _bindCalc() {
        ['#calcPrice','#calcDown','#calcRate','#calcTerm'].forEach(sel => {
            this.querySelector(sel)?.addEventListener('input', () => this._computeLoan());
        });
    }

    _computeLoan() {
        const P = parseFloat(this.querySelector('#calcPrice')?.value||0);
        const D = parseFloat(this.querySelector('#calcDown')?.value||0);
        const R = parseFloat(this.querySelector('#calcRate')?.value||0)/100/12;
        const N = parseFloat(this.querySelector('#calcTerm')?.value||60);
        const principal = P - D;
        const monthly = (principal>0&&R>0)?(principal*R*Math.pow(1+R,N))/(Math.pow(1+R,N)-1):principal>0?principal/N:0;
        const total = monthly*N; const interest = total-principal;
        const fmt = n => '$'+Math.max(0,n).toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
        const m=this.querySelector('#calcMonthly'); if(m) m.textContent=monthly>0?fmt(monthly):'—';
        const t=this.querySelector('#calcTotal');   if(t) t.textContent=total>0?fmt(total):'—';
        const i=this.querySelector('#calcInterest');if(i) i.textContent=interest>0?fmt(interest):'—';
    }

    _renderLead(v) {
        if (v.leadCaptureEnabled === false) return;
        this.querySelector('#vdvLead').style.display = 'block';
        const titleEl = this.querySelector('#vdvLeadTitle');
        if (titleEl && v.leadFormTitle) titleEl.innerHTML = `${ic('send',20)} ${this._esc(v.leadFormTitle)}`;
    }

    _bindLeadForm(v) {
        const form      = this.querySelector('#vdvLeadForm');
        const msgEl     = this.querySelector('#vdvLeadMsg');
        const submitBtn = this.querySelector('#vdvLeadSubmit');
        if (!form) return;
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            submitBtn.innerHTML = `${ic('send',16)} Sending…`;
            const formData = {
                listingId:             v._id,
                listingTitle:          v.title || `${v.year} ${v.make} ${v.model}`,
                listingSlug:           v.slug,
                dealerEmail:           v.dealerEmail || v.leadEmailRecipient || '',
                name:                  this.querySelector('#leadName')?.value        || '',
                email:                 this.querySelector('#leadEmail')?.value       || '',
                phone:                 this.querySelector('#leadPhone')?.value       || '',
                message:               this.querySelector('#leadMessage')?.value     || '',
                preferredContactTime:  this.querySelector('#leadContactTime')?.value || '',
                interestedInFinancing: this.querySelector('#leadFinancing')?.checked || false,
                interestedInTestDrive: this.querySelector('#leadTestDrive')?.checked || false,
                tradeInInterest:       this.querySelector('#leadTradeIn')?.checked   || false,
                source: 'widget',
            };
            this.dispatchEvent(new CustomEvent('submit-lead', { detail: { formData }, bubbles: true, composed: true }));
            msgEl.style.display = 'flex';
            msgEl.className = 'vdv-form-msg success';
            msgEl.innerHTML = `${ic('checkFill',18)} Enquiry sent! The dealer will contact you soon.`;
            submitBtn.innerHTML = `${ic('check',16)} Sent`;
            setTimeout(() => { submitBtn.disabled = false; submitBtn.innerHTML = `${ic('send',16)} Send Enquiry`; }, 5000);
        });
    }

    _renderDealer(v) {
        if (!v.dealerName) return;
        this.querySelector('#vdvDealer').style.display = 'block';
        const logo    = v.dealerLogo
            ? `<img class="vdv-dealer-logo" src="${this._imgUrl(v.dealerLogo,200,140,80)}" alt="${this._esc(v.dealerName)}" loading="lazy" width="100" height="70"/>`
            : `<div class="vdv-dealer-logo-ph">${ic('dealer',32)}</div>`;
        const address = [v.dealerAddress,v.dealerCity,v.dealerState,v.dealerZip,v.dealerCountry].filter(Boolean).join(', ');
        const mapUrl  = address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : null;
        this.querySelector('#vdvDealerContent').innerHTML = `
            ${logo}
            <div class="vdv-dealer-info">
                <div class="vdv-dealer-name">${this._esc(v.dealerName)}</div>
                ${address        ?`<div class="vdv-dealer-detail">${ic('map',14)} ${this._esc(address)}</div>`:''}
                ${v.dealerPhone  ?`<div class="vdv-dealer-detail">${ic('phone',14)} ${this._esc(v.dealerPhone)}</div>`:''}
                ${v.dealerEmail  ?`<div class="vdv-dealer-detail">${ic('mail',14)} ${this._esc(v.dealerEmail)}</div>`:''}
                ${v.dealerWebsite?`<div class="vdv-dealer-detail">${ic('globe',14)} <a href="${v.dealerWebsite}" target="_blank" rel="noopener" style="color:${this.styleProps.accentColor}">${v.dealerWebsite}</a></div>`:''}
                <div class="vdv-dealer-actions">
                    ${v.dealerPhone  ?`<a class="vdv-dealer-btn" href="tel:${v.dealerPhone}">${ic('phone',13)} Call</a>`:''}
                    ${v.dealerEmail  ?`<a class="vdv-dealer-btn" href="mailto:${v.dealerEmail}">${ic('mail',13)} Email</a>`:''}
                    ${mapUrl         ?`<a class="vdv-dealer-btn" href="${mapUrl}" target="_blank" rel="noopener">${ic('map',13)} Directions</a>`:''}
                    ${v.dealerWebsite?`<a class="vdv-dealer-btn" href="${v.dealerWebsite}" target="_blank" rel="noopener">${ic('globe',13)} Website</a>`:''}
                </div>
            </div>`;
    }

    _bindShare(v) {
        const title = v.title || `${v.year} ${v.make} ${v.model}`;
        this.querySelectorAll('[data-share]').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = window.location.href;
                const shares = {
                    twitter:  `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
                    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                    whatsapp: `https://wa.me/?text=${encodeURIComponent(title+' '+url)}`,
                };
                if (btn.dataset.share === 'copy') {
                    navigator.clipboard?.writeText(url).then(() => alert('Link copied!')).catch(() => alert(url));
                } else if (shares[btn.dataset.share]) {
                    window.open(shares[btn.dataset.share], '_blank', 'width=600,height=400');
                }
            });
        });
    }

    _imgUrl(raw, w=800, h=600, q=80) {
        if (!raw || typeof raw !== 'string') return '';
        if (raw.startsWith('https://static.wixstatic.com/media/')) {
            try { const fn=raw.split('/media/')[1]?.split('/')[0]; if(!fn) return raw; return `https://static.wixstatic.com/media/${fn}/v1/fill/w_${w},h_${h},al_c,q_${q},enc_avif,quality_auto/${fn}`; } catch(e){return raw;}
        }
        if (raw.startsWith('http://')||raw.startsWith('https://')) return raw;
        if (raw.startsWith('wix:image://')) {
            try { const fid=raw.split('/')[3]?.split('#')[0]; if(!fid) return ''; let fn=fid.includes('~mv2')?fid:`${fid}~mv2.jpg`; if(!fn.includes('.')) fn+='.jpg'; return `https://static.wixstatic.com/media/${fn}/v1/fill/w_${w},h_${h},al_c,q_${q},enc_avif,quality_auto/${fn}`; } catch(e){return '';}
        }
        return '';
    }

    _esc(t) { if(!t) return ''; const d=document.createElement('div'); d.textContent=t; return d.innerHTML; }
    _fmtDate(ds) { if(!ds) return ''; const d=new Date(ds); return isNaN(d.getTime())?'':d.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'}); }
    disconnectedCallback() {}
}

customElements.define('vehicle-detail-viewer', VehicleDetailViewer);
