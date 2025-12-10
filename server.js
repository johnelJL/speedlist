const path = require('path');
const crypto = require('crypto');
const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai').default;
const db = require('./db');
const categories = require('./categories');
const categoryFields = require('./categoryFields');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const basePath = normalizeBasePath(process.env.APP_BASE_PATH || '/nodeapp');
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';
const MAX_AD_EDITS = Number.isFinite(Number(process.env.AD_EDIT_LIMIT))
  ? Number(process.env.AD_EDIT_LIMIT)
  : 3;
let nodemailerPromise;

app.use(express.json({ limit: '25mb' }));

if (basePath !== '/') {
  app.use((req, _res, next) => {
    if (req.url === basePath || req.url === `${basePath}/`) {
      req.url = '/';
    } else if (req.url.startsWith(`${basePath}/`)) {
      req.url = req.url.slice(basePath.length) || '/';
    }

    next();
  });
}

app.use('/static', express.static(path.join(__dirname, 'public')));

db.init();

const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const supportedLanguages = ['en', 'el'];
const messageCatalog = {
  en: {
    promptRequired: 'Prompt is required',
    openaiMissing: 'OpenAI API key not configured',
    aiInvalidJson: 'AI response was not valid JSON',
    aiMissingFields: 'AI did not return required ad fields',
    createAdFailure: 'Failed to create ad with AI',
    recentAdsError: 'Failed to fetch recent ads',
    searchAdsError: 'Failed to search ads with AI',
    invalidAdId: 'Invalid ad id',
    adNotFound: 'Ad not found',
    fetchAdError: 'Failed to fetch ad',
    reportReasonTooLong: 'Report reason cannot exceed 300 characters',
    authMissingFields: 'Email and password are required',
    authRegisterMissingFields: 'Email, phone and password are required',
    authInvalidEmail: 'Please provide a valid email address',
    authInvalidPhone: 'Please provide a valid phone number',
    authPhoneRequired: 'A verified phone number is required to publish listings',
    authPasswordLength: 'Password must be at least 6 characters',
    authNicknameRequired: 'Nickname is required',
    authEmailExists: 'Email already registered',
    authRegistrationSuccess: 'Account created. Please verify your email to activate it.',
    authRegistrationFailed: 'Registration failed',
    authLoginSuccess: 'Login successful.',
    authLoginFailed: 'Login failed',
    authAccountDisabled: 'This account has been disabled by an administrator.',
    authInvalidCredentials: 'Invalid email or password',
    authVerificationRequired: 'Please verify your email before continuing.',
    authVerificationSent: 'Verification email sent. Check your inbox.',
    authVerificationSuccess: 'Email verified successfully. You can now log in.',
    authVerificationInvalid: 'Invalid or expired verification link.',
    authUserRequired: 'You must be signed in to perform this action.',
    userNotFound: 'User not found',
    adEditLimit: 'You have reached the edit limit for this listing.',
    adEditOwnership: 'You can only edit your own approved listings.',
    adEditApproved: 'Only approved listings can be edited.'
  },
  el: {
    promptRequired: 'Απαιτείται προτροπή',
    openaiMissing: 'Δεν έχει ρυθμιστεί το κλειδί OpenAI',
    aiInvalidJson: 'Η απόκριση του AI δεν ήταν έγκυρο JSON',
    aiMissingFields: 'Το AI δεν επέστρεψε τα απαραίτητα πεδία',
    createAdFailure: 'Αποτυχία δημιουργίας αγγελίας με AI',
    recentAdsError: 'Αποτυχία ανάκτησης πρόσφατων αγγελιών',
    searchAdsError: 'Αποτυχία αναζήτησης αγγελιών με AI',
    invalidAdId: 'Μη έγκυρο αναγνωριστικό αγγελίας',
    adNotFound: 'Δεν βρέθηκε η αγγελία',
    fetchAdError: 'Αποτυχία ανάκτησης αγγελίας',
    reportReasonTooLong: 'Η αναφορά δεν μπορεί να ξεπερνά τους 300 χαρακτήρες.',
    authMissingFields: 'Απαιτούνται email και κωδικός',
    authRegisterMissingFields: 'Απαιτούνται email, τηλέφωνο και κωδικός',
    authInvalidEmail: 'Παρακαλώ δώστε ένα έγκυρο email',
    authInvalidPhone: 'Παρακαλώ δώστε ένα έγκυρο τηλέφωνο',
    authPhoneRequired: 'Απαιτείται έγκυρο τηλέφωνο για δημοσίευση αγγελιών',
    authPasswordLength: 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες',
    authNicknameRequired: 'Απαιτείται ψευδώνυμο',
    authEmailExists: 'Το email είναι ήδη καταχωρημένο',
    authRegistrationSuccess: 'Ο λογαριασμός δημιουργήθηκε. Επαλήθευσε το email σου για να ενεργοποιηθεί.',
    authRegistrationFailed: 'Η εγγραφή απέτυχε',
    authLoginSuccess: 'Επιτυχής σύνδεση.',
    authLoginFailed: 'Η σύνδεση απέτυχε',
    authAccountDisabled: 'Ο λογαριασμός έχει απενεργοποιηθεί από διαχειριστή.',
    authInvalidCredentials: 'Λανθασμένο email ή κωδικός',
    authVerificationRequired: 'Πρέπει να επαληθεύσεις το email πριν συνεχίσεις.',
    authVerificationSent: 'Στάλθηκε email επαλήθευσης. Έλεγξε τα εισερχόμενα.',
    authVerificationSuccess: 'Το email επαληθεύτηκε. Μπορείς τώρα να συνδεθείς.',
    authVerificationInvalid: 'Μη έγκυρος ή ληγμένος σύνδεσμος επαλήθευσης.',
    authUserRequired: 'Πρέπει να είσαι συνδεδεμένος για αυτήν την ενέργεια.',
    userNotFound: 'Δεν βρέθηκε χρήστης',
    adEditLimit: 'Έχεις εξαντλήσει τα διαθέσιμα edit για αυτή την αγγελία.',
    adEditOwnership: 'Μπορείς να επεξεργαστείς μόνο εγκεκριμένες αγγελίες σου.',
    adEditApproved: 'Μόνο οι εγκεκριμένες αγγελίες μπορούν να αλλάξουν.'
  }
};

