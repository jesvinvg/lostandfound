/**
 * CampusFind – app.js
 * Complete SPA logic for the College Lost & Found Portal.
 */

/* ============================================================
   CONSTANTS
   ============================================================ */
const LS_FOUND  = 'cf_found_items';
const LS_LOST   = 'cf_lost_items';
const LS_CLAIMS = 'cf_claims';
const LS_MY     = 'cf_my_activity';
const LS_NOTIFS = 'cf_notifications';

/* ============================================================
   LOCAL STORAGE HELPERS
   ============================================================ */
function getData(key, defaultVal) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return defaultVal;
    return JSON.parse(raw);
  } catch (e) {
    return defaultVal;
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

function getDefaultItemImage(category) {
  const map = {
    'Electronics':         'assets/images/earphones.jpg',
    'Jewellery':           'assets/images/gold-ornament.jpg',
    'Accessories':         'assets/images/wristwatch.jpg',
    'Personal Belongings': 'assets/images/wallet.jpg',
    'Documents':           'assets/images/id-card.jpg',
    'Clothing':            'assets/images/denim-jacket.jpg',
    'Bags':                'assets/images/backpack.jpg',
    'Stationery':          'assets/images/drawing-kit.jpg'
  };
  return map[category] || 'assets/images/backpack.jpg';
}

const DATA_VERSION_KEY = 'cf_data_v5';

function initData() {
  const hasVersion = localStorage.getItem(DATA_VERSION_KEY);
  if (!hasVersion) {
    // Fresh install or upgrading to real photos & notifications version
    saveData(LS_FOUND,  window.CAMPUSFIND_DATA.foundItems);
    saveData(LS_LOST,   window.CAMPUSFIND_DATA.lostItems);
    saveData(LS_CLAIMS, window.CAMPUSFIND_DATA.claims);
    saveData(LS_MY,     window.CAMPUSFIND_DATA.myActivity);
    saveData(LS_NOTIFS, window.CAMPUSFIND_DATA.notifications || []);
    localStorage.setItem(DATA_VERSION_KEY, '5');
    return;
  }

  if (!localStorage.getItem(LS_FOUND)) {
    saveData(LS_FOUND,  window.CAMPUSFIND_DATA.foundItems);
  }
  if (!localStorage.getItem(LS_LOST)) {
    saveData(LS_LOST,   window.CAMPUSFIND_DATA.lostItems);
  }
  if (!localStorage.getItem(LS_CLAIMS)) {
    saveData(LS_CLAIMS, window.CAMPUSFIND_DATA.claims);
  }
  if (!localStorage.getItem(LS_MY)) {
    saveData(LS_MY,     window.CAMPUSFIND_DATA.myActivity);
  }
  if (!localStorage.getItem(LS_NOTIFS)) {
    saveData(LS_NOTIFS, window.CAMPUSFIND_DATA.notifications || []);
  }

  // Ensure any item pointing to old placeholder text is upgraded to real photos
  let found = getFoundItems();
  let updatedFound = false;
  found = found.map(item => {
    if (!item.image || item.image.includes('placehold.co')) {
      const match = window.CAMPUSFIND_DATA.foundItems.find(d => d.id === item.id);
      item.image = match ? match.image : getDefaultItemImage(item.category);
      updatedFound = true;
    }
    return item;
  });
  if (updatedFound) saveData(LS_FOUND, found);

  let lost = getLostItems();
  let updatedLost = false;
  lost = lost.map(item => {
    if (!item.image || item.image.includes('placehold.co')) {
      const match = window.CAMPUSFIND_DATA.lostItems.find(d => d.id === item.id);
      item.image = match ? match.image : getDefaultItemImage(item.category);
      updatedLost = true;
    }
    return item;
  });
  if (updatedLost) saveData(LS_LOST, lost);
}

function resetData() {
  if (confirm('Reset all demo data back to default? Any added items or claims will be reset.')) {
    localStorage.removeItem(LS_FOUND);
    localStorage.removeItem(LS_LOST);
    localStorage.removeItem(LS_CLAIMS);
    localStorage.removeItem(LS_MY);
    localStorage.removeItem(LS_NOTIFS);
    localStorage.removeItem(DATA_VERSION_KEY);
    initData();
    updateStats();
    updateNotificationsUI();
    navigateTo(currentView);
    showToast('Demo data reset to original sample state.', 'info');
  }
}

function getFoundItems()    { return getData(LS_FOUND,  []); }
function getLostItems()     { return getData(LS_LOST,   []); }
function getClaims()        { return getData(LS_CLAIMS, []); }
function getNotifications() { return getData(LS_NOTIFS, []); }
function getMyActivity()    { return getData(LS_MY,     { lost:[], found:[], claims:[], notified:[] }); }

/* ============================================================
   ID GENERATOR
   ============================================================ */
function genId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/* ============================================================
   STATUS BADGE HELPER
   ============================================================ */
function statusBadge(status) {
  const map = {
    'Pending':   'badge-pending',
    'Approved':  'badge-approved',
    'Claimed':   'badge-claimed',
    'Returned':  'badge-returned',
    'Rejected':  'badge-rejected',
    'Searching': 'badge-searching',
    'Found':     'badge-found',
  };
  const cls = map[status] || 'badge-pending';
  return `<span class="badge ${cls}">${escHtml(status)}</span>`;
}

function categoryBadge(cat) {
  return `<span class="badge badge-category">${escHtml(cat)}</span>`;
}

/* ============================================================
   HTML ESCAPING
   ============================================================ */
function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SVG_FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect fill='%231e293b' width='400' height='300'/%3E%3Cpath d='M160 110l15-25h50l15 25h35c11 0 20 9 20 20v70c0 11-9 20-20 20H125c-11 0-20-9-20-20v-70c0-11 9-20 20-20h35zm40 100c22.1 0 40-17.9 40-40s-17.9-40-40-40-40 17.9-40 40 17.9 40 40 40z' fill='%23475569'/%3E%3Ccircle cx='200' cy='170' r='25' fill='%23334155'/%3E%3C/svg%3E";

function renderIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    try {
      window.lucide.createIcons();
    } catch (e) {
      console.warn('Lucide icon error:', e);
    }
  }
}

