const pendingList = document.getElementById('pending-list');
const allList = document.getElementById('all-list');
const userList = document.getElementById('user-list');
const reportList = document.getElementById('report-list');
const adTemplate = document.getElementById('ad-row-template');
const userTemplate = document.getElementById('user-row-template');
const reportTemplate = document.getElementById('report-row-template');
const loginStatus = document.getElementById('admin-login-status');

const STORAGE_KEY = 'speedlist:admin-basic';
const PAGE_SIZE = 8;
const listState = {
  pending: { items: [], page: 1 },
  all: { items: [], page: 1 },
  users: { items: [], page: 1 },
  reports: { items: [], page: 1 }
};

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

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

function renderAdRow(container, ad) {
  const node = adTemplate.content.firstElementChild.cloneNode(true);
  node.dataset.id = ad.id;
  node.querySelector('.admin-row-title').textContent = `${ad.title || '(no title)'}`;
  node.querySelector('.admin-row-meta').textContent = `ID ${ad.id} • ${ad.category || 'Uncategorized'} • ${
    ad.location || 'Unknown'
  } • ${ad.approved ? 'Approved' : 'Pending'}`;
  node.querySelector('.admin-row-description').value = ad.description || '';
  node.querySelector('.admin-field-category').value = ad.category || '';
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

  container.appendChild(node);
}

function renderReportRow(container, report) {
  const node = reportTemplate.content.firstElementChild.cloneNode(true);
  const adTitle = report.ad?.title || '(Ad not found)';
  const adCategory = report.ad?.category || 'Uncategorized';
  const adLocation = report.ad?.location || 'Unknown';
  const createdAt = new Date(report.created_at).toLocaleString();

  node.querySelector('.admin-report-title').textContent = `${adTitle}`;
  node.querySelector(
    '.admin-report-meta'
  ).textContent = `Report ${report.id} • Ad ID ${report.ad_id} • ${adCategory} • ${adLocation} • ${createdAt}`;
  node.querySelector('.admin-report-reason').textContent = report.reason || '(No reason provided)';

  const link = node.querySelector('.admin-report-link');
  if (link) {
    link.href = report.ad ? `/?ad=${report.ad_id}` : '#';
    link.textContent = report.ad ? 'Open ad' : 'Ad unavailable';
    link.setAttribute('aria-disabled', report.ad ? 'false' : 'true');
    if (!report.ad) {
      link.addEventListener('click', (event) => event.preventDefault());
    }
  }

  container.appendChild(node);
}

function renderPaginationControls(listKey, container, renderer, emptyMessage) {
  const totalPages = Math.max(1, Math.ceil(listState[listKey].items.length / PAGE_SIZE));
  const currentPage = Math.min(listState[listKey].page || 1, totalPages);
  listState[listKey].page = currentPage;

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = listState[listKey].items.slice(start, start + PAGE_SIZE);

  container.innerHTML = '';

  if (!pageItems.length) {
    container.innerHTML = `<p class="admin-hint">${emptyMessage}</p>`;
    return;
  }

  const listWrapper = document.createElement('div');
  listWrapper.className = 'admin-page-items';
  pageItems.forEach((item) => renderer(listWrapper, item));
  container.appendChild(listWrapper);

  if (totalPages > 1) {
    const pagination = document.createElement('div');
    pagination.className = 'admin-pagination';

    const prev = document.createElement('button');
    prev.textContent = 'Previous';
    prev.className = 'admin-secondary';
    prev.disabled = currentPage === 1;
    prev.addEventListener('click', () => {
      listState[listKey].page = Math.max(1, listState[listKey].page - 1);
      renderPaginationControls(listKey, container, renderer, emptyMessage);
    });

    const indicator = document.createElement('span');
    indicator.textContent = `Page ${currentPage} of ${totalPages}`;

    const next = document.createElement('button');
    next.textContent = 'Next';
    next.className = 'admin-secondary';
    next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => {
      listState[listKey].page = Math.min(totalPages, listState[listKey].page + 1);
      renderPaginationControls(listKey, container, renderer, emptyMessage);
    });

    pagination.appendChild(prev);
    pagination.appendChild(indicator);
    pagination.appendChild(next);
    container.appendChild(pagination);
  }
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

async function loadPendingAds() {
  pendingList.innerHTML = '<p class="admin-hint">Loading…</p>';
  try {
    const { ads } = await apiFetch('/api/admin/ads?status=pending');
    listState.pending.items = ads || [];
    listState.pending.page = 1;
    renderPaginationControls('pending', pendingList, renderAdRow, 'No pending ads.');
  } catch (err) {
    pendingList.innerHTML = `<p class="admin-error">${err.message}</p>`;
  }
}

async function loadAllAds() {
  allList.innerHTML = '<p class="admin-hint">Loading…</p>';
  try {
    const { ads } = await apiFetch('/api/admin/ads?status=all');
    listState.all.items = ads || [];
    listState.all.page = 1;
    renderPaginationControls('all', allList, renderAdRow, 'No ads found.');
  } catch (err) {
    allList.innerHTML = `<p class="admin-error">${err.message}</p>`;
  }
}

async function loadUsers() {
  userList.innerHTML = '<p class="admin-hint">Loading…</p>';
  try {
    const { users } = await apiFetch('/api/admin/users');
    listState.users.items = users || [];
    listState.users.page = 1;
    renderPaginationControls('users', userList, renderUserRow, 'No users registered.');
  } catch (err) {
    userList.innerHTML = `<p class="admin-error">${err.message}</p>`;
  }
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
  await Promise.all([loadPendingAds(), loadAllAds(), loadUsers(), loadReports()]);
}

async function loadReports() {
  reportList.innerHTML = '<p class="admin-hint">Loading…</p>';
  try {
    const { reports } = await apiFetch('/api/admin/reports');
    listState.reports.items = reports || [];
    listState.reports.page = 1;
    renderPaginationControls('reports', reportList, renderReportRow, 'No reports.');
  } catch (err) {
    reportList.innerHTML = `<p class="admin-error">${err.message}</p>`;
  }
}

restoreCredentials();
setupListeners();
loadEverything();