const defaultCreatePrompts = [

  'You are an expert advertising copywriter. analyze photos and prompt to find info about the type of the product, item or service and find the best category and subcategory for it based on the below (the numbered are categories and below them their subcategory)',

  '1.Ακίνητα',

  'Ενοικιάσεις κατοικιών (σπίτια, διαμερίσματα); Πωλήσεις κατοικιών.; Ενοικιάσεις επαγγελματικών χώρων; Πωλήσεις επαγγελματικών χώρων. ; Ενοικιάσεις γης; Πωλήσεις γης. ; Ενοικιάσεις parking; Πωλήσεις parking.',

  '2.Οχήματα',

  'Αυτοκίνητο; Ταξί; Μοτοσυκλέτα; Φορτηγό έως 7,5 t; Φορτηγό άνω των 7,5 t; Λεωφορείο; Φορτωτής / Κλαρκ; Όχημα κατασκευών; Γεωργικό όχημα; Τράκτορας; Τρέιλερ; Επικαθήμενο (ρυμουλκούμενο); Ανταλλακτικά; Ανταλλακτικά μοτοσυκλέτας; Επαγγελματικά ανταλλακτικά; Τροχόσπιτο; Αεροπλάνο; Άλλα οχήματα.',

  '3.Επαγγελματίες – Υπηρεσίες',

  ' Καθηγητές ξένων γλωσσών; Φιλόλογοι; Μαθηματικοί; Δάσκαλοι; Καθηγητές πληροφορικής.; Γηροκόμοι; Οικιακοί βοηθοί; Καθαριστές/απολυμαντές; Κηπουροί; Babysitters; Ελαιοχρωματιστές; Μαρμαράδες; Πατωματζήδες; Ηλεκτρολόγοι; Κατασκευές/ανακαινίσεις; Μηχανικοί & μελετητές ; Λογιστές/φοροτεχνικοί; Μεταφορείς/δακτυλογράφοι; Γραμματείς; Άλλες ειδικότητες υποστήριξης. ; Μουσική & χορός; ΜΜΕ/εκδόσεις; Εικόνα & ήχος; Φωτογράφοι; Διακοσμητές. ; Προγραμματιστές; Μηχανικοί; Άλλες τεχνολογικές ειδικότητες; Τεχνικοί Η/Υ; Αναλυτές συστημάτων. ; Μάγειρες/σεφ; Βοηθοί μάγειρα – sous chef; Μπουφετζήδες; Διανομείς φαγητού; Ψήστες & τυλιχτές;  Οδηγοί οχημάτων; Μεταφορείς/μετακομίσεις; Αεροσυνοδοί – φροντιστές; Άλλες ειδικότητες συγκοινωνιών; Courier;  Αισθητικοί; Μανικιουρίστ; Κομμωτές/κουρείς; Μακιγιέρ; Άλλες ειδικότητες ομορφιάς ; Φύλαξη – ασφάλεια; Βιβλιοθηκονόμοι; Αρχειονόμοι; Διεκπεραιώσεις ΚΤΕΟ; Άλλες υπηρεσίες/ειδικότητες;  Γυμναστές; Άλλες αθλητικές ειδικότητες; Διαιτητές; Ναυαγοσώστες; Οδηγοί βουνού. ; Στελέχη marketing/διαφήμισης; Οικονομολόγοι; Ασφαλιστικοί σύμβουλοι; Business developers; Άλλα στελέχη επιχειρήσεων & επιστήμης.',

  '4.Αλλες κατηγορίες',

  ' Πωλήσεις επιχειρήσεων; Εξοπλισμός επιχειρήσεων; Εξοπλισμός γραφείου; Μηχανήματα; Επαγγελματικές άδειες; Ενοικιάσεις επαγγελματικών χώρων; Πωλήσεις επαγγελματικών χώρων;Έπιπλα; Ηλεκτρικές συσκευές; Αντίκες & έργα τέχνης; Οικιακά σκεύη; Οικοδομικά είδη; Διακόσμηση; Ηλεκτρολόγοι/υδραυλικοί/τεχνίτες; Οικιακές εργασίες. ; Υπολογιστές; Κινητά τηλέφωνα; Ηχοσυστήματα; Τηλεοράσεις; Φωτογραφία; Περιφερειακά Η/Υ; Αξεσουάρ κινητής ; Μουσικά όργανα & αξεσουάρ; Gaming; Βιβλία/τύπος/ταινίες/μουσική; Κυνήγι; Συλλογές; Ταξίδι; Είδη camping; Χόμπι; Ποδήλατα; Όργανα γυμναστικής; Αξεσουάρ ποδηλασίας; Αθλητικά ρούχα & παπούτσια; Ski & snowboarding; Άλλα σπορ.;Σκύλοι; Καναρίνια; Παπαγάλοι; Διάφορα κατοικίδια; Γάτες; Αξεσουάρ. ; Γιατροί; Νοσοκόμοι/νοσηλευτές; Φυσιοθεραπευτές; Ψυχική υγεία; Ιατρικά & νοσηλευτικά είδη; Βιολογικά προϊόντα; Υπηρεσίες ομορφιάς; Φροντίδα ηλικιωμένων. ; Ρολόγια; Τσάντες & είδη ταξιδίου; Ρούχα; Παπούτσια; Κοσμήματα; Αξεσουάρ; Βρεφικά & παιδικά; Γάμος & βάπτιση; Γνωριμίες; Συστέγαση – συγκατοίκηση; Συνοικέσια; Αστρολογία.',

  'Καθε αγγελια εχει μια κατηγορια και μια υποκατηγορια απο τις παραπανω. Γραψε τη κατηγορία και την υποκατηγορία στο τίτλο. Write concise, high-conversion ad copy with a clear call-to-action. Optimize for clarity, brand consistency, and compliance with general advertising policies. Avoid claims that are unverifiable or prohibited.simple words.dont be overexcited.',
];