/* ============================================================
   TOAST NOTIFICATIONS
   ============================================================ */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const iconMap = {
    success: 'check-circle',
    error:   'x-circle',
    info:    'info',
    warning: 'alert-triangle'
  };
  const icon = iconMap[type] || 'info';

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i data-lucide="${icon}"></i><span>${escHtml(message)}</span>`;
  container.appendChild(toast);

  renderIcons();

  setTimeout(() => {
    toast.classList.add('toast-out');
    setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 350);
  }, 3500);
}

/* ============================================================
   AUTHENTICATION & SESSION
   ============================================================ */
const LS_USER = 'cf_current_user';

function getCurrentUser() {
  return getData(LS_USER, null);
}

function setCurrentUser(user) {
  if (user) {
    saveData(LS_USER, user);
  } else {
    localStorage.removeItem(LS_USER);
  }
}

function applyUserSession(user) {
  const loginWrap = document.getElementById('view-login');
  const appShell  = document.getElementById('app-shell');
  if (!user) {
    if (loginWrap) loginWrap.style.display = 'flex';
    if (appShell)  appShell.style.display  = 'none';
    renderIcons();
    return;
  }

  if (loginWrap) loginWrap.style.display = 'none';
  if (appShell)  appShell.style.display  = 'flex';

  const nameEl          = document.getElementById('user-display-name');
  const badgeEl         = document.getElementById('user-role-badge');
  const adminDesktopNav = document.getElementById('nav-item-admin');
  const adminMobileNav  = document.getElementById('mobile-nav-admin');

  if (nameEl) nameEl.textContent = user.name;
  if (badgeEl) {
    badgeEl.textContent = user.role === 'admin' ? 'Staff / Admin' : 'Student';
    badgeEl.className = 'user-role-badge ' + (user.role === 'admin' ? 'role-admin' : 'role-student');
  }

  // Show/Hide Admin menu according to role
  const isAdmin = (user.role === 'admin');
  if (adminDesktopNav) adminDesktopNav.style.display = isAdmin ? 'inline-flex' : 'none';
  if (adminMobileNav)  adminMobileNav.style.display  = isAdmin ? 'flex' : 'none';

  renderIcons();
}

function loginUser(role, name, email) {
  const user = { role, name, email };
  setCurrentUser(user);
  applyUserSession(user);
  showToast(`Welcome, ${name}! (${role === 'admin' ? 'Staff Portal' : 'Student Portal'})`, 'success');
  if (role === 'admin') {
    navigateTo('admin');
  } else {
    navigateTo('home');
  }
}

function logoutUser() {
  setCurrentUser(null);
  applyUserSession(null);
  showToast('Logged out successfully.', 'info');
}

/* ============================================================
   NAVIGATION
   ============================================================ */
let currentView = 'home';
let pendingSearchQuery = '';

function navigateTo(viewId, searchQuery) {
  const user = getCurrentUser();
  if (!user) {
    applyUserSession(null);
    return;
  }

  // Guard: if non-admin tries to view admin
  if (viewId === 'admin' && user.role !== 'admin') {
    showToast('Admin access is restricted to staff members.', 'warning');
    viewId = 'home';
  }

  // hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

  // show target
  const target = document.getElementById('view-' + viewId);
  if (!target) return;
  target.classList.add('active');
  currentView = viewId;

  // update nav links (both desktop and mobile)
  document.querySelectorAll('.nav-item, .mobile-nav-item, [data-view]').forEach(link => {
    if (link.dataset.view) {
      link.classList.toggle('active', link.dataset.view === viewId);
    }
  });

  // close mobile drawer
  closeMobileMenu();

  // carry search if passed
  if (searchQuery !== undefined) pendingSearchQuery = searchQuery;

  // render the view
  switch (viewId) {
    case 'home':        renderHome();        break;
    case 'found':       renderFoundView();   break;
    case 'lost':        renderLostView();    break;
    case 'report-lost': renderReportLost();  break;
    case 'report-found':renderReportFound(); break;
    case 'activity':    renderActivity();    break;
    case 'admin':       renderAdmin();       break;
  }

  // scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ============================================================
   MOBILE TOP NAVIGATION TOGGLE
   ============================================================ */
function toggleMobileMenu() {
  const menu = document.getElementById('mobile-nav-menu');
  if (menu) menu.classList.toggle('open');
}

function closeMobileMenu() {
  const menu = document.getElementById('mobile-nav-menu');
  if (menu) menu.classList.remove('open');
}

/* ============================================================
   STATS
   ============================================================ */
function updateStats() {
  const found  = getFoundItems();
  const lost   = getLostItems();
  const claims = getClaims();

  const totalFound      = found.length;
  const totalLost       = lost.length;
  const returned        = found.filter(i => i.status === 'Returned').length;
  const pendingClaims   = claims.filter(c => c.status === 'Pending').length;
  const approvedClaims  = claims.filter(c => c.status === 'Approved').length;

  // Home stats
  setText('stat-total-found',   totalFound);
  setText('stat-total-lost',    totalLost);
  setText('stat-returned',      returned);
  setText('stat-pending-claims',pendingClaims);

  // Admin stats
  setText('admin-stat-found',   totalFound);
  setText('admin-stat-lost',    totalLost);
  setText('admin-stat-pending', pendingClaims);
  setText('admin-stat-approved',approvedClaims);
  setText('admin-stat-returned',returned);
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

/* ============================================================
   HOME VIEW
   ============================================================ */
function renderHome() {
  updateStats();
  renderRecentFound();
  renderRecentLost();
}

function renderRecentFound() {
  const container = document.getElementById('recent-found-grid');
  if (!container) return;
  const items = getFoundItems().slice(-4).reverse();
  if (!items.length) { container.innerHTML = '<p style="font-size:.82rem;color:var(--text-secondary)">No found items yet.</p>'; return; }
  container.innerHTML = items.map(item => miniCard(item, 'found')).join('');
  addMiniCardListeners(container, 'found');
}

function renderRecentLost() {
  const container = document.getElementById('recent-lost-grid');
  if (!container) return;
  const items = getLostItems().slice(-4).reverse();
  if (!items.length) { container.innerHTML = '<p style="font-size:.82rem;color:var(--text-secondary)">No lost items yet.</p>'; return; }
  container.innerHTML = items.map(item => miniCard(item, 'lost')).join('');
  addMiniCardListeners(container, 'lost');
}

function miniCard(item, type) {
  const name     = type === 'found' ? item.name : item.name;
  const sub      = type === 'found' ? item.location : item.lastSeen;
  const imgSrc   = item.image || getDefaultItemImage(item.category);
  return `
    <div class="mini-card" data-id="${escHtml(item.id)}" data-type="${type}">
      <img class="mini-card-img" src="${escHtml(imgSrc)}" alt="${escHtml(name)}" loading="lazy" onerror="this.onerror=null; this.src='data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'48\' height=\'48\' viewBox=\'0 0 48 48\'%3E%3Crect fill=\'%231e3a5f\' width=\'48\' height=\'48\'/%3E%3Ctext fill=\'%23ffffff\' font-family=\'sans-serif\' font-size=\'20\' font-weight=\'bold\' x=\'50%25\' y=\'50%25\' text-anchor=\'middle\' dominant-baseline=\'middle\'%3E?%3C/text%3E%3C/svg%3E';" />
      <div class="mini-card-info">
        <div class="mini-card-name">${escHtml(name)}</div>
        <div class="mini-card-sub">${escHtml(sub || '')}</div>
      </div>
      ${statusBadge(item.status)}
    </div>`;
}

function addMiniCardListeners(container, type) {
  container.querySelectorAll('.mini-card').forEach(card => {
    card.addEventListener('click', () => {
      const id    = card.dataset.id;
      const items = type === 'found' ? getFoundItems() : getLostItems();
      const item  = items.find(i => i.id === id);
      if (item) openItemModal(item, type);
    });
  });
}

/* ============================================================
   FOUND ITEMS VIEW
   ============================================================ */
function renderFoundView() {
  const searchInput = document.getElementById('found-search');
  const catFilter   = document.getElementById('found-category-filter');

  // apply pending search query from home page
  if (pendingSearchQuery && searchInput) {
    searchInput.value = pendingSearchQuery;
    pendingSearchQuery = '';
  }

  renderFoundItems(
    searchInput ? searchInput.value : '',
    catFilter   ? catFilter.value   : ''
  );
}

function renderFoundItems(search, category) {
  const container = document.getElementById('found-items-grid');
  if (!container) return;
  let items = getFoundItems();

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.description || '').toLowerCase().includes(q) ||
      (i.location     || '').toLowerCase().includes(q)
    );
  }
  if (category) {
    items = items.filter(i => i.category === category);
  }

  const countLabel = document.getElementById('found-count-label');
  if (countLabel) countLabel.textContent = `${items.length} item${items.length !== 1 ? 's' : ''} found`;

  if (!items.length) {
    container.innerHTML = `<div class="empty-state">
      <i data-lucide="search-x"></i>
      <h3>No items found</h3>
      <p>Try adjusting your search or filter.</p>
    </div>`;
    renderIcons();
    return;
  }

  container.innerHTML = items.map(item => foundItemCard(item)).join('');
  renderIcons();

  // attach detail listeners
  container.querySelectorAll('[data-action="view-found"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const item = getFoundItems().find(i => i.id === id);
      if (item) openItemModal(item, 'found');
    });
  });
}

function foundItemCard(item) {
  const imgSrc = item.image || getDefaultItemImage(item.category);
  return `
    <div class="item-card">
      <img class="item-card-img" src="${escHtml(imgSrc)}" alt="${escHtml(item.name)}" loading="lazy"
           onerror="this.onerror=null; this.src=SVG_FALLBACK;" />
      <div class="item-card-body">
        <div class="item-card-top">
          <div class="item-card-name">${escHtml(item.name)}</div>
          ${categoryBadge(item.category)}
        </div>
        <div class="item-card-desc">${escHtml(item.description)}</div>
        <div class="item-card-meta">
          <div class="item-card-meta-row">
            <i data-lucide="map-pin"></i>
            <span>${escHtml(item.location)}</span>
          </div>
          <div class="item-card-meta-row">
            <i data-lucide="calendar"></i>
            <span>${formatDate(item.dateFound)}</span>
          </div>
        </div>
        <div class="item-card-footer">
          ${statusBadge(item.status)}
          <button class="btn btn-primary btn-sm" data-action="view-found" data-id="${escHtml(item.id)}">
            View Details
          </button>
        </div>
      </div>
    </div>`;
}

/* ============================================================
   LOST ITEMS VIEW
   ============================================================ */
function renderLostView() {
  renderLostItems(
    document.getElementById('lost-search') ? document.getElementById('lost-search').value : '',
    document.getElementById('lost-category-filter') ? document.getElementById('lost-category-filter').value : ''
  );
}

function renderLostItems(search, category) {
  const container = document.getElementById('lost-items-grid');
  if (!container) return;
  let items = getLostItems();

  if (search) {
    const q = search.toLowerCase();
    items = items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.description || '').toLowerCase().includes(q) ||
      (i.lastSeen    || '').toLowerCase().includes(q)
    );
  }
  if (category) {
    items = items.filter(i => i.category === category);
  }

  const countLabel = document.getElementById('lost-count-label');
  if (countLabel) countLabel.textContent = `${items.length} item${items.length !== 1 ? 's' : ''} listed`;

  if (!items.length) {
    container.innerHTML = `<div class="empty-state">
      <i data-lucide="search-x"></i>
      <h3>No items found</h3>
      <p>Try adjusting your search or filter.</p>
    </div>`;
    renderIcons();
    return;
  }

  container.innerHTML = items.map(item => lostItemCard(item)).join('');
  renderIcons();

  container.querySelectorAll('[data-action="view-lost"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      const item = getLostItems().find(i => i.id === id);
      if (item) openItemModal(item, 'lost');
    });
  });

  container.querySelectorAll('[data-action="found-lost-btn"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.dataset.id;
      openNotifyOwnerModal(id);
    });
  });
}

function lostItemCard(item) {
  const imgSrc = item.image || getDefaultItemImage(item.category);
  return `
    <div class="item-card">
      <img class="item-card-img" src="${escHtml(imgSrc)}" alt="${escHtml(item.name)}" loading="lazy"
           onerror="this.onerror=null; this.src=SVG_FALLBACK;" />
      <div class="item-card-body">
        <div class="item-card-top">
          <div class="item-card-name">${escHtml(item.name)}</div>
          ${categoryBadge(item.category)}
        </div>
        <div class="item-card-desc">${escHtml(item.description)}</div>
        <div class="item-card-meta">
          <div class="item-card-meta-row">
            <i data-lucide="map-pin"></i>
            <span>${escHtml(item.lastSeen)}</span>
          </div>
          <div class="item-card-meta-row">
            <i data-lucide="calendar"></i>
            <span>${formatDate(item.dateLost)}</span>
          </div>
        </div>
        <div class="item-card-footer">
          ${statusBadge(item.status)}
          <div style="display:flex;gap:6px;align-items:center;">
            <button class="btn btn-outline btn-sm" data-action="view-lost" data-id="${escHtml(item.id)}">
              View
            </button>
            ${item.status === 'Searching' ? `
              <button class="btn btn-success btn-sm" data-action="found-lost-btn" data-id="${escHtml(item.id)}" title="Notify owner you found this">
                <i data-lucide="bell-ring"></i> I Found This!
              </button>` : ''}
          </div>
        </div>
      </div>
    </div>`;
}

/* ============================================================
   ITEM DETAIL MODAL
   ============================================================ */
function openItemModal(item, type) {
  const modal = document.getElementById('item-modal');
  const body  = document.getElementById('item-modal-body');
  if (!modal || !body) return;

  const imgSrc = item.image || getDefaultItemImage(item.category);
  const isFound = (type === 'found');

  // Build field rows
  const fields = isFound ? [
    { label: 'Category',    value: item.category   },
    { label: 'Location',    value: item.location   },
    { label: 'Date Found',  value: formatDate(item.dateFound) },
    { label: 'Status',      value: item.status, isBadge: true },
    { label: 'Finder',      value: item.finderName },
    { label: 'Contact',     value: item.finderEmail},
  ] : [
    { label: 'Category',    value: item.category   },
    { label: 'Last Seen',   value: item.lastSeen   },
    { label: 'Date Lost',   value: formatDate(item.dateLost) },
    { label: 'Status',      value: item.status, isBadge: true },
    { label: 'Owner',       value: item.ownerName  },
    { label: 'Contact',     value: item.ownerEmail },
  ];

  const fieldsHtml = fields.map(f => `
    <div class="modal-field">
      <div class="modal-field-label">${escHtml(f.label)}</div>
      <div class="modal-field-value">${f.isBadge ? statusBadge(f.value) : escHtml(f.value || '—')}</div>
    </div>`).join('');

  // Actions
  let actionsHtml = '';
  if (isFound && item.status === 'Pending') {
    actionsHtml = `<button class="btn btn-primary" id="modal-claim-btn" data-id="${escHtml(item.id)}" data-name="${escHtml(item.name)}">
      <i data-lucide="file-text"></i> Claim This Item
    </button>`;
  }
  if (isFound && item.status === 'Claimed') {
    actionsHtml = `<span style="font-size:.82rem;color:var(--text-secondary)">This item has been claimed and is under review.</span>`;
  }
  if (isFound && item.status === 'Returned') {
    actionsHtml = `<span style="font-size:.82rem;color:var(--accent);font-weight:600">✓ This item has been successfully returned to its owner.</span>`;
  }

  // If viewing a lost item
  if (!isFound) {
    if (item.status === 'Searching') {
      actionsHtml = `<button class="btn btn-success" id="modal-notify-lost-btn" data-id="${escHtml(item.id)}">
        <i data-lucide="bell-ring"></i> I Found This! Notify ${escHtml(item.ownerName)}
      </button>`;
    } else if (item.status === 'Found') {
      actionsHtml = `<div class="located-banner">
        <i data-lucide="check-circle-2"></i>
        <span>Good news! A finder has already notified ${escHtml(item.ownerName)} that this item was found.</span>
      </div>`;
    }
  }

  body.innerHTML = `
    <img class="modal-item-img" src="${escHtml(imgSrc)}" alt="${escHtml(item.name)}" loading="lazy"
         onerror="this.onerror=null; this.src=SVG_FALLBACK;" />
    <div class="modal-item-content">
      <div class="modal-item-top">
        <div class="modal-item-name">${escHtml(item.name)}</div>
        ${categoryBadge(item.category)}
      </div>
      <p class="modal-item-desc">${escHtml(item.description)}</p>
      <div class="modal-item-fields">${fieldsHtml}</div>
      <div class="modal-actions">${actionsHtml}</div>
    </div>`;

  renderIcons();

  // Attach claim button
  const claimBtn = document.getElementById('modal-claim-btn');
  if (claimBtn) {
    claimBtn.addEventListener('click', () => {
      closeModal('item-modal');
      openClaimModal(claimBtn.dataset.id, claimBtn.dataset.name);
    });
  }

  // Attach notify owner button
  const notifyLostBtn = document.getElementById('modal-notify-lost-btn');
  if (notifyLostBtn) {
    notifyLostBtn.addEventListener('click', () => {
      closeModal('item-modal');
      openNotifyOwnerModal(notifyLostBtn.dataset.id);
    });
  }

  modal.classList.add('open');
}

/* ============================================================
   CLAIM MODAL
   ============================================================ */
function openClaimModal(itemId, itemName) {
  const modal = document.getElementById('claim-modal');
  if (!modal) return;

  document.getElementById('claim-item-id').value = itemId;
  document.getElementById('claim-modal-item-name').textContent = `Claiming: ${itemName}`;

  // Clear form
  ['claim-student-name','claim-student-email','claim-description','claim-identifiers'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('error'); }
  });
  ['claim-name-err','claim-email-err','claim-desc-err','claim-id-err'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });

  modal.classList.add('open');
}

/* ============================================================
   CLOSE MODAL
   ============================================================ */
function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('open');
}

/* ============================================================
   NOTIFY OWNER (I FOUND THIS ITEM)
   ============================================================ */
function openNotifyOwnerModal(itemId) {
  const modal = document.getElementById('notify-owner-modal');
  if (!modal) return;

  const item = getLostItems().find(i => i.id === itemId);
  if (!item) return;

  document.getElementById('notify-item-id').value = item.id;
  const user = getCurrentUser();

  // Item summary
  const summaryEl = document.getElementById('notify-target-summary');
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="font-weight:700;color:var(--text-primary);font-size:.95rem;">${escHtml(item.name)}</div>
      <div style="color:var(--text-secondary);font-size:.82rem;margin-top:3px;">
        Category: <strong>${escHtml(item.category)}</strong> &bull; Reported Lost by: <strong>${escHtml(item.ownerName)}</strong> (${escHtml(item.ownerEmail)})
      </div>
      <div style="color:#64748b;font-size:.78rem;margin-top:4px;">
        Last Seen: ${escHtml(item.lastSeen)} &bull; Reported on: ${formatDate(item.dateLost)}
      </div>
    `;
  }

  // Pre-fill finder name & contact
  const nameInput = document.getElementById('notify-finder-name');
  if (nameInput) nameInput.value = user ? user.name : 'Rahul Sharma';

  const contactInput = document.getElementById('notify-finder-contact');
  if (contactInput) contactInput.value = user ? user.email : 'rahul.sharma@college.edu';

  // Defaults for location & message
  const locInput = document.getElementById('notify-item-location');
  if (locInput) locInput.value = '';

  const msgInput = document.getElementById('notify-message');
  if (msgInput) msgInput.value = `Hi ${item.ownerName}, I spotted your ${item.name} on campus. You can safely collect it from the location above!`;

  // Clear errors
  ['notify-name-err','notify-contact-err','notify-loc-err','notify-msg-err'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });

  renderIcons();
  modal.classList.add('open');
}

