module.exports = {
  eleventyComputed: {
    title: data => data.wp_pages.portfolio.title,
    seo_description: data => data.wp_pages.portfolio.seo_description,
    subtitle: data => data.wp_pages.portfolio.subtitle,
    header_title: data => data.wp_pages.portfolio.header_title,
    header_description: data => data.wp_pages.portfolio.header_description
  }
};
