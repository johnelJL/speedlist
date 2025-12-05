const mainEl = document.getElementById('main');
const navButtons = document.querySelectorAll('.nav-btn');

let lastCreatedAd = null;

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
  status.textContent = 'Thinking…';
  previewSection.style.display = 'none';

  try {
    const res = await fetch('/api/ai/create-ad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
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
  status.textContent = 'Searching…';
  resultsSection.style.display = 'none';

  try {
    const res = await fetch('/api/ai/search-ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
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