const defaultSearchPrompts = [

  'You are an expert in categorizing stuff. analyze photos and prompt to find info about the type of the product, item or service and return the matched category and subcategory for it only from the below (the numbered are categories and below them their subcategory)',

  'χρησιμοποιησε συνωνυμα εννικο η πλυθηντικο και αλλες τεχνικες για να βρεις τα καλυτερα keywords για το προιον η υπηρεσια που περιγραφεται απο τις φωτογραφιες και την προτροπη',

  '1.Ακίνητα',

  'Ενοικιάσεις κατοικιών (σπίτια, διαμερίσματα); Πωλήσεις κατοικιών.; Ενοικιάσεις επαγγελματικών χώρων; Πωλήσεις επαγγελματικών χώρων. ; Ενοικιάσεις γης; Πωλήσεις γης. ; Ενοικιάσεις parking; Πωλήσεις parking.',

  '2.Οχήματα',

  'Αυτοκίνητο; Ταξί; Μοτοσυκλέτα; Φορτηγό έως 7,5 t; Φορτηγό άνω των 7,5 t; Λεωφορείο; Φορτωτής / Κλαρκ; Όχημα κατασκευών; Γεωργικό όχημα; Τράκτορας; Τρέιλερ; Επικαθήμενο (ρυμουλκούμενο); Ανταλλακτικά; Ανταλλακτικά μοτοσυκλέτας; Επαγγελματικά ανταλλακτικά; Τροχόσπιτο; Αεροπλάνο; Άλλα οχήματα.',

  '3.Επαγγελματίες – Υπηρεσίες',

  ' Καθηγητές ξένων γλωσσών; Φιλόλογοι; Μαθηματικοί; Δάσκαλοι; Καθηγητές πληροφορικής.; Γηροκόμοι; Οικιακοί βοηθοί; Καθαριστές/απολυμαντές; Κηπουροί; Babysitters; Ελαιοχρωματιστές; Μαρμαράδες; Πατωματζήδες; Ηλεκτρολόγοι; Κατασκευές/ανακαινίσεις; Μηχανικοί & μελετητές ; Λογιστές/φοροτεχνικοί; Μεταφορείς/δακτυλογράφοι; Γραμματείς; Άλλες ειδικότητες υποστήριξης. ; Μουσική & χορός; ΜΜΕ/εκδόσεις; Εικόνα & ήχος; Φωτογράφοι; Διακοσμητές. ; Προγραμματιστές; Μηχανικοί; Άλλες τεχνολογικές ειδικότητες; Τεχνικοί Η/Υ; Αναλυτές συστημάτων. ; Μάγειρες/σεφ; Βοηθοί μάγειρα – sous chef; Μπουφετζήδες; Διανομείς φαγητού; Ψήστες & τυλιχτές;  Οδηγοί οχημάτων; Μεταφορείς/μετακομίσεις; Αεροσυνοδοί – φροντιστές; Άλλες ειδικότητες συγκοινωνιών; Courier;  Αισθητικοί; Μανικιουρίστ; Κομμωτές/κουρείς; Μακιγιέρ; Άλλες ειδικότητες ομορφιάς ; Φύλαξη – ασφάλεια; Βιβλιοθηκονόμοι; Αρχειονόμοι; Διεκπεραιώσεις ΚΤΕΟ; Άλλες υπηρεσίες/ειδικότητες;  Γυμναστές; Άλλες αθλητικές ειδικότητες; Διαιτητές; Ναυαγοσώστες; Οδηγοί βουνού. ; Στελέχη marketing/διαφήμισης; Οικονομολόγοι; Ασφαλιστικοί σύμβουλοι; Business developers; Άλλα στελέχη επιχειρήσεων & επιστήμης.',

  '4.Αλλες κατηγορίες',

  ' Πωλήσεις επιχειρήσεων; Εξοπλισμός επιχειρήσεων; Εξοπλισμός γραφείου; Μηχανήματα; Επαγγελματικές άδειες; Ενοικιάσεις επαγγελματικών χώρων; Πωλήσεις επαγγελματικών χώρων;Έπιπλα; Ηλεκτρικές συσκευές; Αντίκες & έργα τέχνης; Οικιακά σκεύη; Οικοδομικά είδη; Διακόσμηση; Ηλεκτρολόγοι/υδραυλικοί/τεχνίτες; Οικιακές εργασίες. ; Υπολογιστές; Κινητά τηλέφωνα; Ηχοσυστήματα; Τηλεοράσεις; Φωτογραφία; Περιφερειακά Η/Υ; Αξεσουάρ κινητής ; Μουσικά όργανα & αξεσουάρ; Gaming; Βιβλία/τύπος/ταινίες/μουσική; Κυνήγι; Συλλογές; Ταξίδι; Είδη camping; Χόμπι; Ποδήλατα; Όργανα γυμναστικής; Αξεσουάρ ποδηλασίας; Αθλητικά ρούχα & παπούτσια; Ski & snowboarding; Άλλα σπορ.;Σκύλοι; Καναρίνια; Παπαγάλοι; Διάφορα κατοικίδια; Γάτες; Αξεσουάρ. ; Γιατροί; Νοσοκόμοι/νοσηλευτές; Φυσιοθεραπευτές; Ψυχική υγεία; Ιατρικά & νοσηλευτικά είδη; Βιολογικά προϊόντα; Υπηρεσίες ομορφιάς; Φροντίδα ηλικιωμένων. ; Ρολόγια; Τσάντες & είδη ταξιδίου; Ρούχα; Παπούτσια; Κοσμήματα; Αξεσουάρ; Βρεφικά & παιδικά; Γάμος & βάπτιση; Γνωριμίες; Συστέγαση – συγκατοίκηση; Συνοικέσια; Αστρολογία.',

  '',
];

const visitorAdViews = new Map();

function normalizeBasePath(raw) {
  if (!raw) return '/';

  const trimmed = raw.trim();
  if (!trimmed) return '/';

  let normalized = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1);
  }

  return normalized || '/';
}

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((acc, pair) => {
    const [key, ...rest] = pair.split('=');
    if (!key || !rest.length) return acc;
    acc[key.trim()] = decodeURIComponent(rest.join('='));
    return acc;
  }, {});
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidPhone(phone) {
  if (typeof phone !== 'string') return false;
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');
  return /^[+0-9 ()-]+$/.test(trimmed) && digits.length >= 8 && digits.length <= 15;
}

function getVisitorId(req, res) {
  const cookies = parseCookies(req.headers.cookie || '');
  let visitorId = cookies.visitor_id;

  if (!visitorId) {
    visitorId = crypto.randomBytes(16).toString('hex');
    res.setHeader(
      'Set-Cookie',
      `visitor_id=${visitorId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}`
    );
  }

  return visitorId;
}

function resolveLanguage(preferred, req) {
  const candidate = (preferred || req.get('x-language') || '').toLowerCase();
  return supportedLanguages.includes(candidate) ? candidate : 'en';
}

function tServer(lang, key) {
  const table = messageCatalog[lang] || messageCatalog.en;
  return table[key] || messageCatalog.en[key] || key;
}

function getBaseUrl(req) {
  return process.env.APP_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

async function sendVerificationEmail({ to, token, lang, req }) {
  if (!to || !token) return false;
  const verifyUrl = `${getBaseUrl(req)}/?verify=${token}`;
  const subject = lang === 'el' ? 'Επιβεβαίωση email SpeedList' : 'SpeedList email verification';
  const copy =
    lang === 'el'
      ? `Πάτησε στον σύνδεσμο για να ενεργοποιήσεις τον λογαριασμό σου: ${verifyUrl}`
      : `Click the link to activate your account: ${verifyUrl}`;

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const nodemailerModule = await (nodemailerPromise || (nodemailerPromise = import('nodemailer').catch(() => null)));
    const nodemailer = nodemailerModule?.default || nodemailerModule;

    if (nodemailer?.createTransport) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: Boolean(process.env.SMTP_SECURE === 'true'),
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      try {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || 'no-reply@speedlist.gr',
          to,
          subject,
          text: copy,
          html: `<p>${copy}</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`
        });
        return true;
      } catch (error) {
        console.warn('Failed to send verification email', error);
      }
    }
  }

  console.log('Verification email (fallback):', { to, verifyUrl, subject, copy });
  return false;
}

