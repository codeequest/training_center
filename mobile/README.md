# Application mobile

Application Expo (React Native + TypeScript) adossée à la **même API Express** que le site.
Le code commun — dictionnaires FR/EN, types, client API — vit dans `../shared`.

## Démarrage

```bash
cd mobile
npm install
npx expo start
```

Puis scanner le QR code avec Expo Go, ou `a` / `i` pour un émulateur.

### Pointer la bonne API

Sur un téléphone réel, `localhost` désigne **le téléphone**, pas le poste de
développement. Il faut donc l'adresse IP de la machine qui fait tourner Express :

```bash
# valeur par défaut dans app.json → extra.apiUrl
EXPO_PUBLIC_API_URL="http://192.168.1.13:4000/api" npx expo start
```

Et côté backend, autoriser cette origine dans `.env` :

```
CORS_ORIGIN="http://localhost:3000,http://192.168.1.13:8081"
```

## Notifications push

Le push exige un `projectId` EAS depuis le SDK 57 :

```bash
npx eas init      # écrit extra.eas.projectId dans app.json
```

Sans cela, l'application fonctionne normalement mais `registerForPush()` se contente
d'un avertissement en console. À noter : le push n'est **pas** disponible dans Expo Go sur
Android — il faut un development build (`npx expo run:android` ou EAS Build).

## Structure

| Chemin | Rôle |
|---|---|
| `app/` | Routes Expo Router (`index` aiguille, `login`, `home`) |
| `src/lib/storage.ts` | Magasin de jetons chiffré (Keychain / Keystore) |
| `src/lib/api.ts` | Injecte l'URL d'API et le magasin dans le client partagé |
| `src/lib/session.tsx` | Contexte de session : restauration, connexion, déconnexion |
| `src/lib/push.ts` | Permission, jeton Expo, enregistrement auprès de l'API |

## Vérifications

```bash
npm run typecheck                                  # types
npx expo export --platform android --output-dir dist   # le bundle compile-t-il ?
```
