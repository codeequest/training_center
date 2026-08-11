/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Autorise l'import de `../shared/src` (dictionnaires FR/EN, types, client API),
  // partagé avec l'application mobile et donc situé hors du dossier Next.
  experimental: { externalDir: true },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'images.unsplash.com' }],
  },
};

export default nextConfig;
