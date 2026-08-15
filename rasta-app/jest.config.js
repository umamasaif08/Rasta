/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],
  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/**/*.tsx",
    "src/**/*.ts",
    "!src/**/*.d.ts",
    "!src/app/**/*.tsx",
    "!src/app/**/*.ts",
    "!src/lib/firebase.ts",
  ],
  coverageReporters: ["text", "html"],
};
