import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
    preset: "ts-jest/presets/default-esm", // ESM-aware preset
    testEnvironment: "node",
    rootDir: "./dist", // Point directly to dist folder
    /*transform: {
        "^.+\\.ts$": [
            "ts-jest",
            {
                useESM: true, // tells ts-jest to compile as ESM
                tsconfig: "tsconfig.json",
            },
        ],
    }, */

    extensionsToTreatAsEsm: [".ts", ".js"],

    // Important for NodeNext module resolution
    moduleNameMapper: {
        "^(\\.{1,2}/.*)\\.js$": "$1",
    },

    clearMocks: true,
    verbose: true,
    testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],

    // Force Jest to exit after tests complete
    forceExit: true,

    // Global teardown to clean up resources
    globalTeardown: "<rootDir>/../jest.teardown.js",
};

export default config;
