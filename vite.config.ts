import { defineConfig } from 'vite';
import alias from './util/alias';

export default defineConfig({
  resolve: {
    alias: alias('./tsconfig.json')
  }
});
