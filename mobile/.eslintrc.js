module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: ['eslint:recommended', 'plugin:react/recommended', 'plugin:react-hooks/recommended', 'plugin:react-native/all'],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  plugins: ['react', 'react-native'],
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react-native/no-inline-styles': 'off'
  }
};
