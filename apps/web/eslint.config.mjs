import config from '@concourse/config/eslint/next';

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
];