function handleNotifyOwnerSubmit(e) {
  e.preventDefault();
  const itemId = document.getElementById('notify-item-id').value;
  const item = getLostItems().find(i => i.id === itemId);
  if (!item) return;

  const finderName    = document.getElementById('notify-finder-name').value.trim();
  const finderContact = document.getElementById('notify-finder-contact').value.trim();
  const location      = document.getElementById('notify-item-location').value.trim();
  const message       = document.getElementById('notify-message').value.trim();

  let valid = true;
  if (!finderName) {
    document.getElementById('notify-name-err').textContent = 'Please enter your name.';
    valid = false;
  }
  if (!finderContact) {
    document.getElementById('notify-contact-err').textContent = 'Please enter your contact information.';
    valid = false;
  }
  if (!location) {
    document.getElementById('notify-loc-err').textContent = 'Please specify where the item can be collected.';
    valid = false;
  }
  if (!message) {
    document.getElementById('notify-msg-err').textContent = 'Please enter a brief note for the owner.';
    valid = false;
  }
  if (!valid) return;

  // Create notification
  const notification = {
    id: genId(),
    itemId: item.id,
    itemName: item.name,
    ownerName: item.ownerName,
    ownerEmail: item.ownerEmail,
    finderName: finderName,
    finderContact: finderContact,
    location: location,
    message: message,
    timestamp: new Date().toISOString(),
    read: false
  };

  const notifs = getNotifications();
  notifs.unshift(notification);
  saveData(LS_NOTIFS, notifs);

  // Update lost item status to Found
  const allLost = getLostItems();
  const targetIndex = allLost.findIndex(i => i.id === item.id);
  if (targetIndex !== -1) {
    allLost[targetIndex].status = 'Found';
    allLost[targetIndex].finderInfo = {
      finderName, finderContact, location, message
    };
    saveData(LS_LOST, allLost);
  }

  // Track in my activity
  const my = getMyActivity();
  my.notified = my.notified || [];
  my.notified.push(notification.id);
  saveData(LS_MY, my);

  closeModal('notify-owner-modal');
  showToast(`Notification sent to ${item.ownerName}! They have been informed that you found their ${item.name}.`, 'success');
  updateStats();
  updateNotificationsUI();

  // Re-render views if visible
  if (currentView === 'lost') renderLostView();
  if (currentView === 'home') renderHome();
  if (currentView === 'activity') renderActivity();
}

