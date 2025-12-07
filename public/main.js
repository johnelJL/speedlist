const mainEl = document.getElementById('main');
const navButtons = document.querySelectorAll('.nav-btn');
const menuToggle = document.querySelector('.menu-toggle');
const backdrop = document.querySelector('.backdrop');

let lastCreatedAd = null;
let attachedImages = [];
const AUTH_STORAGE_KEY = 'speedlist:user';

function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Failed to parse stored user', err);
    return null;
  }
}

function setStoredUser(user) {
  if (user) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  updateAccountNav();
}

function formatBytes(bytes) {
  if (!bytes && bytes !== 0) return '';
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), sizes.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
}

function renderImagePreviews() {
  const previewsEl = document.getElementById('image-previews');
  if (!previewsEl) return;

  if (!attachedImages.length) {
    previewsEl.innerHTML = '';
    return;
  }

  previewsEl.innerHTML = attachedImages
    .map(
      (img, index) => `
      <div class="image-pill">
        <div class="thumb" style="background-image:url('${img.dataUrl}')"></div>
        <div class="info">
          <div class="name">${img.name}</div>
          <div class="meta">${formatBytes(img.size)}</div>
        </div>
        <button class="pill-remove" data-index="${index}" aria-label="Remove ${img.name}">&times;</button>
      </div>
    `
    )
    .join('');

  previewsEl.querySelectorAll('.pill-remove').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      attachedImages.splice(idx, 1);
      renderImagePreviews();
    });
  });
}

function setupImageInput() {
  attachedImages = [];
  const uploadArea = document.getElementById('upload-area');
  const uploadButton = document.getElementById('upload-btn');
  const fileInput = document.getElementById('image-input');
  const statusEl = document.getElementById('upload-status');

  if (!uploadArea || !uploadButton || !fileInput || !statusEl) return;

  const updateStatus = (message, isError = false) => {
    statusEl.textContent = message || '';
    statusEl.classList.toggle('error', isError);
  };

  const handleFiles = (files) => {
    if (!files?.length) return;

    const remainingSlots = 4 - attachedImages.length;
    if (remainingSlots <= 0) {
      updateStatus('Image limit reached (4). Remove one to add another.', true);
      return;
    }

    let rejected = 0;
    Array.from(files)
      .slice(0, remainingSlots)
      .forEach((file) => {
        if (!file.type.startsWith('image/')) {
          rejected += 1;
          return;
        }

        const maxSize = 3 * 1024 * 1024; // 3 MB
        if (file.size > maxSize) {
          rejected += 1;
          return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
          attachedImages.push({ name: file.name, dataUrl: ev.target.result, size: file.size });
          renderImagePreviews();
        };
        reader.readAsDataURL(file);
      });

    if (rejected) {
      updateStatus(`Skipped ${rejected} file(s). Only images under 3MB are allowed.`, true);
    } else {
      updateStatus('Images attached. They will be sent with your prompt.', false);
    }
  };

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragging');
  });

  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragging');
  });

  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragging');
    handleFiles(e.dataTransfer.files);
  });

  uploadArea.addEventListener('click', () => fileInput.click());
  uploadButton.addEventListener('click', (e) => {
    e.preventDefault();
    fileInput.click();
  });
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
  });

  renderImagePreviews();
  updateStatus('Attach up to 4 photos to guide the AI (drag & drop supported).');
}

function getPromptPayload(prompt) {
  return {
    prompt,
    images: attachedImages.map((img) => img.dataUrl)
  };
}

function setActiveNav(target) {
  navButtons.forEach((btn) => {
    if (btn.dataset.target === target) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function closeNav() {
  document.body.classList.remove('nav-open');
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'false');
  }
}

function toggleNav() {
  const isOpen = document.body.classList.toggle('nav-open');
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }
}

function updateAccountNav() {
  const accountBtn = document.querySelector('.nav-btn[data-target="account"]');
  const loginBtn = document.querySelector('.nav-btn[data-target="login"]');
  const user = getStoredUser();

  if (accountBtn) {
    accountBtn.textContent = user ? `My Account (${user.email})` : 'My Account';
  }

  if (loginBtn) {
    loginBtn.textContent = user ? 'Switch Account' : 'Login / Register';
  }
}

