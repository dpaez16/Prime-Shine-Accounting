import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";

export default [
  {
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    rules: {
      semi: ["error", "always"],
      quotes: ["error", "single"],
      "object-curly-spacing": ["error", "always"],
      "no-lonely-if": ["error"],
      "no-lone-blocks": ["error"],
      "@typescript-eslint/no-explicit-any": ["error"],
      "react-hooks/exhaustive-deps": "off",
    },
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
];
