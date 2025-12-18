// Structured field definitions for each category/subcategory combination. The
// AI uses these labels to populate extra metadata, and the client renders them
// as dynamic form fields when drafting or editing listings.
const realEstateBase = [
  { key: 'area_sqm', label: 'Εμβαδόν (τ.μ.)' },
  { key: 'bedrooms', label: 'Υπνοδωμάτια' },
  { key: 'bathrooms', label: 'Μπάνια' },
  { key: 'floor', label: 'Όροφος' },
  { key: 'year_built', label: 'Έτος κατασκευής' },
  { key: 'condition', label: 'Κατάσταση/ανακαίνιση' },
  { key: 'heating', label: 'Θέρμανση' },
  { key: 'parking', label: 'Θέση στάθμευσης' }
];

const vehicleCommonFields = [
  { key: 'make', label: 'Μάρκα' },
  { key: 'model', label: 'Μοντέλο' },
  { key: 'year', label: 'Έτος' },
  { key: 'mileage', label: 'Χιλιόμετρα' },
  { key: 'fuel_type', label: 'Καύσιμο' },
  { key: 'transmission', label: 'Κιβώτιο' },
  { key: 'drivetrain', label: 'Κίνηση' },
  { key: 'engine_displacement', label: 'Κυβισμός' },
  { key: 'horsepower', label: 'Ιπποδύναμη' },
  { key: 'emissions_class', label: 'Προδιαγραφή ρύπων' },
  { key: 'owners', label: 'Αριθμός ιδιοκτητών' },
  { key: 'service_history', label: 'Ιστορικό service' }
];

const serviceBase = [
  { key: 'service_area', label: 'Περιοχή κάλυψης' },
  { key: 'years_experience', label: 'Χρόνια εμπειρίας' },
  { key: 'availability', label: 'Διαθεσιμότητα' },
  { key: 'rate', label: 'Τιμολόγηση' },
  { key: 'certifications', label: 'Πιστοποιήσεις/άδειες' }
];

const productBase = [
  { key: 'brand', label: 'Μάρκα' },
  { key: 'model', label: 'Μοντέλο/σειρά' },
  { key: 'condition', label: 'Κατάσταση' },
  { key: 'year', label: 'Έτος αγοράς' },
  { key: 'warranty', label: 'Εγγύηση' }
];

const educationFields = [
  ...serviceBase,
  { key: 'subjects', label: 'Μαθήματα/ειδικότητα' },
  { key: 'levels', label: 'Επίπεδο (δημοτικό, λύκειο, ενήλικες)' },
  { key: 'teaching_mode', label: 'Δια ζώσης/online' }
];

const cleaningFields = [
  ...serviceBase,
  { key: 'tasks', label: 'Εργασίες (καθαρισμός, απολύμανση κ.λπ.)' },
  { key: 'supplies_included', label: 'Παροχή υλικών/μηχανημάτων' },
  { key: 'insurance', label: 'Ασφάλιση/υπευθυνότητα' }
];

const constructionFields = [
  ...serviceBase,
  { key: 'trade', label: 'Ειδικότητα/εργασία' },
  { key: 'project_types', label: 'Είδος έργων (ανακαινίσεις, νεόδμητα κ.λπ.)' },
  { key: 'materials', label: 'Υλικά ή συστήματα που χρησιμοποιούνται' }
];

const officeSupportFields = [
  ...serviceBase,
  { key: 'software', label: 'Λογισμικά/εργαλεία που χρησιμοποιούνται' },
  { key: 'industry_experience', label: 'Εμπειρία σε κλάδους' },
  { key: 'languages', label: 'Γλώσσες εργασίας' }
];

const creativeFields = [
  ...serviceBase,
  { key: 'portfolio', label: 'Σύνδεσμος/διαθέσιμο portfolio' },
  { key: 'style', label: 'Ύφος ή ειδίκευση' },
  { key: 'delivery_format', label: 'Τελικές παραδόσεις/μορφές αρχείων' }
];

const techFields = [
  ...serviceBase,
  { key: 'stack', label: 'Τεχνολογίες/εργαλεία' },
  { key: 'specialty', label: 'Ειδικότητα (web, mobile, DevOps κ.λπ.)' },
  { key: 'certifications_detail', label: 'Πιστοποιήσεις/σεμινάρια' }
];

const foodFields = [
  ...serviceBase,
  { key: 'cuisine', label: 'Είδος κουζίνας/μενού' },
  { key: 'service_style', label: 'Εστιατόριο, catering, delivery' },
  { key: 'licenses', label: 'Υγειονομικές άδειες' }
];

const transportFields = [
  ...serviceBase,
  { key: 'vehicle_type', label: 'Τύπος οχήματος/άδεια' },
  { key: 'coverage', label: 'Περιοχές μεταφοράς' },
  { key: 'cargo_limits', label: 'Όρια φορτίου/χειρισμού' }
];

const beautyFields = [
  ...serviceBase,
  { key: 'services', label: 'Προσφερόμενες υπηρεσίες' },
  { key: 'products', label: 'Προϊόντα/brands που χρησιμοποιούνται' },
  { key: 'hygiene_protocols', label: 'Πρωτόκολλα υγιεινής' }
];

const sportsFields = [
  ...serviceBase,
  { key: 'certifications_detail', label: 'Πιστοποιήσεις προπονητή/διαιτητή' },
  { key: 'session_type', label: 'Ατομικές/ομαδικές συνεδρίες' },
  { key: 'special_populations', label: 'Εξειδικεύσεις (παιδιά, seniors κ.λπ.)' }
];

const businessFields = [
  ...serviceBase,
  { key: 'sector_focus', label: 'Κλάδος εξειδίκευσης' },
  { key: 'deliverables', label: 'Παραδοτέα (π.χ. reports, στρατηγικές)' },
  { key: 'tooling', label: 'Εργαλεία/πλατφόρμες' }
];

