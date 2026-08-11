# shared

Code commun au site web (`frontend/`) et à l'application mobile (`mobile/`).

Volontairement **sans dépendance ni build** : ce sont des sources TypeScript que chaque
application compile avec son propre bundler (webpack pour Next.js, Metro pour Expo). Il n'y
a donc pas de `npm install` à faire ici, et aucun `node_modules` à hoister — les
installations existantes de `backend/` et `frontend/` restent intactes.

## Contenu

| Chemin | Rôle |
|---|---|
| `src/i18n/` | Dictionnaires FR/EN et liste des locales — **source de vérité unique** |
| `src/types.ts` | Types alignés sur les réponses de l'API Express |
| `src/api/config.ts` | `configureApi({ apiUrl, storage })` — injection par l'application hôte |
| `src/api/client.ts` | `apiFetch` / `authFetch`, avec rafraîchissement transparent sur 401 |
| `src/api/auth.ts` | Connexion, déconnexion, profil, jetons push |

## Règle d'or

Rien ici ne doit importer de `next/*`, de `react-native`, du DOM ni de
`process.env.NEXT_PUBLIC_*` : ce module est chargé par les deux plateformes. Tout ce qui
dépend de la plateforme passe par `configureApi` (URL d'API, magasin de jetons).

## Consommation

Aucune des deux applications ne référence ce dossier par un paquet npm : elles pointent
dessus par un alias TypeScript (`@shared/*`), et Metro l'ajoute à ses `watchFolders`.