/* ============================================================
   NOTIFICATION BELL & DROPDOWN UI
   ============================================================ */
function updateNotificationsUI() {
  const notifs = getNotifications();
  const badge = document.getElementById('bell-badge');
  const countText = document.getElementById('notif-count-text');
  const notifList = document.getElementById('notif-list');

  const unreadCount = notifs.filter(n => !n.read).length;
  if (badge) {
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.style.display = 'flex';
    } else {
      badge.style.display = 'none';
    }
  }

  if (countText) {
    countText.textContent = `${notifs.length} alert${notifs.length !== 1 ? 's' : ''}`;
  }

  if (notifList) {
    if (!notifs.length) {
      notifList.innerHTML = `<div style="padding:24px;text-align:center;color:#94a3b8;font-size:.85rem;">No notifications yet.</div>`;
    } else {
      notifList.innerHTML = notifs.map(n => `
        <div class="notif-card ${!n.read ? 'unread' : ''}">
          <div class="notif-top">
            <span class="notif-item-title">${escHtml(n.itemName)}</span>
            <span class="notif-time">${formatDate(n.timestamp)}</span>
          </div>
          <div class="notif-msg">
            <strong>${escHtml(n.finderName)}</strong> (${escHtml(n.finderContact)}) notified owner <strong>${escHtml(n.ownerName)}</strong> that this item is found!
          </div>
          <div style="font-size:.78rem;color:#475569;margin-top:4px;">
            <em>"${escHtml(n.message)}"</em>
          </div>
          <div class="notif-location-badge">
            <i data-lucide="map-pin"></i> Pickup: ${escHtml(n.location)}
          </div>
        </div>
      `).join('');
    }
  }

  renderIcons();
}

/* ============================================================
   REPORT LOST VIEW
   ============================================================ */
function renderReportLost() {
  // Set today's date as default
  const dateInput = document.getElementById('rl-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = todayISO();
  }
  renderIcons();
}

