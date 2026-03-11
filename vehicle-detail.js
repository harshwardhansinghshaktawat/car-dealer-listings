/**
 * CUSTOM ELEMENT — Vehicle Detail Viewer
 * Tag: <vehicle-detail-viewer>
 *
 * Attributes set by widget:
 *   vehicle-data   — JSON: full CMS listing item
 *   view-count     — string number
 *   style-props    — JSON style token map
 *
 * Events dispatched:
 *   navigate-to-listing  — { slug } (related / breadcrumb)
 *   submit-lead          — { formData }
 *   seo-markup-ready     — { markup }
 */
class VehicleDetailViewer extends HTMLElement {
    constructor() {
        super();

        this.state = {
            vehicleData: null,
            isLoading:   true,
            viewCount:   0,
            gallery:     [],
            activeGalleryIdx: 0,
        };

        this.initialRenderDone = false;
        this.isMobile = window.innerWidth <= 768;

        const raw = this.getAttribute('style-props');
        this.styleProps = raw ? JSON.parse(raw) : this._defaultStyleProps();
    }

    static get observedAttributes() {
        return ['vehicle-data', 'view-count', 'style-props'];
    }

    _defaultStyleProps() {
        return {
            fontFamily:         '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            bgColor:            '#0f1117',
            accentColor:        '#f97316',
            accentHover:        '#ea580c',

            titleColor:         '#ffffff',
            bodyColor:          '#94a3b8',
            metaColor:          '#64748b',

            cardBg:             '#1a1d27',
            cardBorder:         '#2a2d3a',

            sectionTitleColor:  '#f97316',

            priceColor:         '#f97316',
            priceOrigColor:     '#64748b',

            specLabelColor:     '#64748b',
            specValueColor:     '#e2e8f0',
            specRowAltBg:       '#141720',

            badgeNewBg:         '#166534',
            badgeNewText:       '#bbf7d0',
            badgeUsedBg:        '#1e3a5f',
            badgeUsedText:      '#93c5fd',
            badgeRentBg:        '#4c1d95',
            badgeRentText:      '#ddd6fe',
            badgeAuctionBg:     '#7c2d12',
            badgeAuctionText:   '#fed7aa',

            calcInputBg:        '#141720',
            calcInputBorder:    '#2a2d3a',
            calcInputText:      '#ffffff',
            calcResultBg:       '#1a1d27',
            calcResultText:     '#f97316',

            formInputBg:        '#141720',
            formInputBorder:    '#2a2d3a',
            formInputText:      '#ffffff',
            formLabelColor:     '#94a3b8',

            btnBg:              '#f97316',
            btnText:            '#ffffff',
            btnGhostBorder:     '#f97316',
            btnGhostText:       '#f97316',

            shareBg:            '#1a1d27',
            shareBorder:        '#2a2d3a',
            shareText:          '#94a3b8',
            shareHover:         '#f97316',

            galleryThumbBorder: '#2a2d3a',
            galleryThumbActive: '#f97316',

            viewCountBg:        '#1a1d27',
            viewCountText:      '#f97316',
            viewCountBorder:    '#2a2d3a',
        };
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (!newVal || oldVal === newVal) return;

        if (name === 'vehicle-data') {
            try {
                const data = typeof newVal === 'string' ? JSON.parse(newVal) : newVal;
                this.state.vehicleData = data;
                this.state.isLoading   = false;

                // Parse gallery
                let gallery = [];
                try {
                    if (typeof data.gallery === 'string' && data.gallery) {
                        gallery = JSON.parse(data.gallery);
                    } else if (Array.isArray(data.gallery)) {
                        gallery = data.gallery;
                    }
                } catch (galErr) {
                    console.log('vehicle-detail-viewer: gallery parse skipped', galErr.message);
                }

                // Always include primary image at front if not already in gallery
                if (data.primaryImage) {
                    const primaryUrl = this._imgUrl(data.primaryImage, 1200, 700);
                    if (primaryUrl && !gallery.some(g => (g.url || g) === data.primaryImage)) {
                        gallery.unshift({ url: data.primaryImage, alt: data.title || 'Vehicle' });
                    }
                }
                this.state.gallery = gallery;
                this.state.activeGalleryIdx = 0;

                if (this.initialRenderDone) {
                    requestAnimationFrame(() => {
                        this._renderVehicle();
                        this._emitSEO();
                    });
                }
            } catch (parseErr) {
                console.error('vehicle-detail-viewer: vehicle-data parse error', parseErr.message);
            }
        } else if (name === 'view-count') {
            try {
                this.state.viewCount = parseInt(newVal) || 0;
                if (this.initialRenderDone) this._updateViewCount();
            } catch (vcErr) {
                console.log('vehicle-detail-viewer: view-count parse skipped', vcErr.message);
            }
        } else if (name === 'style-props') {
            try {
                this.styleProps = { ...this.styleProps, ...JSON.parse(newVal) };
                if (this.initialRenderDone) this._updateStyles();
            } catch (spErr) {
                console.error('vehicle-detail-viewer: style-props parse error', spErr.message);
            }
        }
    }

    connectedCallback() {
        if (!this.initialRenderDone) this._initUI();
    }

    _initUI() {
        this.innerHTML = `<style>${this._css()}</style>${this._shell()}`;

        this._container     = this.querySelector('.vdv-container');
        this._galleryMain   = this.querySelector('#vdvGalleryMain');
        this._galleryThumbs = this.querySelector('#vdvGalleryThumbs');
        this._specsSection  = this.querySelector('#vdvSpecs');
        this._priceSection  = this.querySelector('#vdvPricing');
        this._calcSection   = this.querySelector('#vdvCalc');
        this._leadSection   = this.querySelector('#vdvLead');
        this._dealerSection = this.querySelector('#vdvDealer');
        this._viewCountEl   = this.querySelector('#vdvViewCount');

        this.initialRenderDone = true;

        if (!this.state.isLoading && this.state.vehicleData) {
            this._renderVehicle();
            this._emitSEO();
        } else {
            this._showLoading();
        }
    }

