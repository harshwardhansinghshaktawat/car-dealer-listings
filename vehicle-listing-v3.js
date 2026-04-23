/**
 * CUSTOM ELEMENT — Vehicle Listing List Page
 * Tag: <vehicle-list-viewer>
 *
 * Attributes (set by widget):
 *   listing-list  — JSON { listings[], postsPerPage }
 *                   NOTE: ALL listings are sent. This element handles
 *                   filtering, sorting, search, AND pagination entirely
 *                   client-side. The widget no longer slices the array.
 *
 *   style-props   — JSON tokens incl. fontSize (px number) and visibleFilters
 *
 * Events dispatched:
 *   navigate-to-listing  — { slug }
 */

// ─── SVG icons ───────────────────────────────────────────────────────────────
const IC = {
  search:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
  sliders:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`,
  close:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  chevL:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  chevR:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  car:        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v9a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>`,
  gauge:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1 0 10 10"/><path d="m12 12-4-4"/><circle cx="12" cy="12" r="2"/></svg>`,
  fuel:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 22V8l6-6h6l2 2v4h2a1 1 0 0 1 1 1v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`,
  gear:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  palette:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125C12.888 18.78 12.74 18.416 12.74 17.943A1.64 1.64 0 0 1 14.408 16.274h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>`,
  star:       `<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
  arrowR:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
  compare:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>`,
  reset:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>`,
  noResults:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
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

    // ── All listings (full set, never sliced) ──
    this._allListings = [];

    // ── Pagination state ──
    this._currentPage = 1;
    this._perPage = 9;

    // ── Compare ──
    this._compareIds = [];
    this._advOpen = false;

    // ── Quick filters ──
    this._filterVehicleType = 'all';
    this._filterListingType = 'all';
    this._filterStatus      = 'all';
    this._sortBy            = 'newest';
    this._searchQuery       = '';

    // ── Range filter STATE (what the user has set) ──
    // These are only updated when the user moves a slider.
    // They are NEVER reset by incoming data after initial load.
    this._priceMin   = null;  // null = not yet initialised
    this._priceMax   = null;
    this._yearMin    = null;
    this._yearMax    = null;
    this._mileageMax = null;

    // ── Range BOUNDS (derived from data, used to set slider min/max) ──
    this._priceRangeMin   = 0;
    this._priceRangeMax   = 500000;
    this._yearRangeMin    = 1990;
    this._yearRangeMax    = new Date().getFullYear() + 1;
    this._mileageRangeMax = 300000;

    // ── Checkbox filters ──
    this._filterMakes         = [];
    this._filterBodyStyles    = [];
    this._filterFuelTypes     = [];
    this._filterTransmissions = [];
    this._filterDrivetrains   = [];
    this._filterColors        = [];
    this._filterFeatured      = false;

    // ── Derived option lists ──
    this._meta = { makes:[], bodyStyles:[], fuelTypes:[], transmissions:[], drivetrains:[], colors:[] };

    // ── Visible filter sections ──
    this._visibleFilters = new Set(ALL_FILTER_KEYS);

    const raw = this.getAttribute('style-props');
    this.styleProps = raw ? JSON.parse(raw) : this._defaults();
    this._initUI();
  }

  static get observedAttributes() { return ['listing-list', 'style-props']; }

  _defaults() {
    return {
      fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif',
      fontSize: 14,
      bgColor: '#0f1117', accentColor: '#f97316', accentHover: '#ea580c',
      cardBg: '#1a1d27', cardBorder: '#2a2d3a',
      cardShadow: 'rgba(0,0,0,0.4)', cardHoverShadow: 'rgba(249,115,22,0.2)',
      cardTitleColor: '#ffffff', cardBodyColor: '#94a3b8', cardMetaColor: '#64748b',
      pricePrimaryColor: '#f97316', priceSecondaryColor: '#94a3b8',
      badgeNewBg: '#166534', badgeNewText: '#bbf7d0',
      badgeUsedBg: '#1e3a5f', badgeUsedText: '#93c5fd',
      badgeRentBg: '#4c1d95', badgeRentText: '#ddd6fe',
      badgeAuctionBg: '#7c2d12', badgeAuctionText: '#fed7aa',
      badgeFeaturedBg: '#f97316', badgeFeaturedText: '#ffffff',
      filterBg: '#1a1d27', filterBorder: '#2a2d3a',
      filterText: '#94a3b8', filterActiveBg: '#f97316', filterActiveText: '#ffffff',
      btnBg: '#f97316', btnText: '#ffffff',
      btnBorderColor: '#f97316', btnBorderText: '#f97316',
      paginationBorder: '#2a2d3a', paginationText: '#94a3b8',
      paginationActiveBg: '#f97316', paginationActiveText: '#ffffff',
      paginationHoverBg: '#1e2133',
      searchBg: '#1a1d27', searchBorder: '#2a2d3a',
      searchText: '#ffffff', searchPlaceholder: '#64748b',
      compareBg: '#1a1d27', compareBorder: '#f97316', compareText: '#ffffff',
      advFilterBg: '#141720', advFilterBorder: '#2a2d3a',
      sliderAccent: '#f97316', rangeValueColor: '#f97316',
      checkboxAccent: '#f97316', iconColor: '#64748b',
      emptyColor: '#64748b',
      visibleFilters: 'all',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // attributeChangedCallback
  //
  // FIX (Bug 6 — root cause of all filter/search failures):
  //   The widget now sends ALL listings in one go. This element owns all
  //   filtering, sorting, search, and pagination entirely client-side.
  //   We never re-slice from the widget side.
  //
  // FIX (Bug 1 — range filters wiped on page change):
  //   Range bounds (_priceRangeMin etc.) are updated from data only on the
  //   first load (when _priceMin is still null). After that, incoming
  //   listing-list changes never reset active filter values.
  // ─────────────────────────────────────────────────────────────────────────
  attributeChangedCallback(name, oldVal, newVal) {
    if (!newVal || oldVal === newVal) return;

    if (name === 'listing-list') {
      try {
        const d = JSON.parse(newVal);
        this._allListings = d.listings || [];
        this._perPage     = d.postsPerPage || 9;

        // Only reset perPage; never reset currentPage or filter state here
        // so that widget prop changes (postsPerPage) don't wipe the user's
        // filter selections.

        this._buildMeta();

        // ── FIX Bug 1: only initialise range values on first data load ──
        const firstLoad = this._priceMin === null;
        this._computeRangeBounds();
        if (firstLoad) {
          this._priceMin   = this._priceRangeMin;
          this._priceMax   = this._priceRangeMax;
          this._yearMin    = this._yearRangeMin;
          this._yearMax    = this._yearRangeMax;
          this._mileageMax = this._mileageRangeMax;
        }

        // Reset to page 1 only on a fresh data load (different listings set)
        if (firstLoad) this._currentPage = 1;

        requestAnimationFrame(() => {
          this._rebuildAdvFilters();
          this._renderListings();
        });
      } catch (e) { console.error('vlv listing-list parse:', e.message); }

    } else if (name === 'style-props') {
      try {
        const inc = JSON.parse(newVal);
        this.styleProps = { ...this.styleProps, ...inc };
        const vf = inc.visibleFilters;
        this._visibleFilters = (vf && vf !== 'all')
          ? new Set(vf.split(',').map(s => s.trim()))
          : new Set(ALL_FILTER_KEYS);
        if (this._ready) { this._updateStyles(); this._syncFilterVisibility(); }
      } catch (e) { console.error('vlv style-props parse:', e.message); }
    }
  }

  _initUI() {
    this.shadowRoot.innerHTML = `<style>${this._css()}</style>${this._shell()}`;
    this._ready = true;
    this._bindControls();
  }

  // ── Compute unique option lists from the full dataset ─────────────────────
  _buildMeta() {
    const uniq = arr => [...new Set(arr.filter(Boolean))].sort();
    this._meta = {
      makes:         uniq(this._allListings.map(v => v.make)),
      bodyStyles:    uniq(this._allListings.map(v => v.bodyStyle)),
      fuelTypes:     uniq(this._allListings.map(v => v.fuelType)),
      transmissions: uniq(this._allListings.map(v => v.transmission)),
      drivetrains:   uniq(this._allListings.map(v => v.drivetrain)),
      colors:        uniq(this._allListings.map(v => v.exteriorColor)),
    };
  }

  // ── Compute range bounds (min/max) from data only — never touch active values ──
  _computeRangeBounds() {
    const prices   = this._allListings.map(v => v.salePrice || v.price || 0).filter(n => n > 0);
    const years    = this._allListings.map(v => v.year  || 0).filter(n => n > 0);
    const mileages = this._allListings.map(v => v.mileage || 0).filter(n => n > 0);

    this._priceRangeMin   = prices.length   ? Math.min(...prices)   : 0;
    this._priceRangeMax   = prices.length   ? Math.max(...prices)   : 500000;
    this._yearRangeMin    = years.length    ? Math.min(...years)    : 1990;
    this._yearRangeMax    = years.length    ? Math.max(...years)    : new Date().getFullYear() + 1;
    this._mileageRangeMax = mileages.length ? Math.max(...mileages) : 300000;
  }

  // ── Shell HTML ─────────────────────────────────────────────────────────────
  _shell() {
    return `<div class="vlv-wrap">

      <!-- Toolbar -->
      <div class="vlv-toolbar">
        <div class="vlv-search-wrap">
          <span class="ic vlv-search-icon">${IC.search}</span>
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
          <span class="ic">${IC.sliders}</span><span>Filters</span>
          <span class="vlv-adv-badge" id="vlvAdvBadge" style="display:none"></span>
        </button>
      </div>

      <!-- Quick-pill filters -->
      <div class="vlv-quick" id="vlvQuick">
        <div class="vlv-frow" id="vlvRowVehicleType">
          <span class="vlv-flbl">Type</span>
          <div class="vlv-pills" id="vlvPillsVehicleType">
            <button class="vlv-pill active" data-val="all">All</button>
            <button class="vlv-pill" data-val="car"><span class="ic" style="font-size:13px">${IC.car}</span>Cars</button>
            <button class="vlv-pill" data-val="motorcycle">Motorcycles</button>
            <button class="vlv-pill" data-val="rv">RVs</button>
            <button class="vlv-pill" data-val="truck">Trucks</button>
            <button class="vlv-pill" data-val="van">Vans</button>
            <button class="vlv-pill" data-val="boat">Boats</button>
          </div>
        </div>
        <div class="vlv-frow" id="vlvRowListingType">
          <span class="vlv-flbl">Listing</span>
          <div class="vlv-pills" id="vlvPillsListingType">
            <button class="vlv-pill active" data-val="all">All</button>
            <button class="vlv-pill" data-val="new">New</button>
            <button class="vlv-pill" data-val="used">Used</button>
            <button class="vlv-pill" data-val="rent">Rent / Lease</button>
            <button class="vlv-pill" data-val="auction">Auction</button>
          </div>
        </div>
        <div class="vlv-frow" id="vlvRowStatus">
          <span class="vlv-flbl">Status</span>
          <div class="vlv-pills" id="vlvPillsStatus">
            <button class="vlv-pill active" data-val="all">All</button>
            <button class="vlv-pill" data-val="active">Active</button>
            <button class="vlv-pill" data-val="sold">Sold</button>
            <button class="vlv-pill" data-val="rented">Rented</button>
          </div>
        </div>
      </div>

      <!-- Advanced filter panel -->
      <div class="vlv-adv" id="vlvAdv">

        <div class="vlv-adv-sec" id="vlvAdvPriceRange">
          <div class="vlv-adv-ttl">Price Range</div>
          <div class="vlv-rlbls"><span id="vlvPriceMinLbl">$0</span><span id="vlvPriceMaxLbl">$500,000</span></div>
          <div class="vlv-drange">
            <div class="vlv-rtrack"><div class="vlv-rfill" id="vlvPriceFill"></div></div>
            <input type="range" class="vlv-range" id="vlvPriceMin" min="0" max="500000" value="0" step="1000"/>
            <input type="range" class="vlv-range vlv-rhi" id="vlvPriceMax" min="0" max="500000" value="500000" step="1000"/>
          </div>
        </div>

        <div class="vlv-adv-sec" id="vlvAdvYearRange">
          <div class="vlv-adv-ttl">Year</div>
          <div class="vlv-rlbls"><span id="vlvYearMinLbl">1990</span><span id="vlvYearMaxLbl">2026</span></div>
          <div class="vlv-drange">
            <div class="vlv-rtrack"><div class="vlv-rfill" id="vlvYearFill"></div></div>
            <input type="range" class="vlv-range" id="vlvYearMin" min="1900" max="2030" value="1990" step="1"/>
            <input type="range" class="vlv-range vlv-rhi" id="vlvYearMax" min="1900" max="2030" value="2030" step="1"/>
          </div>
        </div>

        <div class="vlv-adv-sec" id="vlvAdvMileageRange">
          <div class="vlv-adv-ttl">Max Mileage</div>
          <div class="vlv-rlbls"><span>0 mi</span><span id="vlvMileageLbl">300,000 mi</span></div>
          <div class="vlv-srange">
            <div class="vlv-rtrack"><div class="vlv-rfill" id="vlvMileageFill"></div></div>
            <input type="range" class="vlv-range" id="vlvMileageMax" min="0" max="300000" value="300000" step="5000"/>
          </div>
        </div>

        <div class="vlv-adv-sec" id="vlvAdvMake">
          <div class="vlv-adv-ttl">Make</div>
          <div class="vlv-checks" id="vlvMakeChecks"></div>
        </div>

        <div class="vlv-adv-sec" id="vlvAdvBodyStyle">
          <div class="vlv-adv-ttl">Body Style</div>
          <div class="vlv-checks" id="vlvBodyChecks"></div>
        </div>

        <div class="vlv-adv-sec" id="vlvAdvFuelType">
          <div class="vlv-adv-ttl">Fuel Type</div>
          <div class="vlv-checks" id="vlvFuelChecks"></div>
        </div>

        <div class="vlv-adv-sec" id="vlvAdvTransmission">
          <div class="vlv-adv-ttl">Transmission</div>
          <div class="vlv-checks" id="vlvTransChecks"></div>
        </div>

        <div class="vlv-adv-sec" id="vlvAdvDrivetrain">
          <div class="vlv-adv-ttl">Drivetrain</div>
          <div class="vlv-checks" id="vlvDriveChecks"></div>
        </div>

        <div class="vlv-adv-sec" id="vlvAdvExteriorColor">
          <div class="vlv-adv-ttl">Exterior Color</div>
          <div class="vlv-checks" id="vlvColorChecks"></div>
        </div>

        <div class="vlv-adv-sec vlv-adv-inline" id="vlvAdvFeatured">
          <label class="vlv-toggle-lbl">
            <input type="checkbox" id="vlvFeaturedCb" class="vlv-toggle-cb"/>
            <span class="vlv-toggle-track"></span>
            <span>Featured listings only</span>
          </label>
        </div>

        <div class="vlv-adv-footer">
          <button class="vlv-btn vlv-btn-ghost vlv-btn-sm" id="vlvReset">
            <span class="ic">${IC.reset}</span>Reset all filters
          </button>
        </div>
      </div>

      <!-- Compare bar -->
      <div class="vlv-cmpbar" id="vlvCmpBar" style="display:none">
        <span class="ic vlv-cmpbar-icon">${IC.compare}</span>
        <span class="vlv-cmpbar-lbl">Compare: <strong id="vlvCmpCount">0</strong> selected</span>
        <button class="vlv-btn vlv-btn-accent vlv-btn-sm" id="vlvCmpBtn">Compare Now</button>
        <button class="vlv-btn vlv-btn-ghost vlv-btn-sm" id="vlvCmpClear"><span class="ic">${IC.close}</span>Clear</button>
      </div>

      <!-- Results meta -->
      <div class="vlv-meta" id="vlvMeta"></div>

      <!-- Grid -->
      <div class="vlv-grid" id="vlvGrid">
        <div class="vlv-loading"><div class="vlv-spin"></div><p>Loading listings…</p></div>
      </div>

      <!-- Compare modal -->
      <div class="vlv-modal-ov" id="vlvModal" style="display:none">
        <div class="vlv-modal">
          <div class="vlv-modal-head">
            <h2>Vehicle Comparison</h2>
            <button class="vlv-modal-close" id="vlvModalClose"><span class="ic">${IC.close}</span></button>
          </div>
          <div class="vlv-modal-body" id="vlvCmpTable"></div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="vlv-pag" id="vlvPag"></div>
    </div>`;
  }

  // ── CSS ────────────────────────────────────────────────────────────────────
  _css() {
    const s  = this.styleProps;
    const fs = Number(s.fontSize) || 14;
    const fs2 = Math.max(11, fs - 2);
    const fs3 = Math.max(10, fs - 3);
    return `
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    :host{display:block;width:100%;font-family:${s.fontFamily};font-size:${fs}px}
    .vlv-wrap{background:${s.bgColor};padding:28px 18px;min-height:500px}

    .ic{display:inline-flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1}
    .ic svg{width:1em;height:1em}

    .vlv-toolbar{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px}
    .vlv-search-wrap{flex:1;min-width:200px;position:relative}
    .vlv-search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:${s.iconColor};font-size:16px;pointer-events:none}
    .vlv-search{width:100%;padding:10px 12px 10px 38px;background:${s.searchBg};border:1px solid ${s.searchBorder};border-radius:9px;color:${s.searchText};font-size:${fs}px;font-family:inherit;transition:border-color .2s}
    .vlv-search::placeholder{color:${s.searchPlaceholder}}
    .vlv-search:focus{outline:none;border-color:${s.accentColor}}
    .vlv-sort-wrap{min-width:160px}
    .vlv-select{width:100%;padding:10px 12px;background:${s.searchBg};border:1px solid ${s.searchBorder};border-radius:9px;color:${s.searchText};font-size:${fs}px;font-family:inherit;cursor:pointer;appearance:none}
    .vlv-select:focus{outline:none;border-color:${s.accentColor}}
    .vlv-adv-toggle{display:inline-flex;align-items:center;gap:6px;padding:10px 14px;border-radius:9px;font-size:${fs}px;font-weight:600;border:1px solid ${s.filterBorder};background:${s.filterBg};color:${s.filterText};cursor:pointer;transition:all .2s;font-family:inherit;position:relative}
    .vlv-adv-toggle .ic{color:${s.iconColor};font-size:16px}
    .vlv-adv-toggle:hover,.vlv-adv-toggle.open{border-color:${s.accentColor};color:${s.accentColor}}
    .vlv-adv-toggle.open .ic{color:${s.accentColor}}
    .vlv-adv-badge{position:absolute;top:-6px;right:-6px;min-width:18px;height:18px;border-radius:9px;padding:0 4px;background:${s.accentColor};color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center}

    .vlv-quick{display:flex;flex-direction:column;gap:7px;margin-bottom:10px}
    .vlv-frow{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
    .vlv-flbl{font-size:${fs3}px;color:${s.cardMetaColor};font-weight:700;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;min-width:44px}
    .vlv-pills{display:flex;gap:5px;flex-wrap:wrap}
    .vlv-pill{display:inline-flex;align-items:center;gap:4px;padding:5px 12px;border-radius:18px;font-size:${fs2}px;font-weight:500;border:1px solid ${s.filterBorder};background:${s.filterBg};color:${s.filterText};cursor:pointer;transition:all .2s;font-family:inherit}
    .vlv-pill .ic{color:${s.iconColor};font-size:13px}
    .vlv-pill:hover{border-color:${s.accentColor};color:${s.accentColor}}
    .vlv-pill.active{background:${s.filterActiveBg};color:${s.filterActiveText};border-color:${s.filterActiveBg}}

    .vlv-adv{display:none;flex-wrap:wrap;background:${s.advFilterBg};border:1px solid ${s.advFilterBorder};border-radius:12px;padding:14px;margin-bottom:14px;animation:fadein .2s ease}
    .vlv-adv.open{display:flex}
    @keyframes fadein{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:none}}
    .vlv-adv-sec{flex:1 1 185px;min-width:160px;padding:10px 12px;border-right:1px solid ${s.advFilterBorder}}
    .vlv-adv-sec:last-of-type{border-right:none}
    .vlv-adv-inline{flex:1 1 100%;border-right:none;border-top:1px solid ${s.advFilterBorder};padding-top:12px;margin-top:6px;display:flex;align-items:center}
    .vlv-adv-footer{flex:1 1 100%;border-top:1px solid ${s.advFilterBorder};padding-top:12px;margin-top:6px;display:flex;justify-content:flex-end}
    .vlv-adv-ttl{font-size:${fs3}px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;color:${s.cardMetaColor};margin-bottom:9px}

    .vlv-rlbls{display:flex;justify-content:space-between;font-size:${fs2}px;color:${s.rangeValueColor};font-weight:600;margin-bottom:5px}
    .vlv-drange,.vlv-srange{position:relative;height:32px;display:flex;align-items:center}
    .vlv-rtrack{position:absolute;left:0;right:0;height:4px;border-radius:2px;background:${s.advFilterBorder};pointer-events:none}
    .vlv-rfill{position:absolute;height:100%;border-radius:2px;background:${s.sliderAccent}}
    .vlv-range{position:absolute;width:100%;height:4px;-webkit-appearance:none;appearance:none;background:transparent;cursor:pointer;pointer-events:none}
    .vlv-range::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:${s.sliderAccent};border:2px solid ${s.advFilterBg};box-shadow:0 0 0 2px ${s.sliderAccent};cursor:pointer;pointer-events:all;transition:transform .15s}
    .vlv-range::-webkit-slider-thumb:hover{transform:scale(1.2)}
    .vlv-range::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:${s.sliderAccent};border:2px solid ${s.advFilterBg};cursor:pointer;pointer-events:all}
    .vlv-rhi{z-index:2}

    .vlv-checks{display:flex;flex-direction:column;gap:5px;max-height:150px;overflow-y:auto;padding-right:2px}
    .vlv-checks::-webkit-scrollbar{width:3px}
    .vlv-checks::-webkit-scrollbar-thumb{background:${s.advFilterBorder};border-radius:2px}
    .vlv-chk{display:flex;align-items:center;gap:7px;cursor:pointer}
    .vlv-chk input[type=checkbox]{accent-color:${s.checkboxAccent};width:14px;height:14px;cursor:pointer;flex-shrink:0}
    .vlv-chk span{font-size:${fs2}px;color:${s.filterText}}
    .vlv-chk:hover span{color:${s.accentColor}}

    .vlv-toggle-lbl{display:flex;align-items:center;gap:9px;cursor:pointer;font-size:${fs}px;color:${s.filterText}}
    .vlv-toggle-cb{display:none}
    .vlv-toggle-track{width:38px;height:20px;border-radius:10px;background:${s.advFilterBorder};position:relative;flex-shrink:0;transition:background .2s}
    .vlv-toggle-track::after{content:'';position:absolute;top:3px;left:3px;width:14px;height:14px;border-radius:50%;background:${s.filterText};transition:transform .2s}
    .vlv-toggle-cb:checked+.vlv-toggle-track{background:${s.checkboxAccent}}
    .vlv-toggle-cb:checked+.vlv-toggle-track::after{transform:translateX(18px);background:#fff}

    .vlv-btn{display:inline-flex;align-items:center;gap:5px;padding:9px 16px;border-radius:8px;font-size:${fs}px;font-weight:600;cursor:pointer;border:none;transition:all .2s;font-family:inherit}
    .vlv-btn .ic{font-size:14px}
    .vlv-btn-sm{padding:7px 12px;font-size:${fs2}px}
    .vlv-btn-accent{background:${s.btnBg};color:${s.btnText}}
    .vlv-btn-accent:hover{background:${s.accentHover}}
    .vlv-btn-ghost{background:transparent;color:${s.btnBorderText};border:1px solid ${s.btnBorderColor}}
    .vlv-btn-ghost:hover{background:${s.btnBorderColor};color:${s.btnText}}

    .vlv-cmpbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;background:${s.compareBg};border:2px solid ${s.compareBorder};border-radius:10px;padding:10px 16px;margin-bottom:14px}
    .vlv-cmpbar-icon{font-size:18px;color:${s.accentColor};flex-shrink:0}
    .vlv-cmpbar-lbl{color:${s.compareText};font-size:${fs}px;flex:1}

    .vlv-meta{font-size:${fs2}px;color:${s.cardMetaColor};margin-bottom:14px}

    .vlv-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:20px;margin-bottom:36px}

    .vlv-card{background:${s.cardBg};border:1px solid ${s.cardBorder};border-radius:14px;overflow:hidden;box-shadow:0 4px 12px ${s.cardShadow};transition:transform .3s,box-shadow .3s,border-color .3s;display:flex;flex-direction:column;position:relative}
    .vlv-card:hover{transform:translateY(-4px);box-shadow:0 10px 24px ${s.cardHoverShadow};border-color:${s.accentColor}}
    .vlv-card.selected{border-color:${s.accentColor};box-shadow:0 0 0 2px ${s.accentColor}}
    .vlv-img-wrap{width:100%;height:200px;overflow:hidden;background:${s.cardBorder};position:relative}
    .vlv-img{width:100%;height:100%;object-fit:cover;transition:transform .3s;display:block}
    .vlv-card:hover .vlv-img{transform:scale(1.05)}
    .vlv-img-ph{width:100%;height:100%;display:flex;align-items:center;justify-content:center;color:${s.cardMetaColor}}
    .vlv-img-ph svg{width:52px;height:52px}
    .vlv-badges{position:absolute;top:9px;left:9px;display:flex;gap:4px;flex-wrap:wrap}
    .vlv-badge{padding:3px 8px;border-radius:9px;font-size:${fs3}px;font-weight:700;text-transform:uppercase;letter-spacing:.3px}
    .vlv-badge-new{background:${s.badgeNewBg};color:${s.badgeNewText}}
    .vlv-badge-used{background:${s.badgeUsedBg};color:${s.badgeUsedText}}
    .vlv-badge-rent{background:${s.badgeRentBg};color:${s.badgeRentText}}
    .vlv-badge-auction{background:${s.badgeAuctionBg};color:${s.badgeAuctionText}}
    .vlv-badge-featured{background:${s.badgeFeaturedBg};color:${s.badgeFeaturedText};display:inline-flex;align-items:center;gap:3px}
    .vlv-badge-featured svg{width:9px;height:9px}
    .vlv-badge-sold,.vlv-badge-rented{background:#374151;color:#9ca3af}
    .vlv-cb-wrap{position:absolute;top:9px;right:9px}
    .vlv-cb{width:18px;height:18px;cursor:pointer;accent-color:${s.accentColor}}
    .vlv-body{padding:16px;flex:1;display:flex;flex-direction:column;gap:8px}
    .vlv-title{font-size:${fs + 3}px;font-weight:700;color:${s.cardTitleColor};line-height:1.3}
    .vlv-sub{font-size:${fs2}px;color:${s.cardMetaColor}}
    .vlv-specs{display:flex;gap:10px;flex-wrap:wrap}
    .vlv-spec{display:inline-flex;align-items:center;gap:3px;font-size:${fs2}px;color:${s.cardBodyColor}}
    .vlv-spec .ic{color:${s.iconColor};font-size:13px}
    .vlv-price-row{display:flex;align-items:baseline;gap:7px;margin-top:2px}
    .vlv-price{font-size:${fs + 7}px;font-weight:800;color:${s.pricePrimaryColor}}
    .vlv-price-orig{font-size:${fs}px;color:${s.priceSecondaryColor};text-decoration:line-through}
    .vlv-price-note{font-size:${fs2}px;color:${s.cardMetaColor}}
    .vlv-foot{padding:11px 16px;border-top:1px solid ${s.cardBorder};display:flex;gap:7px}
    .vlv-foot .vlv-btn{flex:1;justify-content:center;font-size:${fs2}px;padding:8px}

    .vlv-empty{grid-column:1/-1;text-align:center;padding:70px 20px;color:${s.emptyColor}}
    .vlv-empty-icon{color:${s.cardMetaColor};margin-bottom:14px}
    .vlv-empty-icon svg{width:52px;height:52px}
    .vlv-empty h3{font-size:${fs + 5}px;margin-bottom:7px;color:${s.cardBodyColor}}
    .vlv-loading{grid-column:1/-1;text-align:center;padding:70px 20px;color:${s.cardMetaColor}}
    .vlv-spin{width:42px;height:42px;border:4px solid ${s.cardBorder};border-top-color:${s.accentColor};border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 14px}
    @keyframes spin{to{transform:rotate(360deg)}}

    .vlv-modal-ov{position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9999;display:flex;align-items:flex-start;justify-content:center;padding:36px 14px;overflow-y:auto}
    .vlv-modal{background:${s.cardBg};border:1px solid ${s.cardBorder};border-radius:14px;width:100%;max-width:1080px;overflow:hidden}
    .vlv-modal-head{display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid ${s.cardBorder}}
    .vlv-modal-head h2{color:${s.cardTitleColor};font-size:${fs + 4}px}
    .vlv-modal-close{background:none;border:none;color:${s.cardMetaColor};cursor:pointer;padding:4px;border-radius:5px;display:flex;align-items:center}
    .vlv-modal-close .ic{font-size:19px}
    .vlv-modal-close:hover{color:${s.accentColor}}
    .vlv-modal-body{padding:20px;overflow-x:auto}
    .vlv-cmp-tbl{width:100%;border-collapse:collapse}
    .vlv-cmp-tbl th,.vlv-cmp-tbl td{padding:9px 13px;text-align:left;border-bottom:1px solid ${s.cardBorder};font-size:${fs}px}
    .vlv-cmp-tbl th{background:${s.filterBg};color:${s.accentColor};font-weight:700;min-width:175px}
    .vlv-cmp-tbl td{color:${s.cardBodyColor}}
    .vlv-cmp-tbl tr:nth-child(even) td{background:rgba(255,255,255,.02)}
    .vlv-cmp-img{width:100%;height:120px;object-fit:cover;border-radius:7px;margin-bottom:7px}
    .vlv-cmp-ttl{font-weight:700;color:${s.cardTitleColor};font-size:${fs}px}

    .vlv-pag{display:flex;justify-content:center;align-items:center;gap:5px;margin-top:18px;flex-wrap:wrap}
    .vlv-pbn{display:inline-flex;align-items:center;gap:3px;padding:8px 12px;border:1px solid ${s.paginationBorder};border-radius:7px;background:${s.cardBg};color:${s.paginationText};font-size:${fs}px;font-weight:600;cursor:pointer;transition:all .2s;min-width:38px;justify-content:center;font-family:inherit}
    .vlv-pbn svg{width:15px;height:15px}
    .vlv-pbn:hover:not(:disabled){background:${s.paginationHoverBg};border-color:${s.accentColor};color:${s.accentColor}}
    .vlv-pbn:disabled{opacity:.4;cursor:not-allowed}
    .vlv-pbn.active{background:${s.paginationActiveBg};border-color:${s.paginationActiveBg};color:${s.paginationActiveText}}
    .vlv-pdot{font-size:${fs}px;color:${s.cardMetaColor}}

    @media(max-width:768px){
      .vlv-wrap{padding:16px 10px}
      .vlv-grid{grid-template-columns:1fr;gap:12px}
      .vlv-toolbar{flex-direction:column}
      .vlv-adv-sec{flex:1 1 100%;border-right:none;border-bottom:1px solid ${s.advFilterBorder}}
    }`;
  }

  _updateStyles() {
    const el = this.shadowRoot.querySelector('style');
    if (el) el.textContent = this._css();
  }

  // ── Build / rebuild checkbox grids ─────────────────────────────────────────
  _rebuildAdvFilters() {
    const sr = this.shadowRoot;
    const buildChecks = (containerId, items, stateArr, onChange) => {
      const el = sr.getElementById(containerId);
      if (!el) return;
      if (!items.length) {
        const sec = el.closest('.vlv-adv-sec');
        if (sec) sec.style.display = 'none';
        return;
      }
      // Show section in case it was hidden from empty data previously
      const sec = el.closest('.vlv-adv-sec');
      if (sec) sec.style.display = '';

      el.innerHTML = items.map(val => `
        <label class="vlv-chk">
          <input type="checkbox" data-val="${this._esc(val)}" ${stateArr.includes(val) ? 'checked' : ''}/>
          <span>${this._esc(val)}</span>
        </label>`).join('');
      el.querySelectorAll('input').forEach(cb => {
        cb.addEventListener('change', () => {
          const v = cb.dataset.val;
          if (cb.checked) { if (!stateArr.includes(v)) stateArr.push(v); }
          else { const i = stateArr.indexOf(v); if (i > -1) stateArr.splice(i, 1); }
          onChange();
        });
      });
    };

    // FIX: any filter change resets to page 1 so results are always visible
    const trigger = () => {
      this._currentPage = 1;
      this._renderListings();
      this._updateAdvBadge();
    };

    buildChecks('vlvMakeChecks',  this._meta.makes,         this._filterMakes,         trigger);
    buildChecks('vlvBodyChecks',  this._meta.bodyStyles,     this._filterBodyStyles,    trigger);
    buildChecks('vlvFuelChecks',  this._meta.fuelTypes,      this._filterFuelTypes,     trigger);
    buildChecks('vlvTransChecks', this._meta.transmissions,  this._filterTransmissions, trigger);
    buildChecks('vlvDriveChecks', this._meta.drivetrains,    this._filterDrivetrains,   trigger);
    buildChecks('vlvColorChecks', this._meta.colors,         this._filterColors,        trigger);

    this._syncRangeSliders();
    this._syncFilterVisibility();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // FIX Bug 2 — Slider fill bar calculation corrected for both dual and
  //             single (mileage) sliders.
  //
  // Dual slider: fill left% = loVal position, fill width% = hi-lo span.
  // Single slider: fill left = 0, fill width% = thumb position.
  // ─────────────────────────────────────────────────────────────────────────
  _syncRangeSliders() {
    const sr = this.shadowRoot;

    const setupDual = (loId, hiId, fillId, loV, hiV, minB, maxB, loLblId, hiLblId, fmtLo, fmtHi) => {
      const lo    = sr.getElementById(loId);
      const hi    = sr.getElementById(hiId);
      const fill  = sr.getElementById(fillId);
      const loLbl = loLblId ? sr.getElementById(loLblId) : null;
      const hiLbl = hiLblId ? sr.getElementById(hiLblId) : null;
      if (!lo) return;

      lo.min = minB; lo.max = maxB; lo.value = loV;
      if (hi) { hi.min = minB; hi.max = maxB; hi.value = hiV; }

      const update = () => {
        const l = parseFloat(lo.value);
        const h = hi ? parseFloat(hi.value) : maxB;
        const range = maxB - minB || 1;

        if (fill) {
          if (hi) {
            // Dual slider: fill spans between lo and hi thumbs
            fill.style.left  = ((l - minB) / range * 100) + '%';
            fill.style.width = ((h - l)    / range * 100) + '%';
          } else {
            // Single slider (mileage): fill spans from 0 to thumb
            fill.style.left  = '0%';
            fill.style.width = ((l - minB) / range * 100) + '%';
          }
        }
        if (loLbl) loLbl.textContent = fmtLo(l);
        if (hiLbl) hiLbl.textContent = fmtHi(hi ? h : l);
      };

      update();

      // Prevent lo from crossing hi and vice versa in dual mode
      lo.addEventListener('input', () => {
        if (hi && parseFloat(lo.value) > parseFloat(hi.value)) lo.value = hi.value;
        update();
        this._readRanges();
      });
      if (hi) hi.addEventListener('input', () => {
        if (parseFloat(hi.value) < parseFloat(lo.value)) hi.value = lo.value;
        update();
        this._readRanges();
      });
    };

    setupDual('vlvPriceMin', 'vlvPriceMax', 'vlvPriceFill',
      this._priceMin, this._priceMax, this._priceRangeMin, this._priceRangeMax,
      'vlvPriceMinLbl', 'vlvPriceMaxLbl',
      v => '$' + Number(v).toLocaleString(),
      v => '$' + Number(v).toLocaleString());

    setupDual('vlvYearMin', 'vlvYearMax', 'vlvYearFill',
      this._yearMin, this._yearMax, this._yearRangeMin, this._yearRangeMax,
      'vlvYearMinLbl', 'vlvYearMaxLbl',
      v => String(Math.round(v)),
      v => String(Math.round(v)));

    // Single slider for mileage — pass hiId=null
    setupDual('vlvMileageMax', null, 'vlvMileageFill',
      this._mileageMax, null, 0, this._mileageRangeMax,
      null, 'vlvMileageLbl',
      v => v,
      v => Number(v).toLocaleString() + ' mi');
  }

  _syncFilterVisibility() {
    const sr = this.shadowRoot;
    const vf = this._visibleFilters;
    const MAP = {
      vehicleType:   'vlvRowVehicleType',
      listingType:   'vlvRowListingType',
      status:        'vlvRowStatus',
      priceRange:    'vlvAdvPriceRange',
      yearRange:     'vlvAdvYearRange',
      mileageRange:  'vlvAdvMileageRange',
      make:          'vlvAdvMake',
      bodyStyle:     'vlvAdvBodyStyle',
      fuelType:      'vlvAdvFuelType',
      transmission:  'vlvAdvTransmission',
      drivetrain:    'vlvAdvDrivetrain',
      exteriorColor: 'vlvAdvExteriorColor',
      featured:      'vlvAdvFeatured',
    };
    Object.entries(MAP).forEach(([key, id]) => {
      const el = sr.getElementById(id);
      if (el) el.style.display = vf.has(key) ? '' : 'none';
    });
  }

  // ── Bind all controls ──────────────────────────────────────────────────────
  _bindControls() {
    const sr = this.shadowRoot;
    let searchTimer;

    // FIX: search now works because _getFiltered runs on _allListings,
    // not a page-slice. Also reset to page 1 on every filter interaction.
    sr.getElementById('vlvSearch').addEventListener('input', e => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(() => {
        this._searchQuery = e.target.value.toLowerCase().trim();
        this._currentPage = 1;
        this._renderListings();
      }, 280);
    });

    sr.getElementById('vlvSort').addEventListener('change', e => {
      this._sortBy = e.target.value;
      this._currentPage = 1;
      this._renderListings();
    });

    const advBtn   = sr.getElementById('vlvAdvToggle');
    const advPanel = sr.getElementById('vlvAdv');
    advBtn.addEventListener('click', () => {
      this._advOpen = !this._advOpen;
      advPanel.classList.toggle('open', this._advOpen);
      advBtn.classList.toggle('open', this._advOpen);
    });

    const bindPills = (pillsId, setter) => {
      sr.getElementById(pillsId)?.addEventListener('click', e => {
        const btn = e.target.closest('.vlv-pill');
        if (!btn) return;
        sr.querySelectorAll(`#${pillsId} .vlv-pill`).forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        setter(btn.dataset.val);
        this._currentPage = 1;
        this._renderListings();
      });
    };
    bindPills('vlvPillsVehicleType', v => { this._filterVehicleType = v; });
    bindPills('vlvPillsListingType', v => { this._filterListingType = v; });
    bindPills('vlvPillsStatus',       v => { this._filterStatus      = v; });

    sr.getElementById('vlvFeaturedCb')?.addEventListener('change', e => {
      this._filterFeatured = e.target.checked;
      this._currentPage = 1;
      this._renderListings();
      this._updateAdvBadge();
    });

    sr.getElementById('vlvReset')?.addEventListener('click', () => this._resetAll());

    sr.getElementById('vlvCmpBtn')?.addEventListener('click', () => this._showCmpModal());
    sr.getElementById('vlvCmpClear')?.addEventListener('click', () => {
      this._compareIds = [];
      this._updateCmpBar();
      sr.querySelectorAll('.vlv-cb').forEach(cb => { cb.checked = false; });
      sr.querySelectorAll('.vlv-card').forEach(c => c.classList.remove('selected'));
    });
    sr.getElementById('vlvModalClose')?.addEventListener('click', () => {
      sr.getElementById('vlvModal').style.display = 'none';
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // _readRanges — called by slider input events.
  // Reads current slider values into the filter state variables and
  // re-renders. Never touches _priceRangeMin/Max (bounds).
  // ─────────────────────────────────────────────────────────────────────────
  _readRanges() {
    const sr = this.shadowRoot;
    const v  = id => parseFloat(sr.getElementById(id)?.value ?? 0);
    this._priceMin   = v('vlvPriceMin');
    this._priceMax   = v('vlvPriceMax');
    this._yearMin    = v('vlvYearMin');
    this._yearMax    = v('vlvYearMax');
    this._mileageMax = v('vlvMileageMax');
    this._currentPage = 1;
    this._renderListings();
  }

  _resetAll() {
    const sr = this.shadowRoot;

    // Reset quick pill selections
    ['vlvPillsVehicleType','vlvPillsListingType','vlvPillsStatus'].forEach(id => {
      sr.querySelectorAll(`#${id} .vlv-pill`).forEach((p, i) => p.classList.toggle('active', i === 0));
    });
    this._filterVehicleType = 'all';
    this._filterListingType = 'all';
    this._filterStatus      = 'all';

    // Reset search
    this._searchQuery = '';
    const si = sr.getElementById('vlvSearch');
    if (si) si.value = '';

    // Reset checkbox filters
    this._filterMakes         = [];
    this._filterBodyStyles    = [];
    this._filterFuelTypes     = [];
    this._filterTransmissions = [];
    this._filterDrivetrains   = [];
    this._filterColors        = [];
    this._filterFeatured      = false;
    sr.querySelectorAll('.vlv-chk input').forEach(cb => { cb.checked = false; });
    const fc = sr.getElementById('vlvFeaturedCb');
    if (fc) fc.checked = false;

    // Reset ranges back to full bounds
    this._priceMin   = this._priceRangeMin;
    this._priceMax   = this._priceRangeMax;
    this._yearMin    = this._yearRangeMin;
    this._yearMax    = this._yearRangeMax;
    this._mileageMax = this._mileageRangeMax;

    // Re-sync slider positions to match reset values
    this._syncRangeSliders();

    this._currentPage = 1;
    this._renderListings();
    this._updateAdvBadge();
  }

  _updateAdvBadge() {
    const n = this._filterMakes.length + this._filterBodyStyles.length +
              this._filterFuelTypes.length + this._filterTransmissions.length +
              this._filterDrivetrains.length + this._filterColors.length +
              (this._filterFeatured ? 1 : 0);
    const b = this.shadowRoot.getElementById('vlvAdvBadge');
    if (b) { b.style.display = n > 0 ? 'flex' : 'none'; b.textContent = n; }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // _getFiltered — runs on the FULL _allListings array.
  //
  // FIX Bug 3 — zero-price listings no longer silently excluded.
  //   Listings without a price are always included regardless of the price
  //   slider position. Only listings that HAVE a price are range-checked.
  //
  // FIX Bug 6 — all filters (search, color, drivetrain, make, etc.) now
  //   work correctly because they operate on the complete dataset, not a
  //   page-slice.
  // ─────────────────────────────────────────────────────────────────────────
  _getFiltered() {
    let list = [...this._allListings];

    // Search — checks title, make, model, trim, year, vin, stockNumber
    if (this._searchQuery) {
      list = list.filter(v =>
        [v.make, v.model, v.trim, v.year, v.vin, v.stockNumber, v.title, v.description]
          .join(' ')
          .toLowerCase()
          .includes(this._searchQuery)
      );
    }

    // Quick pill filters
    if (this._filterVehicleType !== 'all') list = list.filter(v => v.vehicleType === this._filterVehicleType);
    if (this._filterListingType !== 'all') list = list.filter(v => v.listingType === this._filterListingType);
    if (this._filterStatus      !== 'all') list = list.filter(v => v.status      === this._filterStatus);

    // Price range — only apply to listings that actually have a price.
    // Listings with no price are always shown regardless of slider position.
    list = list.filter(v => {
      const p = v.salePrice || v.price || 0;
      if (p === 0) return true;  // no price → always include
      return p >= this._priceMin && p <= this._priceMax;
    });

    // Year range — only applied when listing has a year
    list = list.filter(v => !v.year || (v.year >= this._yearMin && v.year <= this._yearMax));

    // Mileage — only applied when listing has mileage
    list = list.filter(v => !v.mileage || v.mileage <= this._mileageMax);

    // Advanced checkbox filters
    if (this._filterMakes.length)         list = list.filter(v => this._filterMakes.includes(v.make));
    if (this._filterBodyStyles.length)     list = list.filter(v => this._filterBodyStyles.includes(v.bodyStyle));
    if (this._filterFuelTypes.length)      list = list.filter(v => this._filterFuelTypes.includes(v.fuelType));
    if (this._filterTransmissions.length)  list = list.filter(v => this._filterTransmissions.includes(v.transmission));
    if (this._filterDrivetrains.length)    list = list.filter(v => this._filterDrivetrains.includes(v.drivetrain));
    if (this._filterColors.length)         list = list.filter(v => this._filterColors.includes(v.exteriorColor));
    if (this._filterFeatured)              list = list.filter(v => v.featured);

    // Sort
    list.sort((a, b) => {
      switch (this._sortBy) {
        case 'price-asc':   return (a.salePrice||a.price||0) - (b.salePrice||b.price||0);
        case 'price-desc':  return (b.salePrice||b.price||0) - (a.salePrice||a.price||0);
        case 'year-desc':   return (b.year||0) - (a.year||0);
        case 'year-asc':    return (a.year||0) - (b.year||0);
        case 'mileage-asc': return (a.mileage||0) - (b.mileage||0);
        case 'oldest':      return new Date(a._createdDate) - new Date(b._createdDate);
        default:            return new Date(b._createdDate) - new Date(a._createdDate);
      }
    });

    return list;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // _renderListings — filters the full set, paginates the result client-side,
  // and renders only the current page's slice into the grid.
  // ─────────────────────────────────────────────────────────────────────────
  _renderListings() {
    const grid   = this.shadowRoot.getElementById('vlvGrid');
    const meta   = this.shadowRoot.getElementById('vlvMeta');
    const filtered = this._getFiltered();

    // Client-side pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / this._perPage));
    if (this._currentPage > totalPages) this._currentPage = totalPages;
    const skip  = (this._currentPage - 1) * this._perPage;
    const slice = filtered.slice(skip, skip + this._perPage);

    meta.textContent = `Showing ${filtered.length} listing${filtered.length !== 1 ? 's' : ''}` +
      (filtered.length !== this._allListings.length ? ` (filtered from ${this._allListings.length})` : '');

    if (!filtered.length) {
      grid.innerHTML = `<div class="vlv-empty"><div class="vlv-empty-icon">${IC.noResults}</div><h3>No listings found</h3><p>Try adjusting your filters or search terms.</p></div>`;
      this._renderPagination(0, 1);
      return;
    }

    grid.innerHTML = slice.map((v, i) => this._cardHTML(v, i)).join('');

    grid.querySelectorAll('.vlv-view-btn').forEach(btn => {
      btn.addEventListener('click', () => this._navigate(btn.dataset.slug));
    });

    // FIX Bug 4 — compare checkboxes restored correctly from _compareIds
    // across page changes because we re-check at render time.
    grid.querySelectorAll('.vlv-cb').forEach(cb => {
      cb.addEventListener('change', () => {
        const id = cb.dataset.id;
        if (cb.checked) {
          if (this._compareIds.length >= 4) { cb.checked = false; return; }
          if (!this._compareIds.includes(id)) this._compareIds.push(id);
          cb.closest('.vlv-card')?.classList.add('selected');
        } else {
          this._compareIds = this._compareIds.filter(i => i !== id);
          cb.closest('.vlv-card')?.classList.remove('selected');
        }
        this._updateCmpBar();
      });
    });

    this._renderPagination(filtered.length, totalPages);
  }

  _cardHTML(v, idx) {
    const title  = v.title || `${v.year||''} ${v.make||''} ${v.model||''}`.trim() || 'Vehicle';
    const imgUrl = this._imgUrl(v.primaryImage, 680, 440);
    const eager  = idx < 6;
    const listBadge   = this._listBadge(v.listingType);
    const statusBadge = (v.status === 'sold' || v.status === 'rented')
      ? `<span class="vlv-badge vlv-badge-${v.status}">${v.status}</span>` : '';
    const featBadge = v.featured
      ? `<span class="vlv-badge vlv-badge-featured"><span class="ic" style="font-size:9px">${IC.star}</span>Featured</span>` : '';
    const imgEl = imgUrl
      ? `<img class="vlv-img" src="${imgUrl}" alt="${this._esc(title)}" loading="${eager?'eager':'lazy'}" decoding="${eager?'sync':'async'}" onerror="this.style.display='none'"/>`
      : `<div class="vlv-img-ph"><span class="ic" style="font-size:52px">${IC.car}</span></div>`;
    const specMi = v.mileage      ? `<span class="vlv-spec"><span class="ic">${IC.gauge}</span>${Number(v.mileage).toLocaleString()} mi</span>` : '';
    const specFu = v.fuelType     ? `<span class="vlv-spec"><span class="ic">${IC.fuel}</span>${v.fuelType}</span>` : '';
    const specTr = v.transmission ? `<span class="vlv-spec"><span class="ic">${IC.gear}</span>${v.transmission}</span>` : '';
    const specCo = v.exteriorColor? `<span class="vlv-spec"><span class="ic">${IC.palette}</span>${v.exteriorColor}</span>` : '';

    // Restore compare checkbox state across page renders
    const isComparing = this._compareIds.includes(v._id);

    return `
    <article class="vlv-card${isComparing ? ' selected' : ''}" data-id="${v._id}">
      <div class="vlv-img-wrap">
        ${imgEl}
        <div class="vlv-badges">${listBadge}${statusBadge}${featBadge}</div>
        <div class="vlv-cb-wrap"><input type="checkbox" class="vlv-cb" data-id="${v._id}" ${isComparing ? 'checked' : ''}/></div>
      </div>
      <div class="vlv-body">
        <div class="vlv-title">${this._esc(title)}</div>
        <div class="vlv-sub">${[v.bodyStyle, v.drivetrain, v.engine].filter(Boolean).join(' · ')}</div>
        <div class="vlv-specs">${specMi}${specFu}${specTr}${specCo}</div>
        <div class="vlv-price-row">${this._fmtPrice(v)}</div>
      </div>
      <div class="vlv-foot">
        <button class="vlv-btn vlv-btn-accent vlv-view-btn" data-slug="${v.slug}">
          View Details <span class="ic" style="font-size:14px">${IC.arrowR}</span>
        </button>
      </div>
    </article>`;
  }

  _listBadge(type) {
    const map = { new:['new','New'], used:['used','Used'], rent:['rent','Rent/Lease'], auction:['auction','Auction'] };
    const [cls, label] = map[type] || ['used', type || 'Used'];
    return `<span class="vlv-badge vlv-badge-${cls}">${label}</span>`;
  }

  _fmtPrice(v) {
    const { price, salePrice, currency, listingType, rentalPricePerDay, auctionStartPrice } = v;
    const sym = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
    const fmt = n => sym + Number(n).toLocaleString();
    if (listingType === 'rent'    && rentalPricePerDay)   return `<span class="vlv-price">${fmt(rentalPricePerDay)}<small>/day</small></span>`;
    if (listingType === 'auction' && auctionStartPrice)   return `<span class="vlv-price">From ${fmt(auctionStartPrice)}</span><span class="vlv-price-note">Auction</span>`;
    if (salePrice && salePrice < price) return `<span class="vlv-price">${fmt(salePrice)}</span><span class="vlv-price-orig">${fmt(price)}</span>`;
    if (price)    return `<span class="vlv-price">${fmt(price)}</span>`;
    return `<span class="vlv-price-note">Price on request</span>`;
  }

  // ── Compare modal ──────────────────────────────────────────────────────────
  _showCmpModal() {
    // Compare looks up from the FULL allListings, not the page slice
    const vehicles = this._allListings.filter(v => this._compareIds.includes(v._id));
    if (vehicles.length < 2) return;
    const fields = [
      ['Year',        v => v.year        || '—'],
      ['Make',        v => v.make        || '—'],
      ['Model',       v => v.model       || '—'],
      ['Trim',        v => v.trim        || '—'],
      ['Body Style',  v => v.bodyStyle   || '—'],
      ['Mileage',     v => v.mileage     ? Number(v.mileage).toLocaleString() + ' mi' : '—'],
      ['Engine',      v => v.engine      || '—'],
      ['Transmission',v => v.transmission|| '—'],
      ['Drivetrain',  v => v.drivetrain  || '—'],
      ['Fuel Type',   v => v.fuelType    || '—'],
      ['MPG City',    v => v.mpgCity     ? v.mpgCity + ' mpg' : '—'],
      ['MPG Hwy',     v => v.mpgHighway  ? v.mpgHighway + ' mpg' : '—'],
      ['Ext Color',   v => v.exteriorColor || '—'],
      ['Int Color',   v => v.interiorColor || '—'],
      ['Seating',     v => v.seatingCapacity ? v.seatingCapacity + ' seats' : '—'],
      ['Price',       v => (v.salePrice || v.price) ? '$' + Number(v.salePrice || v.price).toLocaleString() : '—'],
      ['VIN',         v => v.vin         || '—'],
      ['Stock #',     v => v.stockNumber || '—'],
      ['Condition',   v => v.condition   || '—'],
      ['Warranty',    v => v.warrantyType|| '—'],
    ];
    const heads = vehicles.map(v => {
      const img = this._imgUrl(v.primaryImage, 400, 240);
      const t   = v.title || `${v.year} ${v.make} ${v.model}`;
      return `<th>${img ? `<img class="vlv-cmp-img" src="${img}" alt="${this._esc(t)}" loading="lazy"/>` : ''}<div class="vlv-cmp-ttl">${this._esc(t)}</div></th>`;
    }).join('');
    const rows = fields.map(([lbl, fn]) =>
      `<tr><th>${lbl}</th>${vehicles.map(v => `<td>${this._esc(String(fn(v)))}</td>`).join('')}</tr>`
    ).join('');
    this.shadowRoot.getElementById('vlvCmpTable').innerHTML =
      `<table class="vlv-cmp-tbl"><thead><tr><th>Spec</th>${heads}</tr></thead><tbody>${rows}</tbody></table>`;
    this.shadowRoot.getElementById('vlvModal').style.display = 'flex';
  }

  _updateCmpBar() {
    const bar = this.shadowRoot.getElementById('vlvCmpBar');
    const cnt = this.shadowRoot.getElementById('vlvCmpCount');
    if (cnt) cnt.textContent = this._compareIds.length;
    if (bar) bar.style.display = this._compareIds.length >= 2 ? 'flex' : 'none';
  }

  // ── Pagination — now fully client-side ────────────────────────────────────
  _renderPagination(totalFiltered, totalPages) {
    const pag = this.shadowRoot.getElementById('vlvPag');
    if (totalPages <= 1) { pag.innerHTML = ''; return; }

    const maxV  = 5;
    let start = Math.max(1, this._currentPage - 2);
    let end   = Math.min(totalPages, start + maxV - 1);
    if (end - start < maxV - 1) start = Math.max(1, end - maxV + 1);

    let html = `<button class="vlv-pbn" id="vlvPrev" ${this._currentPage === 1 ? 'disabled' : ''}>${IC.chevL}</button>`;
    if (start > 1) {
      html += `<button class="vlv-pbn" data-page="1">1</button>`;
      if (start > 2) html += `<span class="vlv-pdot">…</span>`;
    }
    for (let i = start; i <= end; i++) {
      html += `<button class="vlv-pbn ${i === this._currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    if (end < totalPages) {
      if (end < totalPages - 1) html += `<span class="vlv-pdot">…</span>`;
      html += `<button class="vlv-pbn" data-page="${totalPages}">${totalPages}</button>`;
    }
    html += `<button class="vlv-pbn" id="vlvNext" ${this._currentPage === totalPages ? 'disabled' : ''}>${IC.chevR}</button>`;

    pag.innerHTML = html;

    pag.querySelector('#vlvPrev')?.addEventListener('click', () => {
      if (this._currentPage > 1) { this._currentPage--; this._renderListings(); }
    });
    pag.querySelector('#vlvNext')?.addEventListener('click', () => {
      if (this._currentPage < totalPages) { this._currentPage++; this._renderListings(); }
    });
    pag.querySelectorAll('.vlv-pbn[data-page]').forEach(btn =>
      btn.addEventListener('click', () => {
        this._currentPage = parseInt(btn.dataset.page);
        this._renderListings();
      })
    );
  }

  _navigate(slug) {
    this.dispatchEvent(new CustomEvent('navigate-to-listing', { detail: { slug }, bubbles: true, composed: true }));
  }

  _imgUrl(raw, w = 400, h = 240) {
    if (!raw || typeof raw !== 'string') return '';
    if (raw.startsWith('https://static.wixstatic.com/media/')) {
      try {
        const fn = raw.split('/media/')[1]?.split('/')[0];
        if (!fn) return raw;
        return `https://static.wixstatic.com/media/${fn}/v1/fill/w_${w},h_${h},al_c,q_80,enc_avif,quality_auto/${fn}`;
      } catch (e) { return raw; }
    }
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    if (raw.startsWith('wix:image://')) {
      try {
        const fid = raw.split('/')[3]?.split('#')[0];
        if (!fid) return '';
        let fn = fid.includes('~mv2') ? fid : `${fid}~mv2.jpg`;
        if (!fn.includes('.')) fn += '.jpg';
        return `https://static.wixstatic.com/media/${fn}/v1/fill/w_${w},h_${h},al_c,q_80,enc_avif,quality_auto/${fn}`;
      } catch (e) { return ''; }
    }
    return '';
  }

  // FIX Bug 5 — use shadowRoot's ownerDocument instead of global document
  _esc(t) {
    if (!t) return '';
    const d = (this.shadowRoot.ownerDocument || document).createElement('div');
    d.textContent = String(t);
    return d.innerHTML;
  }
}

customElements.define('vehicle-list-viewer', VehicleListViewer);
