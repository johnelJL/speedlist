const mainEl = document.getElementById('main');
const navButtons = document.querySelectorAll('.nav-btn');
const menuToggle = document.querySelector('.menu-toggle');
const backdrop = document.querySelector('.backdrop');
const languageButtons = document.querySelectorAll('.lang-btn');

let lastCreatedAd = null;
let currentDraftAd = null;
let currentEditingAdId = null;
let attachedImages = [];
let userAdsCache = new Map();
const AUTH_STORAGE_KEY = 'speedlist:user';
const LANGUAGE_STORAGE_KEY = 'speedlist:language';
const RESULTS_LAYOUT_STORAGE_KEY = 'speedlist:results-layout';
let currentView = { name: 'home' };
let currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'el';
let resultsLayout = localStorage.getItem(RESULTS_LAYOUT_STORAGE_KEY) || 'tiles';

function sanitizePhone(value) {
  const normalized = (value || '').trim();
  return normalized === '1234567890' ? '' : normalized;
}

function normalizeImages(list) {
  return (Array.isArray(list) ? list : [])
    .map((img) => (typeof img === 'string' ? img : img?.dataUrl))
    .filter((img) => typeof img === 'string' && img.startsWith('data:image/'));
}

const translations = {
  en: {
    logo: 'speedlist.gr',
    navHome: 'Home',
    navAccount: 'My account',
    navAbout: 'About',
    guestNickname: 'Guest',
    guestStatus: 'Not signed in',
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
    loginNicknameLabel: 'Nickname',
    loginNicknamePlaceholder: 'Pick a display name',
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
    accountNicknameLabel: 'Nickname',
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
    resultsTilesView: 'Tiles view',
    resultsLinesView: 'List view',
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
    reportAdLabel: 'Why are you reporting this listing?',
    reportAdPlaceholder: 'Brief reason (max 300 characters)',
    reportAdSubmit: 'Send report',
    reportAdCancel: 'Cancel',
    reportAdSuccess: 'Thank you. Your report was sent.',
    reportAdError: 'Could not send the report.',
    reportAdTooLong: 'Reports are limited to 300 characters.',
    reportAdRequired: 'Please provide a report reason.',
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
    authRegistrationSuccess: 'Account created. Please verify your email.',
    authLoginSuccess: 'Login successful.',
    authMissingFields: 'Email and password are required',
    authInvalidEmail: 'Please provide a valid email address',
    authPasswordLength: 'Password must be at least 6 characters',
    authEmailExists: 'Email already registered',
    authInvalidCredentials: 'Invalid email or password',
    authRegistrationFailed: 'Registration failed',
    authLoginFailed: 'Login failed',
    authVerificationRequired: 'Please verify your email to continue.',
    authVerificationSent: 'Verification email sent. Check your inbox.',
    authVerificationSuccess: 'Email verified. You can log in now.',
    authVerificationInvalid: 'Verification link is invalid or expired.',
    authUserRequired: 'You must be signed in to continue.',
    accountStatusLabel: 'Status',
    accountVerifiedLabel: 'Verified',
    accountVerificationNotice: 'Verify your email to start creating listings.',
    accountMyAdsHeading: 'Your listings',
    accountMyAdsEmpty: 'You have not created any listings yet.',
    accountMyAdsLoading: 'Loading your listings…',
    editAdButton: 'Edit listing',
    editRemainingLabel: 'Edits left: {count}',
    editLimitReached: 'No edits left for this listing.',
    editModeNotice: 'Editing your published listing. Changes need admin approval again.',
    editSaveSuccess: 'Listing updated and pending approval.',
    adEditApproved: 'Only approved listings can be edited.',
    deactivateAdButton: 'Deactivate',
    reactivateAdButton: 'Reactivate',
    deleteAdButton: 'Delete',
    adStatusApproved: 'Published',
    adStatusPending: 'Pending admin approval',
    adStatusInactive: 'Inactive (hidden)',
    adDeactivateSuccess: 'Listing deactivated.',
    adReactivateSuccess: 'Listing reactivated and pending approval.',
    adDeleteSuccess: 'Listing deleted.',
    adDeleteConfirm: 'Are you sure you want to delete this listing?',
    reactivateNeedsApproval: 'Reactivated listings must be approved by admins again.'
  },
  el: {
    logo: 'speedlist.gr',
    navHome: 'Αρχική',
    navAccount: 'Ο λογαριασμός μου',
    navAbout: 'Σχετικά',
    guestNickname: 'Επισκέπτης',
    guestStatus: 'Δεν έχεις συνδεθεί',
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
    loginNicknameLabel: 'Ψευδώνυμο',
    loginNicknamePlaceholder: 'Διάλεξε ένα εμφανές όνομα',
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
    accountNicknameLabel: 'Ψευδώνυμο',
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
    resultsTilesView: 'Προβολή πλακιδίων',
    resultsLinesView: 'Προβολή λίστας',
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
    reportAdLabel: 'Γιατί αναφέρεις αυτή την αγγελία;',
    reportAdPlaceholder: 'Σύντομος λόγος (έως 300 χαρακτήρες)',
    reportAdSubmit: 'Αποστολή',
    reportAdCancel: 'Άκυρο',
    reportAdSuccess: 'Ευχαριστούμε. Η αναφορά στάλθηκε.',
    reportAdError: 'Δεν ήταν δυνατή η αποστολή της αναφοράς.',
    reportAdTooLong: 'Οι αναφορές περιορίζονται σε 300 χαρακτήρες.',
    reportAdRequired: 'Χρειάζεται να γράψεις τον λόγο.',
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
    authRegistrationSuccess: 'Ο λογαριασμός δημιουργήθηκε. Επαλήθευσε το email σου.',
    authLoginSuccess: 'Επιτυχής σύνδεση.',
    authMissingFields: 'Απαιτούνται email και κωδικός',
    authInvalidEmail: 'Παρακαλώ δώσε ένα έγκυρο email',
    authPasswordLength: 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες',
    authEmailExists: 'Το email είναι ήδη καταχωρημένο',
    authInvalidCredentials: 'Λανθασμένο email ή κωδικός',
    authRegistrationFailed: 'Η εγγραφή απέτυχε',
    authLoginFailed: 'Η σύνδεση απέτυχε',
    authVerificationRequired: 'Πρέπει να επαληθεύσεις το email για να συνεχίσεις.',
    authVerificationSent: 'Στάλθηκε email επαλήθευσης στα εισερχόμενα.',
    authVerificationSuccess: 'Το email επαληθεύτηκε. Μπορείς να συνδεθείς.',
    authVerificationInvalid: 'Ο σύνδεσμος επαλήθευσης δεν είναι έγκυρος ή έχει λήξει.',
    authUserRequired: 'Πρέπει να συνδεθείς για να συνεχίσεις.',
    accountStatusLabel: 'Κατάσταση',
    accountVerifiedLabel: 'Επαληθευμένο',
    accountVerificationNotice: 'Επαλήθευσε το email για να ξεκινήσεις να δημιουργείς αγγελίες.',
    accountMyAdsHeading: 'Οι αγγελίες σου',
    accountMyAdsEmpty: 'Δεν έχεις δημιουργήσει αγγελίες ακόμα.',
    accountMyAdsLoading: 'Φόρτωση αγγελιών…',
    editAdButton: 'Επεξεργασία αγγελίας',
    editRemainingLabel: 'Διαθέσιμα edit: {count}',
    editLimitReached: 'Δεν απομένουν άλλα edit για αυτή την αγγελία.',
    editModeNotice: 'Επεξεργάζεσαι δημοσιευμένη αγγελία. Απαιτείται ξανά έγκριση διαχειριστή.',
    editSaveSuccess: 'Η αγγελία ενημερώθηκε και περιμένει έγκριση.',
    adEditApproved: 'Μόνο εγκεκριμένες αγγελίες μπορούν να επεξεργαστούν.',
    deactivateAdButton: 'Απενεργοποίηση',
    reactivateAdButton: 'Επανενεργοποίηση',
    deleteAdButton: 'Διαγραφή',
    adStatusApproved: 'Δημοσιευμένη',
    adStatusPending: 'Σε αναμονή έγκρισης διαχειριστή',
    adStatusInactive: 'Ανενεργή (κρυφή)',
    adDeactivateSuccess: 'Η αγγελία απενεργοποιήθηκε.',
    adReactivateSuccess: 'Η αγγελία επανενεργοποιήθηκε και περιμένει έγκριση.',
    adDeleteSuccess: 'Η αγγελία διαγράφηκε.',
    adDeleteConfirm: 'Σίγουρα θέλεις να διαγράψεις την αγγελία;',
    reactivateNeedsApproval: 'Οι επανενεργοποιημένες αγγελίες χρειάζονται νέα έγκριση διαχειριστή.'
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
  updateUserBadge();
  rerenderCurrentView();
}


function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return normalizeUser(parsed);
  } catch (err) {
    console.error('Failed to parse stored user', err);
    return null;
  }
}