/* ============================================================
   REPORT FOUND VIEW
   ============================================================ */
function renderReportFound() {
  const dateInput = document.getElementById('rf-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = todayISO();
  }
  renderIcons();
}

/* ============================================================
   FORM: REPORT LOST – SUBMIT
   ============================================================ */
function handleReportLostSubmit(e) {
  e.preventDefault();
  if (!validateReportLost()) return;

  const imgInput = document.getElementById('rl-image');
  const previewImg = document.getElementById('rl-preview-img');

  const item = {
    id:        genId(),
    name:      document.getElementById('rl-name').value.trim(),
    category:  document.getElementById('rl-category').value,
    description: document.getElementById('rl-description').value.trim(),
    dateLost:  document.getElementById('rl-date').value,
    lastSeen:  document.getElementById('rl-location').value.trim(),
    ownerName: document.getElementById('rl-owner-name').value.trim(),
    ownerEmail:document.getElementById('rl-owner-email').value.trim(),
    status:    'Searching',
    image:     (previewImg && previewImg.src && previewImg.src.startsWith('data:'))
                 ? previewImg.src
                 : getDefaultItemImage(document.getElementById('rl-category').value),
  };

  const lostItems = getLostItems();
  lostItems.push(item);
  saveData(LS_LOST, lostItems);

  // Track in my activity
  const my = getMyActivity();
  my.lost.push(item.id);
  saveData(LS_MY, my);

  updateStats();
  document.getElementById('report-lost-form').reset();
  resetImagePreview('rl');
  showToast('Lost item reported successfully! We will notify you if it is found.', 'success');
  navigateTo('lost');
}

function validateReportLost() {
  let valid = true;
  const fields = [
    { id: 'rl-name',       err: 'rl-name-err',       msg: 'Item name is required.' },
    { id: 'rl-category',   err: 'rl-category-err',   msg: 'Please select a category.' },
    { id: 'rl-description',err: 'rl-description-err',msg: 'Description is required.' },
    { id: 'rl-date',       err: 'rl-date-err',        msg: 'Date lost is required.' },
    { id: 'rl-location',   err: 'rl-location-err',    msg: 'Last seen location is required.' },
    { id: 'rl-owner-name', err: 'rl-owner-name-err',  msg: 'Your name is required.' },
    { id: 'rl-owner-email',err: 'rl-owner-email-err', msg: 'A valid college email is required.' },
  ];
  fields.forEach(f => {
    const el  = document.getElementById(f.id);
    const err = document.getElementById(f.err);
    if (!el || !err) return;
    const val = el.value.trim();
    let msg = '';
    if (!val) {
      msg = f.msg;
    } else if (f.id === 'rl-owner-email' && !isValidEmail(val)) {
      msg = 'Please enter a valid email address.';
    }
    if (msg) {
      err.textContent = msg;
      el.classList.add('error');
      valid = false;
    } else {
      err.textContent = '';
      el.classList.remove('error');
    }
  });
  return valid;
}

/* ============================================================
   FORM: REPORT FOUND – SUBMIT
   ============================================================ */
function handleReportFoundSubmit(e) {
  e.preventDefault();
  if (!validateReportFound()) return;

  const previewImg = document.getElementById('rf-preview-img');

  const item = {
    id:          genId(),
    name:        document.getElementById('rf-name').value.trim(),
    category:    document.getElementById('rf-category').value,
    description: document.getElementById('rf-description').value.trim(),
    dateFound:   document.getElementById('rf-date').value,
    location:    document.getElementById('rf-location').value.trim(),
    finderName:  document.getElementById('rf-finder-name').value.trim(),
    finderEmail: document.getElementById('rf-finder-email').value.trim(),
    status:      'Pending',
    image:       (previewImg && previewImg.src && previewImg.src.startsWith('data:'))
                   ? previewImg.src
                   : getDefaultItemImage(document.getElementById('rf-category').value),
  };

  const foundItems = getFoundItems();
  foundItems.push(item);
  saveData(LS_FOUND, foundItems);

  // Track in my activity
  const my = getMyActivity();
  my.found.push(item.id);
  saveData(LS_MY, my);

  updateStats();
  document.getElementById('report-found-form').reset();
  resetImagePreview('rf');
  showToast('Found item reported successfully! Thank you for being honest.', 'success');
  navigateTo('found');
}

function validateReportFound() {
  let valid = true;
  const fields = [
    { id: 'rf-name',         err: 'rf-name-err',         msg: 'Item name is required.' },
    { id: 'rf-category',     err: 'rf-category-err',     msg: 'Please select a category.' },
    { id: 'rf-description',  err: 'rf-description-err',  msg: 'Description is required.' },
    { id: 'rf-date',         err: 'rf-date-err',          msg: 'Date found is required.' },
    { id: 'rf-location',     err: 'rf-location-err',      msg: 'Location found is required.' },
    { id: 'rf-finder-name',  err: 'rf-finder-name-err',   msg: 'Your name is required.' },
    { id: 'rf-finder-email', err: 'rf-finder-email-err',  msg: 'A valid college email is required.' },
  ];
  fields.forEach(f => {
    const el  = document.getElementById(f.id);
    const err = document.getElementById(f.err);
    if (!el || !err) return;
    const val = el.value.trim();
    let msg = '';
    if (!val) {
      msg = f.msg;
    } else if (f.id === 'rf-finder-email' && !isValidEmail(val)) {
      msg = 'Please enter a valid email address.';
    }
    if (msg) {
      err.textContent = msg;
      el.classList.add('error');
      valid = false;
    } else {
      err.textContent = '';
      el.classList.remove('error');
    }
  });
  return valid;
}

/* ============================================================
   IMAGE UPLOAD PREVIEW
   ============================================================ */
function setupImageUpload(inputId, previewBoxId, previewImgId, removeBtnId) {
  const fileInput  = document.getElementById(inputId);
  const previewBox = document.getElementById(previewBoxId);
  const previewImg = document.getElementById(previewImgId);
  const removeBtn  = document.getElementById(removeBtnId);

  if (!fileInput) return;

  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file.', 'error');
      fileInput.value = '';
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be smaller than 5 MB.', 'error');
      fileInput.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      previewImg.src = ev.target.result;
      previewBox.style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  if (removeBtn) {
    removeBtn.addEventListener('click', () => resetImagePreview(inputId === 'rl-image' ? 'rl' : 'rf'));
  }
}

function resetImagePreview(prefix) {
  const fileInput  = document.getElementById(prefix + '-image');
  const previewBox = document.getElementById(prefix + '-image-preview');
  const previewImg = document.getElementById(prefix + '-preview-img');
  if (fileInput)  fileInput.value = '';
  if (previewImg) previewImg.src  = '';
  if (previewBox) previewBox.style.display = 'none';
}

/* ============================================================
   CLAIM FORM SUBMIT
   ============================================================ */
function handleClaimSubmit(e) {
  e.preventDefault();
  if (!validateClaimForm()) return;

  const itemId   = document.getElementById('claim-item-id').value;
  const itemName = document.getElementById('claim-modal-item-name').textContent.replace('Claiming: ', '');

  const claim = {
    id:           genId(),
    itemId:       itemId,
    itemName:     itemName,
    studentName:  document.getElementById('claim-student-name').value.trim(),
    studentEmail: document.getElementById('claim-student-email').value.trim(),
    description:  document.getElementById('claim-description').value.trim(),
    identifiers:  document.getElementById('claim-identifiers').value.trim(),
    status:       'Pending',
    dateClaimed:  todayISO(),
  };

  const claims = getClaims();
  claims.push(claim);
  saveData(LS_CLAIMS, claims);

  // Track in my activity
  const my = getMyActivity();
  my.claims.push(claim.id);
  saveData(LS_MY, my);

  updateStats();
  closeModal('claim-modal');
  showToast('Your claim has been submitted successfully! An admin will review it shortly.', 'success');

  // Clear form
  document.getElementById('claim-form').reset();
}

