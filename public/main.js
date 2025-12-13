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
let currentResultsAds = [];
let currentResultsPage = 1;
let aiLoadingOverlay = null;
let lastSearchState = {
  prompt: '',
  filters: null,
  ads: [],
  page: 1,
  hasSearch: false,
  statusText: ''
};
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_UPLOAD_IMAGES = 10;
const AUTH_STORAGE_KEY = 'speedlist:user';
const LANGUAGE_STORAGE_KEY = 'speedlist:language';
const BASE_RESULTS_PER_PAGE = 18;
const MIN_RESULT_ROWS = 3;
let resultsPerPage = BASE_RESULTS_PER_PAGE;
const RECENT_ADS_LIMIT = 50;
let currentView = { name: 'home' };
let currentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'el';
let categoryTree = [];
let categoryFieldConfig = {};
const resultsLayout = 'tiles';
const TILE_MIN_COLUMNS = 2;
const TILE_MAX_COLUMNS = 8;
const TILE_CARD_MIN_WIDTH = 140;
let resizeTilesHandle = null;
const carMakeModelMap = {
  'Alfa Romeo': ['Giulia', 'Stelvio', 'Tonale', 'Giulietta', 'MiTo'],
  Audi: ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q2', 'Q3', 'Q4 e-tron', 'Q5', 'Q7', 'Q8', 'TT', 'e-tron GT'],
  BMW: ['1 Series', '2 Series', '3 Series', '4 Series', '5 Series', '7 Series', '8 Series', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'i3', 'i4', 'iX', 'Z4'],
  Chevrolet: ['Spark', 'Aveo', 'Cruze', 'Camaro', 'Malibu', 'Captiva', 'Trax'],
  Citroën: ['C1', 'C2', 'C3', 'C3 Aircross', 'C3 Picasso', 'C4', 'C4 Cactus', 'C4 Picasso', 'C5', 'Berlingo'],
  Cupra: ['Born', 'Formentor', 'Leon', 'Ateca'],
  Dacia: ['Sandero', 'Logan', 'Duster', 'Jogger', 'Spring'],
  Fiat: ['500', '500X', '500L', 'Panda', 'Tipo', 'Punto', 'Doblo', 'Bravo'],
  Ford: ['Fiesta', 'Focus', 'Puma', 'Kuga', 'Mondeo', 'EcoSport', 'Ranger', 'Mustang'],
  Honda: ['Jazz', 'Civic', 'HR-V', 'CR-V', 'Accord', 'e:Ny1'],
  Hyundai: ['i10', 'i20', 'i30', 'Bayon', 'Kona', 'Tucson', 'Santa Fe', 'Ioniq 5', 'Ioniq 6'],
  Jeep: ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Avenger'],
  Kia: ['Picanto', 'Rio', 'Ceed', 'XCeed', 'Sportage', 'Stonic', 'Niro', 'EV6', 'Sorento'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Evoque', 'Discovery', 'Discovery Sport', 'Defender'],
  Mazda: ['Mazda2', 'Mazda3', 'Mazda6', 'CX-3', 'CX-30', 'CX-5', 'CX-60', 'MX-5'],
  Mercedes: ['A-Class', 'B-Class', 'C-Class', 'E-Class', 'S-Class', 'CLA', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'EQC', 'EQA'],
  MINI: ['3-door', '5-door', 'Cabrio', 'Clubman', 'Countryman', 'Electric'],
  Mitsubishi: ['Space Star', 'ASX', 'Eclipse Cross', 'Outlander', 'L200'],
  Nissan: ['Micra', 'Juke', 'Qashqai', 'X-Trail', 'Leaf', 'Ariya'],
  Opel: ['Corsa', 'Astra', 'Crossland', 'Mokka', 'Grandland', 'Insignia', 'Zafira'],
  Peugeot: ['108', '208', '2008', '3008', '308', '408', '5008', '508', 'Partner'],
  Porsche: ['911', 'Cayman', 'Boxster', 'Cayenne', 'Macan', 'Panamera', 'Taycan'],
  Renault: ['Clio', 'Captur', 'Megane', 'Austral', 'Koleos', 'Talisman', 'Zoe', 'Scenic'],
  SEAT: ['Ibiza', 'Arona', 'Leon', 'Ateca', 'Tarraco', 'Toledo'],
  Skoda: ['Fabia', 'Scala', 'Octavia', 'Kamiq', 'Karoq', 'Kodiaq', 'Superb', 'Enyaq'],
  Subaru: ['Impreza', 'XV', 'Forester', 'Outback', 'Levorg'],
  Suzuki: ['Swift', 'Ignis', 'Baleno', 'Vitara', 'S-Cross', 'Jimny', 'Across'],
  Tesla: ['Model 3', 'Model Y', 'Model S', 'Model X'],
  Toyota: ['Aygo', 'Yaris', 'Corolla', 'C-HR', 'RAV4', 'Camry', 'Prius', 'Land Cruiser', 'GR86'],
  Volkswagen: ['up!', 'Polo', 'Golf', 'T-Roc', 'Tiguan', 'Passat', 'ID.3', 'ID.4', 'ID.5', 'Touareg'],
  Volvo: ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V60', 'V90', 'EX30', 'EX90']
};
const APP_BASE_PATH = (() => {
  const script = document.currentScript || document.querySelector('script[src*="main.js"]');
  if (script) {
    const url = new URL(script.src, window.location.href);
    const segments = url.pathname.split('/');
    const staticIndex = segments.lastIndexOf('static');
    if (staticIndex > 0) {
      const prefix = segments.slice(0, staticIndex).join('/') || '/';
      if (prefix === '/ads') return '/';
      return prefix === '' ? '/' : prefix;
    }
  }

  const parts = window.location.pathname.split('/').filter(Boolean);
  if (parts[0] === 'ads') return '/';
  return parts.length ? `/${parts[0]}` : '/';
})();

function withBase(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return APP_BASE_PATH === '/' ? normalized : `${APP_BASE_PATH}${normalized}`;
}

function getCarBrands() {
  return Object.keys(carMakeModelMap).sort((a, b) => a.localeCompare(b));
}

function getCarModels(brandName) {
  const normalized = (brandName || '').trim();
  return normalized && Array.isArray(carMakeModelMap[normalized]) ? [...carMakeModelMap[normalized]] : [];
}

function isCarSubcategory(subcategory) {
  const normalized = (subcategory || '').toString().trim().toLowerCase();
  return ['αυτοκίνητο', 'αυτοκινητο', 'ταξί', 'ταξι', 'car', 'taxi'].includes(normalized);
}

function sanitizePhone(value) {
  const normalized = (value || '').trim();
  return normalized === '1234567890' ? '' : normalized;
}

function isValidEmail(value) {
  return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function isValidPhone(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  return /^[+0-9 ()-]+$/.test(trimmed) && digits.length >= 8 && digits.length <= 15;
}

function normalizeImages(list) {
  return (Array.isArray(list) ? list : [])
    .map((img) => (typeof img === 'string' ? img : img?.dataUrl))
    .filter((img) => typeof img === 'string' && img.startsWith('data:image/'));
}

function getRelativePathname() {
  const path = window.location.pathname || '/';
  if (APP_BASE_PATH !== '/' && path.startsWith(APP_BASE_PATH)) {
    return path.slice(APP_BASE_PATH.length) || '/';
  }
  return path;
}

function parseRouteFromLocation() {
  const pathname = getRelativePathname();
  const detailMatch = pathname.match(/^\/ads\/(\d+)/);
  if (detailMatch) {
    return { name: 'detail', adId: Number(detailMatch[1]) };
  }
  return { name: 'home' };
}

function calculateTileColumns(width) {
  const safeWidth = Math.max(width || window.innerWidth || 0, TILE_CARD_MIN_WIDTH * TILE_MIN_COLUMNS);
  const estimated = Math.floor(safeWidth / TILE_CARD_MIN_WIDTH);
  return Math.min(TILE_MAX_COLUMNS, Math.max(TILE_MIN_COLUMNS, estimated));
}

function calculateResultsPerPage(width) {
  const columns = calculateTileColumns(width);
  const rows = Math.max(MIN_RESULT_ROWS, Math.round(BASE_RESULTS_PER_PAGE / columns));
  return columns * rows;
}

function updateTileColumns(root = document) {
  const grids = root.querySelectorAll('.ad-results.tiles');
  grids.forEach((grid) => {
    const columns = calculateTileColumns(grid.clientWidth || grid.offsetWidth || window.innerWidth);
    grid.style.setProperty('--tile-columns', columns);
  });
}

window.addEventListener('resize', () => {
  if (resizeTilesHandle) {
    cancelAnimationFrame(resizeTilesHandle);
  }
  resizeTilesHandle = requestAnimationFrame(() => {
    updateTileColumns();
    handleResultsResize();
  });
});

function handleResultsResize() {
  const resultsSection = document.getElementById('results-section');
  if (!resultsSection || !currentResultsAds.length) return;

  const width = resultsSection.clientWidth || resultsSection.offsetWidth || window.innerWidth;
  const nextPageSize = calculateResultsPerPage(width);

  if (nextPageSize !== resultsPerPage) {
    resultsPerPage = nextPageSize;
    renderResults(currentResultsAds, currentResultsPage);
  }
}

const translations = {
  en: {
    logo: 'speedlist.gr',
    navHome: 'Home',
    navAccount: 'My account',
    navAdCreation: 'Ad creation',
    navMyAds: 'My ads',
    navAbout: 'About',
    guestNickname: 'Guest',
    guestStatus: 'Not signed in',
    menuToggleLabel: 'Toggle menu',
    heroTitle: 'Find the perfect listing with AI',
    heroSubtitle: 'Describe what you need and get instant suggestions.',
    heroPlaceholder: 'Describe what you are looking for...',
    promptDockLabel: 'Prompt',
    promptDockMinimize: 'Minimize',
    promptDockExpand: 'Expand',
    speechButtonLabel: 'Speak prompt',
    speechListening: 'Listening…',
    speechUnsupported: 'Speech recognition is not supported in this browser.',
    speechUnavailable: 'Speech unavailable',
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
    registerPhoneLabel: 'Phone number',
    registerPhonePlaceholder: '+30 6912345678',
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
    draftRevisionLabel: 'Describe changes you want to make',
    draftRevisionPlaceholder: 'Describe changes you want to make',
    draftRevisionButton: 'Update draft with AI',
    draftRevisionProcessing: 'Updating draft…',
    draftRevisionError: 'Failed to update the draft',
    draftRevisionSuccess: 'Draft updated. Review the changes below.',
    draftRevisionPromptRequired: 'Please describe the changes you want.',
    draftRevisionContextIntro: 'Current draft details:',
    draftRevisionMissingDraft: 'Create a draft first before requesting revisions.',
    uploadTitle: 'Add photos (optional)',
    uploadCopy: 'Drag or click to upload up to 10 images.',
    uploadButton: 'Add images',
    uploadStatusDefault: 'Add up to 10 photos.',
    uploadStatusLimit: 'You reached the image limit (10). Remove one to add another.',
    uploadStatusRejected: 'Skipped {count} files. Only image files are allowed (large ones will be compressed).',
    uploadStatusAdded: 'Images added and will be sent with your request.',
    createButton: 'Create listing with AI',
    createProcessing: 'Processing…',
    createError: 'Failed to create listing',
    createSuccess: 'Review the AI draft below and edit before saving.',
    saveProcessing: 'Saving…',
    saveError: 'Failed to save the listing',
    saveSuccess: 'Listing saved after your approval.',
    previewHeading: 'Listing preview',
    previewPageSubtitle: 'Review your AI-drafted listing, make edits, and approve it when ready.',
    previewBackButton: 'Back to listing builder',
    previewMissingDraft: 'No listing draft is available to preview.',
    editAdHeading: 'Review and edit your draft',
    reviewInstructions: 'Edit any field you want and then approve to save the listing.',
    approveButton: 'Approve & Save',
    fieldTitleLabel: 'Title',
    fieldDescriptionLabel: 'Description',
    fieldCategoryLabel: 'Category',
    fieldSubcategoryLabel: 'Subcategory',
    fieldSpecificHeading: 'Specific details',
    fieldSpecificEmpty: 'Select a category and subcategory to see tailored fields.',
    selectCategoryPlaceholder: 'Select a category',
    selectSubcategoryPlaceholder: 'Select a subcategory',
    selectMakePlaceholder: 'Select make',
    selectModelPlaceholder: 'Select model',
    selectModelPlaceholderNoBrand: 'Select a make first',
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
    resultsPrevPage: 'Previous',
    resultsNextPage: 'Next',
    resultsPageLabel: 'Page {current} of {total}',
    aiLoadingMessage: 'The AI is working on your request…',
    searchProcessing: 'Searching…',
    searchError: 'Failed to search listings',
    filterKeywordsPrefix: '• keywords=',
    searchFilters: 'Filters: {category} {subcategory} {location} {fields} {keywords}',
    filterCategoryPrefix: '• category=',
    filterSubcategoryPrefix: '• subcategory=',
    filterLocationPrefix: '• location=',
    filterFieldsPrefix: '• fields=',
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
    contactPhoneLocked: 'Your phone number is always shown and cannot be changed here.',
    includeEmailLabel: 'Add my email to this listing',
    includeEmailHelp: 'Your email will be visible to others when checked.',
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
      'SpeedList is an AI-powered classifieds experience where you describe what you need and the system does the heavy lifting. No long forms, no manual tagging — just say it and the AI structures it for you.',
    aboutPoint1:
      'Publish listings in seconds by writing natural language instead of filling out endless categories like traditional sites.',
    aboutPoint2:
      'Search by explaining what you want and let the AI apply the right filters, rather than scrolling through dozens of menus.',
    aboutPoint3:
      'Enjoy a fast, private experience with server-side AI that keeps your data lightweight and organized.',
    aiPromptDemoHeading: 'Instruction-master prompt examples',
    aiPromptDemoIntro:
      'These samples show how the default instruction-master prompt combines with what the user types before the request is sent to the AI.',
    aiPromptCreateTitle: 'Ad creation prompt (demo)',
    aiPromptSearchTitle: 'Ad search prompt (demo)',
    aiPromptInstructionLabel: 'Instruction-master prompt',
    aiPromptUserLabel: 'User prompt',
    aiPromptFinalLabel: 'Final prompt sent to AI',
    authRegistrationSuccess: 'Account created. Please verify your email.',
    authLoginSuccess: 'Login successful.',
    authMissingFields: 'Email and password are required',
    authRegisterMissingFields: 'Email, phone and password are required',
    authInvalidEmail: 'Please provide a valid email address',
    authInvalidPhone: 'Please provide a valid phone number',
    authPhoneRequired: 'A verified phone number is required to publish listings',
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
    navAdCreation: 'Δημιουργία αγγελίας',
    navMyAds: 'Οι αγγελίες μου',
    navAbout: 'Σχετικά',
    guestNickname: 'Επισκέπτης',
    guestStatus: 'Δεν έχεις συνδεθεί',
    menuToggleLabel: 'Εναλλαγή μενού',
    heroTitle: 'Ψάξε γρήγορα και αποτελεσματικά με AI',
    heroSubtitle: 'Περιέγραψε τι ζητάς (π.χ. "ηλεκτρικό ποδήλατο στην Αθήνα έως 800€").',
    heroPlaceholder: 'Περιέγραψε τι ψάχνεις...',
    promptDockLabel: 'Prompt',
    promptDockMinimize: 'Ελαχιστοποίηση',
    promptDockExpand: 'Άνοιγμα',
    speechButtonLabel: 'Εκφώνηση prompt',
    speechListening: 'Ακρόαση…',
    speechUnsupported: 'Η φωνητική αναγνώριση δεν υποστηρίζεται σε αυτό το πρόγραμμα περιήγησης.',
    speechUnavailable: 'Η φωνή δεν είναι διαθέσιμη',
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
    registerPhoneLabel: 'Τηλέφωνο',
    registerPhonePlaceholder: '+30 6912345678',
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
    draftRevisionLabel: 'Περιέγραψε τις αλλαγές που θέλεις να κάνεις',
    draftRevisionPlaceholder: 'Περιέγραψε τις αλλαγές που θέλεις να κάνεις',
    draftRevisionButton: 'Ενημέρωση πρόχειρου με AI',
    draftRevisionProcessing: 'Γίνεται ενημέρωση…',
    draftRevisionError: 'Αποτυχία ενημέρωσης του πρόχειρου',
    draftRevisionSuccess: 'Το πρόχειρο ενημερώθηκε. Έλεγξε τις αλλαγές παρακάτω.',
    draftRevisionPromptRequired: 'Περιέγραψε τις αλλαγές που θέλεις.',
    draftRevisionContextIntro: 'Τρέχον πρόχειρο:',
    draftRevisionMissingDraft: 'Δημιούργησε πρώτα ένα πρόχειρο πριν ζητήσεις αλλαγές.',
    uploadTitle: 'Πρόσθεσε φωτογραφίες (προαιρετικό)',
    uploadCopy: 'Σύρε ή κάνε κλικ για να ανεβάσεις έως 10 εικόνες.',
    uploadButton: 'Προσθήκη εικόνων',
    uploadStatusDefault: 'Πρόσθεσε έως 10 φωτογραφίες.',
    uploadStatusLimit: 'Έχεις φτάσει το όριο εικόνων (10). Αφαίρεσε μία για να προσθέσεις άλλη.',
    uploadStatusRejected: 'Παραλείφθηκαν {count} αρχεία. Επιτρέπονται μόνο αρχεία εικόνας (τα μεγάλα θα συμπιέζονται αυτόματα).',
    uploadStatusAdded: 'Οι εικόνες προστέθηκαν και θα σταλούν με το αίτημά σου.',
    createButton: 'Δημιουργία αγγελίας με AI',
    createProcessing: 'Γίνεται επεξεργασία…',
    createError: 'Αποτυχία δημιουργίας αγγελίας',
    createSuccess: 'Δες το προσχέδιο και κάνε αλλαγές πριν το αποθηκεύσεις.',
    saveProcessing: 'Αποθήκευση…',
    saveError: 'Αποτυχία αποθήκευσης αγγελίας',
    saveSuccess: 'Η αγγελία αποθηκεύτηκε μετά την έγκρισή σου.',
    previewHeading: 'Προεπισκόπηση αγγελίας',
    previewPageSubtitle: 'Ελέγξτε την αγγελία που δημιούργησε η τεχνητή νοημοσύνη, κάντε αλλαγές και εγκρίνετέ την.',
    previewBackButton: 'Επιστροφή στον δημιουργό αγγελίας',
    previewMissingDraft: 'Δεν υπάρχει πρόχειρη αγγελία για προεπισκόπηση.',
    editAdHeading: 'Έλεγξε και επεξεργάσου το προσχέδιο',
    reviewInstructions: 'Διόρθωσε ό,τι χρειάζεται και μετά πάτησε έγκριση για αποθήκευση.',
    approveButton: 'Έγκριση & Αποθήκευση',
    fieldTitleLabel: 'Τίτλος',
    fieldDescriptionLabel: 'Περιγραφή',
    fieldCategoryLabel: 'Κατηγορία',
    fieldSubcategoryLabel: 'Υποκατηγορία',
    fieldSpecificHeading: 'Ειδικά πεδία',
    fieldSpecificEmpty: 'Διάλεξε κατηγορία και υποκατηγορία για να εμφανιστούν τα σχετικά πεδία.',
    selectCategoryPlaceholder: 'Διάλεξε κατηγορία',
    selectSubcategoryPlaceholder: 'Διάλεξε υποκατηγορία',
    selectMakePlaceholder: 'Διάλεξε μάρκα',
    selectModelPlaceholder: 'Διάλεξε μοντέλο',
    selectModelPlaceholderNoBrand: 'Διάλεξε μάρκα πρώτα',
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
    resultsPrevPage: 'Προηγούμενη',
    resultsNextPage: 'Επόμενη',
    resultsPageLabel: 'Σελίδα {current} από {total}',
    aiLoadingMessage: 'Η τεχνητή νοημοσύνη επεξεργάζεται το αίτημά σας…',
    searchProcessing: 'Αναζήτηση…',
    searchError: 'Αποτυχία αναζήτησης αγγελιών',
    filterKeywordsPrefix: '• λέξεις-κλειδιά=',
    searchFilters: 'Φίλτρα: {category} {subcategory} {location} {fields} {keywords}',
    filterCategoryPrefix: '• κατηγορία=',
    filterSubcategoryPrefix: '• υποκατηγορία=',
    filterLocationPrefix: '• τοποθεσία=',
    filterFieldsPrefix: '• πεδία=',
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
    contactPhoneLocked: 'Το τηλέφωνό σου εμφανίζεται πάντα και δεν μπορεί να αλλάξει εδώ.',
    includeEmailLabel: 'Πρόσθεσε το email μου στην αγγελία',
    includeEmailHelp: 'Το email σου θα είναι ορατό όταν ενεργοποιηθεί η επιλογή.',
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
      'Το SpeedList είναι μια εμπειρία αγγελιών με AI όπου απλά περιγράφεις αυτό που χρειάζεσαι και το σύστημα αναλαμβάνει τα υπόλοιπα. Χωρίς μακριές φόρμες και χειροκίνητα tags — το AI τα οργανώνει για σένα.',
    aboutPoint1:
      'Δημοσίευσε αγγελίες σε δευτερόλεπτα γράφοντας φυσική γλώσσα αντί να γεμίζεις άπειρες κατηγορίες όπως στα κλασικά sites.',
    aboutPoint2:
      'Αναζήτησε περιγράφοντας τι θέλεις και άφησε το AI να εφαρμόσει τα σωστά φίλτρα, χωρίς να ψάχνεις σε δεκάδες μενού.',
    aboutPoint3:
      'Απόλαυσε γρήγορη και ιδιωτική εμπειρία με AI στον server που κρατά τα δεδομένα σου ελαφριά και οργανωμένα.',
    aiPromptDemoHeading: 'Παραδείγματα instruction-master prompt',
    aiPromptDemoIntro:
      'Τα παρακάτω δείχνουν πώς συνδυάζεται το προεπιλεγμένο instruction-master prompt με όσα γράφει ο χρήστης πριν σταλεί το αίτημα στο AI.',
    aiPromptCreateTitle: 'Prompt δημιουργίας αγγελίας (demo)',
    aiPromptSearchTitle: 'Prompt αναζήτησης αγγελίας (demo)',
    aiPromptInstructionLabel: 'Instruction-master prompt',
    aiPromptUserLabel: 'Prompt χρήστη',
    aiPromptFinalLabel: 'Τελικό prompt προς το AI',
    authRegistrationSuccess: 'Ο λογαριασμός δημιουργήθηκε. Επαλήθευσε το email σου.',
    authLoginSuccess: 'Επιτυχής σύνδεση.',
    authMissingFields: 'Απαιτούνται email και κωδικός',
    authRegisterMissingFields: 'Απαιτούνται email, τηλέφωνο και κωδικός',
    authInvalidEmail: 'Παρακαλώ δώσε ένα έγκυρο email',
    authInvalidPhone: 'Παρακαλώ δώσε ένα έγκυρο τηλέφωνο',
    authPhoneRequired: 'Απαιτείται έγκυρο τηλέφωνο για δημοσίευση αγγελιών',
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

const promptDemos = [
  {
    id: 'create',
    titleKey: 'aiPromptCreateTitle',
    instruction:
      'You are an expert advertising copywriter. Write concise, high-conversion ad copy with a clear call-to-action. Optimize for clarity, brand consistency, and compliance with general advertising policies. Avoid claims that are unverifiable or prohibited. Return no more than 60 words.',
    user:
      'Create a Facebook ad for a new eco-friendly laundry detergent that removes stains well and is gentle on sensitive skin.',
    final:
      '[Instruction-master prompt above]\n\nUser request: Create a Facebook ad for a new eco-friendly laundry detergent that removes stains well and is gentle on sensitive skin.'
  },
  {
    id: 'search',
    titleKey: 'aiPromptSearchTitle',
    instruction:
      'You are an ad-search assistant. Given a search query, return the 5 most relevant ads from the index. Prioritize recency, exact phrase matches, and high engagement scores. Respond in JSON with fields: title, snippet, url, published_date, and relevance_score (0–1). Do not include explanations—return only JSON.',
    user: 'Find ads about eco-friendly laundry detergent suitable for sensitive skin.',
    final:
      '[Instruction-master prompt above]\n\nUser request: Find ads about eco-friendly laundry detergent suitable for sensitive skin.'
  }
];

function t(key, vars = {}) {
  const langTable = translations[currentLanguage] || translations.el;
  const fallbackTable = translations.el;
  const template = (langTable && langTable[key]) || (fallbackTable && fallbackTable[key]) || key;
  return template.replace(/\{(\w+)\}/g, (_, k) => (vars[k] !== undefined ? vars[k] : `{${k}}`));
}

function initAiLoadingOverlay() {
  if (aiLoadingOverlay) return aiLoadingOverlay;
  const overlay = document.createElement('div');
  overlay.id = 'ai-loading-overlay';
  overlay.className = 'ai-loading-overlay';
  overlay.innerHTML = `
    <div class="ai-loading-box" role="status" aria-live="polite">
      <div class="ai-loading-spinner" aria-hidden="true"></div>
      <div class="ai-loading-text">${t('aiLoadingMessage')}</div>
    </div>
  `;
  overlay.setAttribute('aria-hidden', 'true');
  document.body.appendChild(overlay);
  aiLoadingOverlay = overlay;
  return aiLoadingOverlay;
}

function setAiLoading(isVisible) {
  const overlay = initAiLoadingOverlay();
  overlay.classList.toggle('visible', isVisible);
  overlay.setAttribute('aria-hidden', isVisible ? 'false' : 'true');
}

function updateAiLoadingText() {
  if (!aiLoadingOverlay) return;
  const label = aiLoadingOverlay.querySelector('.ai-loading-text');
  if (label) label.textContent = t('aiLoadingMessage');
}

function getSpeechRecognitionCtor() {
  return window.SpeechRecognition || window.webkitSpeechRecognition || null;
}

function attachSpeechToInput(buttonId, inputId) {
  const button = document.getElementById(buttonId);
  const input = document.getElementById(inputId);
  if (!button || !input) return;

  const SpeechRecognition = getSpeechRecognitionCtor();
  const setButtonLabel = (label, icon = '🎤') => {
    button.innerHTML = `${icon} ${label}`;
  };

  if (!SpeechRecognition) {
    button.disabled = true;
    button.classList.add('disabled');
    button.title = t('speechUnsupported');
    setButtonLabel(t('speechUnavailable'), '🚫');
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = true;

  let shouldContinueListening = false;

  const resetState = () => {
    shouldContinueListening = false;
    button.dataset.listening = 'false';
    button.classList.remove('listening');
    setButtonLabel(t('speechButtonLabel'));
  };

  recognition.addEventListener('result', (event) => {
    const transcript = Array.from(event.results)
      .map((result) => (result[0] && result[0].transcript) || '')
      .join(' ')
      .trim();

    if (transcript) {
      const existing = input.value.trim();
      input.value = existing ? `${existing} ${transcript}` : transcript;
      input.dispatchEvent(new Event('input', { bubbles: true }));
    }
  });

  recognition.addEventListener('error', resetState);
  recognition.addEventListener('end', () => {
    if (shouldContinueListening) {
      try {
        recognition.start();
      } catch (error) {
        resetState();
      }
      return;
    }

    resetState();
  });

  setButtonLabel(t('speechButtonLabel'));

  button.addEventListener('click', () => {
    const isListening = button.dataset.listening === 'true';

    if (isListening) {
      shouldContinueListening = false;
      recognition.stop();
      resetState();
      return;
    }

    recognition.lang = currentLanguage === 'el' ? 'el-GR' : 'en-US';
    shouldContinueListening = true;
    button.dataset.listening = 'true';
    button.classList.add('listening');
    setButtonLabel(t('speechListening'), '🎙️');

    try {
      recognition.start();
    } catch (error) {
      resetState();
    }
  });
}

async function ensureCategoryTree() {
  if (categoryTree.length) return categoryTree;
  try {
    const res = await fetch(withBase('/api/categories'));
    const data = await res.json();
    categoryTree = Array.isArray(data.categories) ? data.categories : [];
    categoryFieldConfig = data.fields && typeof data.fields === 'object' ? data.fields : {};
  } catch (error) {
    console.error('Failed to load categories', error);
    categoryTree = [];
    categoryFieldConfig = {};
  }
  return categoryTree;
}

function getSubcategoriesFor(categoryName) {
  const normalized = (categoryName || '').trim();
  if (!normalized) return [];
  const found = categoryTree.find((entry) => entry.name === normalized);
  return found?.subcategories || [];
}

function buildCategoryOptions(selectedCategory) {
  const options = [`<option value="">${t('selectCategoryPlaceholder')}</option>`];
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

function getSpecificFieldDefinitions(categoryName, subcategoryName) {
  const categoryConfig = categoryFieldConfig?.[categoryName] || {};
  const baseFields = Array.isArray(categoryConfig.fields) ? categoryConfig.fields : [];
  const subcategoryConfig = categoryConfig.subcategories || {};
  const subcategoryFields = Array.isArray(subcategoryConfig?.[subcategoryName])
    ? subcategoryConfig[subcategoryName]
    : [];

  const combined = [];
  const seen = new Set();

  [...baseFields, ...subcategoryFields].forEach((field) => {
    if (!field?.key || seen.has(field.key)) return;
    seen.add(field.key);
    combined.push({ key: field.key, label: field.label || field.key });
  });

  return combined;
}

function buildSpecificFields(categoryName, subcategoryName, provided = []) {
  const definitions = getSpecificFieldDefinitions(categoryName, subcategoryName);
  const providedMap = new Map();

  if (Array.isArray(provided)) {
    provided.forEach((field) => {
      if (field && typeof field.key === 'string') {
        providedMap.set(field.key, field.value ?? '');
      }
    });
  }

  return definitions.map((def) => ({
    key: def.key,
    label: def.label,
    subcategory: subcategoryName || '',
    value: providedMap.has(def.key) ? providedMap.get(def.key) : ''
  }));
}

function determineFieldSize(field) {
  const text = `${field.key || ''} ${field.label || ''}`.toLowerCase();

  const shortPatterns = [
    'age',
    'ηλικ',
    'year',
    'έτος',
    'floor',
    'όροφος',
    'doors',
    'seats',
    'cc',
    'hp',
    'vat',
    'id',
    'km',
    'χιλιόμετρα',
    'sqm',
    'τ.μ',
    'm²',
    'watt',
    'kw',
    'owners',
    'qty',
    'ποσότητα'
  ];

  const longPatterns = [
    'description',
    'περιγραφή',
    'history',
    'ιστορικό',
    'services',
    'εργασίες',
    'materials',
    'υλικά',
    'remarks',
    'παρατηρήσεις',
    'availability',
    'διαθεσιμότητα',
    'coverage',
    'περιοχές',
    'delivery',
    'παραδόσεις',
    'notes',
    'σημειώσεις'
  ];

  if (longPatterns.some((pattern) => text.includes(pattern)) || (field.label || '').length > 28) {
    return 'lg';
  }

  if (shortPatterns.some((pattern) => text.includes(pattern)) || (field.label || '').length <= 12) {
    return 'sm';
  }

  return 'md';
}

function renderSpecificFieldInputs(fields = [], options = {}) {
  const container = document.getElementById('specific-fields-body');
  if (!container) return;

  if (!fields.length) {
    container.innerHTML = `<p class="status subtle">${t('fieldSpecificEmpty')}</p>`;
    return;
  }

  const contextCategory = (options.category || currentDraftAd?.category || '').trim();
  const contextSubcategory = (options.subcategory || fields[0]?.subcategory || currentDraftAd?.subcategory || '').trim();
  const isCarContext = contextCategory.toLowerCase() === 'οχήματα' && isCarSubcategory(contextSubcategory);
  const selectedBrand = fields.find((field) => field.key === 'make')?.value || '';
  const selectedModel = fields.find((field) => field.key === 'model')?.value || '';

  const buildBrandOptions = (currentValue) => {
    const normalized = (currentValue || '').trim();
    const options = [`<option value="">${t('selectMakePlaceholder')}</option>`];
    getCarBrands().forEach((brand) => {
      const isSelected = brand === normalized;
      options.push(`<option value="${brand}" ${isSelected ? 'selected' : ''}>${brand}</option>`);
    });
    return options.join('');
  };

  const buildModelOptions = (brand, currentValue) => {
    const normalizedBrand = (brand || '').trim();
    const models = getCarModels(normalizedBrand);
    const normalizedModel = (currentValue || '').trim();
    const hasBrand = Boolean(normalizedBrand);
    const options = [
      `<option value="">${t(hasBrand ? 'selectModelPlaceholder' : 'selectModelPlaceholderNoBrand')}</option>`
    ];
    models.forEach((model) => {
      const isSelected = model === normalizedModel;
      options.push(`<option value="${model}" ${isSelected ? 'selected' : ''}>${model}</option>`);
    });
    return { options: options.join(''), disabled: !hasBrand };
  };

  container.innerHTML = fields
    .map((field, idx) => {
      const size = determineFieldSize(field);
      const visualSize = size === 'sm' ? 8 : size === 'md' ? 18 : 36;

      if (isCarContext && field.key === 'make') {
        const brandOptions = buildBrandOptions(field.value);
        return `
        <div class="field specific-field size-${size}">
          <label for="specific-${idx}">${field.label}</label>
          <select
            id="specific-${idx}"
            class="input ad-editor-input"
            data-field-key="${field.key}"
            data-field-label="${field.label}"
          >
            ${brandOptions}
          </select>
        </div>
      `;
      }

      if (isCarContext && field.key === 'model') {
        const modelOptions = buildModelOptions(selectedBrand, field.value || selectedModel);
        return `
        <div class="field specific-field size-${size}">
          <label for="specific-${idx}">${field.label}</label>
          <select
            id="specific-${idx}"
            class="input ad-editor-input"
            data-field-key="${field.key}"
            data-field-label="${field.label}"
            ${modelOptions.disabled ? 'disabled' : ''}
          >
            ${modelOptions.options}
          </select>
        </div>
      `;
      }

      return `
        <div class="field specific-field size-${size}">
          <label for="specific-${idx}">${field.label}</label>
          <input
            id="specific-${idx}"
            class="input ad-editor-input"
            data-field-key="${field.key}"
            data-field-label="${field.label}"
            type="text"
            value="${field.value ?? ''}"
            size="${visualSize}"
          />
        </div>
      `;
    })
    .join('');

  if (isCarContext) {
    const brandSelect = container.querySelector('select[data-field-key="make"]');
    const modelSelect = container.querySelector('select[data-field-key="model"]');

    if (brandSelect && modelSelect) {
      brandSelect.addEventListener('change', (event) => {
        const previousModel = modelSelect.value;
        const nextOptions = buildModelOptions(event.target.value, previousModel);
        modelSelect.innerHTML = nextOptions.options;
        modelSelect.disabled = nextOptions.disabled;
      });
    }
  }
}

function collectSpecificFieldValues() {
  const container = document.getElementById('specific-fields-body');
  const subcategory = document.getElementById('ad-subcategory-input')?.value.trim() || '';
  if (!container) return [];

  const inputs = container.querySelectorAll('[data-field-key]');
  return Array.from(inputs).map((input) => ({
    key: input.dataset.fieldKey,
    label: input.dataset.fieldLabel || input.dataset.fieldKey,
    subcategory,
    value: input.value.trim()
  }));
}

function buildSubcategoryOptions(categoryName, selectedSubcategory) {
  const options = [`<option value="">${t('selectSubcategoryPlaceholder')}</option>`];
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
  const navCreate = document.querySelector('.nav-btn[data-target="create-ad"]');
  const navMyAds = document.querySelector('.nav-btn[data-target="my-ads"]');
  const navAbout = document.querySelector('.nav-btn[data-target="about"]');
  if (navHome) navHome.textContent = t('navHome');
  if (navAccount) navAccount.textContent = t('navAccount');
  if (navCreate) navCreate.textContent = t('navAdCreation');
  if (navMyAds) navMyAds.textContent = t('navMyAds');
  if (navAbout) navAbout.textContent = t('navAbout');
  if (menuToggle) menuToggle.setAttribute('aria-label', t('menuToggleLabel'));
  updateAiLoadingText();
  updateAccountNav();
}

function rerenderCurrentView() {
  switch (currentView.name) {
    case 'account':
      renderAccount();
      break;
    case 'create-ad':
      renderAdCreation();
      break;
    case 'preview':
      renderPreviewPage(currentView.data || {});
      break;
    case 'my-ads':
      renderMyAds();
      break;
    case 'about':
      renderAbout();
      break;
    case 'login':
      renderLogin();
      break;
    case 'detail':
      if (currentView.data?.id) {
        openAdDetail(currentView.data.id, { replaceHistory: true });
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

function localizeAdForCurrentLanguage(ad = {}) {
  const preferred = currentLanguage === 'el' ? 'el' : 'en';
  const fallback = preferred === 'en' ? 'el' : 'en';

  return {
    ...ad,
    title: ad[`title_${preferred}`] || ad[`title_${fallback}`] || ad.title || '',
    description:
      ad[`description_${preferred}`] || ad[`description_${fallback}`] || ad.description || '',
    category: ad[`category_${preferred}`] || ad[`category_${fallback}`] || ad.category || '',
    location: ad[`location_${preferred}`] || ad[`location_${fallback}`] || ad.location || ''
  };
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

function dataUrlSize(dataUrl) {
  const base64 = (dataUrl || '').split(',')[1] || '';
  return Math.round(base64.length * 0.75);
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(ev.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function downscaleImageIfNeeded(file) {
  const originalDataUrl = await readFileAsDataUrl(file);

  if (file.size <= MAX_IMAGE_BYTES) {
    return { dataUrl: originalDataUrl, size: file.size };
  }

  return new Promise((resolve) => {
    const image = new Image();

    image.onload = () => {
      const maxDimension = 1920;
      const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
      const targetWidth = Math.max(1, Math.round(image.width * scale));
      const targetHeight = Math.max(1, Math.round(image.height * scale));

      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

      let quality = 0.9;
      let scaledDataUrl = canvas.toDataURL('image/jpeg', quality);
      let scaledSize = dataUrlSize(scaledDataUrl);

      while (scaledSize > MAX_IMAGE_BYTES && quality > 0.4) {
        quality = Math.max(quality - 0.1, 0.4);
        scaledDataUrl = canvas.toDataURL('image/jpeg', quality);
        scaledSize = dataUrlSize(scaledDataUrl);
      }

      resolve({ dataUrl: scaledDataUrl, size: scaledSize });
    };

    image.onerror = () => resolve({ dataUrl: originalDataUrl, size: file.size });
    image.src = originalDataUrl;
  });
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
  const fileInput = document.getElementById('image-input');
  const statusEl = document.getElementById('upload-status');

  if (!uploadArea || !fileInput || !statusEl) return;

  const updateStatus = (message, isError = false) => {
    statusEl.textContent = message || '';
    statusEl.classList.toggle('error', isError);
  };

  const handleFiles = async (files) => {
    if (!files?.length) return;

    const remainingSlots = MAX_UPLOAD_IMAGES - attachedImages.length;
    if (remainingSlots <= 0) {
      updateStatus(t('uploadStatusLimit'), true);
      return;
    }

    let rejected = 0;
    let added = 0;

    for (const file of Array.from(files).slice(0, remainingSlots)) {
      if (!file.type.startsWith('image/')) {
        rejected += 1;
        continue;
      }

      try {
        const { dataUrl, size } = await downscaleImageIfNeeded(file);
        attachedImages.push({ name: file.name, dataUrl, size });
        added += 1;
        renderImagePreviews();
      } catch (err) {
        rejected += 1;
      }
    }

    if (rejected) {
      updateStatus(t('uploadStatusRejected', { count: rejected }), true);
    }

    if (added) {
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
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = '';
  });

  renderImagePreviews();
  updateStatus(t('uploadStatusDefault'));
}

function getPromptPayload(prompt, imagesOverride = null) {
  const images = Array.isArray(imagesOverride)
    ? imagesOverride
    : attachedImages.map((img) => img.dataUrl);
  return {
    prompt,
    images,
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
  const hideDetails = resultsLayout === 'tiles' || resultsLayout === 'lines';
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
  const location = ad.location || t('adCardUnknownLocation');

  return `
    <article class="ad-card clickable" data-id="${ad.id}" tabindex="0">
      ${thumbBlock}
      <div>
        <div class="title">${ad.title}</div>
        <div class="meta">${location} ${price}</div>
        ${hideDetails ? '' : `<div class="description">${truncated}</div>`}
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
    const res = await fetch(withBase(path), {
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
  const createBtn = document.querySelector('.nav-btn[data-target="create-ad"]');
  const myAdsBtn = document.querySelector('.nav-btn[data-target="my-ads"]');
  const user = getStoredUser();

  if (accountBtn) {
    accountBtn.textContent = t('navAccount');
  }

  const shouldShowProtected = Boolean(user);

  if (createBtn) {
    createBtn.textContent = t('navAdCreation');
    createBtn.classList.toggle('hidden', !shouldShowProtected);
  }

  if (myAdsBtn) {
    myAdsBtn.textContent = t('navMyAds');
    myAdsBtn.classList.toggle('hidden', !shouldShowProtected);
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

function setupPromptDockToggle(dock) {
  const toggleBtn = dock.querySelector('.prompt-dock-toggle');
  const body = dock.querySelector('.prompt-dock-body');
  if (!toggleBtn || !body) return;

  const titleEl = dock.querySelector('.prompt-dock-title');
  const labelText = dock.dataset.label || titleEl?.textContent?.trim() || t('promptDockLabel');

  if (titleEl && !titleEl.textContent.trim()) {
    titleEl.textContent = labelText;
  }

  const setState = (collapsed) => {
    dock.classList.toggle('collapsed', collapsed);
    body.hidden = collapsed;
    toggleBtn.textContent = collapsed ? t('promptDockExpand') : t('promptDockMinimize');
    toggleBtn.setAttribute('aria-expanded', (!collapsed).toString());
    toggleBtn.setAttribute('aria-label', `${collapsed ? t('promptDockExpand') : t('promptDockMinimize')} ${labelText}`);
  };

  toggleBtn.addEventListener('click', () => {
    setState(!dock.classList.contains('collapsed'));
  });

  setState(dock.classList.contains('collapsed'));
}

function initPromptDocks(root = document) {
  const docks = root.querySelectorAll('.prompt-dock');
  docks.forEach(setupPromptDockToggle);
}

function navigateHome({ replaceHistory = false, skipHistory = false } = {}) {
  if (!skipHistory) {
    const homePath = withBase('/');
    if (replaceHistory) {
      window.history.replaceState({}, '', homePath);
    } else {
      window.history.pushState({}, '', homePath);
    }
  }

  renderHome();
}

function renderHome() {
  setView('home');
  setActiveNav('home');
  mainEl.innerHTML = `
    <div class="hero-card">
      <h1>${t('heroTitle')}</h1>
    </div>
    <div class="prompt-dock" data-label="${t('promptDockLabel')}">
      <div class="prompt-dock-header">
        <div class="prompt-dock-title">${t('promptDockLabel')}</div>
        <button type="button" class="prompt-dock-toggle" aria-expanded="true">${t('promptDockMinimize')}</button>
      </div>
      <div class="prompt-dock-body">
        <textarea id="prompt" class="prompt-area" placeholder="${t('heroPlaceholder')}"></textarea>
        <div class="prompt-toolbar">
          <button id="prompt-speech-btn" class="button ghost tiny speech-button" type="button">${t('speechButtonLabel')}</button>
        </div>
        <div class="actions">
          <button id="search-btn" class="button primary">${t('searchButton')}</button>
        </div>
        <div id="status" class="status"></div>
      </div>
    </div>
    <div class="section" id="results-section" style="display:none;"></div>
  `;

  document.getElementById('search-btn').addEventListener('click', handleSearchAds);
  attachSpeechToInput('prompt-speech-btn', 'prompt');
  const restored = restoreSearchUI();
  if (!restored) loadRecentAds();
  initPromptDocks(mainEl);
}

function renderSearchOnly() {
  setView('home');
  setActiveNav('search');
  mainEl.innerHTML = `
    <div class="hero-card">
      <h1>${t('searchOnlyTitle')}</h1>
    </div>
    <div class="prompt-dock" data-label="${t('promptDockLabel')}">
      <div class="prompt-dock-header">
        <div class="prompt-dock-title">${t('promptDockLabel')}</div>
        <button type="button" class="prompt-dock-toggle" aria-expanded="true">${t('promptDockMinimize')}</button>
      </div>
      <div class="prompt-dock-body">
        <textarea id="prompt" class="prompt-area" placeholder="${t('searchOnlyPlaceholder')}"></textarea>
        <div class="prompt-toolbar">
          <button id="prompt-speech-btn" class="button ghost tiny speech-button" type="button">${t('speechButtonLabel')}</button>
        </div>
        <div class="actions">
          <button id="search-btn" class="button primary">${t('searchButton')}</button>
        </div>
        <div id="status" class="status"></div>
      </div>
    </div>
    <div class="section" id="results-section" style="display:none;"></div>
  `;

  document.getElementById('search-btn').addEventListener('click', handleSearchAds);
  attachSpeechToInput('prompt-speech-btn', 'prompt');
  const restored = restoreSearchUI();
  if (!restored) loadRecentAds();
  initPromptDocks(mainEl);
}

function renderLogin() {
  setView('login');
  setActiveNav('login');
  const user = getStoredUser();
  const registerCard = user
    ? ''
    : `
        <div class="card auth-card">
          <h2>${t('registerTitle')}</h2>
          <p class="status subtle">${t('registerSubtitle')}</p>
          <div class="field">
            <label for="register-email">${t('loginEmailLabel')}</label>
            <input id="register-email" class="input" type="email" placeholder="${t('loginEmailPlaceholder')}" />
          </div>
          <div class="field">
            <label for="register-phone">${t('registerPhoneLabel')}</label>
            <input id="register-phone" class="input" type="tel" placeholder="${t('registerPhonePlaceholder')}" />
          </div>
          <div class="field">
            <label for="register-password">${t('loginPasswordLabel')}</label>
            <input id="register-password" class="input" type="password" placeholder="${t('registerPasswordPlaceholder')}" />
          </div>
          <div class="actions">
            <button id="register-btn" class="button secondary">${t('registerButton')}</button>
          </div>
          <div id="register-status" class="status"></div>
        </div>`;
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

      ${registerCard}

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

  const registerBtn = document.getElementById('register-btn');
  if (registerBtn) {
    registerBtn.addEventListener('click', () =>
      handleAuth({
        type: 'register',
        emailInput: 'register-email',
        phoneInput: 'register-phone',
        passwordInput: 'register-password',
        statusEl: 'register-status'
      })
    );
  }

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
  const verificationNotice = user.verified
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
          <div class="label">${t('registerPhoneLabel')}</div>
          <div class="value">${sanitizePhone(user.phone)}</div>
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
      ${verificationNotice}
      <div class="status">${createdAdCopy}</div>
      <div class="actions">
        <button id="account-logout" class="button">${t('logoutButton')}</button>
      </div>
    </div>
  `;

  document.getElementById('account-logout').addEventListener('click', () => {
    setStoredUser(null);
    renderLogin();
  });
}

function renderAdCreation(options = {}) {
  const isEditing = options.isEditing === true;
  const user = getStoredUser();
  setView('create-ad');
  setActiveNav('create-ad');

  if (!isEditing) {
    currentDraftAd = null;
    currentEditingAdId = null;
    attachedImages = [];
  }

  if (!user) {
    mainEl.innerHTML = `
      <div class="card" style="max-width:520px; margin:0 auto;">
        <h2>${t('navAdCreation')}</h2>
        <p class="status">${t('accountPrompt')}</p>
        <div class="actions">
          <button class="button primary" id="account-login">${t('accountLoginButton')}</button>
        </div>
      </div>
    `;
    document.getElementById('account-login').addEventListener('click', renderLogin);
    return;
  }

  const creationDisabled = user.verified ? '' : 'disabled';
  const creationNotice = user.verified
    ? ''
    : `<div class="status warning" style="margin-top:12px;">${t('accountVerificationNotice')}</div>`;

  mainEl.innerHTML = `
    <div class="hero-card">
      <h2>${t('accountCreateHeading')}</h2>
      <p>${t('accountCreateSubheading')}</p>
      <div class="upload-area" id="upload-area">
        <div>
          <div class="upload-title">${t('uploadTitle')}</div>
          <p class="upload-copy">${t('uploadCopy')}</p>
        </div>
        <input id="image-input" type="file" accept="image/*" multiple hidden />
      </div>
      <div id="upload-status" class="status subtle"></div>
      <div id="image-previews" class="image-previews"></div>
      ${creationNotice}
    </div>
    <div class="prompt-dock" data-label="${t('promptDockLabel')}">
      <div class="prompt-dock-header">
        <div class="prompt-dock-title">${t('promptDockLabel')}</div>
        <button type="button" class="prompt-dock-toggle" aria-expanded="true">${t('promptDockMinimize')}</button>
      </div>
      <div class="prompt-dock-body">
        <textarea id="prompt" class="prompt-area" placeholder="${t('accountPromptPlaceholder')}"></textarea>
        <div class="prompt-toolbar">
          <button id="prompt-speech-btn" class="button ghost tiny speech-button" type="button">${t('speechButtonLabel')}</button>
        </div>
        <div class="actions">
          <button id="create-btn" class="button primary" ${creationDisabled}>${t('createButton')}</button>
        </div>
        <div id="status" class="status"></div>
      </div>
    </div>
    <div class="section" id="results-section" style="display:none;"></div>
  `;

  document.getElementById('create-btn').addEventListener('click', handleCreateAd);
  setupImageInput();
  attachSpeechToInput('prompt-speech-btn', 'prompt');
  initPromptDocks(mainEl);

  if (isEditing && currentDraftAd) {
    showBanner(t('editModeNotice'), 'success');
  }
}

function renderPreviewPage(options = {}) {
  const isEditing = options.isEditing === true || Boolean(currentEditingAdId);
  setView('preview', { isEditing });
  setActiveNav('create-ad');

  if (!currentDraftAd) {
    mainEl.innerHTML = `
      <div class="card" style="max-width:520px; margin:0 auto;">
        <h2>${t('previewHeading')}</h2>
        <p class="status error">${t('previewMissingDraft')}</p>
        <div class="actions">
          <button id="preview-back-create" class="button primary">${t('createButton')}</button>
        </div>
      </div>
    `;

    const backBtn = document.getElementById('preview-back-create');
    if (backBtn) backBtn.addEventListener('click', () => renderAdCreation());
    return;
  }

  mainEl.innerHTML = `
    <div class="section-header" style="align-items:center; gap:12px; margin-bottom:12px;">
      <div>
        <h2>${t('previewHeading')}</h2>
        <p class="status subtle">${t('previewPageSubtitle')}</p>
      </div>
      <button id="return-to-builder" class="button">${t('previewBackButton')}</button>
    </div>
    <div class="section" id="preview-section"></div>
  `;

  const backBtn = document.getElementById('return-to-builder');
  if (backBtn) backBtn.addEventListener('click', () => renderAdCreation());

  renderDraftEditor(currentDraftAd, { isEditing });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderMyAds() {
  const user = getStoredUser();
  setView('my-ads');
  setActiveNav('my-ads');

  if (!user) {
    mainEl.innerHTML = `
      <div class="card" style="max-width:520px; margin:0 auto;">
        <h2>${t('navMyAds')}</h2>
        <p class="status">${t('accountPrompt')}</p>
        <div class="actions">
          <button class="button primary" id="account-login">${t('accountLoginButton')}</button>
        </div>
      </div>
    `;
    document.getElementById('account-login').addEventListener('click', renderLogin);
    return;
  }

  mainEl.innerHTML = `
    <div class="card" id="user-ads-card" style="margin-top:16px;">
      <div class="section-header">
        <h2>${t('navMyAds')}</h2>
      </div>
      <p class="status subtle">${t('accountMyAdsHeading')}</p>
      <div id="user-ads-list" class="ad-results ${resultsLayout}">${t('accountMyAdsLoading')}</div>
    </div>
  `;

  loadUserAds(user.id);
}

function renderPromptCard(demo) {
  return `
    <div class="prompt-card" id="prompt-${demo.id}">
      <h4>${t(demo.titleKey)}</h4>
      <div class="prompt-label">${t('aiPromptInstructionLabel')}</div>
      <pre>${demo.instruction}</pre>
      <div class="prompt-label">${t('aiPromptUserLabel')}</div>
      <pre>${demo.user}</pre>
      <div class="prompt-label">${t('aiPromptFinalLabel')}</div>
      <pre>${demo.final}</pre>
    </div>
  `;
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
      <div class="section" style="margin-top:16px;">
        <div class="section-header">
          <h3>${t('aiPromptDemoHeading')}</h3>
        </div>
        <p>${t('aiPromptDemoIntro')}</p>
        <div class="demo-prompts">
          ${promptDemos.map(renderPromptCard).join('')}
        </div>
      </div>
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

  if (!isValidPhone(user.phone)) {
    status.textContent = t('authPhoneRequired');
    status.classList.add('error');
    return;
  }
  const payload = getPromptPayload(prompt);
  status.textContent = t('createProcessing');
  const previewSection = document.getElementById('preview-section');
  if (previewSection) previewSection.style.display = 'none';

  currentDraftAd = null;

  const saveStatus = document.getElementById('save-status');
  if (saveStatus) {
    saveStatus.textContent = '';
    saveStatus.classList.remove('error', 'success');
  }

  setAiLoading(true);
  try {
    const res = await fetch(withBase('/api/ai/create-ad'), {
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
    const ad = {
      ...data.ad,
      images: adImages,
      contact_phone: sanitizePhone(user.phone || data.ad.contact_phone),
      contact_email: '',
      source_prompt: prompt
    };
    currentDraftAd = ad;
    status.textContent = '';
    status.classList.remove('error');
    status.classList.remove('success');
    showBanner(t('createSuccess'), 'success');
    renderPreviewPage({ isEditing: false });
  } catch (error) {
    status.textContent = error.message;
    status.classList.remove('success');
    status.classList.add('error');
  } finally {
    setAiLoading(false);
  }
}

function buildDraftFromEditorInputs() {
  if (!currentDraftAd) return null;

  const user = getStoredUser();
  const priceValue = document.getElementById('ad-price-input')?.value;
  const numericPrice = priceValue === '' ? null : Number(priceValue);
  const includeEmailInput = document.getElementById('ad-include-email');
  const includeEmail = includeEmailInput ? includeEmailInput.checked : Boolean(currentDraftAd.include_contact_email);
  const emailValue = includeEmail ? user?.email || currentDraftAd.contact_email || '' : '';

  const syncedDraft = {
    ...currentDraftAd,
    title: document.getElementById('ad-title-input')?.value?.trim() || '',
    description: document.getElementById('ad-description-input')?.value?.trim() || '',
    category: document.getElementById('ad-category-input')?.value?.trim() || '',
    subcategory: document.getElementById('ad-subcategory-input')?.value?.trim() || '',
    location: document.getElementById('ad-location-input')?.value?.trim() || '',
    price: Number.isFinite(numericPrice) ? numericPrice : null,
    subcategory_fields: collectSpecificFieldValues(),
    contact_phone: sanitizePhone(user?.phone || currentDraftAd.contact_phone),
    contact_email: emailValue,
    include_contact_email: includeEmail,
    images: normalizeImages(currentDraftAd.images || attachedImages)
  };

  return syncedDraft;
}

function buildDraftPromptContext(draft) {
  if (!draft) return '';

  const lines = [
    `${t('fieldTitleLabel')}: ${draft.title || '-'}`,
    `${t('fieldDescriptionLabel')}: ${draft.description || '-'}`,
    `${t('fieldCategoryLabel')}: ${draft.category || '-'}`,
    `${t('fieldSubcategoryLabel')}: ${draft.subcategory || '-'}`,
    `${t('fieldLocationLabel')}: ${draft.location || '-'}`,
    `${t('fieldPriceLabel')}: ${draft.price != null ? draft.price : t('previewPriceOnRequest')}`,
    `${t('contactPhoneLabel')}: ${draft.contact_phone || t('contactNotProvided')}`,
    `${t('contactEmailLabel')}: ${draft.contact_email || t('contactNotProvided')}`
  ];

  const specificFields = (draft.subcategory_fields || [])
    .filter((field) => field && (field.key || field.label))
    .map((field) => `${field.label || field.key}: ${field.value || ''}`);

  if (specificFields.length) {
    lines.push(`${t('fieldSpecificHeading')}: ${specificFields.join('; ')}`);
  }

  return lines.join('\n');
}

async function handleDraftRevision() {
  const promptInput = document.getElementById('draft-revision-prompt');
  const statusEl = document.getElementById('draft-revision-status');

  if (!promptInput || !statusEl) return;

  const revisionPrompt = promptInput.value.trim();
  statusEl.classList.remove('error', 'success', 'subtle');
  statusEl.textContent = '';

  const user = getStoredUser();
  if (!user) {
    statusEl.textContent = t('authUserRequired');
    statusEl.classList.add('error');
    return;
  }

  if (!user.verified) {
    statusEl.textContent = t('authVerificationRequired');
    statusEl.classList.add('error');
    return;
  }

  if (!isValidPhone(user.phone)) {
    statusEl.textContent = t('authPhoneRequired');
    statusEl.classList.add('error');
    return;
  }

  if (!currentDraftAd) {
    statusEl.textContent = t('draftRevisionMissingDraft');
    statusEl.classList.add('error');
    return;
  }

  if (!revisionPrompt) {
    statusEl.textContent = t('draftRevisionPromptRequired');
    statusEl.classList.add('error');
    return;
  }

  const syncedDraft = buildDraftFromEditorInputs();
  currentDraftAd = syncedDraft || currentDraftAd;

  const draftContext = buildDraftPromptContext(syncedDraft);
  const payloadPrompt = draftContext
    ? `${revisionPrompt}\n\n${t('draftRevisionContextIntro')}\n${draftContext}`
    : revisionPrompt;

  const payloadImages = syncedDraft?.images && syncedDraft.images.length ? syncedDraft.images : null;
  const payload = getPromptPayload(payloadPrompt, payloadImages);

  statusEl.textContent = t('draftRevisionProcessing');
  statusEl.classList.add('subtle');

  setAiLoading(true);
  try {
    const res = await fetch(withBase('/api/ai/create-ad'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Language': currentLanguage
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.error || t('draftRevisionError'));

    const adImages = normalizeImages(payload.images && payload.images.length ? payload.images : data.ad.images);
    const updatedAd = {
      ...data.ad,
      images: adImages,
      contact_phone: sanitizePhone(user.phone || data.ad.contact_phone),
      contact_email: syncedDraft?.contact_email || data.ad.contact_email || '',
      include_contact_email: syncedDraft?.include_contact_email,
      source_prompt: payloadPrompt
    };

    currentDraftAd = updatedAd;
    const successMessage = t('draftRevisionSuccess');
    statusEl.textContent = successMessage;
    statusEl.classList.remove('error', 'subtle');
    statusEl.classList.add('success');
    renderDraftEditor(updatedAd, { isEditing: Boolean(currentEditingAdId) });
    const refreshedStatus = document.getElementById('draft-revision-status');
    if (refreshedStatus) {
      refreshedStatus.textContent = successMessage;
      refreshedStatus.classList.add('success');
    }
  } catch (error) {
    statusEl.textContent = error.message;
    statusEl.classList.remove('success', 'subtle');
    statusEl.classList.add('error');
  } finally {
    setAiLoading(false);
  }
}

async function renderDraftEditor(ad, options = {}) {
  const previewSection = document.getElementById('preview-section');
  if (!previewSection) return;
  const isEditing = options.isEditing === true;
  const user = getStoredUser();

  await ensureCategoryTree();

  const specificFields = buildSpecificFields(ad.category, ad.subcategory, ad.subcategory_fields);
  currentDraftAd = { ...ad, subcategory_fields: specificFields };

  const galleryImages = normalizeImages(ad.images);
  const galleryMarkup = galleryImages.length
    ? `<div class="preview-gallery">${galleryImages
        .map((img, idx) => `<img src="${img}" alt="${t('adImageAlt', { index: idx + 1 })}">`)
        .join('')}</div>`
    : `<p class="status subtle">${t('previewNoImages')}</p>`;
  const contactPhone = ad.contact_phone || t('contactNotProvided');
  const contactEmail = ad.contact_email || t('contactNotProvided');
  const categoryLine = [ad.category, ad.subcategory].filter(Boolean).join(' • ') || t('previewCategoryFallback');
  const priceValue = ad.price != null ? `€${ad.price}` : t('previewPriceOnRequest');

  const editInfo = isEditing
    ? `<div class="status warning">${t('editRemainingLabel', { count: Math.max(0, Number(ad.remaining_edits) || 0) })}</div>`
    : '';

  previewSection.innerHTML = `
    <h2>${t('previewHeading')}</h2>
    <div class="draft-preview">
      <div class="ad-card preview-card">
        <div class="preview-header">
          <div>
            <div class="title">${ad.title}</div>
            <div class="meta">${categoryLine}</div>
          </div>
          <div class="preview-price">${priceValue}</div>
        </div>
        <div class="preview-meta-grid">
          <div>
            <div class="label">${t('fieldLocationLabel')}</div>
            <div class="value">${ad.location || t('previewLocationFallback')}</div>
          </div>
          <div>
            <div class="label">${t('fieldCategoryLabel')}</div>
            <div class="value">${categoryLine}</div>
          </div>
        </div>
        <div class="description">${ad.description || t('previewNoDescription')}</div>
        ${galleryMarkup}
        <div class="preview-meta-grid">
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
      <div class="card" id="ad-editor">
      <h3>${t('editAdHeading')}</h3>
      <p class="status subtle">${t('reviewInstructions')}</p>
      ${editInfo}
      <div class="field">
        <label for="ad-title-input">${t('fieldTitleLabel')}</label>
        <input id="ad-title-input" class="input ad-editor-input" type="text" />
      </div>
      <div class="field">
        <label for="ad-description-input">${t('fieldDescriptionLabel')}</label>
        <textarea id="ad-description-input" class="input ad-editor-input" rows="4"></textarea>
      </div>
      <div class="field">
        <label for="ad-category-input">${t('fieldCategoryLabel')}</label>
        <select id="ad-category-input" class="input ad-editor-input"></select>
      </div>
      <div class="field">
        <label for="ad-subcategory-input">${t('fieldSubcategoryLabel')}</label>
        <select id="ad-subcategory-input" class="input ad-editor-input"></select>
      </div>
      <div class="field-group" id="specific-fields-group">
        <div class="section-header" style="margin-bottom:8px;">
          <h4>${t('fieldSpecificHeading')}</h4>
        </div>
        <div id="specific-fields-body"></div>
      </div>
      <div class="field">
        <label for="ad-location-input">${t('fieldLocationLabel')}</label>
        <input id="ad-location-input" class="input ad-editor-input" type="text" />
      </div>
      <div class="field">
        <label for="ad-price-input">${t('fieldPriceLabel')}</label>
        <input id="ad-price-input" class="input ad-editor-input" type="number" step="0.01" />
      </div>
      <div class="field">
        <label for="ad-contact-phone">${t('contactPhoneLabel')}</label>
        <input id="ad-contact-phone" class="input ad-editor-input" type="text" disabled />
        <p class="status subtle">${t('contactPhoneLocked')}</p>
      </div>
      <div class="field checkbox-field">
        <label class="checkbox">
          <input id="ad-include-email" type="checkbox" />
          <span>${t('includeEmailLabel')}</span>
        </label>
        <p class="status subtle">${t('includeEmailHelp')}</p>
      </div>
      <div class="field">
        <label for="ad-contact-email">${t('contactEmailLabel')}</label>
        <input id="ad-contact-email" class="input ad-editor-input" type="email" />
      </div>
      <div class="actions">
        <button id="approve-btn" class="button primary">${t('approveButton')}</button>
      </div>
      <div id="save-status" class="status"></div>
      </div>
    </div>
    <div class="prompt-dock" data-label="${t('draftRevisionLabel')}">
      <div class="prompt-dock-header">
        <div class="prompt-dock-title">${t('draftRevisionLabel')}</div>
        <button type="button" class="prompt-dock-toggle" aria-expanded="true">${t('promptDockMinimize')}</button>
      </div>
      <div class="prompt-dock-body">
        <textarea id="draft-revision-prompt" class="prompt-area" rows="3" placeholder="${t('draftRevisionPlaceholder')}"></textarea>
        <div class="prompt-toolbar">
          <button id="draft-revision-speech-btn" class="button ghost tiny speech-button" type="button">${t('speechButtonLabel')}</button>
        </div>
        <div class="actions">
          <button id="draft-revision-btn" class="button secondary">${t('draftRevisionButton')}</button>
        </div>
        <div id="draft-revision-status" class="status"></div>
      </div>
    </div>
  `;

  previewSection.style.display = 'block';

  document.getElementById('ad-title-input').value = ad.title || '';
  document.getElementById('ad-description-input').value = ad.description || '';
  const categorySelect = document.getElementById('ad-category-input');
  const subcategorySelect = document.getElementById('ad-subcategory-input');
  if (categorySelect) {
    categorySelect.innerHTML = buildCategoryOptions(ad.category);
  }
  if (subcategorySelect) {
    subcategorySelect.innerHTML = buildSubcategoryOptions(ad.category, ad.subcategory);
  }

  if (categorySelect && subcategorySelect) {
    categorySelect.addEventListener('change', (event) => {
      const newCategory = event.target.value;
      subcategorySelect.innerHTML = buildSubcategoryOptions(newCategory, '');
      const refreshedFields = buildSpecificFields(newCategory, '', []);
      renderSpecificFieldInputs(refreshedFields, { category: newCategory, subcategory: '' });
      currentDraftAd = {
        ...currentDraftAd,
        category: newCategory,
        subcategory: '',
        subcategory_fields: refreshedFields
      };
    });

    subcategorySelect.addEventListener('change', (event) => {
      const newSubcategory = event.target.value;
      const refreshedFields = buildSpecificFields(categorySelect.value, newSubcategory, []);
      renderSpecificFieldInputs(refreshedFields, {
        category: categorySelect.value,
        subcategory: newSubcategory
      });
      currentDraftAd = {
        ...currentDraftAd,
        category: categorySelect.value,
        subcategory: newSubcategory,
        subcategory_fields: refreshedFields
      };
    });
  }
  renderSpecificFieldInputs(specificFields, { category: ad.category, subcategory: ad.subcategory });
  document.getElementById('ad-location-input').value = ad.location || '';
  document.getElementById('ad-price-input').value = ad.price ?? '';
  const phoneInput = document.getElementById('ad-contact-phone');
  const emailInput = document.getElementById('ad-contact-email');
  const includeEmailInput = document.getElementById('ad-include-email');

  const userPhone = sanitizePhone(user?.phone || ad.contact_phone);
  const shouldIncludeEmail = Boolean(ad.contact_email);
  if (phoneInput) {
    phoneInput.value = userPhone;
  }

  if (emailInput && includeEmailInput) {
    includeEmailInput.checked = shouldIncludeEmail;
    emailInput.value = shouldIncludeEmail ? user?.email || ad.contact_email || '' : '';
    emailInput.disabled = !includeEmailInput.checked;
    emailInput.readOnly = true;
    includeEmailInput.addEventListener('change', () => {
      emailInput.disabled = !includeEmailInput.checked;
      emailInput.value = includeEmailInput.checked ? user?.email || '' : '';
    });
  }

  attachSpeechToInput('draft-revision-speech-btn', 'draft-revision-prompt');

  const revisionBtn = document.getElementById('draft-revision-btn');
  if (revisionBtn) {
    revisionBtn.addEventListener('click', handleDraftRevision);
  }

  document.getElementById('approve-btn').addEventListener('click', handleApproveAd);
  initPromptDocks(previewSection);
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

  if (!isValidPhone(user.phone)) {
    saveStatus.textContent = t('authPhoneRequired');
    saveStatus.classList.add('error');
    return;
  }

  saveStatus.textContent = t('saveProcessing');
  saveStatus.classList.remove('error', 'success');

  const priceValue = document.getElementById('ad-price-input').value;
  const numericPrice = priceValue === '' ? null : Number(priceValue);

  const includeEmail = document.getElementById('ad-include-email')?.checked;
  const specificFieldValues = collectSpecificFieldValues();
  const approvedAd = {
    ...currentDraftAd,
    title: document.getElementById('ad-title-input').value.trim(),
    description: document.getElementById('ad-description-input').value.trim(),
    category: document.getElementById('ad-category-input').value.trim(),
    subcategory: document.getElementById('ad-subcategory-input').value.trim(),
    location: document.getElementById('ad-location-input').value.trim(),
    price: Number.isFinite(numericPrice) ? numericPrice : null,
    subcategory_fields: specificFieldValues,
    contact_phone: sanitizePhone(user.phone),
    contact_email: includeEmail ? user.email : '',
    include_contact_email: includeEmail,
    images: normalizeImages(currentDraftAd.images || attachedImages),
    user_id: user.id,
    source_prompt: currentDraftAd.source_prompt || ''
  };

  try {
    const isEditingExisting = Number.isFinite(currentEditingAdId);
    const endpoint = isEditingExisting ? `/api/ads/${currentEditingAdId}/edit` : '/api/ads/approve';
    const res = await fetch(withBase(endpoint), {
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
    currentDraftAd = null;
    currentEditingAdId = null;
    attachedImages = [];
    const successMessage = isEditingExisting ? t('editSaveSuccess') : t('saveSuccess');
    saveStatus.textContent = successMessage;
    saveStatus.classList.remove('error');
    saveStatus.classList.add('success');
    showBanner(successMessage, 'success');
    const user = getStoredUser();
    if (user) {
      renderMyAds();
    }
  } catch (error) {
    saveStatus.textContent = error.message;
    saveStatus.classList.remove('success');
    saveStatus.classList.add('error');
  }
}

function formatFieldSummary(fields = []) {
  if (!Array.isArray(fields) || !fields.length) return '';

  const cleanFields = fields.filter((field) => field && typeof field.key === 'string');
  if (!cleanFields.length) return '';

  const filled = cleanFields.filter((field) => (field.value || '').toString().trim());
  const list = (filled.length ? filled : cleanFields).map((field) => {
    const label = field.label || field.key;
    const value = (field.value || '').toString().trim() || '-';
    return `${label}: ${value}`;
  });

  return `${t('filterFieldsPrefix')}${list.join(', ')}`;
}

function buildSearchStatusText(filters = {}) {
  const parts = [];

  if (filters.keywords) {
    parts.push(`${t('filterKeywordsPrefix')}${filters.keywords}`);
  }

  if (filters.category) {
    parts.push(`${t('filterCategoryPrefix')}${filters.category}`);
  }

  if (filters.subcategory) {
    parts.push(`${t('filterSubcategoryPrefix')}${filters.subcategory}`);
  }

  if (filters.location) {
    parts.push(`${t('filterLocationPrefix')}${filters.location}`);
  }

  const fieldsPart = formatFieldSummary(filters.subcategory_fields || []);
  if (fieldsPart) {
    parts.push(fieldsPart);
  }

  const prefix = t('searchStatusPrefix');
  return parts.length ? `${prefix} ${parts.join(' ')}` : prefix;
}

async function loadRecentAds(limit = RECENT_ADS_LIMIT) {
  const status = document.getElementById('status');
  const resultsSection = document.getElementById('results-section');

  if (!status || !resultsSection) return;

  status.textContent = t('recentLoading');
  status.classList.remove('error');
  resultsSection.style.display = 'none';

  try {
    const res = await fetch(withBase(`/api/ads/recent?limit=${encodeURIComponent(limit)}`), {
      headers: { 'X-Language': currentLanguage }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('recentError'));

    const ads = data.ads || [];
    const statusText = ads.length ? t('recentHeading') : t('recentEmpty');

    lastSearchState = {
      prompt: '',
      filters: null,
      ads,
      page: 1,
      hasSearch: true,
      statusText
    };

    status.textContent = statusText;
    renderResults(ads, 1);
    resultsSection.style.display = 'block';
  } catch (error) {
    status.textContent = error.message;
    status.classList.add('error');
  }
}

async function handleSearchAds() {
  const promptInput = document.getElementById('prompt');
  const prompt = promptInput ? promptInput.value.trim() : '';
  const status = document.getElementById('status');
  const resultsSection = document.getElementById('results-section');
  const payload = { prompt, language: currentLanguage };
  lastSearchState = { ...lastSearchState, prompt };
  status.textContent = t('searchProcessing');
  resultsSection.style.display = 'none';

  setAiLoading(true);
  try {
    const res = await fetch(withBase('/api/ai/search-ads'), {
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
    const statusText = buildSearchStatusText(filters);
    status.textContent = statusText;
    status.classList.remove('error');

    currentResultsPage = 1;
    lastSearchState = {
      prompt,
      filters,
      ads,
      page: 1,
      hasSearch: true,
      statusText
    };

    renderResults(ads, 1);
    resultsSection.style.display = 'block';
  } catch (error) {
    status.textContent = error.message;
    status.classList.remove('success');
    status.classList.add('error');
  } finally {
    setAiLoading(false);
  }
}

function restoreSearchUI() {
  const promptInput = document.getElementById('prompt');
  const status = document.getElementById('status');
  const resultsSection = document.getElementById('results-section');

  if (promptInput) {
    promptInput.value = lastSearchState.prompt || '';
  }

  if (!lastSearchState.hasSearch || !status || !resultsSection) return false;

  const statusText = lastSearchState.statusText || buildSearchStatusText(lastSearchState.filters || {});
  status.textContent = statusText;
  status.classList.remove('error');

  renderResults(lastSearchState.ads || [], lastSearchState.page || 1);
  resultsSection.style.display = 'block';

  return true;
}

function renderResults(ads, page = currentResultsPage || 1) {
  const resultsSection = document.getElementById('results-section');
  if (!resultsSection) return;

  if (Array.isArray(ads)) {
    currentResultsAds = ads;
  }

  if (!currentResultsAds.length) {
    currentResultsPage = 1;
    lastSearchState = { ...lastSearchState, page: currentResultsPage };
    resultsSection.innerHTML = `
      <div class="section-header">
        <h2>${t('resultsHeading')}</h2>
      </div>
      <p>${t('resultsEmpty')}</p>
    `;
    return;
  }

  const width = resultsSection.clientWidth || resultsSection.offsetWidth || window.innerWidth;
  const nextPageSize = calculateResultsPerPage(width);
  if (nextPageSize !== resultsPerPage) {
    resultsPerPage = nextPageSize;
  }

  const totalPages = Math.max(1, Math.ceil(currentResultsAds.length / resultsPerPage));
  currentResultsPage = Math.min(Math.max(page || 1, 1), totalPages);
  lastSearchState = { ...lastSearchState, ads: currentResultsAds, page: currentResultsPage };

  const start = (currentResultsPage - 1) * resultsPerPage;
  const pageAds = currentResultsAds.slice(start, start + resultsPerPage);
  const localizedAds = pageAds.map((ad) => localizeAdForCurrentLanguage(ad));
  const list = localizedAds.map((ad) => createAdCardMarkup(ad)).join('');

  resultsSection.innerHTML = `
    <div class="section-header">
      <h2>${t('resultsHeading')}</h2>
    </div>
    <div class="ad-results ${resultsLayout}">${list}</div>
    <div class="results-pagination">
      <button id="results-prev" class="button tiny ghost" ${currentResultsPage === 1 ? 'disabled' : ''}>${t(
        'resultsPrevPage'
      )}</button>
      <span class="page-info">${t('resultsPageLabel', { current: currentResultsPage, total: totalPages })}</span>
      <button id="results-next" class="button tiny ghost" ${currentResultsPage === totalPages ? 'disabled' : ''}>${t(
        'resultsNextPage'
      )}</button>
    </div>
  `;

  updateTileColumns(resultsSection);

  const prevButton = document.getElementById('results-prev');
  const nextButton = document.getElementById('results-next');
  if (prevButton) {
    prevButton.addEventListener('click', () => {
      if (currentResultsPage > 1) {
        renderResults(currentResultsAds, currentResultsPage - 1);
      }
    });
  }
  if (nextButton) {
    nextButton.addEventListener('click', () => {
      if (currentResultsPage < totalPages) {
        renderResults(currentResultsAds, currentResultsPage + 1);
      }
    });
  }

  attachAdCardHandlers(resultsSection);
}

function renderUserAdsList(ads) {
  const listEl = document.getElementById('user-ads-list');
  if (!listEl) return;

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

  updateTileColumns(listEl.parentElement || listEl);
  attachAdCardHandlers(listEl);
  attachEditButtons(listEl);
  attachAdManagementButtons(listEl);
}

async function loadUserAds(userId) {
  const listEl = document.getElementById('user-ads-list');
  if (!listEl || !userId) return;
  listEl.innerHTML = t('accountMyAdsLoading');

  try {
    const res = await fetch(withBase(`/api/users/${userId}/ads`), {
      headers: { 'X-Language': currentLanguage }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || t('recentError'));
    const ads = data.ads || [];
    userAdsCache = new Map(ads.map((ad) => [ad.id, ad]));
    renderUserAdsList(ads);
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
  renderPreviewPage({ isEditing: true });
}

async function openAdDetail(adId, { replaceHistory = false, skipHistory = false } = {}) {
  if (!adId) return;

  if (!skipHistory) {
    const detailPath = withBase(`/ads/${adId}`);
    if (replaceHistory) {
      window.history.replaceState({}, '', detailPath);
    } else {
      window.history.pushState({}, '', detailPath);
    }
  }

  setView('detail', { id: adId });
  mainEl.innerHTML = `<div class="card ad-detail"><p class="status">${t('openAdDetailLoading')}</p></div>`;

  try {
    const res = await fetch(withBase(`/api/ads/${adId}`), {
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
    if (backBtn) backBtn.addEventListener('click', () => navigateHome());
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
    const res = await fetch(withBase(`/api/auth/verify?token=${encodeURIComponent(token)}`), {
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
        <div class="meta">${location} ${priceLabel}</div>
        <div class="status subtle">${t('adDetailPostedAt', { date: new Date(ad.created_at).toLocaleString(resolveLocale(currentLanguage)) })}</div>
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
      <div id="report-status" class="status subtle" aria-live="polite"></div>
    </div>
  `;

  const backBtn = document.getElementById('detail-back');
  if (backBtn) backBtn.addEventListener('click', () => navigateHome());
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
    const res = await fetch(withBase(`/api/ads/${adId}/report`), {
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

async function handleAuth({ type, emailInput, passwordInput, phoneInput, statusEl }) {
  const email = document.getElementById(emailInput)?.value?.trim();
  const password = document.getElementById(passwordInput)?.value || '';
  const phone = phoneInput ? document.getElementById(phoneInput)?.value?.trim() : undefined;
  const status = document.getElementById(statusEl);

  if (!status) return;
  status.textContent = t('authSending');
  status.classList.remove('error', 'success');

  if (type === 'register') {
    if (!email || !password || !phone) {
      status.textContent = t('authRegisterMissingFields');
      status.classList.add('error');
      return;
    }

    if (!isValidEmail(email)) {
      status.textContent = t('authInvalidEmail');
      status.classList.add('error');
      return;
    }

    if (!isValidPhone(phone)) {
      status.textContent = t('authInvalidPhone');
      status.classList.add('error');
      return;
    }
  }

  try {
    const res = await fetch(withBase(`/api/auth/${type}`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Language': currentLanguage
      },
      body: JSON.stringify({ email, password, phone })
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

function handleRouteChange({ replaceHistory = false } = {}) {
  const route = parseRouteFromLocation();

  if (route.name === 'detail' && route.adId) {
    openAdDetail(route.adId, { replaceHistory, skipHistory: true });
    return;
  }

  navigateHome({ replaceHistory, skipHistory: true });
}

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.target;
    closeNav();
    if (target === 'home') return navigateHome();
    if (target === 'account') return renderAccount();
    if (target === 'create-ad') return renderAdCreation();
    if (target === 'my-ads') return renderMyAds();
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

initAiLoadingOverlay();
updateLanguageButtons();
applyStaticTranslations();
updateUserBadge();
handleVerificationFromUrl();
window.addEventListener('popstate', () => handleRouteChange());
handleRouteChange({ replaceHistory: true });