function adminAuth(req, res, next) {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="SpeedList Admin"');
    return res.status(401).send('Unauthorized');
  }

  const decoded = Buffer.from(header.replace('Basic ', ''), 'base64').toString();
  const [user, password] = decoded.split(':');
  if (user === ADMIN_USER && password === ADMIN_PASSWORD) {
    return next();
  }

  return res.status(401).send('Unauthorized');
}

function combineWithDefaults(prompt, defaults = []) {
  const parts = (defaults || [])
    .map((value) => (value || '').toString().trim())
    .filter(Boolean);

  parts.push((prompt || '').toString());
  return parts.join('\n\n');
}

function buildUserContent(prompt, images) {
  const content = [
    {
      type: 'text',
      text: prompt
    }
  ];

  const validImages = (Array.isArray(images) ? images : [])
    .filter((img) => typeof img === 'string' && img.startsWith('data:image/'))
    .slice(0, 4);

  validImages.forEach((img) => {
    content.push({
      type: 'image_url',
      image_url: { url: img }
    });
  });

  return content;
}

function sanitizeImages(images) {
  return (Array.isArray(images) ? images : [])
    .filter((img) => typeof img === 'string' && img.startsWith('data:image/'))
    .slice(0, 4);
}

function getFieldDefinitions(categoryName, subcategoryName) {
  const categoryConfig = categoryFields?.[categoryName] || {};
  const baseFields = Array.isArray(categoryConfig.fields) ? categoryConfig.fields : [];
  const subcategoryFields = Array.isArray(categoryConfig.subcategories?.[subcategoryName])
    ? categoryConfig.subcategories[subcategoryName]
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

function normalizeFieldValue(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return value;
  return '';
}

function buildSubcategoryFieldValues(categoryName, subcategoryName, provided = [], source = {}) {
  const definitions = getFieldDefinitions(categoryName, subcategoryName);
  const providedMap = new Map();

  if (Array.isArray(provided)) {
    provided.forEach((field) => {
      if (field && typeof field.key === 'string') {
        providedMap.set(field.key, normalizeFieldValue(field.value));
      }
    });
  } else if (provided && typeof provided === 'object') {
    Object.entries(provided).forEach(([key, value]) => {
      providedMap.set(key, normalizeFieldValue(value));
    });
  }

  return definitions.map((def) => ({
    key: def.key,
    label: def.label,
    subcategory: subcategoryName || '',
    value: providedMap.has(def.key) ? providedMap.get(def.key) : normalizeFieldValue(source?.[def.key])
  }));
}

function normalizeForSearch(value) {
  return (value || '')
    .toString()
    .normalize('NFD')
    .replace(/\p{M}+/gu, '')
    .toLowerCase();
}

function uniqueTags(list) {
  const seen = new Set();
  list.forEach((tag) => {
    const clean = (tag || '').toString().trim().toLowerCase();
    if (clean) {
      seen.add(clean);
    }
  });
  return Array.from(seen);
}

const stopwords = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'for',
  'with',
  'without',
  'of',
  'to',
  'in',
  'on',
  'at',
  'by',
  'from',
  'this',
  'that',
  'is',
  'are',
  'was',
  'were',
  'it',
  'its',
  'my',
  'your',
  'our',
  'their',
  'το',
  'η',
  'ο',
  'και',
  'ή',
  'για',
  'με',
  'χωρις',
  'του',
  'της',
  'στο',
  'στα',
  'στη',
  'στην',
  'σε',
  'ενα',
  'ενας',
  'μια',
  'που'
]);

function tokenize(value) {
  if (!value) return [];
  return normalizeForSearch(value)
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function keywordTokens(value) {
  return tokenize(value).filter((token) => token.length > 2 && !stopwords.has(token));
}

function normalizeTag(tag = '') {
  return tag.toString().trim().toLowerCase();
}

function addRequiredTags(list, category, subcategory) {
  const required = [category, subcategory]
    .map((value) => normalizeTag(value))
    .filter(Boolean);

  required.forEach((tag) => {
    if (!list.includes(tag)) {
      list.push(tag);
    }
  });
}

function buildBaseTags(ad) {
  const tags = [];
  const { title = '', description = '', category = '', subcategory = '', location = '', price } = ad || {};

  addRequiredTags(tags, category, subcategory);
  tags.push(normalizeTag(location));
  tags.push(...keywordTokens(title));
  tags.push(...keywordTokens(description));
  tags.push(...keywordTokens(category));
  tags.push(...keywordTokens(subcategory));
  tags.push(...keywordTokens(location));

  if (category && location) {
    tags.push(normalizeTag(`${category} in ${location}`));
    tags.push(normalizeTag(`${category} ${location}`));
  }

  if (subcategory && location) {
    tags.push(normalizeTag(`${subcategory} in ${location}`));
    tags.push(normalizeTag(`${subcategory} ${location}`));
  }

  if (price != null) {
    tags.push('for sale', 'priced listing');
    const rounded = Math.max(0, Math.round(Number(price)));
    tags.push(`budget ${Math.ceil(rounded / 50) * 50}eur`);
  }

  const normalizedVariants = tags
    .map((tag) => normalizeForSearch(tag))
    .filter((value) => value && value.length > 2);

  const combined = uniqueTags([...tags, ...normalizedVariants]);
  addRequiredTags(combined, category, subcategory);
  return combined;
}

async function generateTagsFromAi(ad, currentTags = [], targetTotal = 100) {
  if (!process.env.OPENAI_API_KEY) return [];

  const budget = Math.max(0, targetTotal - currentTags.length);
  if (budget <= 0) return [];

  const description = [
    'Generate concise, search-friendly tags for this classified listing.',
    `Return ONLY valid JSON: { "tags": ["tag1", "tag2", ...] } with up to ${budget} additional tags.`,
    'Prefer 1-3 word noun phrases. Always keep the provided category and subcategory in the list.',
    'Avoid punctuation and emojis.'
  ].join(' ');

  const payload = {
    title: ad?.title || '',
    description: ad?.description || '',
    category: ad?.category || '',
    subcategory: ad?.subcategory || '',
    location: ad?.location || '',
    price: ad?.price ?? null,
    prompt: ad?.prompt || ad?.source_prompt || ''
  };

  const images = sanitizeImages(ad?.images);

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: description },
        {
          role: 'user',
          content: buildUserContent(
            JSON.stringify({
              listing: payload,
              existingTags: currentTags.slice(0, 50)
            }),
            images
          )
        }
      ],
      temperature: 0.2
    });

    let message = completion.choices[0]?.message?.content || '{}';

    if (message.trim().startsWith('```')) {
      message = message.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
    }

    const parsed = JSON.parse(message);
    const aiTags = Array.isArray(parsed.tags)
      ? parsed.tags.map((tag) => normalizeTag(tag)).filter(Boolean)
      : [];

    return aiTags.slice(0, budget);
  } catch (error) {
    console.error('Failed to generate AI tags', error);
    return [];
  }
}

