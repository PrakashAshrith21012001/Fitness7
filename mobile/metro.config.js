// Metro, configured for this npm workspace monorepo so the app can import
// the shared @f7/content package straight from source.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("node:path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// Watch the whole workspace so edits to shared/ trigger a reload.
config.watchFolders = [workspaceRoot];

// Resolve from the app first, then the hoisted root node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Keep hierarchical lookup on: packages with their own nested node_modules
// (react-native-reanimated → semver 7) must resolve those before the hoisted
// copies at the root. Metro never walks above the workspace root anyway.

module.exports = config;
