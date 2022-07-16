import { defineConfig } from 'vitest/config';
import alias from './util/alias';

export default defineConfig({
  resolve: {
    alias: {
      ...alias('./tsconfig.json')
    }
  }
});
