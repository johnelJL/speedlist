const mainEl = document.getElementById('main');
const navButtons = document.querySelectorAll('.nav-btn');
const menuToggle = document.querySelector('.menu-toggle');
const backdrop = document.querySelector('.backdrop');
const languageButtons = document.querySelectorAll('.lang-btn');

const translations = {
  en: {
    navHome: 'Home',
    navAccount: 'My Account',
    navAbout: 'About',
    heroTitle: 'Find the right ad with AI',
    heroSubtitle: 'Describe what you need and get tailored results instantly.',
    heroPlaceholder: 'Search for what you need...',
    searchCta: 'Search Ads with AI',
    recentAds: 'Recent Ads',
    loginTitle: 'Login',
    loginSubtitle: 'Sign in to create and manage your ads.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    loginButton: 'Login',
    registerTitle: 'Create account',
    registerSubtitle: 'Register a lightweight account to save your activity.',
    registerButton: 'Register',
    signedInTitle: 'Signed in',
    signedInCopy: 'You are signed in as',
    goAccount: 'Go to My Account',
    logout: 'Logout',
    accountTitle: 'My Account',
    accountPrompt: 'Sign in to view your profile.',
    accountStatus: 'Manage your saved identity for SpeedList.',
    createdLabel: 'Created',
    lastCreatedPrefix: 'Last created ad:',
    createdAdMissing: 'Create an ad to see it here.',
    createAdHeading: 'Create a new ad with AI',
    createAdCopy: 'Use your account to draft and save AI-generated ads.',
    adPlaceholder: 'Describe what you want to list...',
    uploadTitle: 'Add photos (optional)',
    uploadCopy: 'Drag & drop or click to attach up to 4 images to guide the AI.',
    addImages: 'Add images',
    uploadDefaultStatus: 'Attach up to 4 photos to guide the AI (drag & drop supported).',
    createAdButton: 'Create Ad with AI',
    thinking: 'Thinking…',
    adCreated: 'Ad created and saved.',
    previewHeading: 'Preview ad',
    noImages: 'No images attached.',
    unknownLocation: 'Unknown location',
    generalCategory: 'General',
    priceOnRequest: 'Price on request',
    searchTitle: 'Search ads with AI',
    searchSubtitle: 'Ask in natural language; we’ll translate it into filters.',
    searchPlaceholder: 'Find me a used electric bike in Athens under 800€',
    searchCtaAlt: 'Search Ads with AI',
    searching: 'Searching…',
    resultsHeading: 'Results',
    noResults: 'No ads found. Try another query.',
    loadRecent: 'Loading recent ads…',
    noAdsYet: 'No ads yet. Be the first to create one!',
    loadRecentError: 'Failed to load recent ads.',
    loadingListing: 'Loading listing…',
    failedToLoad: 'Failed to load listing',
    listingNotFound: 'Listing not found',
    back: 'Back',
    postedOn: 'Posted',
    descriptionHeading: 'Description',
    noDescription: 'No description provided.',
    signInCTA: 'Login / Register',
    attachImagesSuccess: 'Images attached. They will be sent with your prompt.',
    imageLimit: 'Image limit reached (4). Remove one to add another.',
    imageRules: 'Skipped {{count}} file(s). Only images under 3MB are allowed.',
    filters: 'Filters',
    keywords: 'keywords',
    category: 'category',
    location: 'location',
    postedAt: 'Posted',
    attachPrompt: 'Attach up to 4 photos to guide the AI (drag & drop supported).'
  },
  el: {
    navHome: 'Αρχική',
    navAccount: 'Ο Λογαριασμός μου',
    navAbout: 'Σχετικά',
    heroTitle: 'Βρείτε την κατάλληλη αγγελία με AI',
    heroSubtitle: 'Περιγράψτε τι χρειάζεστε και λάβετε άμεσα στοχευμένα αποτελέσματα.',
    heroPlaceholder: 'Ψάξτε αυτό που χρειάζεστε...',
    searchCta: 'Αναζήτηση αγγελιών με AI',
    recentAds: 'Πρόσφατες αγγελίες',
    loginTitle: 'Σύνδεση',
    loginSubtitle: 'Συνδεθείτε για να δημιουργείτε και να διαχειρίζεστε αγγελίες.',
    emailLabel: 'Email',
    passwordLabel: 'Κωδικός',
    loginButton: 'Σύνδεση',
    registerTitle: 'Δημιουργία λογαριασμού',
    registerSubtitle: 'Εγγραφείτε για να αποθηκεύετε τη δραστηριότητά σας.',
    registerButton: 'Εγγραφή',
    signedInTitle: 'Συνδεθήκατε',
    signedInCopy: 'Είστε συνδεδεμένοι ως',
    goAccount: 'Μετάβαση στο προφίλ',
    logout: 'Αποσύνδεση',
    accountTitle: 'Ο Λογαριασμός μου',
    accountPrompt: 'Συνδεθείτε για να δείτε το προφίλ σας.',
    accountStatus: 'Διαχειριστείτε την αποθηκευμένη ταυτότητά σας στο SpeedList.',
    createdLabel: 'Ημερομηνία',
    lastCreatedPrefix: 'Τελευταία αγγελία:',
    createdAdMissing: 'Δημιουργήστε μια αγγελία για να εμφανιστεί εδώ.',
    createAdHeading: 'Δημιουργία νέας αγγελίας με AI',
    createAdCopy: 'Χρησιμοποιήστε τον λογαριασμό σας για να συντάξετε και να αποθηκεύσετε αγγελίες AI.',
    adPlaceholder: 'Περιγράψτε τι θέλετε να δημοσιεύσετε...',
    uploadTitle: 'Προσθήκη φωτογραφιών (προαιρετικό)',
    uploadCopy: 'Σύρετε & αποθέστε ή κάντε κλικ για έως 4 εικόνες για να καθοδηγήσετε το AI.',
    addImages: 'Προσθήκη εικόνων',
    uploadDefaultStatus: 'Επισυνάψτε έως 4 φωτογραφίες για να βοηθήσετε το AI (υποστηρίζεται drag & drop).',
    createAdButton: 'Δημιουργία αγγελίας με AI',
    thinking: 'Γίνεται επεξεργασία…',
    adCreated: 'Η αγγελία δημιουργήθηκε και αποθηκεύτηκε.',
    previewHeading: 'Προεπισκόπηση αγγελίας',
    noImages: 'Χωρίς εικόνες.',
    unknownLocation: 'Άγνωστη τοποθεσία',
    generalCategory: 'Γενικά',
    priceOnRequest: 'Τιμή κατόπιν αιτήματος',
    searchTitle: 'Αναζήτηση αγγελιών με AI',
    searchSubtitle: 'Ρωτήστε με φυσική γλώσσα και θα τη μεταφράσουμε σε φίλτρα.',
    searchPlaceholder: 'Βρες ηλεκτρικό ποδήλατο στην Αθήνα μέχρι 800€',
    searchCtaAlt: 'Αναζήτηση αγγελιών με AI',
    searching: 'Αναζήτηση…',
    resultsHeading: 'Αποτελέσματα',
    noResults: 'Δεν βρέθηκαν αγγελίες. Δοκιμάστε άλλο ερώτημα.',
    loadRecent: 'Φόρτωση πρόσφατων αγγελιών…',
    noAdsYet: 'Δεν υπάρχουν αγγελίες ακόμη. Γίνετε οι πρώτοι!',
    loadRecentError: 'Αποτυχία φόρτωσης πρόσφατων αγγελιών.',
    loadingListing: 'Φόρτωση αγγελίας…',
    failedToLoad: 'Αποτυχία φόρτωσης αγγελίας',
    listingNotFound: 'Η αγγελία δεν βρέθηκε',
    back: 'Πίσω',
    postedOn: 'Αναρτήθηκε',
    descriptionHeading: 'Περιγραφή',
    noDescription: 'Δεν υπάρχει περιγραφή.',
    signInCTA: 'Σύνδεση / Εγγραφή',
    attachImagesSuccess: 'Οι εικόνες επισυνάφθηκαν. Θα σταλούν με την προτροπή σας.',
    imageLimit: 'Έχετε φτάσει το όριο (4). Αφαιρέστε μία για να προσθέσετε άλλη.',
    imageRules: 'Παραλείφθηκαν {{count}} αρχεία. Επιτρέπονται μόνο εικόνες κάτω των 3MB.',
    filters: 'Φίλτρα',
    keywords: 'λέξεις-κλειδιά',
    category: 'κατηγορία',
    location: 'τοποθεσία',
    postedAt: 'Αναρτήθηκε',
    attachPrompt: 'Επισυνάψτε έως 4 φωτογραφίες για να βοηθήσετε το AI (υποστηρίζεται drag & drop).'
  }
};

