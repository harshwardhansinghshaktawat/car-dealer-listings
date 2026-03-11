/**
 * CUSTOM ELEMENT — Vehicle Listing Viewer (List Page)
 * Tag: <vehicle-list-viewer>
 *
 * Attributes set by widget:
 *   listing-list  — JSON { listings[], totalCount, currentPage, totalPages, postsPerPage }
 *   style-props   — JSON style tokens incl. fontSize (number) and visibleFilters (comma string)
 *
 * Events dispatched:
 *   page-change          — { page }
 *   navigate-to-listing  — { slug }
 */

// ─── SVG icon library ─────────────────────────────────────────────────────────
const ICONS = {
  search:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  sliders:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
  x:           `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  chevLeft:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevRight:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  car:         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  gauge:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12 8 8"/><circle cx="12" cy="12" r="2"/></svg>`,
  fuel:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V8l6-6h6l2 2v4h2a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  gear:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  palette:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
  star:        `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  arrowRight:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  compare:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>`,
  reset:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  empty:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
};

const ALL_FILTER_KEYS = [
  'vehicleType','listingType','status',
  'priceRange','yearRange','mileageRange',
  'make','bodyStyle','fuelType','transmission','drivetrain','exteriorColor','featured',
];

class VehicleListViewer extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this._listings = []; this._currentPage = 1; this._totalPages = 1;
    this._perPage = 9; this._compareIds = []; this._advOpen = false;

    this._filterVehicleType = 'all'; this._filterListingType = 'all';
    this._filterStatus = 'all'; this._sortBy = 'newest'; this._searchQuery = '';

    this._priceMin = 0; this._priceMax = 999999;
    this._yearMin = 1900; this._yearMax = 2030; this._mileageMax = 999999;
    this._priceRangeMin = 0; this._priceRangeMax = 500000;
    this._yearRangeMin = 1990; this._yearRangeMax = 2026; this._mileageRangeMax = 300000;

    this._filterMakes = []; this._filterBodyStyles = []; this._filterFuelTypes = [];
    this._filterTransmissions = []; this._filterDrivetrains = []; this._filterColors = [];
    this._filterFeatured = false;

    this._meta = { makes:[], bodyStyles:[], fuelTypes:[], transmissions:[], drivetrains:[], colors:[] };
    this._visibleFilters = new Set(ALL_FILTER_KEYS);

    const raw = this.getAttribute('style-props');
    this.styleProps = raw ? JSON.parse(raw) : this._defaults();
    this._initUI();
  }

  static get observedAttributes() { return ['listing-list','style-props']; }

  _defaults() {
    return {
      fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif', fontSize:14,
      bgColor:'#0f1117', accentColor:'#f97316', accentHover:'#ea580c',
      cardBg:'#1a1d27', cardBorder:'#2a2d3a', cardShadow:'rgba(0,0,0,0.4)',
      cardHoverShadow:'rgba(249,115,22,0.2)', cardTitleColor:'#ffffff',
      cardBodyColor:'#94a3b8', cardMetaColor:'#64748b',
      pricePrimaryColor:'#f97316', priceSecondaryColor:'#94a3b8',
      badgeNewBg:'#166534', badgeNewText:'#bbf7d0', badgeUsedBg:'#1e3a5f', badgeUsedText:'#93c5fd',
      badgeRentBg:'#4c1d95', badgeRentText:'#ddd6fe', badgeAuctionBg:'#7c2d12', badgeAuctionText:'#fed7aa',
      badgeFeaturedBg:'#f97316', badgeFeaturedText:'#ffffff',
      filterBg:'#1a1d27', filterBorder:'#2a2d3a', filterText:'#94a3b8',
      filterActiveBg:'#f97316', filterActiveText:'#ffffff',
      btnBg:'#f97316', btnText:'#ffffff', btnBorderColor:'#f97316', btnBorderText:'#f97316',
      paginationBorder:'#2a2d3a', paginationText:'#94a3b8',
      paginationActiveBg:'#f97316', paginationActiveText:'#ffffff', paginationHoverBg:'#1e2133',
      searchBg:'#1a1d27', searchBorder:'#2a2d3a', searchText:'#ffffff', searchPlaceholder:'#64748b',
      compareBg:'#1a1d27', compareBorder:'#f97316', compareText:'#ffffff',
      advFilterBg:'#141720', advFilterBorder:'#2a2d3a',
      sliderAccent:'#f97316', rangeValueColor:'#f97316', checkboxAccent:'#f97316',
      iconColor:'#64748b', emptyColor:'#64748b',
      visibleFilters:'all',
    };
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (!newVal || oldVal === newVal) return;
    if (name === 'listing-list') {
      try {
        const d = JSON.parse(newVal);
        this._listings = d.listings || []; this._totalPages = d.totalPages || 1;
        this._currentPage = d.currentPage || 1; this._perPage = d.postsPerPage || 9;
        this._buildMeta(); this._resetRangeDefaults();
        requestAnimationFrame(() => { this._rebuildAdvFilters(); this._renderListings(); });
      } catch(e) { console.error('vehicle-list-viewer listing-list parse:', e.message); }
    } else if (name === 'style-props') {
      try {
        const inc = JSON.parse(newVal);
        this.styleProps = { ...this.styleProps, ...inc };
        const vf = inc.visibleFilters;
        this._visibleFilters = (vf && vf !== 'all') ? new Set(vf.split(',').map(s=>s.trim())) : new Set(ALL_FILTER_KEYS);
        if (this._ready) { this._updateStyles(); this._syncFilterVisibility(); }
      } catch(e) { console.error('vehicle-list-viewer style-props parse:', e.message); }
    }
  }

  _initUI() {
    this.shadowRoot.innerHTML = `<style>${this._css()}</style>${this._shell()}`;
    this._ready = true;
    this._bindControls();
  }

  _buildMeta() {
    const uniq = arr => [...new Set(arr.filter(Boolean))].sort();
    this._meta = {
      makes:         uniq(this._listings.map(v=>v.make)),
      bodyStyles:    uniq(this._listings.map(v=>v.bodyStyle)),
      fuelTypes:     uniq(this._listings.map(v=>v.fuelType)),
      transmissions: uniq(this._listings.map(v=>v.transmission)),
      drivetrains:   uniq(this._listings.map(v=>v.drivetrain)),
      colors:        uniq(this._listings.map(v=>v.exteriorColor)),
    };
  }

  _resetRangeDefaults() {
    const prices   = this._listings.map(v=>v.salePrice||v.price||0).filter(n=>n>0);
    const years    = this._listings.map(v=>v.year||0).filter(n=>n>0);
    const mileages = this._listings.map(v=>v.mileage||0).filter(n=>n>0);
    this._priceRangeMin  = prices.length   ? Math.min(...prices)   : 0;
    this._priceRangeMax  = prices.length   ? Math.max(...prices)   : 500000;
    this._yearRangeMin   = years.length    ? Math.min(...years)    : 1990;
    this._yearRangeMax   = years.length    ? Math.max(...years)    : new Date().getFullYear()+1;
    this._mileageRangeMax = mileages.length ? Math.max(...mileages) : 300000;
    this._priceMin = this._priceRangeMin; this._priceMax = this._priceRangeMax;
    this._yearMin  = this._yearRangeMin;  this._yearMax  = this._yearRangeMax;
    this._mileageMax = this._mileageRangeMax;
  }

  _shell() {
    return `<div class="vlv-wrap">
      <div class="vlv-toolbar">
        <div class="vlv-search-wrap">
          <span class="vlv-icon vlv-search-icon">${ICONS.search}</span>
          <input class="vlv-search" id="vlvSearch" type="text" placeholder="Search make, model, year, VIN…"/>
        </div>
        <div class="vlv-sort-wrap">
          <select class="vlv-select" id="vlvSort">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="year-desc">Year: Newest</option>
            <option value="year-asc">Year: Oldest</option>
            <option value="mileage-asc">Lowest Mileage</option>
          </select>
        </div>
        <button class="vlv-adv-toggle" id="vlvAdvToggle">
          <span class="vlv-icon">${ICONS.sliders}</span><span>Filters</span>
          <span class="vlv-adv-badge" id="vlvAdvBadge" style="display:none"></span>
        </button>
      </div>

      <div class="vlv-quick-filters" id="vlvQuickFilters">
        <div class="vlv-filter-row" id="vlvRowVehicleType">
          <span class="vlv-filter-label">Type</span>
          <div class="vlv-pills" id="vlvVehicleTypeFilter">
            <button class="vlv-pill active" data-val="all">All</button>
            <button class="vlv-pill" data-val="car"><span class="vlv-pill-icon vlv-icon">${ICONS.car}</span>Cars</button>
            <button class="vlv-pill" data-val="motorcycle">Motorcycles</button>
            <button class="vlv-pill" data-val="rv">RVs</button>
            <button class="vlv-pill" data-val="truck">Trucks</button>
            <button class="vlv-pill" data-val="van">Vans</button>
            <button class="vlv-pill" data-val="boat">Boats</button>
          </div>
        </div>
        <div class="vlv-filter-row" id="vlvRowListingType">
          <span class="vlv-filter-label">Listing</span>
          <div class="vlv-pills" id="vlvListingTypeFilter">
            <button class="vlv-pill active" data-val="all">All</button>
            <button class="vlv-pill" data-val="new">New</button>
            <button class="vlv-pill" data-val="used">Used</button>
            <button class="vlv-pill" data-val="rent">Rent / Lease</button>
            <button class="vlv-pill" data-val="auction">Auction</button>
          </div>
        </div>
        <div class="vlv-filter-row" id="vlvRowStatus">
          <span class="vlv-filter-label">Status</span>
          <div class="vlv-pills" id="vlvStatusFilter">
            <button class="vlv-pill active" data-val="all">All</button>
            <button class="vlv-pill" data-val="active">Active</button>
            <button class="vlv-pill" data-val="sold">Sold</button>
            <button class="vlv-pill" data-val="rented">Rented</button>
          </div>
        </div>
      </div>

      <div class="vlv-adv-panel" id="vlvAdvPanel">
        <div class="vlv-adv-section" id="vlvAdvPriceRange">
          <div class="vlv-adv-title">Price Range</div>
          <div class="vlv-range-labels"><span id="vlvPriceMinLbl">$0</span><span id="vlvPriceMaxLbl">$500,000</span></div>
          <div class="vlv-dual-wrap">
            <div class="vlv-range-track"><div class="vlv-range-fill" id="vlvPriceFill"></div></div>
            <input type="range" class="vlv-range" id="vlvPriceMin" min="0" max="500000" value="0" step="1000"/>
            <input type="range" class="vlv-range vlv-range-hi" id="vlvPriceMax" min="0" max="500000" value="500000" step="1000"/>
          </div>
        </div>
        <div class="vlv-adv-section" id="vlvAdvYearRange">
          <div class="vlv-adv-title">Year</div>
          <div class="vlv-range-labels"><span id="vlvYearMinLbl">1990</span><span id="vlvYearMaxLbl">2026</span></div>
          <div class="vlv-dual-wrap">
            <div class="vlv-range-track"><div class="vlv-range-fill" id="vlvYearFill"></div></div>
            <input type="range" class="vlv-range" id="vlvYearMin" min="1900" max="2030" value="1990" step="1"/>
            <input type="range" class="vlv-range vlv-range-hi" id="vlvYearMax" min="1900" max="2030" value="2030" step="1"/>
          </div>
        </div>
        <div class="vlv-adv-section" id="vlvAdvMileageRange">
          <div class="vlv-adv-title">Max Mileage</div>
          <div class="vlv-range-labels"><span>0 mi</span><span id="vlvMileageMaxLbl">300,000 mi</span></div>
          <div class="vlv-single-wrap">
            <div class="vlv-range-track"><div class="vlv-range-fill" id="vlvMileageFill"></div></div>
            <input type="range" class="vlv-range" id="vlvMileageMax" min="0" max="300000" value="300000" step="5000"/>
          </div>
        </div>
        <div class="vlv-adv-section" id="vlvAdvMake"><div class="vlv-adv-title">Make</div><div class="vlv-check-grid" id="vlvMakeChecks"></div></div>
        <div class="vlv-adv-section" id="vlvAdvBodyStyle"><div class="vlv-adv-title">Body Style</div><div class="vlv-check-grid" id="vlvBodyStyleChecks"></div></div>
        <div class="vlv-adv-section" id="vlvAdvFuelType"><div class="vlv-adv-title">Fuel Type</div><div class="vlv-check-grid" id="vlvFuelTypeChecks"></div></div>
        <div class="vlv-adv-section" id="vlvAdvTransmission"><div class="vlv-adv-title">Transmission</div><div class="vlv-check-grid" id="vlvTransChecks"></div></div>
        <div class="vlv-adv-section" id="vlvAdvDrivetrain"><div class="vlv-adv-title">Drivetrain</div><div class="vlv-check-grid" id="vlvDrivetrainChecks"></div></div>
        <div class="vlv-adv-section" id="vlvAdvExteriorColor"><div class="vlv-adv-title">Exterior Color</div><div class="vlv-check-grid" id="vlvColorChecks"></div></div>
        <div class="vlv-adv-section vlv-adv-inline" id="vlvAdvFeatured">
          <label class="vlv-toggle-lbl">
            <input type="checkbox" id="vlvFeaturedCb" class="vlv-toggle-cb"/>
            <span class="vlv-toggle-track"></span>
            <span>Featured listings only</span>
          </label>
        </div>
        <div class="vlv-adv-footer">
          <button class="vlv-btn vlv-btn-ghost vlv-btn-sm" id="vlvResetFilters">
            <span class="vlv-icon">${ICONS.reset}</span>Reset all filters
          </button>
        </div>
      </div>

      <div class="vlv-compare-bar" id="vlvCompareBar" style="display:none">
        <span class="vlv-icon" style="font-size:18px;color:var(--accent)">${ICONS.compare}</span>
        <span class="vlv-compare-lbl">Compare: <strong id="vlvCompareCount">0</strong> selected</span>
        <button class="vlv-btn vlv-btn-accent vlv-btn-sm" id="vlvCompareBtn">Compare Now</button>
        <button class="vlv-btn vlv-btn-ghost vlv-btn-sm" id="vlvCompareClear"><span class="vlv-icon">${ICONS.x}</span>Clear</button>
      </div>

      <div class="vlv-results-meta" id="vlvResultsMeta"></div>

      <div class="vlv-grid" id="vlvGrid">
        <div class="vlv-loading"><div class="vlv-spinner"></div><p>Loading listings…</p></div>
      </div>

      <div class="vlv-modal-overlay" id="vlvCompareModal" style="display:none">
        <div class="vlv-modal">
          <div class="vlv-modal-head"><h2>Vehicle Comparison</h2><button class="vlv-modal-close" id="vlvModalClose"><span class="vlv-icon">${ICONS.x}</span></button></div>
          <div class="vlv-modal-body" id="vlvCompareTable"></div>
        </div>
      </div>

      <div class="vlv-pagination" id="vlvPagination"></div>
    </div>`;
  }

  _css() {
    const s = this.styleProps;
    const fs = Number(s.fontSize) || 14;
    const fs2 = Math.max(11, fs-2); const fs3 = Math.max(10, fs-3);
    return `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :host{display:block;width:100%;font-family:${s.fontFamily};font-size:${fs}px}
    .vlv-wrap{background:${s.bgColor};padding:28px 18px;min-height:500px}
    .vlv-icon{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1}
    .vlv-icon svg{width:1em;height:1em}

    /* Toolbar */
    .vlv-toolbar{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;align-items:center}
    .vlv-search-wrap{flex:1;min-width:200px;position:relative}
    .vlv-search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:${s.iconColor};font-size:16px;pointer-events:none}
    .vlv-search{width:100%;padding:10px 12px 10px 38px;background:${s.searchBg};border:1px solid ${s.searchBorder};border-radius:9px;color:${s.searchText};font-size:${fs}px;font-family:inherit;transition:border-color .2s}
    .vlv-search::placeholder{color:${s.searchPlaceholder}}
    .vlv-search:focus{outline:none;border-color:${s.accentColor}}
    .vlv-sort-wrap{min-width:160px}
    .vlv-select{width:100%;padding:10px 12px;background:${s.searchBg};border:1px solid ${s.searchBorder};border-radius:9px;color:${s.searchText};font-size:${fs}px;font-family:inherit;cursor:pointer;appearance:none}
    .vlv-select:focus{outline:none;border-color:${s.accentColor}}
    .vlv-adv-toggle{display:inline-flex;align-items:center;gap:6px;padding:10px 14px;border-radius:9px;font-size:${fs}px;font-weight:600;border:1px solid ${s.filterBorder};background:${s.filterBg};color:${s.filterText};cursor:pointer;transition:all .2s;font-family:inherit;position:relative}
    .vlv-adv-toggle .vlv-icon{color:${s.iconColor};font-size:15px}
    .vlv-adv-toggle:hover,.vlv-adv-toggle.open{border-color:${s.accentColor};color:${s.accentColor}}
    .vlv-adv-toggle.open .vlv-icon{color:${s.accentColor}}
    .vlv-adv-badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;border-radius:9px;padding:0 4px;background:${s.accentColor};color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center}

    /* Quick filters */
    .vlv-quick-filters{display:flex;flex-direction:column;gap:7px;margin-bottom:10px}
    .vlv-filter-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .vlv-filter-label{font-size:${fs3}px;color:${s.cardMetaColor};font-weight:700;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;min-width:48px}
    .vlv-pills{display:flex;gap:5px;flex-wrap:wrap}
    .vlv-pill{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:18px;font-size:${fs2}px;font-weight:500;border:1px solid ${s.filterBorder};background:${s.filterBg};color:${s.filterText};cursor:pointer;transition:all .2s;font-family:inherit}
    .vlv-pill-icon{font-size:13px;color:${s.iconColor}}
    .vlv-pill-icon svg{width:13px;height:13px}
    .vlv-pill:hover{border-color:${s.accentColor};color:${s.accentColor}}
    .vlv-pill.active{background:${s.filterActiveBg};color:${s.filterActiveText};border-color:${s.filterActiveBg}}

    /* Adv panel */
    .vlv-adv-panel{display:none;flex-wrap:wrap;gap:0;background:${s.advFilterBg};border:1px solid ${s.advFilterBorder};border-radius:12px;padding:16px;margin-bottom:14px;animation:vlv-fadein .2s ease}
    .vlv-adv-panel.open{display:flex}
    @keyframes vlv-fadein{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
    .vlv-adv-section{flex:1 1 190px;min-width:170px;padding:10px 14px;border-right:1px solid ${s.advFilterBorder}}
    .vlv-adv-section:last-of-type{border-right:none}
    .vlv-adv-inline{display:flex;align-items:center;flex:1 1 100%;border-right:none;border-top:1px solid ${s.advFilterBorder};padding-top:12px;margin-top:6px}
    .vlv-adv-footer{flex:1 1 100%;border-top:1px solid ${s.advFilterBorder};padding-top:12px;margin-top:6px;display:flex;justify-content:flex-end}
    .vlv-adv-title{font-size:${fs3}px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${s.cardMetaColor};margin-bottom:9px}

    /* Range sliders */
    .vlv-range-labels{display:flex;justify-content:space-between;font-size:${fs2}px;color:${s.rangeValueColor};font-weight:600;margin-bottom:5px}
    .vlv-dual-wrap,.vlv-single-wrap{position:relative;height:34px;display:flex;align-items:center}
    .vlv-range-track{position:absolute;left:0;right:0;height:4px;border-radius:2px;background:${s.advFilterBorder};pointer-events:none}
    .vlv-range-fill{position:absolute;height:100%;border-radius:2px;background:${s.sliderAccent}}
    .vlv-range{position:absolute;width:100%;height:4px;-webkit-appearance:none;appearance:none;background:transparent;cursor:pointer;pointer-events:none}
    .vlv-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${s.sliderAccent};border:2px solid ${s.advFilterBg};box-shadow:0 0 0 2px ${s.sliderAccent};cursor:pointer;pointer-events:all;transition:transform .15s}
    .vlv-range::-webkit-slider-thumb:hover{transform:scale(1.2)}
    .vlv-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:${s.sliderAccent};border:2px solid ${s.advFilterBg};cursor:pointer;pointer-events:all}
    .vlv-range-hi{z-index:2}

    /* Checkbox grid */
    .vlv-check-grid{display:flex;flex-direction:column;gap:5px;max-height:150px;overflow-y:auto;padding-right:3px}
    .vlv-check-grid::-webkit-scrollbar{width:3px}
    .vlv-check-grid::-webkit-scrollbar-thumb{background:${s.advFilterBorder};border-radius:2px}
    .vlv-check-item{display:flex;align-items:center;gap:7px;cursor:pointer}
    .vlv-check-item input[type=checkbox]{accent-color:${s.checkboxAccent};width:14px;height:14px;cursor:pointer;flex-shrink:0}
    .vlv-check-item span{font-size:${fs2}px;color:${s.filterText}}
    .vlv-check-item:hover span{color:${s.accentColor}}

    /* Toggle */
    .vlv-toggle-lbl{display:flex;align-items:center;gap:9px;cursor:pointer;font-size:${fs}px;color:${s.filterText}}
    .vlv-toggle-cb{display:none}
    .vlv-toggle-track{width:38px;height:20px;border-radius:10px;background:${s.advFilterBorder};position:relative;flex-shrink:0;transition:background .2s}
    .vlv-toggle-track::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:${s.filterText};transition:transform .2s,background .2s}
    .vlv-toggle-cb:checked+.vlv-toggle-track{background:${s.checkboxAccent}}
    .vlv-toggle-cb:checked+.vlv-toggle-track::after{transform:translateX(18px);background:#fff}

    /* Buttons */
    .vlv-btn{display:inline-flex;align-items:center;gap:5px;padding:9px 16px;border-radius:8px;font-size:${fs}px;font-weight:600;cursor:pointer;border:none;transition:all .2s;font-family:inherit}
    .vlv-btn .vlv-icon{font-size:14px}
    .vlv-btn-sm{padding:7px 12px;font-size:${fs2}px}
    .vlv-btn-accent{background:${s.btnBg};color:${s.btnText}}
    .vlv-btn-accent:hover{background:${s.accentHover}}
    .vlv-btn-ghost{background:transparent;color:${s.btnBorderText};border:1px solid ${s.btnBorderColor}}
    .vlv-btn-ghost:hover{background:${s.btnBorderColor};color:${s.btnText}}

    /* Compare bar */
    .vlv-compare-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:${s.compareBg};border:2px solid ${s.compareBorder};border-radius:10px;padding:10px 16px;margin-bottom:14px}
    .vlv-compare-lbl{color:${s.compareText};font-size:${fs}px;flex:1}

    /* Meta */
    .vlv-results-meta{font-size:${fs2}px;color:${s.cardMetaColor};margin-bottom:14px}

    /* Grid */
    .vlv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;margin-bottom:36px}

    /* Card */
    .vlv-card{background:${s.cardBg};border:1px solid ${s.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 4px 12px ${s.cardShadow};transition:transform .3s,box-shadow .3s,border-color .3s;display:flex;flex-direction:column;position:relative}
    .vlv-card:hover{transform:translateY(-4px);box-shadow:0 10px 26px ${s.cardHoverShadow};border-color:${s.accentColor}}
    .vlv-card.vlv-compare-selected{border-color:${s.accentColor};box-shadow:0 0 0 2px ${s.accentColor}}
    .vlv-card-img-wrap{width:100%;height:200px;overflow:hidden;background:${s.cardBorder};position:relative}
    .vlv-card-img{width:100%;height:100%;object-fit:cover;transition:transform .3s;display:block}
    .vlv-card:hover .vlv-card-img{transform:scale(1.05)}
    .vlv-card-img-placeholder{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:${s.cardMetaColor}}
    .vlv-card-img-placeholder svg{width:52px;height:52px}
    .vlv-badges{position:absolute;top:9px;left:9px;display:flex;gap:5px;flex-wrap:wrap}
    .vlv-badge{padding:3px 8px;border-radius:9px;font-size:${fs3}px;font-weight:700;text-transform:uppercase;letter-spacing:.3px}
    .vlv-badge-new{background:${s.badgeNewBg};color:${s.badgeNewText}}
    .vlv-badge-used{background:${s.badgeUsedBg};color:${s.badgeUsedText}}
    .vlv-badge-rent{background:${s.badgeRentBg};color:${s.badgeRentText}}
    .vlv-badge-auction{background:${s.badgeAuctionBg};color:${s.badgeAuctionText}}
    .vlv-badge-featured{background:${s.badgeFeaturedBg};color:${s.badgeFeaturedText};display:inline-flex;align-items:center;gap:3px}
    .vlv-badge-featured svg{width:9px;height:9px}
    .vlv-badge-sold,.vlv-badge-rented{background:#374151;color:#9ca3af}
    .vlv-compare-cb-wrap{position:absolute;top:9px;right:9px}
    .vlv-compare-cb{width:19px;height:19px;cursor:pointer;accent-color:${s.accentColor}}
    .vlv-card-body{padding:16px;flex:1;display:flex;flex-direction:column;gap:8px}
    .vlv-card-title{font-size:${fs+3}px;font-weight:700;color:${s.cardTitleColor};line-height:1.3}
    .vlv-card-subtitle{font-size:${fs2}px;color:${s.cardMetaColor}}
    .vlv-specs{display:flex;gap:10px;flex-wrap:wrap}
    .vlv-spec{display:inline-flex;align-items:center;gap:3px;font-size:${fs2}px;color:${s.cardBodyColor}}
    .vlv-spec .vlv-icon{color:${s.iconColor};font-size:13px}
    .vlv-spec svg{width:13px;height:13px}
    .vlv-price-row{display:flex;align-items:baseline;gap:7px;margin-top:2px}
    .vlv-price-main{font-size:${fs+7}px;font-weight:800;color:${s.pricePrimaryColor}}
    .vlv-price-orig{font-size:${fs}px;color:${s.priceSecondaryColor};text-decoration:line-through}
    .vlv-price-note{font-size:${fs2}px;color:${s.cardMetaColor}}
    .vlv-card-footer{padding:11px 16px;border-top:1px solid ${s.cardBorder};display:flex;gap:7px}
    .vlv-card-footer .vlv-btn{flex:1;justify-content:center;font-size:${fs2}px;padding:8px 8px}

    /* Empty / Loading */
    .vlv-empty{grid-column:1/-1;text-align:center;padding:70px 20px;color:${s.emptyColor}}
    .vlv-empty-icon{color:${s.cardMetaColor};margin-bottom:14px}
    .vlv-empty-icon svg{width:52px;height:52px}
    .vlv-empty h3{font-size:${fs+5}px;margin-bottom:7px;color:${s.cardBodyColor}}
    .vlv-loading{grid-column:1/-1;text-align:center;padding:70px 20px;color:${s.cardMetaColor}}
    .vlv-spinner{width:42px;height:42px;border:4px solid ${s.cardBorder};border-top-color:${s.accentColor};border-radius:50%;animation:vlv-spin .8s linear infinite;margin:0 auto 14px}
    @keyframes vlv-spin{to{transform:rotate(360deg)}}

    /* Modal */
    .vlv-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:36px 14px;overflow-y:auto}
    .vlv-modal{background:${s.cardBg};border:1px solid ${s.cardBorder};border-radius:14px;width:100%;max-width:1080px;overflow:hidden}
    .vlv-modal-head{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid ${s.cardBorder}}
    .vlv-modal-head h2{color:${s.cardTitleColor};font-size:${fs+4}px}
    .vlv-modal-close{background:none;border:none;color:${s.cardMetaColor};cursor:pointer;padding:4px;border-radius:5px;display:flex;align-items:center}
    .vlv-modal-close .vlv-icon{font-size:19px}
    .vlv-modal-close:hover{color:${s.accentColor}}
    .vlv-modal-body{padding:20px;overflow-x:auto}
    .vlv-cmp-table{width:100%;border-collapse:collapse}
    .vlv-cmp-table th,.vlv-cmp-table td{padding:9px 13px;text-align:left;border-bottom:1px solid ${s.cardBorder};font-size:${fs}px}
    .vlv-cmp-table th{background:${s.filterBg};color:${s.accentColor};font-weight:700;min-width:180px}
    .vlv-cmp-table td{color:${s.cardBodyColor}}
    .vlv-cmp-table tr:nth-child(even) td{background:rgba(255,255,255,.02)}
    .vlv-cmp-img{width:100%;height:120px;object-fit:cover;border-radius:7px;margin-bottom:7px}
    .vlv-cmp-title{font-weight:700;color:${s.cardTitleColor};font-size:${fs}px}

    /* Pagination */
    .vlv-pagination{display:flex;justify-content:center;align-items:center;gap:5px;margin-top:18px;flex-wrap:wrap}
    .vlv-page-btn{display:inline-flex;align-items:center;gap:3px;padding:8px 12px;border:1px solid ${s.paginationBorder};border-radius:7px;background:${s.cardBg};color:${s.paginationText};font-size:${fs}px;font-weight:600;cursor:pointer;transition:all .2s;min-width:38px;justify-content:center;font-family:inherit}
    .vlv-page-btn svg{width:15px;height:15px}
    .vlv-page-btn:hover:not(:disabled){background:${s.paginationHoverBg};border-color:${s.accentColor};color:${s.accentColor}}
    .vlv-page-btn:disabled{opacity:.4;cursor:not-allowed}
    .vlv-page-btn.active{background:${s.paginationActiveBg};border-color:${s.paginationActiveBg};color:${s.paginationActiveText}}
    .vlv-page-info{font-size:${fs}px;color:${s.cardMetaColor}}

    @media(max-width:768px){
      .vlv-wrap{padding:16px 10px}
      .vlv-grid{grid-template-columns:1fr;gap:12px}
      .vlv-toolbar{flex-direction:column}
      .vlv-adv-section{flex:1 1 100%;border-right:none;border-bottom:1px solid ${s.advFilterBorder}}
    }`;
  }

  _updateStyles() { const el = this.shadowRoot.querySelector('style'); if(el) el.textContent = this._css(); }

  _rebuildAdvFilters() {
    const sr = this.shadowRoot;
    const build = (containerId, items, arr, onChange) => {
      const el = sr.getElementById(containerId);
      if (!el) return;
      if (!items.length) { const sec = el.closest('.vlv-adv-section'); if(sec) sec.style.display='none'; return; }
      el.innerHTML = items.map(val=>`<label class="vlv-check-item"><input type="checkbox" data-val="${this._esc(val)}" ${arr.includes(val)?'checked':''}/><span>${this._esc(val)}</span></label>`).join('');
      el.querySelectorAll('input').forEach(cb => {
        cb.addEventListener('change', () => {
          const v = cb.dataset.val;
          if (cb.checked) { if(!arr.includes(v)) arr.push(v); } else { const i=arr.indexOf(v); if(i>-1) arr.splice(i,1); }
          onChange();
        });
      });
    };
    const trig = () => { this._renderListings(); this._updateAdvBadge(); };
    build('vlvMakeChecks',       this._meta.makes,         this._filterMakes,         trig);
    build('vlvBodyStyleChecks',  this._meta.bodyStyles,     this._filterBodyStyles,    trig);
    build('vlvFuelTypeChecks',   this._meta.fuelTypes,      this._filterFuelTypes,     trig);
    build('vlvTransChecks',      this._meta.transmissions,  this._filterTransmissions, trig);
    build('vlvDrivetrainChecks', this._meta.drivetrains,    this._filterDrivetrains,   trig);
    build('vlvColorChecks',      this._meta.colors,         this._filterColors,        trig);
    this._syncRangeSliders();
    this._syncFilterVisibility();
  }

  _syncRangeSliders() {
    const sr = this.shadowRoot;
    const setup = (minId, maxId, fillId, minV, maxV, minBound, maxBound, lblMinId, lblMaxId, fmtMin, fmtMax) => {
      const minEl=sr.getElementById(minId), maxEl=maxId?sr.getElementById(maxId):null;
      const fillEl=sr.getElementById(fillId);
      const lblMin=lblMinId?sr.getElementById(lblMinId):null, lblMax=lblMaxId?sr.getElementById(lblMaxId):null;
      if (!minEl) return;
      minEl.min=minBound; minEl.max=maxBound; minEl.value=minV;
      if (maxEl) { maxEl.min=minBound; maxEl.max=maxBound; maxEl.value=maxV; }
      const update = () => {
        const lo=parseInt(minEl.value), hi=maxEl?parseInt(maxEl.value):maxBound;
        const range=maxBound-minBound;
        if(fillEl) { fillEl.style.left=((lo-minBound)/range*100)+'%'; fillEl.style.width=(maxEl?((hi-lo)/range*100):(lo/maxBound*100))+'%'; }
        if(lblMin) lblMin.textContent=fmtMin(lo);
        if(lblMax) lblMax.textContent=fmtMax(maxEl?hi:lo);
      };
      update();
      minEl.addEventListener('input', ()=>{ update(); this._readRanges(); });
      if (maxEl) maxEl.addEventListener('input', ()=>{ update(); this._readRanges(); });
    };
    setup('vlvPriceMin','vlvPriceMax','vlvPriceFill',this._priceMin,this._priceMax,this._priceRangeMin,this._priceRangeMax,'vlvPriceMinLbl','vlvPriceMaxLbl',v=>'$'+Number(v).toLocaleString(),v=>'$'+Number(v).toLocaleString());
    setup('vlvYearMin','vlvYearMax','vlvYearFill',this._yearMin,this._yearMax,this._yearRangeMin,this._yearRangeMax,'vlvYearMinLbl','vlvYearMaxLbl',v=>String(v),v=>String(v));
    setup('vlvMileageMax',null,'vlvMileageFill',0,this._mileageMax,0,this._mileageRangeMax,null,'vlvMileageMaxLbl',v=>v,v=>Number(v).toLocaleString()+' mi');
  }

  _syncFilterVisibility() {
    const sr = this.shadowRoot;
    const vf = this._visibleFilters;
    const MAP = {vehicleType:'vlvRowVehicleType',listingType:'vlvRowListingType',status:'vlvRowStatus',priceRange:'vlvAdvPriceRange',yearRange:'vlvAdvYearRange',mileageRange:'vlvAdvMileageRange',make:'vlvAdvMake',bodyStyle:'vlvAdvBodyStyle',fuelType:'vlvAdvFuelType',transmission:'vlvAdvTransmission',drivetrain:'vlvAdvDrivetrain',exteriorColor:'vlvAdvExteriorColor',featured:'vlvAdvFeatured'};
    Object.entries(MAP).forEach(([key,id]) => { const el=sr.getElementById(id); if(el) el.style.display=vf.has(key)?'':'none'; });
  }

  _bindControls() {
    const sr = this.shadowRoot;
    let timer;
    sr.getElementById('vlvSearch').addEventListener('input', e => {
      clearTimeout(timer);
      timer = setTimeout(()=>{ this._searchQuery=e.target.value.toLowerCase().trim(); this._renderListings(); }, 280);
    });
    sr.getElementById('vlvSort').addEventListener('change', e => { this._sortBy=e.target.value; this._renderListings(); });
    const advBtn=sr.getElementById('vlvAdvToggle'), advPanel=sr.getElementById('vlvAdvPanel');
    advBtn.addEventListener('click', ()=>{
      this._advOpen=!this._advOpen;
      advPanel.classList.toggle('open',this._advOpen);
      advBtn.classList.toggle('open',this._advOpen);
    });
    const bindPills=(gid,setter)=>{
      sr.getElementById(gid)?.addEventListener('click', e => {
        const btn=e.target.closest('.vlv-pill'); if(!btn) return;
        sr.querySelectorAll('#'+gid+' .vlv-pill').forEach(p=>p.classList.remove('active'));
        btn.classList.add('active'); setter(btn.dataset.val); this._renderListings();
      });
    };
    bindPills('vlvVehicleTypeFilter', v=>{ this._filterVehicleType=v; });
    bindPills('vlvListingTypeFilter', v=>{ this._filterListingType=v; });
    bindPills('vlvStatusFilter',       v=>{ this._filterStatus=v; });
    sr.getElementById('vlvFeaturedCb')?.addEventListener('change', e=>{ this._filterFeatured=e.target.checked; this._renderListings(); this._updateAdvBadge(); });
    sr.getElementById('vlvResetFilters')?.addEventListener('click', ()=>this._resetAll());
    sr.getElementById('vlvCompareBtn')?.addEventListener('click', ()=>this._showCompareModal());
    sr.getElementById('vlvCompareClear')?.addEventListener('click', ()=>{
      this._compareIds=[];
      this._updateCompareBar();
      sr.querySelectorAll('.vlv-compare-cb').forEach(cb=>{ cb.checked=false; });
      sr.querySelectorAll('.vlv-card').forEach(c=>c.classList.remove('vlv-compare-selected'));
    });
    sr.getElementById('vlvModalClose')?.addEventListener('click', ()=>{ sr.getElementById('vlvCompareModal').style.display='none'; });
  }

  _readRanges() {
    const sr=this.shadowRoot;
    const v=id=>parseFloat(sr.getElementById(id)?.value||0);
    this._priceMin=v('vlvPriceMin'); this._priceMax=v('vlvPriceMax');
    this._yearMin=v('vlvYearMin');   this._yearMax=v('vlvYearMax');
    this._mileageMax=v('vlvMileageMax');
    this._renderListings();
  }

  _resetAll() {
    const sr=this.shadowRoot;
    ['vlvVehicleTypeFilter','vlvListingTypeFilter','vlvStatusFilter'].forEach(id=>{
      sr.querySelectorAll('#'+id+' .vlv-pill').forEach((p,i)=>p.classList.toggle('active',i===0));
    });
    this._filterVehicleType='all'; this._filterListingType='all'; this._filterStatus='all';
    this._searchQuery=''; const si=sr.getElementById('vlvSearch'); if(si) si.value='';
    this._filterMakes=[]; this._filterBodyStyles=[]; this._filterFuelTypes=[];
    this._filterTransmissions=[]; this._filterDrivetrains=[]; this._filterColors=[];
    this._filterFeatured=false;
    sr.querySelectorAll('.vlv-check-item input').forEach(cb=>{cb.checked=false;});
    const fc=sr.getElementById('vlvFeaturedCb'); if(fc) fc.checked=false;
    this._priceMin=this._priceRangeMin; this._priceMax=this._priceRangeMax;
    this._yearMin=this._yearRangeMin;   this._yearMax=this._yearRangeMax;
    this._mileageMax=this._mileageRangeMax;
    this._syncRangeSliders();
    this._renderListings(); this._updateAdvBadge();
  }

  _updateAdvBadge() {
    const n=this._filterMakes.length+this._filterBodyStyles.length+this._filterFuelTypes.length+this._filterTransmissions.length+this._filterDrivetrains.length+this._filterColors.length+(this._filterFeatured?1:0);
    const b=this.shadowRoot.getElementById('vlvAdvBadge');
    if(b){ b.style.display=n>0?'flex':'none'; b.textContent=n; }
  }

  _getFilteredSorted() {
    let list=[...this._listings];
    if(this._searchQuery) list=list.filter(v=>[v.make,v.model,v.trim,v.year,v.vin,v.stockNumber,v.title].join(' ').toLowerCase().includes(this._searchQuery));
    if(this._filterVehicleType!=='all') list=list.filter(v=>v.vehicleType===this._filterVehicleType);
    if(this._filterListingType!=='all') list=list.filter(v=>v.listingType===this._filterListingType);
    if(this._filterStatus!=='all')      list=list.filter(v=>v.status===this._filterStatus);
    list=list.filter(v=>{ const p=v.salePrice||v.price||0; return p>=this._priceMin&&p<=this._priceMax; });
    list=list.filter(v=>!v.year||(v.year>=this._yearMin&&v.year<=this._yearMax));
    list=list.filter(v=>!v.mileage||v.mileage<=this._mileageMax);
    if(this._filterMakes.length)         list=list.filter(v=>this._filterMakes.includes(v.make));
    if(this._filterBodyStyles.length)     list=list.filter(v=>this._filterBodyStyles.includes(v.bodyStyle));
    if(this._filterFuelTypes.length)      list=list.filter(v=>this._filterFuelTypes.includes(v.fuelType));
    if(this._filterTransmissions.length)  list=list.filter(v=>this._filterTransmissions.includes(v.transmission));
    if(this._filterDrivetrains.length)    list=list.filter(v=>this._filterDrivetrains.includes(v.drivetrain));
    if(this._filterColors.length)         list=list.filter(v=>this._filterColors.includes(v.exteriorColor));
    if(this._filterFeatured)              list=list.filter(v=>v.featured);
    list.sort((a,b)=>{
      switch(this._sortBy){
        case'price-asc':  return(a.price||0)-(b.price||0);
        case'price-desc': return(b.price||0)-(a.price||0);
        case'year-desc':  return(b.year||0)-(a.year||0);
        case'year-asc':   return(a.year||0)-(b.year||0);
        case'mileage-asc':return(a.mileage||0)-(b.mileage||0);
        case'oldest':     return new Date(a._createdDate)-new Date(b._createdDate);
        default:          return new Date(b._createdDate)-new Date(a._createdDate);
      }
    });
    return list;
  }

  _renderListings() {
    const grid=this.shadowRoot.getElementById('vlvGrid');
    const meta=this.shadowRoot.getElementById('vlvResultsMeta');
    const filtered=this._getFilteredSorted();
    meta.textContent=`Showing ${filtered.length} listing${filtered.length!==1?'s':''}`;
    if(!filtered.length){
      grid.innerHTML=`<div class="vlv-empty"><div class="vlv-empty-icon">${ICONS.empty}</div><h3>No listings found</h3><p>Try adjusting your filters or search terms.</p></div>`;
      this._renderPagination(); return;
    }
    grid.innerHTML=filtered.map((v,i)=>this._cardHTML(v,i)).join('');
    grid.querySelectorAll('.vlv-read-btn').forEach(btn=>btn.addEventListener('click',()=>this._navigate(btn.dataset.slug)));
    grid.querySelectorAll('.vlv-compare-cb').forEach(cb=>{
      cb.addEventListener('change',()=>{
        const id=cb.dataset.id;
        if(cb.checked){
          if(this._compareIds.length>=4){cb.checked=false;return;}
          this._compareIds.push(id); cb.closest('.vlv-card').classList.add('vlv-compare-selected');
        } else {
          this._compareIds=this._compareIds.filter(i=>i!==id);
          cb.closest('.vlv-card').classList.remove('vlv-compare-selected');
        }
        this._updateCompareBar();
      });
    });
    this._renderPagination();
  }

  _cardHTML(v,idx){
    const title=v.title||`${v.year||''} ${v.make||''} ${v.model||''}`.trim()||'Vehicle';
    const imgUrl=this._imgUrl(v.primaryImage,680,440);
    const eager=idx<6;
    const price=this._fmtPrice(v.price,v.salePrice,v.currency,v.listingType,v.rentalPricePerDay,v.auctionStartPrice);
    const listBadge=this._listingBadge(v.listingType);
    const statusBadge=(v.status==='sold'||v.status==='rented')?`<span class="vlv-badge vlv-badge-${v.status}">${v.status}</span>`:'';
    const featBadge=v.featured?`<span class="vlv-badge vlv-badge-featured"><span class="vlv-icon" style="font-size:9px">${ICONS.star}</span>Featured</span>`:'';
    const imgEl=imgUrl?`<img class="vlv-card-img" src="${imgUrl}" alt="${this._esc(title)}" width="340" height="200" loading="${eager?'eager':'lazy'}" decoding="${eager?'sync':'async'}" onerror="this.style.display='none'"/>`:`<div class="vlv-card-img-placeholder">${ICONS.car}</div>`;
    const specMileage=v.mileage?`<span class="vlv-spec"><span class="vlv-icon">${ICONS.gauge}</span>${Number(v.mileage).toLocaleString()} mi</span>`:'';
    const specFuel=v.fuelType?`<span class="vlv-spec"><span class="vlv-icon">${ICONS.fuel}</span>${v.fuelType}</span>`:'';
    const specTrans=v.transmission?`<span class="vlv-spec"><span class="vlv-icon">${ICONS.gear}</span>${v.transmission}</span>`:'';
    const specColor=v.exteriorColor?`<span class="vlv-spec"><span class="vlv-icon">${ICONS.palette}</span>${v.exteriorColor}</span>`:'';
    return `<article class="vlv-card" data-id="${v._id}">
      <div class="vlv-card-img-wrap">${imgEl}<div class="vlv-badges">${listBadge}${statusBadge}${featBadge}</div><div class="vlv-compare-cb-wrap"><input type="checkbox" class="vlv-compare-cb" data-id="${v._id}" ${this._compareIds.includes(v._id)?'checked':''}/></div></div>
      <div class="vlv-card-body">
        <div class="vlv-card-title">${this._esc(title)}</div>
        <div class="vlv-card-subtitle">${[v.bodyStyle,v.drivetrain,v.engine].filter(Boolean).join(' · ')}</div>
        <div class="vlv-specs">${specMileage}${specFuel}${specTrans}${specColor}</div>
        <div class="vlv-price-row">${price}</div>
      </div>
      <div class="vlv-card-footer"><button class="vlv-btn vlv-btn-accent vlv-read-btn" data-slug="${v.slug}">View Details <span class="vlv-icon">${ICONS.arrowRight}</span></button></div>
    </article>`;
  }

  _listingBadge(type){
    const map={new:['new','New'],used:['used','Used'],rent:['rent','Rent/Lease'],auction:['auction','Auction']};
    const[cls,label]=map[type]||['used',type||'Used'];
    return `<span class="vlv-badge vlv-badge-${cls}">${label}</span>`;
  }

  _fmtPrice(price,salePrice,currency,listingType,rentalPerDay,auctionStart){
    const sym=currency==='INR'?'₹':currency==='EUR'?'€':currency==='GBP'?'£':'$';
    const fmt=n=>sym+Number(n).toLocaleString();
    if(listingType==='rent'&&rentalPerDay) return`<span class="vlv-price-main">${fmt(rentalPerDay)}<small style="font-weight:500">/day</small></span>`;
    if(listingType==='auction'&&auctionStart) return`<span class="vlv-price-main">From ${fmt(auctionStart)}</span><span class="vlv-price-note">Auction</span>`;
    if(salePrice&&salePrice<price) return`<span class="vlv-price-main">${fmt(salePrice)}</span><span class="vlv-price-orig">${fmt(price)}</span>`;
    if(price) return`<span class="vlv-price-main">${fmt(price)}</span>`;
    return`<span class="vlv-price-note">Price on request</span>`;
  }

  _showCompareModal(){
    const vehicles=this._listings.filter(v=>this._compareIds.includes(v._id));
    if(vehicles.length<2) return;
    const fields=[['Year',v=>v.year||'—'],['Make',v=>v.make||'—'],['Model',v=>v.model||'—'],['Trim',v=>v.trim||'—'],['Body Style',v=>v.bodyStyle||'—'],['Mileage',v=>v.mileage?Number(v.mileage).toLocaleString()+' mi':'—'],['Engine',v=>v.engine||'—'],['Transmission',v=>v.transmission||'—'],['Drivetrain',v=>v.drivetrain||'—'],['Fuel Type',v=>v.fuelType||'—'],['MPG City',v=>v.mpgCity?v.mpgCity+' mpg':'—'],['MPG Hwy',v=>v.mpgHighway?v.mpgHighway+' mpg':'—'],['Ext Color',v=>v.exteriorColor||'—'],['Int Color',v=>v.interiorColor||'—'],['Seating',v=>v.seatingCapacity?v.seatingCapacity+' seats':'—'],['Price',v=>(v.salePrice||v.price)?'$'+Number(v.salePrice||v.price).toLocaleString():'—'],['VIN',v=>v.vin||'—'],['Stock #',v=>v.stockNumber||'—'],['Condition',v=>v.condition||'—'],['Warranty',v=>v.warrantyType||'—']];
    const headers=vehicles.map(v=>{const img=this._imgUrl(v.primaryImage,400,240);const t=v.title||`${v.year} ${v.make} ${v.model}`;return`<th>${img?`<img class="vlv-cmp-img" src="${img}" alt="${this._esc(t)}" loading="lazy"/>`:''}<div class="vlv-cmp-title">${this._esc(t)}</div></th>`;}).join('');
    const rows=fields.map(([lbl,fn])=>`<tr><th>${lbl}</th>${vehicles.map(v=>`<td>${this._esc(String(fn(v)))}</td>`).join('')}</tr>`).join('');
    this.shadowRoot.getElementById('vlvCompareTable').innerHTML=`<table class="vlv-cmp-table"><thead><tr><th>Spec</th>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    this.shadowRoot.getElementById('vlvCompareModal').style.display='flex';
  }

  _updateCompareBar(){
    const bar=this.shadowRoot.getElementById('vlvCompareBar');
    const cnt=this.shadowRoot.getElementById('vlvCompareCount');
    if(cnt) cnt.textContent=this._compareIds.length;
    if(bar) bar.style.display=this._compareIds.length>=2?'flex':'none';
  }

  _renderPagination(){
    const pag=this.shadowRoot.getElementById('vlvPagination');
    if(this._totalPages<=1){pag.innerHTML='';return;}
    const maxV=5;
    let start=Math.max(1,this._currentPage-2),end=Math.min(this._totalPages,start+maxV-1);
    if(end-start<maxV-1) start=Math.max(1,end-maxV+1);
    let html=`<button class="vlv-page-btn" id="vlvPrevBtn" ${this._currentPage===1?'disabled':''}>${ICONS.chevLeft}</button>`;
    if(start>1){html+=`<button class="vlv-page-btn" data-page="1">1</button>`;if(start>2)html+=`<span class="vlv-page-info">…</span>`;}
    for(let i=start;i<=end;i++) html+=`<button class="vlv-page-btn ${i===this._currentPage?'active':''}" data-page="${i}">${i}</button>`;
    if(end<this._totalPages){if(end<this._totalPages-1)html+=`<span class="vlv-page-info">…</span>`;html+=`<button class="vlv-page-btn" data-page="${this._totalPages}">${this._totalPages}</button>`;}
    html+=`<button class="vlv-page-btn" id="vlvNextBtn" ${this._currentPage===this._totalPages?'disabled':''}>${ICONS.chevRight}</button>`;
    pag.innerHTML=html;
    pag.querySelector('#vlvPrevBtn')?.addEventListener('click',()=>{if(this._currentPage>1)this._changePage(this._currentPage-1);});
    pag.querySelector('#vlvNextBtn')?.addEventListener('click',()=>{if(this._currentPage<this._totalPages)this._changePage(this._currentPage+1);});
    pag.querySelectorAll('.vlv-page-btn[data-page]').forEach(btn=>btn.addEventListener('click',()=>this._changePage(parseInt(btn.dataset.page))));
  }

  _changePage(page){this.dispatchEvent(new CustomEvent('page-change',{detail:{page},bubbles:true,composed:true}));}
  _navigate(slug){this.dispatchEvent(new CustomEvent('navigate-to-listing',{detail:{slug},bubbles:true,composed:true}));}

  _imgUrl(raw,w=400,h=240){
    if(!raw||typeof raw!=='string') return'';
    if(raw.startsWith('https://static.wixstatic.com/media/')){
      try{const fn=raw.split('/media/')[1]?.split('/')[0];if(!fn)return raw;return`https://static.wixstatic.com/media/${fn}/v1/fill/w_${w},h_${h},al_c,q_80,enc_avif,quality_auto/${fn}`;}catch(e){return raw;}
    }
    if(raw.startsWith('http://')||raw.startsWith('https://')) return raw;
    if(raw.startsWith('wix:image://')){
      try{const fid=raw.split('/')[3]?.split('#')[0];if(!fid)return'';let fn=fid.includes('~mv2')?fid:`${fid}~mv2.jpg`;if(!fn.includes('.'))fn+='.jpg';return`https://static.wixstatic.com/media/${fn}/v1/fill/w_${w},h_${h},al_c,q_80,enc_avif,quality_auto/${fn}`;}catch(e){return'';}
    }
    return'';
  }

  _esc(t){if(!t)return'';const d=document.createElement('div');d.textContent=t;return d.innerHTML;}
}

customElements.define('vehicle-list-viewer', VehicleListViewer);
