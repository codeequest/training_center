const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const workspaceRoot = path.resolve(__dirname, '..');
const config = getDefaultConfig(__dirname);

// `shared/` vit hors de mobile/ : Metro doit le surveiller explicitement, sinon les
// modifications des dictionnaires ou du client API ne déclenchent pas de rechargement.
config.watchFolders = [path.resolve(workspaceRoot, 'shared')];

// Pas de `nodeModulesPaths` ni de `disableHierarchicalLookup` ici, contrairement aux
// recettes monorepo habituelles : `shared/` n'a aucune dépendance à résoudre, et couper
// la remontée hiérarchique empêcherait Metro de trouver les paquets imbriqués sous
// `expo/node_modules` (@expo/metro-runtime, entre autres).

module.exports = withNativeWind(config, { input: './global.css' });
