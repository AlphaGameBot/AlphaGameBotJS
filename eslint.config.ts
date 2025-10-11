// This file is a part of AlphaGameBot.
// 
//     AlphaGameBot - A Discord bot that's free and (hopefully) doesn't suck.
//     Copyright (C) 2025  Damien Boisvert (AlphaGameDeveloper)
// 
//     AlphaGameBot is free software: you can redistribute it and/or modify
//     it under the terms of the GNU General Public License as published by
//     the Free Software Foundation, either version 3 of the License, or
//     (at your option) any later version.
// 
//     AlphaGameBot is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU General Public License for more details.
// 
//     You should have received a copy of the GNU General Public License
//     along with AlphaGameBot.  If not, see <https://www.gnu.org/licenses/>.

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
            "no-console": "error",
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
            // quotes: ["error", "double", { avoidEscape: true }],
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