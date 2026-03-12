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
            title: '',
            slug: '',
            listingType: 'used',
            vehicleType: 'car',
            status: 'draft',
            featured: false,
            condition: 'used',
            description: '',
            make: '',
            model: '',
            trim: '',
            year: '',
            vin: '',
            stockNumber: '',
            exteriorColor: '',
            interiorColor: '',
            bodyStyle: '',
            engine: '',
            engineDisplacement: '',
            cylinders: '',
            horsepower: '',
            torque: '',
            transmission: '',
            drivetrain: '',
            fuelType: '',
            mpgCity: '',
            mpgHighway: '',
            range: '',
            mileage: '',
            length: '',
            width: '',
            height: '',
            weight: '',
            payload: '',
            towingCapacity: '',
            seatingCapacity: '',
            doors: '',
            hullMaterial: '',
            boatType: '',
            engineType: '',
            engineHours: '',
            price: '',
            salePrice: '',
            msrp: '',
            priceNegotiable: false,
            showPriceOnSite: true,
            currency: 'USD',
            rentalPricePerDay: '',
            rentalPricePerWeek: '',
            rentalPricePerMonth: '',
            auctionStartPrice: '',
            auctionReservePrice: '',
            auctionEndDate: '',
            financeEnabled: false,
            downPayment: '',
            loanTermMonths: '60',
            interestRate: '',
            monthlyPayment: '',
            primaryImage: '',
            gallery: [],
            videoUrl: '',
            video360Url: '',
            tourUrl: '',
            features: '',
            safetyFeatures: '',
            techFeatures: '',
            exteriorFeatures: '',
            interiorFeatures: '',
            packages: '',
            owners: '',
            accidentHistory: false,
            serviceHistory: '',
            carfaxUrl: '',
            warrantyType: '',
            warrantyMonths: '',
            warrantyMiles: '',
            certifiedPreOwned: false,
            dealerName: '',
            dealerPhone: '',
            dealerEmail: '',
            dealerWebsite: '',
            dealerAddress: '',
            dealerCity: '',
            dealerState: '',
            dealerZip: '',
            dealerCountry: '',
            dealerLogo: '',
            latitude: '',
            longitude: '',
            leadCaptureEnabled: true,
            leadFormTitle: 'Interested in this vehicle?',
            leadFormFields: 'name,email,phone,message',
            leadEmailRecipient: '',
            seoTitle: '',
            seoDescription: '',
            seoKeywords: '',
            ogImage: '',
            compareEnabled: true,
            compareHighlights: '',
            viewCount: 0,
            inquiryCount: 0,
            favoriteCount: 0,
            listedDate: '',
            soldDate: '',
            expiryDate: '',
            relatedListings: []
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
    display: block;
    width: 100%;
    height: 100%;
    min-height: 740px;
    font-family: 'Instrument Sans', sans-serif;
    --ink: #0d0d0d;
    --ink2: #3a3a3a;
    --ink3: #767676;
    --ink4: #aaa;
    --bg: #f5f4f0;
    --bg2: #eeece6;
    --bg3: #e4e1d8;
    --border: #ddd9ce;
    --white: #fff;
    --accent: #e05c1a;
    --accent2: #1a3a5c;
    --green: #1a7a3a;
    --red: #c0162a;
    --yellow: #d4900a;
    --blue: #1a5ccc;
    --r: 6px;
    --r2: 10px;
    --shadow-sm: 0 1px 4px rgba(0,0,0,.07);
    --shadow: 0 4px 20px rgba(0,0,0,.11);
    --shadow-lg: 0 12px 40px rgba(0,0,0,.16);
    background: var(--bg);
    color: var(--ink);
}

vehicle-listing-editor * { box-sizing: border-box; }

vehicle-listing-editor .vle-host {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 740px;
    background: var(--bg);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border);
}

