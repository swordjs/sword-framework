import { defineConfig } from 'vite';
import alias from './util/alias';

export default defineConfig({
  resolve: {
    alias: {
      ...alias('./tsconfig.json'),
      'socket.io-client': 'socket.io-client/dist/socket.io.j'
    }
  }
});
