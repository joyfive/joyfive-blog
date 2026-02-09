/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com", // Unsplash 이미지 허용
      },
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com", // 이 부분이 핵심입니다!
      },
      {
        protocol: "https",
        hostname: "s3.us-west-2.amazonaws.com", // 노션 내부 업로드 이미지 허용
      },
      {
        protocol: "https",
        hostname: "www.notion.so", // 노션 기본 이미지 허용
      },
    ],
  },
}

module.exports = nextConfig