let currentLanguage = 'en';
let currentView = 'home';
let activeAdDetail = null;

function t(key, replacements = {}) {
  const template = translations[currentLanguage][key] ?? translations.en[key] ?? key;
  return template.replace(/\{\{(.*?)\}\}/g, (_, k) => replacements[k.trim()] ?? `{{${k}}}`);
}

function updateLanguageButtons() {
  languageButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.lang === currentLanguage);
  });
  document.documentElement.lang = currentLanguage;
}

function updateNavText() {
  navButtons.forEach((btn) => {
    const target = btn.dataset.target;
    if (target === 'home') btn.textContent = t('navHome');
    if (target === 'account') {
      const user = getStoredUser();
      btn.textContent = user ? `${t('navAccount')} (${user.email})` : t('navAccount');
    }
    if (target === 'about') btn.textContent = t('navAbout');
  });
}

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLanguage = lang;
  updateLanguageButtons();
  updateNavText();
  renderCurrentView();
}

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
      updateStatus(t('imageLimit'), true);
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
      updateStatus(t('imageRules', { count: rejected }), true);
    } else {
      updateStatus(t('attachImagesSuccess'), false);
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
  updateStatus(t('attachPrompt'));
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

function createAdCardMarkup(ad) {
  const thumb = (ad.images || [])[0];
  const description = ad.description || '';
  const truncated = description.length > 140 ? `${description.slice(0, 140)}…` : description;

  const thumbBlock = thumb
    ? `<div class="ad-thumb" style="background-image:url('${thumb}')"></div>`
    : `<div class="ad-thumb">${t('noImages')}</div>`;

  const price = ad.price != null ? `• €${ad.price}` : '';

  return `
    <article class="ad-card clickable" data-id="${ad.id}" tabindex="0">
      ${thumbBlock}
      <div>
        <div class="title">${ad.title}</div>
        <div class="meta">${ad.location || t('unknownLocation')} <span class="badge">${ad.category || t('generalCategory')}</span> ${price}</div>
        <div class="description">${truncated}</div>
      </div>
    </article>
  `;
}

function attachAdCardHandlers(root) {
  const cards = root.querySelectorAll('.ad-card.clickable');
  cards.forEach((card) => {
    const adId = Number(card.dataset.id);
    const open = () => openAdDetail(adId);
    card.addEventListener('click', open);
    card.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
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
  const user = getStoredUser();

  if (accountBtn) {
    accountBtn.textContent = user ? `${t('navAccount')} (${user.email})` : t('navAccount');
  }
}

function renderHome() {
  currentView = 'home';
  setActiveNav('home');
  mainEl.innerHTML = `
    <div class="hero-card">
      <h1>${t('heroTitle')}</h1>
      <p>${t('heroSubtitle')}</p>
      <textarea id="prompt" class="prompt-area" placeholder="${t('heroPlaceholder')}"></textarea>
      <div class="actions">
        <button id="search-btn" class="button primary">${t('searchCta')}</button>
      </div>
      <div id="status" class="status"></div>
    </div>
    <div class="section" id="results-section" style="display:none;"></div>
    <div class="section" id="recent-section">
      <h2>${t('recentAds')}</h2>
      <div id="recent-list"></div>
    </div>
  `;

  document.getElementById('search-btn').addEventListener('click', handleSearchAds);
  loadRecentAds();
}

function renderSearchOnly() {
  currentView = 'search';
  setActiveNav('search');
  mainEl.innerHTML = `
    <div class="hero-card">
      <h1>${t('searchTitle')}</h1>
      <p>${t('searchSubtitle')}</p>
      <textarea id="prompt" class="prompt-area" placeholder="${t('searchPlaceholder')}"></textarea>
      <div class="actions">
        <button id="search-btn" class="button primary">${t('searchCtaAlt')}</button>
      </div>
      <div id="status" class="status"></div>
    </div>
    <div class="section" id="results-section" style="display:none;"></div>
  `;

  document.getElementById('search-btn').addEventListener('click', handleSearchAds);
}

function renderLogin() {
  currentView = 'login';
  setActiveNav('login');
  const user = getStoredUser();
  mainEl.innerHTML = `
    <div class="card-grid">
      <div class="card auth-card">
        <h2>${t('loginTitle')}</h2>
        <p class="status subtle">${t('loginSubtitle')}</p>
        <div class="field">
          <label for="login-email">${t('emailLabel')}</label>
          <input id="login-email" class="input" type="email" placeholder="you@example.com" />
        </div>
        <div class="field">
          <label for="login-password">${t('passwordLabel')}</label>
          <input id="login-password" class="input" type="password" placeholder="••••••" />
        </div>
        <div class="actions">
          <button id="login-btn" class="button primary">${t('loginButton')}</button>
        </div>
        <div id="login-status" class="status"></div>
      </div>

      <div class="card auth-card">
        <h2>${t('registerTitle')}</h2>
        <p class="status subtle">${t('registerSubtitle')}</p>
        <div class="field">
          <label for="register-email">${t('emailLabel')}</label>
          <input id="register-email" class="input" type="email" placeholder="you@example.com" />
        </div>
        <div class="field">
          <label for="register-password">${t('passwordLabel')}</label>
          <input id="register-password" class="input" type="password" placeholder="Minimum 6 characters" />
        </div>
        <div class="actions">
          <button id="register-btn" class="button secondary">${t('registerButton')}</button>
        </div>
        <div id="register-status" class="status"></div>
      </div>

      ${user ? `
        <div class="card auth-card">
          <h2>${t('signedInTitle')}</h2>
          <p class="status success">${t('signedInCopy')} <strong>${user.email}</strong>.</p>
          <div class="actions">
            <button id="go-account" class="button secondary">${t('goAccount')}</button>
            <button id="logout-btn" class="button">${t('logout')}</button>
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
  currentView = 'account';
  setActiveNav('account');
  const user = getStoredUser();
  if (!user) {
    mainEl.innerHTML = `
      <div class="card" style="max-width:520px; margin:0 auto;">
        <h2>${t('accountTitle')}</h2>
        <p class="status">${t('accountPrompt')}</p>
        <div class="actions">
          <button class="button primary" id="account-login">${t('signInCTA')}</button>
        </div>
      </div>
    `;
    document.getElementById('account-login').addEventListener('click', renderLogin);
    return;
  }

  const createdAdCopy = lastCreatedAd
    ? `${t('lastCreatedPrefix')} <strong>${lastCreatedAd.title}</strong>`
    : t('createdAdMissing');

  mainEl.innerHTML = `
    <div class="card" style="max-width:620px; margin:0 auto 16px;">
      <h2>${t('accountTitle')}</h2>
      <p class="status">${t('accountStatus')}</p>
      <div class="profile-row">
        <div>
          <div class="label">${t('emailLabel')}</div>
          <div class="value">${user.email}</div>
        </div>
        <div>
          <div class="label">${t('createdLabel')}</div>
          <div class="value">${new Date(user.created_at).toLocaleString()}</div>
        </div>
      </div>
      <div class="status">${createdAdCopy}</div>
      <div class="actions">
        <button id="account-logout" class="button">${t('logout')}</button>
      </div>
    </div>

    <div class="hero-card">
      <h2>${t('createAdHeading')}</h2>
      <p>${t('createAdCopy')}</p>
      <textarea id="prompt" class="prompt-area" placeholder="${t('adPlaceholder')}"></textarea>
      <div class="upload-area" id="upload-area">
        <div>
          <div class="upload-title">${t('uploadTitle')}</div>
          <p class="upload-copy">${t('uploadCopy')}</p>
        </div>
        <button id="upload-btn" class="button secondary" type="button">${t('addImages')}</button>
        <input id="image-input" type="file" accept="image/*" multiple hidden />
      </div>
      <div id="upload-status" class="status subtle"></div>
      <div id="image-previews" class="image-previews"></div>
      <div class="actions">
        <button id="create-btn" class="button primary">${t('createAdButton')}</button>
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

  document.getElementById('create-btn').addEventListener('click', handleCreateAd);
  setupImageInput();
}

function renderAbout() {
  currentView = 'about';
  setActiveNav('about');
  mainEl.innerHTML = `
    <div class="card" style="max-width:720px; margin:0 auto;">
      <h2>${t('navAbout')} speedlist.gr</h2>
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
  status.textContent = t('thinking');
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
    status.textContent = t('adCreated');
    status.classList.remove('error');
    status.classList.add('success');

    const galleryMarkup = ad.images?.length
      ? `<div class="detail-gallery">${ad.images
          .map((img, idx) => `<img src="${img}" alt="Ad image ${idx + 1}">`)
          .join('')}</div>`
      : `<p class="status subtle">${t('noImages')}</p>`;

    previewSection.innerHTML = `
      <h2>${t('previewHeading')}</h2>
      <div class="ad-card">
        <div class="title">${ad.title}</div>
        <div class="meta">${ad.location || t('unknownLocation')} <span class="badge">${ad.category || t('generalCategory')}</span></div>
        <div class="description">${ad.description}</div>
        <div class="meta">${ad.price != null ? `€${ad.price}` : t('priceOnRequest')}</div>
      </div>
      ${galleryMarkup}
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
  status.textContent = t('searching');
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
    status.textContent = `${t('filters')}: ${t('keywords')}="${filters.keywords || ''}" ${filters.category ? '• ' + t('category') + '=' + filters.category : ''} ${filters.location ? '• ' + t('location') + '=' + filters.location : ''}`;
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
    resultsSection.innerHTML = `<h2>${t('resultsHeading')}</h2><p>${t('noResults')}</p>`;
    return;
  }

  const list = ads.map((ad) => createAdCardMarkup(ad)).join('');

  resultsSection.innerHTML = `<h2>${t('resultsHeading')}</h2>${list}`;
  attachAdCardHandlers(resultsSection);
}

async function loadRecentAds() {
  const listEl = document.getElementById('recent-list');
  if (!listEl) return;
  listEl.innerHTML = t('loadRecent');
  try {
    const res = await fetch('/api/ads/recent');
    const data = await res.json();
    const ads = data.ads || [];
    if (!ads.length) {
      listEl.innerHTML = `<p>${t('noAdsYet')}</p>`;
      return;
    }

    listEl.innerHTML = ads.map((ad) => createAdCardMarkup(ad)).join('');
    attachAdCardHandlers(listEl);
  } catch (error) {
    listEl.innerHTML = `<p class="error">${t('loadRecentError')}</p>`;
  }
}

async function openAdDetail(adId) {
  if (!adId) return;
  currentView = 'detail';
  mainEl.innerHTML = `<div class="card ad-detail"><p class="status">${t('loadingListing')}</p></div>`;

  try {
    const res = await fetch(`/api/ads/${adId}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || t('failedToLoad'));
    }

    if (!data.ad) {
      throw new Error(t('listingNotFound'));
    }

    activeAdDetail = data.ad;
    renderAdDetail(data.ad);
  } catch (error) {
    mainEl.innerHTML = `<div class="card ad-detail"><p class="error">${error.message}</p><div class="actions"><button class="button secondary" id="detail-back">${t('back')}</button></div></div>`;
    const backBtn = document.getElementById('detail-back');
    if (backBtn) backBtn.addEventListener('click', renderHome);
  }
}