const categoryFields = {
  'Ακίνητα': {
    fields: realEstateBase,
    subcategories: {
      'Ενοικιάσεις κατοικιών (σπίτια, διαμερίσματα)': [
        { key: 'lease_type', label: 'Τύπος μίσθωσης (μακροχρόνια/βραχυχρόνια)' },
        { key: 'deposit', label: 'Εγγύηση/προκαταβολή' },
        { key: 'furnished', label: 'Επιπλωμένο' },
        { key: 'pets', label: 'Κατοικίδια' },
        { key: 'utilities', label: 'Κοινόχρηστα/λογαριασμοί' }
      ],
      'Πωλήσεις κατοικιών': [
        { key: 'plot_size', label: 'Οικόπεδο (τ.μ.)' },
        { key: 'renovation_year', label: 'Έτος ανακαίνισης' },
        { key: 'ownership_status', label: 'Ιδιοκτησιακό καθεστώς' },
        { key: 'energy_class', label: 'Ενεργειακή κλάση' },
        { key: 'view', label: 'Θέα/προσανατολισμός' }
      ],
      'Ενοικιάσεις επαγγελματικών χώρων': [
        { key: 'commercial_use', label: 'Επιτρεπόμενη χρήση' },
        { key: 'frontage', label: 'Πρόσοψη/βιτρίνα (μ.)' },
        { key: 'ceiling_height', label: 'Ύψος χώρου' },
        { key: 'three_phase', label: 'Τριφασικό ρεύμα' },
        { key: 'common_charges', label: 'Κοινόχρηστα/πάγια' }
      ],
      'Πωλήσεις επαγγελματικών χώρων': [
        { key: 'commercial_use', label: 'Επιτρεπόμενη χρήση' },
        { key: 'frontage', label: 'Πρόσοψη/βιτρίνα (μ.)' },
        { key: 'lease_status', label: 'Μισθωμένο/κενό' },
        { key: 'energy_class', label: 'Ενεργειακή κλάση' },
        { key: 'building_condition', label: 'Κατάσταση κτιρίου' }
      ],
      'Ενοικιάσεις γης': [
        { key: 'land_area', label: 'Έκταση (στρέμματα)' },
        { key: 'zoning', label: 'Χρήση γης/ζώνη' },
        { key: 'build_factor', label: 'Συντελεστής δόμησης' },
        { key: 'access', label: 'Πρόσβαση/πρόσοψη' },
        { key: 'water_irrigation', label: 'Άρδευση/ύδρευση' }
      ],
      'Πωλήσεις γης': [
        { key: 'land_area', label: 'Έκταση (στρέμματα)' },
        { key: 'zoning', label: 'Χρήση γης/ζώνη' },
        { key: 'build_factor', label: 'Συντελεστής δόμησης' },
        { key: 'slope', label: 'Κλίση/ανάγλυφο' },
        { key: 'legal_clearance', label: 'Τοπογραφικό/τίτλοι' }
      ],
      'Ενοικιάσεις parking': [
        { key: 'spot_type', label: 'Τύπος θέσης (ανοιχτή/κλειστή/garage)' },
        { key: 'access_control', label: 'Ελεγχόμενη πρόσβαση' },
        { key: 'charging', label: 'Σημείο φόρτισης' },
        { key: 'clearance', label: 'Ύψος οχήματος' },
        { key: 'security', label: 'Ασφάλεια/κάμερες' }
      ],
      'Πωλήσεις parking': [
        { key: 'spot_type', label: 'Τύπος θέσης (ανοιχτή/κλειστή/garage)' },
        { key: 'access_control', label: 'Ελεγχόμενη πρόσβαση' },
        { key: 'charges', label: 'Κοινόχρηστα/πάγια' },
        { key: 'ownership_status', label: 'Ιδιοκτησιακό (χρήση/πώληση)' },
        { key: 'security', label: 'Ασφάλεια/κάμερες' }
      ]
    }
  },
  'Οχήματα': {
    fields: [],
    subcategories: {
      'Αυτοκίνητο': [
        ...vehicleCommonFields,
        { key: 'body_style', label: 'Αμάξωμα' },
        { key: 'doors', label: 'Πόρτες' },
        { key: 'seats', label: 'Θέσεις' },
        { key: 'consumption', label: 'Κατανάλωση' },
        { key: 'safety_features', label: 'Συστήματα ασφαλείας' }
      ],
      'Ταξί': [
        ...vehicleCommonFields,
        { key: 'taxi_license', label: 'Άδεια ταξί' },
        { key: 'taximeter', label: 'Ταξίμετρο/έγκριση' },
        { key: 'shift_ready', label: 'Έτοιμο για βάρδια' },
        { key: 'wheelchair', label: 'Πρόσβαση ΑμεΑ' },
        { key: 'fleet_operator', label: 'Ένταξη σε εταιρεία' }
      ],
      'Μοτοσυκλέτα': [
        ...vehicleCommonFields,
        { key: 'bike_type', label: 'Τύπος μοτοσυκλέτας' },
        { key: 'cc', label: 'Κυβισμός (cc)' },
        { key: 'service_interval', label: 'Service/χιλιόμετρα' },
        { key: 'luggage', label: 'Βαλίτσες/σχάρες' },
        { key: 'abs', label: 'ABS/ηλεκτρονικά' }
      ],
      'Φορτηγό έως 7,5 t': [
        ...vehicleCommonFields,
        { key: 'payload', label: 'Ωφέλιμο φορτίο' },
        { key: 'box_length', label: 'Μήκος καρότσας/κουτιού' },
        { key: 'axles', label: 'Άξονες' },
        { key: 'tail_lift', label: 'Υδραυλική πόρτα' },
        { key: 'tachograph_hours', label: 'Ώρες ταχογράφου' }
      ],
      'Φορτηγό άνω των 7,5 t': [
        ...vehicleCommonFields,
        { key: 'payload', label: 'Ωφέλιμο φορτίο' },
        { key: 'axles', label: 'Άξονες' },
        { key: 'euro_class', label: 'Προδιαγραφή Euro' },
        { key: 'sleeper_cab', label: 'Καμπίνα ύπνου' },
        { key: 'retarder', label: 'Retarder/βοηθητικό φρένο' }
      ],
      'Λεωφορείο': [
        ...vehicleCommonFields,
        { key: 'seating', label: 'Καθίσματα' },
        { key: 'standing', label: 'Όρθιοι επιβάτες' },
        { key: 'wc', label: 'WC/άνεση' },
        { key: 'accessibility', label: 'Ράμπα/προσβασιμότητα' },
        { key: 'tourist_equipment', label: 'Τουριστικός εξοπλισμός' }
      ],
      'Φορτωτής / Κλαρκ': [
        ...vehicleCommonFields,
        { key: 'lift_capacity', label: 'Ανυψωτική ικανότητα' },
        { key: 'mast_height', label: 'Ύψος ιστού' },
        { key: 'hours', label: 'Ώρες λειτουργίας' },
        { key: 'fuel_type_specific', label: 'Κίνηση (ηλεκτρικό, diesel κ.λπ.)' },
        { key: 'fork_length', label: 'Μήκος περόνης' }
      ],
      'Όχημα κατασκευών': [
        ...vehicleCommonFields,
        { key: 'attachments', label: 'Εξαρτήματα (κάδος, σφυρί κ.λπ.)' },
        { key: 'operating_hours', label: 'Ώρες χρήσης' },
        { key: 'boom_length', label: 'Μήκος/εμβέλεια' },
        { key: 'stabilizers', label: 'Σταθεροποιητές/ερπύστριες' },
        { key: 'service_records', label: 'Ιστορικό service' }
      ],
      'Γεωργικό όχημα': [
        ...vehicleCommonFields,
        { key: 'pto_power', label: 'Ισχύς PTO' },
        { key: 'hydraulics', label: 'Υδραυλικά/παροχές' },
        { key: 'attachments', label: 'Παρελκόμενα' },
        { key: 'hours', label: 'Ώρες λειτουργίας' },
        { key: 'traction', label: 'Κίνηση (2WD/4WD)' }
      ],
      'Τράκτορας': [
        ...vehicleCommonFields,
        { key: 'fifth_wheel_height', label: 'Ύψος πλάκας' },
        { key: 'coupling', label: 'Σύνδεσμος/τύπος' },
        { key: 'cab_type', label: 'Καμπίνα (κοντή/υπνοκαμπίνα)' },
        { key: 'hydraulic_lines', label: 'Υδραυλικά ρυμούλκησης' },
        { key: 'hours', label: 'Ώρες ή χλμ.' }
      ],
      'Τρέιλερ': [
        ...vehicleCommonFields,
        { key: 'trailer_type', label: 'Τύπος τρέιλερ' },
        { key: 'dimensions', label: 'Διαστάσεις/μήκος' },
        { key: 'gross_weight', label: 'Μέγιστο μεικτό βάρος' },
        { key: 'axles', label: 'Άξονες' },
        { key: 'brake_type', label: 'Φρένα/ABS' }
      ],
      'Επικαθήμενο (ρυμουλκούμενο)': [
        ...vehicleCommonFields,
        { key: 'dimensions', label: 'Διαστάσεις/μήκος' },
        { key: 'gross_weight', label: 'Μέγιστο μεικτό βάρος' },
        { key: 'axles', label: 'Άξονες' },
        { key: 'suspension', label: 'Ανάρτηση (αερό/φύλλα)' },
        { key: 'landing_gear', label: 'Υποστυλώματα/σασί' }
      ],
      'Ανταλλακτικά': [
        ...vehicleCommonFields,
        { key: 'part_type', label: 'Τύπος ανταλλακτικού' },
        { key: 'oem_code', label: 'Κωδικός/OEM' },
        { key: 'compatibility', label: 'Συμβατότητα μοντέλων' },
        { key: 'condition_grade', label: 'Κατάσταση (νέο/μεταχ.)' },
        { key: 'packaging', label: 'Συσκευασία/εγγύηση' }
      ],
      'Ανταλλακτικά μοτοσυκλέτας': [
        ...vehicleCommonFields,
        { key: 'part_type', label: 'Τύπος ανταλλακτικού' },
        { key: 'bike_fitment', label: 'Συμβατές μοτοσυκλέτες' },
        { key: 'condition_grade', label: 'Κατάσταση (νέο/μεταχ.)' },
        { key: 'oem_code', label: 'Κωδικός/OEM' },
        { key: 'installation_notes', label: 'Οδηγίες/συμπερίληψη' }
      ],
      'Επαγγελματικά ανταλλακτικά': [
        ...vehicleCommonFields,
        { key: 'equipment_type', label: 'Τύπος μηχανήματος' },
        { key: 'compatibility', label: 'Συμβατότητα' },
        { key: 'condition_grade', label: 'Κατάσταση (νέο/μεταχ.)' },
        { key: 'serial_match', label: 'Σειριακοί/κωδικοί' },
        { key: 'warranty', label: 'Εγγύηση' }
      ],
      'Τροχόσπιτο': [
        ...vehicleCommonFields,
        { key: 'berths', label: 'Κλίνες' },
        { key: 'length', label: 'Μήκος/διαστάσεις' },
        { key: 'water_tanks', label: 'Δεξαμενές νερού' },
        { key: 'heating_cooling', label: 'Θέρμανση/κλιματισμός' },
        { key: 'service_history', label: 'Συντήρηση/στεγανότητα' }
      ],
      'Αεροπλάνο': [
        ...vehicleCommonFields,
        { key: 'airframe_hours', label: 'Ώρες ατράκτου' },
        { key: 'engine_hours', label: 'Ώρες κινητήρα' },
        { key: 'avionics', label: 'Avionics/εξοπλισμός' },
        { key: 'seating', label: 'Θέσεις' },
        { key: 'registration', label: 'Χώρα νηολογίου/χαρτιά' }
      ],
      'Άλλα οχήματα': [
        ...vehicleCommonFields,
        { key: 'usage', label: 'Χρήση οχήματος' },
        { key: 'special_permits', label: 'Ειδικές άδειες' },
        { key: 'engine_hours', label: 'Ώρες κινητήρα/λειτουργίας' },
        { key: 'engine_count', label: 'Αριθμός κινητήρων (αν υπάρχει)' },
        { key: 'attachments', label: 'Εξοπλισμός/παρελκόμενα' }
      ]
    }
  },
  'Επαγγελματίες – Υπηρεσίες': {
    fields: serviceBase,
    subcategories: {
      'Καθηγητές ξένων γλωσσών': educationFields,
      'Φιλόλογοι': educationFields,
      'Μαθηματικοί': educationFields,
      'Δάσκαλοι': educationFields,
      'Καθηγητές πληροφορικής': educationFields,
      'Γηροκόμοι': [
        ...cleaningFields,
        { key: 'care_training', label: 'Εκπαίδευση φροντίδας ηλικιωμένων' },
        { key: 'medical_skills', label: 'Ικανότητες πρώτων βοηθειών' },
        { key: 'live_in', label: 'Διαμονή στον χώρο' }
      ],
      'Οικιακοί βοηθοί': cleaningFields,
      'Καθαριστές/απολυμαντές': cleaningFields,
      'Κηπουροί': [
        ...cleaningFields,
        { key: 'garden_size', label: 'Μέγεθος/τύπος κήπου' },
        { key: 'equipment', label: 'Εξοπλισμός που παρέχεται' },
        { key: 'plant_specialty', label: 'Εξειδίκευση φυτών/δέντρων' }
      ],
      'Babysitters': [
        ...cleaningFields,
        { key: 'age_groups', label: 'Ηλικίες παιδιών' },
        { key: 'certifications_detail', label: 'Πρώτες βοήθειες/CPR' },
        { key: 'activities', label: 'Δραστηριότητες/εκπαίδευση' }
      ],
      'Ελαιοχρωματιστές': constructionFields,
      'Μαρμαράδες': constructionFields,
      'ατωματζήδες': constructionFields,
      'λεκτρολόγοι': [
        ...constructionFields,
        { key: 'licenses', label: 'Αδειοδότηση ηλεκτρολόγου' },
        { key: 'installations', label: 'Ειδικότητα (φωτισμός, βιομηχανικά κ.λπ.)' }
      ],
      'Κατασκευές/ανακαινίσεις': constructionFields,
      'Μηχανικοί & μελετητές': [
        ...constructionFields,
        { key: 'study_types', label: 'Μελέτες/αδειοδοτήσεις' },
        { key: 'software', label: 'Λογισμικά CAD/BIM' }
      ],
      'Λογιστές/φοροτεχνικοί': [
        ...officeSupportFields,
        { key: 'license_number', label: 'Αριθμός άδειας' },
        { key: 'erp', label: 'ERP/λογιστικά συστήματα' }
      ],
      'Μεταφορείς/δακτυλογράφοι': officeSupportFields,
      'Γραμματείς': officeSupportFields,
      'Άλλες ειδικότητες υποστήριξης': officeSupportFields,
      'Μουσική & χορός': creativeFields,
      'ΜΜΕ/εκδόσεις': creativeFields,
      'Εικόνα & ήχος': creativeFields,
      'Φωτογράφοι': [
        ...creativeFields,
        { key: 'equipment', label: 'Εξοπλισμός/φακοί' },
        { key: 'shoot_types', label: 'Είδη φωτογράφισης' }
      ],
      'Διακοσμητές': [
        ...creativeFields,
        { key: 'design_styles', label: 'Στυλ διακόσμησης' },
        { key: 'project_scope', label: 'Τύπος χώρων' }
      ],
      'Προγραμματιστές': techFields,
      'Μηχανικοί': techFields,
      'Άλλες τεχνολογικές ειδικότητες': techFields,
      'Τεχνικοί Η/Υ': [
        ...techFields,
        { key: 'hardware_services', label: 'Επισκευές/αναβαθμίσεις' },
        { key: 'on_site', label: 'Επί τόπου ή απομακρυσμένα' }
      ],
      'Τεχνολογία Η/Υ – Αναλυτές συστημάτων': techFields,
      'Μάγειρες/σεφ': foodFields,
      'sous chef': foodFields,
      'Μπουφετζήδες': foodFields,
      'Διανομείς φαγητού': [
        ...foodFields,
        { key: 'vehicle', label: 'Μέσο διανομής' },
        { key: 'zones', label: 'Ζώνες παράδοσης' }
      ],
      'Ψήστες & τυλιχτές': foodFields,
      'Οδηγοί οχημάτων': transportFields,
      'Μεταφορείς/μετακομίσεις': [
        ...transportFields,
        { key: 'equipment', label: 'Εξοπλισμός μετακόμισης' },
        { key: 'crew_size', label: 'Μέλη συνεργείου' }
      ],
      'Συγκοινωνίες & Μεταφορές – Αεροσυνοδοί – φροντιστές': transportFields,
      'Συγκοινωνίες & Μεταφορές – Άλλες ειδικότητες συγκοινωνιών': transportFields,
      'Συγκοινωνίες & Μεταφορές – Courier': [
        ...transportFields,
        { key: 'delivery_speed', label: 'Χρόνοι παράδοσης' },
        { key: 'tracking', label: 'Παροχή tracking' }
      ],
      'Ομορφιά & Περιποίηση – Αισθητικοί': beautyFields,
      'Ομορφιά & Περιποίηση – Μανικιουρίστ': beautyFields,
      'Ομορφιά & Περιποίηση – Κομμωτές/κουρείς': beautyFields,
      'Ομορφιά & Περιποίηση – Μακιγιέρ': beautyFields,
      'Ομορφιά & Περιποίηση – Άλλες ειδικότητες ομορφιάς': beautyFields,
      'Διάφορες Υπηρεσίες – Ειδικότητες – Φύλαξη – ασφάλεια': [
        ...serviceBase,
        { key: 'license_number', label: 'Άδεια φύλακα' },
        { key: 'equipment', label: 'Εξοπλισμός ασφαλείας' },
        { key: 'shift_types', label: 'Βάρδιες/νυχτερινά' }
      ],
      'Διάφορες Υπηρεσίες – Ειδικότητες – Βιβλιοθηκονόμοι': serviceBase,
      'Διάφορες Υπηρεσίες – Ειδικότητες – Αρχειονόμοι': serviceBase,
      'Διάφορες Υπηρεσίες – Ειδικότητες – Διεκπεραιώσεις ΚΤΕΟ': [
        ...serviceBase,
        { key: 'vehicle_types', label: 'Τύποι οχημάτων' },
        { key: 'processing_time', label: 'Χρόνος διεκπεραίωσης' }
      ],
      'Διάφορες Υπηρεσίες – Ειδικότητες – Άλλες υπηρεσίες/ειδικότητες': serviceBase,
      'Αθλητισμός – Εξωτερικές δραστηριότητες – Γυμναστές': sportsFields,
      'Αθλητισμός – Εξωτερικές δραστηριότητες – Άλλες αθλητικές ειδικότητες': sportsFields,
      'Αθλητισμός – Εξωτερικές δραστηριότητες – Διαιτητές': sportsFields,
      'Αθλητισμός – Εξωτερικές δραστηριότητες – Ναυαγοσώστες': [
        ...sportsFields,
        { key: 'certifications_detail', label: 'Πιστοποίηση ναυαγοσώστη' },
        { key: 'water_type', label: 'Πισίνα/θάλασσα' }
      ],
      'Αθλητισμός – Εξωτερικές δραστηριότητες – Οδηγοί βουνού': [
        ...sportsFields,
        { key: 'terrain', label: 'Διαδρομές/υψόμετρο' },
        { key: 'group_sizes', label: 'Μέγεθος ομάδας' }
      ],
      'Διοίκηση – Στελέχη Επιχειρήσεων & Επιστήμη – Στελέχη marketing/διαφήμισης': businessFields,
      'Διοίκηση – Στελέχη Επιχειρήσεων & Επιστήμη – Οικονομολόγοι': businessFields,
      'Διοίκηση – Στελέχη Επιχειρήσεων & Επιστήμη – Ασφαλιστικοί σύμβουλοι': [
        ...businessFields,
        { key: 'license_number', label: 'Άδεια ασφαλιστικού συμβούλου' },
        { key: 'products', label: 'Εξειδίκευση προϊόντων' }
      ],
      'Διοίκηση – Στελέχη Επιχειρήσεων & Επιστήμη – Business developers': businessFields,
      'Διοίκηση – Στελέχη Επιχειρήσεων & Επιστήμη – Άλλα στελέχη επιχειρήσεων & επιστήμης': businessFields
    }
  },
  'Άλλες κατηγορίες': {
    fields: productBase,
    subcategories: {
      'Πωλήσεις επιχειρήσεων': [
        { key: 'industry', label: 'Κλάδος' },
        { key: 'employees', label: 'Προσωπικό' },
        { key: 'annual_revenue', label: 'Ετήσιος τζίρος' },
        { key: 'assets', label: 'Πάγια/εξοπλισμός' },
        { key: 'reason_for_sale', label: 'Λόγος πώλησης' }
      ],
      'Εξοπλισμός επιχειρήσεων': [
        { key: 'equipment_type', label: 'Τύπος εξοπλισμού' },
        { key: 'usage_hours', label: 'Ώρες χρήσης' },
        { key: 'maintenance', label: 'Συντήρηση' },
        { key: 'included_parts', label: 'Περιλαμβανόμενα παρελκόμενα' },
        { key: 'power_requirements', label: 'Απαιτήσεις ισχύος' }
      ],
      'Επιχειρήσεις – Εξοπλισμός γραφείου': [
        { key: 'category', label: 'Κατηγορία (έπιπλα, Η/Υ κ.λπ.)' },
        { key: 'dimensions', label: 'Διαστάσεις' },
        { key: 'quantity', label: 'Τεμάχια' },
        { key: 'condition', label: 'Κατάσταση' },
        { key: 'brand', label: 'Μάρκα' }
      ],
      'Επιχειρήσεις – Μηχανήματα': [
        { key: 'machine_type', label: 'Τύπος μηχανήματος' },
        { key: 'hours', label: 'Ώρες λειτουργίας' },
        { key: 'capacity', label: 'Χωρητικότητα/παραγωγή' },
        { key: 'power', label: 'Ισχύς/κατανάλωση' },
        { key: 'maintenance', label: 'Συντήρηση' }
      ],
      'Επιχειρήσεις – Επαγγελματικές άδειες': [
        { key: 'license_type', label: 'Τύπος άδειας' },
        { key: 'validity', label: 'Ισχύς/ημ. λήξης' },
        { key: 'transfer_terms', label: 'Όροι μεταβίβασης' },
        { key: 'region', label: 'Περιοχή ισχύος' },
        { key: 'fees', label: 'Τέλη/κόστη' }
      ],
      'Επιχειρήσεις – Ενοικιάσεις επαγγελματικών χώρων': realEstateBase,
      'Επιχειρήσεις – Πωλήσεις επαγγελματικών χώρων': realEstateBase,
      'Σπίτι – Έπιπλα': [
        { key: 'dimensions', label: 'Διαστάσεις' },
        { key: 'material', label: 'Υλικό' },
        { key: 'color_finish', label: 'Χρώμα/φινίρισμα' },
        { key: 'assembly', label: 'Συναρμολόγηση' },
        { key: 'set_items', label: 'Σετ/τεμάχια' }
      ],
      'Σπίτι – Ηλεκτρικές συσκευές': [
        { key: 'appliance_type', label: 'Τύπος συσκευής' },
        { key: 'energy_class', label: 'Ενεργειακή κλάση' },
        { key: 'capacity', label: 'Χωρητικότητα' },
        { key: 'dimensions', label: 'Διαστάσεις' },
        { key: 'warranty', label: 'Εγγύηση' }
      ],
      'Σπίτι – Αντίκες & έργα τέχνης': [
        { key: 'era', label: 'Εποχή/χρονολογία' },
        { key: 'provenance', label: 'Προέλευση/γνησιότητα' },
        { key: 'materials', label: 'Υλικά' },
        { key: 'dimensions', label: 'Διαστάσεις' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Σπίτι – Οικιακά σκεύη': [
        { key: 'material', label: 'Υλικό' },
        { key: 'set_size', label: 'Σετ/τεμάχια' },
        { key: 'heat_source', label: 'Καταλληλότητα (επ. εστίας/φούρνου)' },
        { key: 'care', label: 'Οδηγίες καθαρισμού' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Σπίτι – Οικοδομικά είδη': [
        { key: 'material', label: 'Υλικό/είδος' },
        { key: 'quantity', label: 'Ποσότητα/τεμάχια' },
        { key: 'dimensions', label: 'Διαστάσεις' },
        { key: 'leftover_from', label: 'Προέλευση (έργο/στοκ)' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Σπίτι – Διακόσμηση': [
        { key: 'dimensions', label: 'Διαστάσεις' },
        { key: 'materials', label: 'Υλικά' },
        { key: 'style', label: 'Στυλ' },
        { key: 'mounting', label: 'Τρόπος τοποθέτησης' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Σπίτι – Ηλεκτρολόγοι/υδραυλικοί/τεχνίτες': constructionFields,
      'Σπίτι – Οικιακές εργασίες': cleaningFields,
      'Τεχνολογία – Υπολογιστές': [
        { key: 'cpu', label: 'Επεξεργαστής' },
        { key: 'ram', label: 'Μνήμη RAM' },
        { key: 'storage', label: 'Αποθήκευση' },
        { key: 'gpu', label: 'Κάρτα γραφικών' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Τεχνολογία – Κινητά τηλέφωνα': [
        { key: 'storage', label: 'Αποθηκευτικός χώρος' },
        { key: 'ram', label: 'Μνήμη RAM' },
        { key: 'battery_health', label: 'Υγεία μπαταρίας' },
        { key: 'color', label: 'Χρώμα' },
        { key: 'condition', label: 'Κατάσταση/ζελατίνα' }
      ],
      'Τεχνολογία – Ηχοσυστήματα': [
        { key: 'power_output', label: 'Ισχύς (W)' },
        { key: 'channels', label: 'Κανάλια' },
        { key: 'inputs', label: 'Είσοδοι/συνδέσεις' },
        { key: 'wireless', label: 'Bluetooth/Wi‑Fi' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Τεχνολογία – Τηλεοράσεις': [
        { key: 'size', label: 'Ίντσες' },
        { key: 'panel_type', label: 'Τύπος πάνελ' },
        { key: 'resolution', label: 'Ανάλυση' },
        { key: 'smart_features', label: 'Smart λειτουργίες' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Τεχνολογία – Φωτογραφία': [
        { key: 'sensor', label: 'Τύπος αισθητήρα' },
        { key: 'megapixels', label: 'Megapixels' },
        { key: 'lens_mount', label: 'Mount φακού' },
        { key: 'shutter_count', label: 'Κλικ κλείστρου' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Τεχνολογία – Περιφερειακά Η/Υ': [
        { key: 'type', label: 'Είδος περιφερειακού' },
        { key: 'compatibility', label: 'Συμβατότητα' },
        { key: 'connectivity', label: 'Συνδεσιμότητα' },
        { key: 'condition', label: 'Κατάσταση' },
        { key: 'package', label: 'Συσκευασία/παρελκόμενα' }
      ],
      'Τεχνολογία – Αξεσουάρ κινητής': [
        { key: 'type', label: 'Είδος αξεσουάρ' },
        { key: 'device_fit', label: 'Συμβατό μοντέλο' },
        { key: 'material', label: 'Υλικό' },
        { key: 'condition', label: 'Κατάσταση' },
        { key: 'color', label: 'Χρώμα' }
      ],
      'Ελεύθερος χρόνος – Μουσικά όργανα & αξεσουάρ': [
        { key: 'instrument_type', label: 'Τύπος οργάνου' },
        { key: 'materials', label: 'Υλικά' },
        { key: 'age', label: 'Ηλικία/έτος' },
        { key: 'setup', label: 'Ρυθμίσεις/σετάρισμα' },
        { key: 'case', label: 'Θήκη/αξεσουάρ' }
      ],
      'Ελεύθερος χρόνος – Gaming': [
        { key: 'platform', label: 'Κονσόλα/PC' },
        { key: 'edition', label: 'Έκδοση/συλλεκτικό' },
        { key: 'condition', label: 'Κατάσταση' },
        { key: 'digital_license', label: 'Ψηφιακή/φυσική' },
        { key: 'bundle', label: 'Συμπεριλαμβανόμενα' }
      ],
      'Ελεύθερος χρόνος – Βιβλία/τύπος/ταινίες/μουσική': [
        { key: 'format', label: 'Μορφή (βιβλίο, βινύλιο κ.λπ.)' },
        { key: 'edition', label: 'Έκδοση' },
        { key: 'language', label: 'Γλώσσα' },
        { key: 'condition', label: 'Κατάσταση' },
        { key: 'collection', label: 'Σειρά/box set' }
      ],
      'Ελεύθερος χρόνος – Κυνήγι': [
        { key: 'equipment_type', label: 'Είδος εξοπλισμού' },
        { key: 'caliber', label: 'Διαμέτρημα/μέγεθος' },
        { key: 'safety', label: 'Άδειες/πιστοποιήσεις' },
        { key: 'condition', label: 'Κατάσταση' },
        { key: 'accessories', label: 'Αξεσουάρ' }
      ],
      'Ελεύθερος χρόνος – Συλλογές': [
        { key: 'collection_type', label: 'Θεματολογία' },
        { key: 'rarity', label: 'Σπανιότητα/έκδοση' },
        { key: 'year', label: 'Χρονολογία' },
        { key: 'certification', label: 'Πιστοποίηση' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Ελεύθερος χρόνος – Ταξίδι': [
        { key: 'item_type', label: 'Είδος (βαλίτσα, σακίδιο κ.λπ.)' },
        { key: 'capacity', label: 'Χωρητικότητα' },
        { key: 'dimensions', label: 'Διαστάσεις' },
        { key: 'material', label: 'Υλικό' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Ελεύθερος χρόνος – Είδη camping': [
        { key: 'item_type', label: 'Είδος εξοπλισμού' },
        { key: 'capacity', label: 'Χωρητικότητα/άτομα' },
        { key: 'weight', label: 'Βάρος' },
        { key: 'season_rating', label: 'Κατηγορία εποχικότητας' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Ελεύθερος χρόνος – Χόμπι': [
        { key: 'hobby_type', label: 'Τύπος χόμπι' },
        { key: 'skill_level', label: 'Επίπεδο χρήσης' },
        { key: 'materials', label: 'Υλικά/εργαλεία' },
        { key: 'condition', label: 'Κατάσταση' },
        { key: 'bundle', label: 'Σετ/οδηγίες' }
      ],
      'Αθλητισμός – Ποδήλατα': [
        { key: 'bike_type', label: 'Τύπος ποδηλάτου' },
        { key: 'frame_size', label: 'Μέγεθος σκελετού' },
        { key: 'wheel_size', label: 'Μέγεθος τροχού' },
        { key: 'groupset', label: 'Σύστημα μετάδοσης' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Αθλητισμός – Όργανα γυμναστικής': [
        { key: 'equipment_type', label: 'Είδος οργάνου' },
        { key: 'dimensions', label: 'Διαστάσεις' },
        { key: 'weight_limit', label: 'Όριο βάρους' },
        { key: 'programs', label: 'Προγράμματα/ρυθμίσεις' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Αθλητισμός – Αξεσουάρ ποδηλασίας': [
        { key: 'item_type', label: 'Είδος' },
        { key: 'compatibility', label: 'Συμβατότητα' },
        { key: 'size', label: 'Μέγεθος' },
        { key: 'material', label: 'Υλικό' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Αθλητισμός – Αθλητικά ρούχα & παπούτσια': [
        { key: 'size', label: 'Νούμερο' },
        { key: 'fit', label: 'Εφαρμογή/τύπος' },
        { key: 'material', label: 'Ύφασμα/τεχνολογία' },
        { key: 'condition', label: 'Κατάσταση' },
        { key: 'gender', label: 'Ανδρικό/γυναικείο/unisex' }
      ],
      'Αθλητισμός – Ski & snowboarding': [
        { key: 'equipment_type', label: 'Είδος εξοπλισμού' },
        { key: 'length_size', label: 'Μήκος/νούμερο' },
        { key: 'flex', label: 'Σκληρότητα/flex' },
        { key: 'bindings', label: 'Δέστρες/μπότες' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Αθλητισμός – Άλλα σπορ': [
        { key: 'sport', label: 'Άθλημα' },
        { key: 'size', label: 'Μέγεθος' },
        { key: 'material', label: 'Υλικό' },
        { key: 'condition', label: 'Κατάσταση' },
        { key: 'bundle', label: 'Σετ/αξεσουάρ' }
      ],
      'Σκύλοι': [
        { key: 'breed', label: 'Ράτσα' },
        { key: 'age', label: 'Ηλικία' },
        { key: 'vaccinations', label: 'Εμβολιασμοί/βιβλιάριο' },
        { key: 'pedigree', label: 'Pedigree/γονείς' },
        { key: 'temperament', label: 'Ιδιοσυγκρασία' }
      ],
      'Καναρίνια': [
        { key: 'age', label: 'Ηλικία' },
        { key: 'sex', label: 'Φύλο' },
        { key: 'ringed', label: 'Δαχτυλίδι/πιστοποίηση' },
        { key: 'breeding', label: 'Καταγωγή' },
        { key: 'cage_included', label: 'Κλουβί/εξοπλισμός' }
      ],
      'Παπαγάλοι': [
        { key: 'species', label: 'Είδος' },
        { key: 'age', label: 'Ηλικία' },
        { key: 'talking_level', label: 'Εκπαίδευση/μίμηση' },
        { key: 'tame', label: 'Ημερο/εξημερωμένο' },
        { key: 'papers', label: 'Έγγραφα/δαχτυλίδι' }
      ],
      
      'Υγεία & ομορφιά – Γιατροί': [
        { key: 'specialty', label: 'Ειδικότητα' },
        { key: 'license_number', label: 'Αριθμός άδειας' },
        { key: 'clinic_location', label: 'Ιατρείο/τοποθεσία' },
        { key: 'insurance', label: 'Συνεργασίες ασφαλιστικών' },
        { key: 'appointments', label: 'Τρόπος ραντεβού' }
      ],
      'Υγεία & ομορφιά – Νοσοκόμοι/νοσηλευτές': [
        { key: 'experience', label: 'Εμπειρία/τμήματα' },
        { key: 'certifications_detail', label: 'Πιστοποιήσεις' },
        { key: 'home_care', label: 'Κατ’ οίκον φροντίδα' },
        { key: 'availability', label: 'Βάρδιες' },
        { key: 'languages', label: 'Γλώσσες' }
      ],
      'Υγεία & ομορφιά – Φυσιοθεραπευτές': [
        { key: 'specialties', label: 'Εξειδικεύσεις (αθλητικές, νευρολογικές)' },
        { key: 'clinic_equipment', label: 'Εξοπλισμός' },
        { key: 'home_visits', label: 'Κατ’ οίκον συνεδρίες' },
        { key: 'session_length', label: 'Διάρκεια συνεδρίας' },
        { key: 'certifications', label: 'Πτυχία/άδειες' }
      ],
      'Υγεία & ομορφιά – Ψυχική υγεία': [
        { key: 'profession', label: 'Επάγγελμα (ψυχολόγος/σύμβουλος)' },
        { key: 'approaches', label: 'Μεθοδολογίες' },
        { key: 'session_mode', label: 'Δια ζώσης/online' },
        { key: 'license_number', label: 'Αρ. άδειας' },
        { key: 'client_focus', label: 'Ειδικές ομάδες' }
      ],
      'Υγεία & ομορφιά – Ιατρικά & νοσηλευτικά είδη': [
        { key: 'item_type', label: 'Είδος' },
        { key: 'size', label: 'Μέγεθος/προδιαγραφές' },
        { key: 'sterilization', label: 'Αποστείρωση/λήξη' },
        { key: 'brand', label: 'Μάρκα' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Υγεία & ομορφιά – Βιολογικά προϊόντα': [
        { key: 'product_type', label: 'Κατηγορία προϊόντος' },
        { key: 'certifications', label: 'Πιστοποιήσεις bio' },
        { key: 'expiration', label: 'Ημερομηνία λήξης' },
        { key: 'ingredients', label: 'Συστατικά' },
        { key: 'packaging', label: 'Συσκευασία' }
      ],
      'Υγεία & ομορφιά – Υπηρεσίες ομορφιάς': beautyFields,
      'Υγεία & ομορφιά – Φροντίδα ηλικιωμένων': [
        { key: 'experience', label: 'Εμπειρία/περιστατικά' },
        { key: 'medical_skills', label: 'Ιατρικές γνώσεις' },
        { key: 'live_in', label: 'Συμβίωση' },
        { key: 'availability', label: 'Ωράρια' },
        { key: 'references', label: 'Συστάσεις' }
      ],
      'Μόδα & ρουχισμός – Ρολόγια': [
        { key: 'brand', label: 'Μάρκα' },
        { key: 'model', label: 'Μοντέλο' },
        { key: 'year', label: 'Έτος' },
        { key: 'materials', label: 'Υλικά' },
        { key: 'documentation', label: 'Κουτί/χαρτιά' }
      ],
      'Μόδα & ρουχισμός – Τσάντες & είδη ταξιδίου': [
        { key: 'brand', label: 'Μάρκα' },
        { key: 'model', label: 'Σειρά' },
        { key: 'material', label: 'Υλικό' },
        { key: 'dimensions', label: 'Διαστάσεις' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Μόδα & ρουχισμός – Ρούχα': [
        { key: 'size', label: 'Νούμερο' },
        { key: 'fit', label: 'Γραμμή/κούμπωμα' },
        { key: 'material', label: 'Ύφασμα' },
        { key: 'color', label: 'Χρώμα' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Μόδα & ρουχισμός – Παπούτσια': [
        { key: 'size', label: 'Νούμερο' },
        { key: 'style', label: 'Τύπος παπουτσιού' },
        { key: 'material', label: 'Υλικό' },
        { key: 'condition', label: 'Κατάσταση' },
        { key: 'included', label: 'Κουτί/αξεσουάρ' }
      ],
      'Μόδα & ρουχισμός – Κοσμήματα': [
        { key: 'material', label: 'Υλικό (χρυσός, ασήμι κ.λπ.)' },
        { key: 'stones', label: 'Πέτρες/πιστοποίηση' },
        { key: 'weight', label: 'Βάρος' },
        { key: 'size', label: 'Μέγεθος' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Μόδα & ρουχισμός – Αξεσουάρ': [
        { key: 'item_type', label: 'Είδος αξεσουάρ' },
        { key: 'material', label: 'Υλικό' },
        { key: 'size', label: 'Μέγεθος' },
        { key: 'color', label: 'Χρώμα' },
        { key: 'condition', label: 'Κατάσταση' }
      ],
      'Μόδα & ρουχισμός – Βρεφικά & παιδικά': [
        { key: 'age_range', label: 'Ηλικία' },
        { key: 'size', label: 'Νούμερο' },
        { key: 'condition', label: 'Κατάσταση' },
        { key: 'safety_standards', label: 'Πιστοποιήσεις ασφαλείας' },
        { key: 'bundle', label: 'Σετ/παιχνίδια' }
      ],
      'Μόδα & ρουχισμός – Γάμος & βάπτιση': [
        { key: 'item_type', label: 'Είδος (νυφικό, μπομπονιέρες κ.λπ.)' },
        { key: 'sizes', label: 'Μεγέθη' },
        { key: 'color', label: 'Χρώμα' },
        { key: 'condition', label: 'Κατάσταση' },
        { key: 'package', label: 'Πακέτο/σετ' }
      ],
      'Προσωπικά & κοινωνικά – Γνωριμίες': [
        { key: 'seeking', label: 'Τι αναζητώ' },
        { key: 'interests', label: 'Ενδιαφέροντα' },
        { key: 'age', label: 'Ηλικία' },
        { key: 'location', label: 'Περιοχή' },
        { key: 'communication', label: 'Τρόπος επικοινωνίας' }
      ],
      'Προσωπικά & κοινωνικά – Συστέγαση – συγκατοίκηση': [
        { key: 'room_type', label: 'Δωμάτιο/διαμέρισμα' },
        { key: 'roommate_count', label: 'Αριθμός συγκάτοικων' },
        { key: 'house_rules', label: 'Κανόνες σπιτιού' },
        { key: 'bills', label: 'Διαμοιρασμός λογαριασμών' },
        { key: 'furnished', label: 'Επιπλωμένο' }
      ],
      'Προσωπικά & κοινωνικά – Συνοικέσια': [
        { key: 'seeking', label: 'Τι αναζητώ' },
        { key: 'background', label: 'Σύντομο προφίλ' },
        { key: 'values', label: 'Αξίες/προτιμήσεις' },
        { key: 'age', label: 'Ηλικία' },
        { key: 'location', label: 'Περιοχή' }
      ],
      'Προσωπικά & κοινωνικά – Αστρολογία': [
        { key: 'service_type', label: 'Τύπος υπηρεσίας (χάρτης, πρόβλεψη)' },
        { key: 'session_mode', label: 'Δια ζώσης/online' },
        { key: 'experience', label: 'Εμπειρία/σπουδές' },
        { key: 'languages', label: 'Γλώσσες' },
        { key: 'materials', label: 'Παραδοτέα (report, ηχογράφηση)' }
      ]
    }
  }
};

module.exports = categoryFields;
