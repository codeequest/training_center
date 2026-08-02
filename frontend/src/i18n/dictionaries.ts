import type { Locale } from './config';

/**
 * Toutes les chaînes de l'interface, en français et en anglais.
 * Le contenu métier (formations, chiffres) vivra à terme dans l'API ;
 * il est ici statique pour que la page d'accueil fonctionne sans base de données.
 */
const dictionaries = {
  fr: {
    brand: {
      name: 'Centre de Formation',
      tagline: 'Compétences certifiantes',
    },
    nav: {
      home: 'Accueil',
      courses: 'Formations',
      contact: 'Contact',
      login: 'Connexion',
      register: "S'inscrire",
      openMenu: 'Ouvrir le menu',
      closeMenu: 'Fermer le menu',
      languageLabel: 'Changer de langue',
    },
    hero: {
      badge: 'Sessions ouvertes — Tunis & à distance',
      title: 'Montez en compétences sur les métiers de la data et du management',
      subtitle:
        "Power BI, IA générative, PMP® et Scrum Master : des formations courtes, animées par des praticiens certifiés, conçues pour être appliquées dès le lundi matin.",
      primaryCta: 'Voir les formations',
      secondaryCta: 'Parler à un conseiller',
      note: 'Sessions en présentiel à Tunis, à distance ou en intra-entreprise.',
    },
    stats: {
      title: 'Le centre en quelques chiffres',
      items: [
        { value: '4', label: 'Formations certifiantes' },
        { value: '850+', label: 'Stagiaires formés' },
        { value: '96 %', label: 'Taux de satisfaction' },
        { value: '12', label: "Années d'expérience" },
      ],
    },
    about: {
      eyebrow: 'Le centre',
      title: 'Un organisme de formation à taille humaine',
      body: [
        "Depuis 2013, nous accompagnons les professionnels et les entreprises tunisiennes dans leur montée en compétences sur la data, l'intelligence artificielle et la gestion de projet.",
        "Nos groupes sont volontairement limités à 15 stagiaires : chacun repart avec un livrable concret et un accompagnement personnalisé jusqu'à la certification.",
      ],
      pillars: [
        {
          title: 'Formateurs praticiens',
          description:
            "Tous nos intervenants exercent en entreprise et sont certifiés sur les référentiels qu'ils enseignent.",
        },
        {
          title: 'Pédagogie par la pratique',
          description:
            '70 % du temps est consacré à des ateliers sur des cas réels, pas à des diapositives.',
        },
        {
          title: 'Suivi jusqu’à la certification',
          description:
            "Examens blancs, supports à vie et accompagnement post-formation jusqu'au passage de l'examen.",
        },
        {
          title: 'Formats flexibles',
          description:
            'Présentiel à Tunis, distanciel en direct, ou intra-entreprise adapté à vos équipes.',
        },
      ],
    },
    courses: {
      eyebrow: 'Nos formations',
      title: 'Quatre parcours, un objectif : la certification',
      subtitle:
        'Des programmes courts et intensifs, actualisés en continu avec les référentiels officiels.',
      cta: 'Découvrir le programme',
      allCta: 'Voir toutes les formations',
      durationLabel: 'Durée',
      levelLabel: 'Niveau',
      hours: 'heures',
    },
    why: {
      eyebrow: 'Pourquoi nous choisir',
      title: 'Une formation qui se traduit en résultats',
      items: [
        {
          title: 'Groupes de 15 maximum',
          description: 'Assez petits pour que chaque question trouve une réponse.',
        },
        {
          title: 'Supports accessibles à vie',
          description: 'Slides, jeux de données et enregistrements restent dans votre espace stagiaire.',
        },
        {
          title: 'Attestation vérifiable',
          description: 'Chaque attestation porte une référence unique contrôlable en ligne.',
        },
        {
          title: 'Financement facilité',
          description: 'Devis, conventions et facturation entreprise gérés par notre équipe.',
        },
      ],
    },
    testimonials: {
      eyebrow: 'Témoignages',
      title: 'Ils sont passés par le centre',
      items: [
        {
          quote:
            "La formation Power BI m'a fait gagner deux jours de reporting par mois. Les ateliers portaient sur nos propres données, ce qui change tout.",
          author: 'Sarra B.',
          role: 'Contrôleuse de gestion, secteur bancaire',
        },
        {
          quote:
            "J'ai obtenu la certification PMP® du premier coup. Les examens blancs sont d'un réalisme redoutable.",
          author: 'Mehdi K.',
          role: 'Chef de projet IT',
        },
        {
          quote:
            "Le module IA générative est allé bien plus loin que les usages de surface. Nous avons déployé deux cas d'usage internes depuis.",
          author: 'Ines T.',
          role: "Responsable innovation",
        },
      ],
    },
    cta: {
      title: 'Une question sur un programme ou un financement ?',
      subtitle:
        'Notre équipe pédagogique vous répond sous 48 heures ouvrées et vous oriente vers le parcours adapté.',
      primary: 'Nous contacter',
      secondary: 'Consulter le catalogue',
    },
    footer: {
      about:
        'Organisme de formation professionnelle spécialisé en data, intelligence artificielle et gestion de projet.',
      navTitle: 'Navigation',
      coursesTitle: 'Formations',
      contactTitle: 'Contact',
      address: '12, rue du Lac Léman — Les Berges du Lac, 1053 Tunis',
      rights: 'Tous droits réservés.',
      legal: 'Mentions légales',
      privacy: 'Politique de confidentialité',
    },
    login: {
      title: 'Espace personnel',
      subtitle: 'Accédez à vos formations, vos supports et vos attestations.',
      emailLabel: 'Adresse email',
      emailPlaceholder: 'vous@exemple.tn',
      passwordLabel: 'Mot de passe',
      passwordPlaceholder: '••••••••',
      submit: 'Se connecter',
      submitting: 'Connexion en cours…',
      forgot: 'Mot de passe oublié ?',
      noAccountTitle: 'Pas encore de compte ?',
      noAccountBody:
        "Les accès sont créés par le centre lors de la confirmation de votre inscription. Contactez-nous si vous n'avez pas reçu vos identifiants.",
      noAccountCta: 'Nous contacter',
      backHome: "Retour à l'accueil",
      genericError: 'Connexion impossible. Vérifiez vos identifiants.',
      networkError: "Le serveur est injoignable. Vérifiez que l'API est démarrée.",
    },
    register: {
      title: "Demande d'inscription",
      subtitle:
        'Réservez votre place en 2 minutes. Notre équipe confirme votre inscription sous 48 heures ouvrées.',
      firstNameLabel: 'Prénom',
      firstNamePlaceholder: 'Sarra',
      lastNameLabel: 'Nom',
      lastNamePlaceholder: 'Ben Ali',
      emailLabel: 'Adresse e-mail',
      emailPlaceholder: 'vous@exemple.tn',
      phoneLabel: 'Numéro de téléphone',
      phonePlaceholder: '+216 20 123 456',
      formationLabel: 'Formation souhaitée',
      formationPlaceholder: 'Choisissez une session',
      loadingSessions: 'Chargement des sessions…',
      noSessionsAvailable: 'Aucune session ouverte pour le moment. Contactez-nous directement.',
      companyLabel: 'Société (optionnel)',
      companyPlaceholder: 'Nom de votre entreprise',
      messageLabel: 'Message (optionnel)',
      messagePlaceholder: 'Une question, un besoin spécifique ?',
      consentLabel:
        "J'accepte que mes informations soient utilisées par le centre pour traiter ma demande d'inscription.",
      submit: 'Envoyer ma demande',
      submitting: 'Envoi en cours…',
      successTitle: 'Demande envoyée !',
      successBody:
        'Nous avons bien reçu votre demande. Notre équipe vous recontacte sous 48 heures ouvrées pour confirmer votre place.',
      backHome: "Retour à l'accueil",
      backToForm: 'Envoyer une autre demande',
      errors: {
        required: 'Ce champ est requis.',
        invalidEmail: 'Adresse e-mail invalide.',
        invalidPhone: 'Numéro de téléphone invalide (6 à 20 caractères : chiffres, espaces, + ( ) -).',
        consentRequired: 'Merci de confirmer votre accord pour continuer.',
        formationRequired: 'Merci de choisir une formation.',
      },
      genericError: "Votre demande n'a pas pu être envoyée. Merci de réessayer.",
      networkError: "Le serveur est injoignable. Vérifiez que l'API est démarrée.",
    },
    studentDashboard: {
      title: 'Mon espace',
      welcomeBack: 'Bon retour,',
      loading: 'Chargement de votre tableau de bord…',
      sessionExpired: 'Votre session a expiré, merci de vous reconnecter.',
      logout: 'Se déconnecter',
      personalInfoTitle: 'Informations personnelles',
      emailLabel: 'E-mail',
      phoneLabel: 'Téléphone',
      registrationDateLabel: "Date d'inscription",
      notProvided: 'Non renseigné',
      coursesTitle: 'Mes formations',
      noCourses: "Vous n'êtes inscrit à aucune formation pour le moment.",
      browseCourses: 'Voir les formations',
      progressLabel: 'Progression',
      deadlinesTitle: 'Échéances à venir',
      noDeadlines: 'Aucune échéance à venir.',
      urgentBadge: 'Bientôt',
      deadlineStart: 'Début de session',
      deadlineEnd: 'Fin de session',
      statusLabels: {
        REQUESTED: 'Demande envoyée',
        CONFIRMED: 'Confirmée',
        PAID: 'Réglée',
        COMPLETED: 'Terminée',
      },
    },
    adminStudents: {
      titleAdmin: 'Tableau de bord — Étudiants',
      titleTeacher: 'Mes étudiants',
      subtitleAdmin: "Vue d'ensemble de tous les étudiants inscrits.",
      subtitleTeacher:
        'Consultez les informations, formations et progression des étudiants. Vue en lecture seule.',
      readOnlyNote: 'Vue en lecture seule — aucune modification possible depuis cet écran.',
      searchPlaceholder: 'Rechercher un étudiant…',
      loading: 'Chargement des étudiants…',
      noStudents: 'Aucun étudiant ne correspond à cette recherche.',
      columns: {
        name: 'Étudiant',
        contact: 'Contact',
        registrationDate: "Date d'inscription",
        courses: 'Formations',
        progress: 'Progression',
        nextDeadline: 'Prochaine échéance',
      },
      noCourse: 'Aucune formation',
      noDeadline: '—',
      inactive: 'Inactif',
      sessionExpired: 'Votre session a expiré, merci de vous reconnecter.',
    },
  },

  en: {
    brand: {
      name: 'Training Center',
      tagline: 'Certification-focused training',
    },
    nav: {
      home: 'Home',
      courses: 'Courses',
      contact: 'Contact',
      login: 'Log in',
      register: 'Enroll',
      openMenu: 'Open menu',
      closeMenu: 'Close menu',
      languageLabel: 'Change language',
    },
    hero: {
      badge: 'Enrolling now — Tunis & online',
      title: 'Build the data and management skills your career needs',
      subtitle:
        'Power BI, Generative AI, PMP® and Scrum Master: short, intensive courses taught by certified practitioners and designed to be applied from Monday morning.',
      primaryCta: 'Browse courses',
      secondaryCta: 'Talk to an advisor',
      note: 'On-site in Tunis, live online, or delivered in-house at your company.',
    },
    stats: {
      title: 'The center at a glance',
      items: [
        { value: '4', label: 'Certification tracks' },
        { value: '850+', label: 'Professionals trained' },
        { value: '96%', label: 'Satisfaction rate' },
        { value: '12', label: 'Years of experience' },
      ],
    },
    about: {
      eyebrow: 'The center',
      title: 'A training organisation built on a human scale',
      body: [
        'Since 2013 we have helped Tunisian professionals and companies build skills in data, artificial intelligence and project management.',
        'We deliberately cap our groups at 15 participants: everyone leaves with a concrete deliverable and personal support all the way to certification.',
      ],
      pillars: [
        {
          title: 'Practitioner trainers',
          description:
            'Every trainer works in the field and is certified in the framework they teach.',
        },
        {
          title: 'Learning by doing',
          description: '70% of the time is spent on hands-on workshops with real cases, not slides.',
        },
        {
          title: 'Support through certification',
          description:
            'Mock exams, lifetime access to materials, and follow-up until you sit the real exam.',
        },
        {
          title: 'Flexible formats',
          description: 'On-site in Tunis, live online, or in-house tailored to your teams.',
        },
      ],
    },
    courses: {
      eyebrow: 'Our courses',
      title: 'Four tracks, one goal: certification',
      subtitle:
        'Short, intensive programmes kept continuously in step with the official frameworks.',
      cta: 'View the syllabus',
      allCta: 'See all courses',
      durationLabel: 'Duration',
      levelLabel: 'Level',
      hours: 'hours',
    },
    why: {
      eyebrow: 'Why choose us',
      title: 'Training that turns into results',
      items: [
        {
          title: 'Groups of 15 maximum',
          description: 'Small enough that every question gets an answer.',
        },
        {
          title: 'Lifetime access to materials',
          description: 'Slides, datasets and recordings stay in your student area.',
        },
        {
          title: 'Verifiable certificate',
          description: 'Every certificate carries a unique reference you can check online.',
        },
        {
          title: 'Simple funding',
          description: 'Quotes, training agreements and company invoicing handled by our team.',
        },
      ],
    },
    testimonials: {
      eyebrow: 'Testimonials',
      title: 'What our alumni say',
      items: [
        {
          quote:
            'The Power BI course saved me two days of reporting every month. The workshops used our own data, which made all the difference.',
          author: 'Sarra B.',
          role: 'Management controller, banking',
        },
        {
          quote:
            'I passed the PMP® certification on the first attempt. The mock exams are ruthlessly realistic.',
          author: 'Mehdi K.',
          role: 'IT project manager',
        },
        {
          quote:
            'The Generative AI module went far beyond surface-level usage. We have shipped two internal use cases since.',
          author: 'Ines T.',
          role: 'Head of innovation',
        },
      ],
    },
    cta: {
      title: 'Questions about a programme or funding?',
      subtitle:
        'Our training team replies within 48 working hours and points you to the right track.',
      primary: 'Contact us',
      secondary: 'Browse the catalogue',
    },
    footer: {
      about:
        'Professional training organisation specialising in data, artificial intelligence and project management.',
      navTitle: 'Navigation',
      coursesTitle: 'Courses',
      contactTitle: 'Contact',
      address: '12, rue du Lac Léman — Les Berges du Lac, 1053 Tunis',
      rights: 'All rights reserved.',
      legal: 'Legal notice',
      privacy: 'Privacy policy',
    },
    login: {
      title: 'Your account',
      subtitle: 'Access your courses, materials and certificates.',
      emailLabel: 'Email address',
      emailPlaceholder: 'you@example.com',
      passwordLabel: 'Password',
      passwordPlaceholder: '••••••••',
      submit: 'Log in',
      submitting: 'Signing in…',
      forgot: 'Forgot your password?',
      noAccountTitle: 'No account yet?',
      noAccountBody:
        'Accounts are created by the center once your enrolment is confirmed. Get in touch if you have not received your credentials.',
      noAccountCta: 'Contact us',
      backHome: 'Back to home',
      genericError: 'Sign-in failed. Please check your credentials.',
      networkError: 'The server is unreachable. Make sure the API is running.',
    },
    register: {
      title: 'Enrollment request',
      subtitle:
        'Reserve your spot in 2 minutes. Our team confirms your enrollment within 48 business hours.',
      firstNameLabel: 'First name',
      firstNamePlaceholder: 'Sarra',
      lastNameLabel: 'Last name',
      lastNamePlaceholder: 'Ben Ali',
      emailLabel: 'Email address',
      emailPlaceholder: 'you@example.com',
      phoneLabel: 'Phone number',
      phonePlaceholder: '+216 20 123 456',
      formationLabel: 'Course',
      formationPlaceholder: 'Choose a session',
      loadingSessions: 'Loading sessions…',
      noSessionsAvailable: 'No sessions are open right now. Please contact us directly.',
      companyLabel: 'Company (optional)',
      companyPlaceholder: 'Your company name',
      messageLabel: 'Message (optional)',
      messagePlaceholder: 'Any question or specific need?',
      consentLabel: 'I agree that my information will be used by the center to process my enrollment request.',
      submit: 'Send my request',
      submitting: 'Sending…',
      successTitle: 'Request sent!',
      successBody:
        'We have received your request. Our team will get back to you within 48 business hours to confirm your spot.',
      backHome: 'Back to home',
      backToForm: 'Send another request',
      errors: {
        required: 'This field is required.',
        invalidEmail: 'Invalid email address.',
        invalidPhone: 'Invalid phone number (6 to 20 characters: digits, spaces, + ( ) -).',
        consentRequired: 'Please confirm your agreement to continue.',
        formationRequired: 'Please choose a course.',
      },
      genericError: 'Your request could not be sent. Please try again.',
      networkError: 'The server is unreachable. Make sure the API is running.',
    },
    studentDashboard: {
      title: 'My space',
      welcomeBack: 'Welcome back,',
      loading: 'Loading your dashboard…',
      sessionExpired: 'Your session has expired, please sign in again.',
      logout: 'Sign out',
      personalInfoTitle: 'Personal information',
      emailLabel: 'Email',
      phoneLabel: 'Phone',
      registrationDateLabel: 'Registration date',
      notProvided: 'Not provided',
      coursesTitle: 'My courses',
      noCourses: 'You are not enrolled in any course yet.',
      browseCourses: 'Browse courses',
      progressLabel: 'Progress',
      deadlinesTitle: 'Upcoming deadlines',
      noDeadlines: 'No upcoming deadlines.',
      urgentBadge: 'Soon',
      deadlineStart: 'Session start',
      deadlineEnd: 'Session end',
      statusLabels: {
        REQUESTED: 'Request sent',
        CONFIRMED: 'Confirmed',
        PAID: 'Paid',
        COMPLETED: 'Completed',
      },
    },
    adminStudents: {
      titleAdmin: 'Dashboard — Students',
      titleTeacher: 'My students',
      subtitleAdmin: 'Overview of all enrolled students.',
      subtitleTeacher: 'Review student details, courses and progress. Read-only view.',
      readOnlyNote: 'Read-only view — no changes can be made from this screen.',
      searchPlaceholder: 'Search a student…',
      loading: 'Loading students…',
      noStudents: 'No student matches this search.',
      columns: {
        name: 'Student',
        contact: 'Contact',
        registrationDate: 'Registration date',
        courses: 'Courses',
        progress: 'Progress',
        nextDeadline: 'Next deadline',
      },
      noCourse: 'No course',
      noDeadline: '—',
      inactive: 'Inactive',
      sessionExpired: 'Your session has expired, please sign in again.',
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)['fr'];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] as Dictionary;
}
