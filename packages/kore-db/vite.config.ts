import { resolve } from 'path';
import { defineConfig } from "vite";
// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: resolve(__dirname, 'src/index.ts'),
      name: '@edit-all/kore-db',
      // the proper extensions will be added
      fileName: 'index',
    },
    rollupOptions: {
      external: [],
      output: {
        globals: {

        },
      },
    },
  },
});