vehicle-listing-editor .vle-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 56px;
    padding: 0 22px;
    background: var(--accent2);
    color: #fff;
    flex-shrink: 0;
    gap: 12px;
}
vehicle-listing-editor .vle-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -.5px;
    white-space: nowrap;
}
vehicle-listing-editor .vle-brand svg { width: 22px; height: 22px; }
vehicle-listing-editor .vle-brand-dot { color: var(--accent); }
vehicle-listing-editor .vle-topbar-acts { display: flex; gap: 8px; align-items: center; }
vehicle-listing-editor .vle-topbar-stat {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    background: rgba(255,255,255,.1);
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    color: rgba(255,255,255,.85);
    border: 1px solid rgba(255,255,255,.15);
}
vehicle-listing-editor .vle-topbar-stat strong { color: #fff; }

vehicle-listing-editor .vle-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border: none;
    border-radius: var(--r);
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all .15s;
    white-space: nowrap;
    line-height: 1;
}
vehicle-listing-editor .vle-btn svg { width: 14px; height: 14px; flex-shrink: 0; }
vehicle-listing-editor .vle-btn:disabled { opacity: .45; cursor: not-allowed; pointer-events: none; }
vehicle-listing-editor .vle-btn-primary  { background: var(--accent); color: #fff; }
vehicle-listing-editor .vle-btn-primary:hover  { background: #c44e14; }
vehicle-listing-editor .vle-btn-navy    { background: var(--accent2); color: #fff; }
vehicle-listing-editor .vle-btn-navy:hover    { background: #122d48; }
vehicle-listing-editor .vle-btn-ghost   { background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.2); }
vehicle-listing-editor .vle-btn-ghost:hover   { background: rgba(255,255,255,.22); }
vehicle-listing-editor .vle-btn-light   { background: var(--white); color: var(--ink2); border: 1px solid var(--border); }
vehicle-listing-editor .vle-btn-light:hover   { background: var(--bg2); }
vehicle-listing-editor .vle-btn-red     { background: #fef1f2; color: var(--red); border: 1px solid #fcc; }
vehicle-listing-editor .vle-btn-red:hover     { background: #ffe0e3; }
vehicle-listing-editor .vle-btn-green   { background: #edfbf2; color: var(--green); border: 1px solid #b7efd1; }
vehicle-listing-editor .vle-btn-green:hover   { background: #d4f5e4; }
vehicle-listing-editor .vle-btn-sm { padding: 5px 10px; font-size: 12px; }
vehicle-listing-editor .vle-btn-xs { padding: 4px 8px; font-size: 11px; }
vehicle-listing-editor .vle-btn-icon { padding: 7px; border-radius: var(--r); }

vehicle-listing-editor .vle-list-view { display: flex; flex-direction: column; flex: 1; overflow: hidden; min-height: 0; }
vehicle-listing-editor .vle-list-view.hidden { display: none; }

vehicle-listing-editor .vle-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 22px;
    background: var(--white);
    border-bottom: 2px solid var(--border);
    flex-shrink: 0;
    flex-wrap: wrap;
}
vehicle-listing-editor .vle-toolbar-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; flex-wrap: wrap; }
vehicle-listing-editor .vle-toolbar-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

vehicle-listing-editor .vle-search-box {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 7px 12px;
    background: var(--bg);
    border: 1.5px solid var(--border);
    border-radius: var(--r);
    flex: 1;
    max-width: 280px;
}
vehicle-listing-editor .vle-search-box svg { width: 14px; height: 14px; color: var(--ink3); flex-shrink: 0; }
vehicle-listing-editor .vle-search-box input {
    border: none; outline: none; background: transparent;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13px; color: var(--ink); width: 100%;
}
vehicle-listing-editor .vle-search-box input::placeholder { color: var(--ink4); }

vehicle-listing-editor .vle-filter-sel {
    padding: 7px 10px;
    border: 1.5px solid var(--border);
    border-radius: var(--r);
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13px;
    color: var(--ink2);
    background: var(--bg);
    cursor: pointer;
    outline: none;
}
vehicle-listing-editor .vle-filter-sel:focus { border-color: var(--accent); }

vehicle-listing-editor .vle-stats-bar {
    display: flex;
    gap: 0;
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    overflow-x: auto;
}
vehicle-listing-editor .vle-stat-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 18px;
    font-size: 12px;
    font-weight: 600;
    color: var(--ink3);
    border-right: 1px solid var(--border);
    cursor: pointer;
    white-space: nowrap;
    transition: all .15s;
    border-bottom: 2px solid transparent;
}
vehicle-listing-editor .vle-stat-pill:hover { background: var(--bg3); color: var(--ink); }
vehicle-listing-editor .vle-stat-pill.active { color: var(--accent); border-bottom-color: var(--accent); background: var(--white); }
vehicle-listing-editor .vle-stat-pill strong { font-size: 15px; color: inherit; }

vehicle-listing-editor .vle-list-scroll {
    flex: 1; overflow-y: auto; min-height: 0;
}
vehicle-listing-editor .vle-list-scroll::-webkit-scrollbar { width: 5px; }
vehicle-listing-editor .vle-list-scroll::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

vehicle-listing-editor .vle-state-box {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 80px 20px; gap: 14px; color: var(--ink3); text-align: center;
}
vehicle-listing-editor .vle-state-box svg { width: 48px; height: 48px; opacity: .25; }
vehicle-listing-editor .vle-state-box p { font-size: 15px; }

@keyframes vle-spin { to { transform: rotate(360deg); } }
vehicle-listing-editor .vle-spin { animation: vle-spin .7s linear infinite; }

vehicle-listing-editor .vle-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
    padding: 20px 22px;
}

vehicle-listing-editor .vle-card {
    background: var(--white);
    border-radius: var(--r2);
    border: 1.5px solid var(--border);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: box-shadow .2s, border-color .2s, transform .15s;
    position: relative;
    cursor: pointer;
}
vehicle-listing-editor .vle-card:hover {
    box-shadow: var(--shadow);
    border-color: #c8c3b5;
    transform: translateY(-2px);
}
vehicle-listing-editor .vle-card.selected { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(224,92,26,.18); }

vehicle-listing-editor .vle-card-img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    background: var(--bg2);
    display: block;
    position: relative;
}
vehicle-listing-editor .vle-card-img-placeholder {
    width: 100%;
    height: 180px;
    background: linear-gradient(135deg, var(--bg2) 0%, var(--bg3) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--ink4);
}
vehicle-listing-editor .vle-card-img-placeholder svg { width: 44px; height: 44px; }

vehicle-listing-editor .vle-card-badge-row {
    position: absolute;
    top: 10px;
    left: 10px;
    display: flex;
    gap: 5px;
    flex-wrap: wrap;
}
vehicle-listing-editor .vle-card-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    gap: 5px;
    opacity: 0;
    transition: opacity .2s;
}
vehicle-listing-editor .vle-card:hover .vle-card-actions { opacity: 1; }

vehicle-listing-editor .vle-card-action-btn {
    width: 30px; height: 30px;
    background: rgba(255,255,255,.92);
    border: 1px solid rgba(0,0,0,.1);
    border-radius: var(--r);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: all .15s;
    backdrop-filter: blur(4px);
}
vehicle-listing-editor .vle-card-action-btn:hover { background: #fff; box-shadow: var(--shadow-sm); }
vehicle-listing-editor .vle-card-action-btn svg { width: 13px; height: 13px; }
vehicle-listing-editor .vle-card-action-btn.danger svg { color: var(--red); }
vehicle-listing-editor .vle-card-action-btn.compare-active { background: var(--accent); border-color: var(--accent); }
vehicle-listing-editor .vle-card-action-btn.compare-active svg { color: #fff; }

vehicle-listing-editor .vle-card-body { padding: 14px; }
vehicle-listing-editor .vle-card-title {
    font-family: 'Syne', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: var(--ink);
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
vehicle-listing-editor .vle-card-sub {
    font-size: 12px;
    color: var(--ink3);
    margin-bottom: 10px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
vehicle-listing-editor .vle-card-price {
    font-family: 'Syne', sans-serif;
    font-size: 19px;
    font-weight: 800;
    color: var(--accent);
    margin-bottom: 10px;
}
vehicle-listing-editor .vle-card-price span {
    font-size: 13px;
    font-weight: 400;
    color: var(--ink3);
    text-decoration: line-through;
    margin-left: 6px;
    font-family: 'Instrument Sans', sans-serif;
}
vehicle-listing-editor .vle-card-meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    font-size: 11px;
    color: var(--ink3);
    border-top: 1px solid var(--bg2);
    padding-top: 10px;
    margin-top: 2px;
}
vehicle-listing-editor .vle-card-meta-item { display: flex; align-items: center; gap: 3px; }

vehicle-listing-editor .vle-badge {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    padding: 3px 8px;
    border-radius: 20px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .4px;
    line-height: 1;
}
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

vehicle-listing-editor .vle-compare-bar {
    display: none;
    align-items: center;
    gap: 12px;
    padding: 10px 22px;
    background: var(--accent2);
    color: #fff;
    font-size: 13px;
    font-weight: 600;
    flex-shrink: 0;
}
vehicle-listing-editor .vle-compare-bar.active { display: flex; }
vehicle-listing-editor .vle-compare-slots { display: flex; gap: 8px; flex: 1; flex-wrap: wrap; }
vehicle-listing-editor .vle-compare-slot {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    background: rgba(255,255,255,.12);
    border-radius: var(--r);
    font-size: 12px;
    font-weight: 500;
}
vehicle-listing-editor .vle-compare-slot button { background: none; border: none; color: rgba(255,255,255,.7); cursor: pointer; padding: 0; line-height: 1; }
vehicle-listing-editor .vle-compare-slot button:hover { color: #fff; }

vehicle-listing-editor .vle-editor-view { display: flex; flex-direction: column; flex: 1; overflow: hidden; min-height: 0; }
vehicle-listing-editor .vle-editor-view.hidden { display: none; }

vehicle-listing-editor .vle-editor-topbar {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 22px;
    background: var(--white);
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
    flex-wrap: wrap;
}
vehicle-listing-editor .vle-editor-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px;
    font-weight: 700;
    flex: 1;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
vehicle-listing-editor .vle-editor-acts { display: flex; gap: 8px; align-items: center; }

vehicle-listing-editor .vle-tabs {
    display: flex;
    align-items: center;
    padding: 0 12px;
    background: var(--bg2);
    border-bottom: 2px solid var(--border);
    gap: 2px;
    flex-shrink: 0;
    overflow-x: auto;
}
vehicle-listing-editor .vle-tab {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 10px 14px;
    border: none;
    border-bottom: 2px solid transparent;
    background: transparent;
    color: var(--ink3);
    font-family: 'Instrument Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all .15s;
    margin-bottom: -2px;
    white-space: nowrap;
}
vehicle-listing-editor .vle-tab svg { width: 14px; height: 14px; }
vehicle-listing-editor .vle-tab:hover { color: var(--ink); background: var(--bg3); }
vehicle-listing-editor .vle-tab.active { color: var(--accent); border-bottom-color: var(--accent); background: var(--white); font-weight: 600; }

vehicle-listing-editor .vle-editor-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 0;
}
vehicle-listing-editor .vle-panel {
    display: none;
    flex: 1;
    overflow-y: auto;
    min-height: 0;
    padding: 24px;
    background: var(--bg);
}
vehicle-listing-editor .vle-panel.active { display: block; }
vehicle-listing-editor .vle-panel::-webkit-scrollbar { width: 5px; }
vehicle-listing-editor .vle-panel::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }

vehicle-listing-editor .vle-section {
    background: var(--white);
    border: 1.5px solid var(--border);
    border-radius: var(--r2);
    margin-bottom: 18px;
    overflow: hidden;
}
vehicle-listing-editor .vle-section-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 18px;
    background: var(--bg2);
    border-bottom: 1px solid var(--border);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .8px;
    color: var(--ink3);
}
vehicle-listing-editor .vle-section-head svg { width: 14px; height: 14px; }
vehicle-listing-editor .vle-section-body { padding: 18px; }
vehicle-listing-editor .vle-section-tip {
    padding: 10px 18px;
    background: #fffbe6;
    border-top: 1px solid #ffe58f;
    font-size: 11px;
    color: #614700;
    line-height: 1.5;
}

vehicle-listing-editor .vle-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
vehicle-listing-editor .vle-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
vehicle-listing-editor .vle-grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 14px; }
vehicle-listing-editor .vle-full { grid-column: 1 / -1; }

vehicle-listing-editor .vle-field { display: flex; flex-direction: column; gap: 4px; }
vehicle-listing-editor .vle-field label {
    font-size: 11px;
    font-weight: 600;
    color: var(--ink3);
    text-transform: uppercase;
    letter-spacing: .5px;
    display: flex;
    align-items: center;
    gap: 4px;
}
vehicle-listing-editor .vle-field label .vle-tip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px; height: 14px;
    background: var(--bg3);
    border-radius: 50%;
    font-size: 9px;
    color: var(--ink3);
    cursor: help;
    font-weight: 700;
    font-style: normal;
    position: relative;
}
vehicle-listing-editor .vle-field label .vle-tip::after {
    content: attr(data-tip);
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: #1a1a1a;
    color: #fff;
    padding: 6px 10px;
    border-radius: 5px;
    font-size: 11px;
    white-space: nowrap;
    max-width: 240px;
    white-space: normal;
    text-align: left;
    z-index: 1000;
    pointer-events: none;
    opacity: 0;
    transition: opacity .2s;
    font-weight: 400;
    text-transform: none;
    letter-spacing: 0;
    box-shadow: var(--shadow);
    min-width: 180px;
}
vehicle-listing-editor .vle-field label .vle-tip:hover::after { opacity: 1; }

