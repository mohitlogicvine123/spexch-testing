import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5174,       // Port jo aap use kar rahe ho
    open: true,       // Browser kholne ke liye
  },
  esbuild: {
    jsx: 'transform',
  },
  plugins: [react()],
});
