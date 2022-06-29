const { defineConfig } = require('cypress');

module.exports = defineConfig({
  includeShadowDom: true,
  e2e: {
    specPattern: 'test/integration/*.{js,jsx,ts,tsx}',
  },
});
