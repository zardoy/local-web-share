import { main } from '@zardoy/electron-esbuild'

const version = process.env.npm_package_version
console.log(version)

await main({
    mode: 'production',
    outdir: 'build',
    esbuildOptions: {
        define: {
            'process.env.NODE_ENV': '"production"',
            'process.env.VERSION': `"${version}"`,
        },
    },
})
// TODO download server file!
