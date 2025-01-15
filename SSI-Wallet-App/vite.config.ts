
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig((env) => {
  let alias = {};
  
  if (env.mode == 'development') {
    alias = {
      'ethr-did-resolver': path.resolve('./node_modules/ethr-did-resolver/src/index.ts'),
    };
  }
  return {
    plugins: [react()],
    server: {
      port: 3001,
    },
    resolve: {
      alias,
    },
  };
});