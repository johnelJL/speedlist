const mainEl = document.getElementById('main');
const navButtons = document.querySelectorAll('.nav-btn');
const menuToggle = document.querySelector('.menu-toggle');
const backdrop = document.querySelector('.backdrop');

let lastCreatedAd = null;
let attachedImages = [];
const AUTH_STORAGE_KEY = 'speedlist:user';
const bilingual = (en, el) => `${en} / ${el}`;

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
      updateStatus(bilingual('Image limit reached (4). Remove one to add another.', 'Έχετε φτάσει το όριο των 4 εικόνων. Αφαιρέστε μία για να προσθέσετε άλλη.'), true);
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
      updateStatus(
        bilingual(`Skipped ${rejected} file(s). Only images under 3MB are allowed.`, `Παραλείφθηκαν ${rejected} αρχεία. Επιτρέπονται μόνο εικόνες κάτω από 3MB.`),
        true
      );
    } else {
      updateStatus(
        bilingual('Images attached. They will be sent with your prompt.', 'Οι εικόνες προστέθηκαν. Θα αποσταλούν με την υποβολή σας.'),
        false
      );
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
  updateStatus(bilingual('Attach up to 4 photos to guide the AI (drag & drop supported).', 'Επισυνάψτε έως 4 φωτογραφίες για να καθοδηγήσετε το AI (υποστηρίζεται μεταφορά & απόθεση).'));
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
    : `<div class="ad-thumb">${bilingual('No image', 'Χωρίς εικόνα')}</div>`;

  const price = ad.price != null ? `• €${ad.price}` : '';

  return `
    <article class="ad-card clickable" data-id="${ad.id}" tabindex="0">
      ${thumbBlock}
      <div>
        <div class="title">${ad.title}</div>
        <div class="meta">${ad.location || bilingual('Unknown location', 'Άγνωστη τοποθεσία')} <span class="badge">${ad.category || bilingual('General', 'Γενικά')}</span> ${price}</div>
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
    accountBtn.textContent = user
      ? bilingual(`My Account (${user.email})`, `Ο λογαριασμός μου (${user.email})`)
      : bilingual('My Account', 'Ο λογαριασμός μου');
  }
}

function renderHome() {
  setActiveNav('home');
  mainEl.innerHTML = `
    <div class="hero-card">
      <h1>${bilingual('Find the right ad with AI', 'Βρείτε τη σωστή αγγελία με AI')}</h1>
      <p>${bilingual('Describe what you need and get tailored results instantly.', 'Περιγράψτε τι χρειάζεστε και λάβετε άμεσα προσαρμοσμένα αποτελέσματα.')}</p>
      <textarea id="prompt" class="prompt-area" placeholder="${bilingual('Search for what you need...', 'Αναζητήστε ό,τι χρειάζεστε...')}"></textarea>
      <div class="actions">
        <button id="search-btn" class="button primary">${bilingual('Search Ads with AI', 'Αναζητήστε αγγελίες με AI')}</button>
      </div>
      <div id="status" class="status"></div>
    </div>
    <div class="section" id="results-section" style="display:none;"></div>
    <div class="section" id="recent-section">
      <h2>${bilingual('Recent Ads', 'Πρόσφατες αγγελίες')}</h2>
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
      <h1>${bilingual('Search ads with AI', 'Αναζητήστε αγγελίες με AI')}</h1>
      <p>${bilingual('Ask in natural language; we’ll translate it into filters.', 'Ρωτήστε σε φυσική γλώσσα· θα το μετατρέψουμε σε φίλτρα.')}</p>
      <textarea id="prompt" class="prompt-area" placeholder="${bilingual('Find me a used electric bike in Athens under 800€', 'Βρείτε ένα μεταχειρισμένο ηλεκτρικό ποδήλατο στην Αθήνα κάτω από 800€')}"></textarea>
      <div class="actions">
        <button id="search-btn" class="button primary">${bilingual('Search Ads with AI', 'Αναζητήστε αγγελίες με AI')}</button>
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
        <h2>${bilingual('Login', 'Σύνδεση')}</h2>
        <p class="status subtle">${bilingual('Sign in to create and manage your ads.', 'Συνδεθείτε για να δημιουργείτε και να διαχειρίζεστε τις αγγελίες σας.')}</p>
        <div class="field">
          <label for="login-email">${bilingual('Email', 'Email')}</label>
          <input id="login-email" class="input" type="email" placeholder="you@example.com" />
        </div>
        <div class="field">
          <label for="login-password">${bilingual('Password', 'Κωδικός πρόσβασης')}</label>
          <input id="login-password" class="input" type="password" placeholder="••••••" />
        </div>
        <div class="actions">
          <button id="login-btn" class="button primary">${bilingual('Login', 'Σύνδεση')}</button>
        </div>
        <div id="login-status" class="status"></div>
      </div>

      <div class="card auth-card">
        <h2>${bilingual('Create account', 'Δημιουργία λογαριασμού')}</h2>
        <p class="status subtle">${bilingual('Register a lightweight account to save your activity.', 'Εγγραφείτε σε έναν απλό λογαριασμό για να αποθηκεύετε τη δραστηριότητά σας.')}</p>
        <div class="field">
          <label for="register-email">${bilingual('Email', 'Email')}</label>
          <input id="register-email" class="input" type="email" placeholder="you@example.com" />
        </div>
        <div class="field">
          <label for="register-password">${bilingual('Password', 'Κωδικός πρόσβασης')}</label>
          <input id="register-password" class="input" type="password" placeholder="${bilingual('Minimum 6 characters', 'Τουλάχιστον 6 χαρακτήρες')}" />
        </div>
        <div class="actions">
          <button id="register-btn" class="button secondary">${bilingual('Register', 'Εγγραφή')}</button>
        </div>
        <div id="register-status" class="status"></div>
      </div>

      ${user ? `
        <div class="card auth-card">
          <h2>${bilingual('Signed in', 'Συνδεδεμένοι')}</h2>
          <p class="status success">${bilingual(`You are signed in as <strong>${user.email}</strong>.`, `Έχετε συνδεθεί ως <strong>${user.email}</strong>.`)}</p>
          <div class="actions">
            <button id="go-account" class="button secondary">${bilingual('Go to My Account', 'Μετάβαση στον λογαριασμό μου')}</button>
            <button id="logout-btn" class="button">${bilingual('Logout', 'Αποσύνδεση')}</button>
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
        <h2>${bilingual('My Account', 'Ο λογαριασμός μου')}</h2>
        <p class="status">${bilingual('Sign in to view your profile.', 'Συνδεθείτε για να δείτε το προφίλ σας.')}</p>
        <div class="actions">
          <button class="button primary" id="account-login">${bilingual('Login / Register', 'Σύνδεση / Εγγραφή')}</button>
        </div>
      </div>
    `;
    document.getElementById('account-login').addEventListener('click', renderLogin);
    return;
  }

  const createdAdCopy = lastCreatedAd
    ? bilingual(`Last created ad: <strong>${lastCreatedAd.title}</strong>`, `Τελευταία αγγελία: <strong>${lastCreatedAd.title}</strong>`)
    : bilingual('Create an ad to see it here.', 'Δημιουργήστε μια αγγελία για να εμφανιστεί εδώ.');

  mainEl.innerHTML = `
    <div class="card" style="max-width:620px; margin:0 auto 16px;">
      <h2>${bilingual('My Account', 'Ο λογαριασμός μου')}</h2>
      <p class="status">${bilingual('Manage your saved identity for SpeedList.', 'Διαχειριστείτε τα αποθηκευμένα στοιχεία σας για το SpeedList.')}</p>
      <div class="profile-row">
        <div>
          <div class="label">${bilingual('Email', 'Email')}</div>
          <div class="value">${user.email}</div>
        </div>
        <div>
          <div class="label">${bilingual('Created', 'Ημερομηνία δημιουργίας')}</div>
          <div class="value">${new Date(user.created_at).toLocaleString()}</div>
        </div>
      </div>
      <div class="status">${createdAdCopy}</div>
      <div class="actions">
        <button id="account-logout" class="button">${bilingual('Logout', 'Αποσύνδεση')}</button>
      </div>
    </div>

    <div class="hero-card">
      <h2>${bilingual('Create a new ad with AI', 'Δημιουργήστε νέα αγγελία με AI')}</h2>
      <p>${bilingual('Use your account to draft and save AI-generated ads.', 'Χρησιμοποιήστε τον λογαριασμό σας για να συντάσσετε και να αποθηκεύετε αγγελίες που δημιουργεί το AI.')}</p>
      <textarea id="prompt" class="prompt-area" placeholder="${bilingual('Describe what you want to list...', 'Περιγράψτε τι θέλετε να καταχωρήσετε...')}"></textarea>
      <div class="upload-area" id="upload-area">
        <div>
          <div class="upload-title">${bilingual('Add photos (optional)', 'Προσθέστε φωτογραφίες (προαιρετικό)')}</div>
          <p class="upload-copy">${bilingual('Drag & drop or click to attach up to 4 images to guide the AI.', 'Σύρετε και αποθέστε ή κάντε κλικ για να επισυνάψετε έως 4 εικόνες ώστε να καθοδηγήσετε το AI.')}</p>
        </div>
        <button id="upload-btn" class="button secondary" type="button">${bilingual('Add images', 'Προσθήκη εικόνων')}</button>
        <input id="image-input" type="file" accept="image/*" multiple hidden />
      </div>
      <div id="upload-status" class="status subtle"></div>
      <div id="image-previews" class="image-previews"></div>
      <div class="actions">
        <button id="create-btn" class="button primary">${bilingual('Create Ad with AI', 'Δημιουργία αγγελίας με AI')}</button>
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
  setActiveNav('about');
  mainEl.innerHTML = `
    <div class="card" style="max-width:720px; margin:0 auto;">
      <h2>${bilingual('About speedlist.gr', 'Σχετικά με το speedlist.gr')}</h2>
      <p>${bilingual('SpeedList is a minimal AI-powered classifieds experience. Describe what you want to list or search for, and our AI will turn it into structured ads and smart filters.', 'Το SpeedList είναι μια λιτή εμπειρία αγγελιών με AI. Περιγράψτε τι θέλετε να καταχωρήσετε ή να αναζητήσετε και το AI θα το μετατρέψει σε δομημένες αγγελίες και έξυπνα φίλτρα.')}</p>
      <ul>
        <li>${bilingual('Create ads in seconds with natural language.', 'Δημιουργήστε αγγελίες σε δευτερόλεπτα με φυσική γλώσσα.')}</li>
        <li>${bilingual('Search existing ads using plain sentences.', 'Αναζητήστε υπάρχουσες αγγελίες με απλές προτάσεις.')}</li>
        <li>${bilingual('Lightweight, responsive, and private — the AI runs on the server.', 'Ελαφρύ, γρήγορο και ιδιωτικό — το AI τρέχει στον διακομιστή.')}</li>
      </ul>
    </div>
  `;
}

async function handleCreateAd() {
  const prompt = document.getElementById('prompt').value.trim();
  const status = document.getElementById('status');
  const previewSection = document.getElementById('preview-section');
  const payload = getPromptPayload(prompt);
  status.textContent = bilingual('Thinking…', 'Σκέψη…');
  previewSection.style.display = 'none';

  try {
    const res = await fetch('/api/ai/create-ad', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || bilingual('Failed to create ad', 'Αποτυχία δημιουργίας αγγελίας'));

    const ad = data.ad;
    lastCreatedAd = ad;
    status.textContent = bilingual('Ad created and saved.', 'Η αγγελία δημιουργήθηκε και αποθηκεύτηκε.');
    status.classList.remove('error');
    status.classList.add('success');

    const galleryMarkup = ad.images?.length
      ? `<div class="detail-gallery">${ad.images
          .map((img, idx) => `<img src="${img}" alt="${bilingual('Ad image', 'Εικόνα αγγελίας')} ${idx + 1}">`)
          .join('')}</div>`
      : `<p class="status subtle">${bilingual('No images attached.', 'Δεν προστέθηκαν εικόνες.')}</p>`;

    previewSection.innerHTML = `
      <h2>${bilingual('Preview ad', 'Προεπισκόπηση αγγελίας')}</h2>
      <div class="ad-card">
        <div class="title">${ad.title}</div>
        <div class="meta">${ad.location || bilingual('Unknown location', 'Άγνωστη τοποθεσία')} <span class="badge">${ad.category || bilingual('General', 'Γενικά')}</span></div>
        <div class="description">${ad.description}</div>
        <div class="meta">${ad.price != null ? `€${ad.price}` : bilingual('Price on request', 'Τιμή κατόπιν επικοινωνίας')}</div>
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
  status.textContent = bilingual('Searching…', 'Αναζήτηση…');
  resultsSection.style.display = 'none';

  try {
    const res = await fetch('/api/ai/search-ads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || bilingual('Failed to search ads', 'Αποτυχία αναζήτησης αγγελιών'));

    const ads = data.ads || [];
    const filters = data.filters || {};
    status.textContent = bilingual(
      `Filters: keywords="${filters.keywords || ''}" ${filters.category ? '• category=' + filters.category : ''} ${filters.location ? '• location=' + filters.location : ''}`,
      `Φίλτρα: λέξεις-κλειδιά="${filters.keywords || ''}" ${filters.category ? '• κατηγορία=' + filters.category : ''} ${filters.location ? '• τοποθεσία=' + filters.location : ''}`
    );
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
    resultsSection.innerHTML = `<h2>${bilingual('Results', 'Αποτελέσματα')}</h2><p>${bilingual('No ads found. Try another query.', 'Δεν βρέθηκαν αγγελίες. Δοκιμάστε άλλη αναζήτηση.')}</p>`;
    return;
  }

  const list = ads.map((ad) => createAdCardMarkup(ad)).join('');

  resultsSection.innerHTML = `<h2>${bilingual('Results', 'Αποτελέσματα')}</h2>${list}`;
  attachAdCardHandlers(resultsSection);
}

async function loadRecentAds() {
  const listEl = document.getElementById('recent-list');
  if (!listEl) return;
  listEl.innerHTML = bilingual('Loading recent ads…', 'Φόρτωση πρόσφατων αγγελιών…');
  try {
    const res = await fetch('/api/ads/recent');
    const data = await res.json();
    const ads = data.ads || [];
    if (!ads.length) {
      listEl.innerHTML = `<p>${bilingual('No ads yet. Be the first to create one!', 'Δεν υπάρχουν ακόμη αγγελίες. Γίνετε ο πρώτος που θα δημιουργήσει μία!')}</p>`;
      return;
    }

    listEl.innerHTML = ads.map((ad) => createAdCardMarkup(ad)).join('');
    attachAdCardHandlers(listEl);
  } catch (error) {
    listEl.innerHTML = `<p class="error">${bilingual('Failed to load recent ads.', 'Αποτυχία φόρτωσης πρόσφατων αγγελιών.')}</p>`;
  }
}

async function openAdDetail(adId) {
  if (!adId) return;
  mainEl.innerHTML = `<div class="card ad-detail"><p class="status">${bilingual('Loading listing…', 'Φόρτωση αγγελίας…')}</p></div>`;

  try {
    const res = await fetch(`/api/ads/${adId}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || bilingual('Failed to load listing', 'Αποτυχία φόρτωσης αγγελίας'));
    }

    if (!data.ad) {
      throw new Error(bilingual('Listing not found', 'Η αγγελία δεν βρέθηκε'));
    }

    renderAdDetail(data.ad);
  } catch (error) {
    mainEl.innerHTML = `<div class="card ad-detail"><p class="error">${error.message}</p><div class="actions"><button class="button secondary" id="detail-back">${bilingual('Back', 'Πίσω')}</button></div></div>`;
    const backBtn = document.getElementById('detail-back');
    if (backBtn) backBtn.addEventListener('click', renderHome);
  }
}

function renderAdDetail(ad) {
  setActiveNav('');
  const gallery = ad.images?.length
    ? `<div class="detail-gallery">${ad.images
        .map((img, idx) => `<img src="${img}" alt="${ad.title} ${bilingual('photo', 'φωτογραφία')} ${idx + 1}">`)
        .join('')}</div>`
    : `<p class="status subtle">${bilingual('No photos provided for this listing.', 'Δεν υπάρχουν φωτογραφίες για αυτή την αγγελία.')}</p>`;

  const priceLabel = ad.price != null ? `• €${ad.price}` : `• ${bilingual('Price on request', 'Τιμή κατόπιν επικοινωνίας')}`;

  mainEl.innerHTML = `
    <div class="card ad-detail">
      <div class="actions" style="margin-bottom: 8px;">
        <button class="button secondary" id="detail-back">← ${bilingual('Back', 'Πίσω')}</button>
      </div>
      <div class="detail-header">
        <h1>${ad.title}</h1>
        <div class="meta">${ad.location || bilingual('Unknown location', 'Άγνωστη τοποθεσία')} <span class="badge">${ad.category || bilingual('General', 'Γενικά')}</span> ${priceLabel}</div>
        <div class="status subtle">${bilingual('Posted', 'Δημοσιεύτηκε')} ${new Date(ad.created_at).toLocaleString()}</div>
      </div>
      ${gallery}
      <div style="margin-top: 14px;">
        <h3>${bilingual('Description', 'Περιγραφή')}</h3>
        <p class="description">${ad.description || bilingual('No description provided.', 'Δεν δόθηκε περιγραφή.')}</p>
      </div>
    </div>
  `;

  const backBtn = document.getElementById('detail-back');
  if (backBtn) backBtn.addEventListener('click', renderHome);
}

async function handleAuth({ type, emailInput, passwordInput, statusEl }) {
  const email = document.getElementById(emailInput)?.value?.trim();
  const password = document.getElementById(passwordInput)?.value || '';
  const status = document.getElementById(statusEl);

  if (!status) return;
  status.textContent = bilingual('Submitting…', 'Υποβολή…');
  status.classList.remove('error', 'success');

  try {
    const res = await fetch(`/api/auth/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || bilingual('Request failed', 'Η αίτηση απέτυχε'));
    status.textContent = data.message || bilingual('Success', 'Επιτυχία');
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

updateAccountNav();
renderHome();
