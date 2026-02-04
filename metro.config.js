const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Prioriza 'require' sobre 'import' para evitar problemas de interop ESM/CJS
// Adiciona 'browser' para axios usar versão correta
config.resolver.unstable_conditionNames = [
  'react-native',
  'browser',
  'require',
  'default',
];

module.exports = config;
