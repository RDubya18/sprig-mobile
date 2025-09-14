// .eslintrc.cjs
module.exports = {
  root: true,
  extends: [
    "universe/native",          // Expo/React Native rules
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  parserOptions: {
    ecmaFeatures: { jsx: true },
    project: undefined
  },
  rules: {
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
    "@typescript-eslint/ban-ts-comment": "off",
    "react-hooks/exhaustive-deps": "warn",
    "no-console": ["warn", { allow: ["warn", "error"] }]
  },
  settings: {
    react: { version: "detect" }
  },
  ignorePatterns: [
    "node_modules/",
    "android/",
    "ios/",
    "dist/",
    "build/",
    ".expo/",
    "babel.config.js"
  ]
};
