const transformIgnorePackages = ['p-pipe', 'p-limit']

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts', '**/*.test.tsx', '**/*.test.js', '**/*.test.jsx'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['bin/*.{js,ts}', 'lib/**/*.{js,ts,jsx,tsx}', 'features/**/*.{js,ts,jsx,tsx}'],
  coveragePathIgnorePatterns: ['/node_modules/'],
  modulePathIgnorePatterns: ['<rootDir>/blogs', 'vercel/output', '/database/.cache'],
  transformIgnorePatterns: [`/node_modules/(?!${transformIgnorePackages.join('|')})`],
  moduleDirectories: ['node_modules', 'src'],
}
