import type { Config } from "jest";

const config: Config = {
  displayName: "lumiere-skin",
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests/unit"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      tsconfig: {
        module: "commonjs",
        esModuleInterop: true,
      },
    }],
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  clearMocks: true,
  collectCoverageFrom: [
    "lib/**/*.ts",
    "app/api/**/*.ts",
    "!**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  verbose: true,
};

export default config;
