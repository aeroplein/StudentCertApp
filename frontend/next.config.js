/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Environment variables to expose to the client
  env: {
    NEXT_PUBLIC_STACKS_NETWORK: process.env.NEXT_PUBLIC_STACKS_NETWORK,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
    NEXT_PUBLIC_CONTRACT_NAME: process.env.NEXT_PUBLIC_CONTRACT_NAME,
    NEXT_PUBLIC_STACKS_API_URL: process.env.NEXT_PUBLIC_STACKS_API_URL,
  },

  // Webpack configuration for Stacks.js browser compatibility
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle node modules that need to be polyfilled for the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
        assert: require.resolve('assert'),
        util: false,
        os: false,
        path: false,
        fs: false
      };
      
      // Add buffer plugin for browser compatibility
      config.plugins = config.plugins || [];
      config.plugins.push(
        new config.webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );
    }
    
    return config;
  },

  // Image optimization
  images: {
    domains: [
      'explorer.stacks.co',
      'assets.stacksapis.com',
    ],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options', 
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Transpile packages if needed
  transpilePackages: [
    '@stacks/connect',
    '@stacks/transactions',
    '@stacks/network',
    '@stacks/common'
  ],
};

module.exports = nextConfig;

module.exports = nextConfig;env.NEXT_PUBLIC_STACKS_API_URL,
  },

  // Webpack configuration for Stacks.js
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle node modules that need to be polyfilled for the browser
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer'),
        process: require.resolve('process/browser'),
      };
    }
    
    return config;
  },

  // Experimental features
  experimental: {
    // Enable app directory (Next.js 13+)
    appDir: true,
  },

  // Image optimization
  images: {
    domains: [
      'explorer.stacks.co',
      'assets.stacksapis.com',
    ],
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;