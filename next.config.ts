import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./lib/i18n/request.ts");

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    qualities: [70, 75, 85],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
      {
        protocol: "https",
        hostname: "static-cdn.jtvnw.net",
      },
      {
        protocol: "https",
        hostname: "**.r2.cloudflarestorage.com",
      },
      {
        protocol: "https",
        hostname: "pub-*.pubvip.com",
      },
      {
        protocol: "https",
        hostname: "cdn.pngtubermaker.com",
      },
      {
        protocol: "https",
        hostname:
          "ark-content-generation-v2-cn-beijing.tos-cn-beijing.volces.com",
      },
      {
        protocol: "https",
        hostname: "mule-router-assets.muleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "img.theapi.app",
      },
      // PiAPI output hosts (unstable set — SafeImage degrades to
      // unoptimized <img> for any host missing from this list)
      {
        protocol: "https",
        hostname: "oss.filenest.top",
      },
      {
        protocol: "https",
        hostname: "imagefil.scdn.app",
      },
      {
        protocol: "https",
        hostname: "cdn.legnext.ai",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