function renderAdDetail(ad) {
  activeAdDetail = ad;
  currentView = 'detail';
  setActiveNav('');
  const gallery = ad.images?.length
    ? `<div class="detail-gallery">${ad.images
        .map((img, idx) => `<img src="${img}" alt="${ad.title} photo ${idx + 1}">`)
        .join('')}</div>`
    : `<p class="status subtle">${t('noImages')}</p>`;

  const priceLabel = ad.price != null ? `• €${ad.price}` : `• ${t('priceOnRequest')}`;

  mainEl.innerHTML = `
    <div class="card ad-detail">
      <div class="actions" style="margin-bottom: 8px;">
        <button class="button secondary" id="detail-back">← ${t('back')}</button>
      </div>
      <div class="detail-header">
        <h1>${ad.title}</h1>
        <div class="meta">${ad.location || t('unknownLocation')} <span class="badge">${ad.category || t('generalCategory')}</span> ${priceLabel}</div>
        <div class="status subtle">${t('postedAt')} ${new Date(ad.created_at).toLocaleString()}</div>
      </div>
      ${gallery}
      <div style="margin-top: 14px;">
        <h3>${t('descriptionHeading')}</h3>
        <p class="description">${ad.description || t('noDescription')}</p>
      </div>
    </div>
  `;

  const backBtn = document.getElementById('detail-back');
  if (backBtn) backBtn.addEventListener('click', renderHome);
}

function renderCurrentView() {
  if (currentView === 'home') return renderHome();
  if (currentView === 'account') return renderAccount();
  if (currentView === 'login') return renderLogin();
  if (currentView === 'about') return renderAbout();
  if (currentView === 'search') return renderSearchOnly();
  if (currentView === 'detail' && activeAdDetail) return renderAdDetail(activeAdDetail);
  return renderHome();
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

languageButtons.forEach((btn) => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});

updateLanguageButtons();
updateNavText();
updateAccountNav();
renderHome();