async function buildTags(ad) {
  const MAX_TAGS = 100;
  const baseTags = buildBaseTags(ad).slice(0, MAX_TAGS);
  addRequiredTags(baseTags, ad?.category, ad?.subcategory);

  const aiTags = await generateTagsFromAi(ad, baseTags, MAX_TAGS);
  const combined = uniqueTags([...baseTags, ...aiTags]);
  addRequiredTags(combined, ad?.category, ad?.subcategory);

  return combined.slice(0, MAX_TAGS);
}

async function translateListing(ad, lang) {
  if (!ad || !supportedLanguages.includes(lang)) return ad;
  if (!process.env.OPENAI_API_KEY) return ad;

  const languageLabel = lang === 'el' ? 'Greek' : 'English';

  try {
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Translate the following classified listing fields to the target language. ' +
            'Return ONLY valid JSON with keys: title, description, category, subcategory, location. ' +
            `Use ${languageLabel} for all textual values.`
        },
        {
          role: 'user',
          content: JSON.stringify({
            title: ad.title || '',
            description: ad.description || '',
            category: ad.category || '',
            subcategory: ad.subcategory || '',
            location: ad.location || ''
          })
        }
      ],
      temperature: 0
    });

    let message = completion.choices[0]?.message?.content || '{}';

    if (message.trim().startsWith('```')) {
      message = message.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
    }

    const translated = JSON.parse(message);
    return {
      title: translated.title || ad.title,
      description: translated.description || ad.description,
      category: translated.category || ad.category,
      subcategory: translated.subcategory || ad.subcategory,
      location: translated.location || ad.location
    };
  } catch (error) {
    console.error('Failed to translate listing', error);
    return ad;
  }
}

function formatAdForLanguage(ad, lang) {
  const preferred = supportedLanguages.includes(lang) ? lang : 'en';
  const fallback = preferred === 'en' ? 'el' : 'en';

  const localized = {
    title: ad[`title_${preferred}`] || ad[`title_${fallback}`] || ad.title || '',
    description:
      ad[`description_${preferred}`] || ad[`description_${fallback}`] || ad.description || '',
    category: ad[`category_${preferred}`] || ad[`category_${fallback}`] || ad.category || '',
    subcategory:
      ad[`subcategory_${preferred}`] || ad[`subcategory_${fallback}`] || ad.subcategory || '',
    location: ad[`location_${preferred}`] || ad[`location_${fallback}`] || ad.location || ''
  };

  return {
    ...ad,
    ...localized
  };
}

async function ensureVerifiedUser(userId, lang) {
  if (!Number.isFinite(userId)) {
    return { error: { status: 401, message: tServer(lang, 'authUserRequired') } };
  }

  const user = await db.getUserById(userId);
  if (!user) {
    return { error: { status: 404, message: tServer(lang, 'userNotFound') } };
  }

  if (user.disabled) {
    return { error: { status: 403, message: tServer(lang, 'authAccountDisabled') } };
  }

  if (!user.verified) {
    return { error: { status: 403, message: tServer(lang, 'authVerificationRequired') } };
  }

  if (!isValidPhone(user.phone || '')) {
    return { error: { status: 400, message: tServer(lang, 'authPhoneRequired') } };
  }

  return { user };
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

/* ------------------------------------------------------
   GET RECENT ADS
------------------------------------------------------ */
app.get('/api/ads/recent', async (req, res) => {
  const lang = resolveLanguage(null, req);
  try {
    const ads = await db.getRecentAds(10);
    const localized = ads.map((ad) => formatAdForLanguage(ad, lang));
    res.json({ ads: localized });
  } catch (error) {
    console.error('Error fetching recent ads', error);
    res.status(500).json({ error: tServer(lang, 'recentAdsError') });
  }
});

/* ------------------------------------------------------
   GET CATEGORY TREE
------------------------------------------------------ */
app.get('/api/categories', (req, res) => {
  res.json({ categories, fields: categoryFields });
});

/* ------------------------------------------------------
   GENERATE AD DRAFT USING AI (no persistence)
------------------------------------------------------ */
app.post('/api/ai/create-ad', async (req, res) => {
  const { prompt, images = [], language } = req.body || {};
  const lang = resolveLanguage(language, req);
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: tServer(lang, 'promptRequired') });
  }

  const cleanedImages = sanitizeImages(images);

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: tServer(lang, 'openaiMissing') });
  }

  try {
    const languageLabel = lang === 'el' ? 'Greek' : 'English';
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You convert natural language into structured classified ads. ' +
            'Respond ONLY with valid JSON with keys: title (string), description (string), ' +
            'category (string), subcategory (string), location (string), price (number or null), contact_phone (string), contact_email (string), visits (number), ' +
            'subcategory_fields (array of objects with keys key, label and value). ' +
            'Use the provided images and text to pick the most accurate category/subcategory and fill the predefined fields for that subcategory. ' +
            'If a specific field is unknown, return an empty string for its value. Keep common fields first, then category/subcategory, then subcategory_fields. ' +
            `Use ${languageLabel} for all textual fields based on language code ${lang}.`
        },
        {
          role: 'user',
          content: buildUserContent(combineWithDefaults(prompt, defaultCreatePrompts), cleanedImages)
        }
      ],
      temperature: 0.2
    });

    let message = completion.choices[0]?.message?.content || '{}';

    // Log raw response once for debugging
    console.log('AI create-ad raw message:', message);

    // In case the model ever wraps JSON in ``` ```
    if (message.trim().startsWith('```')) {
      message = message.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
    }

    let adData;
    try {
      adData = JSON.parse(message);
    } catch (jsonError) {
      console.error('JSON parse error on create-ad:', jsonError, message);
      return res.status(500).json({ error: tServer(lang, 'aiInvalidJson') });
    }

    if (!adData.title || !adData.description) {
      return res.status(400).json({ error: tServer(lang, 'aiMissingFields') });
    }

    const contact_phone = typeof adData.contact_phone === 'string' ? adData.contact_phone : '';
    const contact_email = typeof adData.contact_email === 'string' ? adData.contact_email : '';
    const visits = Number.isFinite(Number(adData.visits)) ? Number(adData.visits) : 0;
    const price = Number.isFinite(Number(adData.price)) ? Number(adData.price) : null;

    const draft = {
      title: adData.title,
      description: adData.description,
      category: adData.category || '',
      subcategory: adData.subcategory || '',
      location: adData.location || '',
      price,
      contact_phone,
      contact_email,
      visits,
      images: cleanedImages,
      subcategory_fields: buildSubcategoryFieldValues(adData.category, adData.subcategory, adData.subcategory_fields, adData)
    };

    res.json({ ad: draft });
  } catch (error) {
    console.error('Error creating ad draft with AI', error);
    res.status(500).json({ error: tServer(lang, 'createAdFailure') });
  }
});

