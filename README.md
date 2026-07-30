# Centre de Formation

Application web bilingue (FR/EN) pour un centre de formation professionnelle proposant
quatre parcours certifiants : **Power BI**, **IA générative**, **PMP®** et **Scrum Master**.

```
centre_de_formation/
├── backend/     API REST — Express + TypeScript + Prisma + PostgreSQL
└── frontend/    Site & espace personnel — Next.js 15 (App Router) + TypeScript + Tailwind
```

---

## État d'avancement

| Élément | État |
|---|---|
| Page d'accueil (héros, chiffres, à propos, formations, atouts, témoignages, appel à l'action) | ✅ Terminé |
| Barre de navigation (Accueil / Formations / Contact + Connexion) | ✅ Terminé |
| Sélecteur de langue FR/EN + pied de page | ✅ Terminé |
| Page de connexion (formulaire branché sur l'API) | ✅ Terminé |
| API : auth, formations, sessions, inscriptions, formateurs, contact, supports, attestations, back-office | ✅ Terminé |
| Page Formations (catalogue + détail) | ⏳ À développer |
| Page Contact (formulaire) | ⏳ À développer |
| Espaces stagiaire / formateur / administration | ⏳ À développer |

Les pages non développées existent sous forme de réservation de route (« en cours de
développement ») afin qu'aucun lien de la navigation ne soit mort.

---

## Décisions structurantes

| Sujet | Choix retenu |
|---|---|
| Périmètre | Site vitrine + comptes légers (stagiaire, formateur, administrateur) |
| Stack | Next.js + TypeScript côté client, Express + PostgreSQL côté serveur |
| Langues | Bilingue français / anglais, préfixe de langue dans l'URL (`/fr`, `/en`) |
| Inscription | Demande publique, puis pipeline validé par l'équipe (`REQUESTED → CONFIRMED → PAID → COMPLETED`) — pas de paiement en ligne |
| Comptes | Créés par l'administration, mot de passe provisoire envoyé par email |
| Cible | Site de production |

Le modèle de données distingue **Course** (le programme, vendu plusieurs fois) et
**Session** (une exécution datée du programme). Une inscription porte sur une session.

---

## Démarrage

### Prérequis
- Node.js 18 ou supérieur (testé avec Node 24)
- PostgreSQL 14 ou supérieur

> PostgreSQL n'est pas encore installé sur ce poste. Le **frontend fonctionne sans base de
> données** : le contenu de la page d'accueil est statique. La base n'est requise que pour
> démarrer l'API.

### Frontend

```bash
cd frontend
cp .env.example .env.local     # sous PowerShell : copy .env.example .env.local
npm install
npm run dev                    # http://localhost:3000
```

La racine `/` redirige automatiquement vers `/fr` ou `/en` selon la langue du navigateur.

### Backend

```bash
cd backend
cp .env.example .env           # renseigner DATABASE_URL et JWT_SECRET
npm install
npx prisma migrate dev --name init
npm run dev                    # http://localhost:4000/api
```

Générer un secret JWT :

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Sans `SMTP_HOST` configuré, les emails ne sont pas envoyés mais journalisés dans la console :
le développement local reste possible hors ligne.

---

## Principales routes de l'API

| Méthode | Route | Accès |
|---|---|---|
| `GET` | `/api/courses`, `/api/courses/:slug` | Public |
| `GET` | `/api/sessions/upcoming` | Public |
| `GET` | `/api/teachers`, `/api/teachers/:id` | Public |
| `POST` | `/api/enrollments/request` | Public (limité en débit) |
| `POST` | `/api/contact` | Public (limité en débit) |
| `GET` | `/api/certificates/verify/:serial` | Public |
| `POST` | `/api/auth/login` | Public (limité en débit) |
| `GET` | `/api/me/enrollments`, `/api/me/materials` | Stagiaire |
| `GET` | `/api/me/sessions`, `/api/sessions/:id/roster` | Formateur |
| `POST` | `/api/materials` | Formateur |
| `*` | `/api/admin/*` | Administrateur |

Toutes les routes protégées attendent un en-tête `Authorization: Bearer <token>`.

---

## Points d'attention avant mise en production

- Le jeton d'authentification est actuellement stocké dans `localStorage`. À remplacer par un
  cookie `httpOnly` lors du développement des espaces personnels.
- `JWT_SECRET` doit être une valeur aléatoire d'au moins 32 caractères (contrôlé au démarrage).
- Renseigner un vrai fournisseur SMTP, sinon aucun email ne part réellement.
- Remplacer les contenus de démonstration : adresse, téléphone, chiffres clés, témoignages.
- Les textes des mentions légales et de la politique de confidentialité restent à rédiger.
