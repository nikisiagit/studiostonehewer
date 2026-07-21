module.exports = function(eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/script.js");
  eleventyConfig.addPassthroughCopy("src/admin");

  eleventyConfig.addFilter("resizeImage", function(url, width = 1200, quality = 80) {
    if (!url) return "";
    if (url.endsWith('.svg')) return url;
    const isProd = process.env.PAYLOAD_API_URL && process.env.PAYLOAD_API_URL.includes("studiostonehewer.co.uk");
    if (isProd) {
      if (url.startsWith("http")) {
        return `/cdn-cgi/image/width=${width},quality=${quality},format=auto/${url}`;
      } else if (url.startsWith("/")) {
        return `/cdn-cgi/image/width=${width},quality=${quality},format=auto${url}`;
      }
    }
    return url;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes"
    }
  };
};
