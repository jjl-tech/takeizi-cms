import react from '@vitejs/plugin-react';
import path from "path";
import { defineConfig } from 'vite';


// https://vitejs.dev/config/
export default defineConfig({
  build: {
    outDir: './build'
  },
  optimizeDeps: { include: ['react/jsx-runtime'] },
  plugins: [
    react({
      jsxImportSource: "@emotion/react",
      babel: {
        plugins: ["@emotion/babel-plugin"],
      },
    }),
    // ViteFonts({
    //   google: {
    //     families: ['Rubik', 'Roboto', 'Helvetica']
    //   },
    // })
],
  resolve: {
    alias: {
      '@camberi/firecms': path.resolve(__dirname, '../src')
    },
  },
})