/* ------------------------------------------------------
   APPROVE & SAVE AD AFTER USER REVIEW
------------------------------------------------------ */
app.post('/api/ads/approve', async (req, res) => {
  const { ad: providedAd = {}, language } = req.body || {};
  const lang = resolveLanguage(language, req);
  const title = (providedAd.title || '').toString().trim();
  const description = (providedAd.description || '').toString().trim();

  if (!title || !description) {
    return res.status(400).json({ error: tServer(lang, 'aiMissingFields') });
  }

  try {
    const userId = Number(providedAd.user_id);
    const { user, error } = await ensureVerifiedUser(userId, lang);
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const cleanedImages = sanitizeImages(providedAd.images);
    const price = Number.isFinite(Number(providedAd.price)) ? Number(providedAd.price) : null;
    const includeContactEmail =
      providedAd.include_contact_email === true || providedAd.include_contact_email === 'true';
    const contact_phone = user.phone || '';
    const contact_email = includeContactEmail ? user.email : '';
    const visits = Number.isFinite(Number(providedAd.visits)) ? Number(providedAd.visits) : 0;
    const subcategory_fields = buildSubcategoryFieldValues(
      (providedAd.category || '').toString().trim(),
      (providedAd.subcategory || '').toString().trim(),
      providedAd.subcategory_fields,
      providedAd
    );

    const normalized = {
      title,
      description,
      category: (providedAd.category || '').toString().trim(),
      subcategory: (providedAd.subcategory || '').toString().trim(),
      location: (providedAd.location || '').toString().trim(),
      price,
      contact_phone,
      contact_email,
      visits,
      images: cleanedImages,
      subcategory_fields,
      source_prompt: (providedAd.source_prompt || '').toString().trim(),
      remaining_edits: Math.max(0, MAX_AD_EDITS)
    };

    const tags = await buildTags(normalized);
    const otherLang = lang === 'en' ? 'el' : 'en';
    const translated = await translateListing(normalized, otherLang);

    const saved = await db.createAd({
      ...normalized,
      tags,
      source_language: lang,
      approved: false,
      [`title_${lang}`]: normalized.title,
      [`description_${lang}`]: normalized.description,
      [`category_${lang}`]: normalized.category,
      [`subcategory_${lang}`]: normalized.subcategory,
      [`location_${lang}`]: normalized.location,
      [`title_${otherLang}`]: translated.title || normalized.title,
      [`description_${otherLang}`]: translated.description || normalized.description,
      [`category_${otherLang}`]: translated.category || normalized.category,
      [`subcategory_${otherLang}`]: translated.subcategory || normalized.subcategory,
      [`location_${otherLang}`]: translated.location || normalized.location,
      user_id: userId
    });

    const localized = formatAdForLanguage(saved, lang);
    res.json({ ad: localized });
  } catch (error) {
    console.error('Error approving ad', error);
    res.status(500).json({ error: tServer(lang, 'createAdFailure') });
  }
});

app.post('/api/ads/:id/edit', async (req, res) => {
  const { ad: providedAd = {}, language } = req.body || {};
  const lang = resolveLanguage(language, req);
  const adId = Number(req.params.id);
  const title = (providedAd.title || '').toString().trim();
  const description = (providedAd.description || '').toString().trim();

  if (!Number.isFinite(adId)) {
    return res.status(400).json({ error: tServer(lang, 'invalidAdId') });
  }

  if (!title || !description) {
    return res.status(400).json({ error: tServer(lang, 'aiMissingFields') });
  }

  try {
    const userId = Number(providedAd.user_id);
    const { user, error } = await ensureVerifiedUser(userId, lang);
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const existingAd = await db.getAdById(adId, { includeUnapproved: true });
    if (!existingAd || existingAd.user_id !== userId) {
      return res.status(403).json({ error: tServer(lang, 'adEditOwnership') });
    }

    if (!existingAd.approved) {
      return res.status(400).json({ error: tServer(lang, 'adEditApproved') });
    }

    if (existingAd.remaining_edits <= 0) {
      return res.status(429).json({ error: tServer(lang, 'adEditLimit') });
    }

    const cleanedImages = sanitizeImages(providedAd.images);
    const price = Number.isFinite(Number(providedAd.price)) ? Number(providedAd.price) : null;
    const includeContactEmail =
      providedAd.include_contact_email === true || providedAd.include_contact_email === 'true' ||
      providedAd.contact_email;
    const contact_phone = user.phone || '';
    const contact_email = includeContactEmail ? user.email : '';
    const subcategory_fields = buildSubcategoryFieldValues(
      (providedAd.category || existingAd.category || '').toString().trim(),
      (providedAd.subcategory || existingAd.subcategory || '').toString().trim(),
      providedAd.subcategory_fields,
      providedAd
    );

    const normalized = {
      ...existingAd,
      title,
      description,
      category: (providedAd.category || '').toString().trim(),
      subcategory: (providedAd.subcategory || '').toString().trim(),
      location: (providedAd.location || '').toString().trim(),
      price,
      contact_phone,
      contact_email,
      subcategory_fields,
      images: cleanedImages,
      source_prompt: (providedAd.source_prompt || '').toString().trim(),
      approved: false,
      source_language: lang,
      remaining_edits: Math.max(0, existingAd.remaining_edits - 1)
    };

    const tags = await buildTags(normalized);
    const otherLang = lang === 'en' ? 'el' : 'en';
    const translated = await translateListing(normalized, otherLang);

    const updated = await db.updateAd(adId, {
      ...normalized,
      tags,
      [`title_${lang}`]: normalized.title,
      [`description_${lang}`]: normalized.description,
      [`category_${lang}`]: normalized.category,
      [`subcategory_${lang}`]: normalized.subcategory,
      [`location_${lang}`]: normalized.location,
      [`title_${otherLang}`]: translated.title || normalized[`title_${otherLang}`] || normalized.title,
      [`description_${otherLang}`]: translated.description || normalized[`description_${otherLang}`] || normalized.description,
      [`category_${otherLang}`]: translated.category || normalized[`category_${otherLang}`] || normalized.category,
      [`subcategory_${otherLang}`]: translated.subcategory ||
        normalized[`subcategory_${otherLang}`] ||
        normalized.subcategory,
      [`location_${otherLang}`]: translated.location || normalized[`location_${otherLang}`] || normalized.location,
      user_id: userId
    });

    const localized = formatAdForLanguage(updated, lang);
    res.json({ ad: localized });
  } catch (error) {
    console.error('Error editing ad', error);
    res.status(500).json({ error: tServer(lang, 'createAdFailure') });
  }
});

