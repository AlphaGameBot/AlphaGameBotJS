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
    verbose: false, // Reduce verbosity to minimize output
    silent: true, // Suppress all console output including from Winston
    noStackTrace: false, // Show stack traces on failures
    testMatch: ["**/__tests__/**/*.test.js", "**/?(*.)+(spec|test).js"],

    // Reporters - use default but silence console buffer
    reporters: [
        ["default", { summaryThreshold: 0 }]
    ],

    // Force Jest to exit after tests complete
    forceExit: true,

    // Global setup to suppress console output
    setupFilesAfterEnv: ["<rootDir>/../jest.setup.js"],

    // Global teardown to clean up resources
    globalTeardown: "<rootDir>/../jest.teardown.js",
};

export default config;
