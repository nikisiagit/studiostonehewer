const { fetchJson, resolveMediaUrl } = require('./fetchUtils');

module.exports = async function () {
  const BASE_URL = process.env.PAYLOAD_API_URL || 'http://127.0.0.1:3000';
  const API_URL = `${BASE_URL}/api/projects?limit=100`;

  // Fallbacks use public CDN / local static assets only — never localhost.
  let rawProjects = [
    {
      title: 'Oud-West',
      tag: 'RESIDENTIAL',
      year: '2024',
      description: 'An airy, classic yet playful apartment in Amsterdam.',
      intro_text_1:
        'A young couple were relocating to Amsterdam from the US and found a beautiful apartment in the popular Oud West neighbourhood. Looking to bring a sense of their personality, along with a classic and elevated touch, they brought us in right away.',
      intro_text_2:
        'We used a mix of old, vintage elements and playful fabrics with a variety of textures alongside new, timeless pieces. The apartment now tells a story of both classic elegance and fresh youth.',
      gallery: [
        {
          image: { url: 'https://media.studiostonehewer.co.uk/oud-west-bedroom-pink-1.jpg' },
          size: 'tall',
        },
        { image: { url: '/assets/images/unknown.jpeg' }, size: 'regular' },
        { image: { url: '/assets/images/unknown.jpeg' }, size: 'wide' },
        { image: { url: '/assets/images/unknown.jpeg' }, size: 'regular' },
        { image: { url: '/assets/images/unknown.jpeg' }, size: 'tall' },
      ],
    },
    {
      title: 'Poole Dorset',
      tag: 'COMMERCIAL',
      year: '2024',
      description: 'Bringing warmth and tactility to a workspace.',
      intro_text_1:
        'A local creative agency needed a workspace that felt less like an office and more like a home. They wanted a space that fostered creativity and comfort for their growing team.',
      intro_text_2:
        'By introducing soft textiles, warm wood tones, and residential-style lighting, we transformed the clinical office into a welcoming studio environment.',
      gallery: [
        {
          image: { url: 'https://media.studiostonehewer.co.uk/poole-dorset-apartment.jpeg' },
          size: 'wide',
        },
        { image: { url: '/assets/images/unknown.jpeg' }, size: 'tall' },
      ],
    },
  ];

  const data = await fetchJson(API_URL, 'Payload Projects API');
  if (data && data.docs && data.docs.length > 0) {
    rawProjects = data.docs;
  }

  const getUrl = (url) => resolveMediaUrl(url, BASE_URL);

  const transformedProjects = rawProjects.map((post) => {
    const slug = post.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const galleryItems =
      post.gallery && post.gallery.length > 0
        ? post.gallery.map((item) => ({
            url: getUrl(item.image?.url) || '/assets/images/unknown.jpeg',
            size: item.size,
          }))
        : [];

    const featuredImageUrl =
      galleryItems.length > 0 && galleryItems[0].url
        ? galleryItems[0].url
        : '/assets/images/unknown.jpeg';

    return {
      title: post.title,
      slug: slug,
      tag: post.tag || 'PROJECT',
      category: post.category || '',
      year: post.year || new Date().getFullYear().toString(),
      description: post.description || '',
      introText1: post.intro_text_1 || '',
      introText2: post.intro_text_2 || '',
      featuredImage: featuredImageUrl,
      featured_image: featuredImageUrl,
      gallery: galleryItems,
      meta: post.meta || {},
    };
  });

  return transformedProjects;
};
