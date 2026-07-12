module.exports = {
  eleventyComputed: {
    seo_title: data => data.wp_pages.portfolio.meta?.title,
    seo_description: data => data.wp_pages.portfolio.meta?.description || data.wp_pages.portfolio.seoDescription,
    seo_image: data => {
      const img = data.wp_pages.portfolio.meta?.image;
      return img?.url ? img.url : null;
    },
    title: data => data.wp_pages.portfolio.title,
    subtitle: data => data.wp_pages.portfolio.subtitle,
    header_title: data => data.wp_pages.portfolio.headerTitle,
    header_description: data => data.wp_pages.portfolio.headerDescription
  }
};
