module.exports = async function() {
  // TODO: Replace with your actual WordPress REST API endpoint for Posts.
  
  // Dummy data representing raw WordPress fields
  // In the free ACF tier workaround, galleries use numbered fields up to 15.
  const rawProject1 = {
    title: { rendered: "Oud-West" },
    slug: "oud-west",
    acf: {
      tag: "RESIDENTIAL",
      year: "2024",
      description: "An airy, classic yet playful apartment in Amsterdam.",
      intro_text_1: "A young couple were relocating to Amsterdam from the US and found a beautiful apartment in the popular Oud West neighbourhood. Looking to bring a sense of their personality, along with a classic and elevated touch, they brought us in right away.",
      intro_text_2: "We used a mix of old, vintage elements and playful fabrics with a variety of textures alongside new, timeless pieces. The apartment now tells a story of both classic elegance and fresh youth.",
      featured_image: "/assets/images/oud-west-living-table.jpg",
      // Numbered gallery fields
      gallery_image_1: "/assets/images/oud-west-living-chair.jpg",
      gallery_size_1: "tall",
      gallery_image_2: "/assets/images/oud-west-living-sofa.jpg",
      gallery_size_2: "regular",
      gallery_image_3: "/assets/images/oud-west-dining.jpg",
      gallery_size_3: "wide",
      gallery_image_4: "/assets/images/oud-west-bedroom-blue.jpg",
      gallery_size_4: "regular",
      gallery_image_5: "/assets/images/oud-west-bedroom-pink.jpg",
      gallery_size_5: "tall"
    }
  };

  const rawProject2 = {
    title: { rendered: "Poole Dorset" },
    slug: "poole-dorset",
    acf: {
      tag: "COMMERCIAL",
      year: "2024",
      description: "Bringing warmth and tactility to a workspace.",
      intro_text_1: "A local creative agency needed a workspace that felt less like an office and more like a home. They wanted a space that fostered creativity and comfort for their growing team.",
      intro_text_2: "By introducing soft textiles, warm wood tones, and residential-style lighting, we transformed the clinical office into a welcoming studio environment.",
      featured_image: "/assets/images/unknown.jpeg",
      // Numbered gallery fields
      gallery_image_1: "/assets/images/unknown.jpeg",
      gallery_size_1: "wide",
      gallery_image_2: "/assets/images/unknown.jpeg",
      gallery_size_2: "tall"
    }
  };

  const rawPosts = [rawProject1, rawProject2];

  // Helper to bundle numbered fields into a gallery array
  const parseGallery = (acf) => {
    const gallery = [];
    for (let i = 1; i <= 15; i++) {
      const img = acf[`gallery_image_${i}`];
      const size = acf[`gallery_size_${i}`];
      if (img) {
        gallery.push({
          image: img,
          size: size || 'regular' // Default to regular if they forget
        });
      }
    }
    return gallery;
  };

  // Map the raw WordPress posts to the exact structure the Eleventy frontend expects
  const projects = rawPosts.map(post => {
    return {
      title: post.title.rendered,
      slug: post.slug,
      url: `/projects/${post.slug}/`,
      tag: post.acf.tag,
      year: post.acf.year,
      description: post.acf.description,
      intro_text_1: post.acf.intro_text_1,
      intro_text_2: post.acf.intro_text_2,
      featured_image: post.acf.featured_image,
      gallery: parseGallery(post.acf)
    };
  });

  return projects;
};
