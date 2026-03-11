/**
 * CUSTOM ELEMENT — Vehicle Listing Viewer (List Page)
 * Tag: <vehicle-list-viewer>
 * Registered: customElements.define('vehicle-list-viewer', VehicleListViewer)
 *
 * Attributes (set by widget via setAttribute):
 *   listing-list  — JSON { listings:[], totalCount, currentPage, totalPages, postsPerPage }
 *   style-props   — JSON style token map
 *
 * Events dispatched (listened by widget via .on()):
 *   load-listing-list  — request fresh data
 *   page-change        — { page }
 *   navigate-to-listing — { slug }
 *   compare-listings   — { ids[] }
 */
class VehicleListViewer extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this._listings    = [];
        this._currentPage = 1;
        this._totalPages  = 1;
        this._perPage     = 9;
        this._compareIds  = [];

        // Active filters
        this._filterVehicleType  = 'all';
        this._filterListingType  = 'all';
        this._filterStatus       = 'all';
        this._sortBy             = 'newest';
        this._searchQuery        = '';

        const raw = this.getAttribute('style-props');
        this.styleProps = raw ? JSON.parse(raw) : this._defaultStyleProps();
        this._initUI();
    }

    static get observedAttributes() {
        return ['listing-list', 'style-props'];
    }

    _defaultStyleProps() {
        return {
            fontFamily:            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            bgColor:               '#0f1117',
            accentColor:           '#f97316',
            accentHover:           '#ea580c',

            cardBg:                '#1a1d27',
            cardBorder:            '#2a2d3a',
            cardShadow:            'rgba(0,0,0,0.4)',
            cardHoverShadow:       'rgba(249,115,22,0.2)',

            cardTitleColor:        '#ffffff',
            cardBodyColor:         '#94a3b8',
            cardMetaColor:         '#64748b',

            pricePrimaryColor:     '#f97316',
            priceSecondaryColor:   '#94a3b8',

            badgeNewBg:            '#166534',
            badgeNewText:          '#bbf7d0',
            badgeUsedBg:           '#1e3a5f',
            badgeUsedText:         '#93c5fd',
            badgeRentBg:           '#4c1d95',
            badgeRentText:         '#ddd6fe',
            badgeAuctionBg:        '#7c2d12',
            badgeAuctionText:      '#fed7aa',
            badgeFeaturedBg:       '#f97316',
            badgeFeaturedText:     '#ffffff',

            filterBg:              '#1a1d27',
            filterBorder:          '#2a2d3a',
            filterText:            '#94a3b8',
            filterActiveBg:        '#f97316',
            filterActiveText:      '#ffffff',

            btnBg:                 '#f97316',
            btnText:               '#ffffff',
            btnBorderBg:           'transparent',
            btnBorderColor:        '#f97316',
            btnBorderText:         '#f97316',

            paginationBorder:      '#2a2d3a',
            paginationText:        '#94a3b8',
            paginationActiveBg:    '#f97316',
            paginationActiveText:  '#ffffff',
            paginationHoverBg:     '#1e2133',

            searchBg:              '#1a1d27',
            searchBorder:          '#2a2d3a',
            searchText:            '#ffffff',
            searchPlaceholder:     '#64748b',

            compareBg:             '#1a1d27',
            compareBorder:         '#f97316',
            compareText:           '#ffffff',

            emptyColor:            '#64748b',
        };
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (!newVal || oldVal === newVal) return;

        if (name === 'listing-list') {
            try {
                const d = JSON.parse(newVal);
                this._listings    = d.listings    || [];
                this._totalPages  = d.totalPages  || 1;
                this._currentPage = d.currentPage || 1;
                this._perPage     = d.postsPerPage || 9;
                requestAnimationFrame(() => this._renderListings());
            } catch (parseErr) {
                console.error('vehicle-list-viewer: listing-list parse error', parseErr.message);
            }
        } else if (name === 'style-props') {
            try {
                this.styleProps = { ...this.styleProps, ...JSON.parse(newVal) };
                if (this._ready) this._updateStyles();
            } catch (parseErr) {
                console.error('vehicle-list-viewer: style-props parse error', parseErr.message);
            }
        }
    }

    _initUI() {
        this.shadowRoot.innerHTML = `<style>${this._css()}</style>${this._shell()}`;
        this._ready = true;
        this._bindControls();
    }

    _shell() {
        return `
        <div class="vlv-wrap">
            <!-- Toolbar -->
            <div class="vlv-toolbar">
                <div class="vlv-search-wrap">
                    <span class="vlv-search-icon">🔍</span>
                    <input class="vlv-search" id="vlvSearch" type="text" placeholder="Search make, model, year, VIN…" />
                </div>
                <div class="vlv-sort-wrap">
                    <select class="vlv-select" id="vlvSort">
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="price-asc">Price: Low → High</option>
                        <option value="price-desc">Price: High → Low</option>
                        <option value="year-desc">Year: Newest</option>
                        <option value="year-asc">Year: Oldest</option>
                        <option value="mileage-asc">Lowest Mileage</option>
                    </select>
                </div>
            </div>

            <!-- Filter pills row 1: Vehicle Type -->
            <div class="vlv-filters">
                <div class="vlv-filter-group">
                    <span class="vlv-filter-label">Type:</span>
                    <div class="vlv-pills" id="vlvVehicleTypeFilter">
                        <button class="vlv-pill active" data-val="all">All</button>
                        <button class="vlv-pill" data-val="car">🚗 Cars</button>
                        <button class="vlv-pill" data-val="motorcycle">🏍️ Motos</button>
                        <button class="vlv-pill" data-val="rv">🚐 RVs</button>
                        <button class="vlv-pill" data-val="boat">⛵ Boats</button>
                    </div>
                </div>
                <div class="vlv-filter-group">
                    <span class="vlv-filter-label">Listing:</span>
                    <div class="vlv-pills" id="vlvListingTypeFilter">
                        <button class="vlv-pill active" data-val="all">All</button>
                        <button class="vlv-pill" data-val="new">New</button>
                        <button class="vlv-pill" data-val="used">Used</button>
                        <button class="vlv-pill" data-val="rent">Rent/Lease</button>
                        <button class="vlv-pill" data-val="auction">Auction</button>
                    </div>
                </div>
                <div class="vlv-filter-group">
                    <span class="vlv-filter-label">Status:</span>
                    <div class="vlv-pills" id="vlvStatusFilter">
                        <button class="vlv-pill active" data-val="all">All</button>
                        <button class="vlv-pill" data-val="active">Active</button>
                        <button class="vlv-pill" data-val="sold">Sold</button>
                        <button class="vlv-pill" data-val="rented">Rented</button>
                    </div>
                </div>
            </div>

            <!-- Compare bar (hidden until 2+ selected) -->
            <div class="vlv-compare-bar" id="vlvCompareBar" style="display:none">
                <span class="vlv-compare-label">Compare: <strong id="vlvCompareCount">0</strong> selected</span>
                <button class="vlv-btn vlv-btn-accent" id="vlvCompareBtn">Compare Now</button>
                <button class="vlv-btn vlv-btn-ghost" id="vlvCompareClear">Clear</button>
            </div>

            <!-- Results count -->
            <div class="vlv-results-meta" id="vlvResultsMeta"></div>

            <!-- Grid -->
            <div class="vlv-grid" id="vlvGrid">
                <div class="vlv-loading">
                    <div class="vlv-spinner"></div>
                    <p>Loading listings…</p>
                </div>
            </div>

            <!-- Compare Modal -->
            <div class="vlv-modal-overlay" id="vlvCompareModal" style="display:none">
                <div class="vlv-modal">
                    <div class="vlv-modal-header">
                        <h2>Vehicle Comparison</h2>
                        <button class="vlv-modal-close" id="vlvModalClose">✕</button>
                    </div>
                    <div class="vlv-modal-body" id="vlvCompareTable"></div>
                </div>
            </div>

            <!-- Pagination -->
            <div class="vlv-pagination" id="vlvPagination"></div>
        </div>`;
    }

    _css() {
        const s = this.styleProps;
        return `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :host { display: block; width: 100%; font-family: ${s.fontFamily}; }

        .vlv-wrap { background: ${s.bgColor}; padding: 32px 20px; min-height: 600px; }

        /* ── Toolbar ── */
        .vlv-toolbar { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
        .vlv-search-wrap { flex: 1; min-width: 240px; position: relative; }
        .vlv-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); font-size: 16px; pointer-events: none; }
        .vlv-search {
            width: 100%; padding: 12px 14px 12px 42px;
            background: ${s.searchBg}; border: 1px solid ${s.searchBorder};
            border-radius: 10px; color: ${s.searchText}; font-size: 14px;
            transition: border-color 0.2s;
        }
        .vlv-search::placeholder { color: ${s.searchPlaceholder}; }
        .vlv-search:focus { outline: none; border-color: ${s.accentColor}; }
        .vlv-sort-wrap { min-width: 180px; }
        .vlv-select {
            width: 100%; padding: 12px 14px;
            background: ${s.searchBg}; border: 1px solid ${s.searchBorder};
            border-radius: 10px; color: ${s.searchText}; font-size: 14px; cursor: pointer;
        }
        .vlv-select:focus { outline: none; border-color: ${s.accentColor}; }

        /* ── Filters ── */
        .vlv-filters { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
        .vlv-filter-group { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
        .vlv-filter-label { font-size: 12px; color: ${s.cardMetaColor}; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; min-width: 52px; }
        .vlv-pills { display: flex; gap: 6px; flex-wrap: wrap; }
        .vlv-pill {
            padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 500;
            border: 1px solid ${s.filterBorder}; background: ${s.filterBg};
            color: ${s.filterText}; cursor: pointer; transition: all 0.2s;
        }
        .vlv-pill:hover { border-color: ${s.accentColor}; color: ${s.accentColor}; }
        .vlv-pill.active { background: ${s.filterActiveBg}; color: ${s.filterActiveText}; border-color: ${s.filterActiveBg}; }

        /* ── Compare Bar ── */
        .vlv-compare-bar {
            display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
            background: ${s.compareBg}; border: 2px solid ${s.compareBorder};
            border-radius: 12px; padding: 14px 20px; margin-bottom: 20px;
        }
        .vlv-compare-label { color: ${s.compareText}; font-size: 14px; flex: 1; }

        /* ── Buttons ── */
        .vlv-btn {
            padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600;
            cursor: pointer; border: none; transition: all 0.2s;
        }
        .vlv-btn-accent { background: ${s.btnBg}; color: ${s.btnText}; }
        .vlv-btn-accent:hover { background: ${s.accentHover}; }
        .vlv-btn-ghost { background: transparent; color: ${s.btnBorderText}; border: 1px solid ${s.btnBorderColor}; }
        .vlv-btn-ghost:hover { background: ${s.btnBorderColor}; color: ${s.btnText}; }

        /* ── Results Meta ── */
        .vlv-results-meta { font-size: 13px; color: ${s.cardMetaColor}; margin-bottom: 16px; }

        /* ── Grid ── */
        .vlv-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
            gap: 24px; margin-bottom: 40px;
        }

        /* ── Card ── */
        .vlv-card {
            background: ${s.cardBg}; border: 1px solid ${s.cardBorder};
            border-radius: 16px; overflow: hidden;
            box-shadow: 0 4px 12px ${s.cardShadow};
            transition: transform 0.3s, box-shadow 0.3s, border-color 0.3s;
            display: flex; flex-direction: column;
            position: relative;
        }
        .vlv-card:hover { transform: translateY(-4px); box-shadow: 0 12px 28px ${s.cardHoverShadow}; border-color: ${s.accentColor}; }
        .vlv-card.vlv-compare-selected { border-color: ${s.accentColor}; box-shadow: 0 0 0 2px ${s.accentColor}; }

        /* ── Card Image ── */
        .vlv-card-img-wrap { width: 100%; height: 220px; overflow: hidden; background: ${s.cardBorder}; position: relative; }
        .vlv-card-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; display: block; }
        .vlv-card:hover .vlv-card-img { transform: scale(1.05); }
        .vlv-card-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; color: ${s.cardMetaColor}; }

        /* ── Badges ── */
        .vlv-badges { position: absolute; top: 12px; left: 12px; display: flex; gap: 6px; flex-wrap: wrap; }
        .vlv-badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px; }
        .vlv-badge-new      { background: ${s.badgeNewBg};     color: ${s.badgeNewText}; }
        .vlv-badge-used     { background: ${s.badgeUsedBg};    color: ${s.badgeUsedText}; }
        .vlv-badge-rent     { background: ${s.badgeRentBg};    color: ${s.badgeRentText}; }
        .vlv-badge-auction  { background: ${s.badgeAuctionBg}; color: ${s.badgeAuctionText}; }
        .vlv-badge-featured { background: ${s.badgeFeaturedBg}; color: ${s.badgeFeaturedText}; }
        .vlv-badge-sold     { background: #374151; color: #9ca3af; }
        .vlv-badge-rented   { background: #374151; color: #9ca3af; }

        /* ── Compare Checkbox ── */
        .vlv-compare-cb-wrap { position: absolute; top: 12px; right: 12px; }
        .vlv-compare-cb {
            width: 22px; height: 22px; cursor: pointer; accent-color: ${s.accentColor};
            border-radius: 4px;
        }

        /* ── Card Body ── */
        .vlv-card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 10px; }
        .vlv-card-title { font-size: 18px; font-weight: 700; color: ${s.cardTitleColor}; line-height: 1.3; }
        .vlv-card-subtitle { font-size: 13px; color: ${s.cardMetaColor}; }

        /* ── Specs row ── */
        .vlv-specs { display: flex; gap: 14px; flex-wrap: wrap; }
        .vlv-spec { display: flex; align-items: center; gap: 5px; font-size: 12px; color: ${s.cardBodyColor}; }
        .vlv-spec-icon { font-size: 14px; }

        /* ── Price ── */
        .vlv-price-row { display: flex; align-items: baseline; gap: 10px; margin-top: 4px; }
        .vlv-price-main { font-size: 22px; font-weight: 800; color: ${s.pricePrimaryColor}; }
        .vlv-price-orig { font-size: 14px; color: ${s.priceSecondaryColor}; text-decoration: line-through; }
        .vlv-price-note { font-size: 12px; color: ${s.cardMetaColor}; }

        /* ── Card Footer ── */
        .vlv-card-footer { padding: 14px 20px; border-top: 1px solid ${s.cardBorder}; display: flex; gap: 10px; }
        .vlv-card-footer .vlv-btn { flex: 1; text-align: center; font-size: 13px; padding: 9px 10px; }

        /* ── Empty ── */
        .vlv-empty { grid-column: 1/-1; text-align: center; padding: 80px 20px; color: ${s.emptyColor}; }
        .vlv-empty-icon { font-size: 56px; margin-bottom: 16px; }
        .vlv-empty h3 { font-size: 22px; margin-bottom: 8px; color: ${s.cardBodyColor}; }

        /* ── Loading ── */
        .vlv-loading { grid-column: 1/-1; text-align: center; padding: 80px 20px; color: ${s.cardMetaColor}; }
        .vlv-spinner { width: 44px; height: 44px; border: 4px solid ${s.cardBorder}; border-top-color: ${s.accentColor}; border-radius: 50%; animation: vlv-spin 0.8s linear infinite; margin: 0 auto 16px; }
        @keyframes vlv-spin { to { transform: rotate(360deg); } }

        /* ── Compare Modal ── */
        .vlv-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 9999; display: flex; align-items: flex-start; justify-content: center; padding: 40px 16px; overflow-y: auto; }
        .vlv-modal { background: ${s.cardBg}; border: 1px solid ${s.cardBorder}; border-radius: 16px; width: 100%; max-width: 1100px; overflow: hidden; }
        .vlv-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid ${s.cardBorder}; }
        .vlv-modal-header h2 { color: ${s.cardTitleColor}; font-size: 20px; }
        .vlv-modal-close { background: none; border: none; color: ${s.cardMetaColor}; font-size: 20px; cursor: pointer; padding: 4px 8px; border-radius: 6px; transition: color 0.2s; }
        .vlv-modal-close:hover { color: ${s.accentColor}; }
        .vlv-modal-body { padding: 24px; overflow-x: auto; }
        .vlv-cmp-table { width: 100%; border-collapse: collapse; }
        .vlv-cmp-table th, .vlv-cmp-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid ${s.cardBorder}; font-size: 14px; }
        .vlv-cmp-table th { background: ${s.filterBg}; color: ${s.accentColor}; font-weight: 700; min-width: 200px; }
        .vlv-cmp-table td { color: ${s.cardBodyColor}; }
        .vlv-cmp-table tr:nth-child(even) td { background: rgba(255,255,255,0.02); }
        .vlv-cmp-img { width: 100%; height: 140px; object-fit: cover; border-radius: 8px; margin-bottom: 8px; }
        .vlv-cmp-title { font-weight: 700; color: ${s.cardTitleColor}; font-size: 15px; }

        /* ── Pagination ── */
        .vlv-pagination { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 20px; flex-wrap: wrap; }
        .vlv-page-btn {
            padding: 10px 16px; border: 1px solid ${s.paginationBorder}; border-radius: 8px;
            background: ${s.cardBg}; color: ${s.paginationText}; font-size: 14px; font-weight: 600;
            cursor: pointer; transition: all 0.2s; min-width: 42px;
        }
        .vlv-page-btn:hover:not(:disabled) { background: ${s.paginationHoverBg}; border-color: ${s.accentColor}; color: ${s.accentColor}; }
        .vlv-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .vlv-page-btn.active { background: ${s.paginationActiveBg}; border-color: ${s.paginationActiveBg}; color: ${s.paginationActiveText}; }
        .vlv-page-info { font-size: 13px; color: ${s.cardMetaColor}; }

        /* ── Responsive ── */
        @media (max-width: 768px) {
            .vlv-wrap { padding: 20px 12px; }
            .vlv-grid { grid-template-columns: 1fr; gap: 16px; }
            .vlv-toolbar { flex-direction: column; }
            .vlv-filter-group { gap: 6px; }
        }
        `;
    }

    _updateStyles() {
        const styleEl = this.shadowRoot.querySelector('style');
        if (styleEl) styleEl.textContent = this._css();
    }

    _bindControls() {
        const sr = this.shadowRoot;

        // Search — debounced
        let searchTimer;
        sr.getElementById('vlvSearch').addEventListener('input', (e) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                this._searchQuery = e.target.value.toLowerCase().trim();
                this._renderListings();
            }, 300);
        });

        // Sort
        sr.getElementById('vlvSort').addEventListener('change', (e) => {
            this._sortBy = e.target.value;
            this._renderListings();
        });

        // Vehicle type filter pills
        sr.getElementById('vlvVehicleTypeFilter').addEventListener('click', (e) => {
            const btn = e.target.closest('.vlv-pill');
            if (!btn) return;
            sr.querySelectorAll('#vlvVehicleTypeFilter .vlv-pill').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            this._filterVehicleType = btn.dataset.val;
            this._renderListings();
        });

        // Listing type filter pills
        sr.getElementById('vlvListingTypeFilter').addEventListener('click', (e) => {
            const btn = e.target.closest('.vlv-pill');
            if (!btn) return;
            sr.querySelectorAll('#vlvListingTypeFilter .vlv-pill').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            this._filterListingType = btn.dataset.val;
            this._renderListings();
        });

        // Status filter pills
        sr.getElementById('vlvStatusFilter').addEventListener('click', (e) => {
            const btn = e.target.closest('.vlv-pill');
            if (!btn) return;
            sr.querySelectorAll('#vlvStatusFilter .vlv-pill').forEach(p => p.classList.remove('active'));
            btn.classList.add('active');
            this._filterStatus = btn.dataset.val;
            this._renderListings();
        });

        // Compare button
        sr.getElementById('vlvCompareBtn').addEventListener('click', () => {
            this._showCompareModal();
        });

        // Clear compare
        sr.getElementById('vlvCompareClear').addEventListener('click', () => {
            this._compareIds = [];
            this._updateCompareBar();
            sr.querySelectorAll('.vlv-compare-cb').forEach(cb => { cb.checked = false; });
            sr.querySelectorAll('.vlv-card').forEach(c => c.classList.remove('vlv-compare-selected'));
        });

        // Modal close
        sr.getElementById('vlvModalClose').addEventListener('click', () => {
            sr.getElementById('vlvCompareModal').style.display = 'none';
        });
    }

    // ─── Filter & Sort ───────────────────────────────────────────────────────
    _getFilteredSorted() {
        let list = [...this._listings];

        // Search
        if (this._searchQuery) {
            list = list.filter(v => {
                const hay = [v.make, v.model, v.trim, v.year, v.vin, v.stockNumber, v.title]
                    .join(' ').toLowerCase();
                return hay.includes(this._searchQuery);
            });
        }

        // Vehicle type
        if (this._filterVehicleType !== 'all') {
            list = list.filter(v => v.vehicleType === this._filterVehicleType);
        }

        // Listing type
        if (this._filterListingType !== 'all') {
            list = list.filter(v => v.listingType === this._filterListingType);
        }

        // Status
        if (this._filterStatus !== 'all') {
            list = list.filter(v => v.status === this._filterStatus);
        }

        // Sort
        list.sort((a, b) => {
            switch (this._sortBy) {
                case 'price-asc':  return (a.price || 0) - (b.price || 0);
                case 'price-desc': return (b.price || 0) - (a.price || 0);
                case 'year-desc':  return (b.year || 0) - (a.year || 0);
                case 'year-asc':   return (a.year || 0) - (b.year || 0);
                case 'mileage-asc':return (a.mileage || 0) - (b.mileage || 0);
                case 'oldest':     return new Date(a._createdDate) - new Date(b._createdDate);
                default:           return new Date(b._createdDate) - new Date(a._createdDate);
            }
        });

        return list;
    }

    // ─── Render ──────────────────────────────────────────────────────────────
    _renderListings() {
        const grid    = this.shadowRoot.getElementById('vlvGrid');
        const metaEl  = this.shadowRoot.getElementById('vlvResultsMeta');
        const filtered = this._getFilteredSorted();

        metaEl.textContent = `Showing ${filtered.length} listing${filtered.length !== 1 ? 's' : ''}`;

        if (!filtered.length) {
            grid.innerHTML = `
                <div class="vlv-empty">
                    <div class="vlv-empty-icon">🚗</div>
                    <h3>No listings found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                </div>`;
            this._renderPagination();
            return;
        }

        grid.innerHTML = filtered.map((v, idx) => this._cardHTML(v, idx)).join('');

        // Bind card interactions
        grid.querySelectorAll('.vlv-read-btn').forEach(btn => {
            btn.addEventListener('click', () => this._navigate(btn.dataset.slug));
        });

        grid.querySelectorAll('.vlv-compare-cb').forEach(cb => {
            cb.addEventListener('change', () => {
                const id = cb.dataset.id;
                if (cb.checked) {
                    if (this._compareIds.length >= 4) {
                        cb.checked = false;
                        alert('You can compare up to 4 vehicles at a time.');
                        return;
                    }
                    this._compareIds.push(id);
                    cb.closest('.vlv-card').classList.add('vlv-compare-selected');
                } else {
                    this._compareIds = this._compareIds.filter(i => i !== id);
                    cb.closest('.vlv-card').classList.remove('vlv-compare-selected');
                }
                this._updateCompareBar();
            });
        });

        this._renderPagination();
    }

    _cardHTML(v, idx) {
        const title    = v.title || `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim() || 'Vehicle';
        const imgUrl   = this._imgUrl(v.primaryImage, 680, 440);
        const isAbove  = idx < 6;
        const price    = this._formatPrice(v.price, v.salePrice, v.currency, v.listingType, v.rentalPricePerDay, v.auctionStartPrice);
        const listBadge = this._listingBadge(v.listingType, v.condition);
        const statusBadge = (v.status === 'sold' || v.status === 'rented')
            ? `<span class="vlv-badge vlv-badge-${v.status}">${v.status}</span>` : '';
        const featuredBadge = v.featured ? `<span class="vlv-badge vlv-badge-featured">⭐ Featured</span>` : '';

        const specMileage = v.mileage ? `<span class="vlv-spec"><span class="vlv-spec-icon">📍</span>${Number(v.mileage).toLocaleString()} mi</span>` : '';
        const specFuel    = v.fuelType ? `<span class="vlv-spec"><span class="vlv-spec-icon">⛽</span>${v.fuelType}</span>` : '';
        const specTrans   = v.transmission ? `<span class="vlv-spec"><span class="vlv-spec-icon">⚙️</span>${v.transmission}</span>` : '';
        const specColor   = v.exteriorColor ? `<span class="vlv-spec"><span class="vlv-spec-icon">🎨</span>${v.exteriorColor}</span>` : '';

        const imgEl = imgUrl
            ? `<img class="vlv-card-img" src="${imgUrl}" alt="${this._esc(title)}" width="340" height="220" loading="${isAbove ? 'eager' : 'lazy'}" decoding="${isAbove ? 'sync' : 'async'}" onerror="this.parentNode.innerHTML='<div class=vlv-card-img-placeholder>🚗</div>'" />`
            : `<div class="vlv-card-img-placeholder">🚗</div>`;

        return `
        <article class="vlv-card" data-id="${v._id}">
            <div class="vlv-card-img-wrap">
                ${imgEl}
                <div class="vlv-badges">${listBadge}${statusBadge}${featuredBadge}</div>
                <div class="vlv-compare-cb-wrap">
                    <input type="checkbox" class="vlv-compare-cb" data-id="${v._id}" title="Add to compare" ${this._compareIds.includes(v._id) ? 'checked' : ''} />
                </div>
            </div>
            <div class="vlv-card-body">
                <div class="vlv-card-title">${this._esc(title)}</div>
                <div class="vlv-card-subtitle">${[v.bodyStyle, v.drivetrain, v.engine].filter(Boolean).join(' · ')}</div>
                <div class="vlv-specs">
                    ${specMileage}${specFuel}${specTrans}${specColor}
                </div>
                <div class="vlv-price-row">
                    ${price}
                </div>
            </div>
            <div class="vlv-card-footer">
                <button class="vlv-btn vlv-btn-accent vlv-read-btn" data-slug="${v.slug}">View Details →</button>
            </div>
        </article>`;
    }

    _listingBadge(type, condition) {
        const map = {
            new:     ['new',     'New'],
            used:    ['used',    'Used'],
            rent:    ['rent',    'Rent/Lease'],
            auction: ['auction', 'Auction'],
        };
        const [cls, label] = map[type] || ['used', type || 'Used'];
        return `<span class="vlv-badge vlv-badge-${cls}">${label}</span>`;
    }

    _formatPrice(price, salePrice, currency, listingType, rentalPerDay, auctionStart) {
        const sym = currency === 'INR' ? '₹' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$';
        const fmt = (n) => sym + Number(n).toLocaleString();

        if (listingType === 'rent' && rentalPerDay) {
            return `<span class="vlv-price-main">${fmt(rentalPerDay)}<small style="font-size:13px;font-weight:500">/day</small></span>`;
        }
        if (listingType === 'auction' && auctionStart) {
            return `<span class="vlv-price-main">Starts ${fmt(auctionStart)}</span><span class="vlv-price-note">Auction</span>`;
        }
        if (salePrice && salePrice < price) {
            return `<span class="vlv-price-main">${fmt(salePrice)}</span><span class="vlv-price-orig">${fmt(price)}</span>`;
        }
        if (price) {
            return `<span class="vlv-price-main">${fmt(price)}</span>`;
        }
        return `<span class="vlv-price-note">Price on request</span>`;
    }

    _imgUrl(raw, w = 400, h = 240) {
        if (!raw || typeof raw !== 'string') return '';
        if (raw.startsWith('https://static.wixstatic.com/media/')) {
            try {
                const filename = raw.split('/media/')[1]?.split('/')[0];
                if (!filename) return raw;
                const params = `w_${w},h_${h},al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto`;
                return `https://static.wixstatic.com/media/${filename}/v1/fill/${params}/${filename}`;
            } catch (convErr) {
                console.log('vehicle-list-viewer: URL conversion skipped', convErr.message);
                return raw;
            }
        }
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        if (raw.startsWith('wix:image://')) {
            try {
                const fileId = raw.split('/')[3]?.split('#')[0];
                if (!fileId) return '';
                let filename = fileId.includes('~mv2') ? fileId : `${fileId}~mv2.jpg`;
                if (!filename.includes('.')) filename += '.jpg';
                const params = `w_${w},h_${h},al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto`;
                return `https://static.wixstatic.com/media/${filename}/v1/fill/${params}/${filename}`;
            } catch (convErr) {
                console.log('vehicle-list-viewer: wix:image parse skipped', convErr.message);
            }
        }
        return '';
    }

    _esc(t) {
        if (!t) return '';
        const d = document.createElement('div');
        d.textContent = t;
        return d.innerHTML;
    }

    // ─── Compare Modal ───────────────────────────────────────────────────────
    _showCompareModal() {
        const vehicles = this._listings.filter(v => this._compareIds.includes(v._id));
        if (vehicles.length < 2) return;

        const fields = [
            ['Year',           v => v.year || '—'],
            ['Make',           v => v.make || '—'],
            ['Model',          v => v.model || '—'],
            ['Trim',           v => v.trim || '—'],
            ['Body Style',     v => v.bodyStyle || '—'],
            ['Mileage',        v => v.mileage ? Number(v.mileage).toLocaleString() + ' mi' : '—'],
            ['Engine',         v => v.engine || '—'],
            ['Transmission',   v => v.transmission || '—'],
            ['Drivetrain',     v => v.drivetrain || '—'],
            ['Fuel Type',      v => v.fuelType || '—'],
            ['MPG City',       v => v.mpgCity ? v.mpgCity + ' mpg' : '—'],
            ['MPG Hwy',        v => v.mpgHighway ? v.mpgHighway + ' mpg' : '—'],
            ['Exterior Color', v => v.exteriorColor || '—'],
            ['Interior Color', v => v.interiorColor || '—'],
            ['Seating',        v => v.seatingCapacity ? v.seatingCapacity + ' seats' : '—'],
            ['Price',          v => v.salePrice ? '$' + Number(v.salePrice).toLocaleString() : v.price ? '$' + Number(v.price).toLocaleString() : '—'],
            ['VIN',            v => v.vin || '—'],
            ['Stock #',        v => v.stockNumber || '—'],
            ['Condition',      v => v.condition || '—'],
            ['Warranty',       v => v.warrantyType || '—'],
        ];

        const headerCells = vehicles.map(v => {
            const imgUrl = this._imgUrl(v.primaryImage, 400, 240);
            const title  = v.title || `${v.year} ${v.make} ${v.model}`;
            return `<th>
                ${imgUrl ? `<img class="vlv-cmp-img" src="${imgUrl}" alt="${this._esc(title)}" loading="lazy" />` : ''}
                <div class="vlv-cmp-title">${this._esc(title)}</div>
            </th>`;
        }).join('');

        const rows = fields.map(([label, getter]) => {
            const cells = vehicles.map(v => `<td>${this._esc(String(getter(v)))}</td>`).join('');
            return `<tr><th>${label}</th>${cells}</tr>`;
        }).join('');

        this.shadowRoot.getElementById('vlvCompareTable').innerHTML = `
            <table class="vlv-cmp-table">
                <thead><tr><th>Spec</th>${headerCells}</tr></thead>
                <tbody>${rows}</tbody>
            </table>`;

        this.shadowRoot.getElementById('vlvCompareModal').style.display = 'flex';
    }

    _updateCompareBar() {
        const bar   = this.shadowRoot.getElementById('vlvCompareBar');
        const count = this.shadowRoot.getElementById('vlvCompareCount');
        count.textContent = this._compareIds.length;
        bar.style.display = this._compareIds.length >= 2 ? 'flex' : 'none';
    }

    // ─── Pagination ──────────────────────────────────────────────────────────
    _renderPagination() {
        const pag = this.shadowRoot.getElementById('vlvPagination');
        if (this._totalPages <= 1) { pag.innerHTML = ''; return; }

        const maxV = 5;
        let start = Math.max(1, this._currentPage - 2);
        let end   = Math.min(this._totalPages, start + maxV - 1);
        if (end - start < maxV - 1) start = Math.max(1, end - maxV + 1);

        let html = `<button class="vlv-page-btn" id="vlvPrevBtn" ${this._currentPage === 1 ? 'disabled' : ''}>← Prev</button>`;

        if (start > 1) {
            html += `<button class="vlv-page-btn" data-page="1">1</button>`;
            if (start > 2) html += `<span class="vlv-page-info">…</span>`;
        }
        for (let i = start; i <= end; i++) {
            html += `<button class="vlv-page-btn ${i === this._currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        if (end < this._totalPages) {
            if (end < this._totalPages - 1) html += `<span class="vlv-page-info">…</span>`;
            html += `<button class="vlv-page-btn" data-page="${this._totalPages}">${this._totalPages}</button>`;
        }

        html += `<button class="vlv-page-btn" id="vlvNextBtn" ${this._currentPage === this._totalPages ? 'disabled' : ''}>Next →</button>`;

        pag.innerHTML = html;

        pag.querySelector('#vlvPrevBtn')?.addEventListener('click', () => {
            if (this._currentPage > 1) this._changePage(this._currentPage - 1);
        });
        pag.querySelector('#vlvNextBtn')?.addEventListener('click', () => {
            if (this._currentPage < this._totalPages) this._changePage(this._currentPage + 1);
        });
        pag.querySelectorAll('.vlv-page-btn[data-page]').forEach(btn => {
            btn.addEventListener('click', () => this._changePage(parseInt(btn.dataset.page)));
        });
    }

    _changePage(page) {
        this.dispatchEvent(new CustomEvent('page-change', {
            detail: { page }, bubbles: true, composed: true
        }));
    }

    _navigate(slug) {
        this.dispatchEvent(new CustomEvent('navigate-to-listing', {
            detail: { slug }, bubbles: true, composed: true
        }));
    }
}

customElements.define('vehicle-list-viewer', VehicleListViewer);
