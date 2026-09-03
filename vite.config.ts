import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// Change base to '/your-repository-name/' if you prefer an explicit Pages path.
export default defineConfig({plugins:[react()],base:'./'});
