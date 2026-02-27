import nodeResolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import path from 'path';

// "minify":       "terser ./dist/bundle.js -c drop_console=true,passes=2 -m --toplevel --mangle-props keep_quoted -o ./dist/a.js --source-map \"content='./dist/bundle.js.map'\"",
// "minify:debug": "terser ./dist/bundle.js -c passes=2 -m --toplevel --mangle-props keep_quoted -o ./dist/a.js --source-map \"content='./dist/bundle.js.map',url='a.js.map'\"",
// "debug":   "__DEV__=true npm run build && npm run minify:debug && npm run minify:html",
// "release": "__DEV__=false npm run build && npm run minify && npm run minify:html && npm run zip",

export default () => {
    const cwd = process.cwd();

    return {
        input: path.join(cwd, 'src/main.js'),
        output: [
            {
                file: path.join(cwd, 'dist/bundle.js'),
                format: 'esm',
                sourcemap: true,
            },
            {
                file: path.join(cwd, 'dist/b.js'),
                format: 'esm',
                sourcemap: true,
                plugins: [
                    terser({
                        compress: {
                            drop_console: process.env.__DEV__ !== 'true',
                            passes: 2,
                        },
                        mangle: {
                            properties: {
                                keep_quoted: true,
                            },
                        },
                        toplevel: true,
                    }),
                ],
            },
        ],
        plugins: [
            nodeResolve(),
            replace({
                preventAssignment: true,
                values: {
                    __DEV__: JSON.stringify(process.env.__DEV__ === 'true' || false),
                },
            }),
        ],
    };
};