app.post('/api/ads/:id/deactivate', async (req, res) => {
  const lang = resolveLanguage(req.body?.language, req);
  const adId = Number(req.params.id);
  const userId = Number(req.body?.user_id);

  if (!Number.isFinite(adId)) {
    return res.status(400).json({ error: tServer(lang, 'invalidAdId') });
  }

  try {
    const { user, error } = await ensureVerifiedUser(userId, lang);
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const ad = await db.getAdById(adId, { includeUnapproved: true, includeInactive: true });
    if (!ad || ad.user_id !== user.id) {
      return res.status(403).json({ error: tServer(lang, 'adEditOwnership') });
    }

    const updated = await db.updateAd(adId, { active: false, approved: false });
    const localized = formatAdForLanguage(updated, lang);
    res.json({ ad: localized });
  } catch (error) {
    console.error('Error deactivating ad', error);
    res.status(500).json({ error: tServer(lang, 'fetchAdError') });
  }
});

app.post('/api/ads/:id/reactivate', async (req, res) => {
  const lang = resolveLanguage(req.body?.language, req);
  const adId = Number(req.params.id);
  const userId = Number(req.body?.user_id);

  if (!Number.isFinite(adId)) {
    return res.status(400).json({ error: tServer(lang, 'invalidAdId') });
  }

  try {
    const { user, error } = await ensureVerifiedUser(userId, lang);
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const ad = await db.getAdById(adId, { includeUnapproved: true, includeInactive: true });
    if (!ad || ad.user_id !== user.id) {
      return res.status(403).json({ error: tServer(lang, 'adEditOwnership') });
    }

    const updated = await db.updateAd(adId, { active: true, approved: false });
    const localized = formatAdForLanguage(updated, lang);
    res.json({ ad: localized });
  } catch (error) {
    console.error('Error reactivating ad', error);
    res.status(500).json({ error: tServer(lang, 'fetchAdError') });
  }
});

app.delete('/api/ads/:id', async (req, res) => {
  const lang = resolveLanguage(req.body?.language || req.query?.language, req);
  const adId = Number(req.params.id);
  const userId = Number(req.body?.user_id ?? req.query?.user_id);

  if (!Number.isFinite(adId)) {
    return res.status(400).json({ error: tServer(lang, 'invalidAdId') });
  }

  try {
    const { user, error } = await ensureVerifiedUser(userId, lang);
    if (error) {
      return res.status(error.status).json({ error: error.message });
    }

    const ad = await db.getAdById(adId, { includeUnapproved: true, includeInactive: true });
    if (!ad || ad.user_id !== user.id) {
      return res.status(403).json({ error: tServer(lang, 'adEditOwnership') });
    }

    const deleted = await db.deleteAd(adId);
    const localized = deleted ? formatAdForLanguage(deleted, lang) : null;
    res.json({ success: true, ad: localized });
  } catch (error) {
    console.error('Error deleting ad', error);
    res.status(500).json({ error: tServer(lang, 'fetchAdError') });
  }
});

/* ------------------------------------------------------
   SEARCH ADS USING AI
------------------------------------------------------ */
app.post('/api/ai/search-ads', async (req, res) => {
  const { prompt, images = [], language } = req.body || {};
  const lang = resolveLanguage(language, req);
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: tServer(lang, 'promptRequired') });
  }

  const cleanedImages = sanitizeImages(images);

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: tServer(lang, 'openaiMissing') });
  }

  try {
    const languageLabel = lang === 'el' ? 'Greek' : 'English';
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'Convert natural language search queries into JSON filters. ' +
            'Respond ONLY with valid JSON: ' +
            '{ keywords, category, subcategory, location, min_price, max_price }. ' +
            `Return filter values using ${languageLabel} for language code ${lang}.`
        },
        {
          role: 'user',
          content: buildUserContent(combineWithDefaults(prompt, defaultSearchPrompts), cleanedImages)
        }
      ],
      temperature: 0
    });

    let message = completion.choices[0]?.message?.content || '{}';
    console.log('AI search-ads raw message:', message);

    if (message.trim().startsWith('```')) {
      message = message.replace(/^```[a-zA-Z]*\n?/, '').replace(/```$/, '');
    }

    let filters;
    try {
      filters = JSON.parse(message);
    } catch (jsonError) {
      console.error('JSON parse error on search-ads:', jsonError, message);
      return res.status(500).json({ error: tServer(lang, 'aiInvalidJson') });
    }

    const ads = await db.searchAds({
      keywords: filters.keywords || '',
      category: filters.category || '',
      location: filters.location || '',
      min_price: Number.isFinite(filters.min_price) ? filters.min_price : null,
      max_price: Number.isFinite(filters.max_price) ? filters.max_price : null
    });

    const localized = ads.map((ad) => formatAdForLanguage(ad, lang));

    res.json({ ads: localized, filters });
  } catch (error) {
    console.error('Error searching ads with AI', error);
    res.status(500).json({ error: tServer(lang, 'searchAdsError') });
  }
});

/* ------------------------------------------------------
   GET AD BY ID
------------------------------------------------------ */
app.get('/api/ads/:id', async (req, res) => {
  const lang = resolveLanguage(null, req);
  const adId = Number(req.params.id);
  if (!Number.isFinite(adId)) {
    return res.status(400).json({ error: tServer(lang, 'invalidAdId') });
  }

  try {
    const visitorId = getVisitorId(req, res);
    const seenForVisitor = visitorAdViews.get(visitorId) || new Set();

    const shouldIncrement = !seenForVisitor.has(adId);
    const ad = shouldIncrement ? await db.incrementAdVisits(adId) : await db.getAdById(adId);
    if (!ad) {
      return res.status(404).json({ error: tServer(lang, 'adNotFound') });
    }

    if (shouldIncrement) {
      seenForVisitor.add(adId);
      visitorAdViews.set(visitorId, seenForVisitor);
    }

    const localized = formatAdForLanguage(ad, lang);

    res.json({ ad: localized });
  } catch (error) {
    console.error('Error fetching ad', error);
    res.status(500).json({ error: tServer(lang, 'fetchAdError') });
  }
});

/* ------------------------------------------------------
   REPORT AD
------------------------------------------------------ */
app.post('/api/ads/:id/report', async (req, res) => {
  const lang = resolveLanguage(req.body?.language, req);
  const adId = Number(req.params.id);
  if (!Number.isFinite(adId)) {
    return res.status(400).json({ error: tServer(lang, 'invalidAdId') });
  }

  const maxCharacters = 300;
  const rawReason = (req.body?.reason || '').toString().trim();
  if (rawReason.length > maxCharacters) {
    return res.status(400).json({ error: tServer(lang, 'reportReasonTooLong') });
  }

  const reason = rawReason.replace(/\s+/g, ' ');

  try {
    const ad = await db.getAdById(adId);
    if (!ad) {
      return res.status(404).json({ error: tServer(lang, 'adNotFound') });
    }

    await db.saveReport({ adId, reason });
    res.json({ success: true });
  } catch (error) {
    console.error('Error reporting ad', error);
    res.status(500).json({ error: tServer(lang, 'fetchAdError') });
  }
});

