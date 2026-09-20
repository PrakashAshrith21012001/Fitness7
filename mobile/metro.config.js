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

// Never walk up past the workspace root looking for modules.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;
