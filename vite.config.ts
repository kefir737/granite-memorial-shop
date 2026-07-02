import {defineConfig} from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import {componentTagger} from "pp-tagger";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => ({
    plugins: [
        react(),
        mode === 'development' &&
        componentTagger(),
    ].filter(Boolean),
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        allowedHosts: true,
        hmr: {
            overlay: false // Disables the error overlay if you only want console errors
        },
        proxy: {
            '/api': 'http://localhost:8000',
            '/save_image.php': 'http://localhost:8000',
        },
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (!id.includes('node_modules')) {
                        if (id.includes('/src/components/admin/')) return 'admin';
                        return;
                    }
                    if (id.includes('@tiptap') || id.includes('prosemirror')) return 'admin-editor';
                    if (id.includes('@radix-ui') || id.includes('recharts')) return 'admin-ui';
                    return 'vendor';
                },
            },
        },
    },
}));
