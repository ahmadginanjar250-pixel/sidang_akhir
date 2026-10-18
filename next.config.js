/** @type {import('next').NextConfig} */

// Generate token unik setiap kali server dijalankan (npm run dev / npm start).
// Token ini disematkan ke dalam setiap JWT saat login.
// Ketika server di-restart, token berubah → semua JWT lama otomatis tidak valid.
const runtimeServerToken =
  Math.random().toString(36).substring(2, 18) + Date.now().toString(36);

const nextConfig = {
  images: { unoptimized: true },
  env: {
    RUNTIME_SERVER_TOKEN: runtimeServerToken,
  },
  // Percepat bundling dengan tree-shaking library besar
  experimental: {
    optimizePackageImports: ["recharts", "lucide-react"],
  },
  // Kompres response HTTP (gzip/brotli)
  compress: true,
};

module.exports = nextConfig;