function renderHome() {
  setActiveNav('home');
  mainEl.innerHTML = `
    <div class="hero-card">
      <h1>Find the right ad with AI</h1>
      <p>Describe what you need and get tailored results instantly.</p>
      <textarea id="prompt" class="prompt-area" placeholder="Search for what you need..."></textarea>
      <div class="actions">
        <button id="search-btn" class="button primary">Search Ads with AI</button>
      </div>
      <div id="status" class="status"></div>
    </div>
    <div class="section" id="results-section" style="display:none;"></div>
    <div class="section" id="recent-section">
      <h2>Recent Ads</h2>
      <div id="recent-list"></div>
    </div>
  `;

  document.getElementById('search-btn').addEventListener('click', handleSearchAds);
  loadRecentAds();
}

function renderSearchOnly() {
  setActiveNav('search');
  mainEl.innerHTML = `
    <div class="hero-card">
      <h1>Search ads with AI</h1>
      <p>Ask in natural language; we’ll translate it into filters.</p>
      <textarea id="prompt" class="prompt-area" placeholder="Find me a used electric bike in Athens under 800€"></textarea>
      <div class="actions">
        <button id="search-btn" class="button primary">Search Ads with AI</button>
      </div>
      <div id="status" class="status"></div>
    </div>
    <div class="section" id="results-section" style="display:none;"></div>
  `;

  document.getElementById('search-btn').addEventListener('click', handleSearchAds);
}

function renderLogin() {
  setActiveNav('login');
  const user = getStoredUser();
  mainEl.innerHTML = `
    <div class="card-grid">
      <div class="card auth-card">
        <h2>Login</h2>
        <p class="status subtle">Sign in to create and manage your ads.</p>
        <div class="field">
          <label for="login-email">Email</label>
          <input id="login-email" class="input" type="email" placeholder="you@example.com" />
        </div>
        <div class="field">
          <label for="login-password">Password</label>
          <input id="login-password" class="input" type="password" placeholder="••••••" />
        </div>
        <div class="actions">
          <button id="login-btn" class="button primary">Login</button>
        </div>
        <div id="login-status" class="status"></div>
      </div>

      <div class="card auth-card">
        <h2>Create account</h2>
        <p class="status subtle">Register a lightweight account to save your activity.</p>
        <div class="field">
          <label for="register-email">Email</label>
          <input id="register-email" class="input" type="email" placeholder="you@example.com" />
        </div>
        <div class="field">
          <label for="register-password">Password</label>
          <input id="register-password" class="input" type="password" placeholder="Minimum 6 characters" />
        </div>
        <div class="actions">
          <button id="register-btn" class="button secondary">Register</button>
        </div>
        <div id="register-status" class="status"></div>
      </div>

      ${user ? `
        <div class="card auth-card">
          <h2>Signed in</h2>
          <p class="status success">You are signed in as <strong>${user.email}</strong>.</p>
          <div class="actions">
            <button id="go-account" class="button secondary">Go to My Account</button>
            <button id="logout-btn" class="button">Logout</button>
          </div>
        </div>
      ` : ''}
    </div>
  `;

  document.getElementById('login-btn').addEventListener('click', () =>
    handleAuth({
      type: 'login',
      emailInput: 'login-email',
      passwordInput: 'login-password',
      statusEl: 'login-status'
    })
  );

  document.getElementById('register-btn').addEventListener('click', () =>
    handleAuth({
      type: 'register',
      emailInput: 'register-email',
      passwordInput: 'register-password',
      statusEl: 'register-status'
    })
  );

  const accountBtn = document.getElementById('go-account');
  const logoutBtn = document.getElementById('logout-btn');
  if (accountBtn) accountBtn.addEventListener('click', renderAccount);
  if (logoutBtn) logoutBtn.addEventListener('click', () => {
    setStoredUser(null);
    renderLogin();
  });
}

