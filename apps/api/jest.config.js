/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/__tests__"],
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^@todo-app/types$": "<rootDir>/../../packages/types/src/index.ts",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts"],
  coverageDirectory: "coverage",
  verbose: true,
};
