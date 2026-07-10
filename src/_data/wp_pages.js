module.exports = async function() {
  // TODO: Replace with your actual WordPress REST API endpoints for the Home and Portfolio pages.
  // For example: "https://admin.studiostonehewer.com/wp-json/wp/v2/pages?slug=home"
  
  // Simulated raw string from an ACF Text Area (for free tier workaround)
  const rawVirtualExpectations = `A design questionnaire to get to know you
60 minutes of 1:1 virtual time with an interior designer
One moodboard plus one review per room
One 3D elevation plus one review per room
Colour and fabric consulting and guidance for each room
A bespoke shopping list with a minimum of 10 items per room (based on your budget)`;

  const rawFullExpectations = `1:1 consultations — collaborating with you to ensure your new home incorporates all the elements you're looking for
Full service review — working with your architect and construction team on space planning
Interior concept — taking away the guesswork by selecting materials, colours, fabrics and finishes for you
Turnkey installation — delivering the finishing touches, ensuring everything tells a bespoke story`;

  const rawAboutBody = `Amidst the hum of sewing machines, vibrant fabrics, explosions of colour, and warmth of peers, a young Eric discovered his passion for creating. From challenging beginnings, at the age of 14, he found a new home in the world of art — a way to transform the ordinary into the extraordinary.
From those early days, Eric's eye for design was realised, beginning to cultivate bespoke spaces in every place he inhabited, each one a canvas for his boundless imagination. Whether it was a cosy nook or a grand moment, Eric's knack for crafting tailored experiences and unforgettable moments quickly became his signature.
Now, Eric channels that same youthful, classic, and uninhibited enthusiasm into every project. His eye for detail and ability to blend functionality with elegance deliver the unique Studio Stonehewer experience.`;

  // For the guides, we can use a "Title | Description" format on each line
  const rawGuides = `Texture first | Material and tactility before decoration.
Quiet luxury | Considered, lasting, never loud.
Personal moments | Adding visual touches of your personality to every space`;

  // Helper to split text areas by newline and remove empty lines
  const splitText = (text) => {
    if (!text) return [];
    return text.split('\n').map(item => item.trim()).filter(item => item.length > 0);
  };

  // Helper to parse the guides
  const parseGuides = (text) => {
    return splitText(text).map(line => {
      const parts = line.split('|');
      return {
        title: parts[0] ? parts[0].trim() : '',
        description: parts[1] ? parts[1].trim() : ''
      };
    });
  };

  // Dummy data representing what WordPress ACF will return
  return {
    home: {
      hero_left_image: "/assets/images/oud-west-bedroom-pink.jpg",
      hero_left_caption: "Amsterdam ",
      hero_left_url: "/projects/oud-west/",
      hero_right_image: "/assets/images/unknown.jpeg",
      hero_right_caption: "Poole Dorset",
      hero_right_url: "/projects/poole-dorset/",
      quote_text: "I am unapologetically you. I am a visual, textural, and sensory story of your emotions and the world you want to create. I will provide a space for you to build and grow. Here, you will make memories and share stories. You will laugh, learn, and love. I will be a constant through the ordinary and extraordinary. I am your sanctuary. I am your home.",
      quote_author: "'HOME' BY STUDIO STONEHEWER",
      studio_subtitle: "THE STUDIO",
      studio_title: "Interiors with feeling",
      studio_description: "Studio Stonehewer is an interior design practice devoted to spaces that feel as good as they look. We work slowly and intentionally, layering materials, light, personal curiosa, and considered detail to create homes that hold your story.",
      projects_subtitle: "PORTFOLIO",
      projects_title: "Projects",
      projects_description: "Each project begins with a feeling and ends with a home. From full-service residential interiors to flexible, virtual design studies, browse a selection of our recent work.",
      hww_subtitle: "THE STUDIO",
      hww_title: "How we work",
      hww_description: "Studio Stonehewer is a small, intentional practice. We offer two ways to work together: a flexible virtual service and a full, hands-on service, so each home receives the attention and care it deserves.",
      hww_image: "/assets/images/studio-living.png",
      virtual_title: "The Digital Studio",
      virtual_description: "Digital Interior Design offers a flexible and virtual approach to one or multiple spaces. Through design mapping, creation and reviews, we create a custom plan with moodboards, 3D elevations and shopping lists that can be implemented on your own time and budget.",
      // Map the raw text to arrays
      virtual_expectations: splitText(rawVirtualExpectations).map(item => ({ item })),
      full_title: "The Full Service Studio",
      full_description: "An interior design service for larger scale projects including in-person consultations, project management, site visits, furniture procurement and supporting hands-on installation.",
      full_expectations: splitText(rawFullExpectations).map(item => ({ item })),
      cta_title: "Have a space in mind?",
      cta_description: "Whichever service feels right, we'd love to hear about your home and how you want it to feel.",
      about_subtitle: "ABOUT",
      about_title: "Studio Stonehewer",
      about_image: "/assets/images/eric-about.png",
      about_role: "FOUNDER",
      about_name: "Eric Stonehewer",
      about_body: splitText(rawAboutBody).map(paragraph => ({ paragraph })),
      guides: parseGuides(rawGuides),
      final_cta_title: "Let's create your home",
      contact_subtitle: "CONTACT",
      contact_title: "Say hello",
      contact_description: "Whether you're ready to begin or simply exploring ideas, we'd love to hear from you. Tell us a little about your home and what you're hoping to create.",
      contact_email: "studiostonehewer@gmail.com",
      contact_instagram: "@studiostonehewer"
    },
    portfolio: {
      title: "Portfolio - Studio Stonehewer",
      seo_description: "Browse our collection of curated interior design projects.",
      subtitle: "PORTFOLIO",
      header_title: "All Projects",
      header_description: "Each project begins with a feeling and ends with a home. Browse our full selection of recent work."
    }
  };
};