function normalizeUser(user) {
  if (!user) return null;
  const emailPart = typeof user.email === 'string' && user.email.includes('@') ? user.email.split('@')[0] : '';
  const nickname = (user.nickname || '').trim() || emailPart || t('guestNickname');

  return {
    ...user,
    nickname
  };
}

function setStoredUser(user) {
  const normalized = normalizeUser(user);

  if (normalized) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(normalized));
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }
  updateAccountNav();
  updateUserBadge();
}

function showBanner(message, type = 'success') {
  if (!message) return;
  let banner = document.getElementById('global-banner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'global-banner';
    banner.className = 'status';
    banner.style.position = 'fixed';
    banner.style.top = '8px';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.zIndex = '999';
    document.body.appendChild(banner);
  }

  banner.textContent = message;
  banner.classList.remove('error', 'success');
  banner.classList.add(type === 'error' ? 'error' : 'success');

  setTimeout(() => {
    if (banner && banner.parentElement) {
      banner.parentElement.removeChild(banner);
    }
  }, 6000);
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

function setResultsLayout(layout) {
  resultsLayout = layout;
  localStorage.setItem(RESULTS_LAYOUT_STORAGE_KEY, layout);
}

function getResultsToggleLabel() {
  return resultsLayout === 'tiles' ? t('resultsLinesView') : t('resultsTilesView');
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

function createAdCardMarkup(ad, options = {}) {
  const {
    showEdit = false,
    remainingEdits = 0,
    editDisabled = false,
    statusNote = '',
    statusTone = 'subtle',
    extraActions = ''
  } = options;
  const thumb = (ad.images || [])[0];
  const description = ad.description || '';
  const truncated = description.length > 140 ? `${description.slice(0, 140)}…` : description;
  const tagsRow = renderTagPills(ad.tags, 5);
  const editBlock = showEdit
    ? `<button class="button tiny edit-ad-btn" data-id="${ad.id}" ${editDisabled ? 'disabled' : ''}>${t('editAdButton')}</button>
      <span class="status subtle">${t('editRemainingLabel', { count: Math.max(0, remainingEdits) })}</span>`
    : '';

  const actionsContent = [editBlock, extraActions].filter(Boolean).join('');
  const actionsBlock = actionsContent ? `<div class="ad-actions">${actionsContent}</div>` : '';
  const statusBlock = statusNote ? `<div class="status ${statusTone}">${statusNote}</div>` : '';

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
        ${actionsBlock}
        ${statusBlock}
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

function attachEditButtons(root) {
  const buttons = root.querySelectorAll('.edit-ad-btn');
  buttons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const adId = Number(btn.dataset.id);
      startEditAd(adId);
    });
  });
}

