import {defineConfig, type Plugin} from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import {componentTagger} from "pp-tagger";

/** Move app bundle to body end; drop crossorigin (breaks module load without ACAO). */
function htmlBuildTweaks(): Plugin {
    return {
        name: 'html-build-tweaks',
        apply: 'build',
        transformIndexHtml(html) {
            let out = html.replace(/ crossorigin/g, '');
            const scriptRe = /<script type="module" src="(\/assets\/[^"]+\.js)"><\/script>\s*/;
            const match = out.match(scriptRe);
            if (match) {
                out = out.replace(scriptRe, '');
                out = out.replace(
                    /<\/div>\s*<script>\s*\n\s*function loadFonts/,
                    `</div>\n<script type="module" src="${match[1]}"></script>\n<script>\n  function loadFonts`,
                );
            }
            return out;
        },
    };
}

// https://vitejs.dev/config/
export default defineConfig(({mode}) => ({
    plugins: [
        react(),
        htmlBuildTweaks(),
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
        modulePreload: false,
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