/* ------------------------------------------------------
   ADMIN ROUTES
------------------------------------------------------ */
app.get('/api/admin/ads', adminAuth, async (req, res) => {
  const status = (req.query.status || 'pending').toString().toLowerCase();
  const allowed = ['pending', 'approved', 'all'];
  const effectiveStatus = allowed.includes(status) ? status : 'pending';

  try {
    const ads = await db.listAdsByStatus(effectiveStatus);
    res.json({ ads });
  } catch (error) {
    console.error('Admin list ads error', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

app.post('/api/admin/ads/:id/approve', adminAuth, async (req, res) => {
  const adId = Number(req.params.id);
  if (!Number.isFinite(adId)) {
    return res.status(400).json({ error: 'Invalid ad id' });
  }

  try {
    const ad = await db.setAdApproval(adId, true);
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    res.json({ ad });
  } catch (error) {
    console.error('Admin approve ad error', error);
    res.status(500).json({ error: 'Failed to approve ad' });
  }
});

app.post('/api/admin/ads/:id/reject', adminAuth, async (req, res) => {
  const adId = Number(req.params.id);
  if (!Number.isFinite(adId)) {
    return res.status(400).json({ error: 'Invalid ad id' });
  }

  try {
    const ad = await db.setAdApproval(adId, false);
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    res.json({ ad });
  } catch (error) {
    console.error('Admin reject ad error', error);
    res.status(500).json({ error: 'Failed to update ad status' });
  }
});

app.patch('/api/admin/ads/:id', adminAuth, async (req, res) => {
  const adId = Number(req.params.id);
  if (!Number.isFinite(adId)) {
    return res.status(400).json({ error: 'Invalid ad id' });
  }

  try {
    const ad = await db.updateAd(adId, req.body || {});
    if (!ad) return res.status(404).json({ error: 'Ad not found' });
    res.json({ ad });
  } catch (error) {
    console.error('Admin update ad error', error);
    res.status(500).json({ error: 'Failed to update ad' });
  }
});

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await db.listUsers();
    res.json({ users });
  } catch (error) {
    console.error('Admin list users error', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.patch('/api/admin/users/:id', adminAuth, async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  try {
    const user = await db.updateUser(userId, req.body || {});
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('Admin update user error', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

app.post('/api/admin/users/:id/activate', adminAuth, async (req, res) => {
  const userId = Number(req.params.id);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: 'Invalid user id' });
  }

  try {
    const user = await db.updateUser(userId, { verified: true, disabled: false });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('Admin activate user error', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
});

app.get('/api/admin/reports', adminAuth, async (req, res) => {
  try {
    const reports = await db.listReports();
    const adIds = [...new Set(reports.map((r) => r.ad_id))];
    const ads = await Promise.all(adIds.map((id) => db.getAdById(id)));
    const adMap = new Map(ads.filter(Boolean).map((ad) => [ad.id, ad]));

    const enriched = reports.map((report) => ({
      ...report,
      ad: adMap.get(report.ad_id) || null
    }));

    res.json({ reports: enriched });
  } catch (error) {
    console.error('Admin list reports error', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

app.get('/api/users/:id/ads', async (req, res) => {
  const lang = resolveLanguage(req.query?.language, req);
  const userId = Number(req.params.id);
  if (!Number.isFinite(userId)) {
    return res.status(400).json({ error: tServer(lang, 'userNotFound') });
  }

  try {
    const user = await db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: tServer(lang, 'userNotFound') });
    }

    const ads = await db.listAdsByUser(userId);
    const localized = ads.map((ad) => formatAdForLanguage(ad, lang));
    res.json({ ads: localized });
  } catch (error) {
    console.error('User ads fetch error', error);
    res.status(500).json({ error: tServer(lang, 'recentAdsError') });
  }
});

/* ------------------------------------------------------
   AUTH STUBS
------------------------------------------------------ */
app.post('/api/auth/register', async (req, res) => {
  const lang = resolveLanguage(req.body?.language, req);
  const { email, password, phone } = req.body || {};
  if (!email || !password || !phone) {
    return res.status(400).json({ error: tServer(lang, 'authRegisterMissingFields') });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: tServer(lang, 'authInvalidEmail') });
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json({ error: tServer(lang, 'authInvalidPhone') });
  }

  if (typeof password !== 'string' || password.length < 6) {
    return res.status(400).json({ error: tServer(lang, 'authPasswordLength') });
  }

  try {
    const normalizedPhone = phone.trim();
    const { user, verificationToken } = await db.registerUser({ email, password, phone: normalizedPhone });
    await sendVerificationEmail({ to: user.email, token: verificationToken, lang, req });
    res.json({ success: true, message: tServer(lang, 'authVerificationSent'), user });
  } catch (error) {
    console.error('Register error', error);
    const errorKey = error.message?.includes('Email already registered')
      ? 'authEmailExists'
      : 'authRegistrationFailed';
    res.status(400).json({ error: tServer(lang, errorKey) });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const lang = resolveLanguage(req.body?.language, req);
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: tServer(lang, 'authMissingFields') });
  }

  try {
    const user = await db.loginUser({ email, password });
    res.json({ success: true, message: tServer(lang, 'authLoginSuccess'), user });
  } catch (error) {
    console.error('Login error', error);
    const errorKey = error.message?.includes('Invalid email or password')
      ? 'authInvalidCredentials'
      : error.message?.includes('Account disabled')
        ? 'authAccountDisabled'
        : error.message?.includes('Email not verified')
          ? 'authVerificationRequired'
          : 'authLoginFailed';
    res.status(400).json({ error: tServer(lang, errorKey) });
  }
});

app.get('/api/auth/verify', async (req, res) => {
  const lang = resolveLanguage(req.query?.language, req);
  const token = (req.query.token || req.query.verify || '').toString().trim();
  if (!token) {
    return res.status(400).json({ error: tServer(lang, 'authVerificationInvalid') });
  }

  try {
    const user = await db.verifyUserByToken(token);
    if (!user) {
      return res.status(400).json({ error: tServer(lang, 'authVerificationInvalid') });
    }

    res.json({ success: true, message: tServer(lang, 'authVerificationSuccess'), user });
  } catch (error) {
    console.error('Verify user error', error);
    res.status(500).json({ error: tServer(lang, 'authRegistrationFailed') });
  }
});

/* ------------------------------------------------------
   START SERVER
------------------------------------------------------ */
app.listen(port, () => {
  console.log(`SpeedList server running at http://localhost:${port}`);
});