function attachAdManagementButtons(root) {
  const bind = (selector, handler) => {
    root.querySelectorAll(selector).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const adId = Number(btn.dataset.id);
        if (adId) handler(adId);
      });
    });
  };

  bind('.deactivate-ad-btn', deactivateAd);
  bind('.reactivate-ad-btn', reactivateAd);
  bind('.delete-ad-btn', deleteAdRequest);
}

async function performAdAction(adId, path, { method = 'POST', successKey }) {
  const user = getStoredUser();
  if (!user) {
    showBanner(t('authUserRequired'), 'error');
    return;
  }

  try {
    const res = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Language': currentLanguage
      },
      body: JSON.stringify({ user_id: user.id, language: currentLanguage })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('saveError'));

    if (successKey) {
      showBanner(t(successKey), 'success');
    }

    await loadUserAds(user.id);
  } catch (error) {
    showBanner(error.message, 'error');
  }
}

function deactivateAd(adId) {
  return performAdAction(adId, `/api/ads/${adId}/deactivate`, {
    method: 'POST',
    successKey: 'adDeactivateSuccess'
  });
}

function reactivateAd(adId) {
  return performAdAction(adId, `/api/ads/${adId}/reactivate`, {
    method: 'POST',
    successKey: 'adReactivateSuccess'
  });
}

