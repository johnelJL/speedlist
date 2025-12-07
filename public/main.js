const mainEl = document.getElementById('main');
const navButtons = document.querySelectorAll('.nav-btn');

let lastCreatedAd = null;
let attachedImages = [];

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

function renderHome() {
  setActiveNav('home');
  mainEl.innerHTML = `
    <div class="hero-card">
      <h1>SpeedList – AI-powered ads</h1>
      <p>Describe what you need, and we’ll create or find the right ad in seconds.</p>
      <textarea id="prompt" class="prompt-area" placeholder="Describe what you want to sell or find..."></textarea>
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
        <button id="search-btn" class="button secondary">Search Ads with AI</button>
      </div>
      <div id="status" class="status"></div>
    </div>
    <div class="section" id="preview-section" style="display:none;"></div>
    <div class="section" id="results-section" style="display:none;"></div>
    <div class="section" id="recent-section">
      <h2>Recent Ads</h2>
      <div id="recent-list"></div>
    </div>
  `;

  document.getElementById('create-btn').addEventListener('click', handleCreateAd);
  document.getElementById('search-btn').addEventListener('click', handleSearchAds);
  setupImageInput();
  loadRecentAds();
}

function renderSearchOnly() {
  setActiveNav('search');
  mainEl.innerHTML = `
    <div class="hero-card">
      <h1>Search ads with AI</h1>
      <p>Ask in natural language; we’ll translate it into filters.</p>
      <textarea id="prompt" class="prompt-area" placeholder="Find me a used electric bike in Athens under 800€"></textarea>
      <div class="upload-area" id="upload-area">
        <div>
          <div class="upload-title">Drop images to refine your search</div>
          <p class="upload-copy">Add up to 4 photos to teach the AI what you’re looking for.</p>
        </div>
        <button id="upload-btn" class="button secondary" type="button">Add images</button>
        <input id="image-input" type="file" accept="image/*" multiple hidden />
      </div>
      <div id="upload-status" class="status subtle"></div>
      <div id="image-previews" class="image-previews"></div>
      <div class="actions">
        <button id="search-btn" class="button primary">Search Ads with AI</button>
      </div>
      <div id="status" class="status"></div>
    </div>
    <div class="section" id="results-section" style="display:none;"></div>
  `;

  document.getElementById('search-btn').addEventListener('click', handleSearchAds);
  setupImageInput();
}

function renderLogin() {
  setActiveNav('login');
  mainEl.innerHTML = `
    <div class="card" style="max-width:520px; margin:0 auto;">
      <h2>Login / Register</h2>
      <p class="status">Stub authentication for now.</p>
      <div class="flex-row">
        <input id="email" class="input" type="email" placeholder="Email" />
        <input id="password" class="input" type="password" placeholder="Password" />
      </div>
      <div class="actions">
        <button id="login-btn" class="button primary">Login</button>
        <button id="register-btn" class="button secondary">Register</button>
      </div>
      <div id="auth-status" class="status"></div>
    </div>
  `;

  document.getElementById('login-btn').addEventListener('click', () => handleAuth('login'));
  document.getElementById('register-btn').addEventListener('click', () => handleAuth('register'));
}

function renderAccount() {
  setActiveNav('account');
  mainEl.innerHTML = `
    <div class="card" style="max-width:520px; margin:0 auto;">
      <h2>My Account</h2>
      <p class="status">Coming soon: manage your ads here.</p>
      <div class="status">
        ${lastCreatedAd ? `Last created ad: <strong>${lastCreatedAd.title}</strong>` : 'Create an ad to see it here.'}
      </div>
    </div>
  `;
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
  const payload = getPromptPayload(prompt);
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

async function handleAuth(type) {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const status = document.getElementById('auth-status');
  status.textContent = 'Submitting…';

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
  } catch (error) {
    status.textContent = error.message;
    status.classList.remove('success');
    status.classList.add('error');
  }
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    if (target === 'home') return renderHome();
    if (target === 'search') return renderSearchOnly();
    if (target === 'login') return renderLogin();
    if (target === 'account') return renderAccount();
    if (target === 'about') return renderAbout();
  });
});

renderHome();
