// Cached DOM lookups for the admin dashboard sections and templates.
const pendingList = document.getElementById('pending-list');
const allList = document.getElementById('all-list');
const userList = document.getElementById('user-list');
const reportList = document.getElementById('report-list');
const adTemplate = document.getElementById('ad-row-template');
const userTemplate = document.getElementById('user-row-template');
const reportTemplate = document.getElementById('report-row-template');
const loginStatus = document.getElementById('admin-login-status');
const categoryFilter = document.getElementById('admin-filter-category');
const subcategoryFilter = document.getElementById('admin-filter-subcategory');

// Basic auth storage and shared state used throughout this file.
const STORAGE_KEY = 'speedlist:admin-basic';
const APP_BASE_PATH = '/';
let categoryTree = [];
let allAdsData = [];

// Prefix helper that keeps API calls working when the app is mounted under a subpath.
function withBase(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return APP_BASE_PATH === '/' ? normalized : `${APP_BASE_PATH}${normalized}`;
}

// Ensure the category tree is loaded once and cached for later dropdown rendering.
async function ensureCategoryTree() {
  if (categoryTree.length) return categoryTree;
  try {
    const res = await fetch(withBase('/api/categories'));
    const data = await res.json();
    categoryTree = Array.isArray(data.categories) ? data.categories : [];
  } catch (error) {
    console.error('Failed to load categories', error);
    categoryTree = [];
  }
  return categoryTree;
}

// Return the list of subcategories for the provided category name.
function getSubcategoriesFor(categoryName) {
  const normalized = (categoryName || '').trim();
  if (!normalized) return [];
  const found = categoryTree.find((entry) => entry.name === normalized);
  return found?.subcategories || [];
}

// Build a <select> option list for categories, preserving an already-selected value.
function buildCategoryOptions(selectedCategory, placeholder = 'Select category') {
  const options = [`<option value="">${placeholder}</option>`];
  const selected = (selectedCategory || '').trim();

  categoryTree.forEach((entry) => {
    const isSelected = entry.name === selected;
    options.push(`<option value="${entry.name}" ${isSelected ? 'selected' : ''}>${entry.name}</option>`);
  });

  if (selected && !categoryTree.some((entry) => entry.name === selected)) {
    options.push(`<option value="${selected}" selected>${selected}</option>`);
  }

  return options.join('');
}

// Build a <select> option list for subcategories relative to a category.
function buildSubcategoryOptions(categoryName, selectedSubcategory, placeholder = 'Select subcategory') {
  const options = [`<option value="">${placeholder}</option>`];
  const selected = (selectedSubcategory || '').trim();
  const subcategories = getSubcategoriesFor(categoryName);

  subcategories.forEach((subcat) => {
    const isSelected = subcat === selected;
    options.push(`<option value="${subcat}" ${isSelected ? 'selected' : ''}>${subcat}</option>`);
  });

  if (selected && !subcategories.includes(selected)) {
    options.push(`<option value="${selected}" selected>${selected}</option>`);
  }

  return options.join('');
}

// Load credentials from localStorage if they were previously saved.
function getCredentials() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (err) {
    return null;
  }
}

// Persist the admin credentials locally for subsequent requests.
function saveCredentials(username, password) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ username, password }));
  loginStatus.textContent = 'Credentials saved locally';
}

// Construct a Basic-auth header for backend requests when credentials exist.
function authHeaders() {
  const creds = getCredentials();
  if (!creds) return {};
  const token = btoa(`${creds.username}:${creds.password}`);
  return { Authorization: `Basic ${token}` };
}