function validateClaimForm() {
  let valid = true;
  const fields = [
    { id: 'claim-student-name',  err: 'claim-name-err',  msg: 'Your name is required.' },
    { id: 'claim-student-email', err: 'claim-email-err', msg: 'A valid email is required.' },
    { id: 'claim-description',   err: 'claim-desc-err',  msg: 'Please explain why this is yours.' },
    { id: 'claim-identifiers',   err: 'claim-id-err',    msg: 'Please provide unique identifiers.' },
  ];
  fields.forEach(f => {
    const el  = document.getElementById(f.id);
    const err = document.getElementById(f.err);
    if (!el || !err) return;
    const val = el.value.trim();
    let msg = '';
    if (!val) {
      msg = f.msg;
    } else if (f.id === 'claim-student-email' && !isValidEmail(val)) {
      msg = 'Please enter a valid email address.';
    }
    if (msg) {
      err.textContent = msg;
      el.classList.add('error');
      valid = false;
    } else {
      err.textContent = '';
      el.classList.remove('error');
    }
  });
  return valid;
}

/* ============================================================
   MY ACTIVITY VIEW
   ============================================================ */
function renderActivity() {
  const my        = getMyActivity();
  const allFound  = getFoundItems();
  const allLost   = getLostItems();
  const allClaims = getClaims();

  // My Lost
  const myLostGrid = document.getElementById('my-lost-grid');
  const myLostItems = allLost.filter(i => my.lost.includes(i.id));
  if (myLostGrid) {
    if (!myLostItems.length) {
      myLostGrid.innerHTML = emptyState('You have not reported any lost items yet.', 'package-search');
    } else {
      myLostGrid.innerHTML = myLostItems.map(item => lostItemCard(item)).join('');
    }
    renderIcons();
    myLostGrid.querySelectorAll('[data-action="view-lost"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const item = allLost.find(i => i.id === id);
        if (item) openItemModal(item, 'lost');
      });
    });
  }

  // My Found
  const myFoundGrid = document.getElementById('my-found-grid');
  const myFoundItems = allFound.filter(i => my.found.includes(i.id));
  if (myFoundGrid) {
    if (!myFoundItems.length) {
      myFoundGrid.innerHTML = emptyState('You have not reported any found items yet.', 'package-check');
    } else {
      myFoundGrid.innerHTML = myFoundItems.map(item => foundItemCard(item)).join('');
    }
    renderIcons();
    myFoundGrid.querySelectorAll('[data-action="view-found"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        const item = allFound.find(i => i.id === id);
        if (item) openItemModal(item, 'found');
      });
    });
  }

  // My Claims
  const myClaimsList = document.getElementById('my-claims-list');
  const myClaims = allClaims.filter(c => my.claims.includes(c.id));
  if (myClaimsList) {
    if (!myClaims.length) {
      myClaimsList.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-secondary)">You have not submitted any claims yet.</div>`;
    } else {
      myClaimsList.innerHTML = myClaims.map(c => claimItemCard(c)).join('');
    }
    renderIcons();
  }

  // My Notifications & Found Matches
  const myNotifContainer = document.getElementById('my-notifications-list');
  if (myNotifContainer) {
    const allNotifs = getNotifications();
    if (!allNotifs.length) {
      myNotifContainer.innerHTML = emptyState('No item match alerts yet.', 'bell-off');
    } else {
      myNotifContainer.innerHTML = allNotifs.map(n => `
        <div class="claim-review-card" style="margin-bottom:12px;">
          <div class="claim-review-header">
            <div>
              <div class="claim-review-title">Item Located: ${escHtml(n.itemName)}</div>
              <div class="claim-review-sub">Finder: <strong>${escHtml(n.finderName)}</strong> (${escHtml(n.finderContact)}) &bull; Owner: <strong>${escHtml(n.ownerName)}</strong></div>
            </div>
            <span class="badge badge-approved">Item Found</span>
          </div>
          <div class="claim-review-body">
            <p><strong>Pickup / Collection Spot:</strong> ${escHtml(n.location)}</p>
            <p style="margin-top:6px;"><strong>Finder's Message:</strong> "${escHtml(n.message)}"</p>
          </div>
        </div>
      `).join('');
    }
    renderIcons();
  }
}

function claimItemCard(c) {
  return `
    <div class="claim-item-card">
      <div class="claim-item-icon"><i data-lucide="file-text"></i></div>
      <div class="claim-item-info">
        <div class="claim-item-name">${escHtml(c.itemName)}</div>
        <div class="claim-item-sub">Claimed on ${formatDate(c.dateClaimed)} &bull; ${escHtml(c.studentEmail)}</div>
        <div class="claim-item-desc">${escHtml(c.description)}</div>
      </div>
      ${statusBadge(c.status)}
    </div>`;
}

function emptyState(msg, icon) {
  return `<div class="empty-state" style="grid-column:1/-1">
    <i data-lucide="${icon}"></i>
    <h3>Nothing here yet</h3>
    <p>${escHtml(msg)}</p>
  </div>`;
}

/* ============================================================
   ADMIN VIEW
   ============================================================ */
function renderAdmin() {
  updateStats();
  renderAdminFoundTable();
  renderAdminLostTable();
  renderAdminPendingClaims();
  renderAdminAllClaims();
}

function renderAdminFoundTable() {
  const tbody = document.getElementById('admin-found-tbody');
  if (!tbody) return;
  const items = getFoundItems();
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-secondary)">No found items.</td></tr>`;
    return;
  }
  tbody.innerHTML = items.map(item => `
    <tr>
      <td><strong>${escHtml(item.name)}</strong></td>
      <td>${categoryBadge(item.category)}</td>
      <td>${escHtml(item.location)}</td>
      <td>${formatDate(item.dateFound)}</td>
      <td>${escHtml(item.finderName)}</td>
      <td>${statusBadge(item.status)}</td>
      <td>
        <div class="admin-action-btns">
          ${item.status !== 'Returned' ? `<button class="btn btn-success" data-action="mark-returned" data-id="${escHtml(item.id)}">Mark Returned</button>` : ''}
          <button class="btn btn-danger" data-action="delete-found" data-id="${escHtml(item.id)}">Delete</button>
        </div>
      </td>
    </tr>`).join('');
  renderIcons();

  tbody.querySelectorAll('[data-action="mark-returned"]').forEach(btn => {
    btn.addEventListener('click', () => markReturned(btn.dataset.id));
  });
  tbody.querySelectorAll('[data-action="delete-found"]').forEach(btn => {
    btn.addEventListener('click', () => deleteListing(btn.dataset.id, 'found'));
  });
}

function renderAdminLostTable() {
  const tbody = document.getElementById('admin-lost-tbody');
  if (!tbody) return;
  const items = getLostItems();
  if (!items.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--text-secondary)">No lost items.</td></tr>`;
    return;
  }
  tbody.innerHTML = items.map(item => `
    <tr>
      <td><strong>${escHtml(item.name)}</strong></td>
      <td>${categoryBadge(item.category)}</td>
      <td>${escHtml(item.lastSeen)}</td>
      <td>${formatDate(item.dateLost)}</td>
      <td>${escHtml(item.ownerName)}</td>
      <td>${statusBadge(item.status)}</td>
      <td>
        <div class="admin-action-btns">
          <button class="btn btn-danger" data-action="delete-lost" data-id="${escHtml(item.id)}">Delete</button>
        </div>
      </td>
    </tr>`).join('');
  renderIcons();

  tbody.querySelectorAll('[data-action="delete-lost"]').forEach(btn => {
    btn.addEventListener('click', () => deleteListing(btn.dataset.id, 'lost'));
  });
}

