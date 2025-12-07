const mainEl = document.getElementById('main');
const navButtons = document.querySelectorAll('.nav-btn');
const menuToggle = document.querySelector('.menu-toggle');
const backdrop = document.querySelector('.backdrop');
const languageButtons = document.querySelectorAll('.lang-btn');

let lastCreatedAd = null;
let currentDraftAd = null;
let attachedImages = [];
const AUTH_STORAGE_KEY = 'speedlist:user';
const LANGUAGE_STORAGE_KEY = 'speedlist:language';
let currentView = { name: 'home' };
let currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'el';

const translations = {
  en: {
    logo: 'speedlist.gr',
    navHome: 'Home',
    navAccount: 'My account',
    navAbout: 'About',
    menuToggleLabel: 'Toggle menu',
    heroTitle: 'Find the perfect listing with AI',
    heroSubtitle: 'Describe what you need and get instant suggestions.',
    heroPlaceholder: 'Describe what you are looking for...',
    searchButton: 'Search listings with AI',
    recentHeading: 'Recent listings',
    searchOnlyTitle: 'Search listings with AI',
    searchOnlySubtitle: 'Write what you want in natural language and we will turn it into filters.',
    searchOnlyPlaceholder: 'Find me an electric bike in Athens up to €800',
    loginTitle: 'Sign in',
    loginSubtitle: 'Sign in to create and manage listings.',
    loginEmailLabel: 'Email',
    loginPasswordLabel: 'Password',
    loginEmailPlaceholder: 'you@example.com',
    loginPasswordPlaceholder: '••••••',
    loginButton: 'Sign in',
    registerTitle: 'Create account',
    registerSubtitle: 'Register to save your activity.',
    registerPasswordPlaceholder: 'At least 6 characters',
    registerButton: 'Register',
    loggedInTitle: 'You are signed in',
    loggedInStatus: 'Signed in as <strong>{email}</strong>.',
    gotoAccountButton: 'Go to account',
    logoutButton: 'Sign out',
    accountTitle: 'My account',
    accountPrompt: 'Sign in to see your profile.',
    accountLoginButton: 'Sign in / Register',
    accountManageSubtitle: 'Manage your details on SpeedList.',
    accountCreatedLabel: 'Created',
    accountLastAdWithTitle: 'Latest listing: <strong>{title}</strong>',
    accountLastAdEmpty: 'Create a listing to see it here.',
    accountCreateHeading: 'Create a new listing with AI',
    accountCreateSubheading: 'Use your account to draft and save listings.',
    accountPromptPlaceholder: 'Describe what you want to publish...',
    uploadTitle: 'Add photos (optional)',
    uploadCopy: 'Drag or click to upload up to 4 images that will help the AI.',
    uploadButton: 'Add images',
    uploadStatusDefault: 'Add up to 4 photos to help the AI (drag & drop supported).',
    uploadStatusLimit: 'You reached the image limit (4). Remove one to add another.',
    uploadStatusRejected: 'Skipped {count} files. Only images up to 3MB are allowed.',
    uploadStatusAdded: 'Images added and will be sent with your request.',
    createButton: 'Create listing with AI',
    createProcessing: 'Processing…',
    createError: 'Failed to create listing',
    createSuccess: 'Review the AI draft below and edit before saving.',
    saveProcessing: 'Saving…',
    saveError: 'Failed to save the listing',
    saveSuccess: 'Listing saved after your approval.',
    previewHeading: 'Listing preview',
    editAdHeading: 'Review and edit your draft',
    reviewInstructions: 'Edit any field you want and then approve to save the listing.',
    approveButton: 'Approve & Save',
    fieldTitleLabel: 'Title',
    fieldDescriptionLabel: 'Description',
    fieldCategoryLabel: 'Category',
    fieldLocationLabel: 'Location',
    fieldPriceLabel: 'Price (€)',
    previewNoImages: 'No images were added.',
    previewPriceOnRequest: 'Price upon request',
    previewLocationFallback: 'Unknown location',
    previewCategoryFallback: 'General',
    previewNoDescription: 'No description provided.',
    adImageAlt: 'Listing image {index}',
    resultsHeading: 'Results',
    resultsEmpty: 'No listings found. Try another search.',
    searchProcessing: 'Searching…',
    searchError: 'Failed to search listings',
    searchFilters: 'Filters: keywords="{keywords}" {category} {location}',
    filterCategoryPrefix: '• category=',
    filterLocationPrefix: '• location=',
    recentLoading: 'Loading recent listings…',
    recentEmpty: 'There are no listings yet. Be the first!',
    recentError: 'Failed to load recent listings.',
    adCardNoImage: 'No image',
    adCardUnknownLocation: 'Unknown location',
    adCardGeneralCategory: 'General',
    openAdDetailLoading: 'Loading listing…',
    openAdDetailError: 'Failed to load listing',
    openAdDetailNotFound: 'Listing not found',
    adDetailBack: '← Back',
    adDetailNoPhotos: 'There are no photos for this listing.',
    adDetailPriceOnRequest: '• Price upon request',
    adDetailDescriptionHeading: 'Description',
    adDetailPostedAt: 'Posted {date}',
    adDetailTagsHeading: 'Tags',
    adDetailContactHeading: 'Contact',
    contactPhoneLabel: 'Phone',
    contactEmailLabel: 'Email',
    contactNotProvided: 'Not provided',
    adVisitsLabel: 'Visits: {count}',
    reportAdButton: 'Report listing',
    reportAdSuccess: 'Thank you. Your report was sent.',
    reportAdError: 'Could not send the report.',
    authSending: 'Sending…',
    authErrorGeneric: 'Request failed',
    homeTitle: 'Home',
    accountNavLabel: 'My account',
    searchStatusPrefix: 'Filters:',
    detailBack: 'Back',
    aboutTitle: 'About speedlist.gr',
    aboutDescription:
      'SpeedList is a lean AI-powered classifieds experience. Describe what you want to publish or find and the AI turns it into organized listings and smart filters.',
    aboutPoint1: 'Create listings in seconds with natural language.',
    aboutPoint2: 'Search existing listings by writing simple sentences.',
    aboutPoint3: 'Lightweight, fast, and private — the AI runs on the server.',
    authRegistrationSuccess: 'Account created. You are now signed in.',
    authLoginSuccess: 'Login successful.',
    authMissingFields: 'Email and password are required',
    authInvalidEmail: 'Please provide a valid email address',
    authPasswordLength: 'Password must be at least 6 characters',
    authEmailExists: 'Email already registered',
    authInvalidCredentials: 'Invalid email or password',
    authRegistrationFailed: 'Registration failed',
    authLoginFailed: 'Login failed'
  },
  el: {
    logo: 'speedlist.gr',
    navHome: 'Αρχική',
    navAccount: 'Ο λογαριασμός μου',
    navAbout: 'Σχετικά',
    menuToggleLabel: 'Εναλλαγή μενού',
    heroTitle: 'Ψάξε γρήγορα και αποτελεσματικά με AI',
    heroSubtitle: 'Περιέγραψε τι ζητάς (π.χ. "ηλεκτρικό ποδήλατο στην Αθήνα έως 800€").',
    heroPlaceholder: 'Περιέγραψε τι ψάχνεις...',
    searchButton: 'Αναζήτηση αγγελιών με AI',
    recentHeading: 'Πρόσφατες αγγελίες',
    searchOnlyTitle: 'Αναζήτησε αγγελίες με AI',
    searchOnlySubtitle: 'Γράψε αυτό που θες με φυσική γλώσσα και θα το κάνουμε φίλτρα.',
    searchOnlyPlaceholder: 'Βρες μου ένα ηλεκτρικό ποδήλατο στην Αθήνα έως 800€',
    loginTitle: 'Σύνδεση',
    loginSubtitle: 'Συνδέσου για να δημιουργείς και να διαχειρίζεσαι αγγελίες.',
    loginEmailLabel: 'Email',
    loginPasswordLabel: 'Κωδικός',
    loginEmailPlaceholder: 'esena@example.com',
    loginPasswordPlaceholder: '••••••',
    loginButton: 'Σύνδεση',
    registerTitle: 'Δημιουργία λογαριασμού',
    registerSubtitle: 'Κάνε εγγραφή για να αποθηκεύεις τις κινήσεις σου.',
    registerPasswordPlaceholder: 'Τουλάχιστον 6 χαρακτήρες',
    registerButton: 'Εγγραφή',
    loggedInTitle: 'Είσαι συνδεδεμένος',
    loggedInStatus: 'Σύνδεση ως <strong>{email}</strong>.',
    gotoAccountButton: 'Μετάβαση στον λογαριασμό',
    logoutButton: 'Αποσύνδεση',
    accountTitle: 'Ο λογαριασμός μου',
    accountPrompt: 'Συνδέσου για να δεις το προφίλ σου.',
    accountLoginButton: 'Σύνδεση / Εγγραφή',
    accountManageSubtitle: 'Διαχειρίσου τα στοιχεία σου στο SpeedList.',
    accountCreatedLabel: 'Δημιουργία',
    accountLastAdWithTitle: 'Τελευταία αγγελία: <strong>{title}</strong>',
    accountLastAdEmpty: 'Δημιούργησε μια αγγελία για να εμφανιστεί εδώ.',
    accountCreateHeading: 'Δημιούργησε νέα αγγελία με AI',
    accountCreateSubheading: 'Χρησιμοποίησε τον λογαριασμό σου για να συντάξεις και να αποθηκεύσεις αγγελίες.',
    accountPromptPlaceholder: 'Περιέγραψε τι θέλεις να δημοσιεύσεις...',
    uploadTitle: 'Πρόσθεσε φωτογραφίες (προαιρετικό)',
    uploadCopy: 'Σύρε ή κάνε κλικ για να ανεβάσεις έως 4 εικόνες που θα βοηθήσουν το AI.',
    uploadButton: 'Προσθήκη εικόνων',
    uploadStatusDefault: 'Πρόσθεσε έως 4 φωτογραφίες για να βοηθήσεις το AI (υποστηρίζεται drag & drop).',
    uploadStatusLimit: 'Έχεις φτάσει το όριο εικόνων (4). Αφαίρεσε μία για να προσθέσεις άλλη.',
    uploadStatusRejected: 'Παραλείφθηκαν {count} αρχεία. Επιτρέπονται μόνο εικόνες έως 3MB.',
    uploadStatusAdded: 'Οι εικόνες προστέθηκαν και θα σταλούν με το αίτημά σου.',
    createButton: 'Δημιουργία αγγελίας με AI',
    createProcessing: 'Γίνεται επεξεργασία…',
    createError: 'Αποτυχία δημιουργίας αγγελίας',
    createSuccess: 'Δες το προσχέδιο και κάνε αλλαγές πριν το αποθηκεύσεις.',
    saveProcessing: 'Αποθήκευση…',
    saveError: 'Αποτυχία αποθήκευσης αγγελίας',
    saveSuccess: 'Η αγγελία αποθηκεύτηκε μετά την έγκρισή σου.',
    previewHeading: 'Προεπισκόπηση αγγελίας',
    editAdHeading: 'Έλεγξε και επεξεργάσου το προσχέδιο',
    reviewInstructions: 'Διόρθωσε ό,τι χρειάζεται και μετά πάτησε έγκριση για αποθήκευση.',
    approveButton: 'Έγκριση & Αποθήκευση',
    fieldTitleLabel: 'Τίτλος',
    fieldDescriptionLabel: 'Περιγραφή',
    fieldCategoryLabel: 'Κατηγορία',
    fieldLocationLabel: 'Τοποθεσία',
    fieldPriceLabel: 'Τιμή (€)',
    previewNoImages: 'Δεν προστέθηκαν εικόνες.',
    previewPriceOnRequest: 'Τιμή κατόπιν συνεννόησης',
    previewLocationFallback: 'Άγνωστη τοποθεσία',
    previewCategoryFallback: 'Γενικά',
    previewNoDescription: 'Δεν δόθηκε περιγραφή.',
    adImageAlt: 'Εικόνα αγγελίας {index}',
    resultsHeading: 'Αποτελέσματα',
    resultsEmpty: 'Δεν βρέθηκαν αγγελίες. Δοκίμασε άλλη αναζήτηση.',
    searchProcessing: 'Αναζήτηση…',
    searchError: 'Αποτυχία αναζήτησης αγγελιών',
    searchFilters: 'Φίλτρα: λέξεις-κλειδιά="{keywords}" {category} {location}',
    filterCategoryPrefix: '• κατηγορία=',
    filterLocationPrefix: '• τοποθεσία=',
    recentLoading: 'Φόρτωση πρόσφατων αγγελιών…',
    recentEmpty: 'Δεν υπάρχουν ακόμη αγγελίες. Γίνε ο πρώτος!',
    recentError: 'Αποτυχία φόρτωσης πρόσφατων αγγελιών.',
    adCardNoImage: 'Χωρίς εικόνα',
    adCardUnknownLocation: 'Άγνωστη τοποθεσία',
    adCardGeneralCategory: 'Γενικά',
    openAdDetailLoading: 'Φόρτωση αγγελίας…',
    openAdDetailError: 'Αποτυχία φόρτωσης αγγελίας',
    openAdDetailNotFound: 'Δεν βρέθηκε η αγγελία',
    adDetailBack: '← Πίσω',
    adDetailNoPhotos: 'Δεν υπάρχουν φωτογραφίες για την αγγελία.',
    adDetailPriceOnRequest: '• Τιμή κατόπιν συνεννόησης',
    adDetailDescriptionHeading: 'Περιγραφή',
    adDetailPostedAt: 'Αναρτήθηκε {date}',
    adDetailTagsHeading: 'Ετικέτες',
    adDetailContactHeading: 'Επικοινωνία',
    contactPhoneLabel: 'Τηλέφωνο',
    contactEmailLabel: 'Email',
    contactNotProvided: 'Δεν δόθηκε',
    adVisitsLabel: 'Επισκέψεις: {count}',
    reportAdButton: 'Αναφορά αγγελίας',
    reportAdSuccess: 'Ευχαριστούμε. Η αναφορά στάλθηκε.',
    reportAdError: 'Δεν ήταν δυνατή η αποστολή της αναφοράς.',
    authSending: 'Αποστολή…',
    authErrorGeneric: 'Το αίτημα απέτυχε',
    homeTitle: 'Αρχική',
    accountNavLabel: 'Ο λογαριασμός μου',
    searchStatusPrefix: 'Φίλτρα:',
    detailBack: 'Πίσω',
    aboutTitle: 'Σχετικά με το speedlist.gr',
    aboutDescription:
      'Το SpeedList είναι μια λιτή εμπειρία αγγελιών με AI. Περιέγραψε τι θέλεις να δημοσιεύσεις ή να βρεις και το AI το μετατρέπει σε οργανωμένες αγγελίες και έξυπνα φίλτρα.',
    aboutPoint1: 'Δημιούργησε αγγελίες σε δευτερόλεπτα με φυσική γλώσσα.',
    aboutPoint2: 'Αναζήτησε υπάρχουσες αγγελίες γράφοντας απλές προτάσεις.',
    aboutPoint3: 'Ελαφρύ, γρήγορο και ιδιωτικό — το AI τρέχει στον server.',
    authRegistrationSuccess: 'Ο λογαριασμός δημιουργήθηκε. Συνδέθηκες.',
    authLoginSuccess: 'Επιτυχής σύνδεση.',
    authMissingFields: 'Απαιτούνται email και κωδικός',
    authInvalidEmail: 'Παρακαλώ δώσε ένα έγκυρο email',
    authPasswordLength: 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες',
    authEmailExists: 'Το email είναι ήδη καταχωρημένο',
    authInvalidCredentials: 'Λανθασμένο email ή κωδικός',
    authRegistrationFailed: 'Η εγγραφή απέτυχε',
    authLoginFailed: 'Η σύνδεση απέτυχε'
  }
};