    _shell() {
        return `
        <div class="vdv-container">
            <!-- Breadcrumb -->
            <nav class="vdv-breadcrumb" id="vdvBreadcrumb">
                <button class="vdv-breadcrumb-link" id="vdvBackBtn">← All Listings</button>
            </nav>

            <!-- Hero: Gallery + Summary -->
            <div class="vdv-hero">
                <!-- Gallery -->
                <div class="vdv-gallery" id="vdvGallery">
                    <div class="vdv-gallery-main" id="vdvGalleryMain">
                        <div class="vdv-gallery-placeholder">🚗</div>
                    </div>
                    <div class="vdv-gallery-thumbs" id="vdvGalleryThumbs"></div>
                </div>

                <!-- Summary sidebar -->
                <div class="vdv-summary" id="vdvSummary">
                    <div class="vdv-summary-loading">
                        <div class="vdv-spinner"></div>
                        <p>Loading vehicle…</p>
                    </div>
                </div>
            </div>

            <!-- Tabs -->
            <div class="vdv-tabs" id="vdvTabs">
                <button class="vdv-tab active" data-tab="specs">Specifications</button>
                <button class="vdv-tab" data-tab="features">Features</button>
                <button class="vdv-tab" data-tab="history">History</button>
                <button class="vdv-tab" data-tab="media">Media</button>
            </div>

            <!-- Tab panels -->
            <div class="vdv-tab-content" id="vdvTabContent">
                <div class="vdv-tab-panel active" id="vdvTabSpecs"></div>
                <div class="vdv-tab-panel" id="vdvTabFeatures"></div>
                <div class="vdv-tab-panel" id="vdvTabHistory"></div>
                <div class="vdv-tab-panel" id="vdvTabMedia"></div>
            </div>

            <!-- Finance Calculator -->
            <div class="vdv-section" id="vdvCalc" style="display:none">
                <h2 class="vdv-section-title">💰 Finance Calculator</h2>
                <div class="vdv-calc-grid">
                    <div class="vdv-calc-field">
                        <label class="vdv-label">Vehicle Price ($)</label>
                        <input type="number" class="vdv-input" id="calcPrice" />
                    </div>
                    <div class="vdv-calc-field">
                        <label class="vdv-label">Down Payment ($)</label>
                        <input type="number" class="vdv-input" id="calcDown" value="0" />
                    </div>
                    <div class="vdv-calc-field">
                        <label class="vdv-label">Interest Rate (% / year)</label>
                        <input type="number" class="vdv-input" id="calcRate" value="6.9" step="0.1" />
                    </div>
                    <div class="vdv-calc-field">
                        <label class="vdv-label">Loan Term (months)</label>
                        <input type="number" class="vdv-input" id="calcTerm" value="60" />
                    </div>
                </div>
                <div class="vdv-calc-results" id="vdvCalcResults">
                    <div class="vdv-calc-result">
                        <div class="vdv-calc-result-label">Monthly Payment</div>
                        <div class="vdv-calc-result-value" id="calcMonthly">—</div>
                    </div>
                    <div class="vdv-calc-result">
                        <div class="vdv-calc-result-label">Total Cost</div>
                        <div class="vdv-calc-result-value" id="calcTotal">—</div>
                    </div>
                    <div class="vdv-calc-result">
                        <div class="vdv-calc-result-label">Total Interest</div>
                        <div class="vdv-calc-result-value" id="calcInterest">—</div>
                    </div>
                </div>
            </div>

            <!-- Lead Capture Form -->
            <div class="vdv-section" id="vdvLead" style="display:none">
                <h2 class="vdv-section-title" id="vdvLeadTitle">📩 Interested in this vehicle?</h2>
                <form class="vdv-form" id="vdvLeadForm" onsubmit="return false;">
                    <div class="vdv-form-row">
                        <div class="vdv-form-field">
                            <label class="vdv-label">Full Name *</label>
                            <input type="text" class="vdv-input" id="leadName" required />
                        </div>
                        <div class="vdv-form-field">
                            <label class="vdv-label">Email *</label>
                            <input type="email" class="vdv-input" id="leadEmail" required />
                        </div>
                    </div>
                    <div class="vdv-form-row">
                        <div class="vdv-form-field">
                            <label class="vdv-label">Phone</label>
                            <input type="tel" class="vdv-input" id="leadPhone" />
                        </div>
                        <div class="vdv-form-field">
                            <label class="vdv-label">Preferred Contact Time</label>
                            <input type="text" class="vdv-input" id="leadContactTime" placeholder="e.g. Weekday mornings" />
                        </div>
                    </div>
                    <div class="vdv-form-field">
                        <label class="vdv-label">Message</label>
                        <textarea class="vdv-input vdv-textarea" id="leadMessage" rows="4" placeholder="Ask about this vehicle…"></textarea>
                    </div>
                    <div class="vdv-form-checkboxes">
                        <label class="vdv-check-label"><input type="checkbox" id="leadFinancing" /> Interested in financing</label>
                        <label class="vdv-check-label"><input type="checkbox" id="leadTestDrive" /> Request a test drive</label>
                        <label class="vdv-check-label"><input type="checkbox" id="leadTradeIn" /> Have a trade-in</label>
                    </div>
                    <button type="submit" class="vdv-btn vdv-btn-accent" id="vdvLeadSubmit">Send Enquiry</button>
                    <div class="vdv-form-msg" id="vdvLeadMsg" style="display:none"></div>
                </form>
            </div>

            <!-- Dealer Info -->
            <div class="vdv-section" id="vdvDealer" style="display:none">
                <h2 class="vdv-section-title">🏢 Dealer Information</h2>
                <div class="vdv-dealer-grid" id="vdvDealerContent"></div>
            </div>
        </div>`;
    }

