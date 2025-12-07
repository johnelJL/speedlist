const pendingList = document.getElementById('pending-list');
const allList = document.getElementById('all-list');
const userList = document.getElementById('user-list');
const adTemplate = document.getElementById('ad-row-template');
const userTemplate = document.getElementById('user-row-template');
const loginStatus = document.getElementById('admin-login-status');

const STORAGE_KEY = 'speedlist:admin-basic';

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
  node.querySelector('.admin-row-meta').textContent = `ID ${user.id} • Created ${new Date(user.created_at).toLocaleString()}`;
  node.querySelector('.admin-user-email').value = user.email;
  node.querySelector('.admin-user-password').value = '';

  node.querySelector('.admin-btn-user-save').addEventListener('click', async () => {
    const payload = {
      email: node.querySelector('.admin-user-email').value,
      password: node.querySelector('.admin-user-password').value || undefined
    };
    await apiFetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    await loadUsers();
  });

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

async function loadPendingAds() {
  pendingList.innerHTML = '<p class="admin-hint">Loading…</p>';
  try {
    const { ads } = await apiFetch('/api/admin/ads?status=pending');
    pendingList.innerHTML = '';
    if (!ads.length) {
      pendingList.innerHTML = '<p class="admin-hint">No pending ads.</p>';
      return;
    }
    ads.forEach((ad) => renderAdRow(pendingList, ad));
  } catch (err) {
    pendingList.innerHTML = `<p class="admin-error">${err.message}</p>`;
  }
}

async function loadAllAds() {
  allList.innerHTML = '<p class="admin-hint">Loading…</p>';
  try {
    const { ads } = await apiFetch('/api/admin/ads?status=all');
    allList.innerHTML = '';
    if (!ads.length) {
      allList.innerHTML = '<p class="admin-hint">No ads found.</p>';
      return;
    }
    ads.forEach((ad) => renderAdRow(allList, ad));
  } catch (err) {
    allList.innerHTML = `<p class="admin-error">${err.message}</p>`;
  }
}

async function loadUsers() {
  userList.innerHTML = '<p class="admin-hint">Loading…</p>';
  try {
    const { users } = await apiFetch('/api/admin/users');
    userList.innerHTML = '';
    if (!users.length) {
      userList.innerHTML = '<p class="admin-hint">No users registered.</p>';
      return;
    }
    users.forEach((user) => renderUserRow(userList, user));
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
}

async function loadEverything() {
  await Promise.all([loadPendingAds(), loadAllAds(), loadUsers()]);
}

restoreCredentials();
setupListeners();
loadEverything();