function t(key, vars = {}) {
  const langTable = translations[currentLanguage] || translations.el;
  const fallbackTable = translations.el;
  const template = (langTable && langTable[key]) || (fallbackTable && fallbackTable[key]) || key;
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
}

function resolveLocale(lang) {
  return lang === 'el' ? 'el-GR' : 'en-US';
}

function setView(name, data = null) {
  currentView = { name, data };
}

function updateLanguageButtons() {
  languageButtons.forEach((btn) => {
    const isActive = btn.dataset.lang === currentLanguage;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
  });
}

function applyStaticTranslations() {
  document.documentElement.lang = currentLanguage;
  const logo = document.querySelector('.logo');
  if (logo) {
    const logoImg = logo.querySelector('img');
    if (logoImg) {
      logoImg.alt = t('logo');
    } else {
      logo.textContent = t('logo');
    }
    logo.setAttribute('aria-label', t('logo'));
  }

  const navHome = document.querySelector('.nav-btn[data-target="home"]');
  const navAccount = document.querySelector('.nav-btn[data-target="account"]');
  const navAbout = document.querySelector('.nav-btn[data-target="about"]');
  if (navHome) navHome.textContent = t('navHome');
  if (navAccount) navAccount.textContent = t('navAccount');
  if (navAbout) navAbout.textContent = t('navAbout');
  if (menuToggle) menuToggle.setAttribute('aria-label', t('menuToggleLabel'));
  updateAccountNav();
}

