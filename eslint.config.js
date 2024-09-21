import pluginJs from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    pluginJs.configs.recommended,
    ...tseslint.configs.strictTypeChecked,
];
