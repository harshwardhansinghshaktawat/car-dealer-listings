/**
 * CUSTOM ELEMENT — Vehicle Listing List Page
 * Tag: <vehicle-list-viewer>
 *
 * Attributes (set by widget):
 *   listing-list  — JSON { listings[], postsPerPage }
 *                   ALL listings sent. This element owns filtering + pagination.
 *   style-props   — JSON style tokens
 *
 * Events dispatched:
 *   navigate-to-listing — { slug }
 */

const IC = {
  search:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  sliders:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
  close:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  chevL:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevR:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  car:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  gauge:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="m12 12-4-4"/><circle cx="12" cy="12" r="2"/></svg>`,
  fuel:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V8l6-6h6l2 2v4h2a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  gear:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  palette:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125C12.888 18.78 12.74 18.416 12.74 17.943A1.64 1.64 0 0 1 14.408 16.274h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
  star:      `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  arrowR:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  compare:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>`,
  reset:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  noResults: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
};

const ALL_FILTER_KEYS = [
  'vehicleType','listingType','status',
  'priceRange','yearRange','mileageRange',
  'make','bodyStyle','fuelType','transmission','drivetrain','exteriorColor','featured',
];

// ─────────────────────────────────────────────────────────────────────────────
// FILTER STATE — plain object, always read fresh. Reset = reassign new object.
// No scattered instance variables for filter values. This eliminates ALL
// stale-closure and double-registration bugs.
// ─────────────────────────────────────────────────────────────────────────────
function freshState() {
  return {
    search:'', vehicleType:'all', listingType:'all', status:'all', sortBy:'newest',
    // null means "not set by user" — resolved against bounds at filter time
    priceMin:null, priceMax:null, yearMin:null, yearMax:null, mileageMax:null,
    // always fresh arrays — never passed by reference to DOM listeners
    makes:[], bodyStyles:[], fuelTypes:[], transmissions:[], drivetrains:[], colors:[],
    featured:false,
  };
}

class VehicleListViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode:'open' });
    this._all        = [];   // full unsliced dataset
    this._perPage    = 9;
    this._page       = 1;
    this._compareIds = [];
    this._advOpen    = false;
    this._vis        = new Set(ALL_FILTER_KEYS);
    // Bounds computed from data — never from user input
    this._b = { priceMin:0, priceMax:500000, yearMin:1990, yearMax:2030, mileageMax:300000 };
    // THE single filter state
    this._s = freshState();
    this.styleProps = this._tryParseStyles(this.getAttribute('style-props'));
    this._boot();
  }

  static get observedAttributes() { return ['listing-list','style-props']; }

  attributeChangedCallback(name, _, newVal) {
    if (!newVal) return;
    if (name === 'listing-list') {
      try {
        const d = JSON.parse(newVal);
        this._all     = d.listings || [];
        this._perPage = Number(d.postsPerPage) || 9;
        this._computeBounds();
        this._page = 1;
        requestAnimationFrame(() => { this._buildPanel(); this._run(); });
      } catch(e) { console.error('vlv listing-list:', e); }
    } else {
      try {
        const inc = JSON.parse(newVal);
        this.styleProps = { ...this.styleProps, ...inc };
        const vf = inc.visibleFilters;
        this._vis = (!vf || vf === 'all') ? new Set(ALL_FILTER_KEYS)
          : new Set(vf.split(',').map(s => s.trim()));
        if (this._ready) { this._refreshCSS(); this._applyVisibility(); }
      } catch(e) { console.error('vlv style-props:', e); }
    }
  }

  // ── Defaults ──────────────────────────────────────────────────────────────
  _defaults() {
    return {
      fontFamily:'system-ui,sans-serif', fontSize:14,
      bgColor:'#0f1117', accentColor:'#f97316', accentHover:'#ea580c',
      cardBg:'#1a1d27', cardBorder:'#2a2d3a',
      cardShadow:'rgba(0,0,0,0.4)', cardHoverShadow:'rgba(249,115,22,0.2)',
      cardTitleColor:'#ffffff', cardBodyColor:'#94a3b8', cardMetaColor:'#64748b',
      pricePrimaryColor:'#f97316', priceSecondaryColor:'#94a3b8',
      badgeNewBg:'#166534', badgeNewText:'#bbf7d0',
      badgeUsedBg:'#1e3a5f', badgeUsedText:'#93c5fd',
      badgeRentBg:'#4c1d95', badgeRentText:'#ddd6fe',
      badgeAuctionBg:'#7c2d12', badgeAuctionText:'#fed7aa',
      badgeFeaturedBg:'#f97316', badgeFeaturedText:'#ffffff',
      filterBg:'#1a1d27', filterBorder:'#2a2d3a',
      filterText:'#94a3b8', filterActiveBg:'#f97316', filterActiveText:'#ffffff',
      btnBg:'#f97316', btnText:'#ffffff',
      btnBorderColor:'#f97316', btnBorderText:'#f97316',
      paginationBorder:'#2a2d3a', paginationText:'#94a3b8',
      paginationActiveBg:'#f97316', paginationActiveText:'#ffffff', paginationHoverBg:'#1e2133',
      searchBg:'#1a1d27', searchBorder:'#2a2d3a',
      searchText:'#ffffff', searchPlaceholder:'#64748b',
      compareBg:'#1a1d27', compareBorder:'#f97316', compareText:'#ffffff',
      advFilterBg:'#141720', advFilterBorder:'#2a2d3a',
      sliderAccent:'#f97316', rangeValueColor:'#f97316',
      checkboxAccent:'#f97316', iconColor:'#64748b', emptyColor:'#64748b',
      visibleFilters:'all',
    };
  }

  _tryParseStyles(raw) {
    try { return { ...this._defaults(), ...JSON.parse(raw) }; }
    catch(e) { return this._defaults(); }
  }

  // ── Compute bounds from full dataset ──────────────────────────────────────
  _computeBounds() {
    const prices = this._all.map(v => Number(v.salePrice||v.price)||0).filter(n=>n>0);
    const years  = this._all.map(v => Number(v.year)||0).filter(n=>n>0);
    const miles  = this._all.map(v => Number(v.mileage)||0).filter(n=>n>0);
    this._b = {
      priceMin:  prices.length ? Math.floor(Math.min(...prices)/1000)*1000 : 0,
      priceMax:  prices.length ? Math.ceil( Math.max(...prices)/1000)*1000 : 500000,
      yearMin:   years.length  ? Math.min(...years)  : 1990,
      yearMax:   years.length  ? Math.max(...years)  : new Date().getFullYear()+1,
      mileageMax:miles.length  ? Math.ceil( Math.max(...miles)/5000)*5000  : 300000,
    };
  }

  // Resolve null values → full bound (means "no restriction")
  _resolved() {
    const { _s:s, _b:b } = this;
    return {
      ...s,
      priceMin:   s.priceMin   !== null ? s.priceMin   : b.priceMin,
      priceMax:   s.priceMax   !== null ? s.priceMax   : b.priceMax,
      yearMin:    s.yearMin    !== null ? s.yearMin    : b.yearMin,
      yearMax:    s.yearMax    !== null ? s.yearMax    : b.yearMax,
      mileageMax: s.mileageMax !== null ? s.mileageMax : b.mileageMax,
    };
  }

  // ── Boot — runs once ──────────────────────────────────────────────────────
  _boot() {
    this.shadowRoot.innerHTML = `<style id="vlvCSS">${this._buildCSS()}</style>${this._buildShell()}`;
    this._ready = true;
    this._wireStatic();
  }

  _refreshCSS() {
    const s = this.shadowRoot.getElementById('vlvCSS');
    if (s) s.textContent = this._buildCSS();
  }

  // ── Shell (static skeleton — never rebuilt) ───────────────────────────────
  _buildShell() { return `
<div class="wrap">
  <div class="toolbar">
    <div class="sw"><span class="ic si">${IC.search}</span><input class="search" id="srch" type="text" placeholder="Search make, model, year, VIN…"/></div>
    <div class="sortw"><select class="sel" id="srt">
      <option value="newest">Newest First</option><option value="oldest">Oldest First</option>
      <option value="price-asc">Price: Low → High</option><option value="price-desc">Price: High → Low</option>
      <option value="year-desc">Year: Newest</option><option value="year-asc">Year: Oldest</option>
      <option value="mileage-asc">Lowest Mileage</option>
    </select></div>
    <button class="atog" id="atog"><span class="ic">${IC.sliders}</span><span>Filters</span><span class="abadge" id="abadge" style="display:none">0</span></button>
  </div>
  <div class="quick" id="quick">
    <div class="frow" id="rowVT"><span class="flbl">Type</span><div class="pills" id="pvt">
      <button class="pill active" data-g="vehicleType" data-v="all">All</button>
      <button class="pill" data-g="vehicleType" data-v="car">Cars</button>
      <button class="pill" data-g="vehicleType" data-v="motorcycle">Motorcycles</button>
      <button class="pill" data-g="vehicleType" data-v="rv">RVs</button>
      <button class="pill" data-g="vehicleType" data-v="truck">Trucks</button>
      <button class="pill" data-g="vehicleType" data-v="van">Vans</button>
      <button class="pill" data-g="vehicleType" data-v="boat">Boats</button>
    </div></div>
    <div class="frow" id="rowLT"><span class="flbl">Listing</span><div class="pills" id="plt">
      <button class="pill active" data-g="listingType" data-v="all">All</button>
      <button class="pill" data-g="listingType" data-v="new">New</button>
      <button class="pill" data-g="listingType" data-v="used">Used</button>
      <button class="pill" data-g="listingType" data-v="rent">Rent/Lease</button>
      <button class="pill" data-g="listingType" data-v="auction">Auction</button>
    </div></div>
    <div class="frow" id="rowST"><span class="flbl">Status</span><div class="pills" id="pst">
      <button class="pill active" data-g="status" data-v="all">All</button>
      <button class="pill" data-g="status" data-v="active">Active</button>
      <button class="pill" data-g="status" data-v="sold">Sold</button>
      <button class="pill" data-g="status" data-v="rented">Rented</button>
    </div></div>
  </div>
  <div class="adv" id="adv"></div>
  <div class="cbar" id="cbar" style="display:none">
    <span class="ic" style="font-size:18px;color:var(--acc)">${IC.compare}</span>
    <span class="clbl">Compare: <strong id="ccnt">0</strong> selected</span>
    <button class="btn ba bsm" id="cbtn">Compare Now</button>
    <button class="btn bg bsm" id="cclr"><span class="ic">${IC.close}</span>Clear</button>
  </div>
  <div class="meta" id="meta"></div>
  <div class="grid" id="grid"><div class="loading"><div class="spin"></div><p>Loading…</p></div></div>
  <div class="mov" id="mov" style="display:none">
    <div class="modal"><div class="mhead"><h2>Vehicle Comparison</h2><button class="mclose" id="mclose"><span class="ic">${IC.close}</span></button></div><div class="mbody" id="mtbl"></div></div>
  </div>
  <div class="pag" id="pag"></div>
</div>`; }

  // ── CSS ───────────────────────────────────────────────────────────────────
  _buildCSS() {
    const s=this.styleProps, fs=Number(s.fontSize)||14, f2=Math.max(11,fs-2), f3=Math.max(10,fs-3);
    return `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:host{display:block;width:100%;font-family:${s.fontFamily};font-size:${fs}px;--acc:${s.accentColor}}
.wrap{background:${s.bgColor};padding:28px 18px;min-height:500px}
.ic{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1}.ic svg{width:1em;height:1em}
.toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px}
.sw{flex:1;min-width:200px;position:relative}
.si{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:${s.iconColor};font-size:16px;pointer-events:none}
.search{width:100%;padding:10px 12px 10px 38px;background:${s.searchBg};border:1px solid ${s.searchBorder};border-radius:9px;color:${s.searchText};font-size:${fs}px;font-family:inherit;outline:none;transition:border-color .2s}
.search::placeholder{color:${s.searchPlaceholder}}.search:focus{border-color:${s.accentColor}}
.sortw{min-width:160px}
.sel{width:100%;padding:10px 12px;background:${s.searchBg};border:1px solid ${s.searchBorder};border-radius:9px;color:${s.searchText};font-size:${fs}px;font-family:inherit;cursor:pointer;appearance:none;outline:none}
.sel:focus{border-color:${s.accentColor}}
.atog{display:inline-flex;align-items:center;gap:6px;padding:10px 14px;border-radius:9px;font-size:${fs}px;font-weight:600;border:1px solid ${s.filterBorder};background:${s.filterBg};color:${s.filterText};cursor:pointer;transition:all .2s;font-family:inherit;position:relative}
.atog:hover,.atog.open{border-color:${s.accentColor};color:${s.accentColor}}
.abadge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;border-radius:9px;padding:0 4px;background:${s.accentColor};color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center}
.quick{display:flex;flex-direction:column;gap:7px;margin-bottom:10px}
.frow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.flbl{font-size:${f3}px;color:${s.cardMetaColor};font-weight:700;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;min-width:44px}
.pills{display:flex;gap:5px;flex-wrap:wrap}
.pill{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:18px;font-size:${f2}px;font-weight:500;border:1px solid ${s.filterBorder};background:${s.filterBg};color:${s.filterText};cursor:pointer;transition:all .2s;font-family:inherit}
.pill:hover{border-color:${s.accentColor};color:${s.accentColor}}
.pill.active{background:${s.filterActiveBg};color:${s.filterActiveText};border-color:${s.filterActiveBg}}
.adv{display:none;flex-wrap:wrap;background:${s.advFilterBg};border:1px solid ${s.advFilterBorder};border-radius:12px;margin-bottom:14px;overflow:hidden;animation:fi .2s ease}
.adv.open{display:flex}
@keyframes fi{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
.asec{flex:1 1 190px;min-width:170px;padding:14px;border-right:1px solid ${s.advFilterBorder};border-bottom:1px solid ${s.advFilterBorder}}
.afull{flex:1 1 100%;border-right:none}
.attl{font-size:${f3}px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;color:${s.cardMetaColor};margin-bottom:10px}
/* range */
.rlbls{display:flex;justify-content:space-between;font-size:${f2}px;color:${s.rangeValueColor};font-weight:600;margin-bottom:8px}
.rtwrap{position:relative;height:22px;display:flex;align-items:center}
.rtrack{position:absolute;left:0;right:0;height:4px;background:${s.advFilterBorder};border-radius:2px;pointer-events:none}
.rfill{position:absolute;height:4px;background:${s.sliderAccent};border-radius:2px;pointer-events:none}
.ri{position:absolute;left:0;right:0;width:100%;height:4px;appearance:none;-webkit-appearance:none;background:transparent;pointer-events:none;outline:none}
.ri::-webkit-slider-thumb{appearance:none;-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${s.sliderAccent};border:2px solid ${s.advFilterBg};box-shadow:0 0 0 2px ${s.sliderAccent};cursor:pointer;pointer-events:all;transition:transform .15s}
.ri::-webkit-slider-thumb:hover{transform:scale(1.2)}
.ri::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:${s.sliderAccent};border:2px solid ${s.advFilterBg};cursor:pointer;pointer-events:all}
.rhi{z-index:2}
/* checkboxes */
.cklist{display:flex;flex-direction:column;gap:5px;max-height:160px;overflow-y:auto;padding-right:4px}
.cklist::-webkit-scrollbar{width:3px}.cklist::-webkit-scrollbar-thumb{background:${s.advFilterBorder};border-radius:2px}
.ckrow{display:flex;align-items:center;gap:7px;cursor:pointer;padding:2px 0}
.ckrow input[type=checkbox]{accent-color:${s.checkboxAccent};width:14px;height:14px;cursor:pointer;flex-shrink:0}
.ckrow span{font-size:${f2}px;color:${s.filterText};line-height:1.3}
.ckrow:hover span{color:${s.accentColor}}
/* toggle */
.togrow{display:flex;align-items:center;gap:10px;cursor:pointer}
.togcb{display:none}
.togtrack{width:38px;height:20px;border-radius:10px;background:${s.advFilterBorder};position:relative;flex-shrink:0;transition:background .2s}
.togtrack::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:${s.filterText};transition:transform .2s}
.togcb:checked+.togtrack{background:${s.checkboxAccent}}
.togcb:checked+.togtrack::after{transform:translateX(18px);background:#fff}
.toglbl{font-size:${fs}px;color:${s.filterText};user-select:none}
.afooter{flex:1 1 100%;padding:12px 14px;border-top:1px solid ${s.advFilterBorder};display:flex;justify-content:flex-end}
/* buttons */
.btn{display:inline-flex;align-items:center;gap:5px;padding:9px 16px;border-radius:8px;font-size:${fs}px;font-weight:600;cursor:pointer;border:none;transition:all .2s;font-family:inherit}
.bsm{padding:7px 12px;font-size:${f2}px}
.ba{background:${s.btnBg};color:${s.btnText}}.ba:hover{background:${s.accentHover}}
.bg{background:transparent;color:${s.btnBorderText};border:1px solid ${s.btnBorderColor}}.bg:hover{background:${s.btnBorderColor};color:${s.btnText}}
/* compare bar */
.cbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:${s.compareBg};border:2px solid ${s.compareBorder};border-radius:10px;padding:10px 16px;margin-bottom:14px}
.clbl{color:${s.compareText};font-size:${fs}px;flex:1}
.meta{font-size:${f2}px;color:${s.cardMetaColor};margin-bottom:14px}
/* grid */
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:20px;margin-bottom:36px}
.card{background:${s.cardBg};border:1px solid ${s.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 4px 12px ${s.cardShadow};transition:transform .3s,box-shadow .3s,border-color .3s;display:flex;flex-direction:column;position:relative}
.card:hover{transform:translateY(-4px);box-shadow:0 10px 24px ${s.cardHoverShadow};border-color:${s.accentColor}}
.card.sel{border-color:${s.accentColor};box-shadow:0 0 0 2px ${s.accentColor}}
.iw{width:100%;height:200px;overflow:hidden;background:${s.cardBorder};position:relative}
.ci{width:100%;height:100%;object-fit:cover;transition:transform .3s;display:block}
.card:hover .ci{transform:scale(1.05)}
.iph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:${s.cardMetaColor}}
.bdgs{position:absolute;top:9px;left:9px;display:flex;gap:4px;flex-wrap:wrap}
.bdg{padding:3px 8px;border-radius:9px;font-size:${f3}px;font-weight:700;text-transform:uppercase;letter-spacing:.3px}
.bdg-new{background:${s.badgeNewBg};color:${s.badgeNewText}}
.bdg-used{background:${s.badgeUsedBg};color:${s.badgeUsedText}}
.bdg-rent{background:${s.badgeRentBg};color:${s.badgeRentText}}
.bdg-auction{background:${s.badgeAuctionBg};color:${s.badgeAuctionText}}
.bdg-feat{background:${s.badgeFeaturedBg};color:${s.badgeFeaturedText};display:inline-flex;align-items:center;gap:3px}
.bdg-sold,.bdg-rented{background:#374151;color:#9ca3af}
.ccbw{position:absolute;top:9px;right:9px}
.ccb{width:18px;height:18px;cursor:pointer;accent-color:${s.accentColor}}
.cbody{padding:16px;flex:1;display:flex;flex-direction:column;gap:8px}
.ctitle{font-size:${fs+3}px;font-weight:700;color:${s.cardTitleColor};line-height:1.3}
.csub{font-size:${f2}px;color:${s.cardMetaColor}}
.specs{display:flex;gap:10px;flex-wrap:wrap}
.spec{display:inline-flex;align-items:center;gap:3px;font-size:${f2}px;color:${s.cardBodyColor}}
.spec .ic{color:${s.iconColor};font-size:13px}
.prow{display:flex;align-items:baseline;gap:7px;margin-top:2px}
.price{font-size:${fs+7}px;font-weight:800;color:${s.pricePrimaryColor}}
.porig{font-size:${fs}px;color:${s.priceSecondaryColor};text-decoration:line-through}
.pnote{font-size:${f2}px;color:${s.cardMetaColor}}
.cfoot{padding:11px 16px;border-top:1px solid ${s.cardBorder};display:flex;gap:7px}
.cfoot .btn{flex:1;justify-content:center;font-size:${f2}px;padding:8px}
.empty{grid-column:1/-1;text-align:center;padding:70px 20px;color:${s.emptyColor}}
.empty svg{width:52px;height:52px;margin-bottom:14px;opacity:.4}
.empty h3{font-size:${fs+5}px;margin-bottom:7px;color:${s.cardBodyColor}}
.loading{grid-column:1/-1;text-align:center;padding:70px 20px;color:${s.cardMetaColor}}
.spin{width:42px;height:42px;border:4px solid ${s.cardBorder};border-top-color:${s.accentColor};border-radius:50%;animation:sp .8s linear infinite;margin:0 auto 14px}
@keyframes sp{to{transform:rotate(360deg)}}
/* modal */
.mov{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:36px 14px;overflow-y:auto}
.modal{background:${s.cardBg};border:1px solid ${s.cardBorder};border-radius:14px;width:100%;max-width:1080px;overflow:hidden}
.mhead{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid ${s.cardBorder}}
.mhead h2{color:${s.cardTitleColor};font-size:${fs+4}px}
.mclose{background:none;border:none;color:${s.cardMetaColor};cursor:pointer;padding:4px;border-radius:5px;display:flex;align-items:center}
.mclose:hover{color:${s.accentColor}}
.mbody{padding:20px;overflow-x:auto}
.cmpt{width:100%;border-collapse:collapse}
.cmpt th,.cmpt td{padding:9px 13px;text-align:left;border-bottom:1px solid ${s.cardBorder};font-size:${fs}px}
.cmpt th{background:${s.filterBg};color:${s.accentColor};font-weight:700;min-width:160px}
.cmpt td{color:${s.cardBodyColor}}
.cmpt tr:nth-child(even) td{background:rgba(255,255,255,.02)}
.cmpimg{width:100%;height:110px;object-fit:cover;border-radius:7px;margin-bottom:7px}
.cmptitle{font-weight:700;color:${s.cardTitleColor};font-size:${fs}px}
/* pag */
.pag{display:flex;justify-content:center;align-items:center;gap:5px;margin-top:18px;flex-wrap:wrap}
.pb{display:inline-flex;align-items:center;gap:3px;padding:8px 12px;border:1px solid ${s.paginationBorder};border-radius:7px;background:${s.cardBg};color:${s.paginationText};font-size:${fs}px;font-weight:600;cursor:pointer;transition:all .2s;min-width:38px;justify-content:center;font-family:inherit}
.pb svg{width:15px;height:15px}.pb:hover:not([disabled]){background:${s.paginationHoverBg};border-color:${s.accentColor};color:${s.accentColor}}
.pb[disabled]{opacity:.4;cursor:not-allowed}.pb.act{background:${s.paginationActiveBg};border-color:${s.paginationActiveBg};color:${s.paginationActiveText}}
.pdot{font-size:${fs}px;color:${s.cardMetaColor}}
@media(max-width:768px){.wrap{padding:16px 10px}.grid{grid-template-columns:1fr;gap:12px}.toolbar{flex-direction:column}.asec{flex:1 1 100%;border-right:none}}`;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // _wireStatic — bind controls that exist from birth and NEVER need rewiring.
  // Uses event delegation everywhere to make double-registration impossible.
  // ─────────────────────────────────────────────────────────────────────────
  _wireStatic() {
    const sr = this.shadowRoot;
    let st;

    // Search
    sr.getElementById('srch').addEventListener('input', e => {
      clearTimeout(st);
      st = setTimeout(() => { this._s.search = e.target.value.toLowerCase().trim(); this._page=1; this._run(); }, 280);
    });

    // Sort
    sr.getElementById('srt').addEventListener('change', e => { this._s.sortBy = e.target.value; this._page=1; this._run(); });

    // Filter panel toggle
    const atog = sr.getElementById('atog'), adv = sr.getElementById('adv');
    atog.addEventListener('click', () => {
      this._advOpen = !this._advOpen;
      adv.classList.toggle('open', this._advOpen);
      atog.classList.toggle('open', this._advOpen);
    });

    // Quick pills — delegated on each pills container
    [['pvt','vehicleType'],['plt','listingType'],['pst','status']].forEach(([id, key]) => {
      sr.getElementById(id).addEventListener('click', e => {
        const btn = e.target.closest('.pill'); if (!btn) return;
        sr.querySelectorAll(`#${id} .pill`).forEach(p => p.classList.toggle('active', p===btn));
        this._s[key] = btn.dataset.v;
        this._page=1; this._run();
      });
    });

    // Compare bar buttons
    sr.getElementById('cbtn').addEventListener('click',  () => this._showCmpModal());
    sr.getElementById('cclr').addEventListener('click',  () => { this._compareIds=[]; this._updateCmpBar(); this._run(); });
    sr.getElementById('mclose').addEventListener('click', () => { sr.getElementById('mov').style.display='none'; });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // _buildPanel — COMPLETELY rebuilds the advanced filter panel from scratch.
  // Called every time new listing data arrives, AND when reset is clicked.
  //
  // Why rebuild instead of update?
  //   Old panel DOM is discarded → old event listeners die with it.
  //   New panel gets exactly one fresh delegated listener on its root.
  //   No double-registration possible. No stale closure possible.
  //
  // Sliders use data-* attributes for their config so the delegated handler
  // can read everything it needs from the DOM at event time — no closures.
  // ─────────────────────────────────────────────────────────────────────────
  _buildPanel() {
    const { _s:s, _b:b, _all:all } = this;

    // Resolve current state for pre-filling sliders
    const r = this._resolved();

    // Build unique sorted lists from current data
    const uniq = k => [...new Set(all.map(v=>v[k]).filter(Boolean))].sort();
    const meta = {
      make:'makes', bodyStyle:'bodyStyles', fuelType:'fuelTypes',
      transmission:'transmissions', drivetrain:'drivetrains', exteriorColor:'colors',
    };

    // ── Slider section HTML ──
    const dualSlider = (secId, title, loId, hiId, fillId, loVal, hiVal, minB, maxB, step, fmt) => `
      <div class="asec" id="${secId}">
        <div class="attl">${title}</div>
        <div class="rlbls"><span id="${loId}L">${fmt(loVal)}</span><span id="${hiId}L">${fmt(hiVal)}</span></div>
        <div class="rtwrap">
          <div class="rtrack"></div><div class="rfill" id="${fillId}"></div>
          <input class="ri" type="range" id="${loId}" min="${minB}" max="${maxB}" value="${loVal}" step="${step}"
            data-fill="${fillId}" data-lo="${loId}" data-hi="${hiId}" data-min="${minB}" data-max="${maxB}" data-dual="1" data-fmt="${fmt.name||'fmtN'}"/>
          <input class="ri rhi" type="range" id="${hiId}" min="${minB}" max="${maxB}" value="${hiVal}" step="${step}"
            data-fill="${fillId}" data-lo="${loId}" data-hi="${hiId}" data-min="${minB}" data-max="${maxB}" data-dual="1" data-fmt="${fmt.name||'fmtN'}"/>
        </div>
      </div>`;

    const singleSlider = (secId, title, inputId, fillId, val, minB, maxB, step, fmt) => `
      <div class="asec" id="${secId}">
        <div class="attl">${title}</div>
        <div class="rlbls"><span>0</span><span id="${inputId}L">${fmt(val)}</span></div>
        <div class="rtwrap">
          <div class="rtrack"></div><div class="rfill" id="${fillId}"></div>
          <input class="ri" type="range" id="${inputId}" min="${minB}" max="${maxB}" value="${val}" step="${step}"
            data-fill="${fillId}" data-lbl="${inputId}L" data-min="${minB}" data-max="${maxB}" data-single="1"/>
        </div>
      </div>`;

    // ── Checkbox section HTML ──
    const checkSec = (secId, title, stateKey, items) => {
      if (!items.length) return '';
      const arr = s[stateKey] || [];
      return `
      <div class="asec" id="${secId}">
        <div class="attl">${title}</div>
        <div class="cklist">
          ${items.map(v=>`
          <label class="ckrow">
            <input type="checkbox" data-sk="${stateKey}" data-val="${this._esc(v)}" ${arr.includes(v)?'checked':''}/>
            <span>${this._esc(v)}</span>
          </label>`).join('')}
        </div>
      </div>`;
    };

    const panel = this.shadowRoot.getElementById('adv');
    panel.innerHTML =
      dualSlider('secPr','Price Range','rPrLo','rPrHi','fPr', r.priceMin, r.priceMax, b.priceMin, b.priceMax, 1000, v=>'$'+Number(v).toLocaleString()) +
      dualSlider('secYr','Year',       'rYrLo','rYrHi','fYr', r.yearMin,  r.yearMax,  b.yearMin,  b.yearMax,  1,    v=>String(Math.round(v))) +
      singleSlider('secMi','Max Mileage','rMi','fMi', r.mileageMax, 0, b.mileageMax, 5000, v=>Number(v).toLocaleString()+' mi') +
      checkSec('secMk',  'Make',          'makes',         uniq('make')) +
      checkSec('secBS',  'Body Style',     'bodyStyles',    uniq('bodyStyle')) +
      checkSec('secFT',  'Fuel Type',      'fuelTypes',     uniq('fuelType')) +
      checkSec('secTR',  'Transmission',   'transmissions', uniq('transmission')) +
      checkSec('secDR',  'Drivetrain',     'drivetrains',   uniq('drivetrain')) +
      checkSec('secCL',  'Exterior Color', 'colors',        uniq('exteriorColor')) +
      `<div class="asec afull">
        <label class="togrow">
          <input type="checkbox" class="togcb" id="togFeat" ${s.featured?'checked':''}/>
          <span class="togtrack"></span><span class="toglbl">Featured listings only</span>
        </label>
      </div>
      <div class="afooter afull">
        <button class="btn bg bsm" id="resetBtn"><span class="ic">${IC.reset}</span>Reset all filters</button>
      </div>`;

    // Update fills now that HTML is in DOM
    this._updateFills();

    // ── ONE delegated listener on the panel — never re-registered ──────────
    panel.addEventListener('change', e => {
      const el = e.target;

      // ── Dual range slider ──
      if (el.dataset.dual) {
        const sr2 = this.shadowRoot;
        const loEl = sr2.getElementById(el.dataset.lo);
        const hiEl = sr2.getElementById(el.dataset.hi);
        let lo = parseFloat(loEl.value), hi = parseFloat(hiEl.value);
        // Clamp
        if (lo > hi) { if (el === loEl) lo = hi; else hi = lo; loEl.value = lo; hiEl.value = hi; }
        // Update fill
        const fillEl = sr2.getElementById(el.dataset.fill);
        const minB2  = parseFloat(el.dataset.min), maxB2 = parseFloat(el.dataset.max);
        const range  = maxB2 - minB2 || 1;
        if (fillEl) { fillEl.style.left = ((lo-minB2)/range*100)+'%'; fillEl.style.width = ((hi-lo)/range*100)+'%'; }
        // Update labels
        const isPrice = el.dataset.fill === 'fPr';
        const isYear  = el.dataset.fill === 'fYr';
        const fmtVal  = v => isPrice ? '$'+Number(v).toLocaleString() : isYear ? String(Math.round(v)) : String(v);
        const loLbl = sr2.getElementById(el.dataset.lo+'L'), hiLbl = sr2.getElementById(el.dataset.hi+'L');
        if (loLbl) loLbl.textContent = fmtVal(lo);
        if (hiLbl) hiLbl.textContent = fmtVal(hi);
        // Write to state
        if (isPrice) { this._s.priceMin = lo; this._s.priceMax = hi; }
        else if (isYear) { this._s.yearMin = lo; this._s.yearMax = hi; }
        this._page=1; this._run();
      }

      // ── Single range slider (mileage) ──
      else if (el.dataset.single) {
        const val   = parseFloat(el.value);
        const minB2 = parseFloat(el.dataset.min), maxB2 = parseFloat(el.dataset.max);
        const range = maxB2 - minB2 || 1;
        const fillEl = this.shadowRoot.getElementById(el.dataset.fill);
        if (fillEl) { fillEl.style.left='0%'; fillEl.style.width = ((val-minB2)/range*100)+'%'; }
        const lbl = this.shadowRoot.getElementById(el.dataset.lbl);
        if (lbl) lbl.textContent = Number(val).toLocaleString()+' mi';
        this._s.mileageMax = val;
        this._page=1; this._run();
      }

      // ── Checkbox ──
      else if (el.type==='checkbox' && el.dataset.sk) {
        const key = el.dataset.sk;
        const val = el.dataset.val;
        if (el.checked) { if (!this._s[key].includes(val)) this._s[key].push(val); }
        else { this._s[key] = this._s[key].filter(x=>x!==val); }
        this._page=1; this._run(); this._updateBadge();
      }

      // ── Featured toggle ──
      else if (el.id==='togFeat') {
        this._s.featured = el.checked;
        this._page=1; this._run(); this._updateBadge();
      }
    });

    // ── Reset button ─────────────────────────────────────────────────────────
    // Resets state then rebuilds entire panel — guaranteed clean slate.
    panel.querySelector('#resetBtn').addEventListener('click', () => {
      this._s = freshState();
      this._page = 1;
      // Reset pills
      const sr2 = this.shadowRoot;
      [['pvt','vehicleType'],['plt','listingType'],['pst','status']].forEach(([id])=>{
        sr2.querySelectorAll(`#${id} .pill`).forEach((p,i)=>p.classList.toggle('active',i===0));
      });
      // Reset search + sort
      const srch = sr2.getElementById('srch'); if (srch) srch.value='';
      const srt  = sr2.getElementById('srt');  if (srt)  srt.value='newest';
      // Rebuild panel with fresh state
      this._buildPanel();
      this._run();
      this._updateBadge();
    });

    this._applyVisibility();
  }

  // Update fill bars to match current slider DOM values
  _updateFills() {
    const sr = this.shadowRoot;
    const dual = (loId, hiId, fillId, minB, maxB) => {
      const lo=sr.getElementById(loId),hi=sr.getElementById(hiId),fill=sr.getElementById(fillId);
      if(!lo||!hi||!fill) return;
      const range=maxB-minB||1;
      fill.style.left=((parseFloat(lo.value)-minB)/range*100)+'%';
      fill.style.width=((parseFloat(hi.value)-parseFloat(lo.value))/range*100)+'%';
    };
    const single = (id, fillId, minB, maxB) => {
      const el=sr.getElementById(id),fill=sr.getElementById(fillId);
      if(!el||!fill) return;
      const range=maxB-minB||1;
      fill.style.left='0%'; fill.style.width=((parseFloat(el.value)-minB)/range*100)+'%';
    };
    const b = this._b;
    dual('rPrLo','rPrHi','fPr', b.priceMin,  b.priceMax);
    dual('rYrLo','rYrHi','fYr', b.yearMin,   b.yearMax);
    single('rMi','fMi', 0, b.mileageMax);
  }

  _applyVisibility() {
    const sr = this.shadowRoot;
    const MAP = {
      vehicleType:'rowVT', listingType:'rowLT', status:'rowST',
      priceRange:'secPr', yearRange:'secYr', mileageRange:'secMi',
      make:'secMk', bodyStyle:'secBS', fuelType:'secFT',
      transmission:'secTR', drivetrain:'secDR', exteriorColor:'secCL', featured:'togFeat',
    };
    Object.entries(MAP).forEach(([key, id]) => {
      const el = sr.getElementById(id); if (!el) return;
      const target = el.closest('.asec') || el.closest('.frow') || el;
      target.style.display = this._vis.has(key) ? '' : 'none';
    });
  }

  _updateBadge() {
    const s = this._s;
    const n = s.makes.length+s.bodyStyles.length+s.fuelTypes.length+
              s.transmissions.length+s.drivetrains.length+s.colors.length+
              (s.featured?1:0)+(s.priceMin!==null?1:0)+(s.priceMax!==null?1:0)+
              (s.yearMin!==null?1:0)+(s.yearMax!==null?1:0)+(s.mileageMax!==null?1:0);
    const b = this.shadowRoot.getElementById('abadge');
    if (b) { b.style.display=n>0?'flex':'none'; b.textContent=n; }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // _run — single render entry point. Reads this._s, filters this._all,
  // paginates, renders grid and pagination.
  // ─────────────────────────────────────────────────────────────────────────
  _run() {
    const r        = this._resolved();
    const filtered = this._filter(r);
    const total    = filtered.length;
    const pages    = Math.max(1, Math.ceil(total/this._perPage));
    if (this._page > pages) this._page = pages;

    const skip  = (this._page-1)*this._perPage;
    const slice = filtered.slice(skip, skip+this._perPage);

    const sr   = this.shadowRoot;
    const grid = sr.getElementById('grid');
    const meta = sr.getElementById('meta');

    meta.textContent = total>0
      ? `Showing ${total} listing${total!==1?'s':''}` +
        (total!==this._all.length ? ` (filtered from ${this._all.length})` : '')
      : '';

    if (!total) {
      grid.innerHTML = `<div class="empty">${IC.noResults}<h3>No listings found</h3><p>Try adjusting your filters or search terms.</p></div>`;
      this._renderPag(pages);
      return;
    }

    grid.innerHTML = slice.map((v,i)=>this._cardHTML(v,i)).join('');

    grid.querySelectorAll('.vbtn').forEach(btn=>btn.addEventListener('click',()=>this._navigate(btn.dataset.slug)));
    grid.querySelectorAll('.ccb').forEach(cb=>{
      cb.addEventListener('change',()=>{
        const id=cb.dataset.id;
        if(cb.checked){ if(this._compareIds.length>=4){cb.checked=false;return;} if(!this._compareIds.includes(id)) this._compareIds.push(id); cb.closest('.card')?.classList.add('sel'); }
        else { this._compareIds=this._compareIds.filter(x=>x!==id); cb.closest('.card')?.classList.remove('sel'); }
        this._updateCmpBar();
      });
    });

    this._renderPag(pages);
  }

  // ── Pure filter + sort ────────────────────────────────────────────────────
  _filter(r) {
    let list = [...this._all];

    if (r.search) {
      const q=r.search;
      list=list.filter(v=>[v.title,v.make,v.model,v.trim,v.year,v.vin,v.stockNumber,v.description,v.bodyStyle,v.exteriorColor].join(' ').toLowerCase().includes(q));
    }
    if (r.vehicleType!=='all') list=list.filter(v=>v.vehicleType===r.vehicleType);
    if (r.listingType!=='all') list=list.filter(v=>v.listingType===r.listingType);
    if (r.status!=='all')      list=list.filter(v=>v.status===r.status);

    // Price — zero-price listings always pass
    list=list.filter(v=>{const p=Number(v.salePrice||v.price)||0; return !p||(p>=r.priceMin&&p<=r.priceMax);});
    // Year — missing year always passes
    list=list.filter(v=>!v.year||(Number(v.year)>=r.yearMin&&Number(v.year)<=r.yearMax));
    // Mileage — missing mileage always passes
    list=list.filter(v=>!v.mileage||Number(v.mileage)<=r.mileageMax);

    if (r.makes.length)        list=list.filter(v=>r.makes.includes(v.make));
    if (r.bodyStyles.length)   list=list.filter(v=>r.bodyStyles.includes(v.bodyStyle));
    if (r.fuelTypes.length)    list=list.filter(v=>r.fuelTypes.includes(v.fuelType));
    if (r.transmissions.length)list=list.filter(v=>r.transmissions.includes(v.transmission));
    if (r.drivetrains.length)  list=list.filter(v=>r.drivetrains.includes(v.drivetrain));
    if (r.colors.length)       list=list.filter(v=>r.colors.includes(v.exteriorColor));
    if (r.featured)            list=list.filter(v=>v.featured);

    list.sort((a,b2)=>{
      switch(r.sortBy){
        case 'price-asc':   return (Number(a.salePrice||a.price)||0)-(Number(b2.salePrice||b2.price)||0);
        case 'price-desc':  return (Number(b2.salePrice||b2.price)||0)-(Number(a.salePrice||a.price)||0);
        case 'year-desc':   return (Number(b2.year)||0)-(Number(a.year)||0);
        case 'year-asc':    return (Number(a.year)||0)-(Number(b2.year)||0);
        case 'mileage-asc': return (Number(a.mileage)||0)-(Number(b2.mileage)||0);
        case 'oldest':      return new Date(a._createdDate)-new Date(b2._createdDate);
        default:            return new Date(b2._createdDate)-new Date(a._createdDate);
      }
    });
    return list;
  }

  // ── Card HTML ─────────────────────────────────────────────────────────────
  _cardHTML(v,idx){
    const title=v.title||`${v.year||''} ${v.make||''} ${v.model||''}`.trim()||'Vehicle';
    const img=this._imgUrl(v.primaryImage,680,440);
    const isCmp=this._compareIds.includes(v._id);
    const lbdg=this._lbdg(v.listingType);
    const sbdg=(v.status==='sold'||v.status==='rented')?`<span class="bdg bdg-${v.status}">${v.status}</span>`:'';
    const fbdg=v.featured?`<span class="bdg bdg-feat"><span class="ic" style="font-size:9px">${IC.star}</span>Featured</span>`:'';
    const imgEl=img?`<img class="ci" src="${img}" alt="${this._esc(title)}" loading="${idx<6?'eager':'lazy'}" decoding="${idx<6?'sync':'async'}" onerror="this.style.display='none'"/>`:`<div class="iph"><span class="ic" style="font-size:52px">${IC.car}</span></div>`;
    return `
<article class="card${isCmp?' sel':''}" data-id="${v._id}">
  <div class="iw">${imgEl}<div class="bdgs">${lbdg}${sbdg}${fbdg}</div><div class="ccbw"><input type="checkbox" class="ccb" data-id="${v._id}" ${isCmp?'checked':''}/></div></div>
  <div class="cbody">
    <div class="ctitle">${this._esc(title)}</div>
    <div class="csub">${[v.bodyStyle,v.drivetrain,v.engine].filter(Boolean).join(' · ')}</div>
    <div class="specs">
      ${v.mileage?`<span class="spec"><span class="ic">${IC.gauge}</span>${Number(v.mileage).toLocaleString()} mi</span>`:''}
      ${v.fuelType?`<span class="spec"><span class="ic">${IC.fuel}</span>${v.fuelType}</span>`:''}
      ${v.transmission?`<span class="spec"><span class="ic">${IC.gear}</span>${v.transmission}</span>`:''}
      ${v.exteriorColor?`<span class="spec"><span class="ic">${IC.palette}</span>${v.exteriorColor}</span>`:''}
    </div>
    <div class="prow">${this._fmtPrice(v)}</div>
  </div>
  <div class="cfoot"><button class="btn ba vbtn" data-slug="${v.slug}">View Details <span class="ic" style="font-size:14px">${IC.arrowR}</span></button></div>
</article>`;
  }

  _lbdg(type){const m={new:['new','New'],used:['used','Used'],rent:['rent','Rent/Lease'],auction:['auction','Auction']};const[c,l]=m[type]||['used',type||'Used'];return `<span class="bdg bdg-${c}">${l}</span>`;}

  _fmtPrice(v){
    const sym={INR:'₹',EUR:'€',GBP:'£'}[v.currency]||'$';
    const fmt=n=>sym+Number(n).toLocaleString();
    if(v.listingType==='rent'&&v.rentalPricePerDay)    return `<span class="price">${fmt(v.rentalPricePerDay)}<small>/day</small></span>`;
    if(v.listingType==='auction'&&v.auctionStartPrice) return `<span class="price">From ${fmt(v.auctionStartPrice)}</span><span class="pnote">Auction</span>`;
    if(v.salePrice&&v.salePrice<v.price)               return `<span class="price">${fmt(v.salePrice)}</span><span class="porig">${fmt(v.price)}</span>`;
    if(v.price)                                        return `<span class="price">${fmt(v.price)}</span>`;
    return `<span class="pnote">Price on request</span>`;
  }

  // ── Compare modal ─────────────────────────────────────────────────────────
  _showCmpModal(){
    const vs=this._all.filter(v=>this._compareIds.includes(v._id));
    if(vs.length<2)return;
    const fields=[
      ['Year',v=>v.year||'—'],['Make',v=>v.make||'—'],['Model',v=>v.model||'—'],['Trim',v=>v.trim||'—'],
      ['Body Style',v=>v.bodyStyle||'—'],['Mileage',v=>v.mileage?Number(v.mileage).toLocaleString()+' mi':'—'],
      ['Engine',v=>v.engine||'—'],['Transmission',v=>v.transmission||'—'],['Drivetrain',v=>v.drivetrain||'—'],
      ['Fuel Type',v=>v.fuelType||'—'],['MPG City',v=>v.mpgCity?v.mpgCity+' mpg':'—'],['MPG Hwy',v=>v.mpgHighway?v.mpgHighway+' mpg':'—'],
      ['Ext Color',v=>v.exteriorColor||'—'],['Int Color',v=>v.interiorColor||'—'],
      ['Seating',v=>v.seatingCapacity?v.seatingCapacity+' seats':'—'],
      ['Price',v=>(v.salePrice||v.price)?'$'+Number(v.salePrice||v.price).toLocaleString():'—'],
      ['VIN',v=>v.vin||'—'],['Stock #',v=>v.stockNumber||'—'],['Condition',v=>v.condition||'—'],['Warranty',v=>v.warrantyType||'—'],
    ];
    const heads=vs.map(v=>{const img=this._imgUrl(v.primaryImage,400,240);const t=v.title||`${v.year} ${v.make} ${v.model}`;return `<th>${img?`<img class="cmpimg" src="${img}" alt="${this._esc(t)}" loading="lazy"/>`:''}<div class="cmptitle">${this._esc(t)}</div></th>`;}).join('');
    const rows=fields.map(([l,fn])=>`<tr><th>${l}</th>${vs.map(v=>`<td>${this._esc(String(fn(v)))}</td>`).join('')}</tr>`).join('');
    this.shadowRoot.getElementById('mtbl').innerHTML=`<table class="cmpt"><thead><tr><th>Spec</th>${heads}</tr></thead><tbody>${rows}</tbody></table>`;
    this.shadowRoot.getElementById('mov').style.display='flex';
  }

  _updateCmpBar(){
    const bar=this.shadowRoot.getElementById('cbar'),cnt=this.shadowRoot.getElementById('ccnt');
    if(cnt)cnt.textContent=this._compareIds.length;
    if(bar)bar.style.display=this._compareIds.length>=2?'flex':'none';
  }

  // ── Pagination — delegated, { once:true } prevents double-registration ────
  _renderPag(totalPages){
    const pag=this.shadowRoot.getElementById('pag');
    if(totalPages<=1){pag.innerHTML='';return;}
    const cur=this._page,maxV=5;
    let s=Math.max(1,cur-2),e=Math.min(totalPages,s+maxV-1);
    if(e-s<maxV-1)s=Math.max(1,e-maxV+1);
    let h=`<button class="pb" data-p="${cur-1}" ${cur===1?'disabled':''}>${IC.chevL}</button>`;
    if(s>1){h+=`<button class="pb" data-p="1">1</button>`;if(s>2)h+=`<span class="pdot">…</span>`;}
    for(let i=s;i<=e;i++)h+=`<button class="pb ${i===cur?'act':''}" data-p="${i}">${i}</button>`;
    if(e<totalPages){if(e<totalPages-1)h+=`<span class="pdot">…</span>`;h+=`<button class="pb" data-p="${totalPages}">${totalPages}</button>`;}
    h+=`<button class="pb" data-p="${cur+1}" ${cur===totalPages?'disabled':''}>${IC.chevR}</button>`;
    pag.innerHTML=h;
    // { once: true } — listener auto-removes after one click; re-added on next render
    pag.addEventListener('click', e=>{
      const btn=e.target.closest('.pb');
      if(!btn||btn.hasAttribute('disabled'))return;
      const p=parseInt(btn.dataset.p);
      if(isNaN(p)||p<1||p>totalPages)return;
      this._page=p; this._run();
      this.shadowRoot.getElementById('grid')?.scrollIntoView({behavior:'smooth',block:'start'});
    },{once:true});
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  _navigate(slug){this.dispatchEvent(new CustomEvent('navigate-to-listing',{detail:{slug},bubbles:true,composed:true}));}

  _imgUrl(raw,w=400,h=240){
    if(!raw||typeof raw!=='string')return'';
    if(raw.startsWith('https://static.wixstatic.com/media/')){try{const fn=raw.split('/media/')[1]?.split('/')[0];if(!fn)return raw;return`https://static.wixstatic.com/media/${fn}/v1/fill/w_${w},h_${h},al_c,q_80,enc_avif,quality_auto/${fn}`;}catch(e){return raw;}}
    if(raw.startsWith('http://')||raw.startsWith('https://'))return raw;
    if(raw.startsWith('wix:image://')){try{const fid=raw.split('/')[3]?.split('#')[0];if(!fid)return'';let fn=fid.includes('~mv2')?fid:`${fid}~mv2.jpg`;if(!fn.includes('.'))fn+='.jpg';return`https://static.wixstatic.com/media/${fn}/v1/fill/w_${w},h_${h},al_c,q_80,enc_avif,quality_auto/${fn}`;}catch(e){return'';}}
    return'';
  }

  _esc(t){if(t===null||t===undefined)return'';const d=(this.shadowRoot.ownerDocument||document).createElement('div');d.textContent=String(t);return d.innerHTML;}
}

customElements.define('vehicle-list-viewer', VehicleListViewer);