function rerenderCurrentView() {
  switch (currentView.name) {
    case 'account':
      renderAccount();
      break;
    case 'about':
      renderAbout();
      break;
    case 'login':
      renderLogin();
      break;
    case 'detail':
      if (currentView.data) {
        renderAdDetail(currentView.data);
      } else {
        renderHome();
      }
      break;
    case 'home':
    default:
      renderHome();
      break;
  }
}

function setLanguage(lang) {
  if (!translations[lang]) return;
  currentLanguage = lang;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  updateLanguageButtons();
  applyStaticTranslations();
  rerenderCurrentView();
}


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
      updateStatus(t('uploadStatusLimit'), true);
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
      updateStatus(t('uploadStatusRejected', { count: rejected }), true);
    } else {
      updateStatus(t('uploadStatusAdded'), false);
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
  updateStatus(t('uploadStatusDefault'));
}

function getPromptPayload(prompt) {
  return {
    prompt,
    images: attachedImages.map((img) => img.dataUrl),
    language: currentLanguage
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

function renderTagPills(tags, limit = 8) {
  if (!Array.isArray(tags) || !tags.length) return '';
  const pills = tags
    .slice(0, limit)
    .map((tag) => `<span class="tag-pill">${tag}</span>`)
    .join('');
  return `<div class="tag-row" aria-label="${t('adDetailTagsHeading')}">${pills}</div>`;
}

function createAdCardMarkup(ad) {
  const thumb = (ad.images || [])[0];
  const description = ad.description || '';
  const truncated = description.length > 140 ? `${description.slice(0, 140)}…` : description;
  const tagsRow = renderTagPills(ad.tags, 5);

  const thumbBlock = thumb
    ? `<div class="ad-thumb" style="background-image:url('${thumb}')"></div>`
    : `<div class="ad-thumb">${t('adCardNoImage')}</div>`;

  const price = ad.price != null ? `• €${ad.price}` : '';
  const visits = Number.isFinite(Number(ad.visits)) ? `• ${t('adVisitsLabel', { count: ad.visits })}` : '';
  const location = ad.location || t('adCardUnknownLocation');
  const category = ad.category || t('adCardGeneralCategory');

  return `
    <article class="ad-card clickable" data-id="${ad.id}" tabindex="0">
      ${thumbBlock}
      <div>
        <div class="title">${ad.title}</div>
        <div class="meta">${location} <span class="badge">${category}</span> ${price} ${visits}</div>
        <div class="description">${truncated}</div>
        ${tagsRow}
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
  setView('home');
  setActiveNav('home');
  mainEl.innerHTML = `
    <div class="hero-card">
      <h1>${t('heroTitle')}</h1>
      <p>${t('heroSubtitle')}</p>
      <textarea id="prompt" class="prompt-area" placeholder="${t('heroPlaceholder')}"></textarea>
      <div class="actions">
        <button id="search-btn" class="button primary">${t('searchButton')}</button>
      </div>
      <div id="status" class="status"></div>
    </div>
    <div class="section" id="results-section" style="display:none;"></div>
    <div class="section" id="recent-section">
      <h2>${t('recentHeading')}</h2>
      <div id="recent-list"></div>
    </div>
  `;

  document.getElementById('search-btn').addEventListener('click', handleSearchAds);
  loadRecentAds();
}

function renderSearchOnly() {
  setView('home');
  setActiveNav('search');
  mainEl.innerHTML = `
    <div class="hero-card">
      <h1>${t('searchOnlyTitle')}</h1>
      <p>${t('searchOnlySubtitle')}</p>
      <textarea id="prompt" class="prompt-area" placeholder="${t('searchOnlyPlaceholder')}"></textarea>
      <div class="actions">
        <button id="search-btn" class="button primary">${t('searchButton')}</button>
      </div>
      <div id="status" class="status"></div>
    </div>
    <div class="section" id="results-section" style="display:none;"></div>
  `;

  document.getElementById('search-btn').addEventListener('click', handleSearchAds);
}

function renderLogin() {
  setView('login');
  setActiveNav('login');
  const user = getStoredUser();
  mainEl.innerHTML = `
    <div class="card-grid">
      <div class="card auth-card">
        <h2>${t('loginTitle')}</h2>
        <p class="status subtle">${t('loginSubtitle')}</p>
        <div class="field">
          <label for="login-email">${t('loginEmailLabel')}</label>
          <input id="login-email" class="input" type="email" placeholder="${t('loginEmailPlaceholder')}" />
        </div>
        <div class="field">
          <label for="login-password">${t('loginPasswordLabel')}</label>
          <input id="login-password" class="input" type="password" placeholder="${t('loginPasswordPlaceholder')}" />
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
          <label for="register-email">${t('loginEmailLabel')}</label>
          <input id="register-email" class="input" type="email" placeholder="${t('loginEmailPlaceholder')}" />
        </div>
        <div class="field">
          <label for="register-password">${t('loginPasswordLabel')}</label>
          <input id="register-password" class="input" type="password" placeholder="${t('registerPasswordPlaceholder')}" />
        </div>
        <div class="actions">
          <button id="register-btn" class="button secondary">${t('registerButton')}</button>
        </div>
        <div id="register-status" class="status"></div>
      </div>

      ${user ? `
        <div class="card auth-card">
          <h2>${t('loggedInTitle')}</h2>
          <p class="status success">${t('loggedInStatus', { email: user.email })}</p>
          <div class="actions">
            <button id="go-account" class="button secondary">${t('gotoAccountButton')}</button>
            <button id="logout-btn" class="button">${t('logoutButton')}</button>
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
  setView('account');
  setActiveNav('account');
  const user = getStoredUser();
  if (!user) {
    mainEl.innerHTML = `
      <div class="card" style="max-width:520px; margin:0 auto;">
        <h2>${t('accountTitle')}</h2>
        <p class="status">${t('accountPrompt')}</p>
        <div class="actions">
          <button class="button primary" id="account-login">${t('accountLoginButton')}</button>
        </div>
      </div>
    `;
    document.getElementById('account-login').addEventListener('click', renderLogin);
    return;
  }

  const createdAdCopy = lastCreatedAd
    ? t('accountLastAdWithTitle', { title: lastCreatedAd.title })
    : t('accountLastAdEmpty');

  mainEl.innerHTML = `
    <div class="card" style="max-width:620px; margin:0 auto 16px;">
      <h2>${t('accountTitle')}</h2>
      <p class="status">${t('accountManageSubtitle')}</p>
      <div class="profile-row">
        <div>
          <div class="label">${t('loginEmailLabel')}</div>
          <div class="value">${user.email}</div>
        </div>
        <div>
          <div class="label">${t('accountCreatedLabel')}</div>
          <div class="value">${new Date(user.created_at).toLocaleString()}</div>
        </div>
      </div>
      <div class="status">${createdAdCopy}</div>
      <div class="actions">
        <button id="account-logout" class="button">${t('logoutButton')}</button>
      </div>
    </div>

    <div class="hero-card">
      <h2>${t('accountCreateHeading')}</h2>
      <p>${t('accountCreateSubheading')}</p>
      <textarea id="prompt" class="prompt-area" placeholder="${t('accountPromptPlaceholder')}"></textarea>
      <div class="upload-area" id="upload-area">
        <div>
          <div class="upload-title">${t('uploadTitle')}</div>
          <p class="upload-copy">${t('uploadCopy')}</p>
        </div>
        <button id="upload-btn" class="button secondary" type="button">${t('uploadButton')}</button>
        <input id="image-input" type="file" accept="image/*" multiple hidden />
      </div>
      <div id="upload-status" class="status subtle"></div>
      <div id="image-previews" class="image-previews"></div>
      <div class="actions">
        <button id="create-btn" class="button primary">${t('createButton')}</button>
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
  setView('about');
  setActiveNav('about');
  mainEl.innerHTML = `
    <div class="card" style="max-width:720px; margin:0 auto;">
      <h2>${t('aboutTitle')}</h2>
      <p>${t('aboutDescription')}</p>
      <ul>
        <li>${t('aboutPoint1')}</li>
        <li>${t('aboutPoint2')}</li>
        <li>${t('aboutPoint3')}</li>
      </ul>
    </div>
  `;
}

async function handleCreateAd() {
  const prompt = document.getElementById('prompt').value.trim();
  const status = document.getElementById('status');
  const previewSection = document.getElementById('preview-section');
  const payload = getPromptPayload(prompt);
  status.textContent = t('createProcessing');
  previewSection.style.display = 'none';

  currentDraftAd = null;

  const saveStatus = document.getElementById('save-status');
  if (saveStatus) {
    saveStatus.textContent = '';
    saveStatus.classList.remove('error', 'success');
  }

  try {
    const res = await fetch('/api/ai/create-ad', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Language': currentLanguage
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) throw new Error(data.error || t('createError'));

    const ad = { ...data.ad, images: attachedImages };
    currentDraftAd = ad;
    status.textContent = t('createSuccess');
    status.classList.remove('error');
    status.classList.add('success');
    renderDraftEditor(ad);
  } catch (error) {
    status.textContent = error.message;
    status.classList.remove('success');
    status.classList.add('error');
  }
}

function renderDraftEditor(ad) {
  const previewSection = document.getElementById('preview-section');
  if (!previewSection) return;

  const galleryMarkup = ad.images?.length
    ? `<div class="detail-gallery">${ad.images
        .map((img, idx) => `<img src="${img}" alt="${t('adImageAlt', { index: idx + 1 })}">`)
        .join('')}</div>`
    : `<p class="status subtle">${t('previewNoImages')}</p>`;
  const visitsLabel = t('adVisitsLabel', { count: Number.isFinite(Number(ad.visits)) ? Number(ad.visits) : 0 });
  const contactPhone = ad.contact_phone || t('contactNotProvided');
  const contactEmail = ad.contact_email || t('contactNotProvided');

  previewSection.innerHTML = `
    <h2>${t('previewHeading')}</h2>
    <div class="ad-card">
      <div class="title">${ad.title}</div>
      <div class="meta">${ad.location || t('previewLocationFallback')} <span class="badge">${ad.category || t('previewCategoryFallback')}</span></div>
      <div class="description">${ad.description || t('previewNoDescription')}</div>
      <div class="meta">${ad.price != null ? `€${ad.price}` : t('previewPriceOnRequest')}</div>
      <div class="meta">${visitsLabel}</div>
      <div class="profile-row">
        <div>
          <div class="label">${t('contactPhoneLabel')}</div>
          <div class="value">${contactPhone}</div>
        </div>
        <div>
          <div class="label">${t('contactEmailLabel')}</div>
          <div class="value">${contactEmail}</div>
        </div>
      </div>
    </div>
    ${galleryMarkup}
    <div class="card" id="ad-editor">
      <h3>${t('editAdHeading')}</h3>
      <p class="status subtle">${t('reviewInstructions')}</p>
      <div class="field">
        <label for="ad-title-input">${t('fieldTitleLabel')}</label>
        <input id="ad-title-input" type="text" />
      </div>
      <div class="field">
        <label for="ad-description-input">${t('fieldDescriptionLabel')}</label>
        <textarea id="ad-description-input" rows="4"></textarea>
      </div>
      <div class="field">
        <label for="ad-category-input">${t('fieldCategoryLabel')}</label>
        <input id="ad-category-input" type="text" />
      </div>
      <div class="field">
        <label for="ad-location-input">${t('fieldLocationLabel')}</label>
        <input id="ad-location-input" type="text" />
      </div>
      <div class="field">
        <label for="ad-price-input">${t('fieldPriceLabel')}</label>
        <input id="ad-price-input" type="number" step="0.01" />
      </div>
      <div class="field">
        <label for="ad-contact-phone">${t('contactPhoneLabel')}</label>
        <input id="ad-contact-phone" type="text" />
      </div>
      <div class="field">
        <label for="ad-contact-email">${t('contactEmailLabel')}</label>
        <input id="ad-contact-email" type="email" />
      </div>
      <div class="actions">
        <button id="approve-btn" class="button primary">${t('approveButton')}</button>
      </div>
      <div id="save-status" class="status"></div>
    </div>
  `;

  previewSection.style.display = 'block';

  document.getElementById('ad-title-input').value = ad.title || '';
  document.getElementById('ad-description-input').value = ad.description || '';
  document.getElementById('ad-category-input').value = ad.category || '';
  document.getElementById('ad-location-input').value = ad.location || '';
  document.getElementById('ad-price-input').value = ad.price ?? '';
  document.getElementById('ad-contact-phone').value = ad.contact_phone || '';
  document.getElementById('ad-contact-email').value = ad.contact_email || '';

  document.getElementById('approve-btn').addEventListener('click', handleApproveAd);
}

async function handleApproveAd() {
  if (!currentDraftAd) return;

  const saveStatus = document.getElementById('save-status');
  if (!saveStatus) return;

  saveStatus.textContent = t('saveProcessing');
  saveStatus.classList.remove('error', 'success');

  const priceValue = document.getElementById('ad-price-input').value;
  const numericPrice = priceValue === '' ? null : Number(priceValue);

  const approvedAd = {
    ...currentDraftAd,
    title: document.getElementById('ad-title-input').value.trim(),
    description: document.getElementById('ad-description-input').value.trim(),
    category: document.getElementById('ad-category-input').value.trim(),
    location: document.getElementById('ad-location-input').value.trim(),
    price: Number.isFinite(numericPrice) ? numericPrice : null,
    contact_phone: document.getElementById('ad-contact-phone').value.trim(),
    contact_email: document.getElementById('ad-contact-email').value.trim(),
    images: currentDraftAd.images || attachedImages
  };

  try {
    const res = await fetch('/api/ads/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Language': currentLanguage
      },
      body: JSON.stringify({ ad: approvedAd, language: currentLanguage })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('saveError'));

    const savedAd = data.ad;
    lastCreatedAd = savedAd;
    currentDraftAd = savedAd;
    saveStatus.textContent = t('saveSuccess');
    saveStatus.classList.remove('error');
    saveStatus.classList.add('success');
    renderDraftEditor(savedAd);
    loadRecentAds();
  } catch (error) {
    saveStatus.textContent = error.message;
    saveStatus.classList.remove('success');
    saveStatus.classList.add('error');
  }
}

async function handleSearchAds() {
  const prompt = document.getElementById('prompt').value.trim();
  const status = document.getElementById('status');
  const resultsSection = document.getElementById('results-section');
  const payload = { prompt, language: currentLanguage };
  status.textContent = t('searchProcessing');
  resultsSection.style.display = 'none';

  try {
    const res = await fetch('/api/ai/search-ads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Language': currentLanguage
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('searchError'));

    const ads = data.ads || [];
    const filters = data.filters || {};
    const categoryPart = filters.category ? `${t('filterCategoryPrefix')}${filters.category}` : '';
    const locationPart = filters.location ? `${t('filterLocationPrefix')}${filters.location}` : '';
    status.textContent = t('searchFilters', {
      keywords: filters.keywords || '',
      category: categoryPart,
      location: locationPart
    });
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
    resultsSection.innerHTML = `<h2>${t('resultsHeading')}</h2><p>${t('resultsEmpty')}</p>`;
    return;
  }

  const list = ads.map((ad) => createAdCardMarkup(ad)).join('');

  resultsSection.innerHTML = `<h2>${t('resultsHeading')}</h2>${list}`;
  attachAdCardHandlers(resultsSection);
}

async function loadRecentAds() {
  const listEl = document.getElementById('recent-list');
  if (!listEl) return;
  listEl.innerHTML = t('recentLoading');
  try {
    const res = await fetch('/api/ads/recent', {
      headers: { 'X-Language': currentLanguage }
    });
    const data = await res.json();
    const ads = data.ads || [];
    if (!ads.length) {
      listEl.innerHTML = `<p>${t('recentEmpty')}</p>`;
      return;
    }

    listEl.innerHTML = ads.map((ad) => createAdCardMarkup(ad)).join('');
    attachAdCardHandlers(listEl);
  } catch (error) {
    listEl.innerHTML = `<p class="error">${t('recentError')}</p>`;
  }
}

async function openAdDetail(adId) {
  if (!adId) return;
  setView('detail');
  mainEl.innerHTML = `<div class="card ad-detail"><p class="status">${t('openAdDetailLoading')}</p></div>`;

  try {
    const res = await fetch(`/api/ads/${adId}`, {
      headers: { 'X-Language': currentLanguage }
    });
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || t('openAdDetailError'));
    }

    if (!data.ad) {
      throw new Error(t('openAdDetailNotFound'));
    }

    renderAdDetail(data.ad);
  } catch (error) {
    mainEl.innerHTML = `<div class="card ad-detail"><p class="error">${error.message}</p><div class="actions"><button class="button secondary" id="detail-back">${t('adDetailBack')}</button></div></div>`;
    const backBtn = document.getElementById('detail-back');
    if (backBtn) backBtn.addEventListener('click', renderHome);
  }
}

