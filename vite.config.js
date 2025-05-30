import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteReactNative from 'vite-plugin-react-native';

export default defineConfig({
  plugins: [
    react(),
    viteReactNative({
      // add plugin options here if needed
    }),
  ],
  resolve: {
    alias: {
      'react-native$': 'react-native-web',
    },
  },
  optimizeDeps: {
    include: [
      'react-native-web',
      'react-native-gesture-handler',
      'react-native-reanimated',
      'expo-router',
      'expo',
    ],
    exclude: ['react-native'],
  },
  build: {
    rollupOptions: {
      external: ['**/*.js.flow'],
    },
  },
});