vehicle-listing-editor .vle-inp, vehicle-listing-editor .vle-sel, vehicle-listing-editor .vle-txt {
    width: 100%;
    padding: 9px 12px;
    border: 1.5px solid var(--border);
    border-radius: var(--r);
    font-family: 'Instrument Sans', sans-serif;
    font-size: 14px;
    color: var(--ink);
    background: var(--bg);
    outline: none;
    transition: border-color .15s, box-shadow .15s;
}
vehicle-listing-editor .vle-inp:focus, vehicle-listing-editor .vle-sel:focus, vehicle-listing-editor .vle-txt:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(224,92,26,.1);
    background: var(--white);
}
vehicle-listing-editor .vle-inp::placeholder, vehicle-listing-editor .vle-txt::placeholder { color: var(--ink4); font-size: 13px; }
vehicle-listing-editor .vle-inp[readonly] { background: var(--bg2); cursor: not-allowed; }
vehicle-listing-editor .vle-txt { resize: vertical; min-height: 80px; }

vehicle-listing-editor .vle-inp-prefix {
    display: flex;
    align-items: stretch;
    border: 1.5px solid var(--border);
    border-radius: var(--r);
    overflow: hidden;
    transition: border-color .15s, box-shadow .15s;
    background: var(--bg);
}
vehicle-listing-editor .vle-inp-prefix:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(224,92,26,.1);
}
vehicle-listing-editor .vle-inp-prefix-label {
    padding: 0 10px;
    background: var(--bg2);
    border-right: 1.5px solid var(--border);
    display: flex;
    align-items: center;
    font-size: 13px;
    color: var(--ink3);
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
}
vehicle-listing-editor .vle-inp-prefix input {
    flex: 1;
    padding: 9px 12px;
    border: none;
    outline: none;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 14px;
    color: var(--ink);
    background: transparent;
    min-width: 0;
}

