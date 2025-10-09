import eslint from "@eslint/js";
import tseslint from "typescript-eslint";


export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ["node_modules/**", "dist/**", "build/**", "coverage/**", ".git/**"],
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
            // Custom TypeScript-specific rules
            "@typescript-eslint/explicit-function-return-type": "off",
            "arrow-spacing": ["warn", { before: true, after: true }],
            "comma-spacing": "error",
            "comma-style": "error",
            curly: ["error", "multi-line", "consistent"],
            "dot-location": ["error", "property"],
            "handle-callback-err": "off",
            indent: ["error", 4, { SwitchCase: 1 }],
            "keyword-spacing": "error",
            "max-nested-callbacks": ["error", { max: 4 }],
            "max-statements-per-line": ["error", { max: 2 }],
            "no-console": "off",
            "no-empty-function": "error",
            "no-floating-decimal": "error",
            "no-inline-comments": "error",
            "no-lonely-if": "error",
            "no-multi-spaces": "error",
            "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1, maxBOF: 0 }],
            "no-shadow": ["error", { allow: ["err", "resolve", "reject"] }],
            // 'no-trailing-spaces': ['error'],
            "no-var": "error",
            "no-undef": "off",
            "object-curly-spacing": ["error", "always"],
            "prefer-const": "error",
            quotes: ["error", "double", { avoidEscape: true }],
            semi: ["error", "always"],
            "space-before-blocks": "error",
            "space-before-function-paren": [
                "error",
                {
                    anonymous: "never",
                    named: "never",
                    asyncArrow: "always",
                },
            ],
            "space-in-parens": "error",
            "space-infix-ops": "error",
            "space-unary-ops": "error",
            "spaced-comment": "error",
            "brace-style": ["error", "1tbs", { allowSingleLine: true }],
            yoda: "error",
        },
    },
    {
        // Apply these settings to JavaScript files
        files: ["**/*.js", "**/*.jsx"],
    },
);