function renderAccount() {
  setActiveNav('account');
  const user = getStoredUser();
  if (!user) {
    mainEl.innerHTML = `
      <div class="card" style="max-width:520px; margin:0 auto;">
        <h2>My Account</h2>
        <p class="status">Sign in to view your profile.</p>
        <div class="actions">
          <button class="button primary" id="account-login">Login / Register</button>
        </div>
      </div>
    `;
    document.getElementById('account-login').addEventListener('click', renderLogin);
    return;
  }

  const createdAdCopy = lastCreatedAd
    ? `Last created ad: <strong>${lastCreatedAd.title}</strong>`
    : 'Create an ad to see it here.';

  mainEl.innerHTML = `
    <div class="card" style="max-width:620px; margin:0 auto 16px;">
      <h2>My Account</h2>
      <p class="status">Manage your saved identity for SpeedList.</p>
      <div class="profile-row">
        <div>
          <div class="label">Email</div>
          <div class="value">${user.email}</div>
        </div>
        <div>
          <div class="label">Created</div>
          <div class="value">${new Date(user.created_at).toLocaleString()}</div>
        </div>
      </div>
      <div class="status">${createdAdCopy}</div>
      <div class="actions">
        <button id="account-logout" class="button">Logout</button>
        <button id="account-switch" class="button secondary">Switch account</button>
      </div>
    </div>

    <div class="hero-card">
      <h2>Create a new ad with AI</h2>
      <p>Use your account to draft and save AI-generated ads.</p>
      <textarea id="prompt" class="prompt-area" placeholder="Describe what you want to list..."></textarea>
      <div class="upload-area" id="upload-area">
        <div>
          <div class="upload-title">Add photos (optional)</div>
          <p class="upload-copy">Drag & drop or click to attach up to 4 images to guide the AI.</p>
        </div>
        <button id="upload-btn" class="button secondary" type="button">Add images</button>
        <input id="image-input" type="file" accept="image/*" multiple hidden />
      </div>
      <div id="upload-status" class="status subtle"></div>
      <div id="image-previews" class="image-previews"></div>
      <div class="actions">
        <button id="create-btn" class="button primary">Create Ad with AI</button>
      </div>
      <div id="status" class="status"></div>
    </div>
    <div class="section" id="preview-section" style="display:none;"></div>
    <div class="section" id="results-section" style="display:none;"></div>
  `;

  document.getElementById('account-logout').addEventListener('click', () => {
    setStoredUser(null);
    renderLogin();
  });

  document.getElementById('account-switch').addEventListener('click', renderLogin);

  document.getElementById('create-btn').addEventListener('click', handleCreateAd);
  setupImageInput();
}

function renderAbout() {
  setActiveNav('about');
  mainEl.innerHTML = `
    <div class="card" style="max-width:720px; margin:0 auto;">
      <h2>About speedlist.gr</h2>
      <p>SpeedList is a minimal AI-powered classifieds experience. Describe what you want to list or search for, and our AI will turn it into structured ads and smart filters.</p>
      <ul>
        <li>Create ads in seconds with natural language.</li>
        <li>Search existing ads using plain sentences.</li>
        <li>Lightweight, responsive, and private — the AI runs on the server.</li>
      </ul>
    </div>
  `;
}