// Thin wrapper around fetch that automatically includes auth headers and JSON parsing.
async function apiFetch(url, options = {}) {
  const headers = Object.assign({}, options.headers || {}, authHeaders(), {
    'Content-Type': 'application/json'
  });

  const response = await fetch(withBase(url), { ...options, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

// Deterministic sort to keep ad listings predictable in the admin UI.
function sortAdsAlphabetically(ads = []) {
  return ads.slice().sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
}

// Alphabetical sorting for user lists.
function sortUsersAlphabetically(users = []) {
  return users.slice().sort((a, b) => (a.email || '').localeCompare(b.email || '', undefined, { sensitivity: 'base' }));
}

// Apply category/subcategory filters to the "All ads" panel.
function applyAllAdsFilter() {
  if (!allList) return;

  const selectedCategory = (categoryFilter?.value || '').trim();
  const selectedSubcategory = (subcategoryFilter?.value || '').trim();

  allList.innerHTML = '';

  if (!allAdsData.length) {
    allList.innerHTML = '<p class="admin-hint">No ads found.</p>';
    return;
  }

  const filteredAds = allAdsData.filter((ad) => {
    const matchesCategory = selectedCategory ? ad.category === selectedCategory : true;
    const matchesSubcategory = selectedSubcategory ? ad.subcategory === selectedSubcategory : true;
    return matchesCategory && matchesSubcategory;
  });

  if (!filteredAds.length) {
    allList.innerHTML = '<p class="admin-hint">No ads found for selected filters.</p>';
    return;
  }

  filteredAds.forEach((ad) => renderAdRow(allList, ad));
}

// Initialize the category + subcategory dropdowns and keep them in sync.
function initializeFilters() {
  if (!categoryFilter || !subcategoryFilter) return;

  categoryFilter.innerHTML = buildCategoryOptions(categoryFilter.value, 'All categories');
  subcategoryFilter.innerHTML = buildSubcategoryOptions(categoryFilter.value, subcategoryFilter.value, 'All subcategories');

  categoryFilter.addEventListener('change', () => {
    subcategoryFilter.innerHTML = buildSubcategoryOptions(categoryFilter.value, '', 'All subcategories');
    applyAllAdsFilter();
  });

  subcategoryFilter.addEventListener('change', applyAllAdsFilter);
}

// Clone an ad template row, wire up its events, and insert it into the DOM.
function renderAdRow(container, ad) {
  const node = adTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.id = ad.id;
  node.querySelector('.admin-row-title').textContent = `${ad.title || '(no title)'}`;
  const categoryLabel = [ad.category, ad.subcategory].filter(Boolean).join(' / ') || 'Uncategorized';
  node.querySelector('.admin-row-meta').textContent = `ID ${ad.id} • ${categoryLabel} • ${ad.location || 'Unknown'} • ${
    ad.approved ? 'Approved' : 'Pending'
  }`;
  node.querySelector('.admin-row-description').value = ad.description || '';
  const categorySelect = node.querySelector('.admin-field-category');
  const subcategorySelect = node.querySelector('.admin-field-subcategory');

  if (categorySelect) {
    categorySelect.innerHTML = buildCategoryOptions(ad.category);
  }
  if (subcategorySelect) {
    subcategorySelect.innerHTML = buildSubcategoryOptions(ad.category, ad.subcategory);
  }

  if (categorySelect && subcategorySelect) {
    categorySelect.addEventListener('change', (event) => {
      subcategorySelect.innerHTML = buildSubcategoryOptions(event.target.value, '');
    });
  }
  node.querySelector('.admin-field-location').value = ad.location || '';
  node.querySelector('.admin-field-price').value = ad.price ?? '';
  node.querySelector('.admin-field-phone').value = ad.contact_phone || '';
  node.querySelector('.admin-field-email').value = ad.contact_email || '';
  node.querySelector('.admin-field-approved').checked = !!ad.approved;

  node.querySelector('.admin-btn-approve').addEventListener('click', async () => {
    await updateApproval(ad.id, true);
  });
  node.querySelector('.admin-btn-reject').addEventListener('click', async () => {
    await updateApproval(ad.id, false);
  });
  node.querySelector('.admin-btn-save').addEventListener('click', async () => {
    const payload = {
      title: node.querySelector('.admin-row-title').textContent,
      description: node.querySelector('.admin-row-description').value,
      category: node.querySelector('.admin-field-category').value,
      subcategory: node.querySelector('.admin-field-subcategory').value,
      location: node.querySelector('.admin-field-location').value,
      price: node.querySelector('.admin-field-price').value,
      contact_phone: node.querySelector('.admin-field-phone').value,
      contact_email: node.querySelector('.admin-field-email').value,
      approved: node.querySelector('.admin-field-approved').checked
    };
    await updateAd(ad.id, payload);
  });

  container.appendChild(node);
}

// Render a single user entry and wire up its save/activate actions.
function renderUserRow(container, user) {
  const node = userTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.id = user.id;
  node.querySelector('.admin-row-title').textContent = user.email;
  const statusParts = [user.verified ? 'Verified' : 'Unverified', user.disabled ? 'Disabled' : 'Active'];
  node.querySelector('.admin-row-meta').textContent = `ID ${user.id} • ${statusParts.join(' • ')} • Created ${new Date(
    user.created_at
  ).toLocaleString()}`;
  node.querySelector('.admin-user-email').value = user.email;
  node.querySelector('.admin-user-password').value = '';
  node.querySelector('.admin-user-verified').checked = !!user.verified;
  node.querySelector('.admin-user-active').checked = !user.disabled;

  node.querySelector('.admin-btn-user-save').addEventListener('click', async () => {
    const payload = {
      email: node.querySelector('.admin-user-email').value,
      password: node.querySelector('.admin-user-password').value || undefined,
      verified: node.querySelector('.admin-user-verified').checked,
      disabled: !node.querySelector('.admin-user-active').checked
    };
    await apiFetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    await loadUsers();
  });

  node.querySelector('.admin-btn-user-activate').addEventListener('click', async () => {
    await apiFetch(`/api/admin/users/${user.id}/activate`, { method: 'POST' });
    await loadUsers();
  });

  container.appendChild(node);
}

// Render a visitor-submitted report and optionally link back to the ad.
function renderReportRow(container, report) {
  const node = reportTemplate.content.firstElementChild.cloneNode(true);
  const adTitle = report.ad?.title || '(Ad not found)';
  const adCategory = [report.ad?.category, report.ad?.subcategory].filter(Boolean).join(' / ') || 'Uncategorized';
  const adLocation = report.ad?.location || 'Unknown';
  const createdAt = new Date(report.created_at).toLocaleString();

  node.querySelector('.admin-report-title').textContent = `${adTitle}`;
  node.querySelector(
    '.admin-report-meta'
  ).textContent = `Report ${report.id} • Ad ID ${report.ad_id} • ${adCategory} • ${adLocation} • ${createdAt}`;
  node.querySelector('.admin-report-reason').textContent = report.reason || '(No reason provided)';

  const link = node.querySelector('.admin-report-link');
  if (link) {
    link.href = report.ad ? withBase(`/?ad=${report.ad_id}`) : '#';
    link.textContent = report.ad ? 'Open ad' : 'Ad unavailable';
    link.setAttribute('aria-disabled', report.ad ? 'false' : 'true');
    if (!report.ad) {
      link.addEventListener('click', (event) => event.preventDefault());
    }
  }

  container.appendChild(node);
}

// Toggle an ad's approval state and refresh the lists to reflect the change.
async function updateApproval(id, approved) {
  const path = approved ? `/api/admin/ads/${id}/approve` : `/api/admin/ads/${id}/reject`;
  await apiFetch(path, { method: 'POST' });
  await Promise.all([loadPendingAds(), loadAllAds()]);
}

// Patch an ad with arbitrary fields then refresh both ad lists.
async function updateAd(id, payload) {
  await apiFetch(`/api/admin/ads/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  await Promise.all([loadPendingAds(), loadAllAds()]);
}

// Fetch ads waiting for moderation and render them in the pending list.
async function loadPendingAds() {
  pendingList.innerHTML = '<p class="admin-hint">Loading…</p>';
  try {
    const { ads } = await apiFetch('/api/admin/ads?status=pending');
    const sorted = sortAdsAlphabetically(ads);
    pendingList.innerHTML = '';
    if (!sorted.length) {
      pendingList.innerHTML = '<p class="admin-hint">No pending ads.</p>';
      return;
    }
    sorted.forEach((ad) => renderAdRow(pendingList, ad));
  } catch (err) {
    pendingList.innerHTML = `<p class="admin-error">${err.message}</p>`;
  }
}

// Load every ad regardless of approval state and apply UI filters.
async function loadAllAds() {
  allList.innerHTML = '<p class="admin-hint">Loading…</p>';
  try {
    const { ads } = await apiFetch('/api/admin/ads?status=all');
    allAdsData = sortAdsAlphabetically(ads);
    applyAllAdsFilter();
  } catch (err) {
    allList.innerHTML = `<p class="admin-error">${err.message}</p>`;
  }
}

// Retrieve and render registered users for account maintenance.
async function loadUsers() {
  userList.innerHTML = '<p class="admin-hint">Loading…</p>';
  try {
    const { users } = await apiFetch('/api/admin/users');
    const sorted = sortUsersAlphabetically(users);
    userList.innerHTML = '';
    if (!sorted.length) {
      userList.innerHTML = '<p class="admin-hint">No users registered.</p>';
      return;
    }
    sorted.forEach((user) => renderUserRow(userList, user));
  } catch (err) {
    userList.innerHTML = `<p class="admin-error">${err.message}</p>`;
  }
}

// Prefill the credential inputs if the moderator saved them previously.
function restoreCredentials() {
  const creds = getCredentials();
  if (creds) {
    document.getElementById('admin-username').value = creds.username || '';
    document.getElementById('admin-password').value = creds.password || '';
  }
}

// Wire up top-level buttons that drive the admin panel.
function setupListeners() {
  document.getElementById('admin-login-btn').addEventListener('click', () => {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    if (!username || !password) {
      loginStatus.textContent = 'Username and password are required';
      return;
    }
    saveCredentials(username, password);
    loadEverything();
  });

  document.getElementById('refresh-pending').addEventListener('click', loadPendingAds);
  document.getElementById('refresh-all').addEventListener('click', loadAllAds);
  document.getElementById('refresh-users').addEventListener('click', loadUsers);
  document.getElementById('refresh-reports').addEventListener('click', loadReports);
}

// Load taxonomy and all primary datasets the admin panel needs.
async function loadEverything() {
  await ensureCategoryTree();
  initializeFilters();
  await Promise.all([loadPendingAds(), loadAllAds(), loadUsers(), loadReports()]);
}

// Fetch visitor reports and render the list.
async function loadReports() {
  reportList.innerHTML = '<p class="admin-hint">Loading…</p>';
  try {
    const { reports } = await apiFetch('/api/admin/reports');
    reportList.innerHTML = '';
    if (!reports.length) {
      reportList.innerHTML = '<p class="admin-hint">No reports.</p>';
      return;
    }
    reports.forEach((report) => renderReportRow(reportList, report));
  } catch (err) {
    reportList.innerHTML = `<p class="admin-error">${err.message}</p>`;
  }
}

restoreCredentials();
setupListeners();
loadEverything();
