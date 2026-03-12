class VehicleListingEditor extends HTMLElement {
    constructor() {
        super();
        this._view = 'list';
        this._tab = 'basic';
        this._listings = [];
        this._editItem = null;
        this._initialized = false;
        this._pendingList = null;
        this._pendingUploads = {};
        this._pendingMetaProgress = {};
        this._galleryImages = [];
        this._data = this._freshData();
        this._makes = [];
        this._models = [];
        this._filterStatus = 'all';
        this._filterType = 'all';
        this._searchQ = '';
        this._sortField = '_createdDate';
        this._sortDir = 'desc';
        this._compareIds = [];
        this._bulkSelected = [];
        this._bulkMode = false;
    }

    _freshData() {
        return {
            title: '', slug: '', listingType: 'used', vehicleType: 'car',
            status: 'draft', featured: false, condition: 'used', description: '',
            make: '', model: '', trim: '', year: '', vin: '', stockNumber: '',
            exteriorColor: '', interiorColor: '', bodyStyle: '',
            engine: '', engineDisplacement: '', cylinders: '', horsepower: '',
            torque: '', transmission: '', drivetrain: '', fuelType: '',
            mpgCity: '', mpgHighway: '', range: '',
            mileage: '', length: '', width: '', height: '', weight: '',
            payload: '', towingCapacity: '', seatingCapacity: '', doors: '',
            hullMaterial: '', boatType: '', engineType: '', engineHours: '',
            price: '', salePrice: '', msrp: '', priceNegotiable: false,
            showPriceOnSite: true, currency: 'USD',
            rentalPricePerDay: '', rentalPricePerWeek: '', rentalPricePerMonth: '',
            auctionStartPrice: '', auctionReservePrice: '', auctionEndDate: '',
            financeEnabled: false, downPayment: '', loanTermMonths: '60',
            interestRate: '', monthlyPayment: '',
            primaryImage: '', gallery: [],
            videoUrl: '', video360Url: '', tourUrl: '',
            features: '', safetyFeatures: '', techFeatures: '',
            exteriorFeatures: '', interiorFeatures: '', packages: '',
            owners: '', accidentHistory: false, serviceHistory: '',
            carfaxUrl: '', warrantyType: '', warrantyMonths: '', warrantyMiles: '',
            certifiedPreOwned: false,
            dealerName: '', dealerPhone: '', dealerEmail: '', dealerWebsite: '',
            dealerAddress: '', dealerCity: '', dealerState: '', dealerZip: '',
            dealerCountry: '', dealerLogo: '', latitude: '', longitude: '',
            leadCaptureEnabled: true, leadFormTitle: 'Interested in this vehicle?',
            leadFormFields: 'name,email,phone,message', leadEmailRecipient: '',
            seoTitle: '', seoDescription: '', seoKeywords: '', ogImage: '',
            compareEnabled: true, compareHighlights: '',
            viewCount: 0, inquiryCount: 0, favoriteCount: 0,
            listedDate: '', soldDate: '', expiryDate: '',
            relatedListings: [],
        };
    }

    static get observedAttributes() {
        return [
            'listing-list', 'save-result', 'delete-result',
            'upload-result', 'notification', 'load-data',
            'bulk-result', 'makes-list', 'models-list'
        ];
    }

    attributeChangedCallback(name, oldVal, newVal) {
        if (!newVal || newVal === oldVal) return;
        if (name === 'listing-list' && !this._initialized) { this._pendingList = newVal; return; }
        if (!this._initialized) return;
        try {
            const d = JSON.parse(newVal);
            if (name === 'listing-list') this._onListingList(d);
            if (name === 'save-result')  this._onSaveResult(d);
            if (name === 'delete-result') this._onDeleteResult(d);
            if (name === 'upload-result') this._onUploadResult(d);
            if (name === 'notification') this._toast(d.type, d.message);
            if (name === 'load-data') this._populateEditor(d);
            if (name === 'bulk-result') this._onBulkResult(d);
            if (name === 'makes-list') this._onMakesList(d);
            if (name === 'models-list') this._onModelsList(d);
        } catch(e) {}
    }

    connectedCallback() {
        if (this._initialized) return;
        requestAnimationFrame(() => {
            this._inject();
            this._wire();
            this._initialized = true;
            if (this._pendingList) {
                try { this._onListingList(JSON.parse(this._pendingList)); this._pendingList = null; } catch(e) {}
            }
            this._emit('load-listing-list', {});
            this._emit('load-makes', {});
        });
    }

    disconnectedCallback() {}

    _icon(k) {
        const I = {
            car:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l3-4h12l3 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="16.5" cy="17.5" r="2.5"/><path d="M7.5 17.5h9"/></svg>`,
            plus:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
            edit:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
            trash:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
            save:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
            back:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>`,
            check:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
            image:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
            video:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
            dollar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
            gear:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
            seo:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
            location:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
            user:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
            star:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
            compare:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="18" rx="1"/><rect x="14" y="3" width="7" height="18" rx="1"/></svg>`,
            alert:  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
            drag:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
            eye:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
            history:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>`,
            x:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
            link:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
            filter: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>`,
            upload: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>`,
            motorcycle:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6H9l-3 8h12l-1-4h-2z"/><path d="M9 6l1-3h4"/></svg>`,
            boat:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20a2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1 2.4 2.4 0 0 0 2 1 2.4 2.4 0 0 0 2-1 2.4 2.4 0 0 1 2-1 2.4 2.4 0 0 1 2 1"/><path d="M4 18L3 8h18l-1 10"/><path d="M12 8V3"/><path d="M8 8l2-5M16 8l-2-5"/></svg>`,
            rv:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="6" width="22" height="12" rx="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M1 12h22"/><path d="M15 6v6"/></svg>`,
            copy:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
            archive:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
        };
        return I[k] || I.car;
    }

    _styles() {
        return `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=JetBrains+Mono:wght@400;500&display=swap');

vehicle-listing-editor {
    display: block; width: 100%; height: 100%; min-height: 740px;
    font-family: 'Instrument Sans', sans-serif;
    --ink: #0d0d0d; --ink2: #3a3a3a; --ink3: #767676; --ink4: #aaa;
    --bg: #f5f4f0; --bg2: #eeece6; --bg3: #e4e1d8; --border: #ddd9ce;
    --white: #fff; --accent: #e05c1a; --accent2: #1a3a5c;
    --green: #1a7a3a; --red: #c0162a; --yellow: #d4900a; --blue: #1a5ccc;
    --r: 6px; --r2: 10px;
    --shadow-sm: 0 1px 4px rgba(0,0,0,.07);
    --shadow: 0 4px 20px rgba(0,0,0,.11);
    --shadow-lg: 0 12px 40px rgba(0,0,0,.16);
    background: var(--bg); color: var(--ink);
}
vehicle-listing-editor * { box-sizing: border-box; }
vehicle-listing-editor .vle-host { display: flex; flex-direction: column; width: 100%; height: 100%; min-height: 740px; background: var(--bg); border-radius: 12px; overflow: hidden; box-shadow: var(--shadow-lg); border: 1px solid var(--border); }
vehicle-listing-editor .vle-topbar { display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 22px; background: var(--accent2); color: #fff; flex-shrink: 0; gap: 12px; }
vehicle-listing-editor .vle-brand { display: flex; align-items: center; gap: 10px; font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 800; letter-spacing: -.5px; white-space: nowrap; }
vehicle-listing-editor .vle-brand svg { width: 22px; height: 22px; }
vehicle-listing-editor .vle-brand-dot { color: var(--accent); }
vehicle-listing-editor .vle-topbar-acts { display: flex; gap: 8px; align-items: center; }
vehicle-listing-editor .vle-topbar-stat { display: flex; align-items: center; gap: 6px; padding: 5px 12px; background: rgba(255,255,255,.1); border-radius: 20px; font-size: 12px; font-weight: 600; color: rgba(255,255,255,.85); border: 1px solid rgba(255,255,255,.15); }
vehicle-listing-editor .vle-topbar-stat strong { color: #fff; }
vehicle-listing-editor .vle-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border: none; border-radius: var(--r); font-family: 'Instrument Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; white-space: nowrap; line-height: 1; }
vehicle-listing-editor .vle-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
vehicle-listing-editor .vle-btn:disabled { opacity: .45; cursor: not-allowed; pointer-events: none; }
vehicle-listing-editor .vle-btn-primary { background: var(--accent); color: #fff; }
vehicle-listing-editor .vle-btn-primary:hover { background: #c44e14; }
vehicle-listing-editor .vle-btn-navy { background: var(--accent2); color: #fff; }
vehicle-listing-editor .vle-btn-navy:hover { background: #122d48; }
vehicle-listing-editor .vle-btn-ghost { background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.2); }
vehicle-listing-editor .vle-btn-ghost:hover { background: rgba(255,255,255,.22); }
vehicle-listing-editor .vle-btn-light { background: var(--white); color: var(--ink2); border: 1px solid var(--border); }
vehicle-listing-editor .vle-btn-light:hover { background: var(--bg2); }
vehicle-listing-editor .vle-btn-red { background: #fef1f2; color: var(--red); border: 1px solid #fcc; }
vehicle-listing-editor .vle-btn-red:hover { background: #ffe0e3; }
vehicle-listing-editor .vle-btn-green { background: #edfbf2; color: var(--green); border: 1px solid #b7efd1; }
vehicle-listing-editor .vle-btn-green:hover { background: #d4f5e4; }
vehicle-listing-editor .vle-btn-sm { padding: 5px 10px; font-size: 12px; }
vehicle-listing-editor .vle-btn-xs { padding: 4px 8px; font-size: 11px; }
vehicle-listing-editor .vle-btn-icon { padding: 7px; border-radius: var(--r); }
vehicle-listing-editor .vle-list-view { display: flex; flex-direction: column; flex: 1; overflow: hidden; min-height: 0; }
vehicle-listing-editor .vle-list-view.hidden { display: none; }
vehicle-listing-editor .vle-toolbar { display: flex; align-items: center; gap: 10px; padding: 14px 22px; background: var(--white); border-bottom: 2px solid var(--border); flex-shrink: 0; flex-wrap: wrap; }
vehicle-listing-editor .vle-toolbar-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; flex-wrap: wrap; }
vehicle-listing-editor .vle-toolbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
vehicle-listing-editor .vle-search-box { display: flex; align-items: center; gap: 8px; padding: 7px 12px; background: var(--bg); border: 1.5px solid var(--border); border-radius: var(--r); flex: 1; max-width: 280px; }
vehicle-listing-editor .vle-search-box svg { width: 14px; height: 14px; color: var(--ink3); flex-shrink: 0; }
vehicle-listing-editor .vle-search-box input { border: none; outline: none; background: transparent; font-family: 'Instrument Sans', sans-serif; font-size: 13px; color: var(--ink); width: 100%; }
vehicle-listing-editor .vle-search-box input::placeholder { color: var(--ink4); }
vehicle-listing-editor .vle-filter-sel { padding: 7px 10px; border: 1.5px solid var(--border); border-radius: var(--r); font-family: 'Instrument Sans', sans-serif; font-size: 13px; color: var(--ink2); background: var(--bg); cursor: pointer; outline: none; }
vehicle-listing-editor .vle-filter-sel:focus { border-color: var(--accent); }
vehicle-listing-editor .vle-stats-bar { display: flex; gap: 0; background: var(--bg2); border-bottom: 1px solid var(--border); flex-shrink: 0; overflow-x: auto; }
vehicle-listing-editor .vle-stat-pill { display: flex; align-items: center; gap: 6px; padding: 8px 18px; font-size: 12px; font-weight: 600; color: var(--ink3); border-right: 1px solid var(--border); cursor: pointer; white-space: nowrap; transition: all .15s; border-bottom: 2px solid transparent; }
vehicle-listing-editor .vle-stat-pill:hover { background: var(--bg3); color: var(--ink); }
vehicle-listing-editor .vle-stat-pill.active { color: var(--accent); border-bottom-color: var(--accent); background: var(--white); }
vehicle-listing-editor .vle-stat-pill strong { font-size: 15px; color: inherit; }
vehicle-listing-editor .vle-list-scroll { flex: 1; overflow-y: auto; min-height: 0; }
vehicle-listing-editor .vle-list-scroll::-webkit-scrollbar { width: 5px; }
vehicle-listing-editor .vle-list-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
vehicle-listing-editor .vle-state-box { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 80px 20px; gap: 14px; color: var(--ink3); text-align: center; }
vehicle-listing-editor .vle-state-box svg { width: 48px; height: 48px; opacity: .25; }
vehicle-listing-editor .vle-state-box p { font-size: 15px; }
@keyframes vle-spin { to { transform: rotate(360deg); } }
vehicle-listing-editor .vle-spin { animation: vle-spin .7s linear infinite; }
vehicle-listing-editor .vle-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; padding: 20px 22px; }
vehicle-listing-editor .vle-card { background: var(--white); border-radius: var(--r2); border: 1.5px solid var(--border); overflow: hidden; box-shadow: var(--shadow-sm); transition: box-shadow .2s, border-color .2s, transform .15s; position: relative; cursor: pointer; }
vehicle-listing-editor .vle-card:hover { box-shadow: var(--shadow); border-color: #c8c3b5; transform: translateY(-2px); }
vehicle-listing-editor .vle-card.selected { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(224,92,26,.18); }
vehicle-listing-editor .vle-card-img { width: 100%; height: 180px; object-fit: cover; background: var(--bg2); display: block; }
vehicle-listing-editor .vle-card-img-placeholder { width: 100%; height: 180px; background: linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%); display: flex; align-items: center; justify-content: center; color: var(--ink4); }
vehicle-listing-editor .vle-card-img-placeholder svg { width: 44px; height: 44px; }
vehicle-listing-editor .vle-card-badge-row { position: absolute; top: 10px; left: 10px; display: flex; gap: 5px; flex-wrap: wrap; }
vehicle-listing-editor .vle-card-actions { position: absolute; top: 10px; right: 10px; display: flex; gap: 5px; opacity: 0; transition: opacity .2s; }
vehicle-listing-editor .vle-card:hover .vle-card-actions { opacity: 1; }
vehicle-listing-editor .vle-card-action-btn { width: 30px; height: 30px; background: rgba(255,255,255,.92); border: 1px solid rgba(0,0,0,.1); border-radius: var(--r); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all .15s; backdrop-filter: blur(4px); }
vehicle-listing-editor .vle-card-action-btn:hover { background: #fff; box-shadow: var(--shadow-sm); }
vehicle-listing-editor .vle-card-action-btn svg { width: 13px; height: 13px; }
vehicle-listing-editor .vle-card-action-btn.danger svg { color: var(--red); }
vehicle-listing-editor .vle-card-action-btn.compare-active { background: var(--accent); border-color: var(--accent); }
vehicle-listing-editor .vle-card-action-btn.compare-active svg { color: #fff; }
vehicle-listing-editor .vle-card-body { padding: 14px; }
vehicle-listing-editor .vle-card-title { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; color: var(--ink); margin-bottom: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
vehicle-listing-editor .vle-card-sub { font-size: 12px; color: var(--ink3); margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
vehicle-listing-editor .vle-card-price { font-family: 'Syne', sans-serif; font-size: 19px; font-weight: 800; color: var(--accent); margin-bottom: 10px; }
vehicle-listing-editor .vle-card-price span { font-size: 13px; font-weight: 400; color: var(--ink3); text-decoration: line-through; margin-left: 6px; font-family: 'Instrument Sans', sans-serif; }
vehicle-listing-editor .vle-card-meta { display: flex; gap: 12px; flex-wrap: wrap; font-size: 11px; color: var(--ink3); border-top: 1px solid var(--bg2); padding-top: 10px; margin-top: 2px; }
vehicle-listing-editor .vle-card-meta-item { display: flex; align-items: center; gap: 3px; }
vehicle-listing-editor .vle-card-meta-item svg { width: 11px; height: 11px; }
vehicle-listing-editor .vle-badge { display: inline-flex; align-items: center; gap: 3px; padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; line-height: 1; }
vehicle-listing-editor .vle-badge-active  { background: #d4f5e4; color: #0d5928; }
vehicle-listing-editor .vle-badge-draft   { background: #fef3c7; color: #7a4e00; }
vehicle-listing-editor .vle-badge-sold    { background: #fee; color: #8b0000; }
vehicle-listing-editor .vle-badge-rented  { background: #e8f0fe; color: #1a3a8a; }
vehicle-listing-editor .vle-badge-expired { background: var(--bg3); color: var(--ink3); }
vehicle-listing-editor .vle-badge-new     { background: #fff0e6; color: #7a2d00; border: 1px solid #f9c49a; }
vehicle-listing-editor .vle-badge-used    { background: #f0f4f8; color: #2d4a6a; }
vehicle-listing-editor .vle-badge-rent    { background: #f0e6ff; color: #5b1fa8; }
vehicle-listing-editor .vle-badge-auction { background: #fff7e6; color: #7a5400; }
vehicle-listing-editor .vle-badge-featured { background: var(--accent); color: #fff; }
vehicle-listing-editor .vle-compare-bar { display: none; align-items: center; gap: 12px; padding: 10px 22px; background: var(--accent2); color: #fff; font-size: 13px; font-weight: 600; flex-shrink: 0; }
vehicle-listing-editor .vle-compare-bar.active { display: flex; }
vehicle-listing-editor .vle-compare-slots { display: flex; gap: 8px; flex: 1; flex-wrap: wrap; }
vehicle-listing-editor .vle-compare-slot { display: flex; align-items: center; gap: 6px; padding: 5px 10px; background: rgba(255,255,255,.12); border-radius: var(--r); font-size: 12px; font-weight: 500; }
vehicle-listing-editor .vle-compare-slot button { background: none; border: none; color: rgba(255,255,255,.7); cursor: pointer; padding: 0; line-height: 1; }
vehicle-listing-editor .vle-compare-slot button:hover { color: #fff; }
vehicle-listing-editor .vle-editor-view { display: flex; flex-direction: column; flex: 1; overflow: hidden; min-height: 0; }
vehicle-listing-editor .vle-editor-view.hidden { display: none; }
vehicle-listing-editor .vle-editor-topbar { display: flex; align-items: center; gap: 10px; padding: 12px 22px; background: var(--white); border-bottom: 1px solid var(--border); flex-shrink: 0; flex-wrap: wrap; }
vehicle-listing-editor .vle-editor-title { font-family: 'Syne', sans-serif; font-size: 16px; font-weight: 700; flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
vehicle-listing-editor .vle-editor-acts { display: flex; gap: 8px; align-items: center; }
vehicle-listing-editor .vle-tabs { display: flex; align-items: center; padding: 0 12px; background: var(--bg2); border-bottom: 2px solid var(--border); gap: 2px; flex-shrink: 0; overflow-x: auto; }
vehicle-listing-editor .vle-tab { display: inline-flex; align-items: center; gap: 5px; padding: 10px 14px; border: none; border-bottom: 2px solid transparent; background: transparent; color: var(--ink3); font-family: 'Instrument Sans', sans-serif; font-size: 13px; font-weight: 500; cursor: pointer; transition: all .15s; margin-bottom: -2px; white-space: nowrap; }
vehicle-listing-editor .vle-tab svg { width: 14px; height: 14px; }
vehicle-listing-editor .vle-tab:hover { color: var(--ink); background: var(--bg3); }
vehicle-listing-editor .vle-tab.active { color: var(--accent); border-bottom-color: var(--accent); background: var(--white); font-weight: 600; }
vehicle-listing-editor .vle-editor-body { display: flex; flex: 1; overflow: hidden; min-height: 0; }
vehicle-listing-editor .vle-panel { display: none; flex: 1; overflow-y: auto; min-height: 0; padding: 24px; background: var(--bg); }
vehicle-listing-editor .vle-panel.active { display: block; }
vehicle-listing-editor .vle-panel::-webkit-scrollbar { width: 5px; }
vehicle-listing-editor .vle-panel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
vehicle-listing-editor .vle-section { background: var(--white); border: 1.5px solid var(--border); border-radius: var(--r2); margin-bottom: 18px; overflow: hidden; }
vehicle-listing-editor .vle-section-head { display: flex; align-items: center; gap: 8px; padding: 12px 18px; background: var(--bg2); border-bottom: 1px solid var(--border); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; color: var(--ink3); }
vehicle-listing-editor .vle-section-head svg { width: 14px; height: 14px; }
vehicle-listing-editor .vle-section-body { padding: 18px; }
vehicle-listing-editor .vle-section-tip { padding: 10px 18px; background: #fffbe6; border-top: 1px solid #ffe58f; font-size: 11px; color: #614700; line-height: 1.5; }
vehicle-listing-editor .vle-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
vehicle-listing-editor .vle-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
vehicle-listing-editor .vle-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 14px; }
vehicle-listing-editor .vle-full { grid-column: 1 / -1; }
vehicle-listing-editor .vle-field { display: flex; flex-direction: column; gap: 4px; }
vehicle-listing-editor .vle-field label { font-size: 11px; font-weight: 600; color: var(--ink3); text-transform: uppercase; letter-spacing: .5px; display: flex; align-items: center; gap: 4px; }
vehicle-listing-editor .vle-field label .vle-tip { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; background: var(--bg3); border-radius: 50%; font-size: 9px; color: var(--ink3); cursor: help; font-weight: 700; font-style: normal; position: relative; }
vehicle-listing-editor .vle-field label .vle-tip::after { content: attr(data-tip); position: absolute; bottom: 120%; left: 50%; transform: translateX(-50%); background: #1a1a1a; color: #fff; padding: 6px 10px; border-radius: 5px; font-size: 11px; max-width: 240px; white-space: normal; text-align: left; z-index: 1000; pointer-events: none; opacity: 0; transition: opacity .2s; font-weight: 400; text-transform: none; letter-spacing: 0; box-shadow: var(--shadow); min-width: 180px; }
vehicle-listing-editor .vle-field label .vle-tip:hover::after { opacity: 1; }
vehicle-listing-editor .vle-inp, vehicle-listing-editor .vle-sel, vehicle-listing-editor .vle-txt { width: 100%; padding: 9px 12px; border: 1.5px solid var(--border); border-radius: var(--r); font-family: 'Instrument Sans', sans-serif; font-size: 14px; color: var(--ink); background: var(--bg); outline: none; transition: border-color .15s, box-shadow .15s; }
vehicle-listing-editor .vle-inp:focus, vehicle-listing-editor .vle-sel:focus, vehicle-listing-editor .vle-txt:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(224,92,26,.1); background: var(--white); }
vehicle-listing-editor .vle-inp::placeholder, vehicle-listing-editor .vle-txt::placeholder { color: var(--ink4); font-size: 13px; }
vehicle-listing-editor .vle-inp[readonly] { background: var(--bg2); cursor: not-allowed; }
vehicle-listing-editor .vle-txt { resize: vertical; min-height: 80px; }
vehicle-listing-editor .vle-inp-prefix { display: flex; align-items: stretch; border: 1.5px solid var(--border); border-radius: var(--r); overflow: hidden; transition: border-color .15s, box-shadow .15s; background: var(--bg); }
vehicle-listing-editor .vle-inp-prefix:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(224,92,26,.1); }
vehicle-listing-editor .vle-inp-prefix-label { padding: 0 10px; background: var(--bg2); border-right: 1.5px solid var(--border); display: flex; align-items: center; font-size: 13px; color: var(--ink3); font-weight: 600; white-space: nowrap; flex-shrink: 0; }
vehicle-listing-editor .vle-inp-prefix input { flex: 1; padding: 9px 12px; border: none; outline: none; font-family: 'Instrument Sans', sans-serif; font-size: 14px; color: var(--ink); background: transparent; min-width: 0; }
vehicle-listing-editor .vle-tog-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid var(--bg2); }
vehicle-listing-editor .vle-tog-row:last-child { border-bottom: none; }
vehicle-listing-editor .vle-tog-info { flex: 1; min-width: 0; }
vehicle-listing-editor .vle-tog-label { font-size: 14px; font-weight: 500; color: var(--ink); }
vehicle-listing-editor .vle-tog-desc { font-size: 11px; color: var(--ink3); margin-top: 2px; }
vehicle-listing-editor .vle-tog { position: relative; width: 40px; height: 22px; flex-shrink: 0; margin-left: 12px; }
vehicle-listing-editor .vle-tog input { opacity: 0; width: 0; height: 0; }
vehicle-listing-editor .vle-tog-slider { position: absolute; inset: 0; background: var(--bg3); border-radius: 22px; cursor: pointer; transition: background .2s; }
vehicle-listing-editor .vle-tog-slider::before { content: ''; position: absolute; width: 16px; height: 16px; left: 3px; top: 3px; background: #fff; border-radius: 50%; transition: transform .2s; box-shadow: 0 1px 4px rgba(0,0,0,.25); }
vehicle-listing-editor .vle-tog input:checked + .vle-tog-slider { background: var(--accent); }
vehicle-listing-editor .vle-tog input:checked + .vle-tog-slider::before { transform: translateX(18px); }
vehicle-listing-editor .vle-upload-zone { border: 2px dashed var(--border); border-radius: var(--r2); padding: 28px; text-align: center; cursor: pointer; transition: all .2s; background: var(--bg2); position: relative; }
vehicle-listing-editor .vle-upload-zone:hover { border-color: var(--accent); background: #fff7f3; }
vehicle-listing-editor .vle-upload-zone input[type=file] { display: none; }
vehicle-listing-editor .vle-upload-zone svg { width: 32px; height: 32px; color: var(--ink3); margin-bottom: 8px; }
vehicle-listing-editor .vle-upload-zone p { font-size: 13px; color: var(--ink3); margin-bottom: 4px; }
vehicle-listing-editor .vle-upload-zone small { font-size: 11px; color: var(--ink4); }
vehicle-listing-editor .vle-gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px; margin-top: 14px; }
vehicle-listing-editor .vle-gallery-item { position: relative; border-radius: var(--r); overflow: hidden; border: 2px solid var(--border); aspect-ratio: 4/3; cursor: grab; background: var(--bg2); }
vehicle-listing-editor .vle-gallery-item:active { cursor: grabbing; }
vehicle-listing-editor .vle-gallery-item.primary { border-color: var(--accent); }
vehicle-listing-editor .vle-gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
vehicle-listing-editor .vle-gallery-item-overlay { position: absolute; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; gap: 4px; opacity: 0; transition: opacity .2s; }
vehicle-listing-editor .vle-gallery-item:hover .vle-gallery-item-overlay { opacity: 1; }
vehicle-listing-editor .vle-gallery-item-badge { position: absolute; top: 4px; left: 4px; background: var(--accent); color: #fff; font-size: 9px; font-weight: 700; padding: 2px 6px; border-radius: 3px; text-transform: uppercase; }
vehicle-listing-editor .vle-gallery-loading { position: absolute; inset: 0; background: rgba(255,255,255,.85); display: flex; align-items: center; justify-content: center; }
vehicle-listing-editor .vle-inline-progress { display: none; align-items: center; gap: 10px; padding: 8px 12px; background: #fffbe6; border: 1px solid #ffe58f; border-radius: var(--r); font-size: 12px; color: #614700; margin-top: 8px; }
vehicle-listing-editor .vle-inline-progress.active { display: flex; }
vehicle-listing-editor .vle-inline-progress-track { flex: 1; height: 4px; background: #fff3cd; border-radius: 2px; overflow: hidden; }
vehicle-listing-editor .vle-inline-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #f59e0b); border-radius: 2px; transition: width .3s; width: 0%; }
vehicle-listing-editor .vle-calc-result { background: linear-gradient(135deg, var(--accent2) 0%, #0f2a42 100%); border-radius: var(--r2); padding: 20px; color: #fff; text-align: center; margin-top: 14px; }
vehicle-listing-editor .vle-calc-amount { font-family: 'Syne', sans-serif; font-size: 38px; font-weight: 800; margin-bottom: 4px; }
vehicle-listing-editor .vle-calc-label { font-size: 12px; opacity: .7; }
vehicle-listing-editor .vle-calc-breakdown { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-top: 14px; }
vehicle-listing-editor .vle-calc-item { text-align: center; }
vehicle-listing-editor .vle-calc-item strong { display: block; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; }
vehicle-listing-editor .vle-calc-item span { font-size: 10px; opacity: .65; }
vehicle-listing-editor .vle-alert { display: flex; gap: 10px; padding: 12px 14px; border-radius: var(--r); font-size: 13px; line-height: 1.55; margin-bottom: 14px; }
vehicle-listing-editor .vle-alert svg { width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; }
vehicle-listing-editor .vle-alert-info { background: #e8f0fe; border: 1px solid #b3cfff; color: #1a3a8a; }
vehicle-listing-editor .vle-alert-warning { background: #fffbe6; border: 1px solid #ffe58f; color: #614700; }
vehicle-listing-editor .vle-alert-success { background: #edfbf2; border: 1px solid #b7efd1; color: #0d5928; }
vehicle-listing-editor .vle-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
vehicle-listing-editor .vle-chip { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; background: var(--bg2); border: 1px solid var(--border); border-radius: 20px; font-size: 12px; color: var(--ink2); }
vehicle-listing-editor .vle-chip button { background: none; border: none; cursor: pointer; color: var(--ink3); padding: 0; line-height: 1; }
vehicle-listing-editor .vle-chip button:hover { color: var(--red); }
vehicle-listing-editor .vle-checklist { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
vehicle-listing-editor .vle-check-item { display: flex; align-items: center; gap: 8px; padding: 6px; border-radius: var(--r); cursor: pointer; transition: background .15s; }
vehicle-listing-editor .vle-check-item:hover { background: var(--bg2); }
vehicle-listing-editor .vle-check-item input { accent-color: var(--accent); width: 14px; height: 14px; }
vehicle-listing-editor .vle-check-item span { font-size: 13px; color: var(--ink2); }
vehicle-listing-editor .vle-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); z-index: 10000; display: flex; align-items: center; justify-content: center; opacity: 0; pointer-events: none; transition: opacity .25s; }
vehicle-listing-editor .vle-overlay.active { opacity: 1; pointer-events: all; }
vehicle-listing-editor .vle-overlay-card { background: var(--white); border-radius: 12px; padding: 30px 38px; min-width: 340px; text-align: center; box-shadow: var(--shadow-lg); }
vehicle-listing-editor .vle-overlay-title { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 700; margin-bottom: 5px; }
vehicle-listing-editor .vle-overlay-sub { font-size: 13px; color: var(--ink3); margin-bottom: 18px; }
vehicle-listing-editor .vle-progress-track { height: 8px; background: var(--bg3); border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
vehicle-listing-editor .vle-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); border-radius: 4px; transition: width .3s; width: 0%; }
vehicle-listing-editor .vle-progress-pct { font-size: 13px; font-weight: 600; color: var(--accent); }
vehicle-listing-editor .vle-toasts { position: fixed; top: 14px; right: 14px; z-index: 9999; display: flex; flex-direction: column; gap: 7px; }
vehicle-listing-editor .vle-toast { padding: 11px 16px; border-radius: var(--r); font-size: 13px; font-weight: 500; box-shadow: var(--shadow); max-width: 340px; font-family: 'Instrument Sans', sans-serif; animation: vle-tIn .25s ease; }
@keyframes vle-tIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
vehicle-listing-editor .vle-toast-success { background: #edfbf2; border: 1px solid #b7efd1; color: #0d5928; }
vehicle-listing-editor .vle-toast-error   { background: #fef1f2; border: 1px solid #fcc; color: var(--red); }
vehicle-listing-editor .vle-toast-info    { background: #e8f0fe; border: 1px solid #b3cfff; color: #1a3a8a; }
vehicle-listing-editor .vle-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 10001; display: flex; align-items: center; justify-content: center; padding: 20px; }
vehicle-listing-editor .vle-modal { background: var(--white); border-radius: 12px; width: 100%; max-width: 900px; max-height: 85vh; overflow: auto; box-shadow: var(--shadow-lg); }
vehicle-listing-editor .vle-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 24px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--white); z-index: 1; }
vehicle-listing-editor .vle-modal-head h2 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
vehicle-listing-editor .vle-compare-table { width: 100%; border-collapse: collapse; font-size: 13px; }
vehicle-listing-editor .vle-compare-table th { background: var(--bg2); font-weight: 700; font-size: 12px; text-align: center; border: 1px solid var(--border); padding: 12px; font-family: 'Syne', sans-serif; }
vehicle-listing-editor .vle-compare-table th:first-child { text-align: left; width: 140px; background: var(--bg3); }
vehicle-listing-editor .vle-compare-table td { border: 1px solid var(--border); padding: 10px 12px; text-align: center; }
vehicle-listing-editor .vle-compare-table td:first-child { text-align: left; font-weight: 600; background: var(--bg); color: var(--ink3); font-size: 11px; text-transform: uppercase; letter-spacing: .4px; }
vehicle-listing-editor .vle-compare-table tr:hover td { background-color: #fafaf8; }
vehicle-listing-editor .vle-compare-table tr:hover td:first-child { background-color: var(--bg2); }
vehicle-listing-editor .vle-type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
vehicle-listing-editor .vle-type-btn { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 10px; border: 2px solid var(--border); border-radius: var(--r2); background: var(--white); cursor: pointer; transition: all .2s; font-family: 'Instrument Sans', sans-serif; font-size: 12px; font-weight: 600; color: var(--ink3); }
vehicle-listing-editor .vle-type-btn svg { width: 28px; height: 28px; }
vehicle-listing-editor .vle-type-btn:hover { border-color: var(--accent); background: #fff7f3; color: var(--ink); }
vehicle-listing-editor .vle-type-btn.active { border-color: var(--accent); background: var(--accent); color: #fff; }
vehicle-listing-editor .vle-ltype-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 6px; }
vehicle-listing-editor .vle-ltype-btn { padding: 10px; border: 2px solid var(--border); border-radius: var(--r); background: var(--white); cursor: pointer; font-size: 12px; font-weight: 700; color: var(--ink3); text-align: center; transition: all .15s; font-family: 'Instrument Sans', sans-serif; }
vehicle-listing-editor .vle-ltype-btn:hover { border-color: var(--accent2); color: var(--ink); }
vehicle-listing-editor .vle-ltype-btn.active { border-color: var(--accent2); background: var(--accent2); color: #fff; }

/* Related listings styles */
vehicle-listing-editor .vle-related-search { display: flex; gap: 8px; margin-bottom: 14px; }
vehicle-listing-editor .vle-related-search input { flex: 1; padding: 8px 12px; border: 1.5px solid var(--border); border-radius: var(--r); font-family: 'Instrument Sans', sans-serif; font-size: 13px; background: var(--bg); color: var(--ink); outline: none; }
vehicle-listing-editor .vle-related-search input:focus { border-color: var(--accent); }
vehicle-listing-editor .vle-related-list { background: var(--white); border: 1px solid var(--border); border-radius: var(--r2); overflow: hidden; }
vehicle-listing-editor .vle-related-item { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background .15s; }
vehicle-listing-editor .vle-related-item:last-child { border-bottom: none; }
vehicle-listing-editor .vle-related-item:hover { background: var(--bg2); }
vehicle-listing-editor .vle-related-item.selected { background: #e8f0fe; }
vehicle-listing-editor .vle-related-check { width: 18px; height: 18px; border: 2px solid var(--border); border-radius: 3px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; font-weight: 700; }
vehicle-listing-editor .vle-related-item.selected .vle-related-check { background: var(--blue); border-color: var(--blue); color: #fff; }
vehicle-listing-editor .vle-related-thumb { width: 48px; height: 36px; object-fit: cover; border-radius: 4px; flex-shrink: 0; background: var(--bg2); }
vehicle-listing-editor .vle-related-info { flex: 1; min-width: 0; }
vehicle-listing-editor .vle-related-title { font-size: 13px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
vehicle-listing-editor .vle-related-meta { font-size: 11px; color: var(--ink3); margin-top: 2px; }
vehicle-listing-editor .vle-related-count { font-size: 12px; color: var(--ink3); margin-bottom: 10px; }

@media (max-width: 900px) {
    vehicle-listing-editor .vle-grid { grid-template-columns: 1fr 1fr; }
    vehicle-listing-editor .vle-grid-3, vehicle-listing-editor .vle-grid-4 { grid-template-columns: 1fr 1fr; }
    vehicle-listing-editor .vle-type-grid { grid-template-columns: 1fr 1fr; }
    vehicle-listing-editor .vle-ltype-grid { grid-template-columns: 1fr 1fr; }
    vehicle-listing-editor .vle-checklist { grid-template-columns: 1fr; }
}
@media (max-width: 620px) {
    vehicle-listing-editor .vle-grid { grid-template-columns: 1fr; }
    vehicle-listing-editor .vle-grid-2 { grid-template-columns: 1fr; }
    vehicle-listing-editor .vle-panel { padding: 14px; }
}
`;
    }

    _shellHTML() {
        return `
<div class="vle-host">
    <div class="vle-topbar">
        <div class="vle-brand">${this._icon('car')} AutoDesk<span class="vle-brand-dot">.</span></div>
        <div class="vle-topbar-acts" id="topActs">
            <div class="vle-topbar-stat"><strong id="statTotal">0</strong> listings</div>
            <div class="vle-topbar-stat"><strong id="statActive">0</strong> active</div>
            <div class="vle-topbar-stat"><strong id="statSold">0</strong> sold</div>
        </div>
    </div>

    <div class="vle-list-view" id="listView">
        <div class="vle-toolbar">
            <div class="vle-toolbar-left">
                <div class="vle-search-box">
                    ${this._icon('filter')}
                    <input type="text" id="searchInput" placeholder="Search by make, model, year, VIN…">
                </div>
                <select class="vle-filter-sel" id="filterType">
                    <option value="all">All Types</option>
                    <option value="car">Cars & Trucks</option>
                    <option value="motorcycle">Motorcycles</option>
                    <option value="rv">RVs & Campers</option>
                    <option value="boat">Boats</option>
                </select>
                <select class="vle-filter-sel" id="filterListing">
                    <option value="all">All Listings</option>
                    <option value="new">For Sale (New)</option>
                    <option value="used">For Sale (Used)</option>
                    <option value="rent">Rent/Lease</option>
                    <option value="auction">Auction</option>
                </select>
                <select class="vle-filter-sel" id="sortBy">
                    <option value="date-desc">Newest First</option>
                    <option value="date-asc">Oldest First</option>
                    <option value="price-asc">Price: Low→High</option>
                    <option value="price-desc">Price: High→Low</option>
                    <option value="year-desc">Year: Newest</option>
                </select>
            </div>
            <div class="vle-toolbar-right">
                <button class="vle-btn vle-btn-light vle-btn-sm" id="bulkToggleBtn">${this._icon('copy')} Bulk</button>
                <button class="vle-btn vle-btn-primary" id="newListingBtn">${this._icon('plus')} New Listing</button>
            </div>
        </div>

        <div class="vle-stats-bar" id="statBar">
            <div class="vle-stat-pill active" data-status="all"><span>All</span> <strong id="cntAll">0</strong></div>
            <div class="vle-stat-pill" data-status="active">${this._icon('check')}<span>Active</span> <strong id="cntActive">0</strong></div>
            <div class="vle-stat-pill" data-status="draft">${this._icon('edit')}<span>Draft</span> <strong id="cntDraft">0</strong></div>
            <div class="vle-stat-pill" data-status="sold">${this._icon('archive')}<span>Sold</span> <strong id="cntSold">0</strong></div>
            <div class="vle-stat-pill" data-status="rented">${this._icon('archive')}<span>Rented</span> <strong id="cntRented">0</strong></div>
            <div class="vle-stat-pill" data-status="expired">${this._icon('alert')}<span>Expired</span> <strong id="cntExpired">0</strong></div>
        </div>

        <div class="vle-compare-bar" id="compareBar">
            ${this._icon('compare')} Compare:
            <div class="vle-compare-slots" id="compareSlots"></div>
            <button class="vle-btn vle-btn-ghost vle-btn-sm" id="openCompareBtn" disabled>Compare Now</button>
            <button class="vle-btn vle-btn-ghost vle-btn-sm" id="clearCompareBtn">Clear</button>
        </div>

        <div class="vle-list-scroll">
            <div id="listLoading" class="vle-state-box">
                <svg class="vle-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" stroke-opacity=".2"/>
                    <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                <p>Loading listings…</p>
            </div>
            <div id="listGrid" class="vle-grid" style="display:none"></div>
        </div>
    </div>

    <div class="vle-editor-view hidden" id="editorView">
        <div class="vle-editor-topbar">
            <button class="vle-btn vle-btn-light vle-btn-sm" id="backBtn">${this._icon('back')} All Listings</button>
            <div class="vle-editor-title" id="editorTitle">New Listing</div>
            <div class="vle-editor-acts">
                <button class="vle-btn vle-btn-light vle-btn-sm" id="saveDraftBtn">${this._icon('save')} Save Draft</button>
                <button class="vle-btn vle-btn-primary" id="publishBtn">${this._icon('check')} Publish</button>
            </div>
        </div>

        <div class="vle-tabs">
            <button class="vle-tab active" data-tab="basic">${this._icon('car')} Basic Info</button>
            <button class="vle-tab" data-tab="specs">${this._icon('gear')} Specs</button>
            <button class="vle-tab" data-tab="pricing">${this._icon('dollar')} Pricing</button>
            <button class="vle-tab" data-tab="media">${this._icon('image')} Media</button>
            <button class="vle-tab" data-tab="features">${this._icon('check')} Features</button>
            <button class="vle-tab" data-tab="history">${this._icon('history')} History</button>
            <button class="vle-tab" data-tab="dealer">${this._icon('location')} Dealer</button>
            <button class="vle-tab" data-tab="leads">${this._icon('user')} Lead Capture</button>
            <button class="vle-tab" data-tab="related">${this._icon('link')} Related</button>
            <button class="vle-tab" data-tab="seo">${this._icon('seo')} SEO</button>
        </div>

        <div class="vle-editor-body">
            <div class="vle-panel active" id="panel-basic">${this._basicPanel()}</div>
            <div class="vle-panel" id="panel-specs">${this._specsPanel()}</div>
            <div class="vle-panel" id="panel-pricing">${this._pricingPanel()}</div>
            <div class="vle-panel" id="panel-media">${this._mediaPanel()}</div>
            <div class="vle-panel" id="panel-features">${this._featuresPanel()}</div>
            <div class="vle-panel" id="panel-history">${this._historyPanel()}</div>
            <div class="vle-panel" id="panel-dealer">${this._dealerPanel()}</div>
            <div class="vle-panel" id="panel-leads">${this._leadsPanel()}</div>
            <div class="vle-panel" id="panel-related">${this._relatedPanel()}</div>
            <div class="vle-panel" id="panel-seo">${this._seoPanel()}</div>
        </div>
    </div>

    <div class="vle-overlay" id="progressOverlay">
        <div class="vle-overlay-card">
            <div class="vle-overlay-title" id="overlayTitle">Saving…</div>
            <div class="vle-overlay-sub" id="overlaySub">Please wait</div>
            <div class="vle-progress-track"><div class="vle-progress-fill" id="overlayFill"></div></div>
            <div class="vle-progress-pct" id="overlayPct">0%</div>
        </div>
    </div>

    <div id="compareModalWrap"></div>
    <div class="vle-toasts" id="toastArea"></div>
</div>`;
    }

    _basicPanel() {
        return `
<div class="vle-section">
    <div class="vle-section-head">${this._icon('car')} Vehicle Type</div>
    <div class="vle-section-body">
        <div class="vle-type-grid" id="vehicleTypeGrid">
            <button class="vle-type-btn active" data-vtype="car">${this._icon('car')} Cars & Trucks</button>
            <button class="vle-type-btn" data-vtype="motorcycle">${this._icon('motorcycle')} Motorcycles</button>
            <button class="vle-type-btn" data-vtype="rv">${this._icon('rv')} RVs & Campers</button>
            <button class="vle-type-btn" data-vtype="boat">${this._icon('boat')} Boats</button>
        </div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('star')} Listing Type</div>
    <div class="vle-section-body">
        <div class="vle-ltype-grid" id="listingTypeGrid">
            <button class="vle-ltype-btn" data-ltype="new">For Sale (New)</button>
            <button class="vle-ltype-btn active" data-ltype="used">For Sale (Used)</button>
            <button class="vle-ltype-btn" data-ltype="rent">Rent / Lease</button>
            <button class="vle-ltype-btn" data-ltype="auction">Auction</button>
        </div>
        <div class="vle-field" style="margin-top:10px;">
            <label>Listing Status</label>
            <select class="vle-sel" data-d="status" id="statusSel">
                <option value="draft">Draft (Hidden)</option>
                <option value="active">Active (Live)</option>
                <option value="sold">Sold</option>
                <option value="rented">Rented</option>
                <option value="expired">Expired</option>
            </select>
        </div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('edit')} Core Details</div>
    <div class="vle-section-body">
        <div class="vle-grid-2">
            <div class="vle-field vle-full">
                <label>Listing Title</label>
                <input class="vle-inp" data-d="title" id="titleInp" placeholder="e.g. 2022 Ford Mustang GT Premium">
            </div>
            <div class="vle-field vle-full">
                <label>URL Slug</label>
                <input class="vle-inp" data-d="slug" id="slugInp" placeholder="e.g. 2022-ford-mustang-gt" readonly>
            </div>
            <div class="vle-field">
                <label>Make / Brand</label>
                <input class="vle-inp" data-d="make" id="makeInp" list="makesList" placeholder="e.g. Toyota">
                <datalist id="makesList"></datalist>
            </div>
            <div class="vle-field">
                <label>Model</label>
                <input class="vle-inp" data-d="model" id="modelInp" placeholder="e.g. Camry">
            </div>
            <div class="vle-field">
                <label>Trim / Variant</label>
                <input class="vle-inp" data-d="trim" placeholder="e.g. XLE Sport">
            </div>
            <div class="vle-field">
                <label>Year</label>
                <input class="vle-inp" data-d="year" type="number" placeholder="2023" min="1900" max="2099">
            </div>
            <div class="vle-field">
                <label>Exterior Color</label>
                <input class="vle-inp" data-d="exteriorColor" placeholder="e.g. Midnight Black">
            </div>
            <div class="vle-field">
                <label>Interior Color</label>
                <input class="vle-inp" data-d="interiorColor" placeholder="e.g. Beige Leather">
            </div>
            <div class="vle-field">
                <label>Body Style</label>
                <input class="vle-inp" data-d="bodyStyle" placeholder="e.g. SUV, Sedan, Pickup">
            </div>
            <div class="vle-field">
                <label>Condition</label>
                <select class="vle-sel" data-d="condition">
                    <option value="new">New</option>
                    <option value="like_new">Like New</option>
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor / For Parts</option>
                </select>
            </div>
        </div>
        <div class="vle-field" style="margin-top:14px;">
            <label>Description</label>
            <textarea class="vle-txt" data-d="description" placeholder="Write a compelling description highlighting key features, condition, and why this vehicle stands out." rows="5"></textarea>
        </div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('star')} Listing Options</div>
    <div class="vle-section-body">
        <div class="vle-tog-row">
            <div class="vle-tog-info">
                <div class="vle-tog-label">Featured Listing</div>
                <div class="vle-tog-desc">Highlighted in search results and homepage.</div>
            </div>
            <label class="vle-tog"><input type="checkbox" data-d="featured"><span class="vle-tog-slider"></span></label>
        </div>
        <div class="vle-tog-row">
            <div class="vle-tog-info">
                <div class="vle-tog-label">Enable Compare</div>
                <div class="vle-tog-desc">Allow visitors to add this listing to the comparison tool.</div>
            </div>
            <label class="vle-tog"><input type="checkbox" data-d="compareEnabled" checked><span class="vle-tog-slider"></span></label>
        </div>
        <div class="vle-tog-row">
            <div class="vle-tog-info">
                <div class="vle-tog-label">Certified Pre-Owned</div>
                <div class="vle-tog-desc">Adds a CPO badge to the listing.</div>
            </div>
            <label class="vle-tog"><input type="checkbox" data-d="certifiedPreOwned"><span class="vle-tog-slider"></span></label>
        </div>
    </div>
</div>`;
    }

    _specsPanel() {
        return `
<div class="vle-section" id="specIdentitySection">
    <div class="vle-section-head">${this._icon('car')} Identity Numbers</div>
    <div class="vle-section-body">
        <div class="vle-grid-2">
            <div class="vle-field">
                <label>VIN</label>
                <input class="vle-inp" data-d="vin" placeholder="e.g. 1HGBH41JXMN109186" maxlength="17">
            </div>
            <div class="vle-field">
                <label>Stock Number</label>
                <input class="vle-inp" data-d="stockNumber" placeholder="e.g. STK-2024-001">
            </div>
        </div>
    </div>
</div>

<div class="vle-section" id="specEngineSection">
    <div class="vle-section-head">${this._icon('gear')} Engine & Performance</div>
    <div class="vle-section-body">
        <div class="vle-grid-3">
            <div class="vle-field">
                <label>Engine</label>
                <input class="vle-inp" data-d="engine" placeholder="e.g. 5.0L V8">
            </div>
            <div class="vle-field">
                <label>Displacement</label>
                <input class="vle-inp" data-d="engineDisplacement" placeholder="e.g. 5.0L">
            </div>
            <div class="vle-field">
                <label>Cylinders</label>
                <input class="vle-inp" data-d="cylinders" placeholder="e.g. 8">
            </div>
            <div class="vle-field">
                <label>Horsepower (hp)</label>
                <input class="vle-inp" data-d="horsepower" type="number" placeholder="e.g. 450">
            </div>
            <div class="vle-field">
                <label>Torque (lb-ft)</label>
                <input class="vle-inp" data-d="torque" type="number" placeholder="e.g. 420">
            </div>
            <div class="vle-field">
                <label>Fuel Type</label>
                <select class="vle-sel" data-d="fuelType">
                    <option value="">— Select —</option>
                    <option value="gasoline">Gasoline</option>
                    <option value="diesel">Diesel</option>
                    <option value="electric">Electric (EV)</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="phev">Plug-in Hybrid (PHEV)</option>
                    <option value="hydrogen">Hydrogen</option>
                    <option value="cng">CNG / LPG</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <div class="vle-field">
                <label>Transmission</label>
                <select class="vle-sel" data-d="transmission">
                    <option value="">— Select —</option>
                    <option value="automatic">Automatic</option>
                    <option value="manual">Manual</option>
                    <option value="cvt">CVT</option>
                    <option value="dct">Dual-Clutch (DCT)</option>
                    <option value="semi">Semi-Automatic</option>
                    <option value="single">Single-Speed (EV)</option>
                </select>
            </div>
            <div class="vle-field">
                <label>Drivetrain</label>
                <select class="vle-sel" data-d="drivetrain">
                    <option value="">— Select —</option>
                    <option value="fwd">FWD</option>
                    <option value="rwd">RWD</option>
                    <option value="awd">AWD</option>
                    <option value="4wd">4WD / 4×4</option>
                </select>
            </div>
            <div class="vle-field">
                <label>EV Range (miles)</label>
                <input class="vle-inp" data-d="range" type="number" placeholder="e.g. 350">
            </div>
        </div>
    </div>
</div>

<div class="vle-section" id="specFuelSection">
    <div class="vle-section-head">${this._icon('star')} Fuel Economy</div>
    <div class="vle-section-body">
        <div class="vle-grid-3">
            <div class="vle-field">
                <label>City MPG</label>
                <input class="vle-inp" data-d="mpgCity" type="number" placeholder="e.g. 18">
            </div>
            <div class="vle-field">
                <label>Highway MPG</label>
                <input class="vle-inp" data-d="mpgHighway" type="number" placeholder="e.g. 26">
            </div>
            <div class="vle-field">
                <label>Mileage (odometer)</label>
                <input class="vle-inp" data-d="mileage" type="number" placeholder="e.g. 45000">
            </div>
        </div>
    </div>
</div>

<div class="vle-section" id="specDimensionsSection">
    <div class="vle-section-head">${this._icon('compare')} Dimensions & Capacity</div>
    <div class="vle-section-body">
        <div class="vle-grid-4">
            <div class="vle-field"><label>Doors</label><input class="vle-inp" data-d="doors" type="number" placeholder="e.g. 4"></div>
            <div class="vle-field"><label>Seating</label><input class="vle-inp" data-d="seatingCapacity" type="number" placeholder="e.g. 5"></div>
            <div class="vle-field"><label>Length (ft)</label><input class="vle-inp" data-d="length" type="number" step="0.1" placeholder="e.g. 16.5"></div>
            <div class="vle-field"><label>Width (ft)</label><input class="vle-inp" data-d="width" type="number" step="0.1" placeholder="e.g. 6.5"></div>
            <div class="vle-field"><label>Height (ft)</label><input class="vle-inp" data-d="height" type="number" step="0.1" placeholder="e.g. 5.2"></div>
            <div class="vle-field"><label>Weight (lbs)</label><input class="vle-inp" data-d="weight" type="number" placeholder="e.g. 4200"></div>
            <div class="vle-field"><label>Towing Capacity (lbs)</label><input class="vle-inp" data-d="towingCapacity" type="number" placeholder="e.g. 8000"></div>
            <div class="vle-field"><label>Payload (lbs)</label><input class="vle-inp" data-d="payload" type="number" placeholder="e.g. 1800"></div>
        </div>
    </div>
</div>

<div class="vle-section" id="specBoatSection" style="display:none">
    <div class="vle-section-head">${this._icon('boat')} Boat-Specific Details</div>
    <div class="vle-section-body">
        <div class="vle-grid-3">
            <div class="vle-field"><label>Boat Type</label><input class="vle-inp" data-d="boatType" placeholder="e.g. Pontoon"></div>
            <div class="vle-field"><label>Hull Material</label><input class="vle-inp" data-d="hullMaterial" placeholder="e.g. Fiberglass"></div>
            <div class="vle-field"><label>Engine Type (Marine)</label><input class="vle-inp" data-d="engineType" placeholder="e.g. Outboard"></div>
            <div class="vle-field"><label>Engine Hours</label><input class="vle-inp" data-d="engineHours" type="number" placeholder="e.g. 250"></div>
        </div>
    </div>
</div>`;
    }

    _pricingPanel() {
        return `
<div class="vle-section">
    <div class="vle-section-head">${this._icon('dollar')} Sale Pricing</div>
    <div class="vle-section-body">
        <div class="vle-grid-2">
            <div class="vle-field">
                <label>Currency</label>
                <select class="vle-sel" data-d="currency">
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="CAD">CAD (C$)</option>
                    <option value="AUD">AUD (A$)</option>
                    <option value="INR">INR (₹)</option>
                    <option value="AED">AED (د.إ)</option>
                </select>
            </div>
            <div class="vle-field">
                <label>Asking Price</label>
                <div class="vle-inp-prefix"><span class="vle-inp-prefix-label">$</span><input type="number" data-d="price" id="priceInp" placeholder="e.g. 28500" step="100"></div>
            </div>
            <div class="vle-field">
                <label>Sale / Discounted Price</label>
                <div class="vle-inp-prefix"><span class="vle-inp-prefix-label">$</span><input type="number" data-d="salePrice" placeholder="e.g. 26900" step="100"></div>
            </div>
            <div class="vle-field">
                <label>MSRP / Original Price</label>
                <div class="vle-inp-prefix"><span class="vle-inp-prefix-label">$</span><input type="number" data-d="msrp" placeholder="e.g. 32000" step="100"></div>
            </div>
        </div>
        <div style="margin-top:14px;">
            <div class="vle-tog-row">
                <div class="vle-tog-info">
                    <div class="vle-tog-label">Price Negotiable</div>
                    <div class="vle-tog-desc">Shows "OBO" badge on listing.</div>
                </div>
                <label class="vle-tog"><input type="checkbox" data-d="priceNegotiable"><span class="vle-tog-slider"></span></label>
            </div>
            <div class="vle-tog-row">
                <div class="vle-tog-info">
                    <div class="vle-tog-label">Show Price on Site</div>
                    <div class="vle-tog-desc">Uncheck to show "Call for Price".</div>
                </div>
                <label class="vle-tog"><input type="checkbox" data-d="showPriceOnSite" checked><span class="vle-tog-slider"></span></label>
            </div>
        </div>
    </div>
</div>

<div class="vle-section" id="rentalPricingSection" style="display:none">
    <div class="vle-section-head">${this._icon('history')} Rental / Lease Rates</div>
    <div class="vle-section-body">
        <div class="vle-grid-3">
            <div class="vle-field"><label>Per Day</label><div class="vle-inp-prefix"><span class="vle-inp-prefix-label">$</span><input type="number" data-d="rentalPricePerDay" placeholder="e.g. 120"></div></div>
            <div class="vle-field"><label>Per Week</label><div class="vle-inp-prefix"><span class="vle-inp-prefix-label">$</span><input type="number" data-d="rentalPricePerWeek" placeholder="e.g. 700"></div></div>
            <div class="vle-field"><label>Per Month</label><div class="vle-inp-prefix"><span class="vle-inp-prefix-label">$</span><input type="number" data-d="rentalPricePerMonth" placeholder="e.g. 1800"></div></div>
        </div>
    </div>
</div>

<div class="vle-section" id="auctionPricingSection" style="display:none">
    <div class="vle-section-head">${this._icon('star')} Auction Details</div>
    <div class="vle-section-body">
        <div class="vle-grid-3">
            <div class="vle-field"><label>Starting Bid</label><div class="vle-inp-prefix"><span class="vle-inp-prefix-label">$</span><input type="number" data-d="auctionStartPrice" placeholder="e.g. 5000"></div></div>
            <div class="vle-field"><label>Reserve Price</label><div class="vle-inp-prefix"><span class="vle-inp-prefix-label">$</span><input type="number" data-d="auctionReservePrice" placeholder="e.g. 15000"></div></div>
            <div class="vle-field"><label>Auction End Date</label><input class="vle-inp" type="datetime-local" data-d="auctionEndDate"></div>
        </div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('dollar')} Finance Calculator</div>
    <div class="vle-section-body">
        <div class="vle-tog-row">
            <div class="vle-tog-info">
                <div class="vle-tog-label">Enable Finance Calculator</div>
                <div class="vle-tog-desc">Show a payment estimator widget on the listing page.</div>
            </div>
            <label class="vle-tog"><input type="checkbox" data-d="financeEnabled" id="financeToggle"><span class="vle-tog-slider"></span></label>
        </div>
        <div id="financeFields" style="margin-top:14px;">
            <div class="vle-grid-3">
                <div class="vle-field"><label>Down Payment ($)</label><div class="vle-inp-prefix"><span class="vle-inp-prefix-label">$</span><input type="number" data-d="downPayment" id="downPaymentInp" placeholder="e.g. 3000" step="500"></div></div>
                <div class="vle-field">
                    <label>Loan Term (months)</label>
                    <select class="vle-sel" data-d="loanTermMonths" id="loanTermSel">
                        <option value="24">24 months</option>
                        <option value="36">36 months</option>
                        <option value="48">48 months</option>
                        <option value="60" selected>60 months</option>
                        <option value="72">72 months</option>
                        <option value="84">84 months</option>
                    </select>
                </div>
                <div class="vle-field"><label>Interest Rate (APR %)</label><div class="vle-inp-prefix"><span class="vle-inp-prefix-label">%</span><input type="number" data-d="interestRate" id="interestRateInp" placeholder="e.g. 5.9" step="0.1" max="99"></div></div>
            </div>
            <div id="calcResult" class="vle-calc-result" style="display:none">
                <div class="vle-calc-amount" id="calcMonthly">$—</div>
                <div class="vle-calc-label">Estimated Monthly Payment</div>
                <div class="vle-calc-breakdown">
                    <div class="vle-calc-item"><strong id="calcTotal">—</strong><span>Total Cost</span></div>
                    <div class="vle-calc-item"><strong id="calcInterestTotal">—</strong><span>Total Interest</span></div>
                    <div class="vle-calc-item"><strong id="calcLoanAmt">—</strong><span>Loan Amount</span></div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('history')} Listing Dates</div>
    <div class="vle-section-body">
        <div class="vle-grid-3">
            <div class="vle-field"><label>Listed Date</label><input class="vle-inp" type="date" data-d="listedDate"></div>
            <div class="vle-field"><label>Expiry Date</label><input class="vle-inp" type="date" data-d="expiryDate"></div>
            <div class="vle-field"><label>Sold / Rented Date</label><input class="vle-inp" type="date" data-d="soldDate"></div>
        </div>
    </div>
</div>`;
    }

    _mediaPanel() {
        return `
<div class="vle-section">
    <div class="vle-section-head">${this._icon('image')} Photo Gallery</div>
    <div class="vle-section-body">
        <div class="vle-upload-zone" id="galleryUploadZone">
            <input type="file" id="galleryFileInput" accept="image/*" multiple>
            ${this._icon('upload')}
            <p><strong>Click to upload photos</strong> or drag & drop here</p>
            <small>Supports JPG, PNG, WebP · Automatically converted to WebP</small>
        </div>
        <div class="vle-inline-progress" id="galleryProgress">
            <span id="galleryProgressLabel">Uploading...</span>
            <div class="vle-inline-progress-track"><div class="vle-inline-progress-fill" id="galleryProgressFill"></div></div>
        </div>
        <div class="vle-gallery-grid" id="galleryGrid"></div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('video')} Video & Virtual Tour</div>
    <div class="vle-section-body">
        <div class="vle-grid-2">
            <div class="vle-field"><label>YouTube / Vimeo Video URL</label><input class="vle-inp" data-d="videoUrl" placeholder="https://youtube.com/watch?v=..."></div>
            <div class="vle-field"><label>360° / Matterport Tour URL</label><input class="vle-inp" data-d="video360Url" placeholder="https://my.matterport.com/show/..."></div>
            <div class="vle-field vle-full"><label>External Tour / Preview Link</label><input class="vle-inp" data-d="tourUrl" placeholder="https://example.com/virtual-tour"></div>
        </div>
    </div>
</div>`;
    }

    _featuresPanel() {
        return `
<div class="vle-section">
    <div class="vle-section-head">${this._icon('star')} Safety Features</div>
    <div class="vle-section-body">
        <div class="vle-checklist" id="safetyChecklist">
            ${this._checklistHTML('safety', ['Airbags (Front)','Airbags (Side)','Airbags (Curtain)','ABS Brakes','Electronic Stability Control','Traction Control','Lane Departure Warning','Lane Keep Assist','Blind Spot Monitoring','Rear Cross-Traffic Alert','Forward Collision Warning','Automatic Emergency Braking','Adaptive Cruise Control','Parking Sensors (Front)','Parking Sensors (Rear)','Backup Camera','360° Camera','Tire Pressure Monitor','Hill Start Assist','Roll Stability Control'])}
        </div>
        <div class="vle-field" style="margin-top:14px;">
            <label>Additional Safety Features</label>
            <input class="vle-inp" data-d="safetyFeatures" placeholder="e.g. Night Vision, Pedestrian Detection">
        </div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('gear')} Technology & Connectivity</div>
    <div class="vle-section-body">
        <div class="vle-checklist" id="techChecklist">
            ${this._checklistHTML('tech', ['Apple CarPlay','Android Auto','Wireless CarPlay/Android Auto','Navigation System','Bluetooth','Wi-Fi Hotspot','USB-A Ports','USB-C Ports','Wireless Charging','Premium Audio System','Satellite Radio','Heads-Up Display','Digital Instrument Cluster','Touchscreen Display','Voice Control','Remote Start','Keyless Entry','Push-Button Start','OTA Software Updates','Dashcam'])}
        </div>
        <div class="vle-field" style="margin-top:14px;">
            <label>Additional Tech Features</label>
            <input class="vle-inp" data-d="techFeatures" placeholder="e.g. Custom Stereo System">
        </div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('car')} Exterior Features</div>
    <div class="vle-section-body">
        <div class="vle-checklist" id="exteriorChecklist">
            ${this._checklistHTML('exterior', ['Alloy Wheels','Chrome Wheels','Running Boards','Roof Rack','Sunroof / Moonroof','Panoramic Sunroof','Convertible Top','Retractable Hard Top','Power Mirrors','Heated Mirrors','Fold-Flat Mirrors','LED Headlights','Adaptive Headlights','Fog Lights','Trailer Hitch','Bed Liner','Tonneau Cover','Spoiler','Body Kit','Tinted Windows'])}
        </div>
        <div class="vle-field" style="margin-top:14px;">
            <label>Additional Exterior Features</label>
            <input class="vle-inp" data-d="exteriorFeatures" placeholder="e.g. Custom Wrap, Lift Kit">
        </div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('star')} Interior & Comfort</div>
    <div class="vle-section-body">
        <div class="vle-checklist" id="interiorChecklist">
            ${this._checklistHTML('interior', ['Leather Seats','Heated Front Seats','Heated Rear Seats','Ventilated / Cooled Seats','Memory Seats','Power Driver Seat','Power Passenger Seat','Massage Seats','Third Row Seating','Folding Rear Seats','Heated Steering Wheel','Power Steering','Tilt Steering','Telescoping Steering','Ambient Lighting','Dual-Zone Climate Control','Tri-Zone Climate Control','Rear AC Vents','Power Windows','Power Locks'])}
        </div>
        <div class="vle-field" style="margin-top:14px;">
            <label>Additional Interior Features</label>
            <input class="vle-inp" data-d="interiorFeatures" placeholder="e.g. Custom Upholstery">
        </div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('star')} Packages & Options</div>
    <div class="vle-section-body">
        <div class="vle-field"><label>Option Packages</label><input class="vle-inp" data-d="packages" placeholder="e.g. Sport Package, Technology Package"></div>
        <div class="vle-field" style="margin-top:14px;">
            <label>All Features (Summary)</label>
            <textarea class="vle-txt" data-d="features" placeholder="Leather Seats, Sunroof, Navigation, Apple CarPlay…" rows="3"></textarea>
        </div>
    </div>
</div>`;
    }

    _checklistHTML(group, items) {
        return items.map(item => `
            <label class="vle-check-item">
                <input type="checkbox" data-group="${group}" data-feature="${item}">
                <span>${item}</span>
            </label>`).join('');
    }

    _historyPanel() {
        return `
<div class="vle-section">
    <div class="vle-section-head">${this._icon('history')} Ownership & History</div>
    <div class="vle-section-body">
        <div class="vle-grid-2">
            <div class="vle-field">
                <label>Number of Previous Owners</label>
                <select class="vle-sel" data-d="owners">
                    <option value="">— Select —</option>
                    <option value="0">0 (New / Never Titled)</option>
                    <option value="1">1 Previous Owner</option>
                    <option value="2">2 Previous Owners</option>
                    <option value="3">3 Previous Owners</option>
                    <option value="4+">4 or More Owners</option>
                </select>
            </div>
            <div class="vle-field">
                <label>Carfax / AutoCheck Report URL</label>
                <input class="vle-inp" data-d="carfaxUrl" placeholder="https://www.carfax.com/VehicleHistory/...">
            </div>
            <div class="vle-field vle-full">
                <label>Service History Notes</label>
                <textarea class="vle-txt" data-d="serviceHistory" placeholder="e.g. Full dealer service history available." rows="3"></textarea>
            </div>
        </div>
        <div style="margin-top:14px;">
            <div class="vle-tog-row">
                <div class="vle-tog-info">
                    <div class="vle-tog-label">Accident History</div>
                    <div class="vle-tog-desc">Has this vehicle been in any reported accidents?</div>
                </div>
                <label class="vle-tog"><input type="checkbox" data-d="accidentHistory"><span class="vle-tog-slider"></span></label>
            </div>
        </div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('check')} Warranty</div>
    <div class="vle-section-body">
        <div class="vle-grid-3">
            <div class="vle-field">
                <label>Warranty Type</label>
                <select class="vle-sel" data-d="warrantyType">
                    <option value="">No Warranty (As-Is)</option>
                    <option value="factory">Factory / Manufacturer</option>
                    <option value="dealer">Dealer Warranty</option>
                    <option value="extended">Extended / Aftermarket</option>
                    <option value="cpo">Certified Pre-Owned (CPO)</option>
                </select>
            </div>
            <div class="vle-field"><label>Warranty Remaining (months)</label><input class="vle-inp" type="number" data-d="warrantyMonths" placeholder="e.g. 36"></div>
            <div class="vle-field"><label>Warranty Miles Remaining</label><input class="vle-inp" type="number" data-d="warrantyMiles" placeholder="e.g. 30000"></div>
        </div>
    </div>
</div>`;
    }

    _dealerPanel() {
        return `
<div class="vle-section">
    <div class="vle-section-head">${this._icon('user')} Dealer / Seller Information</div>
    <div class="vle-section-body">
        <div class="vle-grid-2">
            <div class="vle-field"><label>Dealer / Business Name</label><input class="vle-inp" data-d="dealerName" placeholder="e.g. City Motors LLC"></div>
            <div class="vle-field"><label>Phone Number</label><input class="vle-inp" data-d="dealerPhone" type="tel" placeholder="e.g. +1 (555) 123-4567"></div>
            <div class="vle-field"><label>Email Address</label><input class="vle-inp" data-d="dealerEmail" type="email" placeholder="e.g. sales@citymotors.com"></div>
            <div class="vle-field"><label>Website URL</label><input class="vle-inp" data-d="dealerWebsite" placeholder="https://www.citymotors.com"></div>
        </div>
    </div>
</div>

<div class="vle-section">_dealerPanel() {
        return `
<div class="vle-section">
    <div class="vle-section-head">${this._icon('user')} Dealer / Seller Information</div>
    <div class="vle-section-body">
        <div class="vle-grid-2">
            <div class="vle-field"><label>Dealer / Business Name</label><input class="vle-inp" data-d="dealerName" placeholder="e.g. City Motors LLC"></div>
            <div class="vle-field"><label>Phone Number</label><input class="vle-inp" data-d="dealerPhone" type="tel" placeholder="e.g. +1 (555) 123-4567"></div>
            <div class="vle-field"><label>Email Address</label><input class="vle-inp" data-d="dealerEmail" type="email" placeholder="e.g. sales@citymotors.com"></div>
            <div class="vle-field"><label>Website URL</label><input class="vle-inp" data-d="dealerWebsite" placeholder="https://www.citymotors.com"></div>
        </div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('location')} Location</div>
    <div class="vle-section-body">
        <div class="vle-grid-2">
            <div class="vle-field vle-full"><label>Street Address</label><input class="vle-inp" data-d="dealerAddress" placeholder="e.g. 1234 Auto Park Drive"></div>
            <div class="vle-field"><label>City</label><input class="vle-inp" data-d="dealerCity" placeholder="e.g. Los Angeles"></div>
            <div class="vle-field"><label>State / Province</label><input class="vle-inp" data-d="dealerState" placeholder="e.g. CA"></div>
            <div class="vle-field"><label>ZIP / Postal Code</label><input class="vle-inp" data-d="dealerZip" placeholder="e.g. 90001"></div>
            <div class="vle-field"><label>Country</label><input class="vle-inp" data-d="dealerCountry" placeholder="e.g. United States"></div>
            <div class="vle-field"><label>Latitude</label><input class="vle-inp" data-d="latitude" type="number" step="0.0001" placeholder="e.g. 34.0522"></div>
            <div class="vle-field"><label>Longitude</label><input class="vle-inp" data-d="longitude" type="number" step="0.0001" placeholder="e.g. -118.2437"></div>
        </div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('image')} Dealer Logo</div>
    <div class="vle-section-body">
        <div class="vle-upload-zone" id="dealerLogoZone" style="padding:16px;">
            <input type="file" id="dealerLogoFile" accept="image/*">
            ${this._icon('image')}
            <p>Upload dealer logo</p>
            <small>PNG or SVG recommended</small>
        </div>
        <div class="vle-inline-progress" id="dealerLogoProgress">
            <span id="dealerLogoProgressLabel">Uploading...</span>
            <div class="vle-inline-progress-track"><div class="vle-inline-progress-fill" id="dealerLogoProgressFill"></div></div>
        </div>
        <img id="dealerLogoPrev" style="max-height:60px; margin-top:10px; display:none; border-radius:4px;">
    </div>
</div>`;
    }

    _leadsPanel() {
        return `
<div class="vle-section">
    <div class="vle-section-head">${this._icon('user')} Lead Form Settings</div>
    <div class="vle-section-body">
        <div class="vle-tog-row">
            <div class="vle-tog-info">
                <div class="vle-tog-label">Enable Lead Capture Form</div>
                <div class="vle-tog-desc">Show a contact form on this listing page.</div>
            </div>
            <label class="vle-tog"><input type="checkbox" data-d="leadCaptureEnabled" checked><span class="vle-tog-slider"></span></label>
        </div>
        <div style="margin-top:16px;" class="vle-grid-2">
            <div class="vle-field vle-full">
                <label>Form Headline</label>
                <input class="vle-inp" data-d="leadFormTitle" placeholder="e.g. Interested in this vehicle?">
            </div>
            <div class="vle-field vle-full">
                <label>Lead Email Recipient</label>
                <input class="vle-inp" data-d="leadEmailRecipient" type="email" placeholder="e.g. leads@citymotors.com">
            </div>
            <div class="vle-field vle-full">
                <label>Form Fields to Show</label>
                <input class="vle-inp" data-d="leadFormFields" placeholder="name, email, phone, message, test_drive, financing">
            </div>
        </div>
    </div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('compare')} Compare Tool Highlights</div>
    <div class="vle-section-body">
        <div class="vle-field">
            <label>Comparison Highlights</label>
            <textarea class="vle-txt" data-d="compareHighlights" placeholder="One highlight per line:&#10;Only 1 previous owner&#10;Full service history&#10;New tires and brakes" rows="5"></textarea>
        </div>
    </div>
</div>`;
    }

    _relatedPanel() {
        return `
<div class="vle-section">
    <div class="vle-section-head">${this._icon('link')} Related Listings</div>
    <div class="vle-section-body">
        <div class="vle-related-search">
            <input type="text" id="relatedSearchInp" placeholder="Search listings by make, model, year…">
        </div>
        <div class="vle-related-count" id="relatedCount">0 listings selected</div>
        <div class="vle-related-list" id="relatedList">
            <div class="vle-state-box" style="padding:30px;">
                <p style="font-size:13px;">No other listings available.</p>
            </div>
        </div>
    </div>
    <div class="vle-section-tip">💡 Selected listings appear as "You may also like" on the listing detail page. Saved via multi-reference field.</div>
</div>`;
    }

    _seoPanel() {
        return `
<div class="vle-section">
    <div class="vle-section-head">${this._icon('seo')} Search Engine Optimization</div>
    <div class="vle-section-body">
        <div class="vle-grid-2">
            <div class="vle-field vle-full">
                <label>SEO Title</label>
                <input class="vle-inp" data-d="seoTitle" id="seoTitleInp" placeholder="e.g. 2022 Ford Mustang GT For Sale in Los Angeles, CA">
                <small id="seoTitleCount" style="color:var(--ink3); font-size:11px; margin-top:3px;">0 / 60 characters</small>
            </div>
            <div class="vle-field vle-full">
                <label>Meta Description</label>
                <textarea class="vle-txt" data-d="seoDescription" id="seoDescInp" placeholder="e.g. 2022 Ford Mustang GT, 32,000 miles, one owner, leather seats. Priced at $28,500. Call us today!" rows="3"></textarea>
                <small id="seoDescCount" style="color:var(--ink3); font-size:11px; margin-top:3px;">0 / 160 characters</small>
            </div>
            <div class="vle-field vle-full">
                <label>SEO Keywords</label>
                <input class="vle-inp" data-d="seoKeywords" placeholder="e.g. 2022 Ford Mustang GT, used Mustang for sale Los Angeles">
            </div>
        </div>
        <div style="margin-top:16px;">
            <div class="vle-section">
                <div class="vle-section-head">${this._icon('image')} Open Graph Image</div>
                <div class="vle-section-body">
                    <div class="vle-upload-zone" id="ogZone" style="padding:16px;">
                        <input type="file" id="ogFile" accept="image/*">
                        ${this._icon('image')}
                        <p>Upload OG Image</p>
                        <small>Recommended: 1200×630px</small>
                    </div>
                    <div class="vle-inline-progress" id="ogProgress">
                        <span id="ogProgressLabel">Uploading...</span>
                        <div class="vle-inline-progress-track"><div class="vle-inline-progress-fill" id="ogProgressFill"></div></div>
                    </div>
                    <img id="ogPrev" style="max-height:80px; margin-top:10px; display:none; border-radius:4px;">
                </div>
            </div>
        </div>
    </div>
</div>`;
    }

    _inject() {
        if (!document.getElementById('vle-styles')) {
            const style = document.createElement('style');
            style.id = 'vle-styles';
            style.textContent = this._styles();
            document.head.appendChild(style);
        }
        const host = document.createElement('div');
        host.className = 'vle-host-wrap';
        host.innerHTML = this._shellHTML();
        this.innerHTML = '';
        this.appendChild(host);
    }

    _wire() {
        this.querySelector('#newListingBtn').addEventListener('click', () => this._openEditor(null));
        this.querySelector('#backBtn').addEventListener('click', () => this._showListView());
        this.querySelector('#saveDraftBtn').addEventListener('click', () => this._save('draft'));
        this.querySelector('#publishBtn').addEventListener('click', () => this._save('active'));

        this.querySelectorAll('.vle-tab').forEach(t =>
            t.addEventListener('click', () => this._switchTab(t.dataset.tab)));

        const si = this.querySelector('#searchInput');
        let st;
        si.addEventListener('input', () => { clearTimeout(st); st = setTimeout(() => { this._searchQ = si.value; this._renderGrid(); }, 280); });
        this.querySelector('#filterType').addEventListener('change', e => { this._filterType = e.target.value; this._renderGrid(); });
        this.querySelector('#filterListing').addEventListener('change', e => { this._filterListingType = e.target.value || 'all'; this._renderGrid(); });
        this.querySelector('#sortBy').addEventListener('change', e => {
            const [f, d] = e.target.value.split('-');
            this._sortField = f; this._sortDir = d;
            this._renderGrid();
        });

        this.querySelectorAll('.vle-stat-pill').forEach(p =>
            p.addEventListener('click', () => {
                this.querySelectorAll('.vle-stat-pill').forEach(x => x.classList.remove('active'));
                p.classList.add('active');
                this._filterStatus = p.dataset.status;
                this._renderGrid();
            }));

        this.querySelector('#bulkToggleBtn').addEventListener('click', () => {
            this._bulkMode = !this._bulkMode;
            this._bulkSelected = [];
            this._renderGrid();
            this.querySelector('#bulkToggleBtn').textContent = this._bulkMode ? '✕ Exit Bulk' : '⊞ Bulk';
        });

        this.querySelector('#clearCompareBtn').addEventListener('click', () => {
            this._compareIds = [];
            this._updateCompareBar();
            this._renderGrid();
        });
        this.querySelector('#openCompareBtn').addEventListener('click', () => this._showCompareModal());

        this.querySelectorAll('.vle-type-btn').forEach(btn =>
            btn.addEventListener('click', () => {
                this.querySelectorAll('.vle-type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._data.vehicleType = btn.dataset.vtype;
                this._toggleVehicleFields();
                this._autoTitle();
            }));

        this.querySelectorAll('.vle-ltype-btn').forEach(btn =>
            btn.addEventListener('click', () => {
                this.querySelectorAll('.vle-ltype-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this._data.listingType = btn.dataset.ltype;
                this._toggleListingTypeFields();
            }));

        this.querySelectorAll('[data-d]').forEach(el => {
            const evt = el.type === 'checkbox' ? 'change' : 'input';
            el.addEventListener(evt, () => {
                const k = el.dataset.d;
                if (el.type === 'checkbox') this._data[k] = el.checked;
                else if (el.type === 'number') this._data[k] = el.value !== '' ? Number(el.value) : '';
                else this._data[k] = el.value;
                if (['make','model','trim','year'].includes(k)) this._autoTitle();
                if (['price','downPayment','loanTermMonths','interestRate'].includes(k)) this._calcFinance();
            });
        });

        const titleInp = this.querySelector('#titleInp');
        titleInp.addEventListener('input', () => {
            this._data.title = titleInp.value;
            this._autoTitleActive = false;
            this._autoSlug(titleInp.value);
        });

        this.querySelector('#seoTitleInp')?.addEventListener('input', e => {
            this.querySelector('#seoTitleCount').textContent = `${e.target.value.length} / 60 characters`;
            this.querySelector('#seoTitleCount').style.color = e.target.value.length > 60 ? 'var(--red)' : 'var(--ink3)';
        });
        this.querySelector('#seoDescInp')?.addEventListener('input', e => {
            this.querySelector('#seoDescCount').textContent = `${e.target.value.length} / 160 characters`;
            this.querySelector('#seoDescCount').style.color = e.target.value.length > 160 ? 'var(--red)' : 'var(--ink3)';
        });

        const galleryZone = this.querySelector('#galleryUploadZone');
        const galleryInput = this.querySelector('#galleryFileInput');
        galleryZone.addEventListener('click', () => galleryInput.click());
        galleryInput.addEventListener('change', e => this._handleGalleryUpload(e.target.files));
        galleryZone.addEventListener('dragover', e => { e.preventDefault(); galleryZone.style.borderColor = 'var(--accent)'; });
        galleryZone.addEventListener('dragleave', () => { galleryZone.style.borderColor = ''; });
        galleryZone.addEventListener('drop', e => { e.preventDefault(); galleryZone.style.borderColor = ''; this._handleGalleryUpload(e.dataTransfer.files); });

        this._wireSimpleUpload('dealerLogoZone', 'dealerLogoFile', 'dealerLogoPrev', 'dealerLogo', 'dealerLogoProgress', 'dealerLogoProgressFill', 'dealerLogoProgressLabel');
        this._wireSimpleUpload('ogZone', 'ogFile', 'ogPrev', 'ogImage', 'ogProgress', 'ogProgressFill', 'ogProgressLabel');

        this.querySelectorAll('[data-group]').forEach(cb =>
            cb.addEventListener('change', () => this._compileFeatures()));

        // Related search filter
        const relSearchInp = this.querySelector('#relatedSearchInp');
        let relSearchTimer;
        relSearchInp.addEventListener('input', () => {
            clearTimeout(relSearchTimer);
            relSearchTimer = setTimeout(() => this._renderRelatedList(), 250);
        });
    }

    _wireSimpleUpload(zoneId, fileId, prevId, metaKey, progId, fillId, labelId) {
        const zone = this.querySelector(`#${zoneId}`);
        const file = this.querySelector(`#${fileId}`);
        if (!zone || !file) return;
        zone.addEventListener('click', () => file.click());
        file.addEventListener('change', async e => {
            const f = e.target.files[0]; if (!f) return;
            const prev = this.querySelector(`#${prevId}`);
            if (prev) { prev.src = URL.createObjectURL(f); prev.style.display = 'block'; }
            const prog = this.querySelector(`#${progId}`);
            const fill = this.querySelector(`#${fillId}`);
            const label = this.querySelector(`#${labelId}`);
            if (prog) prog.classList.add('active');
            if (label) label.textContent = 'Converting to WebP…';
            if (fill) fill.style.width = '30%';
            const webpData = await this._toWebP(f);
            const filename = f.name.replace(/\.[^.]+$/, '.webp');
            if (fill) fill.style.width = '60%';
            if (label) label.textContent = 'Uploading…';
            this._pendingMetaProgress[metaKey] = { prog, fill, label };
            this._emit('upload-meta-image', { fileData: webpData, filename, metaKey });
        });
    }

    async _handleGalleryUpload(files) {
        const arr = Array.from(files);
        if (!arr.length) return;
        const prog = this.querySelector('#galleryProgress');
        const fill = this.querySelector('#galleryProgressFill');
        const label = this.querySelector('#galleryProgressLabel');
        if (prog) prog.classList.add('active');

        for (let i = 0; i < arr.length; i++) {
            const f = arr[i];
            if (label) label.textContent = `Processing ${i+1} of ${arr.length}…`;
            if (fill) fill.style.width = `${((i / arr.length) * 60) + 10}%`;
            const webpData = await this._toWebP(f);
            const filename = f.name.replace(/\.[^.]+$/, '.webp');
            const blockId = 'gallery-' + Date.now() + '-' + i;
            const grid = this.querySelector('#galleryGrid');
            const placeholder = document.createElement('div');
            placeholder.className = 'vle-gallery-item';
            placeholder.id = `gcard-${blockId}`;
            placeholder.innerHTML = `<div class="vle-gallery-loading"><svg class="vle-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity=".2"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg></div>`;
            grid.appendChild(placeholder);
            this._emit('upload-gallery-image', { blockId, fileData: webpData, filename });
            await this._sleep(150);
        }

        if (fill) fill.style.width = '80%';
        if (label) label.textContent = 'Finalizing…';
    }

    _renderGalleryGrid() {
        const grid = this.querySelector('#galleryGrid');
        if (!grid) return;
        grid.innerHTML = this._galleryImages.map((img, idx) => `
            <div class="vle-gallery-item ${img.isPrimary ? 'primary' : ''}" data-idx="${idx}">
                <img src="${img.url}" alt="${img.alt || ''}">
                ${img.isPrimary ? '<div class="vle-gallery-item-badge">Primary</div>' : ''}
                <div class="vle-gallery-item-overlay">
                    <button class="vle-btn vle-btn-primary vle-btn-xs set-primary-btn" data-idx="${idx}">★ Primary</button>
                    <button class="vle-btn vle-btn-red vle-btn-xs remove-img-btn" data-idx="${idx}">✕</button>
                </div>
            </div>
        `).join('');

        grid.querySelectorAll('.set-primary-btn').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                this._galleryImages.forEach((img, i) => img.isPrimary = (i === idx));
                this._data.primaryImage = this._galleryImages[idx].url;
                this._renderGalleryGrid();
            }));
        grid.querySelectorAll('.remove-img-btn').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const idx = parseInt(btn.dataset.idx);
                this._galleryImages.splice(idx, 1);
                this._data.gallery = this._galleryImages;
                this._renderGalleryGrid();
            }));
    }

    /* ── RELATED LISTINGS ── */
    _renderRelatedList() {
        const container = this.querySelector('#relatedList');
        const countEl = this.querySelector('#relatedCount');
        const q = (this.querySelector('#relatedSearchInp')?.value || '').toLowerCase();

        // Exclude current listing being edited
        const currentId = this._editItem?._id;
        let available = this._listings.filter(l => l._id !== currentId);

        if (q) {
            available = available.filter(l =>
                (l.title||'').toLowerCase().includes(q) ||
                (l.make||'').toLowerCase().includes(q) ||
                (l.model||'').toLowerCase().includes(q) ||
                (l.year||'').toString().includes(q)
            );
        }

        if (!available.length) {
            container.innerHTML = `<div class="vle-state-box" style="padding:30px;"><p style="font-size:13px;">No listings found.</p></div>`;
            countEl.textContent = `${this._data.relatedListings.length} listing(s) selected`;
            return;
        }

        container.innerHTML = available.map(l => {
            const isSelected = this._data.relatedListings.includes(l._id);
            const img = l.primaryImage
                ? `<img class="vle-related-thumb" src="${l.primaryImage}" alt="">`
                : `<div class="vle-related-thumb" style="display:flex;align-items:center;justify-content:center;">${this._icon('car')}</div>`;
            return `
            <div class="vle-related-item ${isSelected ? 'selected' : ''}" data-rid="${l._id}">
                <div class="vle-related-check">${isSelected ? '✓' : ''}</div>
                ${img}
                <div class="vle-related-info">
                    <div class="vle-related-title">${l.title || `${l.year||''} ${l.make||''} ${l.model||''}`.trim() || 'Untitled'}</div>
                    <div class="vle-related-meta">${[l.year, l.make, l.model, l.price ? '$'+Number(l.price).toLocaleString() : ''].filter(Boolean).join(' · ')}</div>
                </div>
            </div>`;
        }).join('');

        container.querySelectorAll('.vle-related-item').forEach(item => {
            item.addEventListener('click', () => {
                const rid = item.dataset.rid;
                if (this._data.relatedListings.includes(rid)) {
                    this._data.relatedListings = this._data.relatedListings.filter(id => id !== rid);
                } else {
                    this._data.relatedListings = [...this._data.relatedListings, rid];
                }
                this._renderRelatedList();
            });
        });

        countEl.textContent = `${this._data.relatedListings.length} listing(s) selected`;
    }

    _showCompareModal() {
        const items = this._listings.filter(l => this._compareIds.includes(l._id));
        if (items.length < 2) { this._toast('info', 'Select at least 2 listings to compare'); return; }

        const fields = [
            ['Year','year'],['Make','make'],['Model','model'],['Trim','trim'],
            ['Price','price'],['Mileage','mileage'],['Condition','condition'],
            ['Fuel Type','fuelType'],['Transmission','transmission'],['Drivetrain','drivetrain'],
            ['Engine','engine'],['Horsepower','horsepower'],['Torque','torque'],
            ['City MPG','mpgCity'],['Hwy MPG','mpgHighway'],
            ['Doors','doors'],['Seating','seatingCapacity'],
            ['Exterior Color','exteriorColor'],['Interior Color','interiorColor'],
            ['VIN','vin'],['Owners','owners'],['Warranty','warrantyType'],
        ];

        const thCells = items.map(l => `<th>${l.year||''} ${l.make||''} ${l.model||''}</th>`).join('');
        const rows = fields.map(([label, key]) => {
            const cells = items.map(l => `<td>${l[key] || '—'}</td>`).join('');
            return `<tr><td>${label}</td>${cells}</tr>`;
        }).join('');

        const wrap = this.querySelector('#compareModalWrap');
        wrap.innerHTML = `
            <div class="vle-modal-overlay">
                <div class="vle-modal">
                    <div class="vle-modal-head">
                        <h2>${this._icon('compare')} Vehicle Comparison</h2>
                        <button class="vle-btn vle-btn-light vle-btn-sm" id="closeCompareModal">${this._icon('x')} Close</button>
                    </div>
                    <div style="padding:20px; overflow-x:auto;">
                        <table class="vle-compare-table">
                            <thead><tr><th>Specification</th>${thCells}</tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                    </div>
                </div>
            </div>`;
        wrap.querySelector('#closeCompareModal').addEventListener('click', () => { wrap.innerHTML = ''; });
        wrap.querySelector('.vle-modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) wrap.innerHTML = ''; });
    }

    _updateCompareBar() {
        const bar = this.querySelector('#compareBar');
        const slots = this.querySelector('#compareSlots');
        const openBtn = this.querySelector('#openCompareBtn');
        if (this._compareIds.length === 0) { bar.classList.remove('active'); return; }
        bar.classList.add('active');
        slots.innerHTML = this._compareIds.map(id => {
            const l = this._listings.find(x => x._id === id);
            return `<div class="vle-compare-slot">${l ? `${l.year||''} ${l.make||''} ${l.model||''}`.trim() : id}<button data-cid="${id}">✕</button></div>`;
        }).join('');
        slots.querySelectorAll('button').forEach(btn =>
            btn.addEventListener('click', () => {
                this._compareIds = this._compareIds.filter(id => id !== btn.dataset.cid);
                this._updateCompareBar();
                this._renderGrid();
            }));
        openBtn.disabled = this._compareIds.length < 2;
    }

    _onListingList(data) {
        this.querySelector('#listLoading').style.display = 'none';
        const grid = this.querySelector('#listGrid');
        grid.style.display = 'grid';
        this._listings = data.listings || [];
        this._updateStatCounts();
        this._renderGrid();
    }

    _updateStatCounts() {
        const all = this._listings.length;
        const active = this._listings.filter(l => l.status === 'active').length;
        const draft = this._listings.filter(l => l.status === 'draft').length;
        const sold = this._listings.filter(l => l.status === 'sold').length;
        const rented = this._listings.filter(l => l.status === 'rented').length;
        const expired = this._listings.filter(l => l.status === 'expired').length;
        const s = (id, val) => { const el = this.querySelector(`#${id}`); if (el) el.textContent = val; };
        s('statTotal', all); s('statActive', active); s('statSold', sold);
        s('cntAll', all); s('cntActive', active); s('cntDraft', draft);
        s('cntSold', sold); s('cntRented', rented); s('cntExpired', expired);
    }

    _renderGrid() {
        let items = [...this._listings];
        if (this._filterStatus !== 'all') items = items.filter(l => l.status === this._filterStatus);
        if (this._filterType !== 'all') items = items.filter(l => l.vehicleType === this._filterType);
        if (this._filterListingType && this._filterListingType !== 'all') items = items.filter(l => l.listingType === this._filterListingType);
        if (this._searchQ.trim()) {
            const q = this._searchQ.toLowerCase();
            items = items.filter(l =>
                (l.title||'').toLowerCase().includes(q) ||
                (l.make||'').toLowerCase().includes(q) ||
                (l.model||'').toLowerCase().includes(q) ||
                (l.vin||'').toLowerCase().includes(q) ||
                (l.year||'').toString().includes(q) ||
                (l.stockNumber||'').toLowerCase().includes(q)
            );
        }
        items.sort((a, b) => {
            if (this._sortField === 'date') return this._sortDir === 'desc' ? (new Date(b._createdDate) - new Date(a._createdDate)) : (new Date(a._createdDate) - new Date(b._createdDate));
            if (this._sortField === 'price') return this._sortDir === 'desc' ? ((b.price||0) - (a.price||0)) : ((a.price||0) - (b.price||0));
            if (this._sortField === 'year') return (b.year||0) - (a.year||0);
            return 0;
        });

        const grid = this.querySelector('#listGrid');
        if (!items.length) {
            grid.innerHTML = `<div class="vle-state-box" style="grid-column:1/-1">${this._icon('car')}<p>No listings found.</p></div>`;
            return;
        }

        grid.innerHTML = items.map(l => this._cardHTML(l)).join('');

        grid.querySelectorAll('.vle-card-edit').forEach(btn =>
            btn.addEventListener('click', e => { e.stopPropagation(); const l = this._listings.find(x => x._id === btn.dataset.id); if (l) this._openEditor(l); }));
        grid.querySelectorAll('.vle-card-delete').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const l = this._listings.find(x => x._id === btn.dataset.id);
                if (!l || !confirm(`Delete "${l.title || 'this listing'}"?\n\nThis cannot be undone.`)) return;
                this._emit('delete-listing', { id: l._id });
            }));
        grid.querySelectorAll('.vle-card-compare').forEach(btn =>
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const id = btn.dataset.id;
                if (this._compareIds.includes(id)) {
                    this._compareIds = this._compareIds.filter(x => x !== id);
                } else {
                    if (this._compareIds.length >= 4) { this._toast('info', 'Maximum 4 listings can be compared'); return; }
                    this._compareIds.push(id);
                }
                this._updateCompareBar();
                this._renderGrid();
            }));
        grid.querySelectorAll('.vle-card').forEach(card => {
            if (!this._bulkMode) return;
            card.addEventListener('click', () => {
                const id = card.dataset.id;
                if (this._bulkSelected.includes(id)) this._bulkSelected = this._bulkSelected.filter(x => x !== id);
                else this._bulkSelected.push(id);
                card.classList.toggle('selected', this._bulkSelected.includes(id));
            });
        });
    }

    _cardHTML(l) {
        const price = l.salePrice ? l.salePrice : l.price;
        const priceStr = price ? `$${Number(price).toLocaleString()}` : 'Call for Price';
        const origStr = (l.salePrice && l.price) ? `$${Number(l.price).toLocaleString()}` : '';
        const isComparing = this._compareIds.includes(l._id);
        const imgHtml = l.primaryImage
            ? `<img class="vle-card-img" src="${l.primaryImage}" alt="${l.title||''}" loading="lazy">`
            : `<div class="vle-card-img-placeholder">${this._icon(l.vehicleType||'car')}</div>`;
        const badges = [
            l.status ? `<span class="vle-badge vle-badge-${l.status}">${l.status}</span>` : '',
            l.listingType ? `<span class="vle-badge vle-badge-${l.listingType}">${l.listingType==='new'?'New':l.listingType==='used'?'Used':l.listingType==='rent'?'Rent':'Auction'}</span>` : '',
            l.featured ? `<span class="vle-badge vle-badge-featured">${this._icon('star')} Featured</span>` : '',
            l.certifiedPreOwned ? `<span class="vle-badge vle-badge-active">CPO</span>` : '',
        ].filter(Boolean).join('');

        return `
<div class="vle-card" data-id="${l._id}">
    <div style="position:relative;">
        ${imgHtml}
        <div class="vle-card-badge-row">${badges}</div>
        <div class="vle-card-actions">
            <div class="vle-card-action-btn vle-card-compare ${isComparing?'compare-active':''}" data-id="${l._id}">${this._icon('compare')}</div>
            <div class="vle-card-action-btn vle-card-edit" data-id="${l._id}">${this._icon('edit')}</div>
            <div class="vle-card-action-btn danger vle-card-delete" data-id="${l._id}">${this._icon('trash')}</div>
        </div>
    </div>
    <div class="vle-card-body">
        <div class="vle-card-title">${l.title || `${l.year||''} ${l.make||''} ${l.model||''}`.trim() || 'Untitled'}</div>
        <div class="vle-card-sub">${[l.trim, l.exteriorColor, l.bodyStyle].filter(Boolean).join(' · ') || l.slug || ''}</div>
        <div class="vle-card-price">${priceStr}${origStr ? `<span>${origStr}</span>` : ''}</div>
        <div class="vle-card-meta">
            ${l.mileage ? `<span class="vle-card-meta-item">${this._icon('history')} ${Number(l.mileage).toLocaleString()} mi</span>` : ''}
            ${l.fuelType ? `<span class="vle-card-meta-item">${l.fuelType}</span>` : ''}
            ${l.transmission ? `<span class="vle-card-meta-item">${l.transmission}</span>` : ''}
            ${l.dealerCity ? `<span class="vle-card-meta-item">${this._icon('location')} ${l.dealerCity}${l.dealerState?', '+l.dealerState:''}</span>` : ''}
        </div>
    </div>
</div>`;
    }

    _openEditor(listing) {
        this._editItem = listing;
        this._data = this._freshData();
        this._galleryImages = [];
        this._resetEditorUI();
        if (listing) this._populateEditor(listing);
        this._showEditorView();
        this._switchTab('basic');
        this._toggleVehicleFields();
        this._toggleListingTypeFields();
        this._calcFinance();
        // Render related list after listings are available
        this._renderRelatedList();
    }

    _showListView() {
        this.querySelector('#listView').classList.remove('hidden');
        this.querySelector('#editorView').classList.add('hidden');
        this._emit('load-listing-list', {});
    }

    _showEditorView() {
        this.querySelector('#listView').classList.add('hidden');
        this.querySelector('#editorView').classList.remove('hidden');
        const t = this._editItem;
        this.querySelector('#editorTitle').textContent = t ? `Editing: ${t.title || t.make + ' ' + t.model}` : 'New Listing';
        this.querySelector('#publishBtn').textContent = t ? '✓ Update' : '✓ Publish';
    }

    _resetEditorUI() {
        this.querySelectorAll('[data-d]').forEach(el => {
            if (el.type === 'checkbox') el.checked = false;
            else el.value = '';
        });
        this._galleryImages = [];
        this._renderGalleryGrid();
        ['dealerLogoPrev','ogPrev'].forEach(id => {
            const el = this.querySelector(`#${id}`);
            if (el) { el.src = ''; el.style.display = 'none'; }
        });
        this.querySelector('#calcResult').style.display = 'none';
        this.querySelectorAll('[data-group]').forEach(cb => cb.checked = false);
        this._data.relatedListings = [];
    }

    _populateEditor(l) {
        Object.keys(this._data).forEach(k => { if (l[k] !== undefined) this._data[k] = l[k]; });

        // Populate relatedListings from multi-reference field
        if (Array.isArray(l.relatedListings)) {
            this._data.relatedListings = l.relatedListings.map(r => typeof r === 'object' ? r._id : r).filter(Boolean);
        } else {
            this._data.relatedListings = [];
        }

        this.querySelectorAll('[data-d]').forEach(el => {
            const k = el.dataset.d;
            if (!(k in this._data)) return;
            if (el.type === 'checkbox') el.checked = !!this._data[k];
            else el.value = this._data[k] || '';
        });

        this.querySelectorAll('.vle-type-btn').forEach(b => b.classList.toggle('active', b.dataset.vtype === this._data.vehicleType));
        this.querySelectorAll('.vle-ltype-btn').forEach(b => b.classList.toggle('active', b.dataset.ltype === this._data.listingType));

        if (Array.isArray(l.gallery)) { this._galleryImages = l.gallery; this._renderGalleryGrid(); }

        if (l.dealerLogo) { const el = this.querySelector('#dealerLogoPrev'); if (el) { el.src = l.dealerLogo; el.style.display = 'block'; } }
        if (l.ogImage) { const el = this.querySelector('#ogPrev'); if (el) { el.src = l.ogImage; el.style.display = 'block'; } }

        const allFeatures = [l.safetyFeatures, l.techFeatures, l.exteriorFeatures, l.interiorFeatures, l.features].join(',');
        this.querySelectorAll('[data-group]').forEach(cb => {
            cb.checked = allFeatures.toLowerCase().includes(cb.dataset.feature.toLowerCase());
        });

        if (l.seoTitle) this.querySelector('#seoTitleCount').textContent = `${l.seoTitle.length} / 60 characters`;
        if (l.seoDescription) this.querySelector('#seoDescCount').textContent = `${l.seoDescription.length} / 160 characters`;
    }

    _switchTab(tab) {
        this._tab = tab;
        this.querySelectorAll('.vle-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        this.querySelectorAll('.vle-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
        if (tab === 'related') this._renderRelatedList();
    }

    _toggleVehicleFields() {
        const type = this._data.vehicleType;
        const boat = this.querySelector('#specBoatSection');
        if (boat) boat.style.display = type === 'boat' ? 'block' : 'none';
    }

    _toggleListingTypeFields() {
        const type = this._data.listingType;
        const rental = this.querySelector('#rentalPricingSection');
        const auction = this.querySelector('#auctionPricingSection');
        if (rental) rental.style.display = type === 'rent' ? 'block' : 'none';
        if (auction) auction.style.display = type === 'auction' ? 'block' : 'none';
    }

    _autoTitle() {
        const d = this._data;
        const generated = [d.year, d.make, d.model, d.trim].filter(Boolean).join(' ');
        if (generated) {
            const titleEl = this.querySelector('#titleInp');
            if (titleEl && (!titleEl.value || this._autoTitleActive)) {
                titleEl.value = generated;
                this._data.title = generated;
                this._autoTitleActive = true;
                this._autoSlug(generated);
            }
        }
    }

    _autoSlug(title) {
        const base = title.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'');
        const existing = this._listings.filter(l => l._id !== this._editItem?._id).map(l => l.slug);
        let slug = base; let c = 1;
        while (existing.includes(slug)) { slug = `${base}-${c}`; c++; }
        const el = this.querySelector('#slugInp');
        if (el) { el.value = slug; this._data.slug = slug; }
    }

    _calcFinance() {
        const price = parseFloat(this._data.price) || 0;
        const down = parseFloat(this._data.downPayment) || 0;
        const rate = parseFloat(this._data.interestRate) || 0;
        const term = parseInt(this._data.loanTermMonths) || 60;
        const result = this.querySelector('#calcResult');
        if (!price || !rate || !result) { if (result) result.style.display = 'none'; return; }
        const loan = price - down;
        const monthly = rate > 0 ? (loan * (rate/1200)) / (1 - Math.pow(1 + rate/1200, -term)) : loan / term;
        const total = monthly * term;
        const interest = total - loan;
        result.style.display = 'block';
        this.querySelector('#calcMonthly').textContent = `$${monthly.toFixed(2)}/mo`;
        this.querySelector('#calcTotal').textContent = `$${total.toLocaleString(undefined, {maximumFractionDigits:0})}`;
        this.querySelector('#calcInterestTotal').textContent = `$${interest.toLocaleString(undefined, {maximumFractionDigits:0})}`;
        this.querySelector('#calcLoanAmt').textContent = `$${loan.toLocaleString(undefined, {maximumFractionDigits:0})}`;
        this._data.monthlyPayment = monthly.toFixed(2);
    }

    _compileFeatures() {
        const byGroup = { safety: [], tech: [], exterior: [], interior: [] };
        this.querySelectorAll('[data-group]:checked').forEach(cb => {
            const g = cb.dataset.group;
            if (byGroup[g]) byGroup[g].push(cb.dataset.feature);
        });
        const safetyInp = this.querySelector('[data-d="safetyFeatures"]');
        const techInp = this.querySelector('[data-d="techFeatures"]');
        const extInp = this.querySelector('[data-d="exteriorFeatures"]');
        const intInp = this.querySelector('[data-d="interiorFeatures"]');
        if (safetyInp) { safetyInp.value = byGroup.safety.join(', '); this._data.safetyFeatures = safetyInp.value; }
        if (techInp) { techInp.value = byGroup.tech.join(', '); this._data.techFeatures = techInp.value; }
        if (extInp) { extInp.value = byGroup.exterior.join(', '); this._data.exteriorFeatures = extInp.value; }
        if (intInp) { intInp.value = byGroup.interior.join(', '); this._data.interiorFeatures = intInp.value; }
        const all = [...byGroup.safety, ...byGroup.tech, ...byGroup.exterior, ...byGroup.interior];
        const featuresEl = this.querySelector('[data-d="features"]');
        if (featuresEl) { featuresEl.value = all.join(', '); this._data.features = featuresEl.value; }
    }

    _save(status) {
        const action = status === 'active' ? (this._editItem ? 'Updating' : 'Publishing') : 'Saving draft';
        this._showProgress(`${action}…`, 'Preparing listing data…');
        this._setProgress(25);
        setTimeout(() => { this._setProgress(55); this._setProgressSub('Saving to database…'); }, 300);
        const payload = {
            ...this._data,
            status,
            gallery: this._galleryImages,
            relatedListings: this._data.relatedListings,
            _id: this._editItem?._id || null,
        };
        this._emit('save-listing', payload);
    }

    _onSaveResult(data) {
        if (data.success) {
            this._setProgress(100);
            this._setProgressSub('Done!');
            setTimeout(() => {
                this._hideProgress();
                this._toast('success', data.message || 'Listing saved!');
                // Fix: refresh listing list so new listings appear immediately
                this._emit('load-listing-list', {});
            }, 500);
            if (!this._editItem && data.id) this._editItem = { _id: data.id };
            else if (this._editItem && data.id) this._editItem._id = data.id;
        } else {
            this._hideProgress();
            this._toast('error', data.message || 'Save failed.');
        }
    }

    _onDeleteResult(data) {
        if (data.success) { this._toast('success', 'Listing deleted.'); this._emit('load-listing-list', {}); }
        else this._toast('error', 'Delete failed: ' + (data.message || ''));
    }

    _onUploadResult(data) {
        const url = data.url;
        if (data.blockId && data.blockId.startsWith('gallery-')) {
            this._galleryImages.push({ url, alt: this._data.title || '', isPrimary: this._galleryImages.length === 0 });
            if (this._galleryImages.length === 1) this._data.primaryImage = url;
            this._data.gallery = this._galleryImages;
            const placeholder = this.querySelector(`#gcard-${data.blockId}`);
            if (placeholder) placeholder.remove();
            this._renderGalleryGrid();
            const prog = this.querySelector('#galleryProgress');
            const fill = this.querySelector('#galleryProgressFill');
            const label = this.querySelector('#galleryProgressLabel');
            if (fill) fill.style.width = '100%';
            if (label) label.textContent = 'All photos uploaded!';
            setTimeout(() => { if (prog) prog.classList.remove('active'); }, 2000);
        }
        if (data.metaKey && this._pendingMetaProgress[data.metaKey]) {
            const { prog, fill, label } = this._pendingMetaProgress[data.metaKey];
            this._data[data.metaKey] = url;
            if (fill) fill.style.width = '100%';
            if (label) label.textContent = 'Uploaded!';
            setTimeout(() => { if (prog) prog.classList.remove('active'); delete this._pendingMetaProgress[data.metaKey]; }, 1500);
        }
    }

    _onBulkResult(data) {
        this._toast(data.success ? 'success' : 'error', data.message);
        if (data.success) { this._bulkSelected = []; this._emit('load-listing-list', {}); }
    }

    _onMakesList(data) {
        const dl = this.querySelector('#makesList');
        if (!dl) return;
        this._makes = data.makes || [];
        dl.innerHTML = this._makes.map(m => `<option value="${m}"></option>`).join('');
    }

    _onModelsList(data) { this._models = data.models || []; }

    _showProgress(title, sub) {
        this.querySelector('#overlayTitle').textContent = title;
        this.querySelector('#overlaySub').textContent = sub;
        this.querySelector('#overlayFill').style.width = '0%';
        this.querySelector('#overlayPct').textContent = '0%';
        this.querySelector('#progressOverlay').classList.add('active');
    }
    _setProgress(p) {
        this.querySelector('#overlayFill').style.width = `${p}%`;
        this.querySelector('#overlayPct').textContent = `${Math.round(p)}%`;
    }
    _setProgressSub(t) { this.querySelector('#overlaySub').textContent = t; }
    _hideProgress() { this.querySelector('#progressOverlay').classList.remove('active'); }

    _toast(type, msg) {
        const area = this.querySelector('#toastArea');
        if (!area) return;
        const t = document.createElement('div');
        t.className = `vle-toast vle-toast-${type}`;
        t.textContent = msg;
        area.appendChild(t);
        setTimeout(() => t.remove(), 5000);
    }

    async _toWebP(file) {
        return new Promise((res, rej) => {
            const reader = new FileReader();
            reader.onload = e => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width; canvas.height = img.height;
                    canvas.getContext('2d').drawImage(img, 0, 0);
                    canvas.toBlob(blob => {
                        const r2 = new FileReader();
                        r2.onloadend = () => res(r2.result.split(',')[1]);
                        r2.readAsDataURL(blob);
                    }, 'image/webp', 0.92);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

    _emit(name, detail) {
        this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
    }
}

customElements.define('vehicle-listing-editor', VehicleListingEditor);
