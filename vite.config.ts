import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// لازم تضيف base بنفس اسم الريبو على GitHub
export default defineConfig({
  base: '/BitCarve--report/',
  plugins: [react()],
});