function renderAdminPendingClaims() {
  const container = document.getElementById('admin-pending-claims-list');
  if (!container) return;
  const pending = getClaims().filter(c => c.status === 'Pending');
  if (!pending.length) {
    container.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-secondary)">No pending claims right now.</div>`;
    return;
  }
  container.innerHTML = pending.map(c => `
    <div class="claim-review-card">
      <div class="claim-review-header">
        <div>
          <div class="claim-review-title">${escHtml(c.itemName)}</div>
          <div class="claim-review-sub">Claimant: <strong>${escHtml(c.studentName)}</strong> (${escHtml(c.studentEmail)}) &bull; Claimed on ${formatDate(c.dateClaimed)}</div>
        </div>
        ${statusBadge(c.status)}
      </div>
      <div class="claim-review-body">
        <p><strong>Reason:</strong> ${escHtml(c.description)}</p>
        <p style="margin-top:6px"><strong>Identifiers:</strong> ${escHtml(c.identifiers)}</p>
      </div>
      <div class="claim-review-actions">
        <button class="btn btn-success" data-action="approve-claim" data-id="${escHtml(c.id)}" data-item-id="${escHtml(c.itemId)}">
          <i data-lucide="check"></i> Approve
        </button>
        <button class="btn btn-danger" data-action="reject-claim" data-id="${escHtml(c.id)}">
          <i data-lucide="x"></i> Reject
        </button>
      </div>
    </div>`).join('');
  renderIcons();

  container.querySelectorAll('[data-action="approve-claim"]').forEach(btn => {
    btn.addEventListener('click', () => approveClaim(btn.dataset.id, btn.dataset.itemId));
  });
  container.querySelectorAll('[data-action="reject-claim"]').forEach(btn => {
    btn.addEventListener('click', () => rejectClaim(btn.dataset.id));
  });
}