function renderAdDetail(ad) {
  setView('detail', ad);
  setActiveNav('');
  const gallery = ad.images?.length
    ? `<div class="detail-gallery">${ad.images
        .map((img, idx) => `<img src="${img}" alt="${ad.title} ${t('adImageAlt', { index: idx + 1 })}">`)
        .join('')}</div>`
    : `<p class="status subtle">${t('adDetailNoPhotos')}</p>`;

  const priceLabel = ad.price != null ? `• €${ad.price}` : t('adDetailPriceOnRequest');
  const location = ad.location || t('adCardUnknownLocation');
  const category = ad.category || t('adCardGeneralCategory');
  const tagsBlock = renderTagPills(ad.tags, 20);
  const visitsLabel = t('adVisitsLabel', { count: Number.isFinite(Number(ad.visits)) ? Number(ad.visits) : 0 });
  const phoneValue = ad.contact_phone || t('contactNotProvided');
  const emailValue = ad.contact_email || t('contactNotProvided');

  mainEl.innerHTML = `
    <div class="card ad-detail">
      <div class="actions" style="margin-bottom: 8px;">
        <button class="button secondary" id="detail-back">${t('adDetailBack')}</button>
        <button class="button" id="report-ad">${t('reportAdButton')}</button>
      </div>
      <div class="detail-header">
        <h1>${ad.title}</h1>
        <div class="meta">${location} <span class="badge">${category}</span> ${priceLabel}</div>
        <div class="status subtle">${t('adDetailPostedAt', { date: new Date(ad.created_at).toLocaleString(resolveLocale(currentLanguage)) })}</div>
        <div class="status subtle">${visitsLabel}</div>
      </div>
      ${gallery}
      <div style="margin-top: 14px;">
        <h3>${t('adDetailDescriptionHeading')}</h3>
        <p class="description">${ad.description || t('previewNoDescription')}</p>
      </div>
      <div class="detail-contact" style="margin-top:14px;">
        <h3>${t('adDetailContactHeading')}</h3>
        <div class="profile-row">
          <div>
            <div class="label">${t('contactPhoneLabel')}</div>
            <div class="value">${phoneValue}</div>
          </div>
          <div>
            <div class="label">${t('contactEmailLabel')}</div>
            <div class="value">${emailValue}</div>
          </div>
        </div>
      </div>
      ${tagsBlock ? `<div class="detail-tags"><h3>${t('adDetailTagsHeading')}</h3>${tagsBlock}</div>` : ''}
      <div id="report-status" class="status subtle" aria-live="polite"></div>
    </div>
  `;

  const backBtn = document.getElementById('detail-back');
  if (backBtn) backBtn.addEventListener('click', renderHome);
  const reportBtn = document.getElementById('report-ad');
  if (reportBtn) reportBtn.addEventListener('click', () => reportAd(ad.id));
}

