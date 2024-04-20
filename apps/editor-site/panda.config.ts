import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  // Whether to use css reset
  preflight: true,

  presets: ["@pandacss/preset-base", "@park-ui/panda-preset"],

  // Where to look for your css declarations
  include: ["./src/**/*.{js,jsx,ts,tsx}"],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      // customize slot recipes
      slotRecipes: {
        treeView: {
          base: {
            branchControl: {
              userSelect: "none",
              cursor: "pointer",
            },
          },
        },
        menu: {
          base: {
            item: {
              userSelect: "none",
              cursor: "pointer",
            },
          },
          variants: {
            size: {
              sm: {
                item: {
                  height: "32px",
                },
              },
            },
          },
        },
      },
    },
  },

  jsxFramework: "react",

  // The output directory for your css system
  outdir: "styled-system",
});
