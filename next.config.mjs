import { withContentCollections } from "@content-collections/next";

/** Sent with every response. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  headers: async () => [{ source: "/:path*", headers: securityHeaders }],
};

// Content Collections wraps the config last so it can see everything above.
export default withContentCollections(nextConfig);
