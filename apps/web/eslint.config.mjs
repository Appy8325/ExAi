import config from '@concourse/config/eslint/next';
import next from '@next/eslint-plugin-next';

export default [
  {
    // Exclude Next.js build outputs (auto-generated type definitions live under
    // .next/types/) and any future compiled artifacts.
    ignores: [
      '.next/**',
      'next-env.d.ts',
      'src/**/*.js',
      'src/**/*.d.ts',
      'src/**/*.js.map',
      'src/**/*.d.ts.map',
    ],
  },
  ...config,
  {
    // Include this config file so Next's build-time detector can see the plugin.
    files: ['**/*.{ts,tsx,js,jsx,mjs}'],
    plugins: { '@next/next': next },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs['core-web-vitals'].rules,
    },
  },
];
