//@ts-check
let basePath = process.env.GITHUB_REPOSITORY?.split('/')[1]
basePath &&= `/${basePath}`
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    experimental: {
        appDir: true,
    },
    assetPrefix: basePath,
    basePath,
    output: 'export',
}

module.exports = nextConfig