function deleteAdRequest(adId) {
  if (!window.confirm(t('adDeleteConfirm'))) return;
  return performAdAction(adId, `/api/ads/${adId}`, {
    method: 'DELETE',
    successKey: 'adDeleteSuccess'
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
    accountBtn.textContent = t('navAccount');
  }
}

function updateUserBadge() {
  const badge = document.getElementById('user-pill');
  if (!badge) return;

  const user = getStoredUser();
  const displayName = user?.email || t('guestNickname');
  const status = user ? user.email : t('guestStatus');
  const initial = (displayName || 'U').charAt(0).toUpperCase();

  badge.innerHTML = `
    <div class="user-avatar" aria-hidden="true">${initial}</div>
    <div class="user-meta">
      <div class="user-name">${displayName}</div>
      <div class="user-status">${status}</div>
    </div>
  `;
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
  const verificationBadge = user.verified
    ? `<span class="badge success">${t('accountVerifiedLabel')}</span>`
    : `<span class="badge warning">${t('authVerificationRequired')}</span>`;
  const creationDisabled = user.verified ? '' : 'disabled';
  const creationNotice = user.verified
    ? ''
    : `<div class="status warning" style="margin-top:12px;">${t('accountVerificationNotice')}</div>`;

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
        <div>
          <div class="label">${t('accountStatusLabel')}</div>
          <div class="value">${verificationBadge}</div>
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
        <button id="create-btn" class="button primary" ${creationDisabled}>${t('createButton')}</button>
      </div>
      <div id="status" class="status"></div>
      ${creationNotice}
    </div>
    <div class="section" id="preview-section" style="display:none;"></div>
    <div class="section" id="results-section" style="display:none;"></div>
    <div class="card" id="user-ads-card" style="margin-top:16px;">
      <h2>${t('accountMyAdsHeading')}</h2>
      <div id="user-ads-list" class="ad-list">${t('accountMyAdsLoading')}</div>
    </div>
  `;

  document.getElementById('account-logout').addEventListener('click', () => {
    setStoredUser(null);
    renderLogin();
  });

  document.getElementById('create-btn').addEventListener('click', handleCreateAd);
  setupImageInput();

  loadUserAds(user.id);
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
  const user = getStoredUser();
  const prompt = document.getElementById('prompt').value.trim();
  const status = document.getElementById('status');
  if (!user) {
    status.textContent = t('authUserRequired');
    status.classList.add('error');
    return;
  }

  currentEditingAdId = null;

  if (!user.verified) {
    status.textContent = t('authVerificationRequired');
    status.classList.add('error');
    return;
  }
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

    const adImages = normalizeImages(attachedImages.length ? attachedImages : data.ad.images);
    const ad = { ...data.ad, images: adImages, contact_phone: sanitizePhone(data.ad.contact_phone) };
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

function renderDraftEditor(ad, options = {}) {
  const previewSection = document.getElementById('preview-section');
  if (!previewSection) return;
  const isEditing = options.isEditing === true;

  const galleryImages = normalizeImages(ad.images);
  const galleryMarkup = galleryImages.length
    ? `<div class="detail-gallery">${galleryImages
        .map((img, idx) => `<img src="${img}" alt="${t('adImageAlt', { index: idx + 1 })}">`)
        .join('')}</div>`
    : `<p class="status subtle">${t('previewNoImages')}</p>`;
  const visitsLabel = t('adVisitsLabel', { count: Number.isFinite(Number(ad.visits)) ? Number(ad.visits) : 0 });
  const contactPhone = ad.contact_phone || t('contactNotProvided');
  const contactEmail = ad.contact_email || t('contactNotProvided');

  const editInfo = isEditing
    ? `<div class="status warning">${t('editRemainingLabel', { count: Math.max(0, Number(ad.remaining_edits) || 0) })}</div>`
    : '';

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
      ${editInfo}
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
  document.getElementById('ad-contact-phone').value = sanitizePhone(ad.contact_phone);
  document.getElementById('ad-contact-email').value = ad.contact_email || '';

  document.getElementById('approve-btn').addEventListener('click', handleApproveAd);
}

async function handleApproveAd() {
  if (!currentDraftAd) return;

  const saveStatus = document.getElementById('save-status');
  if (!saveStatus) return;

  const user = getStoredUser();
  if (!user) {
    saveStatus.textContent = t('authUserRequired');
    saveStatus.classList.add('error');
    return;
  }

  if (!user.verified) {
    saveStatus.textContent = t('authVerificationRequired');
    saveStatus.classList.add('error');
    return;
  }

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
    images: normalizeImages(currentDraftAd.images || attachedImages),
    user_id: user.id
  };

  try {
    const isEditingExisting = Number.isFinite(currentEditingAdId);
    const endpoint = isEditingExisting ? `/api/ads/${currentEditingAdId}/edit` : '/api/ads/approve';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Language': currentLanguage
      },
      body: JSON.stringify({ ad: approvedAd, language: currentLanguage })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('saveError'));

    const savedAd = {
      ...data.ad,
      images: normalizeImages(data.ad.images),
      contact_phone: sanitizePhone(data.ad.contact_phone)
    };
    lastCreatedAd = savedAd;
    currentDraftAd = savedAd;
    currentEditingAdId = isEditingExisting ? savedAd.id : null;
    saveStatus.textContent = isEditingExisting ? t('editSaveSuccess') : t('saveSuccess');
    saveStatus.classList.remove('error');
    saveStatus.classList.add('success');
    renderDraftEditor(savedAd, { isEditing: isEditingExisting });
    loadRecentAds();
    const user = getStoredUser();
    if (user) {
      loadUserAds(user.id);
    }
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
    resultsSection.innerHTML = `
      <div class="section-header">
        <h2>${t('resultsHeading')}</h2>
      </div>
      <p>${t('resultsEmpty')}</p>
    `;
    return;
  }

  const list = ads.map((ad) => createAdCardMarkup(ad)).join('');

  resultsSection.innerHTML = `
    <div class="section-header">
      <h2>${t('resultsHeading')}</h2>
      <button id="results-view-toggle" class="button tiny ghost">${getResultsToggleLabel()}</button>
    </div>
    <div class="ad-results ${resultsLayout}">${list}</div>
  `;

  const toggle = document.getElementById('results-view-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const nextLayout = resultsLayout === 'tiles' ? 'lines' : 'tiles';
      setResultsLayout(nextLayout);
      renderResults(ads);
    });
  }

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

async function loadUserAds(userId) {
  const listEl = document.getElementById('user-ads-list');
  if (!listEl || !userId) return;
  listEl.innerHTML = t('accountMyAdsLoading');

  try {
    const res = await fetch(`/api/users/${userId}/ads`, {
      headers: { 'X-Language': currentLanguage }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('recentError'));
    const ads = data.ads || [];
    userAdsCache = new Map(ads.map((ad) => [ad.id, ad]));
    if (!ads.length) {
      listEl.innerHTML = `<p class="status subtle">${t('accountMyAdsEmpty')}</p>`;
      return;
    }

    const user = getStoredUser();
    const canEditAds = Boolean(user?.verified);

    listEl.innerHTML = ads
      .map((ad) => {
        const remaining = Number.isFinite(Number(ad.remaining_edits)) ? Number(ad.remaining_edits) : 0;
        const allowEdit = canEditAds && ad.approved && ad.active !== false;
        const statusNote =
          ad.active === false
            ? `${t('adStatusInactive')} • ${t('reactivateNeedsApproval')}`
            : ad.approved
              ? t('adStatusApproved')
              : t('adStatusPending');
        const statusTone = ad.active === false ? 'warning' : ad.approved ? 'success' : 'subtle';
        const extraActions = [
          ad.active !== false
            ? `<button class="button tiny ghost deactivate-ad-btn" data-id="${ad.id}">${t('deactivateAdButton')}</button>`
            : `<button class="button tiny ghost reactivate-ad-btn" data-id="${ad.id}">${t('reactivateAdButton')}</button>`,
          `<button class="button tiny ghost delete-ad-btn" data-id="${ad.id}">${t('deleteAdButton')}</button>`
        ].join('');
        return createAdCardMarkup(ad, {
          showEdit: allowEdit,
          editDisabled: remaining <= 0,
          remainingEdits: remaining,
          statusNote,
          statusTone,
          extraActions
        });
      })
      .join('');
    attachAdCardHandlers(listEl);
    attachEditButtons(listEl);
    attachAdManagementButtons(listEl);
  } catch (error) {
    listEl.innerHTML = `<p class="error">${error.message}</p>`;
  }
}

function startEditAd(adId) {
  const ad = userAdsCache.get(adId);
  if (!ad) return;

  const user = getStoredUser();
  if (!user || !user.verified) {
    showBanner(t('authVerificationRequired'), 'error');
    return;
  }

  if (!ad.approved) {
    showBanner(t('adEditApproved'), 'error');
    return;
  }

  if (Number(ad.remaining_edits) <= 0) {
    showBanner(t('editLimitReached'), 'error');
    return;
  }

  currentDraftAd = { ...ad };
  currentEditingAdId = ad.id;
  const status = document.getElementById('status');
  if (status) {
    status.textContent = t('editModeNotice');
    status.classList.remove('error');
    status.classList.add('success');
  }

  renderDraftEditor(currentDraftAd, { isEditing: true });
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

async function handleVerificationFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('verify');
  if (!token) return;

  params.delete('verify');
  const cleaned = params.toString();
  const newUrl = `${window.location.pathname}${cleaned ? `?${cleaned}` : ''}`;
  window.history.replaceState({}, '', newUrl);

  try {
    const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`, {
      headers: { 'X-Language': currentLanguage }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('authVerificationInvalid'));
    if (data.user) {
      setStoredUser(data.user);
      updateAccountNav();
    }
    showBanner(data.message || t('authVerificationSuccess'), 'success');
  } catch (error) {
    showBanner(error.message, 'error');
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
      <div class="report-panel">
        <button class="button tiny" id="report-toggle" aria-expanded="false">${t('reportAdButton')}</button>
        <form id="report-form" class="report-form hidden">
          <label class="sr-only" for="report-input">${t('reportAdLabel')}</label>
          <textarea
            id="report-input"
            class="report-input"
            maxlength="300"
            placeholder="${t('reportAdPlaceholder')}"
          ></textarea>
          <div class="report-actions">
            <span id="report-counter" class="report-counter">0/300</span>
            <div class="report-buttons">
              <button type="button" class="button ghost tiny" id="report-cancel">${t('reportAdCancel')}</button>
              <button type="submit" class="button primary tiny" id="report-submit">${t('reportAdSubmit')}</button>
            </div>
          </div>
        </form>
      </div>
      <div class="actions" style="margin-bottom: 8px;">
        <button class="button secondary" id="detail-back">${t('adDetailBack')}</button>
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
  setupReportForm(ad.id);
}

function setupReportForm(adId) {
  const reportToggle = document.getElementById('report-toggle');
  const reportForm = document.getElementById('report-form');
  const reportInput = document.getElementById('report-input');
  const reportCounter = document.getElementById('report-counter');
  const reportCancel = document.getElementById('report-cancel');

  if (!reportToggle || !reportForm || !reportInput) return;

  const maxChars = 300;

  const closeForm = () => {
    reportForm.classList.add('hidden');
    reportToggle.setAttribute('aria-expanded', 'false');
  };

  const openForm = () => {
    reportForm.classList.remove('hidden');
    reportToggle.setAttribute('aria-expanded', 'true');
    reportInput.focus();
  };

  const updateCounter = () => {
    const value = reportInput.value.slice(0, maxChars);
    if (value !== reportInput.value) reportInput.value = value;
    if (reportCounter) reportCounter.textContent = `${value.length}/${maxChars}`;
  };

  reportToggle.addEventListener('click', () => {
    const isHidden = reportForm.classList.contains('hidden');
    if (isHidden) openForm();
    else closeForm();
  });

  reportInput.addEventListener('input', updateCounter);
  updateCounter();

  if (reportCancel) {
    reportCancel.addEventListener('click', () => {
      reportInput.value = '';
      updateCounter();
      closeForm();
    });
  }

  reportForm.addEventListener('submit', (event) => {
    event.preventDefault();
    reportAd(adId, reportInput.value, {
      onSuccess: () => {
        reportInput.value = '';
        updateCounter();
        closeForm();
      },
      onAfter: updateCounter
    });
  });
}

async function reportAd(adId, reason, { onSuccess, onAfter } = {}) {
  if (!adId) return;
  const statusEl = document.getElementById('report-status');
  const normalized = (reason || '').replace(/\s+/g, ' ').trim();

  if (!normalized) {
    if (statusEl) {
      statusEl.textContent = t('reportAdRequired');
      statusEl.classList.add('error');
      statusEl.classList.remove('success');
    }
    if (typeof onAfter === 'function') onAfter();
    return;
  }

  if (normalized.length > 300) {
    if (statusEl) {
      statusEl.textContent = t('reportAdTooLong');
      statusEl.classList.add('error');
      statusEl.classList.remove('success');
    }
    if (typeof onAfter === 'function') onAfter();
    return;
  }

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
      body: JSON.stringify({ reason: normalized, language: currentLanguage })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('reportAdError'));

    if (typeof onSuccess === 'function') onSuccess();
    if (typeof onAfter === 'function') onAfter();

    if (statusEl) {
      statusEl.textContent = t('reportAdSuccess');
      statusEl.classList.remove('error');
      statusEl.classList.add('success');
    }
  } catch (error) {
    if (typeof onAfter === 'function') onAfter();
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
updateUserBadge();
handleVerificationFromUrl();
renderHome();