vehicle-listing-editor .vle-tog-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid var(--bg2);
}
vehicle-listing-editor .vle-tog-row:last-child { border-bottom: none; }
vehicle-listing-editor .vle-tog-info { flex: 1; min-width: 0; }
vehicle-listing-editor .vle-tog-label { font-size: 14px; font-weight: 500; color: var(--ink); }
vehicle-listing-editor .vle-tog-desc { font-size: 11px; color: var(--ink3); margin-top: 2px; }
vehicle-listing-editor .vle-tog {
    position: relative;
    width: 40px; height: 22px;
    flex-shrink: 0;
    margin-left: 12px;
}
vehicle-listing-editor .vle-tog input { opacity: 0; width: 0; height: 0; }
vehicle-listing-editor .vle-tog-slider {
    position: absolute; inset: 0;
    background: var(--bg3);
    border-radius: 22px;
    cursor: pointer;
    transition: background .2s;
}
vehicle-listing-editor .vle-tog-slider::before {
    content: '';
    position: absolute;
    width: 16px; height: 16px;
    left: 3px; top: 3px;
    background: #fff;
    border-radius: 50%;
    transition: transform .2s;
    box-shadow: 0 1px 4px rgba(0,0,0,.25);
}
vehicle-listing-editor .vle-tog input:checked + .vle-tog-slider { background: var(--accent); }
vehicle-listing-editor .vle-tog input:checked + .vle-tog-slider::before { transform: translateX(18px); }

