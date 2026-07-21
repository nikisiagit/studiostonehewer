module.exports = async function() {
  const BASE_URL = process.env.PAYLOAD_API_URL || "http://127.0.0.1:3000";
  const API_URL = `${BASE_URL}/api/projects?limit=100`;

  // Dummy data representing raw Payload fields
  let rawProjects = [
    {
      title: "Oud-West",
      tag: "RESIDENTIAL",
      year: "2024",
      description: "An airy, classic yet playful apartment in Amsterdam.",
      intro_text_1: "A young couple were relocating to Amsterdam from the US and found a beautiful apartment in the popular Oud West neighbourhood. Looking to bring a sense of their personality, along with a classic and elevated touch, they brought us in right away.",
      intro_text_2: "We used a mix of old, vintage elements and playful fabrics with a variety of textures alongside new, timeless pieces. The apartment now tells a story of both classic elegance and fresh youth.",
      gallery: [
        { image: { url: "/assets/images/project-1-1.jpeg" }, size: "tall" },
        { image: { url: "/assets/images/project-1-2.jpeg" }, size: "regular" },
        { image: { url: "/assets/images/project-1-3.jpeg" }, size: "wide" },
        { image: { url: "/assets/images/project-1-4.jpeg" }, size: "regular" },
        { image: { url: "/assets/images/project-1-5.jpeg" }, size: "tall" }
      ]
    },
    {
      title: "Poole Dorset",
      tag: "COMMERCIAL",
      year: "2024",
      description: "Bringing warmth and tactility to a workspace.",
      intro_text_1: "A local creative agency needed a workspace that felt less like an office and more like a home. They wanted a space that fostered creativity and comfort for their growing team.",
      intro_text_2: "By introducing soft textiles, warm wood tones, and residential-style lighting, we transformed the clinical office into a welcoming studio environment.",
      gallery: [
        { image: { url: "/assets/images/project-2-1.jpeg" }, size: "wide" },
        { image: { url: "/assets/images/project-2-2.jpeg" }, size: "tall" }
      ]
    }
  ];

  try {
    const res = await fetch(API_URL);
    if (res.ok) {
      const data = await res.json();
      if (data && data.docs && data.docs.length > 0) {
        rawProjects = data.docs;
      }
    }
  } catch (e) {
    console.log("Could not connect to Payload Projects API. Using dummy data.");
  }

  const getUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
  };

  // Transform raw data into the format Eleventy expects
  const transformedProjects = rawProjects.map((post) => {
    const slug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Fallback if gallery isn't set or is empty
    const galleryItems = post.gallery && post.gallery.length > 0 
      ? post.gallery.map(item => ({
          url: getUrl(item.image?.url) || "/assets/images/unknown.jpeg",
          size: item.size
        }))
      : [];

    const featuredImageUrl = (galleryItems.length > 0 && galleryItems[0].url) 
      ? galleryItems[0].url 
      : "/assets/images/unknown.jpeg";

    return {
      title: post.title,
      slug: slug,
      tag: post.tag || "PROJECT",
      category: post.category || "",
      year: post.year || new Date().getFullYear().toString(),
      description: post.description || "",
      introText1: post.intro_text_1 || "",
      introText2: post.intro_text_2 || "",
      // The first gallery image is used as the cover
      featuredImage: featuredImageUrl,
      featured_image: featuredImageUrl,
      gallery: galleryItems,
      meta: post.meta || {}
    };
  });

  return transformedProjects;
};
