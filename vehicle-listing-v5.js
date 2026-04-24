/**
 * CUSTOM ELEMENT — Vehicle Listing List Page
 * Tag: <vehicle-list-viewer>
 *
 * HOW IT WORKS
 * ─────────────
 * The widget fetches ALL active listings from the CMS (up to 500) and sends
 * them here in one JSON payload. Every filter, search, sort, and pagination
 * operation runs entirely client-side on that full dataset.
 *
 * Attributes consumed:
 *   listing-list  — JSON { listings[], postsPerPage }
 *   style-props   — JSON style token object
 *
 * Events dispatched:
 *   navigate-to-listing  — { slug }
 *
 * ARCHITECTURE NOTES
 * ──────────────────
 * Filter state lives in ONE plain object (this._s). Reset = new object.
 * The advanced panel is rebuilt from scratch on every data change AND reset,
 * which eliminates every stale-closure and double-listener bug permanently.
 * Sliders use a shared _onSliderChange() handler that reads all config from
 * data-* attributes, so no closures capture stale values.
 */

// ─── Icons ───────────────────────────────────────────────────────────────────
const I = {
  search:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  filter:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
  close:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  chevL:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevR:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>`,
  car:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-4h12l3 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/></svg>`,
  gauge:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="m12 12-4-4"/><circle cx="12" cy="12" r="2"/></svg>`,
  fuel:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 22V8l6-6h6l2 2v4h2a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2z"/></svg>`,
  gear:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  color:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125C12.888 18.78 12.74 18.416 12.74 17.943A1.64 1.64 0 0 1 14.408 16.274h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
  star:     `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  arrow:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  compare:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>`,
  reset:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  empty:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  spin:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity=".25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg>`,
};

// ─── Filter state factory — always creates a fresh plain object ───────────────
// null = "not user-set, use data bounds". Reset = call freshState() again.
function freshState() {
  return {
    q: '',                           // search query
    vehicleType: 'all',
    listingType: 'all',
    status: 'all',
    sort: 'newest',
    priceMin: null, priceMax: null,  // null → resolved to bounds at filter time
    yearMin:  null, yearMax:  null,
    mileMax:  null,
    makes: [], bodyStyles: [], fuelTypes: [],
    transmissions: [], drivetrains: [], colors: [],
    featured: false,
  };
}

// ─── Visible filter keys ──────────────────────────────────────────────────────
const ALL_VIS = [
  'vehicleType','listingType','status',
  'priceRange','yearRange','mileageRange',
  'make','bodyStyle','fuelType','transmission','drivetrain','exteriorColor','featured',
];

class VehicleListViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._all     = [];          // full CMS dataset
    this._perPage = 9;
    this._page    = 1;
    this._cmpIds  = [];          // IDs being compared
    this._panelOpen = false;
    this._vis     = new Set(ALL_VIS);

    // Bounds computed from data — ONLY written by _computeBounds()
    this._b = { priceMin:0, priceMax:500000, yearMin:1990, yearMax:2030, mileMax:300000 };

    // THE filter state — single source of truth
    this._s = freshState();

    this.sp = this._parseStyles(this.getAttribute('style-props'));
    this._buildShell();
  }

  static get observedAttributes() { return ['listing-list','style-props']; }

  // ─── Attribute handler ────────────────────────────────────────────────────
  attributeChangedCallback(name, _, newVal) {
    if (!newVal) return;
    if (name === 'listing-list') {
      try {
        const d = JSON.parse(newVal);
        this._all     = d.listings || [];
        this._perPage = Math.max(1, Number(d.postsPerPage) || 9);
        this._computeBounds();   // update slider bounds from fresh data
        this._page = 1;
        // Do NOT reset this._s — preserve user's active filter selections
        requestAnimationFrame(() => { this._buildPanel(); this._render(); });
      } catch(e) { console.error('[vlv] listing-list parse:', e); }

    } else if (name === 'style-props') {
      try {
        const inc = JSON.parse(newVal);
        this.sp = { ...this.sp, ...inc };
        const vf = inc.visibleFilters;
        this._vis = (!vf || vf === 'all')
          ? new Set(ALL_VIS)
          : new Set(vf.split(',').map(s => s.trim()));
        if (this._shellBuilt) { this._refreshCSS(); this._applyVis(); }
      } catch(e) { console.error('[vlv] style-props parse:', e); }
    }
  }

  // ─── Style defaults ───────────────────────────────────────────────────────
  _parseStyles(raw) {
    const def = {
      fontFamily: 'system-ui,sans-serif', fontSize: 14,
      bgColor: '#0f1117', accentColor: '#f97316', accentHover: '#ea580c',
      cardBg: '#1a1d27', cardBorder: '#2a2d3a',
      cardShadow: 'rgba(0,0,0,.4)', cardHoverShadow: 'rgba(249,115,22,.2)',
      cardTitleColor: '#fff', cardBodyColor: '#94a3b8', cardMetaColor: '#64748b',
      pricePrimaryColor: '#f97316', priceSecondaryColor: '#94a3b8',
      badgeNewBg: '#166534',  badgeNewText: '#bbf7d0',
      badgeUsedBg: '#1e3a5f', badgeUsedText: '#93c5fd',
      badgeRentBg: '#4c1d95', badgeRentText: '#ddd6fe',
      badgeAuctionBg: '#7c2d12', badgeAuctionText: '#fed7aa',
      badgeFeaturedBg: '#f97316', badgeFeaturedText: '#fff',
      filterBg: '#1a1d27', filterBorder: '#2a2d3a',
      filterText: '#94a3b8', filterActiveBg: '#f97316', filterActiveText: '#fff',
      btnBg: '#f97316', btnText: '#fff',
      btnGhostBorder: '#f97316', btnGhostText: '#f97316',
      pagBorder: '#2a2d3a', pagText: '#94a3b8',
      pagActiveBg: '#f97316', pagActiveText: '#fff', pagHoverBg: '#1e2133',
      searchBg: '#1a1d27', searchBorder: '#2a2d3a',
      searchText: '#fff', searchPlaceholder: '#64748b',
      panelBg: '#141720', panelBorder: '#2a2d3a',
      sliderAccent: '#f97316', rangeColor: '#f97316',
      cbAccent: '#f97316', iconColor: '#64748b', emptyColor: '#64748b',
      visibleFilters: 'all',
    };
    try { return raw ? { ...def, ...JSON.parse(raw) } : def; } catch(e) { return def; }
  }

  // ─── Compute data bounds — never touches filter state ─────────────────────
  _computeBounds() {
    const prices = this._all.map(v => Number(v.salePrice || v.price) || 0).filter(n => n > 0);
    const years  = this._all.map(v => Number(v.year)    || 0).filter(n => n > 0);
    const miles  = this._all.map(v => Number(v.mileage) || 0).filter(n => n > 0);
    this._b = {
      priceMin: prices.length ? Math.floor(Math.min(...prices) / 500)  * 500  : 0,
      priceMax: prices.length ? Math.ceil( Math.max(...prices) / 500)  * 500  : 500000,
      yearMin:  years.length  ? Math.min(...years)                              : 1990,
      yearMax:  years.length  ? Math.max(...years)                              : new Date().getFullYear() + 1,
      mileMax:  miles.length  ? Math.ceil( Math.max(...miles)  / 5000) * 5000  : 300000,
    };
  }

  // Resolve null filter values to full bounds (= no restriction applied)
  _res() {
    const { _s: s, _b: b } = this;
    return {
      ...s,
      priceMin: s.priceMin !== null ? s.priceMin : b.priceMin,
      priceMax: s.priceMax !== null ? s.priceMax : b.priceMax,
      yearMin:  s.yearMin  !== null ? s.yearMin  : b.yearMin,
      yearMax:  s.yearMax  !== null ? s.yearMax  : b.yearMax,
      mileMax:  s.mileMax  !== null ? s.mileMax  : b.mileMax,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SHELL — built once, never rebuilt. Contains the skeleton layout.
  // The advanced filter panel (#panel) is the only part that gets rebuilt.
  // ─────────────────────────────────────────────────────────────────────────
  _buildShell() {
    this.shadowRoot.innerHTML = `<style id="vlvCSS">${this._css()}</style>${this._html()}`;
    this._shellBuilt = true;
    this._wireShell();
  }

  _refreshCSS() {
    const s = this.shadowRoot.getElementById('vlvCSS');
    if (s) s.textContent = this._css();
  }

  _html() { return `
<div class="host">

  <!-- ── TOP BAR: search + sort + filter toggle ── -->
  <div class="topbar">
    <div class="searchbox">
      <span class="ic si">${I.search}</span>
      <input id="srch" class="search" type="text" placeholder="Search make, model, year, VIN, color…" autocomplete="off"/>
      <button class="srch-clear" id="srchClear" title="Clear search">×</button>
    </div>
    <div class="controls">
      <select id="srt" class="sel">
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="price-asc">Price ↑</option>
        <option value="price-desc">Price ↓</option>
        <option value="year-desc">Year: New→Old</option>
        <option value="year-asc">Year: Old→New</option>
        <option value="mileage-asc">Mileage ↑</option>
      </select>
      <button id="panelToggle" class="panel-toggle">
        <span class="ic">${I.filter}</span>
        <span class="pt-label">Filters</span>
        <span class="pt-badge" id="badge" style="display:none">0</span>
      </button>
    </div>
  </div>

  <!-- ── QUICK PILLS ── -->
  <div class="quick" id="quick">
    <div class="qrow" id="qrowVT">
      <span class="qlbl">Type</span>
      <div class="qpills" id="pillsVT">
        <button class="qpill active" data-g="vehicleType" data-v="all">All</button>
        <button class="qpill" data-g="vehicleType" data-v="car">Cars</button>
        <button class="qpill" data-g="vehicleType" data-v="motorcycle">Motorcycles</button>
        <button class="qpill" data-g="vehicleType" data-v="rv">RVs</button>
        <button class="qpill" data-g="vehicleType" data-v="truck">Trucks</button>
        <button class="qpill" data-g="vehicleType" data-v="van">Vans</button>
        <button class="qpill" data-g="vehicleType" data-v="boat">Boats</button>
      </div>
    </div>
    <div class="qrow" id="qrowLT">
      <span class="qlbl">Listing</span>
      <div class="qpills" id="pillsLT">
        <button class="qpill active" data-g="listingType" data-v="all">All</button>
        <button class="qpill" data-g="listingType" data-v="new">New</button>
        <button class="qpill" data-g="listingType" data-v="used">Used</button>
        <button class="qpill" data-g="listingType" data-v="rent">Rent/Lease</button>
        <button class="qpill" data-g="listingType" data-v="auction">Auction</button>
      </div>
    </div>
    <div class="qrow" id="qrowST">
      <span class="qlbl">Status</span>
      <div class="qpills" id="pillsST">
        <button class="qpill active" data-g="status" data-v="all">All</button>
        <button class="qpill" data-g="status" data-v="active">Active</button>
        <button class="qpill" data-g="status" data-v="sold">Sold</button>
        <button class="qpill" data-g="status" data-v="rented">Rented</button>
      </div>
    </div>
  </div>

  <!-- ── ADVANCED FILTER PANEL (rebuilt on data / reset) ── -->
  <div class="panel" id="panel" role="dialog" aria-label="Advanced filters"></div>

  <!-- ── ACTIVE FILTER CHIPS ── -->
  <div class="chips" id="chips"></div>

  <!-- ── COMPARE BAR ── -->
  <div class="cmpbar" id="cmpbar" style="display:none">
    <span class="ic" style="font-size:17px">${I.compare}</span>
    <span class="cmp-lbl">Comparing <strong id="cmpCount">0</strong> vehicles</span>
    <button class="btn btn-accent btn-sm" id="cmpGo">Compare Now</button>
    <button class="btn btn-ghost btn-sm" id="cmpClr">${I.close} Clear</button>
  </div>

  <!-- ── RESULTS META ── -->
  <div class="meta" id="meta"></div>

  <!-- ── CARD GRID ── -->
  <div class="grid" id="grid">
    <div class="state-box">
      <span class="ic spin-ic">${I.spin}</span>
      <p>Loading listings…</p>
    </div>
  </div>

  <!-- ── PAGINATION ── -->
  <div class="pag" id="pag"></div>

  <!-- ── COMPARE MODAL ── -->
  <div class="modal-bg" id="cmpModal" style="display:none">
    <div class="modal">
      <div class="modal-head">
        <h2>Vehicle Comparison</h2>
        <button id="cmpModalClose" class="modal-close">${I.close}</button>
      </div>
      <div class="modal-scroll" id="cmpBody"></div>
    </div>
  </div>

</div>`; }

  // ─── CSS ──────────────────────────────────────────────────────────────────
  _css() {
    const s = this.sp, fs = Number(s.fontSize)||14, f2=Math.max(11,fs-2), f3=Math.max(10,fs-3);
    return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:host{display:block;width:100%}
.host{background:${s.bgColor};padding:24px 16px;min-height:500px;font-family:${s.fontFamily};font-size:${fs}px;color:${s.cardBodyColor}}

/* ── icon helper ── */
.ic{display:inline-flex;align-items:center;justify-content:center;line-height:1;flex-shrink:0}
.ic svg{width:1em;height:1em;vertical-align:middle}
@keyframes spin{to{transform:rotate(360deg)}}
.spin-ic{animation:spin .8s linear infinite;font-size:32px;color:${s.accentColor};display:block;margin:0 auto 12px}

/* ── top bar ── */
.topbar{display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;align-items:stretch}
.searchbox{flex:1;min-width:200px;position:relative;display:flex;align-items:center}
.si{position:absolute;left:11px;color:${s.iconColor};font-size:16px;pointer-events:none}
.search{width:100%;padding:10px 36px 10px 38px;background:${s.searchBg};border:1.5px solid ${s.searchBorder};border-radius:10px;color:${s.searchText};font-size:${fs}px;font-family:inherit;outline:none;transition:border-color .2s}
.search::placeholder{color:${s.searchPlaceholder}}
.search:focus{border-color:${s.accentColor}}
.srch-clear{position:absolute;right:10px;background:none;border:none;color:${s.iconColor};cursor:pointer;font-size:18px;line-height:1;display:none;padding:2px 4px;border-radius:4px}
.srch-clear:hover{color:${s.accentColor}}
.srch-clear.vis{display:block}
.controls{display:flex;gap:8px;align-items:stretch}
.sel{padding:10px 12px;background:${s.searchBg};border:1.5px solid ${s.searchBorder};border-radius:10px;color:${s.searchText};font-size:${fs}px;font-family:inherit;cursor:pointer;appearance:none;outline:none;min-width:150px}
.sel:focus{border-color:${s.accentColor}}
.panel-toggle{display:inline-flex;align-items:center;gap:6px;padding:10px 14px;border-radius:10px;font-size:${fs}px;font-weight:600;border:1.5px solid ${s.filterBorder};background:${s.filterBg};color:${s.filterText};cursor:pointer;font-family:inherit;position:relative;transition:all .2s;white-space:nowrap}
.panel-toggle:hover,.panel-toggle.open{border-color:${s.accentColor};color:${s.accentColor}}
.pt-badge{position:absolute;top:-7px;right:-7px;min-width:18px;height:18px;border-radius:9px;padding:0 4px;background:${s.accentColor};color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;pointer-events:none}

/* ── quick pills ── */
.quick{display:flex;flex-direction:column;gap:6px;margin-bottom:12px}
.qrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.qlbl{font-size:${f3}px;color:${s.cardMetaColor};font-weight:700;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;min-width:48px}
.qpills{display:flex;gap:5px;flex-wrap:wrap}
.qpill{padding:5px 13px;border-radius:20px;font-size:${f2}px;font-weight:500;border:1.5px solid ${s.filterBorder};background:${s.filterBg};color:${s.filterText};cursor:pointer;transition:all .2s;font-family:inherit;white-space:nowrap}
.qpill:hover{border-color:${s.accentColor};color:${s.accentColor}}
.qpill.active{background:${s.filterActiveBg};color:${s.filterActiveText};border-color:${s.filterActiveBg}}

/* ── advanced panel ── */
.panel{display:none;flex-direction:column;background:${s.panelBg};border:1.5px solid ${s.panelBorder};border-radius:12px;margin-bottom:14px;overflow:hidden}
.panel.open{display:flex}
.panel-inner{display:flex;flex-wrap:wrap;gap:0}
.psec{flex:1 1 180px;min-width:160px;padding:14px 16px;border-right:1px solid ${s.panelBorder}}
.psec:last-child{border-right:none}
.psec-full{flex:1 1 100%;border-right:none;border-top:1px solid ${s.panelBorder};padding:14px 16px}
.psec-title{font-size:${f3}px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:${s.cardMetaColor};margin-bottom:10px}

/* ── range sliders ── */
.range-labels{display:flex;justify-content:space-between;font-size:${f2}px;color:${s.rangeColor};font-weight:600;margin-bottom:8px}
.range-wrap{position:relative;height:24px;display:flex;align-items:center;margin:0 2px}
.r-track{position:absolute;left:0;right:0;height:4px;background:${s.panelBorder};border-radius:2px;pointer-events:none}
.r-fill{position:absolute;height:4px;background:${s.sliderAccent};border-radius:2px;pointer-events:none;transition:left .05s,width .05s}
.r-input{position:absolute;left:0;right:0;width:100%;height:4px;appearance:none;-webkit-appearance:none;background:transparent;pointer-events:none;outline:none;margin:0}
.r-input::-webkit-slider-thumb{appearance:none;-webkit-appearance:none;width:20px;height:20px;border-radius:50%;background:${s.sliderAccent};border:2px solid ${s.panelBg};box-shadow:0 0 0 2px ${s.sliderAccent};cursor:pointer;pointer-events:all;transition:transform .15s}
.r-input::-webkit-slider-thumb:hover,.r-input::-webkit-slider-thumb:active{transform:scale(1.15)}
.r-input::-moz-range-thumb{width:20px;height:20px;border-radius:50%;background:${s.sliderAccent};border:2px solid ${s.panelBg};cursor:pointer;pointer-events:all}
.r-hi{z-index:2}

/* ── checkboxes ── */
.ck-list{display:flex;flex-direction:column;gap:4px;max-height:155px;overflow-y:auto;padding-right:2px}
.ck-list::-webkit-scrollbar{width:3px}
.ck-list::-webkit-scrollbar-thumb{background:${s.panelBorder};border-radius:2px}
.ck-row{display:flex;align-items:center;gap:7px;cursor:pointer;padding:3px 0;border-radius:5px}
.ck-row:hover .ck-label{color:${s.accentColor}}
.ck-box{accent-color:${s.cbAccent};width:14px;height:14px;cursor:pointer;flex-shrink:0}
.ck-label{font-size:${f2}px;color:${s.filterText};line-height:1.3;user-select:none}

/* ── toggle (featured) ── */
.tog-row{display:flex;align-items:center;gap:10px;cursor:pointer}
.tog-input{display:none}
.tog-track{width:40px;height:22px;border-radius:11px;background:${s.panelBorder};position:relative;flex-shrink:0;transition:background .2s}
.tog-track::after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .2s;box-shadow:0 1px 3px rgba(0,0,0,.3)}
.tog-input:checked+.tog-track{background:${s.cbAccent}}
.tog-input:checked+.tog-track::after{transform:translateX(18px)}
.tog-lbl{font-size:${fs}px;color:${s.filterText};user-select:none}

/* ── panel footer ── */
.panel-footer{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-top:1px solid ${s.panelBorder};background:${s.panelBg}}
.panel-footer-info{font-size:${f2}px;color:${s.cardMetaColor}}

/* ── chip bar ── */
.chips{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px}
.chip{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;background:${s.filterBg};border:1px solid ${s.accentColor};border-radius:20px;font-size:${f2}px;color:${s.accentColor};cursor:pointer;font-family:inherit}
.chip:hover{background:${s.accentColor};color:#fff}
.chip-x{font-size:13px;line-height:1;margin-left:2px}

/* ── compare bar ── */
.cmpbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:${s.filterBg};border:2px solid ${s.accentColor};border-radius:10px;padding:10px 16px;margin-bottom:14px}
.cmp-lbl{color:${s.cardBodyColor};font-size:${fs}px;flex:1}

/* ── meta ── */
.meta{font-size:${f2}px;color:${s.cardMetaColor};margin-bottom:14px}

/* ── buttons ── */
.btn{display:inline-flex;align-items:center;gap:5px;padding:9px 18px;border-radius:8px;font-size:${fs}px;font-weight:600;cursor:pointer;border:none;transition:all .2s;font-family:inherit;white-space:nowrap}
.btn svg{width:14px;height:14px}
.btn-sm{padding:7px 12px;font-size:${f2}px}
.btn-accent{background:${s.btnBg};color:${s.btnText}}.btn-accent:hover{background:${s.accentHover}}
.btn-ghost{background:transparent;color:${s.btnGhostText};border:1.5px solid ${s.btnGhostBorder}}.btn-ghost:hover{background:${s.btnGhostBorder};color:#fff}
.btn-reset{background:transparent;color:${s.cardMetaColor};border:1px solid ${s.panelBorder};font-size:${f2}px;padding:6px 12px}.btn-reset:hover{border-color:${s.accentColor};color:${s.accentColor}}

/* ── grid ── */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:18px;margin-bottom:32px}

/* ── state box (loading / empty) ── */
.state-box{grid-column:1/-1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:70px 20px;gap:12px;color:${s.emptyColor};text-align:center}
.state-box svg{width:48px;height:48px;opacity:.4}
.state-box h3{font-size:${fs+4}px;color:${s.cardBodyColor};margin-bottom:4px}
.state-box p{font-size:${f2}px}

/* ── card ── */
.card{background:${s.cardBg};border:1.5px solid ${s.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 4px 14px ${s.cardShadow};transition:transform .25s,box-shadow .25s,border-color .25s;display:flex;flex-direction:column;position:relative}
.card:hover{transform:translateY(-3px);box-shadow:0 8px 24px ${s.cardHoverShadow};border-color:${s.accentColor}}
.card.sel{border-color:${s.accentColor};box-shadow:0 0 0 2px ${s.accentColor}40}
.card-img-wrap{width:100%;height:195px;overflow:hidden;background:${s.cardBorder};position:relative;flex-shrink:0}
.card-img{width:100%;height:100%;object-fit:cover;transition:transform .3s;display:block}
.card:hover .card-img{transform:scale(1.04)}
.card-img-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:${s.cardMetaColor};font-size:52px}
.bdgs{position:absolute;top:8px;left:8px;display:flex;gap:4px;flex-wrap:wrap}
.bdg{padding:3px 8px;border-radius:8px;font-size:${f3}px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;line-height:1.4}
.bdg-new{background:${s.badgeNewBg};color:${s.badgeNewText}}
.bdg-used{background:${s.badgeUsedBg};color:${s.badgeUsedText}}
.bdg-rent{background:${s.badgeRentBg};color:${s.badgeRentText}}
.bdg-auction{background:${s.badgeAuctionBg};color:${s.badgeAuctionText}}
.bdg-feat{background:${s.badgeFeaturedBg};color:${s.badgeFeaturedText};display:inline-flex;align-items:center;gap:3px}
.bdg-sold,.bdg-rented{background:#374151;color:#9ca3af}
.cmp-wrap{position:absolute;top:8px;right:8px}
.cmp-cb{width:18px;height:18px;cursor:pointer;accent-color:${s.accentColor};border-radius:4px}
.card-body{padding:14px;flex:1;display:flex;flex-direction:column;gap:7px}
.card-title{font-size:${fs+2}px;font-weight:700;color:${s.cardTitleColor};line-height:1.3}
.card-sub{font-size:${f2}px;color:${s.cardMetaColor}}
.card-specs{display:flex;gap:10px;flex-wrap:wrap}
.spec{display:inline-flex;align-items:center;gap:4px;font-size:${f2}px;color:${s.cardBodyColor}}
.spec .ic{color:${s.iconColor};font-size:13px}
.price-row{display:flex;align-items:baseline;gap:8px}
.price{font-size:${fs+6}px;font-weight:800;color:${s.pricePrimaryColor}}
.price-orig{font-size:${fs}px;color:${s.priceSecondaryColor};text-decoration:line-through}
.price-note{font-size:${f2}px;color:${s.cardMetaColor}}
.card-foot{padding:10px 14px;border-top:1px solid ${s.cardBorder};display:flex;gap:7px}
.card-foot .btn{flex:1;justify-content:center;font-size:${f2}px;padding:8px}

/* ── pagination ── */
.pag{display:flex;justify-content:center;align-items:center;gap:4px;flex-wrap:wrap;margin-top:4px}
.pbn{display:inline-flex;align-items:center;justify-content:center;gap:2px;padding:8px 12px;min-width:38px;border:1.5px solid ${s.pagBorder};border-radius:8px;background:${s.cardBg};color:${s.pagText};font-size:${fs}px;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit}
.pbn svg{width:14px;height:14px}
.pbn:hover:not([disabled]){background:${s.pagHoverBg};border-color:${s.accentColor};color:${s.accentColor}}
.pbn[disabled]{opacity:.35;cursor:not-allowed}
.pbn.on{background:${s.pagActiveBg};border-color:${s.pagActiveBg};color:${s.pagActiveText}}
.pdot{font-size:${fs}px;color:${s.cardMetaColor};padding:0 2px}

/* ── compare modal ── */
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:30px 12px;overflow-y:auto}
.modal{background:${s.cardBg};border:1px solid ${s.cardBorder};border-radius:14px;width:100%;max-width:1100px;overflow:hidden}
.modal-head{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid ${s.cardBorder};position:sticky;top:0;background:${s.cardBg};z-index:1}
.modal-head h2{color:${s.cardTitleColor};font-size:${fs+3}px;font-weight:700;font-family:inherit}
.modal-close{background:none;border:none;color:${s.cardMetaColor};cursor:pointer;font-size:20px;padding:4px;border-radius:5px;display:flex;align-items:center;transition:color .2s}
.modal-close:hover{color:${s.accentColor}}
.modal-scroll{padding:20px;overflow-x:auto}
.cmp-tbl{width:100%;border-collapse:collapse;font-size:${fs}px}
.cmp-tbl th,.cmp-tbl td{padding:9px 14px;border-bottom:1px solid ${s.cardBorder};text-align:left}
.cmp-tbl thead th{background:${s.filterBg};font-weight:700;min-width:180px}
.cmp-tbl thead th:first-child{color:${s.cardMetaColor};font-size:${f3}px;text-transform:uppercase;letter-spacing:.5px;min-width:140px;background:${s.panelBg}}
.cmp-tbl td{color:${s.cardBodyColor}}
.cmp-tbl td:first-child{color:${s.cardMetaColor};font-size:${f2}px;font-weight:600;background:${s.panelBg}}
.cmp-tbl tr:nth-child(even) td{background:rgba(255,255,255,.02)}
.cmp-img{width:100%;height:110px;object-fit:cover;border-radius:7px;margin-bottom:7px;display:block}
.cmp-name{font-weight:700;color:${s.cardTitleColor};font-size:${f2}px;font-family:inherit}

/* ── responsive ── */
@media(max-width:600px){
  .host{padding:16px 12px}
  .topbar{flex-direction:column}
  .controls{justify-content:space-between}
  .sel{flex:1}
  .grid{grid-template-columns:1fr}
  .psec{flex:1 1 100%;border-right:none;border-bottom:1px solid ${s.panelBorder}}
  .psec-full{border-bottom:none}
  .panel-footer{flex-direction:column;gap:8px;align-items:stretch;text-align:center}
}
@media(min-width:601px) and (max-width:900px){
  .psec{flex:1 1 48%}
  .grid{grid-template-columns:repeat(2,1fr)}
}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // _wireShell — binds events on elements that exist from the start.
  // Uses event delegation everywhere. Called ONCE.
  // ─────────────────────────────────────────────────────────────────────────
  _wireShell() {
    const sr = this.shadowRoot;
    let st;

    // Search
    const srch = sr.getElementById('srch');
    const clr  = sr.getElementById('srchClear');
    srch.addEventListener('input', e => {
      const v = e.target.value;
      clr.classList.toggle('vis', v.length > 0);
      clearTimeout(st);
      st = setTimeout(() => { this._s.q = v.toLowerCase().trim(); this._page=1; this._render(); }, 260);
    });
    clr.addEventListener('click', () => {
      srch.value = ''; clr.classList.remove('vis');
      this._s.q = ''; this._page=1; this._render();
    });

    // Sort
    sr.getElementById('srt').addEventListener('change', e => {
      this._s.sort = e.target.value; this._page=1; this._render();
    });

    // Filter panel toggle
    const tog = sr.getElementById('panelToggle');
    const pnl = sr.getElementById('panel');
    tog.addEventListener('click', () => {
      this._panelOpen = !this._panelOpen;
      pnl.classList.toggle('open', this._panelOpen);
      tog.classList.toggle('open', this._panelOpen);
    });

    // Quick pills — delegated on each group container
    [['pillsVT','vehicleType'],['pillsLT','listingType'],['pillsST','status']].forEach(([id,key]) => {
      sr.getElementById(id).addEventListener('click', e => {
        const btn = e.target.closest('.qpill'); if (!btn) return;
        sr.querySelectorAll(`#${id} .qpill`).forEach(p => p.classList.toggle('active', p===btn));
        this._s[key] = btn.dataset.v; this._page=1; this._render();
      });
    });

    // Chip bar — delegated
    sr.getElementById('chips').addEventListener('click', e => {
      const chip = e.target.closest('.chip'); if (!chip) return;
      this._removeChip(chip.dataset.key, chip.dataset.val);
    });

    // Compare buttons
    sr.getElementById('cmpGo').addEventListener('click',  () => this._showCmpModal());
    sr.getElementById('cmpClr').addEventListener('click', () => { this._cmpIds=[]; this._updateCmpBar(); this._render(); });
    sr.getElementById('cmpModalClose').addEventListener('click', () => {
      sr.getElementById('cmpModal').style.display = 'none';
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // _buildPanel — COMPLETELY rebuilds the advanced filter panel each time.
  //   • Old DOM discarded → all old listeners die with it
  //   • New DOM gets ONE delegated 'input'+'change' listener on the panel root
  //   • Slider config stored in data-* attrs → no closures capture stale values
  //   • Reset rebuilds the panel again → guaranteed clean slate every time
  // ─────────────────────────────────────────────────────────────────────────
  _buildPanel() {
    const { _s:s, _b:b, _all:all } = this;
    const r = this._res();           // resolved filter values

    // Build unique sorted option lists from the FULL dataset
    const uniq = key => [...new Set(all.map(v => v[key]).filter(Boolean))].sort();
    const meta = {
      makes:  uniq('make'), bodyStyles: uniq('bodyStyle'), fuelTypes: uniq('fuelType'),
      trans:  uniq('transmission'), drives: uniq('drivetrain'), colors: uniq('exteriorColor'),
    };

    // ── Helpers for building section HTML ──────────────────────────────────

    const dualRange = (id, title, loId, hiId, fillId, loVal, hiVal, minB, maxB, step, fmtLo, fmtHi) => `
      <div class="psec" id="${id}">
        <div class="psec-title">${title}</div>
        <div class="range-labels">
          <span id="${loId}L">${fmtLo(loVal)}</span>
          <span id="${hiId}L">${fmtHi(hiVal)}</span>
        </div>
        <div class="range-wrap">
          <div class="r-track"></div>
          <div class="r-fill" id="${fillId}"></div>
          <input class="r-input" type="range" id="${loId}"
            min="${minB}" max="${maxB}" value="${loVal}" step="${step}"
            data-type="dual-lo" data-fill="${fillId}"
            data-lo="${loId}" data-hi="${hiId}"
            data-min="${minB}" data-max="${maxB}"
            data-sk-lo="${loId === 'rPrLo' ? 'priceMin' : 'yearMin'}"
            data-sk-hi="${loId === 'rPrLo' ? 'priceMax' : 'yearMax'}"
            data-fmt="${loId === 'rPrLo' ? 'price' : 'year'}"/>
          <input class="r-input r-hi" type="range" id="${hiId}"
            min="${minB}" max="${maxB}" value="${hiVal}" step="${step}"
            data-type="dual-hi" data-fill="${fillId}"
            data-lo="${loId}" data-hi="${hiId}"
            data-min="${minB}" data-max="${maxB}"
            data-sk-lo="${loId === 'rPrLo' ? 'priceMin' : 'yearMin'}"
            data-sk-hi="${loId === 'rPrLo' ? 'priceMax' : 'yearMax'}"
            data-fmt="${loId === 'rPrLo' ? 'price' : 'year'}"/>
        </div>
      </div>`;

    const singleRange = (id, title, inputId, fillId, val, minB, maxB, step) => `
      <div class="psec" id="${id}">
        <div class="psec-title">${title}</div>
        <div class="range-labels">
          <span>0 mi</span>
          <span id="${inputId}L">${Number(val).toLocaleString()} mi</span>
        </div>
        <div class="range-wrap">
          <div class="r-track"></div>
          <div class="r-fill" id="${fillId}"></div>
          <input class="r-input" type="range" id="${inputId}"
            min="${minB}" max="${maxB}" value="${val}" step="${step}"
            data-type="single" data-fill="${fillId}"
            data-min="${minB}" data-max="${maxB}" data-sk="mileMax"/>
        </div>
      </div>`;

    const checkSec = (id, title, items, stateKey) => {
      if (!items.length) return '';
      const arr = s[stateKey] || [];
      return `
      <div class="psec" id="${id}">
        <div class="psec-title">${title}</div>
        <div class="ck-list">
          ${items.map(v => `
          <label class="ck-row">
            <input class="ck-box" type="checkbox"
              data-type="ck" data-sk="${stateKey}" data-val="${this._esc(v)}"
              ${arr.includes(v) ? 'checked' : ''}/>
            <span class="ck-label">${this._esc(v)}</span>
          </label>`).join('')}
        </div>
      </div>`;
    };

    // How many results with current filters?
    const previewCount = this._filter(r).length;

    // ── Assemble panel HTML ────────────────────────────────────────────────
    const panel = this.shadowRoot.getElementById('panel');
    panel.innerHTML = `
      <div class="panel-inner">
        ${dualRange('secPr','Price Range','rPrLo','rPrHi','fPr',
            r.priceMin, r.priceMax, b.priceMin, b.priceMax, 500,
            v => '$'+Number(v).toLocaleString(), v => '$'+Number(v).toLocaleString())}
        ${dualRange('secYr','Year','rYrLo','rYrHi','fYr',
            r.yearMin, r.yearMax, b.yearMin, b.yearMax, 1,
            v => String(Math.round(v)), v => String(Math.round(v)))}
        ${singleRange('secMi','Max Mileage','rMi','fMi', r.mileMax, 0, b.mileMax, 1000)}
        ${checkSec('secMk','Make',         meta.makes,      'makes')}
        ${checkSec('secBS','Body Style',   meta.bodyStyles,  'bodyStyles')}
        ${checkSec('secFT','Fuel Type',    meta.fuelTypes,   'fuelTypes')}
        ${checkSec('secTR','Transmission', meta.trans,       'transmissions')}
        ${checkSec('secDR','Drivetrain',   meta.drives,      'drivetrains')}
        ${checkSec('secCL','Color',        meta.colors,      'colors')}
        <div class="psec psec-full" id="secFeat">
          <label class="tog-row">
            <input class="tog-input" type="checkbox" id="togFeat"
              data-type="toggle" data-sk="featured"
              ${s.featured ? 'checked' : ''}/>
            <span class="tog-track"></span>
            <span class="tog-lbl">Featured listings only</span>
          </label>
        </div>
      </div>
      <div class="panel-footer">
        <span class="panel-footer-info" id="panelCount">${previewCount} listing${previewCount!==1?'s':''} match</span>
        <button class="btn btn-reset" id="resetBtn">
          <span class="ic" style="font-size:13px">${I.reset}</span> Reset all filters
        </button>
      </div>`;

    // ── Update slider fills ─────────────────────────────────────────────────
    this._updateFills();

    // ── ONE delegated listener on the panel ────────────────────────────────
    // Handles ALL input types: dual range, single range, checkbox, toggle.
    // Reads config from data-* attributes at event time — no stale closures.
    panel.addEventListener('input', e => this._onPanelInput(e));
    panel.addEventListener('change', e => this._onPanelChange(e));

    // ── Reset button ────────────────────────────────────────────────────────
    // Resets state then calls _buildPanel() again → guaranteed clean slate.
    panel.querySelector('#resetBtn').addEventListener('click', () => {
      this._s = freshState();
      this._page = 1;
      // Reset pills
      [['pillsVT','vehicleType'],['pillsLT','listingType'],['pillsST','status']].forEach(([id,key]) => {
        this.shadowRoot.querySelectorAll(`#${id} .qpill`)
          .forEach((p,i) => p.classList.toggle('active', i===0));
      });
      // Reset search
      const srch = this.shadowRoot.getElementById('srch');
      if (srch) { srch.value=''; this.shadowRoot.getElementById('srchClear').classList.remove('vis'); }
      // Reset sort
      const srt = this.shadowRoot.getElementById('srt');
      if (srt) srt.value = 'newest';
      // Rebuild panel with fresh state
      this._buildPanel();
      this._render();
      this._updateBadge();
    });

    this._applyVis();
  }

  // ── Single shared input handler — reads everything from data-* attrs ───────
  _onPanelInput(e) {
    const el = e.target;
    const type = el.dataset.type;
    if (!type) return;

    const sr = this.shadowRoot;

    if (type === 'dual-lo' || type === 'dual-hi') {
      const loEl = sr.getElementById(el.dataset.lo);
      const hiEl = sr.getElementById(el.dataset.hi);
      if (!loEl || !hiEl) return;

      let lo = parseFloat(loEl.value), hi = parseFloat(hiEl.value);
      // Clamp: lo must never exceed hi
      if (lo > hi) { if (type === 'dual-lo') { lo = hi; loEl.value = hi; } else { hi = lo; hiEl.value = lo; } }

      const minB = parseFloat(el.dataset.min), maxB = parseFloat(el.dataset.max);
      const range = maxB - minB || 1;
      const fill = sr.getElementById(el.dataset.fill);
      if (fill) {
        fill.style.left  = ((lo - minB) / range * 100) + '%';
        fill.style.width = ((hi - lo)   / range * 100) + '%';
      }

      const fmt = el.dataset.fmt;
      const fmtV = v => fmt === 'price' ? '$'+Number(v).toLocaleString() : String(Math.round(v));
      const loLbl = sr.getElementById(el.dataset.lo+'L');
      const hiLbl = sr.getElementById(el.dataset.hi+'L');
      if (loLbl) loLbl.textContent = fmtV(lo);
      if (hiLbl) hiLbl.textContent = fmtV(hi);

      this._s[el.dataset.skLo] = lo;
      this._s[el.dataset.skHi] = hi;
      this._page = 1;
      this._render();
      // Update preview count in panel footer
      const pc = sr.getElementById('panelCount');
      if (pc) { const n = this._filter(this._res()).length; pc.textContent = `${n} listing${n!==1?'s':''} match`; }
    }

    if (type === 'single') {
      const val = parseFloat(el.value);
      const minB = parseFloat(el.dataset.min), maxB = parseFloat(el.dataset.max);
      const range = maxB - minB || 1;
      const fill = sr.getElementById(el.dataset.fill);
      if (fill) { fill.style.left='0%'; fill.style.width = ((val - minB) / range * 100) + '%'; }
      const lbl = sr.getElementById(el.id+'L');
      if (lbl) lbl.textContent = Number(val).toLocaleString()+' mi';
      this._s[el.dataset.sk] = val;
      this._page = 1;
      this._render();
      const pc = sr.getElementById('panelCount');
      if (pc) { const n = this._filter(this._res()).length; pc.textContent = `${n} listing${n!==1?'s':''} match`; }
    }
  }

  _onPanelChange(e) {
    const el = e.target;
    const type = el.dataset.type;
    if (!type) return;

    if (type === 'ck') {
      const key = el.dataset.sk, val = el.dataset.val;
      if (el.checked) { if (!this._s[key].includes(val)) this._s[key].push(val); }
      else            { this._s[key] = this._s[key].filter(x => x !== val); }
      this._page=1; this._render(); this._updateBadge();
      this._updateChips();
    }

    if (type === 'toggle') {
      this._s[el.dataset.sk] = el.checked;
      this._page=1; this._render(); this._updateBadge();
    }
  }

  // ── Update slider fill bars to match current DOM values ───────────────────
  _updateFills() {
    const sr = this.shadowRoot;
    const dual = (loId, hiId, fillId, minB, maxB) => {
      const lo=sr.getElementById(loId), hi=sr.getElementById(hiId), fill=sr.getElementById(fillId);
      if (!lo||!hi||!fill) return;
      const r = maxB-minB||1;
      fill.style.left  = ((parseFloat(lo.value)-minB)/r*100)+'%';
      fill.style.width = ((parseFloat(hi.value)-parseFloat(lo.value))/r*100)+'%';
    };
    const single = (id, fillId, minB, maxB) => {
      const el=sr.getElementById(id), fill=sr.getElementById(fillId);
      if (!el||!fill) return;
      const r=maxB-minB||1;
      fill.style.left='0%'; fill.style.width=((parseFloat(el.value)-minB)/r*100)+'%';
    };
    dual('rPrLo','rPrHi','fPr', this._b.priceMin, this._b.priceMax);
    dual('rYrLo','rYrHi','fYr', this._b.yearMin,  this._b.yearMax);
    single('rMi','fMi', 0, this._b.mileMax);
  }

  // ── Visibility rules from style-props ─────────────────────────────────────
  _applyVis() {
    const sr = this.shadowRoot;
    const MAP = {
      vehicleType: 'qrowVT', listingType: 'qrowLT', status: 'qrowST',
      priceRange: 'secPr', yearRange: 'secYr', mileageRange: 'secMi',
      make: 'secMk', bodyStyle: 'secBS', fuelType: 'secFT',
      transmission: 'secTR', drivetrain: 'secDR', exteriorColor: 'secCL',
      featured: 'secFeat',
    };
    Object.entries(MAP).forEach(([key, id]) => {
      const el = sr.getElementById(id); if (!el) return;
      el.style.display = this._vis.has(key) ? '' : 'none';
    });
  }

  // ── Badge count (advanced filters active) ─────────────────────────────────
  _updateBadge() {
    const s = this._s;
    const n = s.makes.length + s.bodyStyles.length + s.fuelTypes.length +
              s.transmissions.length + s.drivetrains.length + s.colors.length +
              (s.featured ? 1 : 0) +
              (s.priceMin !== null ? 1 : 0) + (s.priceMax !== null ? 1 : 0) +
              (s.yearMin  !== null ? 1 : 0) + (s.yearMax  !== null ? 1 : 0) +
              (s.mileMax  !== null ? 1 : 0);
    const b = this.shadowRoot.getElementById('badge');
    if (b) { b.style.display = n>0 ? 'flex' : 'none'; b.textContent = n; }
  }

  // ── Active filter chips ────────────────────────────────────────────────────
  _updateChips() {
    const s = this._s;
    const chips = [];
    const ckKeys = [
      ['makes','Make'],['bodyStyles','Body'],['fuelTypes','Fuel'],
      ['transmissions','Trans'],['drivetrains','Drive'],['colors','Color'],
    ];
    ckKeys.forEach(([key, label]) => {
      (s[key]||[]).forEach(v => chips.push({ key, val:v, label:`${label}: ${v}` }));
    });
    const el = this.shadowRoot.getElementById('chips');
    if (!el) return;
    el.innerHTML = chips.map(c =>
      `<button class="chip" data-key="${c.key}" data-val="${this._esc(c.val)}">${c.label} <span class="chip-x">×</span></button>`
    ).join('');
  }

  _removeChip(key, val) {
    this._s[key] = (this._s[key]||[]).filter(v => v !== val);
    // Uncheck the corresponding checkbox in the panel
    const cb = this.shadowRoot.querySelector(`input[data-sk="${key}"][data-val="${val}"]`);
    if (cb) cb.checked = false;
    this._page=1; this._render(); this._updateBadge(); this._updateChips();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // _render — THE single entry point for displaying results.
  // Calls _filter() on the full dataset, paginates, renders grid + pagination.
  // ─────────────────────────────────────────────────────────────────────────
  _render() {
    const r        = this._res();
    const filtered = this._filter(r);
    const total    = filtered.length;
    const pages    = Math.max(1, Math.ceil(total / this._perPage));
    if (this._page > pages) this._page = pages;

    const skip  = (this._page - 1) * this._perPage;
    const slice = filtered.slice(skip, skip + this._perPage);

    const sr   = this.shadowRoot;
    const grid = sr.getElementById('grid');
    const meta = sr.getElementById('meta');

    meta.textContent = total > 0
      ? `Showing ${total} listing${total!==1?'s':''}` +
        (total !== this._all.length ? ` (filtered from ${this._all.length} total)` : '')
      : '';

    if (!total) {
      grid.innerHTML = `<div class="state-box">${I.empty}<h3>No listings found</h3><p>Try adjusting your filters or clearing your search.</p></div>`;
      this._renderPag(pages);
      this._updateChips();
      this._updateBadge();
      return;
    }

    grid.innerHTML = slice.map((v, i) => this._cardHTML(v, i)).join('');

    // View buttons
    grid.querySelectorAll('.view-btn').forEach(btn =>
      btn.addEventListener('click', () => this._nav(btn.dataset.slug))
    );

    // Compare checkboxes
    grid.querySelectorAll('.cmp-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = cb.dataset.id;
        if (cb.checked) {
          if (this._cmpIds.length >= 4) { cb.checked=false; return; }
          if (!this._cmpIds.includes(id)) this._cmpIds.push(id);
          cb.closest('.card')?.classList.add('sel');
        } else {
          this._cmpIds = this._cmpIds.filter(x => x !== id);
          cb.closest('.card')?.classList.remove('sel');
        }
        this._updateCmpBar();
      });
    });

    this._renderPag(pages);
    this._updateChips();
    this._updateBadge();
  }

  // ── Pure filter + sort — operates on full _all array ──────────────────────
  _filter(r) {
    let list = [...this._all];

    // Full-text search across multiple fields
    if (r.q) {
      const q = r.q;
      list = list.filter(v =>
        [v.title, v.make, v.model, v.trim, v.year, v.vin, v.stockNumber,
         v.bodyStyle, v.exteriorColor, v.fuelType, v.transmission, v.drivetrain, v.description]
          .join(' ').toLowerCase().includes(q)
      );
    }

    if (r.vehicleType !== 'all') list = list.filter(v => v.vehicleType === r.vehicleType);
    if (r.listingType !== 'all') list = list.filter(v => v.listingType === r.listingType);
    if (r.status      !== 'all') list = list.filter(v => v.status      === r.status);

    // Price — listings with no price always pass through
    list = list.filter(v => {
      const p = Number(v.salePrice || v.price) || 0;
      return !p || (p >= r.priceMin && p <= r.priceMax);
    });

    // Year — missing year always passes
    list = list.filter(v => !v.year || (Number(v.year) >= r.yearMin && Number(v.year) <= r.yearMax));

    // Mileage — missing mileage always passes
    list = list.filter(v => !v.mileage || Number(v.mileage) <= r.mileMax);

    // Checkbox filters
    if (r.makes.length)         list = list.filter(v => r.makes.includes(v.make));
    if (r.bodyStyles.length)    list = list.filter(v => r.bodyStyles.includes(v.bodyStyle));
    if (r.fuelTypes.length)     list = list.filter(v => r.fuelTypes.includes(v.fuelType));
    if (r.transmissions.length) list = list.filter(v => r.transmissions.includes(v.transmission));
    if (r.drivetrains.length)   list = list.filter(v => r.drivetrains.includes(v.drivetrain));
    if (r.colors.length)        list = list.filter(v => r.colors.includes(v.exteriorColor));
    if (r.featured)             list = list.filter(v => v.featured);

    // Sort
    list.sort((a, bb) => {
      switch (r.sort) {
        case 'price-asc':   return (Number(a.salePrice||a.price)||0) - (Number(bb.salePrice||bb.price)||0);
        case 'price-desc':  return (Number(bb.salePrice||bb.price)||0) - (Number(a.salePrice||a.price)||0);
        case 'year-desc':   return (Number(bb.year)||0) - (Number(a.year)||0);
        case 'year-asc':    return (Number(a.year)||0) - (Number(bb.year)||0);
        case 'mileage-asc': return (Number(a.mileage)||0) - (Number(bb.mileage)||0);
        case 'oldest':      return new Date(a._createdDate) - new Date(bb._createdDate);
        default:            return new Date(bb._createdDate) - new Date(a._createdDate);
      }
    });

    return list;
  }

  // ── Card HTML ─────────────────────────────────────────────────────────────
  _cardHTML(v, idx) {
    const title  = v.title || `${v.year||''} ${v.make||''} ${v.model||''}`.trim() || 'Vehicle';
    const imgUrl = this._imgUrl(v.primaryImage, 680, 440);
    const isCmp  = this._cmpIds.includes(v._id);
    const eager  = idx < 6;

    const lBdg = (() => {
      const m={new:['new','New'],used:['used','Used'],rent:['rent','Rent/Lease'],auction:['auction','Auction']};
      const[c,l]=m[v.listingType]||['used',v.listingType||'Used'];
      return `<span class="bdg bdg-${c}">${l}</span>`;
    })();
    const sBdg = (v.status==='sold'||v.status==='rented') ? `<span class="bdg bdg-${v.status}">${v.status}</span>` : '';
    const fBdg = v.featured ? `<span class="bdg bdg-feat"><span class="ic" style="font-size:9px">${I.star}</span>Featured</span>` : '';

    const imgEl = imgUrl
      ? `<img class="card-img" src="${imgUrl}" alt="${this._esc(title)}" loading="${eager?'eager':'lazy'}" decoding="${eager?'sync':'async'}" onerror="this.style.display='none'"/>`
      : `<div class="card-img-ph ic" style="font-size:52px">${I.car}</div>`;

    const price = (() => {
      const sym = {INR:'₹',EUR:'€',GBP:'£'}[v.currency]||'$';
      const fmt = n => sym + Number(n).toLocaleString();
      if (v.listingType==='rent'    && v.rentalPricePerDay)   return `<span class="price">${fmt(v.rentalPricePerDay)}<small style="font-weight:400;font-size:.7em">/day</small></span>`;
      if (v.listingType==='auction' && v.auctionStartPrice)   return `<span class="price">From ${fmt(v.auctionStartPrice)}</span><span class="price-note">Auction</span>`;
      if (v.salePrice && v.salePrice < v.price)               return `<span class="price">${fmt(v.salePrice)}</span><span class="price-orig">${fmt(v.price)}</span>`;
      if (v.price)                                             return `<span class="price">${fmt(v.price)}</span>`;
      return `<span class="price-note">Price on request</span>`;
    })();

    return `
<article class="card${isCmp?' sel':''}" data-id="${v._id}">
  <div class="card-img-wrap">
    ${imgEl}
    <div class="bdgs">${lBdg}${sBdg}${fBdg}</div>
    ${v.compareEnabled !== false ? `<div class="cmp-wrap"><input type="checkbox" class="cmp-cb" data-id="${v._id}" ${isCmp?'checked':''} title="Add to compare"/></div>` : ''}
  </div>
  <div class="card-body">
    <div class="card-title">${this._esc(title)}</div>
    <div class="card-sub">${[v.bodyStyle,v.drivetrain,v.engine].filter(Boolean).join(' · ')}</div>
    <div class="card-specs">
      ${v.mileage      ? `<span class="spec"><span class="ic">${I.gauge}</span>${Number(v.mileage).toLocaleString()} mi</span>`:''}
      ${v.fuelType     ? `<span class="spec"><span class="ic">${I.fuel}</span>${v.fuelType}</span>`:''}
      ${v.transmission ? `<span class="spec"><span class="ic">${I.gear}</span>${v.transmission}</span>`:''}
      ${v.exteriorColor? `<span class="spec"><span class="ic">${I.color}</span>${v.exteriorColor}</span>`:''}
    </div>
    <div class="price-row">${price}</div>
  </div>
  <div class="card-foot">
    <button class="btn btn-accent view-btn" data-slug="${v.slug}">
      View Details <span class="ic" style="font-size:14px">${I.arrow}</span>
    </button>
  </div>
</article>`;
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  _renderPag(pages) {
    const pag = this.shadowRoot.getElementById('pag');
    if (pages <= 1) { pag.innerHTML=''; return; }

    const cur = this._page, maxV=5;
    let s = Math.max(1, cur-2), e = Math.min(pages, s+maxV-1);
    if (e-s < maxV-1) s = Math.max(1, e-maxV+1);

    let h = `<button class="pbn" data-p="${cur-1}" ${cur===1?'disabled':''}>${I.chevL}</button>`;
    if (s>1) { h+=`<button class="pbn" data-p="1">1</button>`; if(s>2) h+=`<span class="pdot">…</span>`; }
    for (let i=s; i<=e; i++) h+=`<button class="pbn ${i===cur?'on':''}" data-p="${i}">${i}</button>`;
    if (e<pages) { if(e<pages-1) h+=`<span class="pdot">…</span>`; h+=`<button class="pbn" data-p="${pages}">${pages}</button>`; }
    h += `<button class="pbn" data-p="${cur+1}" ${cur===pages?'disabled':''}>${I.chevR}</button>`;
    pag.innerHTML = h;

    // Delegated listener with { once:true } — auto-removed after one click, re-added on next render
    pag.addEventListener('click', e => {
      const btn = e.target.closest('.pbn'); if (!btn||btn.hasAttribute('disabled')) return;
      const p = parseInt(btn.dataset.p); if (isNaN(p)||p<1||p>pages) return;
      this._page=p; this._render();
      this.shadowRoot.getElementById('grid')?.scrollIntoView({behavior:'smooth',block:'start'});
    }, { once:true });
  }

  // ── Compare modal ─────────────────────────────────────────────────────────
  _showCmpModal() {
    const vs = this._all.filter(v => this._cmpIds.includes(v._id));
    if (vs.length < 2) return;
    const fields = [
      ['Year',v=>v.year||'—'], ['Make',v=>v.make||'—'], ['Model',v=>v.model||'—'],
      ['Trim',v=>v.trim||'—'], ['Body Style',v=>v.bodyStyle||'—'],
      ['Mileage',v=>v.mileage?Number(v.mileage).toLocaleString()+' mi':'—'],
      ['Engine',v=>v.engine||'—'], ['Transmission',v=>v.transmission||'—'],
      ['Drivetrain',v=>v.drivetrain||'—'], ['Fuel',v=>v.fuelType||'—'],
      ['MPG City',v=>v.mpgCity?v.mpgCity+' mpg':'—'],
      ['MPG Hwy', v=>v.mpgHighway?v.mpgHighway+' mpg':'—'],
      ['Ext Color',v=>v.exteriorColor||'—'], ['Int Color',v=>v.interiorColor||'—'],
      ['Seating',v=>v.seatingCapacity?v.seatingCapacity+' seats':'—'],
      ['Price',v=>(v.salePrice||v.price)?'$'+Number(v.salePrice||v.price).toLocaleString():'—'],
      ['VIN',v=>v.vin||'—'], ['Stock #',v=>v.stockNumber||'—'],
      ['Condition',v=>v.condition||'—'], ['Warranty',v=>v.warrantyType||'—'],
    ];
    const heads = vs.map(v => {
      const img = this._imgUrl(v.primaryImage,400,240);
      const t   = v.title || `${v.year} ${v.make} ${v.model}`;
      return `<th>${img?`<img class="cmp-img" src="${img}" alt="${this._esc(t)}" loading="lazy"/>`:''}<div class="cmp-name">${this._esc(t)}</div></th>`;
    }).join('');
    const rows = fields.map(([l,fn]) =>
      `<tr><td>${l}</td>${vs.map(v=>`<td>${this._esc(String(fn(v)))}</td>`).join('')}</tr>`
    ).join('');
    this.shadowRoot.getElementById('cmpBody').innerHTML =
      `<table class="cmp-tbl"><thead><tr><th>Spec</th>${heads}</tr></thead><tbody>${rows}</tbody></table>`;
    this.shadowRoot.getElementById('cmpModal').style.display='flex';
  }

  _updateCmpBar() {
    const bar = this.shadowRoot.getElementById('cmpbar');
    const cnt = this.shadowRoot.getElementById('cmpCount');
    if (cnt) cnt.textContent = this._cmpIds.length;
    if (bar) bar.style.display = this._cmpIds.length>=2 ? 'flex' : 'none';
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  _nav(slug) {
    this.dispatchEvent(new CustomEvent('navigate-to-listing',{detail:{slug},bubbles:true,composed:true}));
  }

  _imgUrl(raw, w=400, h=240) {
    if (!raw || typeof raw !== 'string') return '';
    if (raw.startsWith('https://static.wixstatic.com/media/')) {
      try { const fn=raw.split('/media/')[1]?.split('/')[0]; if(!fn)return raw;
        return `https://static.wixstatic.com/media/${fn}/v1/fill/w_${w},h_${h},al_c,q_80,enc_avif,quality_auto/${fn}`; }
      catch(e) { return raw; }
    }
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    if (raw.startsWith('wix:image://')) {
      try { const fid=raw.split('/')[3]?.split('#')[0]; if(!fid)return '';
        let fn=fid.includes('~mv2')?fid:`${fid}~mv2.jpg`; if(!fn.includes('.'))fn+='.jpg';
        return `https://static.wixstatic.com/media/${fn}/v1/fill/w_${w},h_${h},al_c,q_80,enc_avif,quality_auto/${fn}`; }
      catch(e) { return ''; }
    }
    return '';
  }

  _esc(t) {
    if (t===null||t===undefined) return '';
    const d = (this.shadowRoot.ownerDocument||document).createElement('div');
    d.textContent = String(t); return d.innerHTML;
  }
}

customElements.define('vehicle-list-viewer', VehicleListViewer);