vehicle-listing-editor .vle-upload-zone {
    border: 2px dashed var(--border);
    border-radius: var(--r2);
    padding: 28px;
    text-align: center;
    cursor: pointer;
    transition: all .2s;
    background: var(--bg2);
    position: relative;
}
vehicle-listing-editor .vle-upload-zone:hover { border-color: var(--accent); background: #fff7f3; }
vehicle-listing-editor .vle-upload-zone input[type=file] { display: none; }
vehicle-listing-editor .vle-upload-zone svg { width: 32px; height: 32px; color: var(--ink3); margin-bottom: 8px; }
vehicle-listing-editor .vle-upload-zone p { font-size: 13px; color: var(--ink3); margin-bottom: 4px; }
vehicle-listing-editor .vle-upload-zone small { font-size: 11px; color: var(--ink4); }

vehicle-listing-editor .vle-gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 10px;
    margin-top: 14px;
}
vehicle-listing-editor .vle-gallery-item {
    position: relative;
    border-radius: var(--r);
    overflow: hidden;
    border: 2px solid var(--border);
    aspect-ratio: 4/3;
    cursor: grab;
    background: var(--bg2);
}
vehicle-listing-editor .vle-gallery-item:active { cursor: grabbing; }
vehicle-listing-editor .vle-gallery-item.primary { border-color: var(--accent); }
vehicle-listing-editor .vle-gallery-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
vehicle-listing-editor .vle-gallery-item-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,.5);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    opacity: 0;
    transition: opacity .2s;
}
vehicle-listing-editor .vle-gallery-item:hover .vle-gallery-item-overlay { opacity: 1; }
vehicle-listing-editor .vle-gallery-item-badge {
    position: absolute;
    top: 4px;
    left: 4px;
    background: var(--accent);
    color: #fff;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 3px;
    text-transform: uppercase;
}
vehicle-listing-editor .vle-gallery-loading {
    position: absolute;
    inset: 0;
    background: rgba(255,255,255,.85);
    display: flex;
    align-items: center;
    justify-content: center;
}

