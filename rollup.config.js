import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';

export default {
    input: 'src/index.js',
    output: {
        format: 'iife',
        dir: 'build',
    },
    globals: {
        'pixi.js': 'PIXI',
    },
    external: ['pixi.js'],
    plugins: [json(), resolve({ browser: true }), babel(), commonjs()],
};
