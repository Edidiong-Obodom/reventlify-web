const nextConfig = {
  images: {
    domains: ["images.unsplash.com", "i.pravatar.cc", "illustrations.popsy.co"],
  },
  experimental: {
    appDir: true, // ✅ THIS IS CRITICAL FOR NEXTAUTH TO KNOW YOU'RE USING APP ROUTER
  },
};

module.exports = nextConfig;
