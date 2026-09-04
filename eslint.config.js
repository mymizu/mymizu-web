// Flat config (ESLint 9+). The repo had no ESLint config at all, so `npx eslint`
// pulled a modern version and failed asking for one.
//
// Deliberately scoped to correctness rather than style: this lints an existing
// codebase that has never been linted, so turning on a full style preset would
// bury real problems under thousands of formatting complaints. Start with the
// bug-catching rules; tighten later if the team wants to.

const browserGlobals = {
  window: "readonly",
  document: "readonly",
  navigator: "readonly",
  localStorage: "readonly",
  sessionStorage: "readonly",
  fetch: "readonly",
  console: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  setInterval: "readonly",
  clearInterval: "readonly",
  URL: "readonly",
  URLSearchParams: "readonly",
  Image: "readonly",
  performance: "readonly",
  requestAnimationFrame: "readonly",
  google: "readonly",
  location: "readonly",
  history: "readonly",
  alert: "readonly",
  IntersectionObserver: "readonly",
  PerformanceObserver: "readonly",
};

const nodeGlobals = {
  process: "readonly",
  __dirname: "readonly",
  require: "readonly",
  module: "writable",
  Buffer: "readonly",
  console: "readonly",
};

module.exports = [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "public/**",
      ".yarn/**",
    ],
  },
  {
    files: ["**/*.js", "**/*.jsx"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        // JSX lives in .js files here as well as .jsx — the client build passes
        // --loader:.js=jsx for exactly this reason.
        ecmaFeatures: { jsx: true },
      },
      globals: { ...browserGlobals, ...nodeGlobals },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // Genuine bugs, not preferences.
      "no-undef": "error",
      "no-unreachable": "error",
      "no-dupe-keys": "error",
      "no-dupe-args": "error",
      "no-duplicate-case": "error",
      "no-cond-assign": "error",
      "no-constant-condition": ["error", { checkLoops: false }],
      "no-self-assign": "error",
      "no-self-compare": "error",
      "use-isnan": "error",
      "valid-typeof": "error",
      "no-compare-neg-zero": "error",
      "no-unsafe-negation": "error",
      "no-sparse-arrays": "error",
      "require-atomic-updates": "warn",

      // Unused code is usually a leftover or a typo, but existing code has
      // plenty, so warn rather than fail the build.
      "no-unused-vars": [
        "warn",
        { args: "none", ignoreRestSiblings: true, varsIgnorePattern: "^React$" },
      ],
    },
  },
  {
    // Test files get the Jest globals.
    files: ["**/*.test.js", "**/*.test.jsx", "__tests__/**"],
    languageOptions: {
      globals: {
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        jest: "readonly",
      },
    },
  },
];
