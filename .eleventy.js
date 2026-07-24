module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/admin");

  /**
   * Resize remote images via Cloudflare Image Resizing.
   * Local/static assets under /assets are left untouched.
   * Requires Image Resizing enabled on the zone serving the public site.
   * Set DISABLE_CF_IMAGE_RESIZE=1 to bypass (e.g. local preview without CF).
   */
  eleventyConfig.addFilter("resizeImage", function (url, width = 1200, quality = 80) {
    if (!url || typeof url !== "string") return url;
    if (process.env.DISABLE_CF_IMAGE_RESIZE === "1") return url;
    if (url.includes("/cdn-cgi/image/")) return url;

    // Keep local passthrough assets as-is
    if (url.startsWith("/assets/") || url.startsWith("assets/")) return url;
    if (url.startsWith("/images/") || url.startsWith("images/")) return url;
    if (url.startsWith("data:") || url.startsWith("blob:")) return url;

    const w = Number(width) || 1200;
    const q = Number(quality) || 80;
    const options = `width=${w},quality=${q},format=auto,fit=scale-down`;

    // Absolute remote URL → relative cdn-cgi path on the public zone
    if (/^https?:\/\//i.test(url)) {
      return `/cdn-cgi/image/${options}/${url}`;
    }

    // Site-relative remote media (e.g. /api/media/file/...) — leave for absolute base handling
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
