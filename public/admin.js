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

const STORAGE_KEY = 'speedlist:admin-basic';
const APP_BASE_PATH = '/';
let categoryTree = [];
let allAdsData = [];

function withBase(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return APP_BASE_PATH === '/' ? normalized : `${APP_BASE_PATH}${normalized}`;
}

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

function getSubcategoriesFor(categoryName) {
  const normalized = (categoryName || '').trim();
  if (!normalized) return [];
  const found = categoryTree.find((entry) => entry.name === normalized);
  return found?.subcategories || [];
}

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

function getCredentials() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (err) {
    return null;
  }
}

function saveCredentials(username, password) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ username, password }));
  loginStatus.textContent = 'Credentials saved locally';
}

function authHeaders() {
  const creds = getCredentials();
  if (!creds) return {};
  const token = btoa(`${creds.username}:${creds.password}`);
  return { Authorization: `Basic ${token}` };
}

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

function sortAdsAlphabetically(ads = []) {
  return ads.slice().sort((a, b) => (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' }));
}

function sortUsersAlphabetically(users = []) {
  return users.slice().sort((a, b) => (a.email || '').localeCompare(b.email || '', undefined, { sensitivity: 'base' }));
}

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

  node.querySelector('.admin-btn-delete')?.addEventListener('click', async () => {
    const confirmed = confirm('Delete this ad permanently?');
    if (!confirmed) return;
    await deleteAd(ad.id);
  });

  container.appendChild(node);
}

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

  node.querySelector('.admin-btn-user-delete')?.addEventListener('click', async () => {
    const confirmed = confirm('Delete this user and their ads?');
    if (!confirmed) return;
    await deleteUser(user.id);
  });

  container.appendChild(node);
}

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

async function updateApproval(id, approved) {
  const path = approved ? `/api/admin/ads/${id}/approve` : `/api/admin/ads/${id}/reject`;
  await apiFetch(path, { method: 'POST' });
  await Promise.all([loadPendingAds(), loadAllAds()]);
}

async function updateAd(id, payload) {
  await apiFetch(`/api/admin/ads/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  await Promise.all([loadPendingAds(), loadAllAds()]);
}

async function deleteAd(id) {
  await apiFetch(`/api/admin/ads/${id}`, { method: 'DELETE' });
  await Promise.all([loadPendingAds(), loadAllAds(), loadReports()]);
}

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

async function deleteUser(id) {
  await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' });
  await Promise.all([loadUsers(), loadPendingAds(), loadAllAds(), loadReports()]);
}

function restoreCredentials() {
  const creds = getCredentials();
  if (creds) {
    document.getElementById('admin-username').value = creds.username || '';
    document.getElementById('admin-password').value = creds.password || '';
  }
}

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

async function loadEverything() {
  await ensureCategoryTree();
  initializeFilters();
  await Promise.all([loadPendingAds(), loadAllAds(), loadUsers(), loadReports()]);
}

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
