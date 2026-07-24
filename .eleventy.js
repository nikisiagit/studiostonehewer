module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/admin");

  /**
   * Resize remote images via the public Worker's /_img/ path (cf.image).
   * Local/static assets under /assets are left untouched.
   * Set DISABLE_CF_IMAGE_RESIZE=1 to bypass (local preview without CF).
   */
  eleventyConfig.addFilter("resizeImage", function (url, width = 1200, quality = 80) {
    if (!url || typeof url !== "string") return url;
    if (process.env.DISABLE_CF_IMAGE_RESIZE === "1") return url;
    if (url.includes("/_img/") || url.includes("/cdn-cgi/image/")) return url;

    if (url.startsWith("/assets/") || url.startsWith("assets/")) return url;
    if (url.startsWith("/images/") || url.startsWith("images/")) return url;
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;

    const w = Number(width) || 1200;
    const q = Number(quality) || 80;
    const options = `width=${w},quality=${q},format=auto,fit=scale-down`;

    if (/^https?:\/\//i.test(url)) {
      try {
        const host = new URL(url).hostname.toLowerCase();
        // Never send loopback hosts through the image worker (or into HTML)
        if (host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]") {
          const pathOnly = new URL(url).pathname;
          return pathOnly || url;
        }
      } catch {
        /* fall through */
      }
      // Served by worker.js handleImageTransform → cf.image
      return `/_img/${options}/${url}`;
    }

    return url;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
    },
  };
};