    _css() {
        const s = this.styleProps;
        return `
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        vehicle-detail-viewer { display: block; width: 100%; font-family: ${s.fontFamily}; }
        vehicle-detail-viewer * { box-sizing: border-box; }

        .vdv-container { background: ${s.bgColor}; max-width: 1400px; margin: 0 auto; padding: 32px 20px; }

        /* ── Breadcrumb ── */
        .vdv-breadcrumb { margin-bottom: 20px; }
        .vdv-breadcrumb-link {
            background: none; border: none; color: ${s.accentColor}; font-size: 14px;
            font-weight: 600; cursor: pointer; padding: 0; transition: opacity 0.2s;
            font-family: ${s.fontFamily};
        }
        .vdv-breadcrumb-link:hover { opacity: 0.8; }

        /* ── Hero ── */
        .vdv-hero { display: grid; grid-template-columns: 1fr 380px; gap: 28px; margin-bottom: 32px; }

        /* ── Gallery ── */
        .vdv-gallery { display: flex; flex-direction: column; gap: 12px; }
        .vdv-gallery-main {
            width: 100%; aspect-ratio: 16/9; border-radius: 16px; overflow: hidden;
            background: ${s.cardBg}; position: relative;
        }
        .vdv-gallery-img { width: 100%; height: 100%; object-fit: cover; display: block; transition: opacity 0.3s; }
        .vdv-gallery-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 72px; color: ${s.metaColor}; }
        .vdv-gallery-nav {
            position: absolute; top: 50%; transform: translateY(-50%);
            background: rgba(0,0,0,0.6); border: none; color: #fff; font-size: 20px;
            width: 40px; height: 40px; border-radius: 50%; cursor: pointer; display: flex;
            align-items: center; justify-content: center; transition: background 0.2s; z-index: 2;
        }
        .vdv-gallery-nav:hover { background: ${s.accentColor}; }
        .vdv-gallery-prev { left: 12px; }
        .vdv-gallery-next { right: 12px; }
        .vdv-gallery-counter { position: absolute; bottom: 10px; right: 14px; background: rgba(0,0,0,0.6); color: #fff; font-size: 12px; padding: 4px 10px; border-radius: 12px; }

        .vdv-gallery-thumbs { display: flex; gap: 8px; flex-wrap: wrap; }
        .vdv-thumb {
            width: 72px; height: 52px; border-radius: 8px; overflow: hidden; cursor: pointer;
            border: 2px solid ${s.galleryThumbBorder}; transition: border-color 0.2s; flex-shrink: 0;
        }
        .vdv-thumb.active { border-color: ${s.galleryThumbActive}; }
        .vdv-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }

        /* ── Summary Sidebar ── */
        .vdv-summary {
            background: ${s.cardBg}; border: 1px solid ${s.cardBorder}; border-radius: 16px;
            padding: 24px; display: flex; flex-direction: column; gap: 16px;
            position: sticky; top: 16px; align-self: flex-start;
        }
        .vdv-summary-loading { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 0; color: ${s.metaColor}; }
        .vdv-spinner { width: 36px; height: 36px; border: 3px solid ${s.cardBorder}; border-top-color: ${s.accentColor}; border-radius: 50%; animation: vdv-spin 0.8s linear infinite; }
        @keyframes vdv-spin { to { transform: rotate(360deg); } }

        .vdv-badges { display: flex; gap: 6px; flex-wrap: wrap; }
        .vdv-badge { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .vdv-badge-new      { background: ${s.badgeNewBg};     color: ${s.badgeNewText}; }
        .vdv-badge-used     { background: ${s.badgeUsedBg};    color: ${s.badgeUsedText}; }
        .vdv-badge-rent     { background: ${s.badgeRentBg};    color: ${s.badgeRentText}; }
        .vdv-badge-auction  { background: ${s.badgeAuctionBg}; color: ${s.badgeAuctionText}; }
        .vdv-badge-featured { background: ${s.accentColor};    color: #ffffff; }
        .vdv-badge-sold     { background: #374151; color: #9ca3af; }
        .vdv-badge-rented   { background: #374151; color: #9ca3af; }

        .vdv-vehicle-title { font-size: 24px; font-weight: 800; color: ${s.titleColor}; line-height: 1.3; }
        .vdv-vehicle-sub   { font-size: 14px; color: ${s.metaColor}; }

        .vdv-price-block { padding: 16px; background: ${s.bgColor}; border-radius: 10px; border: 1px solid ${s.cardBorder}; }
        .vdv-price-main  { font-size: 28px; font-weight: 800; color: ${s.priceColor}; }
        .vdv-price-orig  { font-size: 16px; color: ${s.priceOrigColor}; text-decoration: line-through; margin-left: 8px; }
        .vdv-price-note  { font-size: 13px; color: ${s.metaColor}; margin-top: 4px; }
        .vdv-price-rental { font-size: 14px; color: ${s.bodyColor}; margin-top: 4px; }
        .vdv-price-monthly { font-size: 13px; color: ${s.metaColor}; margin-top: 4px; }

        .vdv-quick-specs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .vdv-qs { display: flex; flex-direction: column; gap: 2px; background: ${s.bgColor}; padding: 10px 12px; border-radius: 8px; border: 1px solid ${s.cardBorder}; }
        .vdv-qs-label { font-size: 11px; color: ${s.specLabelColor}; text-transform: uppercase; letter-spacing: 0.4px; }
        .vdv-qs-value { font-size: 14px; font-weight: 600; color: ${s.specValueColor}; }

        .vdv-btn {
            width: 100%; padding: 14px; border-radius: 10px; font-size: 15px; font-weight: 700;
            border: none; cursor: pointer; transition: all 0.2s; text-align: center;
            font-family: ${s.fontFamily};
        }
        .vdv-btn-accent { background: ${s.btnBg}; color: ${s.btnText}; }
        .vdv-btn-accent:hover { background: ${s.accentHover}; }
        .vdv-btn-ghost { background: transparent; color: ${s.btnGhostText}; border: 2px solid ${s.btnGhostBorder}; }
        .vdv-btn-ghost:hover { background: ${s.btnGhostBorder}; color: ${s.btnText}; }

        .vdv-share { display: flex; gap: 8px; justify-content: center; }
        .vdv-share-btn {
            width: 40px; height: 40px; border-radius: 50%; border: 1px solid ${s.shareBorder};
            background: ${s.shareBg}; color: ${s.shareText}; display: flex; align-items: center;
            justify-content: center; cursor: pointer; transition: all 0.2s; font-size: 16px;
        }
        .vdv-share-btn:hover { background: ${s.shareHover}; color: ${s.bgColor}; border-color: ${s.shareHover}; }
        .vdv-share-btn svg { width: 18px; height: 18px; fill: currentColor; }

        .vdv-view-count {
            display: inline-flex; align-items: center; gap: 6px;
            background: ${s.viewCountBg}; border: 1px solid ${s.viewCountBorder};
            padding: 5px 12px; border-radius: 16px; font-size: 13px; font-weight: 600;
            color: ${s.viewCountText}; align-self: flex-start;
        }

        /* ── Tabs ── */
        .vdv-tabs { display: flex; gap: 4px; border-bottom: 2px solid ${s.cardBorder}; margin-bottom: 24px; flex-wrap: wrap; }
        .vdv-tab {
            padding: 10px 20px; background: none; border: none; color: ${s.metaColor};
            font-size: 14px; font-weight: 600; cursor: pointer; border-bottom: 2px solid transparent;
            margin-bottom: -2px; transition: all 0.2s; font-family: ${s.fontFamily};
        }
        .vdv-tab:hover { color: ${s.bodyColor}; }
        .vdv-tab.active { color: ${s.accentColor}; border-bottom-color: ${s.accentColor}; }
        .vdv-tab-content { min-height: 200px; margin-bottom: 32px; }
        .vdv-tab-panel { display: none; }
        .vdv-tab-panel.active { display: block; }

        /* ── Specs Table ── */
        .vdv-specs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px; }
        .vdv-specs-group { }
        .vdv-specs-group-title { font-size: 13px; font-weight: 700; color: ${s.sectionTitleColor}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid ${s.cardBorder}; }
        .vdv-spec-row { display: flex; justify-content: space-between; padding: 8px 12px; border-radius: 6px; }
        .vdv-spec-row:nth-child(even) { background: ${s.specRowAltBg}; }
        .vdv-spec-label { font-size: 13px; color: ${s.specLabelColor}; }
        .vdv-spec-value { font-size: 13px; color: ${s.specValueColor}; font-weight: 500; text-align: right; max-width: 60%; }

        /* ── Features ── */
        .vdv-features-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 24px; }
        .vdv-feature-group-title { font-size: 13px; font-weight: 700; color: ${s.sectionTitleColor}; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; padding-bottom: 6px; border-bottom: 1px solid ${s.cardBorder}; }
        .vdv-feature-list { display: flex; flex-direction: column; gap: 6px; }
        .vdv-feature-item { display: flex; align-items: center; gap: 8px; font-size: 13px; color: ${s.bodyColor}; }
        .vdv-feature-item::before { content: '✓'; color: ${s.accentColor}; font-weight: 700; flex-shrink: 0; }

        /* ── History ── */
        .vdv-history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .vdv-history-card { background: ${s.cardBg}; border: 1px solid ${s.cardBorder}; border-radius: 10px; padding: 16px; }
        .vdv-history-card-title { font-size: 13px; font-weight: 700; color: ${s.sectionTitleColor}; margin-bottom: 8px; }
        .vdv-history-card-body  { font-size: 13px; color: ${s.bodyColor}; line-height: 1.6; }

        /* ── Media ── */
        .vdv-media-section { display: flex; flex-direction: column; gap: 20px; }
        .vdv-video-embed { position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; }
        .vdv-video-embed iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0; }
        .vdv-media-link { display: inline-flex; align-items: center; gap: 8px; color: ${s.accentColor}; font-size: 14px; font-weight: 600; text-decoration: none; transition: opacity 0.2s; }
        .vdv-media-link:hover { opacity: 0.8; }

        /* ── Section wrapper ── */
        .vdv-section { background: ${s.cardBg}; border: 1px solid ${s.cardBorder}; border-radius: 16px; padding: 28px; margin-bottom: 24px; }
        .vdv-section-title { font-size: 20px; font-weight: 700; color: ${s.sectionTitleColor}; margin-bottom: 20px; }

        /* ── Calculator ── */
        .vdv-calc-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
        .vdv-calc-field { display: flex; flex-direction: column; gap: 6px; }
        .vdv-label { font-size: 12px; color: ${s.formLabelColor}; font-weight: 600; }
        .vdv-input {
            padding: 10px 14px; background: ${s.calcInputBg}; border: 1px solid ${s.calcInputBorder};
            border-radius: 8px; color: ${s.calcInputText}; font-size: 14px; font-family: ${s.fontFamily};
            transition: border-color 0.2s;
        }
        .vdv-input:focus { outline: none; border-color: ${s.accentColor}; }
        .vdv-textarea { resize: vertical; min-height: 100px; }
        .vdv-calc-results { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 16px; }
        .vdv-calc-result { background: ${s.calcResultBg}; border: 1px solid ${s.cardBorder}; border-radius: 10px; padding: 16px; text-align: center; }
        .vdv-calc-result-label { font-size: 12px; color: ${s.metaColor}; margin-bottom: 6px; }
        .vdv-calc-result-value { font-size: 22px; font-weight: 800; color: ${s.calcResultText}; }

        /* ── Lead Form ── */
        .vdv-form { display: flex; flex-direction: column; gap: 16px; }
        .vdv-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .vdv-form-field { display: flex; flex-direction: column; gap: 6px; }
        .vdv-form-checkboxes { display: flex; gap: 20px; flex-wrap: wrap; }
        .vdv-check-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: ${s.bodyColor}; cursor: pointer; }
        .vdv-check-label input { accent-color: ${s.accentColor}; }
        .vdv-form-msg { padding: 12px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; margin-top: 8px; }
        .vdv-form-msg.success { background: #166534; color: #bbf7d0; }
        .vdv-form-msg.error   { background: #7c2d12; color: #fed7aa; }

        /* ── Dealer ── */
        .vdv-dealer-grid { display: grid; grid-template-columns: auto 1fr; gap: 24px; align-items: start; }
        .vdv-dealer-logo { width: 100px; height: 70px; object-fit: contain; border-radius: 8px; background: ${s.bgColor}; padding: 8px; border: 1px solid ${s.cardBorder}; }
        .vdv-dealer-info { display: flex; flex-direction: column; gap: 8px; }
        .vdv-dealer-name { font-size: 20px; font-weight: 700; color: ${s.titleColor}; }
        .vdv-dealer-detail { font-size: 13px; color: ${s.bodyColor}; display: flex; align-items: center; gap: 6px; }
        .vdv-dealer-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 4px; }
        .vdv-dealer-btn {
            padding: 8px 18px; border-radius: 8px; font-size: 13px; font-weight: 600;
            cursor: pointer; transition: all 0.2s; border: 1px solid ${s.accentColor};
            background: transparent; color: ${s.accentColor}; font-family: ${s.fontFamily};
            text-decoration: none; display: inline-flex; align-items: center; gap: 6px;
        }
        .vdv-dealer-btn:hover { background: ${s.accentColor}; color: ${s.btnText}; }

        /* ── Responsive ── */
        @media (max-width: 1024px) {
            .vdv-hero { grid-template-columns: 1fr; }
            .vdv-summary { position: static; }
        }
        @media (max-width: 768px) {
            .vdv-container { padding: 20px 12px; }
            .vdv-vehicle-title { font-size: 20px; }
            .vdv-form-row { grid-template-columns: 1fr; }
            .vdv-quick-specs { grid-template-columns: 1fr 1fr; }
            .vdv-dealer-grid { grid-template-columns: 1fr; }
            .vdv-tabs { gap: 2px; }
            .vdv-tab { padding: 8px 14px; font-size: 13px; }
        }
        `;
    }

