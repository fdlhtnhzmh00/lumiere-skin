import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * unoptimized: true
     *
     * MENGAPA INI DIPERLUKAN:
     * Next.js <Image> secara default mengoptimalkan gambar melalui
     * proxy server-nya sendiri (/_next/image?url=...). Ketika Next.js
     * mencoba mengambil gambar dari ImgBB (i.ibb.co) melalui proxy tersebut,
     * ImgBB memblokirnya dengan timeout (hotlink protection server-to-server).
     *
     * Dengan unoptimized: true, Next.js merender <img> biasa sehingga
     * browser mengambil gambar langsung dari i.ibb.co. Browser TIDAK diblokir
     * oleh ImgBB karena ini adalah request langsung dari client-side.
     *
     * Trade-off: Tidak ada automatic WebP conversion atau resizing oleh Next.js.
     * Untuk proyek UTS ini, ini bukan masalah — gambar tetap tampil dengan baik.
     */
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
        pathname: "/**",
      },
      // ImgBB — digunakan untuk gambar produk Pinterest
      {
        protocol: "https",
        hostname: "i.ibb.co",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