async function reportAd(adId) {
  if (!adId) return;
  const statusEl = document.getElementById('report-status');
  const reason = window.prompt(t('reportAdButton')) || '';

  if (statusEl) {
    statusEl.textContent = '';
    statusEl.classList.remove('error', 'success');
  }

  try {
    const res = await fetch(`/api/ads/${adId}/report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Language': currentLanguage
      },
      body: JSON.stringify({ reason, language: currentLanguage })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('reportAdError'));

    if (statusEl) {
      statusEl.textContent = t('reportAdSuccess');
      statusEl.classList.remove('error');
      statusEl.classList.add('success');
    }
  } catch (error) {
    if (statusEl) {
      statusEl.textContent = t('reportAdError');
      statusEl.classList.remove('success');
      statusEl.classList.add('error');
    }
  }
}

async function handleAuth({ type, emailInput, passwordInput, statusEl }) {
  const email = document.getElementById(emailInput)?.value?.trim();
  const password = document.getElementById(passwordInput)?.value || '';
  const status = document.getElementById(statusEl);

  if (!status) return;
  status.textContent = t('authSending');
  status.classList.remove('error', 'success');

  try {
    const res = await fetch(`/api/auth/${type}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Language': currentLanguage
      },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('authErrorGeneric'));
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
applyStaticTranslations();
renderHome();
