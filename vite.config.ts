import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          login: path.resolve(__dirname, 'login.html'),
          register: path.resolve(__dirname, 'register.html'),
          dashboard: path.resolve(__dirname, 'dashboard.html'),
          courses: path.resolve(__dirname, 'courses.html'),
          courseDetails: path.resolve(__dirname, 'course-details.html'),
          learn: path.resolve(__dirname, 'learn.html'),
          quiz: path.resolve(__dirname, 'quiz.html'),
          profile: path.resolve(__dirname, 'profile.html'),
          admin: path.resolve(__dirname, 'admin.html'),
          databaseDesign: path.resolve(__dirname, 'database-design.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
