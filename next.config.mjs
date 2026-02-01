/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ugbcqdrslppxgfqollvu.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'api.builder.io',
        port: '',
        pathname: '/api/v1/image/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "", // optional, defaults to empty
        pathname: "/**", // allows any path like /seed/..., /id/..., etc.
        // search: "", // omit to allow *any* query params (recommended)
      },
    ],
  },
};

export default nextConfig;