async function handleCreateAd() {
  const prompt = document.getElementById('prompt').value.trim();
  const status = document.getElementById('status');
  const previewSection = document.getElementById('preview-section');
  const payload = getPromptPayload(prompt);
  status.textContent = 'Thinking…';
  previewSection.style.display = 'none';

  try {
    const res = await fetch('/api/ai/create-ad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || 'Failed to create ad');

    const ad = data.ad;
    lastCreatedAd = ad;
    status.textContent = 'Ad created and saved.';
    status.classList.remove('error');
    status.classList.add('success');

    previewSection.innerHTML = `
      <h2>Preview ad</h2>
      <div class="ad-card">
        <div class="title">${ad.title}</div>
        <div class="meta">${ad.location || 'Unknown location'} <span class="badge">${ad.category || 'General'}</span></div>
        <div class="description">${ad.description}</div>
        <div class="meta">${ad.price != null ? `€${ad.price}` : 'Price on request'}</div>
      </div>
    `;
    previewSection.style.display = 'block';
    loadRecentAds();
  } catch (error) {
    status.textContent = error.message;
    status.classList.remove('success');
    status.classList.add('error');
  }
}

async function handleSearchAds() {
  const prompt = document.getElementById('prompt').value.trim();
  const status = document.getElementById('status');
  const resultsSection = document.getElementById('results-section');
  const payload = { prompt };
  status.textContent = 'Searching…';
  resultsSection.style.display = 'none';

  try {
    const res = await fetch('/api/ai/search-ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to search ads');

    const ads = data.ads || [];
    const filters = data.filters || {};
    status.textContent = `Filters: keywords="${filters.keywords || ''}" ${filters.category ? '• category=' + filters.category : ''} ${filters.location ? '• location=' + filters.location : ''}`;
    status.classList.remove('error');

    renderResults(ads);
    resultsSection.style.display = 'block';
  } catch (error) {
    status.textContent = error.message;
    status.classList.remove('success');
    status.classList.add('error');
  }
}

function renderResults(ads) {
  const resultsSection = document.getElementById('results-section');
  if (!resultsSection) return;
  if (!ads.length) {
    resultsSection.innerHTML = `<h2>Results</h2><p>No ads found. Try another query.</p>`;
    return;
  }

  const list = ads
    .map(
      (ad) => `
      <div class="ad-card">
        <div class="title">${ad.title}</div>
        <div class="meta">${ad.location || 'Unknown location'} <span class="badge">${ad.category || 'General'}</span> ${ad.price != null ? `• €${ad.price}` : ''}</div>
        <div class="description">${(ad.description || '').slice(0, 120)}${ad.description && ad.description.length > 120 ? '…' : ''}</div>
      </div>
    `
    )
    .join('');

  resultsSection.innerHTML = `<h2>Results</h2>${list}`;
}

async function loadRecentAds() {
  const listEl = document.getElementById('recent-list');
  if (!listEl) return;
  listEl.innerHTML = 'Loading recent ads…';
  try {
    const res = await fetch('/api/ads/recent');
    const data = await res.json();
    const ads = data.ads || [];
    if (!ads.length) {
      listEl.innerHTML = '<p>No ads yet. Be the first to create one!</p>';
      return;
    }

    listEl.innerHTML = ads
      .map(
        (ad) => `
        <div class="ad-card">
          <div class="title">${ad.title}</div>
          <div class="meta">${ad.location || 'Unknown location'} <span class="badge">${ad.category || 'General'}</span> ${ad.price != null ? `• €${ad.price}` : ''}</div>
          <div class="description">${(ad.description || '').slice(0, 120)}${ad.description && ad.description.length > 120 ? '…' : ''}</div>
        </div>
      `
      )
      .join('');
  } catch (error) {
    listEl.innerHTML = `<p class="error">Failed to load recent ads.</p>`;
  }
}

async function handleAuth({ type, emailInput, passwordInput, statusEl }) {
  const email = document.getElementById(emailInput)?.value?.trim();
  const password = document.getElementById(passwordInput)?.value || '';
  const status = document.getElementById(statusEl);

  if (!status) return;
  status.textContent = 'Submitting…';
  status.classList.remove('error', 'success');

  try {
    const res = await fetch(`/api/auth/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    status.textContent = data.message;
    status.classList.remove('error');
    status.classList.add('success');

    if (data.user) {
      setStoredUser(data.user);
    }

    if (type === 'login') {
      renderAccount();
    }
  } catch (error) {
    status.textContent = error.message;
    status.classList.remove('success');
    status.classList.add('error');
  }
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    closeNav();
    if (target === 'home') return renderHome();
    if (target === 'search') return renderSearchOnly();
    if (target === 'login') return renderLogin();
    if (target === 'account') return renderAccount();
    if (target === 'about') return renderAbout();
  });
});

if (menuToggle) {
  menuToggle.addEventListener('click', toggleNav);
}

if (backdrop) {
  backdrop.addEventListener('click', closeNav);
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 860) {
    closeNav();
  }
});

updateAccountNav();
renderHome();
