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
    teacher: {
      shell: {
        badge: 'Espace formateur',
        greeting: 'Bonjour',
        loading: 'Vérification de votre session…',
      },
      nav: {
        dashboard: 'Mes sessions',
        profile: 'Ma fiche formateur',
        logout: 'Se déconnecter',
      },
      common: {
        loading: 'Chargement…',
        retry: 'Réessayer',
        cancel: 'Annuler',
        save: 'Enregistrer',
        saving: 'Enregistrement…',
        saved: 'Enregistré',
        delete: 'Supprimer',
        deleting: 'Suppression…',
        close: 'Fermer',
        optional: 'Facultatif',
        networkError: "Le serveur est injoignable. Vérifiez que l'API est démarrée.",
        genericError: 'Une erreur est survenue. Merci de réessayer.',
        notFoundError: 'Introuvable.',
        forbiddenError: "Vous n'avez pas accès à cette ressource.",
      },
      modeLabels: {
        ONSITE: 'Présentiel',
        ONLINE: 'À distance',
        HYBRID: 'Hybride',
      },
      statusLabels: {
        PLANNED: 'Planifiée',
        OPEN: 'Ouverte',
        FULL: 'Complète',
        RUNNING: 'En cours',
        DONE: 'Terminée',
        CANCELLED: 'Annulée',
      },
      enrollmentStatusLabels: {
        REQUESTED: 'Demande reçue',
        CONFIRMED: 'Confirmée',
        PAID: 'Payée',
        COMPLETED: 'Terminée',
        CANCELLED: 'Annulée',
      },
      materialTypeLabels: {
        PDF: 'PDF',
        SLIDES: 'Diaporama',
        LINK: 'Lien',
        VIDEO: 'Vidéo',
      },
      visibilityLabels: {
        ENROLLED: 'Inscrits uniquement',
        PUBLIC: 'Public',
      },
      dashboard: {
        title: 'Mes sessions',
        subtitle: 'Retrouvez ici les sessions que vous animez, vos effectifs et vos supports.',
        sectionTitle: 'Sessions à animer',
        enrolledLabel: 'inscrits',
        capacityLabel: 'places',
        materialsCountLabel: 'supports',
        viewSession: 'Voir la session',
        empty: {
          title: 'Aucune session pour le moment',
          body: "Vous n'animez aucune session pour l'instant. Elles apparaîtront ici dès qu'une session vous sera assignée.",
        },
        errorTitle: 'Impossible de charger vos sessions',
      },
      session: {
        backToDashboard: '← Retour à mes sessions',
        scheduleLabel: 'Horaires',
        formatLabel: 'Format',
        locationLabel: 'Lieu',
        onlineLabel: 'Session en ligne',
        meetingLinkLabel: 'Lien de visioconférence',
        capacityLabel: 'Capacité',
        enrolledLabel: 'Inscrits',
        notFound: 'Cette session est introuvable.',
        forbidden: "Vous n'animez pas cette session.",
        roster: {
          title: 'Liste des stagiaires',
          empty: 'Aucun stagiaire inscrit pour le moment.',
          studentHeader: 'Stagiaire',
          emailHeader: 'Email',
          phoneHeader: 'Téléphone',
          statusHeader: 'Statut',
          certificateHeader: 'Attestation',
          certificateIssued: 'Délivrée',
          certificateNone: 'Aucune',
          noPhone: 'Non renseigné',
        },
        materials: {
          title: 'Supports de cours',
          empty: 'Aucun support déposé pour cette session.',
          addButton: 'Ajouter un support',
          formTitle: 'Nouveau support',
          titleLabel: 'Titre',
          titlePlaceholder: 'Ex. Slides — module 1',
          typeLabel: 'Type',
          visibilityLabel: 'Visibilité',
          fileLabel: 'Fichier',
          urlLabel: 'URL',
          urlPlaceholder: 'https://…',
          submit: 'Publier le support',
          submitting: 'Publication…',
          successMessage: 'Support publié avec succès.',
          fileRequired: 'Merci de sélectionner un fichier.',
          urlRequired: 'Merci de renseigner une URL valide.',
          titleRequired: 'Merci de renseigner un titre.',
          deleteConfirmTitle: 'Supprimer ce support ?',
          deleteConfirmBody: 'Cette action est définitive.',
          deleteConfirmYes: 'Oui, supprimer',
          deleteSuccess: 'Support supprimé.',
          sizeUnknown: 'Taille inconnue',
          openLink: 'Ouvrir',
        },
      },
      profile: {
        title: 'Ma fiche formateur',
        subtitle: 'Cette fiche est affichée publiquement dans l’annuaire des formateurs du centre.',
        headlineFrLabel: 'Accroche (français)',
        headlineEnLabel: 'Accroche (anglais)',
        bioFrLabel: 'Biographie (français)',
        bioEnLabel: 'Biographie (anglais)',
        bioHint: 'Entre 20 et 4000 caractères.',
        certificationsLabel: 'Certifications',
        certificationsHint: '20 certifications maximum, 80 caractères chacune.',
        certificationPlaceholder: 'Ex. PMP®, PMI',
        addCertification: 'Ajouter une certification',
        removeCertification: 'Retirer',
        linkedinLabel: 'Profil LinkedIn',
        linkedinPlaceholder: 'https://www.linkedin.com/in/…',
        yearsLabel: "Années d'expérience",
        publishedLabel: 'Fiche publiée',
        publishedHint: "Une fois activée, votre fiche est visible dans l'annuaire public des formateurs.",
        save: 'Enregistrer la fiche',
        saving: 'Enregistrement…',
        saved: 'Fiche enregistrée avec succès.',
        errorGeneric: "Impossible d'enregistrer la fiche. Vérifiez les champs signalés.",
        firstTimeNotice: "Vous n'avez pas encore de fiche formateur : complétez le formulaire ci-dessous pour la créer.",
      },
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
    teacher: {
      shell: {
        badge: 'Teacher space',
        greeting: 'Hello',
        loading: 'Checking your session…',
      },
      nav: {
        dashboard: 'My sessions',
        profile: 'My teacher profile',
        logout: 'Log out',
      },
      common: {
        loading: 'Loading…',
        retry: 'Retry',
        cancel: 'Cancel',
        save: 'Save',
        saving: 'Saving…',
        saved: 'Saved',
        delete: 'Delete',
        deleting: 'Deleting…',
        close: 'Close',
        optional: 'Optional',
        networkError: 'The server is unreachable. Make sure the API is running.',
        genericError: 'Something went wrong. Please try again.',
        notFoundError: 'Not found.',
        forbiddenError: "You don't have access to this resource.",
      },
      modeLabels: {
        ONSITE: 'On-site',
        ONLINE: 'Online',
        HYBRID: 'Hybrid',
      },
      statusLabels: {
        PLANNED: 'Planned',
        OPEN: 'Open',
        FULL: 'Full',
        RUNNING: 'Running',
        DONE: 'Done',
        CANCELLED: 'Cancelled',
      },
      enrollmentStatusLabels: {
        REQUESTED: 'Requested',
        CONFIRMED: 'Confirmed',
        PAID: 'Paid',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled',
      },
      materialTypeLabels: {
        PDF: 'PDF',
        SLIDES: 'Slides',
        LINK: 'Link',
        VIDEO: 'Video',
      },
      visibilityLabels: {
        ENROLLED: 'Enrolled only',
        PUBLIC: 'Public',
      },
      dashboard: {
        title: 'My sessions',
        subtitle: 'Here are the sessions you teach, your rosters and your materials.',
        sectionTitle: 'Sessions to teach',
        enrolledLabel: 'enrolled',
        capacityLabel: 'seats',
        materialsCountLabel: 'materials',
        viewSession: 'View session',
        empty: {
          title: 'No sessions yet',
          body: "You aren't teaching any session yet. They will show up here as soon as one is assigned to you.",
        },
        errorTitle: 'Could not load your sessions',
      },
      session: {
        backToDashboard: '← Back to my sessions',
        scheduleLabel: 'Schedule',
        formatLabel: 'Format',
        locationLabel: 'Location',
        onlineLabel: 'Online session',
        meetingLinkLabel: 'Video call link',
        capacityLabel: 'Capacity',
        enrolledLabel: 'Enrolled',
        notFound: 'This session could not be found.',
        forbidden: "You aren't the teacher assigned to this session.",
        roster: {
          title: 'Student roster',
          empty: 'No students enrolled yet.',
          studentHeader: 'Student',
          emailHeader: 'Email',
          phoneHeader: 'Phone',
          statusHeader: 'Status',
          certificateHeader: 'Certificate',
          certificateIssued: 'Issued',
          certificateNone: 'None',
          noPhone: 'Not provided',
        },
        materials: {
          title: 'Course materials',
          empty: 'No material uploaded for this session yet.',
          addButton: 'Add a material',
          formTitle: 'New material',
          titleLabel: 'Title',
          titlePlaceholder: 'E.g. Slides — module 1',
          typeLabel: 'Type',
          visibilityLabel: 'Visibility',
          fileLabel: 'File',
          urlLabel: 'URL',
          urlPlaceholder: 'https://…',
          submit: 'Publish material',
          submitting: 'Publishing…',
          successMessage: 'Material published successfully.',
          fileRequired: 'Please select a file.',
          urlRequired: 'Please provide a valid URL.',
          titleRequired: 'Please provide a title.',
          deleteConfirmTitle: 'Delete this material?',
          deleteConfirmBody: 'This action cannot be undone.',
          deleteConfirmYes: 'Yes, delete',
          deleteSuccess: 'Material deleted.',
          sizeUnknown: 'Unknown size',
          openLink: 'Open',
        },
      },
      profile: {
        title: 'My teacher profile',
        subtitle: 'This card is shown publicly in the center’s teacher directory.',
        headlineFrLabel: 'Headline (French)',
        headlineEnLabel: 'Headline (English)',
        bioFrLabel: 'Biography (French)',
        bioEnLabel: 'Biography (English)',
        bioHint: 'Between 20 and 4000 characters.',
        certificationsLabel: 'Certifications',
        certificationsHint: 'Up to 20 certifications, 80 characters each.',
        certificationPlaceholder: 'E.g. PMP®, PMI',
        addCertification: 'Add a certification',
        removeCertification: 'Remove',
        linkedinLabel: 'LinkedIn profile',
        linkedinPlaceholder: 'https://www.linkedin.com/in/…',
        yearsLabel: 'Years of experience',
        publishedLabel: 'Profile published',
        publishedHint: 'Once enabled, your profile is visible in the public teacher directory.',
        save: 'Save profile',
        saving: 'Saving…',
        saved: 'Profile saved successfully.',
        errorGeneric: 'Could not save the profile. Please check the highlighted fields.',
        firstTimeNotice: "You don't have a teacher profile yet: fill in the form below to create one.",
      },
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)['fr'];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] as Dictionary;
}