    _updateStyles() {
        const styleEl = this.querySelector('style');
        if (styleEl) styleEl.textContent = this._css();
    }

    _showLoading() {
        // Already shows loading state from shell
    }

    // ─── Main render ────────────────────────────────────────────────────────
    _renderVehicle() {
        const v = this.state.vehicleData;
        if (!v || !this.initialRenderDone) return;

        this._renderGallery();
        this._renderSummary(v);
        this._renderTabSpecs(v);
        this._renderTabFeatures(v);
        this._renderTabHistory(v);
        this._renderTabMedia(v);
        this._renderCalc(v);
        this._renderLead(v);
        this._renderDealer(v);
        this._bindTabs();
        this._bindCalc(v);
        this._bindLeadForm(v);
        this._bindShare(v);

        this.querySelector('#vdvBackBtn').addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('navigate-to-listing', {
                detail: { slug: null }, bubbles: true, composed: true
            }));
        });
    }

    // ─── Gallery ────────────────────────────────────────────────────────────
    _renderGallery() {
        const gallery   = this.state.gallery;
        const mainEl    = this.querySelector('#vdvGalleryMain');
        const thumbsEl  = this.querySelector('#vdvGalleryThumbs');

        if (!gallery || gallery.length === 0) {
            mainEl.innerHTML = `<div class="vdv-gallery-placeholder">🚗</div>`;
            thumbsEl.innerHTML = '';
            return;
        }

        this._setGalleryImage(0);

        // Render thumbnails
        thumbsEl.innerHTML = gallery.map((item, idx) => {
            const url = this._imgUrl(item.url || item, 150, 110);
            return `<div class="vdv-thumb ${idx === 0 ? 'active' : ''}" data-idx="${idx}">
                <img src="${url}" alt="Photo ${idx + 1}" loading="lazy" decoding="async" onerror="this.parentNode.style.background='${this.styleProps.cardBorder}'" />
            </div>`;
        }).join('');

        thumbsEl.querySelectorAll('.vdv-thumb').forEach(t => {
            t.addEventListener('click', () => this._setGalleryImage(parseInt(t.dataset.idx)));
        });
    }

    _setGalleryImage(idx) {
        const gallery  = this.state.gallery;
        if (!gallery || idx >= gallery.length) return;

        this.state.activeGalleryIdx = idx;
        const item   = gallery[idx];
        const url    = this._imgUrl(item.url || item, 1200, 700);
        const alt    = item.alt || this.state.vehicleData?.title || 'Vehicle';
        const mainEl = this.querySelector('#vdvGalleryMain');

        mainEl.innerHTML = `
            <img class="vdv-gallery-img" src="${url}" alt="${this._esc(alt)}" loading="${idx === 0 ? 'eager' : 'lazy'}" onerror="this.style.display='none'" />
            ${gallery.length > 1 ? `
                <button class="vdv-gallery-nav vdv-gallery-prev" id="vdvGallPrev">‹</button>
                <button class="vdv-gallery-nav vdv-gallery-next" id="vdvGallNext">›</button>
                <div class="vdv-gallery-counter">${idx + 1} / ${gallery.length}</div>
            ` : ''}`;

        if (gallery.length > 1) {
            mainEl.querySelector('#vdvGallPrev').addEventListener('click', () => {
                const prev = (this.state.activeGalleryIdx - 1 + gallery.length) % gallery.length;
                this._setGalleryImage(prev);
                this._syncThumb(prev);
            });
            mainEl.querySelector('#vdvGallNext').addEventListener('click', () => {
                const next = (this.state.activeGalleryIdx + 1) % gallery.length;
                this._setGalleryImage(next);
                this._syncThumb(next);
            });
        }

        this._syncThumb(idx);
    }

    _syncThumb(idx) {
        this.querySelectorAll('.vdv-thumb').forEach((t, i) => {
            t.classList.toggle('active', i === idx);
        });
    }

    // ─── Summary Sidebar ────────────────────────────────────────────────────
    _renderSummary(v) {
        const title   = v.title || `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim() || 'Vehicle';
        const sub     = [v.bodyStyle, v.drivetrain, v.fuelType].filter(Boolean).join(' · ');
        const listBadge = this._badge(v.listingType, v.condition);
        const statusBadge = (v.status === 'sold' || v.status === 'rented')
            ? `<span class="vdv-badge vdv-badge-${v.status}">${v.status}</span>` : '';
        const featuredBadge = v.featured ? `<span class="vdv-badge vdv-badge-featured">⭐ Featured</span>` : '';

        const priceHTML = this._priceHTML(v);
        const viewCount = this.state.viewCount || v.viewCount || 0;

        const quickSpecs = [
            ['Year',        v.year],
            ['Make',        v.make],
            ['Model',       v.model],
            ['Mileage',     v.mileage ? Number(v.mileage).toLocaleString() + ' mi' : null],
            ['Transmission',v.transmission],
            ['Engine',      v.engine],
            ['Exterior',    v.exteriorColor],
            ['Doors',       v.doors],
        ].filter(([, val]) => val);

        const summaryEl = this.querySelector('#vdvSummary');
        summaryEl.innerHTML = `
            <div class="vdv-badges">${listBadge}${statusBadge}${featuredBadge}</div>
            <div class="vdv-vehicle-title">${this._esc(title)}</div>
            ${sub ? `<div class="vdv-vehicle-sub">${this._esc(sub)}</div>` : ''}
            <div class="vdv-price-block">${priceHTML}</div>
            <div class="vdv-quick-specs">
                ${quickSpecs.map(([l, val]) => `
                    <div class="vdv-qs">
                        <div class="vdv-qs-label">${l}</div>
                        <div class="vdv-qs-value">${this._esc(String(val))}</div>
                    </div>`).join('')}
            </div>
            <button class="vdv-btn vdv-btn-accent" id="vdvEnquireBtn">📩 Send Enquiry</button>
            ${v.dealerPhone ? `<a class="vdv-btn vdv-btn-ghost" href="tel:${v.dealerPhone}" style="text-align:center;text-decoration:none;">📞 Call Dealer</a>` : ''}
            <div class="vdv-share" id="vdvShareBtns">
                <button class="vdv-share-btn" data-share="twitter" title="Share on X">
                    <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                </button>
                <button class="vdv-share-btn" data-share="facebook" title="Share on Facebook">
                    <svg viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button class="vdv-share-btn" data-share="whatsapp" title="Share on WhatsApp">
                    <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                </button>
                <button class="vdv-share-btn" data-share="copy" title="Copy link">
                    <svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>
                </button>
            </div>
            <div class="vdv-view-count" id="vdvViewCount">👁 <span id="vdvViewNum">${this._fmtNum(viewCount)}</span> views</div>
        `;

        summaryEl.querySelector('#vdvEnquireBtn').addEventListener('click', () => {
            const leadSection = this.querySelector('#vdvLead');
            if (leadSection) leadSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    _priceHTML(v) {
        const sym = v.currency === 'INR' ? '₹' : v.currency === 'EUR' ? '€' : v.currency === 'GBP' ? '£' : '$';
        const fmt = n => sym + Number(n).toLocaleString();

        if (v.listingType === 'rent') {
            return `<div class="vdv-price-main">${v.rentalPricePerDay ? fmt(v.rentalPricePerDay) + '<small>/day</small>' : 'Contact for price'}</div>
                    ${v.rentalPricePerWeek ? `<div class="vdv-price-rental">${fmt(v.rentalPricePerWeek)}/week</div>` : ''}
                    ${v.rentalPricePerMonth ? `<div class="vdv-price-rental">${fmt(v.rentalPricePerMonth)}/month</div>` : ''}`;
        }
        if (v.listingType === 'auction') {
            return `<div class="vdv-price-main">Starts ${v.auctionStartPrice ? fmt(v.auctionStartPrice) : '—'}</div>
                    ${v.auctionReservePrice ? `<div class="vdv-price-note">Reserve: ${fmt(v.auctionReservePrice)}</div>` : ''}
                    ${v.auctionEndDate ? `<div class="vdv-price-note">Ends: ${this._fmtDate(v.auctionEndDate)}</div>` : ''}`;
        }
        const basePrice = v.salePrice && v.salePrice < v.price ? v.salePrice : v.price;
        return `
            <div>
                <span class="vdv-price-main">${basePrice ? fmt(basePrice) : 'Price on request'}</span>
                ${v.salePrice && v.price && v.salePrice < v.price ? `<span class="vdv-price-orig">${fmt(v.price)}</span>` : ''}
            </div>
            ${v.priceNegotiable ? `<div class="vdv-price-note">Negotiable</div>` : ''}
            ${v.monthlyPayment ? `<div class="vdv-price-monthly">Est. ${fmt(v.monthlyPayment)}/mo</div>` : ''}`;
    }

    _badge(type, condition) {
        const map = { new: ['new','New'], used: ['used','Used'], rent: ['rent','Rent/Lease'], auction: ['auction','Auction'] };
        const [cls, label] = map[type] || ['used', condition || type || 'Used'];
        return `<span class="vdv-badge vdv-badge-${cls}">${label}</span>`;
    }

    // ─── Tabs ────────────────────────────────────────────────────────────────
    _renderTabSpecs(v) {
        const groups = [
            ['Identity', [
                ['VIN',            v.vin],
                ['Stock #',        v.stockNumber],
                ['Year',           v.year],
                ['Make',           v.make],
                ['Model',          v.model],
                ['Trim',           v.trim],
                ['Body Style',     v.bodyStyle],
                ['Condition',      v.condition],
                ['Exterior Color', v.exteriorColor],
                ['Interior Color', v.interiorColor],
            ]],
            ['Engine & Performance', [
                ['Engine',              v.engine],
                ['Displacement',        v.engineDisplacement],
                ['Cylinders',           v.cylinders],
                ['Horsepower',          v.horsepower ? v.horsepower + ' hp' : null],
                ['Torque',              v.torque     ? v.torque + ' lb-ft' : null],
                ['Transmission',        v.transmission],
                ['Drivetrain',          v.drivetrain],
                ['Fuel Type',           v.fuelType],
                ['MPG City',            v.mpgCity    ? v.mpgCity + ' mpg' : null],
                ['MPG Highway',         v.mpgHighway ? v.mpgHighway + ' mpg' : null],
                ['Electric Range',      v.range      ? v.range + ' mi' : null],
            ]],
            ['Dimensions & Capacity', [
                ['Mileage',         v.mileage        ? Number(v.mileage).toLocaleString() + ' mi' : null],
                ['Doors',           v.doors],
                ['Seating',         v.seatingCapacity ? v.seatingCapacity + ' seats' : null],
                ['Towing Capacity', v.towingCapacity  ? Number(v.towingCapacity).toLocaleString() + ' lbs' : null],
                ['Payload',         v.payload         ? Number(v.payload).toLocaleString() + ' lbs' : null],
                ['Length',          v.length          ? v.length + '"' : null],
                ['Width',           v.width           ? v.width  + '"' : null],
                ['Height',          v.height          ? v.height + '"' : null],
                ['Weight',          v.weight          ? Number(v.weight).toLocaleString() + ' lbs' : null],
            ]],
            ['Boat Specs', [
                ['Hull Material',  v.hullMaterial],
                ['Boat Type',      v.boatType],
                ['Engine Type',    v.engineType],
                ['Engine Hours',   v.engineHours ? Number(v.engineHours).toLocaleString() + ' hrs' : null],
            ]],
        ];

        const validGroups = groups.filter(([, rows]) => rows.some(([, val]) => val));

        this.querySelector('#vdvTabSpecs').innerHTML = `
            <div class="vdv-specs-grid">
                ${validGroups.map(([groupTitle, rows]) => `
                    <div class="vdv-specs-group">
                        <div class="vdv-specs-group-title">${groupTitle}</div>
                        ${rows.filter(([, val]) => val).map(([label, val]) => `
                            <div class="vdv-spec-row">
                                <span class="vdv-spec-label">${label}</span>
                                <span class="vdv-spec-value">${this._esc(String(val))}</span>
                            </div>`).join('')}
                    </div>`).join('')}
            </div>`;
    }

    _renderTabFeatures(v) {
        const groups = [
            ['Safety',   v.safetyFeatures || v.features],
            ['Tech',     v.techFeatures],
            ['Exterior', v.exteriorFeatures],
            ['Interior', v.interiorFeatures],
            ['Packages', v.packages],
        ].filter(([, val]) => val);

        if (!groups.length) {
            this.querySelector('#vdvTabFeatures').innerHTML = `<p style="color:${this.styleProps.metaColor}">No features listed.</p>`;
            return;
        }

        this.querySelector('#vdvTabFeatures').innerHTML = `
            <div class="vdv-features-grid">
                ${groups.map(([groupTitle, csv]) => `
                    <div>
                        <div class="vdv-feature-group-title">${groupTitle}</div>
                        <div class="vdv-feature-list">
                            ${csv.split(',').map(f => f.trim()).filter(Boolean).map(f => `
                                <div class="vdv-feature-item">${this._esc(f)}</div>`).join('')}
                        </div>
                    </div>`).join('')}
            </div>`;
    }

    _renderTabHistory(v) {
        const cards = [
            { title: 'Ownership',    body: v.owners ? `${v.owners} previous owner(s)` : null },
            { title: 'Accident History', body: v.accidentHistory ? 'Accident reported — see CARFAX' : 'No accidents reported' },
            { title: 'Service History',  body: v.serviceHistory || null },
            { title: 'CARFAX Report',    body: v.carfaxUrl ? `<a class="vdv-media-link" href="${v.carfaxUrl}" target="_blank" rel="noopener">View Report →</a>` : null, raw: true },
            { title: 'Warranty',         body: v.warrantyType ? `${v.warrantyType}${v.warrantyMonths ? ' · ' + v.warrantyMonths + ' months' : ''}${v.warrantyMiles ? ' · ' + Number(v.warrantyMiles).toLocaleString() + ' mi' : ''}` : null },
            { title: 'Certified Pre-Owned', body: v.certifiedPreOwned ? 'Yes — Certified Pre-Owned' : null },
        ].filter(c => c.body);

        this.querySelector('#vdvTabHistory').innerHTML = cards.length
            ? `<div class="vdv-history-grid">
                ${cards.map(c => `
                    <div class="vdv-history-card">
                        <div class="vdv-history-card-title">${c.title}</div>
                        <div class="vdv-history-card-body">${c.raw ? c.body : this._esc(c.body)}</div>
                    </div>`).join('')}
               </div>`
            : `<p style="color:${this.styleProps.metaColor}">No history information available.</p>`;
    }

    _renderTabMedia(v) {
        let html = '<div class="vdv-media-section">';
        if (v.videoUrl) {
            const ytMatch    = v.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
            const vimeoMatch = v.videoUrl.match(/vimeo\.com\/(\d+)/);
            if (ytMatch) {
                html += `<div><div class="vdv-specs-group-title">Video</div><div class="vdv-video-embed"><iframe src="https://www.youtube.com/embed/${ytMatch[1]}" allowfullscreen title="Vehicle video"></iframe></div></div>`;
            } else if (vimeoMatch) {
                html += `<div><div class="vdv-specs-group-title">Video</div><div class="vdv-video-embed"><iframe src="https://player.vimeo.com/video/${vimeoMatch[1]}" allowfullscreen title="Vehicle video"></iframe></div></div>`;
            } else {
                html += `<div><div class="vdv-specs-group-title">Video</div><a class="vdv-media-link" href="${v.videoUrl}" target="_blank" rel="noopener">▶ Watch Video</a></div>`;
            }
        }
        if (v.video360Url) {
            html += `<div><div class="vdv-specs-group-title">360° View</div><a class="vdv-media-link" href="${v.video360Url}" target="_blank" rel="noopener">🔄 Open 360° View</a></div>`;
        }
        if (v.tourUrl) {
            html += `<div><div class="vdv-specs-group-title">Virtual Tour</div><a class="vdv-media-link" href="${v.tourUrl}" target="_blank" rel="noopener">🏠 Open Virtual Tour</a></div>`;
        }
        if (!v.videoUrl && !v.video360Url && !v.tourUrl) {
            html += `<p style="color:${this.styleProps.metaColor}">No media content available.</p>`;
        }
        html += '</div>';
        this.querySelector('#vdvTabMedia').innerHTML = html;
    }

    _bindTabs() {
        const tabs    = this.querySelectorAll('.vdv-tab');
        const panels  = {
            specs:    this.querySelector('#vdvTabSpecs'),
            features: this.querySelector('#vdvTabFeatures'),
            history:  this.querySelector('#vdvTabHistory'),
            media:    this.querySelector('#vdvTabMedia'),
        };

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                Object.values(panels).forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                const panel = panels[tab.dataset.tab];
                if (panel) panel.classList.add('active');
            });
        });
    }

    // ─── Finance Calculator ─────────────────────────────────────────────────
    _renderCalc(v) {
        if (!v.financeEnabled && !v.price) return;
        const calcSection = this.querySelector('#vdvCalc');
        calcSection.style.display = 'block';

        // Pre-fill from CMS values
        const priceInput = this.querySelector('#calcPrice');
        const downInput  = this.querySelector('#calcDown');
        const rateInput  = this.querySelector('#calcRate');
        const termInput  = this.querySelector('#calcTerm');

        const displayPrice = v.salePrice || v.price || 0;
        if (priceInput) priceInput.value = displayPrice;
        if (downInput  && v.downPayment)    downInput.value = v.downPayment;
        if (rateInput  && v.interestRate)   rateInput.value = v.interestRate;
        if (termInput  && v.loanTermMonths) termInput.value = v.loanTermMonths;

        this._computeLoan();
    }

    _bindCalc() {
        ['#calcPrice', '#calcDown', '#calcRate', '#calcTerm'].forEach(sel => {
            const el = this.querySelector(sel);
            if (el) el.addEventListener('input', () => this._computeLoan());
        });
    }

    _computeLoan() {
        const P = parseFloat(this.querySelector('#calcPrice')?.value || 0);
        const D = parseFloat(this.querySelector('#calcDown')?.value  || 0);
        const R = parseFloat(this.querySelector('#calcRate')?.value  || 0) / 100 / 12;
        const N = parseFloat(this.querySelector('#calcTerm')?.value  || 60);

        const principal = P - D;
        const monthly   = (principal > 0 && R > 0)
            ? (principal * R * Math.pow(1 + R, N)) / (Math.pow(1 + R, N) - 1)
            : principal > 0 ? principal / N : 0;
        const total     = monthly * N;
        const interest  = total - principal;

        const fmt = n => '$' + Math.max(0, n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const mEl = this.querySelector('#calcMonthly');
        const tEl = this.querySelector('#calcTotal');
        const iEl = this.querySelector('#calcInterest');
        if (mEl) mEl.textContent = monthly > 0 ? fmt(monthly) : '—';
        if (tEl) tEl.textContent = total    > 0 ? fmt(total)   : '—';
        if (iEl) iEl.textContent = interest > 0 ? fmt(interest): '—';
    }

    // ─── Lead Form ──────────────────────────────────────────────────────────
    _renderLead(v) {
        if (v.leadCaptureEnabled === false) return;
        const leadSection = this.querySelector('#vdvLead');
        leadSection.style.display = 'block';

        const titleEl = this.querySelector('#vdvLeadTitle');
        if (titleEl && v.leadFormTitle) titleEl.textContent = v.leadFormTitle;
    }

    _bindLeadForm(v) {
        const form    = this.querySelector('#vdvLeadForm');
        const msgEl   = this.querySelector('#vdvLeadMsg');
        const submitBtn = this.querySelector('#vdvLeadSubmit');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending…';

            const formData = {
                listingId:             v._id,
                listingTitle:          v.title || `${v.year} ${v.make} ${v.model}`,
                listingSlug:           v.slug,
                dealerEmail:           v.dealerEmail || v.leadEmailRecipient || '',
                name:                  this.querySelector('#leadName')?.value || '',
                email:                 this.querySelector('#leadEmail')?.value || '',
                phone:                 this.querySelector('#leadPhone')?.value || '',
                message:               this.querySelector('#leadMessage')?.value || '',
                preferredContactTime:  this.querySelector('#leadContactTime')?.value || '',
                interestedInFinancing: this.querySelector('#leadFinancing')?.checked || false,
                interestedInTestDrive: this.querySelector('#leadTestDrive')?.checked || false,
                tradeInInterest:       this.querySelector('#leadTradeIn')?.checked || false,
                source:                'widget',
            };

            this.dispatchEvent(new CustomEvent('submit-lead', {
                detail: { formData }, bubbles: true, composed: true
            }));

            // Optimistic UI
            msgEl.style.display = 'block';
            msgEl.className = 'vdv-form-msg success';
            msgEl.textContent = '✅ Enquiry sent! The dealer will contact you soon.';
            submitBtn.textContent = 'Sent ✓';
        });
    }

    // ─── Dealer ─────────────────────────────────────────────────────────────
    _renderDealer(v) {
        if (!v.dealerName) return;
        const dealerSection = this.querySelector('#vdvDealer');
        dealerSection.style.display = 'block';

        const logoEl = v.dealerLogo
            ? `<img class="vdv-dealer-logo" src="${this._imgUrl(v.dealerLogo, 200, 140)}" alt="${this._esc(v.dealerName)}" loading="lazy" />`
            : `<div style="width:100px;height:70px;background:${this.styleProps.cardBorder};border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:28px">🏢</div>`;

        const address = [v.dealerAddress, v.dealerCity, v.dealerState, v.dealerZip, v.dealerCountry].filter(Boolean).join(', ');
        const mapUrl  = address ? `https://maps.google.com/?q=${encodeURIComponent(address)}` : null;

        this.querySelector('#vdvDealerContent').innerHTML = `
            ${logoEl}
            <div class="vdv-dealer-info">
                <div class="vdv-dealer-name">${this._esc(v.dealerName)}</div>
                ${address ? `<div class="vdv-dealer-detail">📍 ${this._esc(address)}</div>` : ''}
                ${v.dealerPhone   ? `<div class="vdv-dealer-detail">📞 ${this._esc(v.dealerPhone)}</div>` : ''}
                ${v.dealerEmail   ? `<div class="vdv-dealer-detail">✉️ ${this._esc(v.dealerEmail)}</div>` : ''}
                ${v.dealerWebsite ? `<div class="vdv-dealer-detail">🌐 <a href="${v.dealerWebsite}" target="_blank" rel="noopener" style="color:${this.styleProps.accentColor}">${v.dealerWebsite}</a></div>` : ''}
                <div class="vdv-dealer-actions">
                    ${v.dealerPhone   ? `<a class="vdv-dealer-btn" href="tel:${v.dealerPhone}">📞 Call</a>` : ''}
                    ${v.dealerEmail   ? `<a class="vdv-dealer-btn" href="mailto:${v.dealerEmail}">✉️ Email</a>` : ''}
                    ${mapUrl          ? `<a class="vdv-dealer-btn" href="${mapUrl}" target="_blank" rel="noopener">🗺️ Directions</a>` : ''}
                    ${v.dealerWebsite ? `<a class="vdv-dealer-btn" href="${v.dealerWebsite}" target="_blank" rel="noopener">🌐 Website</a>` : ''}
                </div>
            </div>`;
    }

    // ─── Share ───────────────────────────────────────────────────────────────
    _bindShare(v) {
        const title = v.title || `${v.year} ${v.make} ${v.model}`;
        this.querySelectorAll('[data-share]').forEach(btn => {
            btn.addEventListener('click', () => {
                const url = window.location.href;
                const type = btn.dataset.share;
                const shares = {
                    twitter:   `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
                    facebook:  `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                    whatsapp:  `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
                };
                if (type === 'copy') {
                    navigator.clipboard?.writeText(url).then(() => alert('Link copied!')).catch(() => alert(url));
                } else if (shares[type]) {
                    window.open(shares[type], '_blank', 'width=600,height=400');
                }
            });
        });
    }

    // ─── View Count ──────────────────────────────────────────────────────────
    _updateViewCount() {
        const el = this.querySelector('#vdvViewNum');
        if (el) el.textContent = this._fmtNum(this.state.viewCount);
    }

    // ─── SEO ─────────────────────────────────────────────────────────────────
    _emitSEO() {
        const v = this.state.vehicleData;
        if (!v) return;

        const title  = v.title || `${v.year} ${v.make} ${v.model}`;
        const price  = v.salePrice || v.price;
        const priceStr = price ? '$' + Number(price).toLocaleString() : '';

        let markup = `<h1>${this._esc(title)}</h1>`;
        if (v.description) markup += `<p>${this._esc(v.description)}</p>`;
        markup += `<p>Year: ${v.year || ''} | Make: ${v.make || ''} | Model: ${v.model || ''} | ${priceStr ? 'Price: ' + priceStr : ''}</p>`;
        if (v.mileage) markup += `<p>Mileage: ${Number(v.mileage).toLocaleString()} miles</p>`;
        if (v.vin)     markup += `<p>VIN: ${v.vin}</p>`;

        this.dispatchEvent(new CustomEvent('seo-markup-ready', {
            detail: { markup }, bubbles: true, composed: true
        }));
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────
    _imgUrl(raw, w = 800, h = 600) {
        if (!raw || typeof raw !== 'string') return '';
        if (raw.startsWith('https://static.wixstatic.com/media/')) {
            try {
                const filename = raw.split('/media/')[1]?.split('/')[0];
                if (!filename) return raw;
                const params = `w_${w},h_${h},al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto`;
                return `https://static.wixstatic.com/media/${filename}/v1/fill/${params}/${filename}`;
            } catch (convErr) {
                console.log('vehicle-detail-viewer: URL conversion skipped', convErr.message);
                return raw;
            }
        }
        if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
        if (raw.startsWith('wix:image://')) {
            try {
                const fileId = raw.split('/')[3]?.split('#')[0];
                if (!fileId) return '';
                let fn = fileId.includes('~mv2') ? fileId : `${fileId}~mv2.jpg`;
                if (!fn.includes('.')) fn += '.jpg';
                const params = `w_${w},h_${h},al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto`;
                return `https://static.wixstatic.com/media/${fn}/v1/fill/${params}/${fn}`;
            } catch (convErr) {
                console.log('vehicle-detail-viewer: wix:image parse skipped', convErr.message);
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

    _fmtNum(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
        if (n >= 1000)    return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
        return String(n);
    }

    _fmtDate(ds) {
        if (!ds) return '';
        const d = new Date(ds);
        if (isNaN(d.getTime())) return '';
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    disconnectedCallback() {
        // cleanup if needed
    }
}

customElements.define('vehicle-detail-viewer', VehicleDetailViewer);