function renderAdminAllClaims() {
  const tbody = document.getElementById('admin-claims-tbody');
  if (!tbody) return;
  const claims = getClaims();
  if (!claims.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:24px;color:var(--text-secondary)">No claims yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = claims.map(c => `
    <tr>
      <td style="font-size:.75rem;color:var(--text-secondary)">${escHtml(c.id.substr(0, 16))}…</td>
      <td><strong>${escHtml(c.itemName)}</strong></td>
      <td>${escHtml(c.studentName)}<br><span style="font-size:.75rem;color:var(--text-secondary)">${escHtml(c.studentEmail)}</span></td>
      <td>${formatDate(c.dateClaimed)}</td>
      <td>${statusBadge(c.status)}</td>
    </tr>`).join('');
  renderIcons();
}

/* ============================================================
   ADMIN ACTIONS
   ============================================================ */
function approveClaim(claimId, itemId) {
  const claims = getClaims();
  const claim  = claims.find(c => c.id === claimId);
  if (!claim) return;
  claim.status = 'Approved';
  saveData(LS_CLAIMS, claims);

  // Update the linked found item status to 'Claimed'
  const foundItems = getFoundItems();
  const item = foundItems.find(i => i.id === itemId);
  if (item) {
    item.status = 'Claimed';
    saveData(LS_FOUND, foundItems);
  }

  updateStats();
  renderAdmin();
  showToast(`Claim approved for "${claim.itemName}".`, 'success');
}

function rejectClaim(claimId) {
  const claims = getClaims();
  const claim  = claims.find(c => c.id === claimId);
  if (!claim) return;
  claim.status = 'Rejected';
  saveData(LS_CLAIMS, claims);

  updateStats();
  renderAdmin();
  showToast(`Claim rejected for "${claim.itemName}".`, 'info');
}

function markReturned(itemId) {
  const foundItems = getFoundItems();
  const item = foundItems.find(i => i.id === itemId);
  if (!item) return;
  if (!confirm(`Mark "${item.name}" as Returned? This action cannot be undone.`)) return;

  item.status = 'Returned';
  saveData(LS_FOUND, foundItems);

  updateStats();
  renderAdmin();
  showToast(`"${item.name}" has been marked as Returned.`, 'success');
}

function deleteListing(itemId, type) {
  const isFound = type === 'found';
  const items   = isFound ? getFoundItems() : getLostItems();
  const item    = items.find(i => i.id === itemId);
  if (!item) return;
  if (!confirm(`Delete listing for "${item.name}"? This cannot be undone.`)) return;

  const updated = items.filter(i => i.id !== itemId);
  saveData(isFound ? LS_FOUND : LS_LOST, updated);

  updateStats();
  renderAdmin();
  showToast(`"${item.name}" listing deleted.`, 'info');
}

/* ============================================================
   TABS
   ============================================================ */
function setupTabs(containerSelector) {
  const containers = document.querySelectorAll(containerSelector);
  containers.forEach(container => {
    const buttons  = container.querySelectorAll('.tab-btn');
    const contents = container.querySelectorAll('.tab-content');

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        buttons.forEach(b  => b.classList.remove('active'));
        contents.forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        const targetContent = document.getElementById('tab-' + target);
        if (targetContent) targetContent.classList.add('active');
      });
    });
  });
}

/* ============================================================
   UTILITY HELPERS
   ============================================================ */
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = dateStr.includes('T') ? new Date(dateStr) : new Date(dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ============================================================
   GLOBAL ROLE SWITCH & LOGIN HANDLERS (Direct & Fail-Safe)
   ============================================================ */
window.switchLoginRole = function(role) {
  const tabStudent   = document.getElementById('tab-student');
  const tabAdmin     = document.getElementById('tab-admin');
  const panelStudent = document.getElementById('panel-student');
  const panelAdmin   = document.getElementById('panel-admin');

  if (role === 'admin') {
    if (tabAdmin) tabAdmin.classList.add('active');
    if (tabStudent) tabStudent.classList.remove('active');
    if (panelAdmin) panelAdmin.classList.add('active');
    if (panelStudent) panelStudent.classList.remove('active');
  } else {
    if (tabStudent) tabStudent.classList.add('active');
    if (tabAdmin) tabAdmin.classList.remove('active');
    if (panelStudent) panelStudent.classList.add('active');
    if (panelAdmin) panelAdmin.classList.remove('active');
  }
  renderIcons();
};

window.quickLogin = function(role) {
  if (role === 'admin') {
    loginUser('admin', 'Campus Security Admin', 'security.admin@college.edu');
  } else {
    loginUser('student', 'Rahul Sharma', 'rahul.sharma@college.edu');
  }
};

window.submitStudentLogin = function() {
  const emailInput = document.getElementById('student-email');
  const email = (emailInput && emailInput.value.trim()) || 'rahul.sharma@college.edu';
  loginUser('student', 'Rahul Sharma', email);
};

window.submitAdminLogin = function() {
  const emailInput = document.getElementById('admin-email');
  const email = (emailInput && emailInput.value.trim()) || 'security.admin@college.edu';
  loginUser('admin', 'Campus Security Admin', email);
};

window.loginUser = loginUser;
window.logoutUser = logoutUser;
window.navigateTo = navigateTo;

/* ============================================================
   GLOBAL EVENT LISTENERS
   ============================================================ */
function setupEventListeners() {

  // Logo click -> Home
  const logo = document.getElementById('nav-brand-logo');
  if (logo) {
    logo.addEventListener('click', () => navigateTo('home'));
  }

  // Nav links (all [data-view] elements)
  document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-view]');
    if (!link) return;
    e.preventDefault();
    navigateTo(link.dataset.view);
  });

  // Mobile Topbar Toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  if (mobileBtn) mobileBtn.addEventListener('click', toggleMobileMenu);

  // Logout Button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);

  // Login Tabs Switcher
  const tabStudent = document.getElementById('tab-student');
  const tabAdmin   = document.getElementById('tab-admin');
  if (tabStudent) tabStudent.addEventListener('click', () => window.switchLoginRole('student'));
  if (tabAdmin)   tabAdmin.addEventListener('click', () => window.switchLoginRole('admin'));

  // Student Login Form Submit
  const studentForm = document.getElementById('student-login-form');
  if (studentForm) {
    studentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.submitStudentLogin();
    });
  }

  // Admin Login Form Submit
  const adminForm = document.getElementById('admin-login-form');
  if (adminForm) {
    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      window.submitAdminLogin();
    });
  }

  // Quick 1-Click Logins
  const btnQuickStudent = document.getElementById('btn-quick-student');
  if (btnQuickStudent) {
    btnQuickStudent.addEventListener('click', () => window.quickLogin('student'));
  }

  const btnQuickAdmin = document.getElementById('btn-quick-admin');
  if (btnQuickAdmin) {
    btnQuickAdmin.addEventListener('click', () => window.quickLogin('admin'));
  }

  // Home search
  const homeSearchBtn = document.getElementById('home-search-btn');
  const homeSearchInput = document.getElementById('home-search-input');
  if (homeSearchBtn && homeSearchInput) {
    homeSearchBtn.addEventListener('click', () => {
      navigateTo('found', homeSearchInput.value.trim());
    });
    homeSearchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        navigateTo('found', e.target.value.trim());
      }
    });
  }

  // Found items search/filter live
  const foundSearch = document.getElementById('found-search');
  const foundCat    = document.getElementById('found-category-filter');
  if (foundSearch) foundSearch.addEventListener('input', () => renderFoundItems(foundSearch.value, foundCat ? foundCat.value : ''));
  if (foundCat)    foundCat.addEventListener('change', () => renderFoundItems(foundSearch ? foundSearch.value : '', foundCat.value));

  // Lost items search/filter live
  const lostSearch = document.getElementById('lost-search');
  const lostCat    = document.getElementById('lost-category-filter');
  if (lostSearch) lostSearch.addEventListener('input', () => renderLostItems(lostSearch.value, lostCat ? lostCat.value : ''));
  if (lostCat)    lostCat.addEventListener('change', () => renderLostItems(lostSearch ? lostSearch.value : '', lostCat.value));

  // Report Lost form
  const rlForm = document.getElementById('report-lost-form');
  if (rlForm) rlForm.addEventListener('submit', handleReportLostSubmit);
  const rlResetBtn = document.getElementById('rl-reset-btn');
  if (rlResetBtn && rlForm) {
    rlResetBtn.addEventListener('click', () => {
      rlForm.reset();
      resetImagePreview('rl');
      rlForm.querySelectorAll('.field-error').forEach(el => el.textContent = '');
      rlForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    });
  }

  // Report Found form
  const rfForm = document.getElementById('report-found-form');
  if (rfForm) rfForm.addEventListener('submit', handleReportFoundSubmit);
  const rfResetBtn = document.getElementById('rf-reset-btn');
  if (rfResetBtn && rfForm) {
    rfResetBtn.addEventListener('click', () => {
      rfForm.reset();
      resetImagePreview('rf');
      rfForm.querySelectorAll('.field-error').forEach(el => el.textContent = '');
      rfForm.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    });
  }

  // Image upload
  setupImageUpload('rl-image', 'rl-image-preview', 'rl-preview-img', 'rl-remove-preview');
  setupImageUpload('rf-image', 'rf-image-preview', 'rf-preview-img', 'rf-remove-preview');

  // Claim form
  const claimForm = document.getElementById('claim-form');
  if (claimForm) claimForm.addEventListener('submit', handleClaimSubmit);
  const claimCancelBtn = document.getElementById('claim-cancel-btn');
  if (claimCancelBtn) claimCancelBtn.addEventListener('click', () => closeModal('claim-modal'));

  // Notify Owner form (I Found This Item)
  const notifyForm = document.getElementById('notify-owner-form');
  if (notifyForm) notifyForm.addEventListener('submit', handleNotifyOwnerSubmit);
  const notifyCancel = document.getElementById('notify-cancel-btn');
  if (notifyCancel) notifyCancel.addEventListener('click', () => closeModal('notify-owner-modal'));
  const notifyClose = document.getElementById('notify-modal-close');
  if (notifyClose) notifyClose.addEventListener('click', () => closeModal('notify-owner-modal'));

  // Notification Bell Toggle
  const bellBtn = document.getElementById('btn-notification-bell');
  const notifDropdown = document.getElementById('notification-dropdown');
  if (bellBtn && notifDropdown) {
    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('open');
      // Mark as read
      const notifs = getNotifications();
      let updated = false;
      notifs.forEach(n => {
        if (!n.read) { n.read = true; updated = true; }
      });
      if (updated) {
        saveData(LS_NOTIFS, notifs);
        const badge = document.getElementById('bell-badge');
        if (badge) badge.style.display = 'none';
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#notification-bell-wrap')) {
        notifDropdown.classList.remove('open');
      }
    });
  }

  // Modal close buttons
  const itemModalClose = document.getElementById('item-modal-close');
  if (itemModalClose) itemModalClose.addEventListener('click', () => closeModal('item-modal'));
  const claimModalClose = document.getElementById('claim-modal-close');
  if (claimModalClose) claimModalClose.addEventListener('click', () => closeModal('claim-modal'));

  // Close modals on overlay click
  const itemModal = document.getElementById('item-modal');
  if (itemModal) {
    itemModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal('item-modal');
    });
  }
  const claimModal = document.getElementById('claim-modal');
  if (claimModal) {
    claimModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal('claim-modal');
    });
  }
  const notifyModal = document.getElementById('notify-owner-modal');
  if (notifyModal) {
    notifyModal.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeModal('notify-owner-modal');
    });
  }

  // Close modals on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal('item-modal');
      closeModal('claim-modal');
      closeModal('notify-owner-modal');
      if (notifDropdown) notifDropdown.classList.remove('open');
    }
  });

  // "View All" links on home
  document.querySelectorAll('.view-all-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.view);
    });
  });

  // Admin Reset Demo Data
  const resetBtn = document.getElementById('admin-reset-data-btn');
  if (resetBtn) resetBtn.addEventListener('click', resetData);

  // Set default dates for report forms to today
  const today = new Date().toISOString().split('T')[0];
  const rlDate = document.getElementById('rl-date');
  if (rlDate && !rlDate.value) rlDate.value = today;
  const rfDate = document.getElementById('rf-date');
  if (rfDate && !rfDate.value) rfDate.value = today;

  // Setup tabs
  setupTabs('.tabs-container');
}

/* ============================================================
   INIT BOOTSTRAPPER (Immediate or DOMContentLoaded Safe)
   ============================================================ */
function boot() {
  try {
    // 1. Seed localStorage if empty
    initData();

    // 2. Set up all event listeners
    setupEventListeners();

    // 3. Init icons
    renderIcons();

    // 4. Update Notifications Bell UI
    updateNotificationsUI();

    // 5. Check user session & route to login page or portal
    const user = getCurrentUser();
    if (user) {
      applyUserSession(user);
      navigateTo(user.role === 'admin' ? 'admin' : 'home');
    } else {
      applyUserSession(null);
    }

    // 6. Update all stats
    updateStats();
  } catch (err) {
    console.error('CampusFind boot error:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
