import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: { compilerOptions: { incremental: false } },
    sourcemap: true,
    clean: true,
    esbuildOptions(options) {
        options.banner = { js: '"use client";' };
    },
    external: [
        'react',
        'react-dom',
        'next',
        'react-aria-components',
        '@radix-ui/*',
        'zustand',
        'lucide-react',
        'motion',
        'tailwind-merge',
    ],
    treeshake: true,
    splitting: false,
    minify: false,
});