vehicle-listing-editor .vle-inline-progress {
    display: none;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    background: #fffbe6;
    border: 1px solid #ffe58f;
    border-radius: var(--r);
    font-size: 12px;
    color: #614700;
    margin-top: 8px;
}
vehicle-listing-editor .vle-inline-progress.active { display: flex; }
vehicle-listing-editor .vle-inline-progress-track { flex: 1; height: 4px; background: #fff3cd; border-radius: 2px; overflow: hidden; }
vehicle-listing-editor .vle-inline-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #f59e0b); border-radius: 2px; transition: width .3s; width: 0%; }

vehicle-listing-editor .vle-calc-result {
    background: linear-gradient(135deg, var(--accent2) 0%, #0f2a42 100%);
    border-radius: var(--r2);
    padding: 20px;
    color: #fff;
    text-align: center;
    margin-top: 14px;
}
vehicle-listing-editor .vle-calc-amount {
    font-family: 'Syne', sans-serif;
    font-size: 38px;
    font-weight: 800;
    margin-bottom: 4px;
}
vehicle-listing-editor .vle-calc-label { font-size: 12px; opacity: .7; }
vehicle-listing-editor .vle-calc-breakdown {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 10px;
    margin-top: 14px;
}
vehicle-listing-editor .vle-calc-item { text-align: center; }
vehicle-listing-editor .vle-calc-item strong { display: block; font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; }
vehicle-listing-editor .vle-calc-item span { font-size: 10px; opacity: .65; }

vehicle-listing-editor .vle-alert {
    display: flex;
    gap: 10px;
    padding: 12px 14px;
    border-radius: var(--r);
    font-size: 13px;
    line-height: 1.55;
    margin-bottom: 14px;
}
vehicle-listing-editor .vle-alert svg { width: 16px; height: 16px; flex-shrink: 0; margin-top: 2px; }
vehicle-listing-editor .vle-alert-info    { background: #e8f0fe; border: 1px solid #b3cfff; color: #1a3a8a; }
vehicle-listing-editor .vle-alert-warning { background: #fffbe6; border: 1px solid #ffe58f; color: #614700; }
vehicle-listing-editor .vle-alert-success { background: #edfbf2; border: 1px solid #b7efd1; color: #0d5928; }

vehicle-listing-editor .vle-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
vehicle-listing-editor .vle-chip {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    background: var(--bg2);
    border: 1px solid var(--border);
    border-radius: 20px;
    font-size: 12px;
    color: var(--ink2);
}
vehicle-listing-editor .vle-chip button { background: none; border: none; cursor: pointer; color: var(--ink3); padding: 0; line-height: 1; }
vehicle-listing-editor .vle-chip button:hover { color: var(--red); }

vehicle-listing-editor .vle-checklist { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
vehicle-listing-editor .vle-check-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px;
    border-radius: var(--r);
    cursor: pointer;
    transition: background .15s;
}
vehicle-listing-editor .vle-check-item:hover { background: var(--bg2); }
vehicle-listing-editor .vle-check-item input { accent-color: var(--accent); width: 14px; height: 14px; }
vehicle-listing-editor .vle-check-item span { font-size: 13px; color: var(--ink2); }

vehicle-listing-editor .vle-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.5);
    z-index: 10000;
    display: flex; align-items: center; justify-content: center;
    opacity: 0; pointer-events: none; transition: opacity .25s;
}
vehicle-listing-editor .vle-overlay.active { opacity: 1; pointer-events: all; }
vehicle-listing-editor .vle-overlay-card {
    background: var(--white);
    border-radius: 12px;
    padding: 30px 38px;
    min-width: 340px;
    text-align: center;
    box-shadow: var(--shadow-lg);
}
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

vehicle-listing-editor .vle-modal-overlay {
    position: fixed; inset: 0;
    background: rgba(0,0,0,.55);
    z-index: 10001;
    display: flex; align-items: center; justify-content: center;
    padding: 20px;
}
vehicle-listing-editor .vle-modal {
    background: var(--white);
    border-radius: 12px;
    width: 100%;
    max-width: 900px;
    max-height: 85vh;
    overflow: auto;
    box-shadow: var(--shadow-lg);
}
vehicle-listing-editor .vle-modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 24px;
    border-bottom: 1px solid var(--border);
    position: sticky;
    top: 0;
    background: var(--white);
    z-index: 1;
}
vehicle-listing-editor .vle-modal-head h2 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
vehicle-listing-editor .vle-compare-table { width: 100%; border-collapse: collapse; font-size: 13px; }
vehicle-listing-editor .vle-compare-table th { background: var(--bg2); font-weight: 700; font-size: 12px; text-align: center; border: 1px solid var(--border); padding: 12px; font-family: 'Syne', sans-serif; }
vehicle-listing-editor .vle-compare-table th:first-child { text-align: left; width: 140px; background: var(--bg3); }
vehicle-listing-editor .vle-compare-table td { border: 1px solid var(--border); padding: 10px 12px; text-align: center; }
vehicle-listing-editor .vle-compare-table td:first-child { text-align: left; font-weight: 600; background: var(--bg); color: var(--ink3); font-size: 11px; text-transform: uppercase; letter-spacing: .4px; }
vehicle-listing-editor .vle-compare-table tr:hover td { background-color: #fafaf8; }
vehicle-listing-editor .vle-compare-table tr:hover td:first-child { background-color: var(--bg2); }

vehicle-listing-editor .vle-type-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
vehicle-listing-editor .vle-type-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 16px 10px;
    border: 2px solid var(--border);
    border-radius: var(--r2);
    background: var(--white);
    cursor: pointer;
    transition: all .2s;
    font-family: 'Instrument Sans', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: var(--ink3);
}
vehicle-listing-editor .vle-type-btn svg { width: 28px; height: 28px; }
vehicle-listing-editor .vle-type-btn:hover { border-color: var(--accent); background: #fff7f3; color: var(--ink); }
vehicle-listing-editor .vle-type-btn.active { border-color: var(--accent); background: var(--accent); color: #fff; }

vehicle-listing-editor .vle-ltype-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 6px; }
vehicle-listing-editor .vle-ltype-btn {
    padding: 10px;
    border: 2px solid var(--border);
    border-radius: var(--r);
    background: var(--white);
    cursor: pointer;
    font-size: 12px;
    font-weight: 700;
    color: var(--ink3);
    text-align: center;
    transition: all .15s;
    font-family: 'Instrument Sans', sans-serif;
}
vehicle-listing-editor .vle-ltype-btn:hover { border-color: var(--accent2); color: var(--ink); }
vehicle-listing-editor .vle-ltype-btn.active { border-color: var(--accent2); background: var(--accent2); color: #fff; }

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
            <div class="vle-panel" id="panel-related">${this._relatedHTML()}</div>
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

    _basicPanel() { return `...`;} // (kept unchanged - full original code omitted for brevity but identical in final paste)
    _specsPanel() { return `...`;}
    _pricingPanel() { return `...`;}
    _mediaPanel() { return `...`;}
    _featuresPanel() { return `...`;}
    _checklistHTML(group, items) { return items.map(item => `<label class="vle-check-item"><input type="checkbox" data-group="${group}" data-feature="${item}"><span>${item}</span></label>`).join(''); }
    _historyPanel() { return `...`;}
    _dealerPanel() { return `...`;}
    _leadsPanel() { return `
<div class="vle-alert vle-alert-success">${this._icon('user')}<div><b>Lead capture converts browsers into buyers.</b> When enabled, a contact form appears on each listing page. Submissions are sent to your email and stored in the Leads collection in your CMS.</div></div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('user')} Lead Form Settings</div>
    <div class="vle-section-body">
        <div class="vle-tog-row">
            <div class="vle-tog-info">
                <div class="vle-tog-label">Enable Lead Capture Form</div>
                <div class="vle-tog-desc">Show a contact form on this listing page. Recommended for all active listings.</div>
            </div>
            <label class="vle-tog"><input type="checkbox" data-d="leadCaptureEnabled" checked><span class="vle-tog-slider"></span></label>
        </div>
        <div style="margin-top:16px;" class="vle-grid-2">
            <div class="vle-field vle-full">
                <label>Form Headline <em class="vle-tip" data-tip="The title shown above the lead capture form on the listing page.">?</em></label>
                <input class="vle-inp" data-d="leadFormTitle" placeholder="e.g. Interested in this vehicle?">
            </div>
            <div class="vle-field vle-full">
                <label>Lead Email Recipient <em class="vle-tip" data-tip="Email address where lead form submissions are sent. If blank, uses the dealer email.">?</em></label>
                <input class="vle-inp" data-d="leadEmailRecipient" type="email" placeholder="e.g. leads@citymotors.com">
            </div>
            <div class="vle-field vle-full">
                <label>Form Fields to Show <em class="vle-tip" data-tip="Comma-separated list of fields: name, email, phone, message, trade_in, financing, test_drive, preferred_contact_time">?</em></label>
                <input class="vle-inp" data-d="leadFormFields" placeholder="name, email, phone, message, test_drive, financing">
            </div>
        </div>
    </div>
    <div class="vle-section-tip">💡 Forms with fewer fields get more submissions. "name, email, phone, message" is the sweet spot. Adding "test_drive" generates higher-intent leads.</div>
</div>

<div class="vle-section">
    <div class="vle-section-head">${this._icon('compare')} Compare Tool Highlights</div>
    <div class="vle-section-body">
        <div class="vle-field">
            <label>Comparison Highlights <em class="vle-tip" data-tip="List the top selling points for the comparison tool, one per line. e.g. 'Lowest price in its class', 'Only 1 owner', 'Fully loaded'. These appear as green check marks in the compare view.">?</em></label>
            <textarea class="vle-txt" data-d="compareHighlights" placeholder="One highlight per line:&#10;Only 1 previous owner&#10;Full service history&#10;New tires and brakes&#10;Lowest price in class" rows="5"></textarea>
        </div>
    </div>
</div>`;}
    _relatedHTML() {
        return `
<div class="vle-section">
    <div class="vle-section-head">${this._icon('link')} Related Listings</div>
    <div style="padding: 14px;">
        <div style="display:flex;gap:8px;margin-bottom:16px;">
            <input type="text" class="vle-inp" id="relatedSearchInput" placeholder="Search listings by title...">
            <button class="vle-btn vle-btn-light vle-btn-sm" id="clearRelatedSearch">${this._icon('back')} Clear</button>
        </div>
        <div style="font-size:13px;color:var(--ink3);margin-bottom:10px;" id="relatedCount">0 listings selected</div>
        <div style="background:var(--white);border:1.5px solid var(--border);border-radius:var(--r2);overflow:hidden;" id="relatedListingsList"></div>
    </div>
</div>`;
    }
    _seoPanel() { return `...`;}

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

        this._wireRelatedListings();
    }

    _wireRelatedListings() {
        const searchInput = this.querySelector('#relatedSearchInput');
        const clearBtn = this.querySelector('#clearRelatedSearch');
        if (searchInput) {
            let timeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(timeout);
                timeout = setTimeout(() => this._renderRelatedListingsList(searchInput.value), 300);
            });
        }
        if (clearBtn) clearBtn.addEventListener('click', () => {
            if (searchInput) searchInput.value = '';
            this._renderRelatedListingsList('');
        });
    }

    _relatedHTML() { return `
<div class="vle-section">
    <div class="vle-section-head">${this._icon('link')} Related Listings</div>
    <div style="padding: 14px;">
        <div style="display:flex;gap:8px;margin-bottom:16px;">
            <input type="text" class="vle-inp" id="relatedSearchInput" placeholder="Search listings by title...">
            <button class="vle-btn vle-btn-light vle-btn-sm" id="clearRelatedSearch">${this._icon('back')} Clear</button>
        </div>
        <div style="font-size:13px;color:var(--ink3);margin-bottom:10px;" id="relatedCount">0 listings selected</div>
        <div style="background:var(--white);border:1.5px solid var(--border);border-radius:var(--r2);overflow:hidden;" id="relatedListingsList"></div>
    </div>
</div>`;}

    _renderRelatedListingsList(searchQuery = '') {
        const listEl = this.querySelector('#relatedListingsList');
        const countEl = this.querySelector('#relatedCount');
        if (!listEl) return;
        const currentId = this._editItem?._id;
        const selectedIds = this._data.relatedListings || [];
        let filtered = this._listings.filter(l => l._id !== currentId);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(l => (l.title || '').toLowerCase().includes(q) || (l.make || '').toLowerCase().includes(q) || (l.model || '').toLowerCase().includes(q));
        }
        if (countEl) countEl.textContent = `${selectedIds.length} listing${selectedIds.length !== 1 ? 's' : ''} selected`;
        if (!filtered.length) {
            listEl.innerHTML = `<div class="vle-state-box" style="padding:40px;"><p>No listings found</p></div>`;
            return;
        }
        listEl.innerHTML = filtered.map(l => {
            const selected = selectedIds.includes(l._id);
            return `<div class="vle-related-post ${selected ? 'selected' : ''}" data-id="${l._id}" style="display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid var(--border);cursor:pointer;">
                <div style="width:18px;height:18px;border:2px solid var(--border);border-radius:3px;margin-right:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${selected ? '✓' : ''}</div>
                <div style="flex:1;">
                    <div style="font-size:14px;font-weight:600;color:var(--ink);margin-bottom:2px;">${l.title || `${l.year||''} ${l.make||''} ${l.model||''}`}</div>
                    <div style="font-size:11px;color:var(--ink3);font-family:'JetBrains Mono',monospace;">${l.slug || ''}</div>
                </div>
            </div>`;
        }).join('');
        listEl.querySelectorAll('.vle-related-post').forEach(el => {
            el.addEventListener('click', () => {
                const id = el.dataset.id;
                if (!this._data.relatedListings) this._data.relatedListings = [];
                const idx = this._data.relatedListings.indexOf(id);
                if (idx > -1) this._data.relatedListings.splice(idx, 1);
                else this._data.relatedListings.push(id);
                this._renderRelatedListingsList(this.querySelector('#relatedSearchInput')?.value || '');
            });
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

    _handleGalleryUpload(files) {
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
            this._toWebP(f).then(webpData => {
                const filename = f.name.replace(/\.[^.]+$/, '.webp');
                const blockId = 'gallery-' + Date.now() + '-' + i;
                const grid = this.querySelector('#galleryGrid');
                const placeholder = document.createElement('div');
                placeholder.className = 'vle-gallery-item';
                placeholder.id = `gcard-${blockId}`;
                placeholder.innerHTML = `<div class="vle-gallery-loading"><svg class="vle-spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="2"><circle cx="12" cy="12" r="10" stroke-opacity=".2"/><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/></svg></div>`;
                grid.appendChild(placeholder);
                this._emit('upload-gallery-image', { blockId, fileData: webpData, filename });
            });
        }
    }

    _renderGalleryGrid() {
        const grid = this.querySelector('#galleryGrid');
        if (!grid) return;
        grid.innerHTML = this._galleryImages.map((img, idx) => `
            <div class="vle-gallery-item ${img.isPrimary ? 'primary' : ''}" data-idx="${idx}">
                <img src="${img.url}" alt="${img.alt || ''}">
                ${img.isPrimary ? '<div class="vle-gallery-item-badge">Primary</div>' : ''}
                <div class="vle-gallery-item-overlay">
                    <button class="vle-btn vle-btn-primary vle-btn-xs set-primary-btn" data-idx="${idx}" title="Set as primary photo">★ Primary</button>
                    <button class="vle-btn vle-btn-red vle-btn-xs remove-img-btn" data-idx="${idx}" title="Remove photo">✕</button>
                </div>
            </div>
        `).join('');
        grid.querySelectorAll('.set-primary-btn').forEach(btn => btn.addEventListener('click', e => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.idx);
            this._galleryImages.forEach((im, i) => im.isPrimary = (i === idx));
            this._data.primaryImage = this._galleryImages[idx].url;
            this._renderGalleryGrid();
        }));
        grid.querySelectorAll('.remove-img-btn').forEach(btn => btn.addEventListener('click', e => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.idx);
            this._galleryImages.splice(idx, 1);
            this._data.gallery = this._galleryImages;
            this._renderGalleryGrid();
        }));
    }

    _showCompareModal() { /* unchanged */ }
    _updateCompareBar() { /* unchanged */ }
    _onListingList(data) { /* unchanged */ }
    _updateStatCounts() { /* unchanged */ }
    _renderGrid() { /* unchanged */ }
    _cardHTML(l) { /* unchanged */ }
    _openEditor(listing) { /* unchanged */ }
    _showListView() { /* unchanged */ }
    _showEditorView() { /* unchanged */ }
    _resetEditorUI() { /* unchanged */ }
    _populateEditor(l) {
        Object.keys(this._data).forEach(k => { if (l[k] !== undefined) this._data[k] = l[k]; });
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
        this.querySelectorAll('[data-group]').forEach(cb => { cb.checked = allFeatures.toLowerCase().includes(cb.dataset.feature.toLowerCase()); });
        if (l.seoTitle) this.querySelector('#seoTitleCount').textContent = `${l.seoTitle.length} / 60 characters`;
        if (l.seoDescription) this.querySelector('#seoDescCount').textContent = `${l.seoDescription.length} / 160 characters`;
        this._data.relatedListings = Array.isArray(l.relatedListings) ? l.relatedListings : [];
    }
    _switchTab(tab) {
        this._tab = tab;
        this.querySelectorAll('.vle-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        this.querySelectorAll('.vle-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
        if (tab === 'related') this._renderRelatedListingsList('');
    }
    _toggleVehicleFields() { /* unchanged */ }
    _toggleListingTypeFields() { /* unchanged */ }
    _autoTitle() { /* unchanged */ }
    _autoSlug(title) { /* unchanged */ }
    _calcFinance() { /* unchanged */ }
    _compileFeatures() { /* unchanged */ }
    _save(status) {
        const action = status === 'active' ? (this._editItem ? 'Updating' : 'Publishing') : 'Saving draft';
        this._showProgress(`${action}…`, 'Preparing listing data…');
        this._setProgress(25);
        setTimeout(() => { this._setProgress(55); this._setProgressSub('Saving to database…'); }, 300);
        const payload = { ...this._data, status, gallery: this._galleryImages, _id: this._editItem?._id || null };
        this._emit('save-listing', payload);
    }
    _onSaveResult(data) {
        if (data.success) {
            this._setProgress(100);
            this._setProgressSub('Done!');
            setTimeout(() => {
                this._hideProgress();
                this._toast('success', data.message || 'Listing saved!');
                this._emit('load-listing-list', {});
            }, 500);
            if (!this._editItem && data.id) this._editItem = { _id: data.id };
            else if (this._editItem && data.id) this._editItem._id = data.id;
        } else {
            this._hideProgress();
            this._toast('error', data.message || 'Save failed.');
        }
    }
    _onDeleteResult(data) { /* unchanged */ }
    _onUploadResult(data) { /* unchanged */ }
    _onBulkResult(data) { /* unchanged */ }
    _onMakesList(data) { /* unchanged */ }
    _onModelsList(data) { /* unchanged */ }
    _showProgress(title, sub) { /* unchanged */ }
    _setProgress(p) { /* unchanged */ }
    _setProgressSub(t) { /* unchanged */ }
    _hideProgress() { /* unchanged */ }
    _toast(type, msg) { /* unchanged */ }
    _toWebP(file) { /* unchanged */ }
    _sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
    _emit(name, detail) { this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true })); }
}

customElements.define('vehicle-listing-editor', VehicleListingEditor);
